import numpy as np

def generate_mock_forensic_report(video_name: str):
    pattern = np.random.choice(['authentic', 'subtle_fake', 'moderate_fake', 'obvious_fake', 'edge_case'])
    
    if pattern == 'authentic':
        frame_probs = np.random.uniform(0, 0.15, 300)
        noise_indices = np.random.choice(300, 15, replace=False)
        frame_probs[noise_indices] = np.random.uniform(0.15, 0.35, 15)
        frame_probs = frame_probs.tolist()
        verdict = 'REAL'
    
    elif pattern == 'subtle_fake':
        frame_probs = np.random.uniform(0.2, 0.4, 300)
        suspicious_indices = np.random.choice(300, 20, replace=False)
        frame_probs[suspicious_indices] = np.random.uniform(0.5, 0.7, 20)
        frame_probs = frame_probs.tolist()
        verdict = 'FAKE' if np.mean(frame_probs) > 0.5 else 'REAL'
    
    elif pattern == 'moderate_fake':
        frame_probs = np.random.uniform(0.35, 0.55, 300)
        strong_spikes = np.random.choice(300, 25, replace=False)
        frame_probs[strong_spikes] = np.random.uniform(0.6, 0.8, 25)
        frame_probs = frame_probs.tolist()
        verdict = 'FAKE'
    
    elif pattern == 'obvious_fake':
        frame_probs = np.random.uniform(0.4, 0.7, 300)
        critical_frames = np.random.choice(300, 40, replace=False)
        frame_probs[critical_frames] = np.random.uniform(0.75, 0.95, 40)
        frame_probs = frame_probs.tolist()
        verdict = 'FAKE'
    
    else:  
        # Random mix
        frame_probs = np.random.uniform(0.1, 0.6, 300).tolist()
        verdict = 'FAKE' if np.mean(frame_probs) > 0.35 else 'REAL'
    
    frame_probs_array = np.array(frame_probs)
    frame_probs_array = np.clip(frame_probs_array, 0, 1)
    
    most_suspicious_frame = int(np.argmax(frame_probs_array))
    highest_frame_score = float(np.max(frame_probs_array))
    num_frames_analyzed = 300
    num_frames_fake = len([p for p in frame_probs_array if p >= 0.5])
    overall_probability = float(np.mean(frame_probs_array))
    
    variance = float(np.var(frame_probs_array))
    instability_detected = variance > 0.15
    
    flagged_reasons = []
    if highest_frame_score > 0.75:
        frame_num = most_suspicious_frame
        window_size = 30
        stride = 15
        window_index = frame_num // stride
        window_start = window_index * stride
        window_end = min(window_start + window_size - 1, len(frame_probs_array) - 1)
        flagged_reasons.append(f"Frame window #{window_start}-{window_end} has high suspicious score ({highest_frame_score:.2%})")
    if instability_detected:
        flagged_reasons.append(f"Temporal instability detected (variance: {variance:.4f})")
    if num_frames_fake > 100:
        percentage = (num_frames_fake / num_frames_analyzed) * 100
        flagged_reasons.append(f"Approximately {percentage:.0f}% of frames flagged as suspicious")
    if overall_probability > 0.55:
        flagged_reasons.append("Overall detection confidence is elevated")
    
    return {
        'video_filename': video_name,
        'video_name': video_name,
        'video_duration': '10.00',
        'verdict': verdict,
        'overall_probability': overall_probability,
        'most_suspicious_frame': most_suspicious_frame,
        'most_suspicious_time': most_suspicious_frame / 30.0,
        'highest_frame_score': highest_frame_score,
        'frame_probabilities': frame_probs_array.tolist(),
        'num_frames_analyzed': num_frames_analyzed,
        'num_frames_fake': num_frames_fake,
        'fps': 30,
        'variance': variance,
        'instability_detected': instability_detected,
        'flagged_reasons': flagged_reasons
    }
