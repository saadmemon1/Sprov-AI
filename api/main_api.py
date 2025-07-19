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
from scipy.io import wavfile

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
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    try:
        # Step 2: librosa.load + pitch extraction
        audio, sr = librosa.load(temp_path, sr=None)
        duration = len(audio) / sr
        
        # Extract pitch
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        smoothed_pitches = []
        
        for t in range(pitches.shape[1]):
            pitch = pitches[:, t][magnitudes[:, t].argmax()]
            if pitch > 50:  # Filter out low frequencies
                smoothed_pitches.append(pitch)
            else:
                smoothed_pitches.append(0)
        
        # Step 4: Full Analysis Features
        # Basic pitch statistics
        valid_pitches = [p for p in smoothed_pitches if p > 0]
        pitch_variation = np.std(valid_pitches) if valid_pitches else 0
        avg_pitch = np.mean(valid_pitches) if valid_pitches else 0
        
        # Intensity analysis (RMS energy)
        rms = librosa.feature.rms(y=audio)[0]
        intensity_variation = np.std(rms)
        avg_intensity = np.mean(rms)
        
        # Speech style classification
        speech_type = 'Monotonous' if pitch_variation < 20 and intensity_variation < 5 else 'Dynamic'
        
        # Stuttering detection (simple word repetition check)
        stuttering_detected = False  # Will be updated with transcript analysis
        
        # Step 3: Gemini Transcription and Analysis
        try:
            # Read audio file as bytes
            with open(temp_path, 'rb') as audio_file:
                audio_bytes = audio_file.read()
            
            # Create audio part for Gemini
            audio_part = {
                "mime_type": "audio/wav",
                "data": audio_bytes
            }
            
            # Get transcription
            transcript_response = model.generate_content([
                "Please transcribe this audio recording accurately. Return only the transcription text:",
                audio_part
            ])
            transcript = transcript_response.text.strip()
            
            # Get AI analysis and feedback
            analysis_prompt = f"""
            Analyze this speech recording and provide detailed feedback:
            
            TRANSCRIPT: {transcript}
            PITCH ANALYSIS: Average pitch: {avg_pitch:.1f} Hz, Variation: {pitch_variation:.2f}
            DURATION: {duration:.2f} seconds
            
            Please provide:
            1. Speech clarity assessment
            2. Pitch and tone feedback
            3. Speaking pace analysis
            4. Overall communication effectiveness
            5. Specific improvement suggestions
            
            Format as a clear, structured report.
            """
            
            analysis_response = model.generate_content(analysis_prompt)
            ai_report = analysis_response.text.strip()
            
        except Exception as e:
            transcript = f"Transcription failed: {str(e)}"
            ai_report = f"AI analysis failed: {str(e)}"
        
        # Update stuttering detection with transcript
        if transcript and "Transcription failed" not in transcript:
            words = transcript.split()
            stuttering_detected = any(words[i] == words[i+1] for i in range(len(words)-1))
        
        return {
            "sample_rate": sr,
            "duration_seconds": duration,
            "pitch_analysis": {
                "average_pitch_hz": float(avg_pitch),
                "pitch_variation": float(pitch_variation),
                "total_frames": len(smoothed_pitches),
                "valid_pitch_frames": len(valid_pitches)
            },
            "intensity_analysis": {
                "average_intensity": float(avg_intensity),
                "intensity_variation": float(intensity_variation)
            },
            "speech_style": speech_type,
            "stuttering_detected": stuttering_detected,
            "transcript": transcript,
            "ai_report": ai_report,
            "message": "Step 4: Full analysis completed - pitch, intensity, speech style, stuttering detection, and Gemini integration."
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/test-audio/")
async def test_audio_endpoint(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    size = os.path.getsize(temp_path)
    os.remove(temp_path)
    return {"status": "ok", "file_size": size}