# Firebase to Supabase Migration Guide

## Table of Contents
1. [Overview](#overview)
2. [Key Differences](#key-differences)
3. [Environment Setup](#environment-setup)
4. [Authentication Migration](#authentication-migration)
5. [Database Migration](#database-migration)
6. [Implementation Code](#implementation-code)
7. [Migration Checklist](#migration-checklist)
8. [Troubleshooting](#troubleshooting)

## Overview

This guide provides a comprehensive migration path from Firebase to Supabase for authentication and data storage in your web application. Supabase offers a more straightforward approach with PostgreSQL and Row Level Security (RLS) instead of Firebase's NoSQL and security rules.

### Current Firebase Implementation Analysis
Your application currently uses:
- Firebase Authentication for user management
- Firestore for document-based data storage
- Firebase Admin SDK for server-side operations
- Netlify Functions for backend API

### Migration Benefits
- **PostgreSQL**: More familiar SQL database with advanced querying
- **Row Level Security**: More intuitive security model than Firestore rules
- **Real-time capabilities**: Built-in real-time subscriptions
- **TypeScript support**: Better type safety with generated types
- **Cost efficiency**: More predictable pricing model

## Key Differences

### Authentication
| Firebase | Supabase | Notes |
|----------|----------|-------|
| `signInWithEmailAndPassword()` | `signInWithPassword()` | Method name change |
| `createUserWithEmailAndPassword()` | `signUp()` | Simplified method name |
| `onAuthStateChanged()` | `onAuthStateChange()` | Slight naming difference |
| Firebase ID Token | JWT Access Token | Same concept, different implementation |

### Database
| Firebase (Firestore) | Supabase (PostgreSQL) | Notes |
|---------------------|----------------------|-------|
| Collections & Documents | Tables & Rows | Structured vs Document-based |
| Security Rules | Row Level Security (RLS) | SQL-based security policies |
| `collection().add()` | `insert()` | Different API methods |
| `where()` clauses | SQL `WHERE` conditions | More powerful querying |
| Real-time with `onSnapshot()` | Real-time with `subscribe()` | Similar functionality |

## Environment Setup

### 1. Install Supabase JavaScript Client

```bash
npm install @supabase/supabase-js
```

### 2. Create Environment Configuration

Create a `.env` file (or update existing):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Keep Firebase for gradual migration (optional)
FIREBASE_PROJECT_ID=your-firebase-project-id
```

### 3. Obtain Supabase Credentials

1. **Create Supabase Project**: Go to [supabase.com](https://supabase.com)
2. **Get Project URL**: Found in Settings → API → Project URL
3. **Get Anon Key**: Found in Settings → API → Project API keys → anon/public
4. **Get Service Role Key**: Found in Settings → API → Project API keys → service_role (keep secret!)

## Authentication Migration

### Firebase Authentication Service (Current)
```javascript
// firebase-auth.js (Current Implementation)
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

class FirebaseAuthService {
  constructor() {
    this.auth = getAuth();
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }

  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
  }
}
```

### Supabase Authentication Service (New)
```javascript
// supabase-auth.js (New Implementation)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh
    autoRefreshToken: true,
    // Persist session in localStorage
    persistSession: true,
    // Detect auth redirects automatically
    detectSessionInUrl: true
  }
});

class SupabaseAuthService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Sign in user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user, session}>} Auth response
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(`Sign in failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please check your email and confirm your account');
      }
      throw error;
    }
  }

  /**
   * Sign up new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<{user, session}>} Auth response
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata // Store additional user data
        }
      });
      
      if (error) {
        throw new Error(`Sign up failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists');
      }
      if (error.message.includes('Password should be at least')) {
        throw new Error('Password must be at least 6 characters long');
      }
      throw error;
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw new Error(`Sign out failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user session
   * @returns {Promise<Session|null>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        return null;
      }
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get current user
   * @returns {Promise<User|null>}
   */
  async getUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) {
        console.error('Get user error:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function to handle auth state changes
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      // Transform event to match Firebase-like interface for easier migration
      const user = session?.user || null;
      callback(user, event);
    });
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        throw new Error(`Password reset failed: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw new Error(`Password update failed: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }
}

export default new SupabaseAuthService();
export { supabase };
```

## Database Migration

### Database Schema Setup

First, create the database schema in Supabase SQL Editor:

```sql
-- Create journal_entries table
CREATE TABLE journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL,
  voice_transcription TEXT,
  emotional_analysis JSONB DEFAULT '{}',
  ai_insights JSONB DEFAULT '{}',
  synchronicity_tags TEXT[] DEFAULT '{}',
  shadow_work_prompts TEXT[] DEFAULT '{}',
  mood TEXT,
  themes TEXT[] DEFAULT '{}',
  triggers TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_entries
-- Users can only access their own entries
CREATE POLICY "Users can view own entries" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_mood ON journal_entries(mood);
CREATE INDEX idx_journal_entries_themes ON journal_entries USING GIN(themes);

-- Create full-text search index
CREATE INDEX idx_journal_entries_fts ON journal_entries 
USING GIN(to_tsvector('english', title || ' ' || content));
```

### TypeScript Interfaces

```typescript
// types/journal.ts
export interface JournalEntry {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  voice_transcription?: string | null;
  emotional_analysis?: Record<string, any>;
  ai_insights?: Record<string, any>;
  synchronicity_tags?: string[];
  shadow_work_prompts?: string[];
  mood?: string | null;
  themes?: string[];
  triggers?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntryInsert extends Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'> {}

export interface JournalEntryUpdate extends Partial<Omit<JournalEntry, 'id' | 'user_id' | 'created_at'>> {}

// Emotional analysis structure
export interface EmotionalAnalysis {
  dominant_emotion?: string;
  emotions?: {
    joy?: number;
    sadness?: number;
    anger?: number;
    fear?: number;
    disgust?: number;
    surprise?: number;
  };
  sentiment_score?: number; // -1 to 1
  confidence?: number;
}

// AI insights structure
export interface AIInsights {
  themes?: string[];
  key_insights?: string[];
  growth_areas?: string[];
  reflection_prompts?: string[];
  patterns?: string[];
}
```

### Database Operations Service

```typescript
// services/journal-database.ts
import { supabase } from '../config/supabase';
import type { JournalEntry, JournalEntryInsert, JournalEntryUpdate } from '../types/journal';

class JournalDatabaseService {
  /**
   * Create a new journal entry
   * @param entryData - Journal entry data to insert
   * @returns Promise<JournalEntry> Created journal entry
   */
  async createEntry(entryData: JournalEntryInsert): Promise<JournalEntry> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([entryData])
        .select()
        .single();
      
      if (error) {
        console.error('Create entry error:', error);
        throw new Error(`Failed to create journal entry: ${error.message}`);
      }
      
      return data as JournalEntry;
    } catch (error) {
      console.error('Create entry error:', error);
      throw error;
    }
  }

  /**
   * Get a specific journal entry by ID
   * @param entryId - ID of the journal entry
   * @returns Promise<JournalEntry | null> Journal entry or null if not found
   */
  async getEntry(entryId: string): Promise<JournalEntry | null> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', entryId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return null;
        }
        console.error('Get entry error:', error);
        throw new Error(`Failed to get journal entry: ${error.message}`);
      }
      
      return data as JournalEntry;
    } catch (error) {
      console.error('Get entry error:', error);
      throw error;
    }
  }

  /**
   * Get all journal entries for the current user
   * @param options - Query options (limit, offset, etc.)
   * @returns Promise<JournalEntry[]> Array of journal entries
   */
  async getUserEntries(options: {
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'updated_at' | 'title';
    ascending?: boolean;
  } = {}): Promise<JournalEntry[]> {
    try {
      const {
        limit = 50,
        offset = 0,
        orderBy = 'created_at',
        ascending = false
      } = options;

      let query = supabase
        .from('journal_entries')
        .select('*')
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      const { data, error } = await query;
      
      if (error) {
        console.error('Get user entries error:', error);
        throw new Error(`Failed to get journal entries: ${error.message}`);
      }
      
      return (data || []) as JournalEntry[];
    } catch (error) {
      console.error('Get user entries error:', error);
      throw error;
    }
  }

  /**
   * Update a journal entry
   * @param entryId - ID of the journal entry
   * @param updateData - Data to update
   * @returns Promise<JournalEntry> Updated journal entry
   */
  async updateEntry(entryId: string, updateData: JournalEntryUpdate): Promise<JournalEntry> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', entryId)
        .select()
        .single();
      
      if (error) {
        console.error('Update entry error:', error);
        throw new Error(`Failed to update journal entry: ${error.message}`);
      }
      
      return data as JournalEntry;
    } catch (error) {
      console.error('Update entry error:', error);
      throw error;
    }
  }

  /**
   * Delete a journal entry
   * @param entryId - ID of the journal entry
   * @returns Promise<void>
   */
  async deleteEntry(entryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) {
        console.error('Delete entry error:', error);
        throw new Error(`Failed to delete journal entry: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete entry error:', error);
      throw error;
    }
  }

  /**
   * Search journal entries by content or title
   * @param query - Search query
   * @param limit - Maximum number of results
   * @returns Promise<JournalEntry[]> Array of matching journal entries
   */
  async searchEntries(query: string, limit: number = 20): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Search entries error:', error);
        throw new Error(`Failed to search journal entries: ${error.message}`);
      }
      
      return (data || []) as JournalEntry[];
    } catch (error) {
      console.error('Search entries error:', error);
      throw error;
    }
  }

  /**
   * Full-text search using PostgreSQL's text search capabilities
   * @param query - Search query
   * @param limit - Maximum number of results
   * @returns Promise<JournalEntry[]> Array of matching journal entries
   */
  async fullTextSearch(query: string, limit: number = 20): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .rpc('search_journal_entries', {
          search_query: query,
          result_limit: limit
        });
      
      if (error) {
        console.error('Full text search error:', error);
        throw new Error(`Failed to search journal entries: ${error.message}`);
      }
      
      return (data || []) as JournalEntry[];
    } catch (error) {
      console.error('Full text search error:', error);
      throw error;
    }
  }

  /**
   * Get entries by mood
   * @param mood - Mood to filter by
   * @param limit - Maximum number of results
   * @returns Promise<JournalEntry[]> Array of journal entries with the specified mood
   */
  async getEntriesByMood(mood: string, limit: number = 20): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('mood', mood)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Get entries by mood error:', error);
        throw new Error(`Failed to get journal entries by mood: ${error.message}`);
      }
      
      return (data || []) as JournalEntry[];
    } catch (error) {
      console.error('Get entries by mood error:', error);
      throw error;
    }
  }

  /**
   * Get entries with specific themes
   * @param themes - Array of themes to filter by
   * @param limit - Maximum number of results
   * @returns Promise<JournalEntry[]> Array of journal entries with the specified themes
   */
  async getEntriesByThemes(themes: string[], limit: number = 20): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .overlaps('themes', themes)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Get entries by themes error:', error);
        throw new Error(`Failed to get journal entries by themes: ${error.message}`);
      }
      
      return (data || []) as JournalEntry[];
    } catch (error) {
      console.error('Get entries by themes error:', error);
      throw error;
    }
  }

  /**
   * Get entries within a date range
   * @param startDate - Start date (ISO string)
   * @param endDate - End date (ISO string)
   * @param limit - Maximum number of results
   * @returns Promise<JournalEntry[]> Array of journal entries within the date range
   */
  async getEntriesByDateRange(
    startDate: string, 
    endDate: string, 
    limit: number = 50
  ): Promise<JournalEntry[]> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Get entries by date range error:', error);
        throw new Error(`Failed to get journal entries by date range: ${error.message}`);
      }
      
      return (data || []) as JournalEntry[];
    } catch (error) {
      console.error('Get entries by date range error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time changes for user's journal entries
   * @param callback - Callback function to handle real-time updates
   * @returns Subscription object with unsubscribe method
   */
  subscribeToUserEntries(
    callback: (payload: any) => void
  ) {
    return supabase
      .channel('journal_entries_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'journal_entries'
      }, callback)
      .subscribe();
  }
}

export default new JournalDatabaseService();
```

### Additional Database Functions

Add this function to your Supabase SQL Editor for full-text search:

```sql
-- Full-text search function
CREATE OR REPLACE FUNCTION search_journal_entries(search_query TEXT, result_limit INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  title TEXT,
  content TEXT,
  voice_transcription TEXT,
  emotional_analysis JSONB,
  ai_insights JSONB,
  synchronicity_tags TEXT[],
  shadow_work_prompts TEXT[],
  mood TEXT,
  themes TEXT[],
  triggers TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id, j.user_id, j.title, j.content, j.voice_transcription,
    j.emotional_analysis, j.ai_insights, j.synchronicity_tags,
    j.shadow_work_prompts, j.mood, j.themes, j.triggers,
    j.created_at, j.updated_at
  FROM journal_entries j
  WHERE 
    j.user_id = auth.uid() 
    AND to_tsvector('english', j.title || ' ' || j.content) @@ plainto_tsquery('english', search_query)
  ORDER BY 
    ts_rank(to_tsvector('english', j.title || ' ' || j.content), plainto_tsquery('english', search_query)) DESC,
    j.created_at DESC
  LIMIT result_limit;
END;
$$;
```

## Migration Checklist

### Pre-Migration
- [ ] **Backup Firebase Data**: Export all Firestore data using Firebase CLI
- [ ] **Create Supabase Project**: Set up new Supabase project and configure settings
- [ ] **Install Dependencies**: Add `@supabase/supabase-js` to your project
- [ ] **Environment Variables**: Configure Supabase URL and keys in environment files
- [ ] **Database Schema**: Create tables and RLS policies in Supabase

### Authentication Migration
- [ ] **Update Auth Service**: Replace Firebase auth service with Supabase implementation
- [ ] **Test Sign Up**: Verify new user registration works
- [ ] **Test Sign In**: Verify existing user login works
- [ ] **Test Sign Out**: Verify user logout works
- [ ] **Test Session Persistence**: Verify sessions persist across browser refreshes
- [ ] **Test Password Reset**: Verify password reset email functionality
- [ ] **Update Auth State Listeners**: Replace Firebase auth state listeners with Supabase

### Database Migration
- [ ] **Data Export**: Export all journal entries from Firestore
- [ ] **Data Transformation**: Convert Firebase documents to PostgreSQL rows
- [ ] **Data Import**: Import transformed data into Supabase
- [ ] **Update Database Service**: Replace Firestore operations with Supabase
- [ ] **Test CRUD Operations**: Verify create, read, update, delete operations
- [ ] **Test Queries**: Verify search and filter operations
- [ ] **Test Real-time**: Verify real-time subscriptions work
- [ ] **Verify RLS Policies**: Ensure users can only access their own data

### Frontend Integration
- [ ] **Update Import Statements**: Change Firebase imports to Supabase
- [ ] **Update Configuration**: Replace Firebase config with Supabase config
- [ ] **Test User Interface**: Verify all UI components work with new backend
- [ ] **Error Handling**: Update error handling for Supabase-specific errors
- [ ] **Loading States**: Verify loading states work correctly

### Backend/API Migration
- [ ] **Replace Firebase Admin**: Remove Firebase Admin SDK dependencies
- [ ] **Update API Endpoints**: Replace Firebase operations with Supabase in API routes
- [ ] **Test API Authentication**: Verify JWT token validation works
- [ ] **Test API Operations**: Verify all API endpoints work correctly
- [ ] **Update CORS Settings**: Configure CORS for Supabase if needed

### Testing & Validation
- [ ] **Unit Tests**: Update and run unit tests
- [ ] **Integration Tests**: Test full user flows
- [ ] **Performance Tests**: Compare query performance
- [ ] **Security Tests**: Verify RLS policies work correctly
- [ ] **Cross-browser Tests**: Test in different browsers
- [ ] **Mobile Tests**: Test responsive behavior

### Deployment
- [ ] **Environment Variables**: Set production environment variables
- [ ] **Database Migration**: Run schema and data migration on production
- [ ] **Gradual Rollout**: Consider feature flags for gradual migration
- [ ] **Monitor Errors**: Set up error monitoring for new implementation
- [ ] **Performance Monitoring**: Monitor database and API performance

### Post-Migration Cleanup
- [ ] **Remove Firebase Dependencies**: Uninstall unused Firebase packages
- [ ] **Clean Up Code**: Remove Firebase-specific code and comments
- [ ] **Update Documentation**: Update project documentation
- [ ] **Archive Firebase Project**: Safely archive or delete Firebase project
- [ ] **Monitor Performance**: Monitor system performance for 1-2 weeks
- [ ] **Collect Feedback**: Gather user feedback on new implementation

## Troubleshooting

### Common Authentication Issues

#### Issue: "Invalid JWT" Error
```javascript
// Solution: Verify your Supabase URL and anon key
const { data: { session }, error } = await supabase.auth.getSession();
if (error) {
  console.error('Session error:', error);
  // Redirect to login or refresh token
}
```

#### Issue: Session Not Persisting
```javascript
// Solution: Ensure proper auth configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true, // This should be true
    detectSessionInUrl: true
  }
});
```

### Common Database Issues

#### Issue: "Row Level Security Policy" Error
```sql
-- Solution: Check your RLS policies
-- Ensure policies allow the operation you're trying to perform
SELECT * FROM journal_entries; -- This might fail if no policy allows SELECT

-- Debug: Temporarily disable RLS to test (NOT for production)
ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
```

#### Issue: "Permission Denied" Error
```sql
-- Solution: Verify user is authenticated and policy exists
-- Check if auth.uid() returns the expected user ID
SELECT auth.uid(); -- Should return current user's UUID

-- Verify policy exists and is correct
SELECT * FROM pg_policies WHERE tablename = 'journal_entries';
```

### Migration-Specific Issues

#### Issue: Data Type Mismatches
```javascript
// Firebase stores dates as Timestamps, Supabase as ISO strings
// Solution: Transform dates during migration
const transformEntry = (firebaseEntry) => ({
  ...firebaseEntry,
  created_at: firebaseEntry.createdAt.toDate().toISOString(),
  updated_at: firebaseEntry.updatedAt.toDate().toISOString()
});
```

#### Issue: Array/Object Field Differences
```javascript
// Firebase supports nested objects directly
// Supabase uses JSONB for complex objects and arrays for simple lists
const transformEntry = (firebaseEntry) => ({
  ...firebaseEntry,
  themes: firebaseEntry.themes || [], // Array field
  emotional_analysis: firebaseEntry.emotionalAnalysis || {}, // JSONB field
  synchronicity_tags: firebaseEntry.synchronicityTags || []
});
```

### Performance Optimization Tips

#### Database Indexing
```sql
-- Add indexes for commonly queried fields
CREATE INDEX CONCURRENTLY idx_journal_entries_user_created 
  ON journal_entries(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_journal_entries_mood_user 
  ON journal_entries(mood, user_id);
```

#### Query Optimization
```javascript
// Use select() to limit returned columns
const { data } = await supabase
  .from('journal_entries')
  .select('id, title, created_at') // Only get needed columns
  .limit(10);

// Use single() for single record queries
const { data } = await supabase
  .from('journal_entries')
  .select('*')
  .eq('id', entryId)
  .single(); // Tells Supabase to expect only one result
```

### Security Best Practices

#### Environment Variables
```env
# Never commit these to version control
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key should only be used server-side
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

#### RLS Policy Examples
```sql
-- More restrictive policies for sensitive operations
CREATE POLICY "Users can only update their own recent entries" ON journal_entries
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND created_at > NOW() - INTERVAL '24 hours'
  );

-- Policy with additional business logic
CREATE POLICY "Users can read published entries or own entries" ON journal_entries
  FOR SELECT USING (
    auth.uid() = user_id 
    OR is_published = true
  );
```

This migration guide provides a comprehensive path from Firebase to Supabase while maintaining functionality and improving on the architecture with PostgreSQL's advanced features and Row Level Security.