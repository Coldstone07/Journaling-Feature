# Migration Implementation Examples

## Quick Start Examples

### 1. Environment Configuration

Create a `.env.local` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service role key for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Update your configuration files:

```javascript
// config/supabase.js
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
};

// Validate configuration
if (!supabaseConfig.url || !supabaseConfig.anonKey) {
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}
```

### 2. Replace Firebase Auth in Your Components

**Before (Firebase):**
```javascript
// login.js
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase-config.js';

async function handleLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in:', userCredential.user);
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

**After (Supabase):**
```javascript
// login.js
import authService from './supabase-auth-service.js';

async function handleLogin(email, password) {
  try {
    const { user, session, error } = await authService.signIn(email, password);
    if (error) {
      console.error('Login error:', error);
      return;
    }
    console.log('User logged in:', user);
  } catch (error) {
    console.error('Login error:', error.message);
  }
}
```

### 3. Replace Firebase Database Operations

**Before (Firebase/Firestore):**
```javascript
// journal-operations.js
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase-config.js';

async function createJournalEntry(entryData) {
  try {
    const docRef = await addDoc(collection(db, 'journalEntries'), {
      ...entryData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return { id: docRef.id, ...entryData };
  } catch (error) {
    console.error('Error creating entry:', error);
    throw error;
  }
}

async function getUserEntries(userId) {
  try {
    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting entries:', error);
    throw error;
  }
}
```

**After (Supabase):**
```javascript
// journal-operations.js
import databaseService from './supabase-database-service.js';

async function createJournalEntry(entryData) {
  try {
    const result = await databaseService.createEntry(entryData);
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  } catch (error) {
    console.error('Error creating entry:', error.message);
    throw error;
  }
}

async function getUserEntries() {
  try {
    const result = await databaseService.getUserEntries({ limit: 50 });
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  } catch (error) {
    console.error('Error getting entries:', error.message);
    throw error;
  }
}
```

### 4. Update Authentication State Management

**Before (Firebase):**
```javascript
// auth-state.js
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase-config.js';

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log('User is signed in:', user.uid);
    updateUI(true);
  } else {
    console.log('User is signed out');
    updateUI(false);
  }
});

function getCurrentUser() {
  return currentUser;
}
```

**After (Supabase):**
```javascript
// auth-state.js
import authService from './supabase-auth-service.js';

let currentUser = null;
let currentSession = null;

// Set up authentication state listener
const { unsubscribe } = authService.onAuthStateChange((user, event, session) => {
  currentUser = user;
  currentSession = session;
  
  if (user) {
    console.log('User is signed in:', user.id);
    updateUI(true);
  } else {
    console.log('User is signed out');
    updateUI(false);
  }
});

function getCurrentUser() {
  return currentUser;
}

function getCurrentSession() {
  return currentSession;
}

// Clean up listener when needed
function cleanupAuthListener() {
  unsubscribe();
}
```

### 5. API Endpoint Migration (Netlify Functions)

**Before (Firebase Admin):**
```javascript
// netlify/functions/api.js
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

const app = initializeApp();
const db = getFirestore(app);
const auth = getAuth(app);

exports.handler = async (event) => {
  try {
    // Verify Firebase ID token
    const idToken = event.headers.authorization?.replace('Bearer ', '');
    const decodedToken = await auth.verifyIdToken(idToken);
    const userId = decodedToken.uid;
    
    // Firestore operations
    const entriesSnapshot = await db.collection('journalEntries')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
      
    const entries = entriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify(entries)
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' })
    };
  }
};
```

**After (Supabase):**
```javascript
// netlify/functions/api.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event) => {
  try {
    // Verify Supabase JWT token
    const jwt = event.headers.authorization?.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }
    
    // Supabase operations with RLS automatically applying
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message })
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(entries)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' })
    };
  }
};
```

### 6. Real-time Updates Migration

**Before (Firebase):**
```javascript
// real-time-listener.js
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase-config.js';

let unsubscribe = null;

function subscribeToUserEntries(userId, callback) {
  const q = query(
    collection(db, 'journalEntries'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  unsubscribe = onSnapshot(q, (querySnapshot) => {
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    callback(entries);
  }, (error) => {
    console.error('Real-time listener error:', error);
  });
}

function unsubscribeFromEntries() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
```

**After (Supabase):**
```javascript
// real-time-listener.js
import databaseService from './supabase-database-service.js';

let subscription = null;

function subscribeToUserEntries(callback) {
  // Subscribe to real-time changes
  subscription = databaseService.subscribeToUserEntries((payload) => {
    console.log('Real-time update:', payload.event, payload.new);
    
    // Handle different event types
    switch (payload.event) {
      case 'INSERT':
        callback({ type: 'added', entry: payload.new });
        break;
      case 'UPDATE':
        callback({ type: 'modified', entry: payload.new });
        break;
      case 'DELETE':
        callback({ type: 'removed', entry: payload.old });
        break;
    }
  });
}

function unsubscribeFromEntries() {
  if (subscription) {
    subscription.unsubscribe();
    subscription = null;
  }
}
```

### 7. Search Implementation

**Before (Firebase - Client-side filtering):**
```javascript
// search.js
async function searchEntries(userId, searchTerm) {
  try {
    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const allEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Client-side filtering (not efficient for large datasets)
    return allEntries.filter(entry => 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}
```

**After (Supabase - Server-side search):**
```javascript
// search.js
import databaseService from './supabase-database-service.js';

async function searchEntries(searchTerm) {
  try {
    // Use full-text search for better performance
    const result = await databaseService.fullTextSearch(searchTerm, { limit: 50 });
    
    if (!result.success) {
      console.error('Search error:', result.error);
      return [];
    }
    
    return result.data;
  } catch (error) {
    console.error('Search error:', error.message);
    return [];
  }
}

// Advanced search with filters
async function advancedSearch(searchTerm, filters = {}) {
  try {
    let result;
    
    if (filters.mood) {
      result = await databaseService.getEntriesByMood(filters.mood);
    } else if (filters.themes) {
      result = await databaseService.getEntriesByThemes(filters.themes);
    } else if (filters.dateRange) {
      result = await databaseService.getEntriesByDateRange(
        filters.dateRange.start,
        filters.dateRange.end
      );
    } else {
      result = await databaseService.fullTextSearch(searchTerm);
    }
    
    return result.success ? result.data : [];
  } catch (error) {
    console.error('Advanced search error:', error.message);
    return [];
  }
}
```

### 8. Error Handling Improvements

**Before (Firebase):**
```javascript
// error-handling.js
function handleFirebaseError(error) {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'permission-denied':
      return 'You do not have permission to access this data.';
    default:
      return 'An unexpected error occurred.';
  }
}
```

**After (Supabase):**
```javascript
// error-handling.js
function handleSupabaseError(error) {
  // Supabase auth service already transforms errors to user-friendly messages
  if (error.originalError) {
    console.error('Original error:', error.originalError);
  }
  
  // Additional context-specific handling
  if (error.message.includes('network')) {
    return 'Please check your internet connection and try again.';
  }
  
  if (error.message.includes('rate limit')) {
    return 'Too many requests. Please wait a moment before trying again.';
  }
  
  return error.message || 'An unexpected error occurred.';
}

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  if (event.reason?.message?.includes('supabase')) {
    // Show user-friendly error message
    showErrorToast('Something went wrong. Please try again.');
    event.preventDefault();
  }
});
```

### 9. Data Migration Script

Create a data migration script to transfer existing Firebase data:

```javascript
// scripts/migrate-data.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import { TypeTransformers } from '../js/types.js';

// Firebase config (your existing config)
const firebaseConfig = {
  // ... your Firebase config
};

// Supabase config
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Use service role key for admin operations

const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateJournalEntries() {
  try {
    console.log('Starting journal entries migration...');
    
    // Get all Firebase documents
    const entriesSnapshot = await getDocs(collection(firestore, 'journalEntries'));
    const firebaseEntries = [];
    
    entriesSnapshot.forEach((doc) => {
      firebaseEntries.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`Found ${firebaseEntries.length} entries to migrate`);
    
    // Transform and insert into Supabase
    let migrated = 0;
    let errors = 0;
    
    for (const firebaseEntry of firebaseEntries) {
      try {
        // Transform Firebase document to Supabase format
        const supabaseEntry = TypeTransformers.firebaseToSupabase(firebaseEntry);
        
        // Insert into Supabase
        const { data, error } = await supabase
          .from('journal_entries')
          .insert([supabaseEntry])
          .select();
        
        if (error) {
          console.error(`Error migrating entry ${firebaseEntry.id}:`, error);
          errors++;
        } else {
          migrated++;
          if (migrated % 10 === 0) {
            console.log(`Migrated ${migrated}/${firebaseEntries.length} entries`);
          }
        }
      } catch (error) {
        console.error(`Error processing entry ${firebaseEntry.id}:`, error);
        errors++;
      }
    }
    
    console.log(`Migration completed: ${migrated} successful, ${errors} errors`);
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration
migrateJournalEntries();
```

### 10. Testing Your Migration

Create comprehensive tests to verify the migration:

```javascript
// tests/migration-tests.js
import authService from '../js/supabase-auth-service.js';
import databaseService from '../js/supabase-database-service.js';

// Test authentication
async function testAuthentication() {
  console.log('Testing authentication...');
  
  try {
    // Test signup
    const signupResult = await authService.signUp('test@example.com', 'password123');
    console.log('✓ Signup works:', !!signupResult.user);
    
    // Test signin
    const signinResult = await authService.signIn('test@example.com', 'password123');
    console.log('✓ Signin works:', !!signinResult.user);
    
    // Test get user
    const user = await authService.getUser();
    console.log('✓ Get user works:', !!user);
    
    // Test signout
    await authService.signOut();
    const userAfterSignout = await authService.getUser();
    console.log('✓ Signout works:', !userAfterSignout);
    
  } catch (error) {
    console.error('✗ Authentication test failed:', error.message);
  }
}

// Test database operations
async function testDatabaseOperations() {
  console.log('Testing database operations...');
  
  try {
    // Sign in first
    await authService.signIn('test@example.com', 'password123');
    
    // Test create entry
    const createResult = await databaseService.createEntry({
      title: 'Test Entry',
      content: 'This is a test journal entry for migration testing.',
      mood: 'good',
      themes: ['testing', 'migration']
    });
    console.log('✓ Create entry works:', createResult.success);
    
    const entryId = createResult.data?.id;
    
    // Test get entry
    const getResult = await databaseService.getEntry(entryId);
    console.log('✓ Get entry works:', getResult.success);
    
    // Test update entry
    const updateResult = await databaseService.updateEntry(entryId, {
      title: 'Updated Test Entry',
      mood: 'excellent'
    });
    console.log('✓ Update entry works:', updateResult.success);
    
    // Test get user entries
    const userEntriesResult = await databaseService.getUserEntries();
    console.log('✓ Get user entries works:', userEntriesResult.success);
    
    // Test search
    const searchResult = await databaseService.searchEntries('test');
    console.log('✓ Search works:', searchResult.success);
    
    // Test delete entry
    const deleteResult = await databaseService.deleteEntry(entryId);
    console.log('✓ Delete entry works:', deleteResult.success);
    
  } catch (error) {
    console.error('✗ Database test failed:', error.message);
  }
}

// Run all tests
async function runMigrationTests() {
  console.log('🧪 Starting migration tests...\n');
  
  await testAuthentication();
  console.log('');
  
  await testDatabaseOperations();
  console.log('');
  
  console.log('✅ Migration tests completed!');
}

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.runMigrationTests = runMigrationTests;
} else {
  runMigrationTests();
}
```

## Performance Comparisons

### Before vs After: Query Performance

**Firebase (Document-based queries):**
```javascript
// Limited querying capabilities
const q = query(
  collection(db, 'journalEntries'),
  where('userId', '==', userId),
  where('mood', '==', 'happy'), // Only simple equality
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

**Supabase (SQL-based queries):**
```javascript
// Rich querying capabilities
const { data } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('user_id', userId)
  .in('mood', ['happy', 'excellent']) // Multiple values
  .gte('created_at', '2024-01-01')   // Date range
  .textSearch('content', 'meditation') // Full-text search
  .order('created_at', { ascending: false })
  .limit(20);
```

### Memory and Network Efficiency

**Firebase:** Downloads entire documents, client-side filtering
**Supabase:** Server-side filtering, only returns requested columns

```javascript
// Supabase - only get what you need
const { data } = await supabase
  .from('journal_entries')
  .select('id, title, created_at') // Only specific columns
  .eq('user_id', userId)
  .limit(50);
```

This comprehensive migration guide provides everything needed to successfully transition from Firebase to Supabase while maintaining functionality and improving performance.