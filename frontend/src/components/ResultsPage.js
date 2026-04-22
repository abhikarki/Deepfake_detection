import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_URL;

function ResultsPage({ data, videoFile, onBack }) {
  const [selectedWindowIndex, setSelectedWindowIndex] = useState(0);
  const videoRef = useRef(null);

  const fps = 10;
  const windowSize = 5;
  const stride = 5;

  const calculateWindows = () => {
    const windows = [];
    let windowStart = 0;
    while (windowStart < data.frame_probabilities.length) {
      const windowEnd = Math.min(windowStart + windowSize, data.frame_probabilities.length);
      const windowProbs = data.frame_probabilities.slice(windowStart, windowEnd);
      const maxProb = Math.max(...windowProbs);
      const avgProb = windowProbs.reduce((a, b) => a + b, 0) / windowProbs.length;
      windows.push({
        startFrame: windowStart,
        endFrame: windowEnd,
        maxProb: maxProb,
        avgProb: avgProb,
        startTime: windowStart / fps,
      });
      windowStart += stride;
    }
    return windows;
  };

  const windows = calculateWindows();

  useEffect(() => {
    if (videoRef.current && videoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        videoRef.current.src = e.target.result;
      };
      reader.readAsDataURL(videoFile);
    }
  }, [videoFile]);

  const handleBarClick = (windowIndex) => {
    setSelectedWindowIndex(windowIndex);
    if (videoRef.current) {
      videoRef.current.currentTime = windows[windowIndex].startTime;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/report/pdf`,
        data,
        { responseType: 'arraybuffer',
          headers:{
            'ngrok-skip-browser-warning': 'true'
          } 

        }
      );
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `forensic_report_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF');
    }
  };

  const selectedWindow = windows[selectedWindowIndex];
  const selectedTime = selectedWindow.startTime;
  const selectedProb = selectedWindow.maxProb;

  const maxProb = Math.max(...windows.map(w => w.maxProb));

  return (
    <div className="page-container">
      <button 
        onClick={onBack}
        style={{
          padding: '0.5rem 1rem',
          marginBottom: '1.5rem',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Back to Upload
      </button>

      {/* Download Button */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          className="download-button"
          onClick={handleDownloadPDF}
        >
          Download PDF Report
        </button>
      </div>

      {/* Verdict Box */}
      <div className={`verdict-box verdict-neutral`}>
        <h2>{data.verdict === 'REAL' ? 'AUTHENTIC' : 'LIKELY MANIPULATED'}</h2>
        <p>Deepfake Probability: {(data.overall_probability * 100).toFixed(1)}%</p>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Most Suspicious Frame Window</div>
          <div className="metric-value">Frames #{Math.floor(data.most_suspicious_frame / stride) * stride}-{Math.min(Math.floor(data.most_suspicious_frame / stride) * stride + windowSize - 1, data.frame_probabilities.length - 1)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Peak Score</div>
          <div className="metric-value">{(data.highest_frame_score * 100).toFixed(1)}%</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Temporal Instability</div>
          <div className="metric-value" style={{ color: data.instability_detected ? '#c62828' : '#2e7d32' }}>
            {data.instability_detected ? 'Yes' : 'No'}
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Frames Flagged</div>
          <div className="metric-value">{data.num_frames_fake}/{data.num_frames_analyzed}</div>
        </div>
      </div>

      {/* Flagged Reasons */}
      {data.flagged_reasons && data.flagged_reasons.length > 0 && (
        <div className="flagged-section-neutral">
          <h3>Flagged Concerns</h3>
          {data.flagged_reasons.map((reason, idx) => (
            <div key={idx} className="flagged-item-neutral">
              {idx + 1}. {reason}
            </div>
          ))}
        </div>
      )}

      {/* Analysis Section */}
      <div className="analysis-section">
        <h3 className="analysis-title">Frame Analysis</h3>
        
        <div className="analysis-grid">
          {/* Video Player */}
          {videoFile && (
            <div>
              <video 
                ref={videoRef}
                controls
                style={{ width: '100%', height: 'auto', backgroundColor: '#000000', borderRadius: '8px' }}
              >
                Your browser does not support the video tag.
              </video>
              <div className="video-controls">
                <div className="frame-info">
                  <strong>Window </strong> Frames #{selectedWindow.startFrame}-{selectedWindow.endFrame - 1} | Time: {selectedTime.toFixed(2)}s | Max Score: {(selectedProb * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="chart-container">
            <svg className="bar-chart" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" style={{ border: '1px solid #ddd' }}>
              {/* Background */}
              <rect width="1000" height="500" fill="#ffffff" />
              
              {/* Y-axis */}
              <line x1="60" y1="30" x2="60" y2="420" stroke="#333333" strokeWidth="2" />
              
              {/* X-axis */}
              <line x1="60" y1="420" x2="950" y2="420" stroke="#333333" strokeWidth="2" />
              
              {/* Y-axis labels (Probability) */}
              <text x="30" y="430" fontSize="12" fill="#666666" textAnchor="end">0%</text>
              <text x="30" y="315" fontSize="12" fill="#666666" textAnchor="end">50%</text>
              <text x="30" y="55" fontSize="12" fill="#666666" textAnchor="end">100%</text>
              
              {/* Y-axis label */}
              <text x="15" y="250" fontSize="12" fill="#666666" textAnchor="middle" transform="rotate(-90 15 250)">
                Suspicion Probability
              </text>
              
              {/* Y-axis gridlines */}
              <line x1="55" y1="225" x2="950" y2="225" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="5,5" />
              <line x1="55" y1="210" x2="950" y2="210" stroke="#f5f5f5" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Threshold line at 50% */}
              <line x1="60" y1="225" x2="950" y2="225" stroke="#ff9800" strokeWidth="2" strokeDasharray="5,5" opacity="0.7" />
              <text x="965" y="230" fontSize="10" fill="#ff9800">50%</text>
              
              {/* Bars for Windows */}
              {windows.map((window, idx) => {
                const barWidth = (880 / windows.length) * 0.85;
                const spacing = 880 / windows.length;
                const x = 60 + spacing * idx + (spacing - barWidth) / 2;
                const barHeight = (window.maxProb / 1.0) * 390;
                const y = 420 - barHeight;
                const isSelected = idx === selectedWindowIndex;
                const isSuspicious = window.maxProb >= 0.5;
                
                return (
                  <g key={idx} onClick={() => handleBarClick(idx)} style={{ cursor: 'pointer' }}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={isSuspicious ? '#e53935' : '#1976d2'}
                      opacity={isSelected ? 1 : 0.65}
                      stroke={isSelected ? '#000000' : 'none'}
                      strokeWidth={isSelected ? 2 : 0}
                      style={{ transition: 'opacity 0.2s' }}
                    />
                    {/* Show window info on selected */}
                    {isSelected && (
                      <g>
                        <rect x={x - 15} y={y - 30} width="80" height="25" fill="#333333" rx="3" />
                        <text x={x + 25} y={y - 15} fontSize="10" fill="#ffffff" textAnchor="middle">
                          {selectedTime.toFixed(2)}s
                        </text>
                        <text x={x + 25} y={y - 3} fontSize="9" fill="#ffffff" textAnchor="middle">
                          {(selectedProb * 100).toFixed(0)}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
              
              {/* X-axis labels (Time in seconds) */}
              {windows.length > 0 && [0, 3, 6, 9].map((sec) => {
                const windowIdx = Math.floor((sec * fps) / stride);
                if (windowIdx < windows.length) {
                  const spacing = 880 / windows.length;
                  const xPos = 60 + spacing * windowIdx + (spacing / 2);
                  return (
                    <g key={`time-${sec}`}>
                      <line x1={xPos} y1="420" x2={xPos} y2="428" stroke="#333333" strokeWidth="1" />
                      <text x={xPos} y="445" fontSize="11" fill="#666666" textAnchor="middle">
                        {sec}s
                      </text>
                    </g>
                  );
                }
                return null;
              })}
              
              {/* X-axis label */}
              <text x="505" y="490" fontSize="12" fill="#666666" textAnchor="middle">
                Time (seconds) - Sliding Windows
              </text>
            </svg>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666666', textAlign: 'center' }}>
              Click bar to jump to window start
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
