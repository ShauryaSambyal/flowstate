import axios from 'axios';

async function test() {
    try {
        const response = await axios.post('http://localhost:8080/ai/suggestions', { prompt: 'Focus' });
        console.log('SUCCESS:', response.data);
    } catch (error) {
        console.error('ERROR:', error.response?.status, error.response?.data || error.message);
    }
}

test();
