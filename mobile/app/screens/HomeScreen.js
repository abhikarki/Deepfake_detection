import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { healthCheck } from '../api/apiClient';
import { colors } from '../assets/colors';

export const HomeScreen = ({ navigation }) => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [backendIP, setBackendIP] = useState('Loading...');

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const result = await healthCheck();
      setBackendStatus('connected');
    } catch (error) {
      setBackendStatus('disconnected');
      console.log('Backend health check failed:', error.message);
    }
  };

  const retryConnection = () => {
    setBackendStatus('checking');
    checkBackendHealth();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔍 Deepfake Detector</Text>
        <Text style={styles.subtitle}>AI-Powered Detection</Text>
      </View>

      {/* Status Card */}
      <View
        style={[
          styles.statusCard,
          backendStatus === 'connected'
            ? styles.statusConnected
            : styles.statusDisconnected,
        ]}
      >
        <Text style={styles.statusIcon}>
          {backendStatus === 'checking' && 'Checking'}
          {backendStatus === 'connected' && 'Connected'}
          {backendStatus === 'disconnected' && 'Disconnected'}
        </Text>
        <Text style={styles.statusText}>
          Backend:{' '}
          {backendStatus === 'checking'
            ? 'Checking...'
            : backendStatus === 'connected'
            ? 'Connected'
            : 'Disconnected'}
        </Text>
        {backendStatus === 'checking' && (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features</Text>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📹</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>Upload Videos</Text>
            <Text style={styles.featureDesc}>
              Select any video from your device
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🤖</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>AI Analysis</Text>
            <Text style={styles.featureDesc}>
              Temporal CNN detects deepfakes with 90% accuracy
            </Text>
          </View>
        </View>

        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <View style={styles.featureContent}>
            <Text style={styles.featureName}>Detailed Results</Text>
            <Text style={styles.featureDesc}>
              Get confidence scores and analysis
            </Text>
          </View>
        </View>
      </View>

      {/* About */}
      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>About This App</Text>
        <Text style={styles.aboutText}>
          This application uses a temporal CNN model trained on the FaceForensics++
          dataset to detect deepfake videos with high accuracy. The model analyzes
          temporal patterns across video frames to identify artifacts and
          manipulations.
        </Text>
        <Text style={styles.aboutText} style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: '700' }}>Model Accuracy:</Text> 90%
          {'\n'}
          <Text style={{ fontWeight: '700' }}>Key Metric:</Text> 93% Recall
          (catches most deepfakes)
        </Text>
      </View>

      {/* Debug Info */}
      <View style={styles.debugCard}>
        <Text style={styles.debugTitle}>Backend Configuration</Text>
        <Text style={styles.debugText}>
          Update the BACKEND_URL in app/api/apiClient.js to your server IP
        </Text>
        <Text style={styles.debugCode}>http://YOUR_IP:8000</Text>
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
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E0FF',
    marginTop: 5,
  },
  statusCard: {
    marginHorizontal: 20,
    marginTop: -15,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statusConnected: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  statusDisconnected: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textLight,
    lineHeight: 18,
  },
  aboutCard: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 20,
  },
  debugCard: {
    marginHorizontal: 20,
    backgroundColor: '#F3E5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 8,
  },
  debugCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    color: colors.text,
    fontWeight: '600',
  },
});