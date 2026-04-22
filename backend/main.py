from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import io
import tempfile
import os
import torch
from datetime import datetime
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from preprocessing import VideoPreprocessor
from inference import DeepfakeInference
from pdf_generator import generate_pdf_report

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_preprocessor = None
_inference_engine = None

def get_preprocessor():
    global _preprocessor
    if _preprocessor is None:
        _preprocessor = VideoPreprocessor()
    return _preprocessor

def get_inference_engine():
    global _inference_engine
    if _inference_engine is None:
        # Get the path to the model
        backend_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(backend_dir, 'temporal_cnn_best.pt')
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model not found at {model_path}")
        
        _inference_engine = DeepfakeInference(model_path)
    return _inference_engine

class ForensicData(BaseModel):
    video_filename: str
    verdict: str
    overall_probability: float
    most_suspicious_frame: int
    highest_frame_score: float
    instability_detected: bool
    frame_probabilities: List[float]
    flagged_reasons: List[str]
    num_frames_analyzed: int

@app.on_event("startup")
def startup_event():
    try:
        print("Initializing preprocessor and inference engine...")
        get_preprocessor()
        get_inference_engine()
        print("Models initialized successfully!")
    except Exception as e:
        print(f"Warning: Could not fully initialize models at startup: {e}")

@app.get("/")
def read_root():
    return {"status": "Deepfake Detection API Running"}

@app.post("/api/analyze")
async def analyze_video(file: UploadFile = File(...)):
    try:
        # Save uploaded file to temporary location
        temp_dir = tempfile.mkdtemp()
        temp_video_path = os.path.join(temp_dir, file.filename)
        
        # Write uploaded file to disk
        contents = await file.read()
        with open(temp_video_path, 'wb') as f:
            f.write(contents)
        
        # Preprocess video
        preprocessor = get_preprocessor()
        embeddings, total_frames = preprocessor.preprocess_video(temp_video_path)
        
        if embeddings is None:
            # Clean up
            os.remove(temp_video_path)
            os.rmdir(temp_dir)
            return {
                "error": f"No faces detected in the video. Processed {total_frames} frames but could not extract face embeddings.",
                "video_filename": file.filename
            }
        
        # Run inference
        inference_engine = get_inference_engine()
        report_data = inference_engine.run_inference(
            embeddings, 
            file.filename,
            total_frames
        )
        
        # Clean up
        os.remove(temp_video_path)
        os.rmdir(temp_dir)
        
        return report_data
        
    except Exception as e:
        # Clean up on error
        try:
            if os.path.exists(temp_video_path):
                os.remove(temp_video_path)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except:
            pass
        
        return {
            "error": str(e),
            "video_filename": file.filename if file else "unknown"
        }

@app.post("/api/report/pdf")
def generate_report_pdf(data: dict):
    pdf_bytes = generate_pdf_report(data)
    
    return StreamingResponse(
        iter([pdf_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=forensic_report.pdf"}
    )

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}
