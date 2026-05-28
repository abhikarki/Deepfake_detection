import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: BACKEND_URL,
    timeout: 60000,
});

// Mock data for testing when backend is unavailable
export const getMockAnalysisData = () => {
    // Generate frame probabilities - array of probabilities for each frame
    const generateFrameProbs = (trend, length = 150) => {
        const probs = [];
        for (let i = 0; i < length; i++) {
            let prob;
            if (trend === 'deepfake') {
                // High probability with some variation
                prob = 0.6 + Math.random() * 0.35 + (i % 20) * 0.01;
            } else if (trend === 'real') {
                // Low probability with some noise
                prob = 0.1 + Math.random() * 0.25 + (Math.sin(i * 0.2) * 0.1);
            } else {
                // Medium probability
                prob = 0.4 + Math.random() * 0.3 + (Math.cos(i * 0.15) * 0.15);
            }
            probs.push(Math.min(1.0, Math.max(0, prob)));
        }
        return probs;
    };

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
            num_frames_fake: 87,
            frame_probabilities: generateFrameProbs('deepfake'),
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
            num_frames_fake: 9,
            frame_probabilities: generateFrameProbs('real'),
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
            num_frames_fake: 72,
            frame_probabilities: generateFrameProbs('medium'),
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

