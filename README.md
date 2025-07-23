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

### 2. Environment Variables

1. Copy `.env.example` to `.env`
2. Replace the placeholder values with your actual Firebase configuration:

```env
FIREBASE_API_KEY=your-actual-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
FIREBASE_APP_ID=your-actual-app-id
```

### 3. Update Firebase Configuration in Code

Replace the placeholder values in `index.html` around line 112:

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

### 5. Netlify Functions Setup (Optional)

If using Netlify for hosting and the backend function:

1. Set up Firebase Admin SDK service account
2. Add environment variables to Netlify:
   - `FIREBASE_PROJECT_ID`
   - Upload service account key as environment variable

### 6. Running the Application

1. Install dependencies: `npm install`
2. Open `index.html` in a web browser or serve via a local server
3. For development with live reload, you can use any static file server

## Architecture

### Frontend
- Vanilla JavaScript with ES6 modules
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

## Security

- All Firebase operations require user authentication
- Firestore security rules ensure users can only access their own data
- Sensitive configuration stored in environment variables
- Service account keys never committed to version control

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