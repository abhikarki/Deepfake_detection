import os
import cv2
import numpy as np
import torch
import torchvision.transforms as transforms
from torchvision.models import resnext50_32x4d
from retinaface import RetinaFace
import subprocess
import tempfile
import shutil


class VideoPreprocessor:
    def __init__(self, fps=10, face_size=(224, 224)):
        self.fps = fps
        self.face_size = face_size
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load ResNeXt-50 for feature extraction
        resnext = resnext50_32x4d(pretrained=True)
        self.feature_extractor = torch.nn.Sequential(*list(resnext.children())[:-1])
        self.feature_extractor = self.feature_extractor.to(self.device)
        self.feature_extractor.eval()
        
        # ImageNet normalization
        self.transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize(face_size),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def extract_frames_ffmpeg(self, video_path):
        temp_dir = tempfile.mkdtemp()
        output_pattern = os.path.join(temp_dir, 'frame_%04d.png')
        
        cmd = [
            'ffmpeg', '-i', video_path,
            '-vf', f'fps={self.fps},hqdn3d=1.5:1.5:6:6',  # fps + light denoise
            '-pix_fmt', 'rgb24',
            '-q:v', '2',
            output_pattern,
            '-loglevel', 'error'
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            shutil.rmtree(temp_dir)
            raise RuntimeError(f"FFmpeg failed to extract frames: {e}")
        
        frames = []
        frame_files = sorted(os.listdir(temp_dir))
        for fname in frame_files:
            if fname.endswith('.png'):
                fpath = os.path.join(temp_dir, fname)
                frame = cv2.imread(fpath)
                if frame is not None:
                    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    frames.append(frame)
        
        shutil.rmtree(temp_dir)
        return frames
    
    def detect_and_align_face(self, frame):
        try:
            faces = RetinaFace.detect_faces(frame)
            if not isinstance(faces, dict) or len(faces) == 0:
                return None
            
            # Take the face with highest confidence
            best_face = max(faces.values(), key=lambda x: x['score'])
            
            # Get landmarks (left eye, right eye, nose, left mouth, right mouth)
            landmarks = best_face['landmarks']
            left_eye = np.array(landmarks['left_eye'])
            right_eye = np.array(landmarks['right_eye'])
            
            # Compute angle for alignment
            dy = right_eye[1] - left_eye[1]
            dx = right_eye[0] - left_eye[0]
            angle = np.degrees(np.arctan2(dy, dx))
            
            # Bounding box crop
            bbox = best_face['facial_area']
            x1, y1, x2, y2 = bbox
            
            # Add margin around face
            margin = int(0.2 * max(x2 - x1, y2 - y1))
            h, w = frame.shape[:2]
            x1 = max(0, x1 - margin)
            y1 = max(0, y1 - margin)
            x2 = min(w, x2 + margin)
            y2 = min(h, y2 + margin)
            
            face_crop = frame[y1:y2, x1:x2]
            if face_crop.size == 0:
                return None
            
            # Rotate for alignment
            center = (face_crop.shape[1] // 2, face_crop.shape[0] // 2)
            rot_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            aligned = cv2.warpAffine(face_crop, rot_matrix, 
                                      (face_crop.shape[1], face_crop.shape[0]))
            
            # Resize to target
            aligned = cv2.resize(aligned, self.face_size)
            return aligned
            
        except Exception:
            return None
    
    def extract_embedding(self, face_img):
        tensor = self.transform(face_img).unsqueeze(0).to(self.device)
        with torch.no_grad():
            embedding = self.feature_extractor(tensor)
        return embedding.squeeze().cpu().numpy()  # shape: (2048,)
    
    def preprocess_video(self, video_path):
        frames = self.extract_frames_ffmpeg(video_path)
        if len(frames) == 0:
            return None, 0
        
        # Extract embeddings
        embeddings = []
        for frame in frames:
            face = self.detect_and_align_face(frame)
            if face is None:
                continue
            embedding = self.extract_embedding(face)
            embeddings.append(embedding)
        
        if len(embeddings) == 0:
            return None, len(frames)
        
        return np.array(embeddings), len(frames)  # shape: (num_frames, 2048)
