import os
import numpy as np
import torch
import torch.nn as nn
from pathlib import Path


class TemporalCNNDetector(nn.Module):    
    def __init__(self, input_size=2048, num_filters=32, kernel_sizes=None, dropout=0.3):
        super().__init__()
        
        if kernel_sizes is None:
            kernel_sizes = [3]
        
        self.conv_branches = nn.ModuleList()
        for kernel_size in kernel_sizes:
            branch = nn.Sequential(
                nn.Conv1d(
                    in_channels=input_size,
                    out_channels=num_filters,
                    kernel_size=kernel_size,
                    stride=1,
                    padding='same'
                ),
                nn.ReLU(),
                nn.BatchNorm1d(num_filters),
                nn.AdaptiveAvgPool1d(1),  # Global average pooling
            )
            self.conv_branches.append(branch)
        
        # Fully connected layers after concatenating multi-scale features
        num_branches = len(kernel_sizes)
        fc_input_size = num_filters * num_branches
        
        self.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(fc_input_size, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, 1),
        )
    
    def forward(self, x):
        # x shape: (batch, input_size, seq_len)
        branch_outputs = []
        for branch in self.conv_branches:
            out = branch(x)  
            out = out.squeeze(-1) 
            branch_outputs.append(out)
        
        combined = torch.cat(branch_outputs, dim=1)  
        logit = self.classifier(combined)  
        return logit.squeeze(1)  


class DeepfakeInference:    
    def __init__(self, model_path, device=None):
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.window_size = 5
        self.stride = 5  # No overlap
        self.fps = 10  # Frame extraction FPS
        
        # Load model
        self.model = TemporalCNNDetector(
            input_size=2048,
            num_filters=64,
            kernel_sizes=[3],
            dropout=0.3
        ).to(self.device)
        
        checkpoint = torch.load(model_path, map_location=self.device)
        self.model.load_state_dict(checkpoint)
        self.model.eval()
    
    def run_inference(self, embeddings, video_filename, total_frames_in_video):
        n_frames = embeddings.shape[0]
        
        window_probs = []
        window_starts = []
        
        with torch.no_grad():
            start = 0
            while start + self.window_size <= n_frames:
                # Extract window and compute differences
                frame_window = embeddings[start:start + self.window_size]  # (window_size, 2048)
                diff_window = np.diff(frame_window, axis=0).astype(np.float32)  # (window_size-1, 2048)
                
                x = torch.tensor(diff_window.T, dtype=torch.float32).unsqueeze(0).to(self.device)
                
                # Get probability
                prob = torch.sigmoid(self.model(x)).item()
                window_probs.append(prob)
                window_starts.append(start)
                
                start += self.stride
        
        # Aggregate window probabilities to video level
        window_probs_array = np.array(window_probs)
        overall_probability = float(np.mean(window_probs_array))
        
        # Find most suspicious window
        most_suspicious_window_idx = int(np.argmax(window_probs_array))
        highest_window_score = float(np.max(window_probs_array))
        most_suspicious_frame = int(window_starts[most_suspicious_window_idx])
        
        # Frame-level probabilities 
        frame_probabilities = np.zeros(n_frames)
        for i, (prob, start) in enumerate(zip(window_probs, window_starts)):
            end = min(start + self.window_size, n_frames)
            frame_probabilities[start:end] = prob
        
        # Metrics
        num_frames_fake = len([p for p in frame_probabilities if p >= 0.5])
        variance = float(np.var(frame_probabilities))
        instability_detected = variance > 0.15
        
        # Verdict
        verdict = 'FAKE' if overall_probability >= 0.5 else 'REAL'
        
        # Generate flagged reasons
        flagged_reasons = []
        window_size_display = self.window_size
        stride_display = self.stride
        
        if highest_window_score > 0.75:
            window_index = most_suspicious_window_idx
            window_start = window_index * stride_display
            window_end = min(window_start + window_size_display - 1, n_frames - 1)
            flagged_reasons.append(
                f"Frame window #{window_start}-{window_end} has high suspicious score ({highest_window_score:.2%})"
            )
        
        if instability_detected:
            flagged_reasons.append(f"Temporal instability detected (variance: {variance:.4f})")
        
        if num_frames_fake > n_frames * 0.35:  # more than 35% flagged
            percentage = (num_frames_fake / n_frames) * 100
            flagged_reasons.append(f"Approximately {percentage:.0f}% of frames flagged as suspicious")
        
        if overall_probability > 0.55:
            flagged_reasons.append("Overall detection confidence is elevated")
        
        # Estimate video duration
        video_duration = n_frames / self.fps
        
        return {
            'video_filename': video_filename,
            'video_name': video_filename,
            'video_duration': f'{video_duration:.2f}',
            'verdict': verdict,
            'overall_probability': overall_probability,
            'most_suspicious_frame': most_suspicious_frame,
            'most_suspicious_time': most_suspicious_frame / self.fps,
            'highest_frame_score': highest_window_score,
            'frame_probabilities': frame_probabilities.tolist(),
            'num_frames_analyzed': n_frames,
            'num_frames_fake': num_frames_fake,
            'fps': self.fps,
            'variance': variance,
            'instability_detected': instability_detected,
            'flagged_reasons': flagged_reasons,
            'total_frames_extracted': total_frames_in_video,
            'faces_detected': n_frames
        }
