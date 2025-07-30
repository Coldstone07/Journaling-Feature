# Firebase Backend Setup Guide

## Current Status
✅ **Frontend**: Working with Firebase Authentication  
⚠️ **Backend**: Using localStorage (offline mode)  
🎯 **Goal**: Enable cloud storage with Firestore

## Steps to Enable Cloud Storage

### 1. Generate Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `journaling-8af15`
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **"Generate new private key"**
6. Download the JSON file (keep it secure!)

### 2. Set Up Netlify Environment Variables

Go to your Netlify dashboard → Site settings → Environment variables and add:

**Option A: Using JSON (Recommended)**
```
FIREBASE_PROJECT_ID = journaling-8af15
GOOGLE_APPLICATION_CREDENTIALS_JSON = [paste entire JSON file content]
```

**Option B: Using Individual Variables**
```
FIREBASE_PROJECT_ID = journaling-8af15
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@journaling-8af15.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----
```

### 3. Enable Backend Storage

In `index.html`, find line ~298 and change:
```javascript
// From:
return false;

// To:
return !isLocalDevelopment();
```

### 4. Deploy and Test

1. Deploy to Netlify
2. Test login and journal entry creation
3. Check browser network tab for successful API calls
4. Verify entries persist across sessions

## Firestore Security Rules

Make sure your Firestore has these security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /journalEntries/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Current Storage Details

**Local Storage Location**: Browser localStorage with key `'kairos-local-entries'`
**Cloud Storage**: Firestore collection `'journalEntries'`
**User Isolation**: Each user can only access their own entries via `userId` field

## Troubleshooting

If you see errors after setup:
1. Check Netlify function logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure service account has Firestore permissions
4. Check Firestore security rules allow authenticated access

## Migration Note

Existing localStorage entries won't automatically migrate to Firestore. Users will need to:
- Keep their current entries locally, or
- Manually recreate important entries after cloud storage is enabled