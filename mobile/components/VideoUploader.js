import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { colors } from '../assets/colors';

export const VideoUploader = ({ onVideoSelected, isLoading }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });

      if (!result.canceled) {
        const video = result.assets[0];
        setSelectedVideo(video);
        onVideoSelected(video.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.uploadButton, isLoading && styles.disabled]}
        onPress={pickVideo}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <Text style={styles.uploadIcon}>📹</Text>
            <Text style={styles.uploadText}>
              {selectedVideo ? 'Change Video' : 'Select Video'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {selectedVideo && (
        <View style={styles.videoInfo}>
          <Text style={styles.fileName}>{selectedVideo.name}</Text>
          <Text style={styles.fileSize}>
            Size: {(selectedVideo.size / 1024 / 1024).toFixed(2)} MB
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  uploadButton: {
    width: '80%',
    paddingVertical: 30,
    backgroundColor: colors.surface,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  videoInfo: {
    marginTop: 15,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    width: '80%',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  fileSize: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
});