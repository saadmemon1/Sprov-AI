# main_api.py
import os
import io
import librosa
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import medfilt
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import google.generativeai as genai
import base64

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
    allow_origins=["*"],  # In production, replace with your actual frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Sprov AI Audio Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze_audio": "/analyze-audio/ (POST)",
            "health": "/health (GET)",
            "docs": "/docs (GET)"
        },
        "usage": "Upload an audio file to /analyze-audio/ to get analysis results"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

@app.get("/healthz")
async def health_check_alt():
    return {"status": "healthy", "message": "API is running"}

def analyze_audio(file_path, transcript=None):
    audio, sr = librosa.load(file_path, sr=None)
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

    # Plot and encode pitch contour
    plt.figure(figsize=(10, 4))
    plt.plot(smoothed_pitches, label='Smoothed Pitch Contour')
    plt.xlabel('Frame')
    plt.ylabel('Pitch (Hz)')
    plt.title('Smoothed Pitch Contour')
    plt.legend()
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    pitch_img_b64 = base64.b64encode(buf.read()).decode('utf-8')

    # Transcript (if not provided, use Gemini)
    if not transcript:
        audio_file = genai.upload_file(path=file_path)
        response = model.generate_content(["Please transcribe this recording:", audio_file])
        transcript = response.text

    # Stuttering detection
    words = transcript.split()
    stuttering_detected = any(words[i] == words[i+1] for i in range(len(words)-1))

    results = {
        'Pitch Variation': float(pitch_variation),
        'Intensity Variation': float(intensity_variation),
        'Speech Style': speech_type,
        'Stuttering Detected': stuttering_detected,
        'Average Pitches': [float(x) for x in averaged_pitches],
        'Transcript': transcript,
        'PitchContourImage': pitch_img_b64
    }
    return results

@app.post("/analyze-audio/")
async def analyze_audio_endpoint(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())
    try:
        results = analyze_audio(temp_path)
        # Generate report using Gemini
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
        report_response = model.generate_content(report_prompt)
        results['Report'] = report_response.text
        return JSONResponse(content=results)
    finally:
        os.remove(temp_path)