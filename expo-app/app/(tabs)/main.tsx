import { useState } from "react";
import { Image, Text, TouchableOpacity, View, Platform, Alert, ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { setLastAnalysisResult } from './analysisResultStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Markdown from "react-native-markdown-display";
import * as DocumentPicker from 'expo-document-picker';
import { green } from "react-native-reanimated/lib/typescript/Colors";
// import { DragDropContentView } from 'expo-drag-drop-content-view'; // Ensure this is installed and imported correctly

// Only import DragDropContentView on web
const DragDropContentView = Platform.OS === 'web' 
    ? require('expo-drag-drop-content-view').DragDropContentView 
    : null;

interface AnalysisResults {
    sample_rate: number;
    duration_seconds: number;
    pitch_analysis: {
        average_pitch_hz: number;
        pitch_variation: number;
        total_frames: number;
        valid_pitch_frames: number;
    };
    intensity_analysis: {
        average_intensity: number;
        intensity_variation: number;
    };
    speech_style: string;
    stuttering_detected: boolean;
    pitch_contour_image?: string;
    transcript?: string;
    ai_report?: string;
    message?: string;
}
export default function Main() {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState<string>('');

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
                multiple: false,
            });
            if (result.canceled === false) {
                console.log('File selected:', result);
                setSelectedFiles([result.assets[0]]);
            } else {
                console.log('File selection was cancelled');
            }
        } catch (error) {
            console.error('Error picking file:', error);
        }
    };

    const handleDrop = (event: any) => {
        console.log('Files dropped:', event.assets);
        setIsDragOver(false);
        
        // Filter for audio files only
        const audioFiles = event.assets.filter((asset: any) => 
            asset.type && asset.type.startsWith('audio/')
        );
        
        if (audioFiles.length > 0) {
            setSelectedFiles(audioFiles);
            Alert.alert('Success', `${audioFiles.length} audio file(s) uploaded successfully!`);
        } else {
            Alert.alert('Error', 'Please drop audio files only (MP3, WAV, M4A, etc.)');
        }
    };

    const handleDragEnter = () => {
        setIsDragOver(true);
        console.log('Drag entered');
    };

    const handleDragExit = () => {
        setIsDragOver(false);
        console.log('Drag exited');
    };

    const handleDragEnd = () => {
        // Always reset drag state when drag operation ends
        setIsDragOver(false);
        console.log('Drag ended - state reset');
    };

    const analyzeAudio = async () => {
        if (selectedFiles.length === 0) {
            Alert.alert('No files selected', 'Please select an audio file to analyze.');
            return;
        }
        const file = selectedFiles[0];
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            Alert.alert('File too large', 'Please select an audio file smaller than 50MB.');
            return;
        }
        setIsAnalyzing(true);
        setAnalysisProgress('Analyzing audio...');
        console.log('Starting analysis for files:', selectedFiles);
        try {
            const formData = new FormData();
            if (Platform.OS === 'web') {
                // On web, ensure file is a real File/Blob. If not, fetch as Blob and construct a File.
                let fileToSend = file;
                // If not a File or Blob, fetch from uri
                if (!(file instanceof File || file instanceof Blob)) {
                    // Try to fetch the file as a blob from its uri
                    if (file.uri) {
                        const response = await fetch(file.uri);
                        const blob = await response.blob();
                        fileToSend = new File([blob], file.name || file.fileName || 'audio.wav', { type: file.mimeType || blob.type || 'audio/wav' });
                    } else {
                        throw new Error('Selected file is not a valid File/Blob and has no uri.');
                    }
                }
                formData.append('file', fileToSend, fileToSend.name || fileToSend.fileName || 'audio.wav');
            } else {
                // For native, fetch the file as a blob and append as file
                const fileUri = file.uri;
                const fileName = file.name || file.fileName || 'audio.wav';
                const fileType = file.mimeType || 'audio/wav';
                formData.append('file', {
                    uri: fileUri,
                    type: fileType,
                    name: fileName,
                } as any);
            }
            setAnalysisProgress('Uploading file...');

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

            setAnalysisProgress('Processing audio...');

            // Use the correct endpoint with trailing slash
            const response = await fetch('https://sprov-ai.onrender.com/analyze-audio/', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                // Do NOT set Content-Type header; let fetch/axios set it for multipart
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error ${errorText}! status: ${response.status}`);
            }

            setAnalysisProgress('Analysis complete!');
            const results: AnalysisResults = await response.json();
            console.log('Analysis results:', results);
            setLastAnalysisResult(results, file.name || file.fileName || 'Audio File');
            router.push('/(tabs)/results');
        } catch (error) {
            console.error('Analysis error:', error);

            let errorMessage = 'An unexpected error occurred.';

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timed out. Please try with a shorter audio file.';
                } else {
                    errorMessage = error.message;
                }
            }

            Alert.alert(
                'Analysis Failed',
                `${errorMessage}\n\nPlease try again with a different file or check your internet connection.`,
                [{ text: 'OK' }]
            );
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress('');
        }
    };

    // Common styling for the upload container
    const uploadContainerStyle = {
        borderWidth: 2,
        borderColor: isDragOver ? '#3182ce' : '#e2e8f0', // Blue vs Gray border
        borderStyle: 'dashed' as const,
        borderRadius: 8,
        paddingHorizontal: 32,
        paddingVertical: 24,
        flex: 1,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        margin: 16,
        maxHeight: Platform.OS === 'web' ? 280 : 200,
        minHeight: 200,
        width: Platform.OS === 'web' ? 600 : 320,
        backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',    // Light blue vs Light gray background
    };

    const renderUploadContent = () => (
        <>
            <FontAwesome 
                name="file-audio-o" 
                size={38} 
                color={isDragOver ? '#3182ce' : '#4a5568'}  // Blue vs Gray icon
                style={{ marginBottom: 16 }}
            />
            
            <TouchableOpacity
                style={{
                    backgroundColor: '#3182ce',
                    paddingVertical: 16,
                    paddingHorizontal: 32,
                    borderRadius: 8,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
                onPress={handlePickFile}
            >
                <Text style={{ 
                    color: 'white', 
                    fontFamily: 'Jakarta-SemiBold', 
                    fontSize: 16,
                    textAlign: 'center'
                }}>
                    Choose Audio File
                </Text>
            </TouchableOpacity>

            {Platform.OS === 'web' && (
                <Text style={{ 
                    color: isDragOver ? '#3182ce' : '#718096', 
                    fontSize: 14, 
                    fontFamily: 'Jakarta-Regular',
                    textAlign: 'center',
                    marginBottom: 8
                }}>
                    {isDragOver ? 'Drop your audio file here!' : 'or drag and drop your audio file here'}
                </Text>
            )}

            <Text style={{ 
                color: '#a0aec0', 
                fontSize: 12, 
                fontFamily: 'Jakarta-Light',
                textAlign: 'center'
            }}>
                Maximum file size: 50MB
            </Text>
        </>
    );

    return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 100 }} 
                keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* Header */}
            <TouchableOpacity onPress={() => router.replace("/(auth)/welcome")}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 60,
                    paddingTop: 36,
                    paddingVertical: 26,
                    justifyContent: "center",
                    backgroundColor: "#fff",
                }}
            >
                <Image
                    source={require("@/assets/images/icon.webp")}
                    style={{ width: 110, height: 110, resizeMode: "contain" }}
                />
            </View>
            </TouchableOpacity>

            <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 40, fontFamily: 'Jakarta-Bold', marginBottom: 15 }}>
                Upload Your Audio File Below
            </Text>
            <Text style={{ fontSize: 13, textAlign: 'center', marginBottom: 20, color: '#718096', fontFamily: 'Jakarta-Light' }}>
                Supported formats: MP3, WAV, M4A, FLAC
            </Text>

            {/* Show selected files */}
            {selectedFiles.length > 0 && !isAnalyzing && (
                <View style={{ marginBottom: 20, padding: 16, backgroundColor: '#f0f8ff', borderRadius: 8, width: '80%' }}>
                    <Text style={{ fontFamily: 'Jakarta-SemiBold', marginBottom: 8, color: '#2d3748' }}>
                        Selected File:
                    </Text>
                    {selectedFiles.map((file, index) => (
                        <Text key={index} style={{ fontFamily: 'Jakarta-Regular', color: '#4a5568', fontSize: 14 }}>
                            📄 {file.name || file.fileName || 'Audio File'}
                        </Text>
                    ))}
                </View>
            )}

            {/* Loading state */}
            {isAnalyzing && (
                <View style={{ 
                    marginBottom: 20, 
                    padding: 24, 
                    backgroundColor: '#e6f3ff', 
                    borderRadius: 8, 
                    width: '80%',
                    alignItems: 'center'
                }}>
                    <ActivityIndicator size="large" color="#3182ce" />
                    <Text style={{ 
                        fontFamily: 'Jakarta-SemiBold', 
                        marginTop: 16, 
                        color: '#2d3748',
                        textAlign: 'center'
                    }}>
                        Analyzing Audio...
                    </Text>
                    <Text style={{ 
                        fontFamily: 'Jakarta-Regular', 
                        marginTop: 8, 
                        color: '#4a5568',
                        textAlign: 'center',
                        fontSize: 14
                    }}>
                        {analysisProgress}
                    </Text>
                    <Text style={{ 
                        fontFamily: 'Jakarta-Light', 
                        marginTop: 8, 
                        color: '#718096',
                        textAlign: 'center',
                        fontSize: 12
                    }}>
                        This may take up to 5 minutes...
                    </Text>
                </View>
            )}

            {/* Upload container - conditional rendering based on platform */}
            {!isAnalyzing && (
                 Platform.OS === 'web' && DragDropContentView ? (
                    // Web version with drag and drop support
                    <DragDropContentView
                        onDrop={handleDrop}
                        onEnter={handleDragEnter}
                        onExit={handleDragExit}
                        onDragEnd={handleDragEnd}
                        allowedMimeTypes={['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/x-m4a', 'audio/mp4']}
                        // includeBase64={true}
                        style={uploadContainerStyle}
                    >
                        {renderUploadContent()}
                    </DragDropContentView>
                ) : (
                    // Mobile version with just file picker
                    <View style={uploadContainerStyle}>
                        {renderUploadContent()}
                    </View>
                )
            )}

            {/* Process button - only show when files are selected */}
            {selectedFiles.length > 0 && !isAnalyzing && (
                <TouchableOpacity
                    style={{
                        backgroundColor: '#38a169',
                        paddingVertical: 16,
                        paddingHorizontal: 48,
                        borderRadius: 8,
                        marginBottom: 32,
                        marginTop: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                    onPress={analyzeAudio}
                >
                    <Text style={{ 
                        color: 'white', 
                        fontFamily: 'Jakarta-Bold', 
                        fontSize: 16 
                    }}>
                        Analyze Speech
                    </Text>
                </TouchableOpacity>
            )}

            <View style={{ height: 1, backgroundColor: '#e2e8f0', width: '85%', alignSelf: 'center', marginVertical: 34 }} />
                <Text style={{
                    fontSize: 18,
                    fontFamily: 'Jakarta-Bold',
                    textAlign: 'left',
                    marginBottom: 20,
                    alignSelf: 'flex-start', // Align left
                    paddingLeft: 30,
                    color: '#2d3748',
                    letterSpacing: 0.5,
                }}>
                    Sample Analysis Report 🗒️
                </Text>

            <Markdown
  style={{
    body: {
      fontFamily: 'Jakarta-Regular',
      fontSize: 13,
      lineHeight: 20,
      color: '#4a5568',
      marginHorizontal: 30,
      marginBottom: 20,
      textAlign: 'left',
      alignSelf: 'flex-start', // Align left
      backgroundColor: '#f7fafc',
      padding: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
  }}
>
{`
**Speech Clarity:** The speech is clear and easy to understand.

**Pitch and Tone Feedback:** The pitch is dynamic, showing good variation and energy.

**Speaking Pace:** The pace is steady, but could be slowed slightly for emphasis.

**Communication Effectiveness:** The message is well-communicated, with minor areas for improvement.

**Speech Style:** Dynamic

**Stuttering Detected:** No

**Pitch/Intensity Statistics:**
- Average Pitch: 220 Hz
- Pitch Variation: 45 Hz
- Average Intensity: 0.07
- Intensity Variation: 0.03

**Pitch Contour Graph:**  
A visual graph showing how your pitch changes throughout the audio will be included in your report.

**Transcript:**  
"Thank you for using Sprov AI. This is a sample transcript of your audio."

**Improvement Suggestions:**
1. Try to pause more between key points.
2. Reduce filler words for a more professional tone.
3. Maintain a consistent volume throughout.
`}
</Markdown>
            <View style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                alignItems: 'center',
            }}>
                <Text style={{ 
                    color: '#a0aec0', 
                    fontSize: 12, 
                    fontFamily: 'Jakarta-Light' 
                }}>
                    Powered by Google's Gemini 2.0 Flash AI Model.
                </Text>
                <Link href="https://github.com/saadmemon1/Sprov-AI" target="_blank">
                        <Text style={{ 
                            color: '#a0aec0', 
                            fontSize: 12, 
                            fontFamily: 'Jakarta-Light' ,
                            marginTop: 4,
                            textDecorationLine: 'underline',
                            fontWeight: 'bold'
                        }}>
                            © 2025 Sprov AI. All rights reserved.
                        </Text>
                </Link>
            </View>
            </ScrollView>
        </SafeAreaView>
    );
}