// Firebase Backend for Journaling Feature (Netlify Function)
// Uses Firebase Admin SDK for secure server-side access

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Only initialize once (for hot reloads in dev)
let app;
if (!global._firebaseApp) {
  app = initializeApp({
    credential: applicationDefault(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  global._firebaseApp = app;
} else {
  app = global._firebaseApp;
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
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7);
    try {
      const decoded = await auth.verifyIdToken(idToken);
      userId = decoded.uid;
    } catch (err) {
      return { 
        statusCode: 401, 
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid or expired token.' }) 
      };
    }
  } else {
    return { 
      statusCode: 401, 
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Missing Authorization Bearer token.' }) 
    };
  }

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