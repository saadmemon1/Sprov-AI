# main_api.py
import os
import io
import librosa
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import medfilt
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import google.generativeai as genai
import base64
import asyncio
from typing import Optional

load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please check your .env file.")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('models/gemini-2.0-flash')

app = FastAPI(
    title="Sprov AI Audio Analysis API",
    description="API for analyzing audio files and generating detailed reports",
    version="1.0.0"
)

# Allow CORS for your frontend domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB limit
SUPPORTED_FORMATS = ['.mp3', '.wav', '.m4a', '.flac']

@app.get("/")
async def root():
    return {
        "message": "Sprov AI Audio Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze_audio": "/analyze-audio/ (POST)",
            "health": "/health (GET)",
            "healthz": "/healthz (GET)",
            "docs": "/docs (GET)"
        },
        "usage": "Upload an audio file to /analyze-audio/ to get analysis results",
        "limits": {
            "max_file_size": "50MB",
            "supported_formats": SUPPORTED_FORMATS
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.get("/healthz")
async def health_check_alt():
    return {"status": "healthy", "message": "API is running"}

def validate_file(file: UploadFile) -> None:
    """Validate uploaded file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in SUPPORTED_FORMATS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format. Supported formats: {SUPPORTED_FORMATS}"
        )

async def analyze_audio_async(file_path: str, transcript: Optional[str] = None):
    """Async wrapper for audio analysis"""
    try:
        # Load audio with timeout
        audio, sr = librosa.load(file_path, sr=None)
        
        # Basic audio processing
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        smoothed_pitches = []
        
        for t in range(pitches.shape[1]):
            pitch = pitches[:, t][magnitudes[:, t].argmax()]
            if pitch > 50:
                smoothed_pitches.append(pitch)
            else:
                smoothed_pitches.append(0)
        
        smoothed_pitches = medfilt(smoothed_pitches, kernel_size=5)
        pitch_variation = np.std([p for p in smoothed_pitches if p > 0])
        rms = librosa.feature.rms(y=audio)[0]
        intensity_variation = np.std(rms)
        speech_type = 'Monotonous' if pitch_variation < 20 and intensity_variation < 5 else 'Dynamic'
        averaged_pitches = [np.mean([p for p in smoothed_pitches[i:i+100] if p > 0]) for i in range(0, len(smoothed_pitches), 100)]

        # Generate plot
        plt.figure(figsize=(10, 4))
        plt.plot(smoothed_pitches, label='Smoothed Pitch Contour')
        plt.xlabel('Frame')
        plt.ylabel('Pitch (Hz)')
        plt.title('Smoothed Pitch Contour')
        plt.legend()
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=72)  # Lower DPI for smaller file
        plt.close()
        buf.seek(0)
        pitch_img_b64 = base64.b64encode(buf.read()).decode('utf-8')

        # Get transcript if not provided
        if not transcript:
            try:
                audio_file = genai.upload_file(path=file_path)
                response = model.generate_content(["Please transcribe this recording:", audio_file])
                transcript = response.text
            except Exception as e:
                transcript = f"Transcription failed: {str(e)}"

        # Stuttering detection
        words = transcript.split()
        stuttering_detected = any(words[i] == words[i+1] for i in range(len(words)-1))

        return {
            'Pitch Variation': float(pitch_variation),
            'Intensity Variation': float(intensity_variation),
            'Speech Style': speech_type,
            'Stuttering Detected': stuttering_detected,
            'Average Pitches': [float(x) for x in averaged_pitches],
            'Transcript': transcript,
            'PitchContourImage': pitch_img_b64
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")

@app.post("/analyze-audio/")
async def analyze_audio_endpoint(file: UploadFile = File(...)):
    # Validate file
    validate_file(file)
    
    # Check file size
    file_size = 0
    temp_path = f"temp_{file.filename}"
    
    try:
        # Read file in chunks to check size
        with open(temp_path, "wb") as f:
            while True:
                chunk = await file.read(8192)  # 8KB chunks
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413, 
                        detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
                    )
                f.write(chunk)
        
        # Analyze audio with timeout
        try:
            results = await asyncio.wait_for(
                analyze_audio_async(temp_path), 
                timeout=60.0  # 60 second timeout
            )
        except asyncio.TimeoutError:
            raise HTTPException(status_code=408, detail="Analysis timed out. Please try with a shorter audio file.")
        
        # Generate report with timeout
        try:
            report_prompt = [
                "You are a helpful and informative AI assistant.",
                "Construct a detailed report for the current results and the steps for improvements in each sector of the current report.",
                "Instead of giving individual values for the parameters, give them a score (from 0 to +5 for higher than average and from 0 to -5 for less than average) and then give a chart containing all the parameters and their score depending on the level of fluctuation.",
                "The report must contain at least some comments about each individual parameter present in the current result and display the transcript as it is.",
                "Current Results:",
                str(results),
                "Current Transcript:",
                results['Transcript']
            ]
            report_response = await asyncio.wait_for(
                asyncio.to_thread(model.generate_content, report_prompt),
                timeout=30.0  # 30 second timeout for report generation
            )
            results['Report'] = report_response.text
        except asyncio.TimeoutError:
            results['Report'] = "Report generation timed out. Basic analysis completed."
        except Exception as e:
            results['Report'] = f"Report generation failed: {str(e)}"
        
        return JSONResponse(content=results)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)