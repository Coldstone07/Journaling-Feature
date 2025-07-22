// A robust, secure Netlify serverless function to act as a proxy to the Google Gemini API.
// This function handles different types of requests (text vs. structured JSON)
// and ensures the API key is never exposed to the client.

// IMPORTANT: This uses node-fetch version 2. To use it, you must have "node-fetch": "^2.6.7" in your package.json
// and run `npm install`.
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // 1. --- Security and Pre-flight Checks ---
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Get the Gemini API key from Netlify's environment variables.
    // NEVER hardcode the API key here.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'API key not found. Please set GEMINI_API_KEY environment variable in Netlify.' }),
        };
    }

    // 2. --- Parse Incoming Request ---
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON in request body.' }),
        };
    }
    
    const { prompt, structured } = body;

    if (!prompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing "prompt" in request body.' }),
        };
    }

    // 3. --- Construct the Gemini API Payload ---
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // The payload structure for the Gemini API
    const geminiPayload = {
        contents: [{
            role: "user",
            parts: [{ text: prompt }]
        }],
        generationConfig: {}
    };

    // If the client requests a structured JSON response, add the necessary config.
    if (structured) {
        geminiPayload.generationConfig.responseMimeType = "application/json";
    }

    // 4. --- Make the API Call to Gemini ---
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geminiPayload),
        });

        if (!response.ok) {
            // If Gemini API returns an error, forward that information.
            const errorBody = await response.text();
            console.error('Gemini API Error:', errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to fetch from Gemini API.', details: errorBody }),
            };
        }

        const data = await response.json();

        // 5. --- Process and Return the Response ---
        // Extract the core content from Gemini's verbose response structure.
        const candidate = data.candidates?.[0];
        const contentPart = candidate?.content?.parts?.[0];
        
        if (!contentPart) {
             throw new Error("Invalid response structure from Gemini API.");
        }

        // If we expect JSON, parse it before sending. Otherwise, send the text directly.
        const responseBody = structured ? JSON.parse(contentPart.text) : { text: contentPart.text };

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(responseBody),
        };

    } catch (error) {
        console.error('Error in Netlify function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
