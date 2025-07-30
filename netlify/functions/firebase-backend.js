// Firebase Backend for Journaling Feature (Netlify Function)
// Uses Firebase Admin SDK for secure server-side access

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Only initialize once (for hot reloads in dev)
let app;
if (!global._firebaseApp) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    console.log('Project ID from env:', process.env.FIREBASE_PROJECT_ID);
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('FIREBASE') || key.includes('GOOGLE')));
    
    const projectId = process.env.FIREBASE_PROJECT_ID || 'journaling-8af15';
    console.log('Using project ID:', projectId);
    
    let credential;
    
    // Method 1: Try using individual environment variables (Recommended for Netlify)
    if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY_ID) {
      console.log('🔑 Using service account credentials from individual env vars');
      console.log('Client email:', process.env.FIREBASE_CLIENT_EMAIL);
      console.log('Private key ID:', process.env.FIREBASE_PRIVATE_KEY_ID);
      console.log('Private key length:', process.env.FIREBASE_PRIVATE_KEY.length);
      
      try {
        credential = cert({
          projectId: projectId,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
        });
        console.log('✅ Certificate created successfully from individual vars');
      } catch (certError) {
        console.error('❌ Failed to create certificate from individual vars:', certError.message);
        throw new Error(`Failed to create Firebase certificate: ${certError.message}`);
      }
    }
    // Method 2: Try using service account JSON from environment (fallback)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      console.log('🔑 Using service account credentials from JSON env var (fallback)');
      console.log('JSON length:', process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON.length);
      
      try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        console.log('✅ JSON parsed successfully');
        credential = cert(serviceAccount);
        console.log('✅ Certificate created successfully from JSON');
      } catch (jsonError) {
        console.error('❌ Failed to parse service account JSON:', jsonError.message);
        throw new Error(`Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format: ${jsonError.message}`);
      }
    }
    // Method 3: Try application default credentials (works in Google Cloud environments)
    else {
      console.log('🔑 Attempting to use application default credentials');
      console.log('⚠️ No Firebase credentials found in environment variables');
      console.log('Available vars:', Object.keys(process.env).filter(key => key.includes('FIREBASE') || key.includes('GOOGLE')));
      credential = applicationDefault();
    }
    
    app = initializeApp({
      credential: credential,
      projectId: projectId,
    });
    
    global._firebaseApp = app;
    console.log('✅ Firebase Admin SDK initialized successfully with project:', projectId);
    
  } catch (initError) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', {
      message: initError.message,
      code: initError.code,
      stack: initError.stack,
      availableEnvVars: Object.keys(process.env).filter(key => key.includes('FIREBASE') || key.includes('GOOGLE')),
      hasCredentialsJson: !!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
      hasIndividualCreds: !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
    });
    throw initError;
  }
} else {
  app = global._firebaseApp;
  console.log('♻️ Using existing Firebase Admin SDK instance');
}

// Set CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

const db = getFirestore(app);
const auth = getAuth(app);

// Helper: Parse JSON safely
function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// --- Journal Entry Class ---
class JournalEntry {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId;
    this.title = data.title || '';
    this.content = data.content;
    this.voiceTranscription = data.voiceTranscription || null;
    this.emotionalAnalysis = data.emotionalAnalysis || {};
    this.aiInsights = data.aiInsights || {};
    this.synchronicityTags = data.synchronicityTags || [];
    this.shadowWorkPrompts = data.shadowWorkPrompts || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
    this.mood = data.mood || null;
    this.themes = data.themes || [];
    this.triggers = data.triggers || [];
  }
}

// --- Handler ---
exports.handler = async function(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Parse request
  const body = safeJsonParse(event.body);
  if (!body || !body.action) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing or invalid request body.' }),
    };
  }

  // Auth: Expect Firebase ID token in Authorization header
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  let userId = null;
  
  console.log('=== NETLIFY FUNCTION AUTH DEBUG ===');
  console.log('Auth header present:', !!authHeader);
  console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('Request method:', event.httpMethod);
  console.log('Request path:', event.path);
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('FIREBASE')));
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7);
    console.log('Token length:', idToken.length);
    console.log('Token preview:', idToken.substring(0, 20) + '...');
    
    try {
      console.log('🔍 Attempting token verification...');
      const decoded = await auth.verifyIdToken(idToken);
      userId = decoded.uid;
      console.log('✅ Token verified successfully for user:', userId);
      console.log('Token issued at:', new Date(decoded.iat * 1000));
      console.log('Token expires at:', new Date(decoded.exp * 1000));
    } catch (err) {
      console.error('❌ Token verification failed:', {
        code: err.code,
        message: err.message,
        stack: err.stack,
        tokenLength: idToken.length,
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      return { 
        statusCode: 401, 
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'Invalid or expired token.',
          details: err.message,
          code: err.code,
          debug: {
            hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
            tokenLength: idToken.length
          }
        }) 
      };
    }
  } else {
    console.error('❌ Missing or malformed authorization header');
    console.log('Headers received:', Object.keys(event.headers));
    return { 
      statusCode: 401, 
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Missing Authorization Bearer token.',
        debug: {
          hasAuthHeader: !!authHeader,
          authHeaderValue: authHeader ? authHeader.substring(0, 20) + '...' : null
        }
      }) 
    };
  }
  
  console.log('===================================');

  // --- Actions ---
  try {
    switch (body.action) {
      case 'createEntry': {
        const entry = new JournalEntry({ ...body.data, userId, createdAt: new Date(), updatedAt: new Date() });
        const docRef = await db.collection('journalEntries').add({ ...entry });
        return { 
          statusCode: 200, 
          headers: corsHeaders,
          body: JSON.stringify({ id: docRef.id, ...entry }) 
        };
      }
      case 'updateEntry': {
        const { entryId, updateData } = body.data;
        const entryRef = db.collection('journalEntries').doc(entryId);
        await entryRef.update({ ...updateData, updatedAt: new Date() });
        const updated = await entryRef.get();
        return { 
          statusCode: 200, 
          headers: corsHeaders,
          body: JSON.stringify({ id: entryId, ...updated.data() }) 
        };
      }
      case 'getEntry': {
        const { entryId } = body.data;
        const entryRef = db.collection('journalEntries').doc(entryId);
        const snap = await entryRef.get();
        if (!snap.exists) return { 
          statusCode: 404, 
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not found' }) 
        };
        const data = snap.data();
        if (data.userId !== userId) return { 
          statusCode: 403, 
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unauthorized' }) 
        };
        return { 
          statusCode: 200, 
          headers: corsHeaders,
          body: JSON.stringify({ id: entryId, ...data }) 
        };
      }
      case 'getUserEntries': {
        const limitCount = body.data?.limit || 50;
        const q = db.collection('journalEntries').where('userId', '==', userId).orderBy('createdAt', 'desc').limit(limitCount);
        const snap = await q.get();
        const entries = [];
        snap.forEach(doc => entries.push({ id: doc.id, ...doc.data() }));
        return { 
          statusCode: 200, 
          headers: corsHeaders,
          body: JSON.stringify(entries) 
        };
      }
      case 'deleteEntry': {
        const { entryId } = body.data;
        const entryRef = db.collection('journalEntries').doc(entryId);
        const snap = await entryRef.get();
        if (!snap.exists) return { 
          statusCode: 404, 
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Not found' }) 
        };
        if (snap.data().userId !== userId) return { 
          statusCode: 403, 
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unauthorized' }) 
        };
        await entryRef.delete();
        return { 
          statusCode: 200, 
          headers: corsHeaders,
          body: JSON.stringify({ success: true }) 
        };
      }
      default:
        return { 
          statusCode: 400, 
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unknown action.' }) 
        };
    }
  } catch (err) {
    console.error('Firebase backend error:', err);
    return { 
      statusCode: 500, 
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message }) 
    };
  }
}; 