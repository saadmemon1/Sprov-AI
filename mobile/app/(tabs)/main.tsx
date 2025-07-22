import { useState } from "react";
import { Image, Text, TouchableOpacity, View, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as DocumentPicker from 'expo-document-picker';
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
        if(selectedFiles.length === 0) {
            Alert.alert('No files selected', 'Please select an audio file to analyze.');
            return;
        }
        const file = selectedFiles[0];
        if(file.size > 50 * 1024 * 1024) { // 50MB limit
            Alert.alert('File too large', 'Please select an audio file smaller than 50MB.');
            return;
        }
        setIsAnalyzing(true);
        setAnalysisProgress('Analyzing audio...');
        console.log('Starting analysis for files:', selectedFiles);
        try {
            const formData = new FormData();
            if(Platform.OS === 'web') {
                // For web, we can use the file directly
                formData.append('file', file);
            }
            else {
                // For mobile, we need to convert the file to a Blob
                formData.append('file', {
                    uri: file.uri,
                    type: file.mimeType || 'audio/wav',
                    name: file.name || file.fileName || 'audio.wav',
                } as any);
            }
            setAnalysisProgress('Uploading file...');
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

            setAnalysisProgress('Processing audio...');

            const response = await fetch('https://sprov-ai.onrender.com/analyze-audio', {
                method: 'POST',
                body: formData,
                signal: controller.signal,
                headers: {

                }
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error ${errorText}! status: ${response.status}`);
            }

            setAnalysisProgress('Analysis complete!');
            const results: AnalysisResults = await response.json();
            console.log('Analysis results:', results);
            router.push({
                pathname: '/(tabs)/two',
                params: {
                    results: JSON.stringify(results),
                    fileName: file.name || file.fileName || 'Audio File',
                }
            });
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
            {/* Header */}
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
                    source={require("@/assets/images/icon.png")}
                    style={{ width: 110, height: 110, resizeMode: "contain" }}
                />
            </View>

            <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 50, fontFamily: 'Jakarta-Bold', marginBottom: 20 }}>
                Upload Your Audio File Below
            </Text>
            <Text style={{ fontSize: 15, textAlign: 'center', marginBottom: 20, color: '#718096', fontFamily: 'Jakarta-Light' }}>
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
        </SafeAreaView>
    );
}