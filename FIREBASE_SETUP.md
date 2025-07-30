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

⚠️ **IMPORTANT**: Copy the JSON content exactly as-is, including all quotes and brackets.

1. Open the downloaded JSON file in a text editor
2. Select ALL content (Ctrl+A) 
3. Copy it (Ctrl+C)
4. In Netlify environment variables, add:

```
FIREBASE_PROJECT_ID = journaling-8af15
GOOGLE_APPLICATION_CREDENTIALS_JSON = [paste ENTIRE JSON content here - should start with { and end with }]
```

**Example of correct JSON format:**
```json
{
  "type": "service_account",
  "project_id": "journaling-8af15",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@journaling-8af15.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
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

### Common Issues:

**1. "Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format" Error**
- ❌ JSON was not copied correctly 
- ✅ Re-copy the ENTIRE JSON file content (including { and })
- ✅ Make sure no extra spaces or characters were added
- ✅ Verify the JSON is valid by pasting it into a JSON validator

**2. "502 Bad Gateway" Error**
- Usually means the Netlify function crashed during initialization
- Check Netlify function logs for specific error details
- Redeploy after fixing environment variables

**3. "401 Unauthorized" Errors**
- Environment variables not set correctly
- Service account doesn't have proper permissions
- Check Firestore security rules

### Debugging Steps:
1. Check Netlify function logs for detailed error messages
2. Verify environment variables are set correctly
3. Ensure service account has Firestore permissions  
4. Check Firestore security rules allow authenticated access
5. Try redeploying after setting environment variables

### Quick Test:
After setting up, try logging in and creating a journal entry. Check the browser's Network tab for the API call to `/firebase-backend` - it should return 200 instead of 502.

## Migration Note

Existing localStorage entries won't automatically migrate to Firestore. Users will need to:
- Keep their current entries locally, or
- Manually recreate important entries after cloud storage is enabled