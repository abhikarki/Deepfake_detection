import React, { useState, useRef } from 'react';
import axios from 'axios';
import ResultsPage from './ResultsPage';

const API_BASE_URL = process.env.REACT_APP_URL;

function Home() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [forensicData, setForensicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      alert('Please upload a video file first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await axios.post(
        `${API_BASE_URL}/api/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );
      
      if (response.data.error) {
        alert(`Analysis error: ${response.data.error}`);
      } else {
        setForensicData(response.data);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error analyzing video. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (forensicData) {
    return (
      <ResultsPage 
        data={forensicData} 
        videoFile={uploadedFile}
        onBack={() => setForensicData(null)}
      />
    );
  }

  return (
    <div className="page-container">
      <div className="upload-section" 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={dragOver ? { borderColor: '#333333', backgroundColor: '#f0f0f0' } : {}}
      >
        <h2 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>Upload Video</h2>
        <p style={{ color: '#666666', marginBottom: '1.5rem' }}>
          Drag and drop your video here, or click to browse
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="upload-input"
          accept="video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <button 
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Video File
        </button>
        
        {uploadedFile && (
          <div className="file-list">
            Selected: {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={!uploadedFile || loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Video'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: '#666666' }}>Processing video...</p>
        </div>
      )}
    </div>
  );
}

export default Home;
