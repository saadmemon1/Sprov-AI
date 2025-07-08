# Sprov AI - Speech Analysis & Coaching Platform

Sprov AI is an innovative speech coaching application designed to elevate soft skills through AI-powered analysis and feedback. The platform utilizes **Google's Gemini 2.0 Flash** model to create comprehensive and personalized speech analysis reports, providing users with actionable insights to improve their communication abilities.

## 🚀 Features

### Audio Analysis Capabilities
- **Pitch Variation Analysis**: Measures speech pitch fluctuations and identifies patterns
- **Intensity Variation Detection**: Analyzes volume control and speaking consistency
- **Speech Style Classification**: Determines if speech is "Dynamic" or "Monotonous"
- **Stuttering Detection**: Identifies repetitive speech patterns
- **Real-time Audio Processing**: Instant analysis with visual pitch contour plots
- **Comprehensive Reporting**: Detailed scores and improvement recommendations

### AI-Powered Insights
- **Parameter Scoring**: Each speech characteristic is scored on a -5 to +5 scale
- **Personalized Recommendations**: Tailored improvement suggestions based on analysis
- **Transcript Generation**: Automatic speech-to-text conversion
- **Visual Analytics**: Interactive pitch contour graphs and charts

## 🤖 Technology Stack

### AI Model
- **Primary Model**: Google Gemini 2.0 Flash
- **Purpose**: Audio transcription and intelligent report generation
- **Capabilities**: 
  - Natural language processing for transcript generation
  - Contextual analysis of speech patterns
  - Personalized feedback and recommendations

### Core Technologies
- **Python**: Audio processing and analysis
- **Librosa**: Audio signal processing and pitch detection
- **NumPy & SciPy**: Mathematical computations and signal filtering
- **Matplotlib**: Data visualization and plotting
- **IPython Widgets**: Interactive file upload interface

### Audio Processing Libraries
- **Librosa**: Advanced audio analysis and feature extraction
- **Pydub**: Audio file manipulation and format conversion
- **SciPy Signal**: Signal processing and filtering algorithms

## 📊 Analysis Parameters

The system analyzes the following speech characteristics:

| Parameter | Description | Scoring Scale |
|-----------|-------------|---------------|
| **Pitch Variation** | Measures how much the speaker's pitch changes throughout speech | -5 to +5 |
| **Intensity Variation** | Analyzes volume consistency and control | -5 to +5 |
| **Speech Style** | Classifies speech as "Dynamic" or "Monotonous" | -5 to +5 |
| **Stuttering Detection** | Identifies repetitive speech patterns | -5 to +5 |

### Scoring System
- **+5 to +3**: Excellent performance
- **+2 to 0**: Good to average performance  
- **-1 to -3**: Areas for improvement
- **-4 to -5**: Significant improvement needed

## 🎯 Use Cases

### Professional Development
- **Public Speaking**: Improve presentation skills and audience engagement
- **Sales & Marketing**: Enhance persuasive communication techniques
- **Leadership**: Develop clear and impactful communication style
- **Customer Service**: Improve verbal interaction quality

### Educational Applications
- **Student Presentations**: Help students develop better speaking skills
- **Language Learning**: Assist in pronunciation and fluency improvement
- **Speech Therapy**: Support speech development and correction
- **Academic Research**: Analyze speech patterns for research purposes

## 🛠️ Installation & Setup

### Prerequisites
- Python 3+
- Google Cloud API key with Gemini access

### Environment Setup
1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with your API key:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

### Running the Application
1. Start Jupyter Notebook or Jupyter Lab
2. Open `main.ipynb`
3. Execute the cell
4. Use the file upload widget to analyze audio files

## 📁 Supported Audio Formats
- **MP3**: Most common format, good compression
- **M4A**: Apple's audio format, high quality
- **WAV**: Uncompressed audio, best for analysis

## 🔧 Configuration

### API Configuration
The application uses Google's Generative AI API with the following configuration:
- **Model**: `gemini-2.0-flash`
- **System Instruction**: Custom prompt for audio analysis context
- **File Upload**: Supports audio file uploads for transcription

### Analysis Settings
- **Pitch Detection**: Minimum threshold of 50Hz
- **Smoothing**: 5-point median filter for pitch contour
- **Averaging**: 100-frame windows for pitch averaging

## 📈 Sample Analysis Report

The system generates comprehensive reports including:

### Parameter Analysis
- Individual scores for each speech characteristic
- Comparative analysis against optimal ranges
- Trend identification and pattern recognition

### Improvement Recommendations
- Specific exercises and techniques
- Practice suggestions based on identified weaknesses
- Progress tracking recommendations

### Visual Analytics
- Pitch contour plots over time
- Averaged pitch analysis graphs
- Interactive data visualization

## 🔮 Future Enhancements

### Planned Features
- **Real-time Analysis**: Live speech analysis during presentations
- **Multi-language Support**: Analysis in multiple languages
- **Advanced Metrics**: Speaking rate, pause analysis, emphasis detection
- **Mobile Application**: iOS and Android apps for on-the-go analysis
- **Web Dashboard**: Browser-based interface for easier access
- **Progress Tracking**: Historical analysis and improvement tracking

### Technical Improvements
- **Cloud Deployment**: Scalable cloud-based processing
- **Machine Learning**: Enhanced pattern recognition and prediction
- **Real-time Processing**: WebSocket-based live analysis

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🤝 Contributing

We welcome contributions to improve Sprov AI! Please feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 👨‍💻 Authors

- **Saad Inam** - Creator and maintainer of Sprov AI
- **Hassan Jabbar** ([@Ha55anAJ](https://github.com/Ha55anAJ)) - Co-creator and contributor to Sprov AI

## 🙏 Acknowledgments

- Google Generative AI team for the Gemini 2.0 Flash model
- The open-source community for audio processing libraries

---

**Note**: This application requires a valid Google API key with access to the Gemini 2.0 Flash model. Please ensure you have the necessary permissions and quota allocation for production use.
