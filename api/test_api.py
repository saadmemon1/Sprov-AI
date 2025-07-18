import requests
import os

def test_audio_analysis():
    # API endpoint
    url = "http://localhost:8000/analyze-audio/"
    
    # Check if you have any audio files in the current directory
    audio_files = [f for f in os.listdir('.') if f.endswith(('.mp3', '.wav', '.m4a', '.flac'))]
    
    if not audio_files:
        print("No audio files found in current directory.")
        print("Please add an audio file (mp3, wav, m4a, flac) to test the API.")
        return
    
    # Use the first audio file found
    audio_file = audio_files[0]
    print(f"Testing with audio file: {audio_file}")
    
    # Prepare the file for upload
    with open(audio_file, 'rb') as f:
        files = {'file': (audio_file, f, 'audio/mpeg')}
        
        try:
            print("Uploading file...")
            response = requests.post(url, files=files)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ API call successful!")
                print(f"Transcript: {result.get('Transcript', 'N/A')}")
                print(f"Speech Style: {result.get('Speech Style', 'N/A')}")
                print(f"Stuttering Detected: {result.get('Stuttering Detected', 'N/A')}")
                print(f"Pitch Variation: {result.get('Pitch Variation', 'N/A')}")
                print(f"Intensity Variation: {result.get('Intensity Variation', 'N/A')}")
                print(f"Report length: {len(result.get('Report', ''))} characters")
                print(f"Pitch contour image: {'Generated' if result.get('PitchContourImage') else 'Not generated'}")
            else:
                print(f"❌ API call failed with status code: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_audio_analysis() 