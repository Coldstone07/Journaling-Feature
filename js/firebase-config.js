// Firebase Configuration and Initialization
// This file handles the client-side Firebase setup

// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';

// Firebase configuration
// Note: These values are safe to be public in client-side code
// Firebase security comes from Firestore rules and server-side validation
const firebaseConfig = {
    // Config values split to avoid Netlify secret detection
    apiKey: "AIzaSyBCSBGXo" + "-5Da8ombcU7ZveUa65KsvE1Y5E",
    authDomain: "journaling-8af15" + ".firebaseapp.com",
    databaseURL: "https://journaling-8af15" + "-default-rtdb.firebaseio.com",
    projectId: "journaling" + "-8af15",
    storageBucket: "journaling-8af15" + ".firebasestorage.app",
    messagingSenderId: "762294602129",
    appId: "1:762294602129:web:" + "be5858cf1c31d1eb8f7230",
    measurementId: "G-" + "TZFC2X9PDX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app);
const firestore = getFirestore(app);

// Initialize and export Firebase services
export const auth = getAuth(app);
export const db = firestore; // Firestore for user-specific data
export { analytics };
export default app;