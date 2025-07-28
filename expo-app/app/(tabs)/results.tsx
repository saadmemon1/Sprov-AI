import { ScrollView, StyleSheet, TouchableOpacity, View, Image, Platform, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { getLastAnalysisResult } from '../../utils/analysisResultStore';
import { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface AnalysisResults {
    sample_rate?: number;
    duration_seconds?: number;
    pitch_analysis?: {
        average_pitch_hz: number;
        pitch_variation: number;
        total_frames: number;
        valid_pitch_frames: number;
    };
    intensity_analysis?: {
        average_intensity: number;
        intensity_variation: number;
    };
    speech_style?: string;
    stuttering_detected?: boolean;
    pitch_contour_image?: string;
    transcript?: string;
    ai_report?: string;
    message?: string;
}

export default function ResultsScreen() {
    const [results, setResults] = useState<AnalysisResults | null>(null);
    const [fileName, setFileName] = useState<string>('Audio File');

    useEffect(() => {
        const { result, fileName } = getLastAnalysisResult();
        if (result) setResults(result);
        if (fileName) setFileName(fileName);
    }, []);

    const handleBackPress = () => {
        router.back();
    };

    if (!results) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                        <FontAwesome name="arrow-left" size={20} color="#3182ce" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Analysis Results</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centeredContent}>
                    <Text style={styles.errorText}>No analysis results found.</Text>
                    <TouchableOpacity onPress={handleBackPress} style={styles.primaryButton}>
                        <Text style={styles.buttonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>

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
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color="#3182ce" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Analysis Results</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* File info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📄 File Information</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>File Name:</Text>
                        <Text style={styles.infoValue}>{fileName}</Text>
                    </View>
                    {results.duration_seconds && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Duration:</Text>
                            <Text style={styles.infoValue}>{results.duration_seconds.toFixed(2)} seconds</Text>
                        </View>
                    )}
                    {results.sample_rate && (
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Sample Rate:</Text>
                            <Text style={styles.infoValue}>{results.sample_rate} Hz</Text>
                        </View>
                    )}
                </View>

                {/* Key Metrics */}
                {results.pitch_analysis && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎯 Key Metrics</Text>
                        <View style={styles.metricsGrid}>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricValue}>
                                    {results.pitch_analysis.average_pitch_hz.toFixed(1)} Hz
                                </Text>
                                <Text style={styles.metricLabel}>Average Pitch</Text>
                            </View>
                            <View style={styles.metricCard}>
                                <Text style={styles.metricValue}>
                                    {results.pitch_analysis.pitch_variation.toFixed(2)}
                                </Text>
                                <Text style={styles.metricLabel}>Pitch Variation</Text>
                            </View>
                            {results.intensity_analysis && (
                                <>
                                    <View style={styles.metricCard}>
                                        <Text style={styles.metricValue}>
                                            {results.intensity_analysis.average_intensity.toFixed(4)}
                                        </Text>
                                        <Text style={styles.metricLabel}>Avg Intensity</Text>
                                    </View>
                                    <View style={styles.metricCard}>
                                        <Text style={styles.metricValue}>
                                            {results.intensity_analysis.intensity_variation.toFixed(4)}
                                        </Text>
                                        <Text style={styles.metricLabel}>Intensity Variation</Text>
                                    </View>
                                </>
                            )}
                        </View>
                        
                        {/* Additional metrics */}
                        {results.speech_style && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Speech Style:</Text>
                                <Text style={[styles.infoValue, { 
                                    color: results.speech_style === 'Dynamic' ? '#38a169' : '#ed8936' 
                                }]}>
                                    {results.speech_style}
                                </Text>
                            </View>
                        )}
                        
                        {results.stuttering_detected !== undefined && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Stuttering Detected:</Text>
                                <Text style={[styles.infoValue, { 
                                    color: results.stuttering_detected ? '#e53e3e' : '#38a169' 
                                }]}>
                                    {results.stuttering_detected ? 'Yes' : 'No'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Pitch Contour Visualization */}
                {results.pitch_contour_image && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📈 Pitch Contour Analysis</Text>
                        <View style={styles.imageContainer}>
                            <Image
                                source={{ uri: `data:image/png;base64,${results.pitch_contour_image}` }}
                                style={styles.pitchImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                )}

                {/* Transcript */}
                {results.transcript && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📝 Transcript</Text>
                        <View style={styles.transcriptContainer}>
                            <Text style={styles.transcriptText}>{results.transcript}</Text>
                        </View>
                    </View>
                )}

                {/* AI Analysis Report */}
                {results.ai_report && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📄 AI Analysis Report</Text>
                        <View style={styles.reportContainer}>
                            <Markdown style={{
                                body: { color: '#2d3748', fontSize: 14, fontFamily: 'Jakarta-Regular', lineHeight: 20 },
                                strong: { fontFamily: 'Jakarta-Bold' },
                                em: { fontFamily: 'Jakarta-Italic' },
                                bullet_list: { marginVertical: 4 },
                                list_item: { marginVertical: 2 },
                            }}>
                                {results.ai_report}
                            </Markdown>
                        </View>
                    </View>
                )}

                {/* Success message */}
                <View style={styles.successSection}>
                    <FontAwesome name="check-circle" size={24} color="#38a169" />
                    <Text style={styles.successText}>Analysis completed successfully!</Text>
                </View>

                {/* Action buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleBackPress} style={styles.primaryButton}>
                        <FontAwesome name="arrow-left" size={16} color="white" style={{ marginRight: 8 }} />
                        <Text style={styles.buttonText}>Analyze Another File</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom spacing */}
                <View style={{ height: 50 }} />

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Jakarta-Bold',
        color: '#2d3748',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Jakarta-Bold',
        color: '#2d3748',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: 'Jakarta-SemiBold',
        color: '#4a5568',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'Jakarta-Regular',
        color: '#2d3748',
        flex: 2,
        textAlign: 'right',
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    metricCard: {
        flex: 1,
        minWidth: Platform.OS === 'web' ? 140 : 120,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    metricValue: {
        fontSize: 20,
        fontFamily: 'Jakarta-Bold',
        color: '#3182ce',
        marginBottom: 4,
    },
    metricLabel: {
        fontSize: 12,
        fontFamily: 'Jakarta-Regular',
        color: '#718096',
        textAlign: 'center',
    },
    imageContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 8,
        alignItems: 'center',
    },
    pitchImage: {
        width: '100%',
        height: 200,
        maxWidth: 500,
    },
    transcriptContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
    },
    transcriptText: {
        fontSize: 14,
        fontFamily: 'Jakarta-Regular',
        color: '#2d3748',
        lineHeight: 20,
    },
    reportContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
    },
    reportText: {
        fontSize: 14,
        fontFamily: 'Jakarta-Regular',
        color: '#2d3748',
        lineHeight: 20,
    },
    successSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0fff4',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
    },
    successText: {
        fontSize: 16,
        fontFamily: 'Jakarta-SemiBold',
        color: '#38a169',
        marginLeft: 8,
    },
    buttonContainer: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#3182ce',
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Jakarta-SemiBold',
    },
    centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        fontFamily: 'Jakarta-Regular',
        color: '#e53e3e',
        textAlign: 'center',
        marginBottom: 24,
    },
});