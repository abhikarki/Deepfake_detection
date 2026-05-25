import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { VideoUploader } from '../components/VideoUploader';
import { uploadVideo } from '../api/apiClient';
import { colors } from '../assets/colors';

export const UploadScreen = ({ navigation }) => {
  const [selectedVideoUri, setSelectedVideoUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVideoSelected = (uri) => {
    setSelectedVideoUri(uri);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedVideoUri) {
      Alert.alert('Error', 'Please select a video first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await uploadVideo(selectedVideoUri);
      
      // Navigate to results screen with the data
      navigation.navigate('Results', { results });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        'Failed to analyze video. Make sure backend is running.';
      
      setError(errorMessage);
      Alert.alert('Analysis Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload & Analyze</Text>
        <Text style={styles.headerSubtitle}>Select a video to detect deepfakes</Text>
      </View>

      <VideoUploader onVideoSelected={handleVideoSelected} isLoading={isLoading} />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}> Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.analyzeButton,
          (!selectedVideoUri || isLoading) && styles.analyzeButtonDisabled,
        ]}
        onPress={handleAnalyze}
        disabled={!selectedVideoUri || isLoading}
      >
        <Text style={styles.analyzeButtonText}>
          {isLoading ? ' Analyzing...' : ' Analyze Video'}
        </Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📋 Requirements</Text>
        <Text style={styles.infoText}>• Video format: MP4, MOV</Text>
        <Text style={styles.infoText}>• Recommended: 5-30 seconds</Text>
        <Text style={styles.infoText}>• Must contain a face</Text>
        <Text style={styles.infoText}>• File size: Under 100MB</Text>
      </View>

      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>💡 Tips for Best Results</Text>
        <Text style={styles.tipText}>
          1. Ensure good lighting and clear face visibility
        </Text>
        <Text style={styles.tipText}>
          2. Videos with multiple face manipulations may take longer
        </Text>
        <Text style={styles.tipText}>
          3. Background noise and artifacts help detection
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E0E0FF',
    marginTop: 5,
  },
  analyzeButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorBox: {
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 13,
    color: colors.error,
    lineHeight: 19,
  },
  infoBox: {
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6,
    lineHeight: 18,
  },
  tipsBox: {
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 6,
    lineHeight: 18,
  },
});