# Running Kairos Journaling App Locally

## Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 8080
```
Then open: http://localhost:8080

## Option 2: Node.js HTTP Server
```bash
npx http-server -p 8080 -o
```
Then open: http://localhost:8080

## Option 3: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Option 4: Simple Browser Opening
Just double-click `index.html` to open in your default browser.

## Important Notes for Local Development:

### 🔥 Firebase Configuration
The app is already configured with Firebase and should work locally. The Firebase config in `js/firebase-config.js` is set up for the project.

### 🌐 Backend Functions (Netlify Functions)
- The app uses Netlify Functions for backend operations
- In local development, these functions won't be available
- The app will gracefully fall back to mock data
- You'll see console warnings about backend not being available - this is normal for local development

### 📱 Features Available Locally:
- ✅ User authentication (login/register)
- ✅ UI and navigation
- ✅ Journal entry creation interface
- ✅ All frontend features and animations
- ⚠️ Data persistence (will use mock data)
- ⚠️ AI features (will show mock responses)

### 🚀 For Full Functionality:
To test the complete app with database and AI features, you'll need to:
1. Deploy to Netlify
2. Set up environment variables (GEMINI_API_KEY, FIREBASE_PROJECT_ID)
3. Configure Firebase project settings

### 🎯 Quick Start:
1. Run one of the server options above
2. Open http://localhost:8080
3. Create an account or log in
4. Explore the journaling features!

The app will work beautifully for UI/UX testing and development. 