import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: BACKEND_URL,
    timeout: 60000,
});

// Mock data for testing when backend is unavailable
export const getMockAnalysisData = () => {
    const mockDataOptions = [
        {
            prediction: 'deepfake',
            confidence: 0.87,
            deepfake_probability: 0.87,
            real_probability: 0.13,
            processing_time: 3.45,
            verdict: 'LIKELY MANIPULATED',
            overall_probability: 0.87,
            most_suspicious_frame: 42,
            highest_frame_score: 0.92,
            instability_detected: true,
            num_frames_analyzed: 150,
            flagged_reasons: ['Inconsistent eye movement', 'Temporal artifacts detected', 'Unnatural head rotation']
        },
        {
            prediction: 'real',
            confidence: 0.94,
            deepfake_probability: 0.06,
            real_probability: 0.94,
            processing_time: 2.87,
            verdict: 'AUTHENTIC',
            overall_probability: 0.06,
            most_suspicious_frame: 88,
            highest_frame_score: 0.15,
            instability_detected: false,
            num_frames_analyzed: 150,
            flagged_reasons: []
        },
        {
            prediction: 'deepfake',
            confidence: 0.72,
            deepfake_probability: 0.72,
            real_probability: 0.28,
            processing_time: 3.12,
            verdict: 'LIKELY MANIPULATED',
            overall_probability: 0.72,
            most_suspicious_frame: 65,
            highest_frame_score: 0.89,
            instability_detected: true,
            num_frames_analyzed: 150,
            flagged_reasons: ['Facial feature distortion', 'Blinking pattern anomaly']
        }
    ];
    
    // Return a random mock data
    return mockDataOptions[Math.floor(Math.random() * mockDataOptions.length)];
};

export const uploadVideo = async (videoUri) => {
    try{
        const formData = new FormData();

        const filename = videoUri.split('/').pop();

        formData.append('file', {
            uri: videoUri,
            type: 'video/mp4',
            name: filename,
        });

        const response = await apiClient.post('/predict', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch(error){
        console.error('Upload error: ', error);
        throw error;
    }
};

export const healthCheck = async () => {
    try{
        const response = await apiClient.get('/health');
        return response.data;
    }
    catch(error){
        console.error('Health check error: ', error);
        throw error;
    }
};

export default apiClient;

