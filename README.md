# Kairos - Journaling Application with Firebase Backend

A sophisticated journaling application that combines self-reflection with AI insights, featuring user authentication and cloud data storage.

## Features

- **User Authentication**: Secure Firebase Authentication with email/password
- **Cloud Storage**: All journal entries stored securely in Firestore
- **Rich Journaling**: Multi-dimensional entry system covering emotions, physical sensations, thoughts, and insights
- **AI Integration**: Gemini AI for dream analysis and personalized insights
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Copy your Firebase configuration

### 2. Netlify Environment Variables

In your Netlify dashboard (Site Settings → Environment Variables), add:

- **`GEMINI_API_KEY`** - Your Google Gemini API key
  - Used by `netlify/functions/call-gemini.js` via `process.env.GEMINI_API_KEY`
  
- **`FIREBASE_PROJECT_ID`** - Your Firebase project ID  
  - Used by `netlify/functions/firebase-backend.js` via `process.env.FIREBASE_PROJECT_ID`

- **Firebase Admin SDK service account key** (if using Admin SDK features)

### 3. Update Firebase Configuration in Code

Replace the placeholder values in `index.html` around line 114 with your actual Firebase project configuration:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com", 
    projectId: "your-actual-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-actual-sender-id",
    appId: "your-actual-app-id"
};
```

Note: The Firebase client configuration can be public as it's designed to be exposed to the browser. The sensitive keys are handled server-side in Netlify functions.

### 4. Firestore Security Rules

Set up the following security rules in your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Journal entries - users can only access their own entries
    match /journalEntries/{entryId} {
      allow read, write, delete: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.auth.uid != null;
    }
  }
}
```

### 5. Netlify Functions Setup

Your Netlify functions are already configured to access environment variables through `process.env`:

1. **`netlify/functions/call-gemini.js`** - Uses `process.env.GEMINI_API_KEY`
2. **`netlify/functions/firebase-backend.js`** - Uses `process.env.FIREBASE_PROJECT_ID`

Both functions will automatically access these values from Netlify's environment variables when deployed.

### 6. Running the Application

1. Install dependencies: `npm install`
2. Open `index.html` in a web browser or serve via a local server
3. For development with live reload, you can use any static file server

## Project Structure

```
├── index.html                      # Main UI and application logic
├── js/                            # 📁 FRONTEND (Client-side)
│   ├── firebase-config.js         # Firebase initialization & config
│   ├── auth-service.js            # Authentication logic
│   └── journal-service.js         # Journal operations
├── netlify/functions/             # 📁 BACKEND (Server-side)
│   ├── call-gemini.js            # 🤖 LLM API CALLS (uses GEMINI_API_KEY)
│   └── firebase-backend.js       # 🔐 ACCOUNT MANAGEMENT (uses FIREBASE_PROJECT_ID)
└── package.json                   # Dependencies
```

## Feature Location Guide

### 🖥️ Frontend (Client-side)
- **Main UI**: `index.html` - User interface, app state management, and authentication
- **Firebase Config**: `js/firebase-config.js` - Client Firebase auth setup only
- **Auth Services**: `js/auth-service.js` - ⚠️ NOT USED (kept for reference)
- **Journal Services**: `js/journal-service.js` - ⚠️ NOT USED (kept for reference)

### 🔐 Backend (Server-side via Netlify Functions) - **ALL DATABASE OPERATIONS**
- **Account Management**: `netlify/functions/firebase-backend.js`
  - ✅ Uses `process.env.FIREBASE_PROJECT_ID` from Netlify
  - ✅ All CRUD operations (create, read, update, delete entries)
  - ✅ User authentication verification
  - ✅ User data isolation and security
  
### 🤖 LLM API Calls
- **AI Features**: `netlify/functions/call-gemini.js`
  - Uses `process.env.GEMINI_API_KEY` from Netlify
  - Dream analysis, synthesis, advisor features

## Architecture

### Frontend
- Vanilla JavaScript with ES6 modules
- Organized service architecture
- Firebase Web SDK for authentication and Firestore
- Responsive design with Tailwind CSS
- State management through global application state

### Backend
- Netlify Functions for serverless backend operations
- Firebase Admin SDK for secure server-side operations
- CORS-enabled API endpoints

### Database Structure

#### Users
Authentication handled by Firebase Auth. User data includes:
- `uid`: Unique user identifier
- `email`: User's email address
- `displayName`: Optional display name

#### Journal Entries
Stored in Firestore `journalEntries` collection:
```javascript
{
  id: "document-id",
  userId: "user-uid",
  userEmail: "user@example.com",
  title: "Entry title",
  situation: { description: "..." },
  inquiry: { story: "...", emotion: "...", belief: "..." },
  emotional: { emotions: [{ name: "Happy", intensity: 7 }] },
  physical: { sensations: [{ part: "Chest", quality: "Tightness", intensity: 5 }] },
  // ... other sections
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Security 🔒

**✅ Enhanced Server-Side Security Model:**
- **All database operations** happen server-side via `netlify/functions/firebase-backend.js`
- **User authentication verification** on every database request
- **Firebase ID tokens** validated server-side before any operation
- **Zero direct client access** to Firestore database
- **Environment variables** store all sensitive keys in Netlify
- **Firestore security rules** provide additional protection layer
- **Service account keys** never exposed to client or version control

**🛡️ Security Benefits:**
- Prevents client-side database manipulation
- Eliminates exposure of database queries to browser
- Centralized access control and logging
- Protection against malicious client modifications

## Development

### Local Development
1. Use Firebase Emulator Suite for local testing
2. Set `NODE_ENV=development` to connect to emulators
3. Run `firebase emulators:start` to start local Firebase services

### Deployment
1. Build and deploy to Netlify or any static hosting service
2. Ensure environment variables are configured in production
3. Update Firebase configuration for production URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.