import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../assets/colors';

// Process window probabilities into window objects
const processWindowData = (windowProbs) => {
  if (!windowProbs || windowProbs.length === 0) return [];
  
  const fps = 10;
  const windowSize = 5;
  const stride = 5;
  const windows = [];
  
  windowProbs.forEach((prob, idx) => {
    const startFrame = idx * stride;
    const endFrame = startFrame + windowSize;
    const startTime = startFrame / fps;
    
    windows.push({
      windowIndex: idx,
      startFrame: startFrame,
      endFrame: endFrame,
      probability: prob,
      startTime: startTime,
      isSuspicious: prob >= 0.5,
    });
  });
  
  return windows;
};

// Simple bar chart component
const ProbabilityChart = ({ windows }) => {
  if (!windows || windows.length === 0) return null;
  
  const maxProb = Math.max(...windows.map(w => w.probability), 0.5);
  const chartHeight = 180;
  
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Frame Window Probabilities</Text>
      </View>
      
      <View style={styles.chartArea}>
        <View style={styles.yAxisLabels}>
          <Text style={styles.yAxisLabel}>100%</Text>
          <Text style={styles.yAxisLabel}>50%</Text>
          <Text style={styles.yAxisLabel}>0%</Text>
        </View>
        
        <View style={styles.barsContainer}>
          {windows.map((window, idx) => {
            const barHeight = (window.probability / maxProb) * chartHeight;
            const width = (90 / windows.length);
            
            return (
              <View key={idx} style={[styles.barWrapper, { width: `${width}%` }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: window.isSuspicious ? '#e53935' : '#1976d2',
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {(window.probability * 100).toFixed(0)}%
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Threshold line */}
        <View style={styles.thresholdLine} />
        <Text style={styles.thresholdLabel}>50% threshold</Text>
      </View>
      
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#1976d2' }]} />
          <Text style={styles.legendText}>Authentic</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: '#e53935' }]} />
          <Text style={styles.legendText}>Suspicious</Text>
        </View>
      </View>
    </View>
  );
};

export const ResultsDisplay = ({ results, onReset, isSample }) => {
  if (!results) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results to display</Text>
      </View>
    );
  }

  const isDeepfake = results.prediction === 'deepfake';
  const confidence = (results.confidence * 100).toFixed(2);
  const verdict = results.verdict || (isDeepfake ? 'LIKELY MANIPULATED' : 'AUTHENTIC');
  const overallProb = results.overall_probability ? (results.overall_probability * 100).toFixed(1) : confidence;
  const peakScore = results.highest_frame_score ? (results.highest_frame_score * 100).toFixed(1) : 'N/A';
  const temporalInstability = results.instability_detected ? 'Yes' : 'No';
  
  // Calculate windows from window probabilities
  const windows = useMemo(() => {
    return processWindowData(results.frame_probabilities);
  }, [results.frame_probabilities]);
  
  // Count suspicious windows (probability >= 0.5)
  const suspiciousWindows = windows.filter(w => w.isSuspicious).length;
  const windowsFlagged = `${suspiciousWindows}/${windows.length}`;

  return (
    <ScrollView style={styles.container}>
      {isSample && (
        <View style={styles.sampleBadge}>
          <Text style={styles.sampleBadgeText}>SAMPLE OUTPUT</Text>
        </View>
      )}

      {/* Verdict Card */}
      <View
        style={[
          styles.verdictCard,
          { backgroundColor: isDeepfake ? colors.deepfake : colors.real },
        ]}
      >
        <Text style={styles.verdictLabel}>CLASSIFICATION</Text>
        <Text style={styles.verdict}>{verdict}</Text>
        <Text style={styles.probability}>{overallProb}% Deepfake Probability</Text>
      </View>

      {/* Probability Chart */}
      {results.frame_probabilities && results.frame_probabilities.length > 0 && (
        <ProbabilityChart windows={windows} />
      )}

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Most Suspicious Window</Text>
          <Text style={styles.metricValue}>
            {results.most_suspicious_frame !== undefined ? `Frames ${results.most_suspicious_frame}-${results.most_suspicious_frame + 4}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Peak Score</Text>
          <Text style={styles.metricValue}>{peakScore}%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Temporal Instability</Text>
          <Text style={[styles.metricValue, { color: results.instability_detected ? '#c62828' : '#2e7d32' }]}>
            {temporalInstability}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Windows Flagged</Text>
          <Text style={styles.metricValue}>{windowsFlagged}</Text>
        </View>
      </View>

      {/* Detection Details Card */}
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

      {/* Flagged Concerns */}
      {results.flagged_reasons && results.flagged_reasons.length > 0 && (
        <View style={styles.flaggedCard}>
          <Text style={styles.flaggedTitle}>Flagged Concerns</Text>
          {results.flagged_reasons.map((reason, idx) => (
            <View key={idx} style={styles.flaggedItem}>
              <Text style={styles.flaggedNumber}>{idx + 1}.</Text>
              <Text style={styles.flaggedReason}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Warning Card */}
      <View style={styles.warningCard}>
        <Text style={styles.warningTitle}>⚠ Important Notice</Text>
        <Text style={styles.warningText}>
          This is an AI-powered detection system and should not be considered as definitive proof. Always combine automated detection with human expert review for high-stakes applications.
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
  },
  sampleBadge: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 8,
  },
  sampleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1565C0',
    letterSpacing: 0.5,
  },
  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  chartHeader: {
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  chartArea: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 12,
    alignItems: 'flex-end',
    position: 'relative',
  },
  yAxisLabels: {
    width: 35,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: '500',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderLeftColor: '#ccc',
    borderBottomColor: '#ccc',
    position: 'relative',
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '80%',
    borderRadius: 2,
  },
  barLabel: {
    fontSize: 8,
    color: '#666666',
    marginTop: 4,
    fontWeight: '600',
  },
  thresholdLine: {
    position: 'absolute',
    bottom: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ff9800',
    opacity: 0.6,
  },
  thresholdLabel: {
    position: 'absolute',
    top: '50%',
    right: 0,
    fontSize: 9,
    color: '#ff9800',
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: colors.textLight,
  },
  verdictCard: {
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
  verdictLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  verdict: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 10,
  },
  probability: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    width: '48%',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
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
  flaggedCard: {
    backgroundColor: '#FFE5E5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  flaggedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 10,
  },
  flaggedItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  flaggedNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c62828',
    marginRight: 8,
  },
  flaggedReason: {
    fontSize: 13,
    color: '#c62828',
    flex: 1,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
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