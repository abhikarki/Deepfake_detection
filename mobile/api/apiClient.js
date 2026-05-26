import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';

const apiClient = axios.create({
    baseURL: BACKEND_URL,
    timeout: 60000,
});

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


