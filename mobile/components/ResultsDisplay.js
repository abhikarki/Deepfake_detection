import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../assets/colors';

export const ResultsDisplay = ({ results, onReset }) => {
  if (!results) {
    return null;
  }

  const isPredictionAvailable = results.prediction !== undefined;
  const isDeepfake = results.prediction === 'deepfake';
  const confidence = (results.confidence * 100).toFixed(2);

  return (
    <ScrollView style={styles.container}>
      <View
        style={[
          styles.resultCard,
          { backgroundColor: isDeepfake ? colors.deepfake : colors.real },
        ]}
      >
        <Text style={styles.predictionLabel}>CLASSIFICATION</Text>
        <Text style={styles.prediction}>
          {isDeepfake ? 'DEEPFAKE' : 'REAL'}
        </Text>
        <Text style={styles.confidence}>{confidence}% Confidence</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Detection Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Classification:</Text>
          <Text style={styles.detailValue}>
            {results.prediction || 'N/A'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Confidence:</Text>
          <Text style={styles.detailValue}>{confidence}%</Text>
        </View>

        {results.deepfake_probability !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deepfake Probability:</Text>
            <Text style={styles.detailValue}>
              {(results.deepfake_probability * 100).toFixed(2)}%
            </Text>
          </View>
        )}

        {results.real_probability !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Real Probability:</Text>
            <Text style={styles.detailValue}>
              {(results.real_probability * 100).toFixed(2)}%
            </Text>
          </View>
        )}

        {results.processing_time && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processing Time:</Text>
            <Text style={styles.detailValue}>
              {results.processing_time.toFixed(2)}s
            </Text>
          </View>
        )}
      </View>

      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}> Important Notice</Text>
        <Text style={styles.warningText}>
          This is an AI-powered detection system and should not be considered
          as definitive proof. Always combine automated detection with human
          expert review for high-stakes applications.
        </Text>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={onReset}>
        <Text style={styles.resetButtonText}>Analyze Another Video</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  resultCard: {
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  prediction: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 10,
  },
  confidence: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textLight,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});