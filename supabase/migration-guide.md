# Firebase to Supabase Migration Guide

## Overview
This comprehensive guide walks you through migrating your Firebase-based journaling application to Supabase, including data migration, authentication setup, and deployment.

## Phase 1: Supabase Project Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key
3. Save your service role key (keep this secure)

### 1.2 Run Database Migrations
Execute the following SQL migrations in your Supabase SQL Editor:

1. **001_create_journal_entries.sql** - Creates the main table
2. **002_create_rls_policies.sql** - Sets up Row Level Security
3. **003_create_database_functions.sql** - Creates helper functions

### 1.3 Deploy Edge Function
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the Edge Function
supabase functions deploy journal-api
```

## Phase 2: Data Migration

### 2.1 Export Firebase Data
Create a Node.js script to export your Firestore data:

```javascript
// firebase-export.js
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin
const serviceAccount = require('./path-to-your-firebase-service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function exportJournalEntries() {
  try {
    const snapshot = await db.collection('journalEntries').get();
    const entries = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      entries.push({
        firebase_id: doc.id,
        user_id: data.userId, // Will need to map to Supabase user IDs
        title: data.title || '',
        content: data.content,
        voice_transcription: data.voiceTranscription || null,
        emotional_analysis: data.emotionalAnalysis || {},
        ai_insights: data.aiInsights || {},
        synchronicity_tags: data.synchronicityTags || [],
        shadow_work_prompts: data.shadowWorkPrompts || [],
        mood: data.mood || null,
        themes: data.themes || [],
        triggers: data.triggers || [],
        created_at: data.createdAt?.toDate?.() || new Date(),
        updated_at: data.updatedAt?.toDate?.() || new Date()
      });
    });
    
    fs.writeFileSync('journal_entries_export.json', JSON.stringify(entries, null, 2));
    console.log(`Exported ${entries.length} journal entries`);
  } catch (error) {
    console.error('Export error:', error);
  }
}

exportJournalEntries();
```

### 2.2 Import Data to Supabase
Create a script to import data to Supabase:

```javascript
// supabase-import.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importJournalEntries() {
  const entries = JSON.parse(fs.readFileSync('journal_entries_export.json', 'utf8'));
  
  // Import in batches to avoid rate limits
  const batchSize = 100;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert(batch);
      
      if (error) {
        console.error('Batch import error:', error);
      } else {
        console.log(`Imported batch ${Math.floor(i/batchSize) + 1}`);
      }
    } catch (err) {
      console.error('Import error:', err);
    }
  }
}

importJournalEntries();
```

## Phase 3: Frontend Migration

### 3.1 Update Dependencies
Remove Firebase dependencies and add Supabase:

```json
{
  "dependencies": {
    "firebase": "^10.12.2",        // Remove this
    "firebase-admin": "^11.10.1"   // Remove this
  }
}
```

No new dependencies needed - Supabase is loaded via CDN in your config.

### 3.2 Replace Firebase Config
1. Rename `firebase-config.js` to `firebase-config.js.backup`
2. Update your HTML to import the new Supabase config:

```html
<!-- Replace Firebase imports -->
<script type="module">
  import { supabase, journalAPI, authAPI } from './js/supabase-config.js';
  // Your app code here
</script>
```

### 3.3 Update API Calls
Replace your current API calls with the new Supabase functions:

```javascript
// Old Firebase API call
const response = await fetch('/.netlify/functions/firebase-backend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  },
  body: JSON.stringify({
    action: 'createEntry',
    data: entryData
  })
});

// New Supabase API call (direct client)
const entry = await journalAPI.createEntry(entryData);

// Or using Edge Function (if preferred)
const response = await fetch('https://your-project-ref.supabase.co/functions/v1/journal-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({
    action: 'createEntry',
    data: entryData
  })
});
```

## Phase 4: Authentication Migration

### 4.1 Update Auth Code
Replace Firebase Auth calls with Supabase equivalents:

```javascript
// Login
// Old: signInWithEmailAndPassword(auth, email, password)
// New: authAPI.signIn(email, password)

// Signup
// Old: createUserWithEmailAndPassword(auth, email, password)
// New: authAPI.signUp(email, password)

// Logout
// Old: signOut(auth)
// New: authAPI.signOut()

// Auth state listening
// Old: onAuthStateChanged(auth, callback)
// New: authAPI.onAuthStateChange(callback)
```

### 4.2 Update Protected Routes
Add authentication checks to your pages:

```javascript
// Add to each protected page
document.addEventListener('DOMContentLoaded', async () => {
  const session = await authAPI.getSession();
  if (!session) {
    window.location.href = '/login.html';
    return;
  }
  
  // Initialize page for authenticated user
  initializePage(session.user);
});
```

## Phase 5: Testing and Validation

### 5.1 Test Checklist
- [ ] Database migrations completed successfully
- [ ] RLS policies prevent unauthorized access
- [ ] Edge Function deploys and responds correctly
- [ ] User registration works
- [ ] User login works
- [ ] Journal CRUD operations work
- [ ] Data appears correctly in frontend
- [ ] Search functionality works
- [ ] User isolation is maintained

### 5.2 Performance Testing
- Test with multiple users
- Verify query performance with larger datasets
- Check Edge Function response times
- Test authentication token refresh

## Phase 6: Production Deployment

### 6.1 Environment Configuration
Set up environment variables:

```javascript
// In production, use environment variables
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-ref.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
```

### 6.2 Netlify Configuration
Update your Netlify settings:

1. Remove the old Firebase function
2. Update environment variables
3. Configure redirects if needed

### 6.3 Domain and CORS
1. Add your domain to Supabase allowed origins
2. Update CORS headers in Edge Functions
3. Test from your production domain

## Phase 7: Cleanup and Optimization

### 7.1 Remove Firebase Dependencies
1. Delete Firebase configuration files
2. Remove Firebase imports from HTML
3. Delete Netlify Firebase function
4. Update package.json dependencies

### 7.2 Database Optimization
1. Monitor query performance
2. Add additional indexes if needed
3. Set up database monitoring
4. Configure backup schedule

### 7.3 Security Audit
1. Review RLS policies
2. Test user isolation thoroughly
3. Verify token handling is secure
4. Enable audit logging if needed

## Rollback Plan

In case issues arise during migration:

### Emergency Rollback Steps
1. Revert to backup Firebase configuration
2. Re-enable Netlify Firebase function  
3. Switch DNS back to Firebase-powered version
4. Debug issues in parallel environment

### Gradual Migration Alternative
Consider a gradual migration approach:
1. Run both systems in parallel
2. Migrate users gradually
3. Sync data between systems temporarily
4. Complete migration when confident

## Post-Migration Benefits

### Performance Improvements
- **Faster queries**: PostgreSQL with proper indexing
- **Real-time capabilities**: Built-in subscriptions
- **Better caching**: Supabase connection pooling

### Feature Enhancements
- **Advanced search**: Full-text search capabilities
- **Analytics**: Built-in user analytics
- **File storage**: Integrated storage solution
- **Real-time collaboration**: If needed in future

### Cost Optimization
- **Predictable pricing**: Based on database usage
- **Free tier**: Generous limits for development
- **No cold starts**: Always-warm database connections

## Support and Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Community Support**: https://github.com/supabase/supabase/discussions
- **Discord Community**: https://discord.supabase.com
- **Status Page**: https://status.supabase.com

## Troubleshooting Common Issues

### Migration Issues
- **RLS blocking queries**: Check your policies match your user structure
- **Data type mismatches**: Ensure JSONB fields are properly formatted
- **Performance issues**: Add indexes for frequently queried fields

### Authentication Issues  
- **Token expiration**: Implement proper refresh token handling
- **CORS errors**: Check allowed origins in Supabase dashboard
- **Session persistence**: Verify localStorage is working correctly

### Edge Function Issues
- **Deployment failures**: Check function syntax and dependencies
- **Timeout errors**: Optimize query performance
- **Memory issues**: Monitor function resource usage