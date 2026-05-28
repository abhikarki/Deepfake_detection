import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../assets/colors';

export const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Deepfake Detection and Forensic Analysis</Text>

        {/* What is this Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is this?</Text>
          <Text style={styles.text}>
            This is a deepfake detection system that analyzes videos to identify signs of manipulation or artificial generation. Using advanced machine learning, the system examines facial features and temporal patterns across video frames to detect potential deepfakes.
          </Text>
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.boxStyle}>
            <Text style={styles.listItem}>
              <Text style={styles.bold}>1. Normalization:</Text> The system normalizes the videos' frame rate, pixel rate, and applies light denoising so that downstream models do not get influenced by compression artifacts.
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.bold}>2. Face Detection:</Text> The system detects and extracts faces from each frame of your video
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.bold}>3. Feature Extraction:</Text> Deep learning extracts facial features using ResNeXt-50
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.bold}>4. Temporal Analysis:</Text> A Temporal CNN model analyzes 5-frame windows to detect temporal inconsistencies between frames.
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.bold}>5. Probability Scoring:</Text> Each window receives a deepfake probability score (0-100%)
            </Text>
            <Text style={styles.listItem}>
              <Text style={styles.bold}>6. Final Verdict:</Text> Results are aggregated to determine if the video is likely authentic or manipulated
            </Text>
          </View>
        </View>

        {/* Understanding Results Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Understanding Results</Text>
          <View style={styles.resultBox}>
            <View style={[styles.resultCard, styles.authenticCard]}>
              <Text style={styles.resultTitle}>Low Probability (&lt; 50%)</Text>
              <Text style={styles.resultText}>
                <Text style={styles.bold}>AUTHENTIC:</Text> Video shows characteristics consistent with genuine footage
              </Text>
            </View>
            <View style={[styles.resultCard, styles.manipulatedCard]}>
              <Text style={styles.resultTitle}>High Probability (&gt; 50%)</Text>
              <Text style={styles.resultText}>
                <Text style={styles.bold}>LIKELY MANIPULATED:</Text> Video shows signs of manipulation or artificial generation
              </Text>
            </View>
          </View>
        </View>

        {/* Technical Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <View style={styles.techBox}>
            <View style={styles.techColumn}>
              <Text style={styles.techItem}><Text style={styles.bold}>Frame Rate:</Text> 10 FPS</Text>
              <Text style={styles.techItem}><Text style={styles.bold}>Temporal Window:</Text> 5 frames (~0.5 seconds)</Text>
              <Text style={styles.techItem}><Text style={styles.bold}>Model:</Text> Temporal CNN</Text>
            </View>
            <View style={styles.techColumn}>
              <Text style={styles.techItem}><Text style={styles.bold}>Face Detector:</Text> RetinaFace</Text>
              <Text style={styles.techItem}><Text style={styles.bold}>Feature Extractor:</Text> ResNeXt-50</Text>
              <Text style={styles.techItem}><Text style={styles.bold}>Detection Method:</Text> Temporal inconsistency</Text>
            </View>
          </View>
        </View>

        {/* Tips for Best Results Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Best Results</Text>
          <Text style={styles.listItem}>✓ Use clear, well-lit videos with visible faces</Text>
          <Text style={styles.listItem}>✓ Videos should be 10-30 seconds long for optimal analysis</Text>
          <Text style={styles.listItem}>✓ Avoid videos with multiple people or extreme angles</Text>
          <Text style={styles.listItem}>✓ Face should occupy at least 50x50 pixels for reliable detection</Text>
          <Text style={styles.listItem}>✓ Note: Results are probabilities, not certainties</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555555',
  },
  boxStyle: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  listItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555555',
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
  },
  resultBox: {
    gap: 12,
  },
  resultCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  authenticCard: {
    backgroundColor: '#e8f5e9',
    borderColor: '#81c784',
  },
  manipulatedCard: {
    backgroundColor: '#ffebee',
    borderColor: '#ef9a9a',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
  },
  techBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  techColumn: {
    flex: 1,
  },
  techItem: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 8,
    lineHeight: 20,
  },
});
