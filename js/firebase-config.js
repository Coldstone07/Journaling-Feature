// Firebase Configuration and Initialization
// This file handles the client-side Firebase setup

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Firebase configuration - Replace with your actual Firebase project values
// Note: These values can be public as they're designed for client-side use
const firebaseConfig = {
    apiKey: FIREBASE_API_KEY, // Replace with your actual API key
    authDomain: FIREBASE_AUTH_DOMAIN, 
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services
export const auth = getAuth(app);
// Note: db operations handled server-side via netlify/functions/firebase-backend.js
// export const db = getFirestore(app); // Not needed with backend approach
export default app;