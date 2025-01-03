const express = require('express');
const axios = require('axios');
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors())

// External API URLs
let CHAT_API_URL = 'https://api.penguinai.tech/v1/chat/completions';
let IMAGE_API_URL = 'https://api.penguinai.tech/v1/images/generations';
let MODEL_API_URL = 'https://api.penguinai.tech/v1/models';
let CHECK_API_URL = 'https://api.penguinai.tech/v1/api/working?model=';
let FILE_API_URL = 'https://api.imgbb.com/1/upload';
let IMGBB_API_KEY = '3c52e4fe8eb291af1d1dc7407a20cfd4';

// Middleware to parse JSON bodies
app.use(express.json());
app.get('/', (req, res) => {
   res.json({"message": ":3 My API for PenguinAI"}) 
});
app.get('/v1', (req, res) => {
    res.json({"message": "Welcome to PenguinAI's new API! Contact Connor if there are downtimes."});
});

app.get('/v1/models', async (req, res) => {
    const response = await axios.get(MODEL_API_URL);
    res.json(response.data);
})

app.get('/v1/api/working', async (req, res) => {
    if (CHECK_API_URL != false) {
        const response = await axios.get(CHECK_API_URL + String(req.query.model))
        res.send(response.data)
    } else {
        res.send("rework")
    }
})

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
