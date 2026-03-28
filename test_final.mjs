import axios from 'axios';

async function test() {
    try {
        console.log('Sending request to /ai/suggestions...');
        const response = await axios.post('http://localhost:8080/ai/suggestions', { prompt: 'Study HTML' });
        console.log('SUCCESS:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('ERROR:', error.response?.status, JSON.stringify(error.response?.data || error.message, null, 2));
    }
}

test();
