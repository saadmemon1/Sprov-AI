import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface AnalysisResult {
  sample_rate: number;
  duration_seconds: number;
  pitch_analysis: {
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
  transcript?: string;
  ai_report?: string;
  pitch_contour_image?: string;
  message?: string;
}

export default function App() {

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sprov AI</Text>
        <Text style={styles.subtitle}>Analyze your speech and get feedback</Text>
      </View>
      <View style={styles.uploadSection}>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Audio</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(0, 255, 255, 0.8)',
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
    width: width - 40,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  fileInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: width - 40,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 5,
  },
  fileSize: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  analyzeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#666',
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  metricsContainer: {
    marginBottom: 25,
  },
  metricsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'right',
  },
  imageContainer: {
    marginBottom: 25,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  pitchImage: {
    width: width - 60,
    height: 200,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
  },
  transcriptText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  aiReportText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
  messageText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
  },
});
