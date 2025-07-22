// This file is your secure, server-side function.
// It lives in the folder: netlify/functions/call-gemini.js

// Using node-fetch to make the API call on the server.
// You'll need to add "node-fetch" as a dependency in your project.
// You can do this by running `npm install node-fetch` in your terminal.
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Get the user's prompt and history from the request body sent by the front-end
    const { prompt, history } = JSON.parse(event.body);

    // Securely access the API key from Netlify's environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [...history, { role: "user", parts: [{ text: prompt }] }]
    };

    // Make the actual call to the Gemini API from the server
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // If the API call fails, send back an error
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API call failed with status: ${response.status}` }),
      };
    }

    const result = await response.json();

    // Send the successful result back to the front-end
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error("Error in serverless function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
