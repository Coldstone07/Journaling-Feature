# Supabase Authentication Setup Guide

## Overview
This guide provides comprehensive instructions for setting up Supabase authentication to replace your current Firebase Auth implementation.

## 1. Supabase Dashboard Configuration

### Enable Authentication Providers
1. Go to your Supabase Dashboard → Authentication → Settings
2. Configure the following settings:

#### Email Authentication
- **Enable email confirmation**: Recommended for production
- **Enable email change confirmation**: Recommended for security
- **Secure email change**: Enable to prevent email hijacking

#### Password Requirements
- **Minimum password length**: 6-8 characters minimum
- **Password requirements**: Consider requiring mixed case, numbers, special characters

#### Session Settings
- **JWT expiry**: 3600 seconds (1 hour) - adjust based on your needs
- **Refresh token expiry**: 2592000 seconds (30 days)
- **Enable refresh token rotation**: Recommended for security

### Optional: Social Authentication Providers
If you want to add social login options:

#### Google OAuth
1. Go to Authentication → Settings → Auth Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
   - Redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

#### Other Providers
Supabase supports: GitHub, Discord, Facebook, Apple, Azure, etc.

## 2. Frontend Integration

### Replace Firebase Auth Imports
Replace your current Firebase imports with Supabase:

```javascript
// Old Firebase imports (remove these)
// import { getAuth } from 'firebase/auth';

// New Supabase imports
import { supabase, authAPI } from './js/supabase-config.js';
```

### Authentication Flow Implementation

#### Login Form
```javascript
async function handleLogin(email, password) {
  try {
    const { user, session } = await authAPI.signIn(email, password);
    console.log('User logged in:', user);
    // Redirect to main application
    window.location.href = '/dashboard.html';
  } catch (error) {
    console.error('Login error:', error.message);
    // Display error to user
    showErrorMessage(error.message);
  }
}
```

#### Registration Form
```javascript
async function handleSignUp(email, password) {
  try {
    const { user, session } = await authAPI.signUp(email, password);
    if (user && !session) {
      // Email confirmation required
      showMessage('Please check your email for verification link');
    } else if (session) {
      // Immediate login (if email confirmation disabled)
      window.location.href = '/dashboard.html';
    }
  } catch (error) {
    console.error('Signup error:', error.message);
    showErrorMessage(error.message);
  }
}
```

#### Auth State Management
```javascript
// Listen for auth state changes
authAPI.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user);
    // Update UI for authenticated user
    updateUIForAuthenticatedUser(session.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
    // Redirect to login page
    window.location.href = '/login.html';
  }
});

// Check current session on app load
async function initializeAuth() {
  const session = await authAPI.getSession();
  if (session) {
    updateUIForAuthenticatedUser(session.user);
  } else {
    // Redirect to login if not authenticated
    if (!window.location.pathname.includes('login')) {
      window.location.href = '/login.html';
    }
  }
}

// Call on app startup
document.addEventListener('DOMContentLoaded', initializeAuth);
```

## 3. Security Considerations

### Environment Variables
Create a `.env` file for your Supabase configuration:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### URL Configuration
Update your `supabase-config.js` with actual values:

```javascript
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';
```

### Row Level Security Verification
Test your RLS policies by:

1. Creating test users
2. Attempting to access other users' data
3. Verifying proper isolation

## 4. Migration from Firebase Auth

### User Migration Strategy
Since you can't directly migrate Firebase users to Supabase, you have two options:

#### Option 1: Fresh Start (Recommended for MVP)
- Users will need to re-register
- Existing journal data can be migrated using user email matching
- Simpler implementation

#### Option 2: Gradual Migration
- Implement dual authentication temporarily
- Check Supabase first, fall back to Firebase
- Gradually migrate users as they log in

### Data Migration Considerations
- Export existing journal entries from Firebase
- Match entries to users by email (if available)
- Import to Supabase using the service role

## 5. Testing Checklist

### Authentication Flow Tests
- [ ] User registration works
- [ ] Email confirmation (if enabled)
- [ ] User login works
- [ ] Password reset works
- [ ] Session persistence across browser refresh
- [ ] Logout functionality
- [ ] Protected route access control

### Security Tests
- [ ] Users cannot access other users' journal entries
- [ ] Unauthenticated requests are properly rejected
- [ ] Token expiration is handled gracefully
- [ ] RLS policies prevent data leaks

### Integration Tests
- [ ] Journal CRUD operations work with authentication
- [ ] Edge function properly validates tokens
- [ ] Client-side API calls include proper headers
- [ ] Error handling for auth failures

## 6. Common Issues and Solutions

### CORS Issues
If you encounter CORS errors, ensure:
- Your domain is added to the allowed origins in Supabase
- Proper headers are included in Edge Function responses

### Token Refresh Issues
- Implement automatic token refresh
- Handle refresh token expiration gracefully
- Clear local storage on auth errors

### Email Confirmation Issues
- Configure SMTP settings in Supabase
- Customize email templates
- Handle confirmation flow in your app

## 7. Production Deployment

### Final Checklist
- [ ] Enable email confirmation in production
- [ ] Set up custom SMTP provider (not Supabase's)
- [ ] Configure proper redirect URLs
- [ ] Set up monitoring for auth errors
- [ ] Implement rate limiting for auth endpoints
- [ ] Configure session timeout appropriately

### Performance Optimizations
- Use connection pooling for database connections
- Implement proper caching for user sessions
- Monitor authentication performance metrics