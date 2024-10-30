const express = require('express');
const axios = require('axios');
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors({
    origin: ['https://turbowarp.org', 'https://penguinmod.com', 'https://vercel.app']
}));

// External API URLs
const CHAT_API_URL = 'https://penguinai.milosantos.com/v1/chat/completions';
const IMAGE_API_URL = 'https://penguinai.milosantos.com/v1/images/generations';
const FILE_API_URL = 'https://api.imgbb.com/1/upload';
const IMGBB_API_KEY = '3c52e4fe8eb291af1d1dc7407a20cfd4';

// Middleware to parse JSON bodies
app.use(express.json());
app.get('/', (req, res) => {
   res.json({"message": ":3 My API for PenguinAI"}) 
});
app.get('/v1', (req, res) => {
    res.json({"message": "Welcome to PenguinAI's new API! Contact Connor if there are downtimes."});
});

// Route to send a POST request to the chat completions API
app.post('/v1/chat/completions', async (req, res) => {
    try {
        const response = await axios.post(
            CHAT_API_URL, req.body, {
                headers: {
                    'Authorization': 'Bearer PenguinAI'
                }
            }
        );
        res.json(response.data); // Use response.data for proper JSON content
    } catch (error) {
        console.error(error.response?.data || error.message);
        // Send detailed error information to the client
        res.status(500).json({
            message: "Error with API",
            details: error.response?.data || error.message,
        });
    }
});

// Route to send a POST request to the image generation API
app.post('/v1/images/generations', async (req, res) => {
    try {
        const response = await axios.post(
            IMAGE_API_URL, req.body, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer PenguinAI'
                }
            }
        );
        const { created, id, usage, data } = response.data;
        
        // Upload the generated image to ImgBB
        const formData = new FormData();
        formData.append('image', data[0].url);
        const uploadResponse = await axios.post(`${FILE_API_URL}?key=${IMGBB_API_KEY}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        const imageUrl = uploadResponse.data.data.url;

        res.json({
            "created": created,
            "data": [{
                "b64_json": null,
                "url": imageUrl
            }],
            "id": id,
            "object": "image.generation",
            "usage": usage
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        // Send detailed error information to the client
        res.status(500).json({
            message: "Error with API",
            details: error.response?.data || error.message,
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
}); 
