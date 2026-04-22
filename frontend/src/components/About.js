import React from 'react';

function About() {
  return (
    <div className="page-container">
      <div className="results-container">
        <h1>Deepfake Detection and Forensic Analysis</h1>
        
        {/* Overview Section */}
        <section style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1rem' }}>What is this?</h2>
          <p style={{ lineHeight: '1.8', color: '#555555', fontSize: '1rem' }}>
            This is a deepfake detection system that analyzes videos to identify signs of manipulation 
            or artificial generation. Using advanced machine learning, the system examines facial features and temporal 
            patterns across video frames to detect potential deepfakes.
          </p>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1rem' }}>How It Works</h2>
          <div style={{ 
            backgroundColor: '#f9f9f9', 
            padding: '1.5rem', 
            borderRadius: '8px',
          }}>
            <ol style={{ lineHeight: '2', color: '#555555', paddingLeft: '1.5rem' }}>
              <li><strong>Normalization:</strong> The system normalizes the vidoes' frame rate, pixel rate, and applies light denoising so that downstream models do not get influenced by compression artifacts.</li>
              <li><strong>Face Detection:</strong> The system detects and extracts faces from each frame of your video</li>
              <li><strong>Feature Extraction:</strong> Deep learning extracts facial features using ResNeXt-50</li>
              <li><strong>Temporal Analysis:</strong> A Temporal CNN model analyzes 5-frame windows to detect temporal inconsistencies between frames.</li>
              <li><strong>Probability Scoring:</strong> Each window receives a deepfake probability score (0-100%)</li>
              <li><strong>Final Verdict:</strong> Results are aggregated to determine if the video is likely authentic or manipulated</li>
            </ol>
          </div>
        </section>

        {/* Understanding Results */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1rem' }}>Understanding Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ 
              backgroundColor: '#e8f5e9', 
              padding: '1.5rem', 
              borderRadius: '8px',
              border: '1px solid #81c784'
            }}>
              <h3 style={{ color: '#408d22', marginBottom: '0.5rem' }}>Low Probability (&lt; 50%)</h3>
              <p style={{ color: '#555555', lineHeight: '1.6' }}>
                <strong>AUTHENTIC:</strong> Video shows characteristics consistent with genuine footage
              </p>
            </div>
            <div style={{ 
              backgroundColor: '#ffebee', 
              padding: '1.5rem', 
              borderRadius: '8px',
              border: '1px solid #ef9a9a'
            }}>
              <h3 style={{ color: '#e53935', marginBottom: '0.5rem' }}>High Probability (&gt; 50%)</h3>
              <p style={{ color: '#555555', lineHeight: '1.6' }}>
                <strong>LIKELY MANIPULATED:</strong> Video shows signs of manipulation or artificial generation
              </p>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1rem' }}>Technical Details</h2>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '1.5rem', 
            borderRadius: '8px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p><strong>Frame Rate:</strong> 10 FPS</p>
                <p><strong>Temporal Window:</strong> 5 frames (~0.5 seconds)</p>
                <p><strong>Model:</strong> Temporal CNN</p>
              </div>
              <div>
                <p><strong>Face Detector:</strong> RetinaFace</p>
                <p><strong>Feature Extractor:</strong> ResNeXt-50</p>
                <p><strong>Detection Method:</strong> Temporal inconsistency analysis</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips for Best Results */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1rem' }}>Tips for Best Results</h2>
          <ul style={{ lineHeight: '2', color: '#555555', paddingLeft: '1.5rem' }}>
            <li>✓ Use clear, well-lit videos with visible faces</li>
            <li>✓ Videos should be 10-30 seconds long for optimal analysis</li>
            <li>✓ Avoid videos with multiple people or extreme angles</li>
            <li>✓ Face should occupy at least 50x50 pixels for reliable detection</li>
            <li>✓ Note: Results are probabilities, not certainties</li>
          </ul>
        </section>

        {/* Limitations */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1a1a1a', marginBottom: '1rem' }}>Limitations</h2>
          <p style={{ lineHeight: '1.8', color: '#666666', marginBottom: '1rem' }}>
            This system is a research tool and should not be used as the sole basis for critical decisions. Known limitations:
          </p>
          <ul style={{ lineHeight: '1.8', color: '#555555', paddingLeft: '1.5rem' }}>
            <li>High-quality AI generated videos may not be reliably detected since the model is trained on videos generated by specific generators (FaceForensics++ dataset).</li>
            <li>False positives can occur with unusual camera angles or compression artifacts</li>
          </ul>
        </section>

        {/* Project Info */}
        <section style={{ 
          backgroundColor: '#f9f9f9', 
          padding: '1.5rem', 
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#1a1a1a', marginBottom: '0.5rem' }}>Senior Capstone Project</h3>
          <p style={{ color: '#666666' }}>
            Built with FastAPI, React, PyTorch, and state-of-the-art computer vision techniques
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
