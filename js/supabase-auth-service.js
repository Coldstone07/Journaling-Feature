// Supabase Authentication Service
// Complete replacement for Firebase authentication with enhanced error handling

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Configuration - Using actual Supabase credentials
const supabaseUrl = 'https://ffiprjmxwzidkrdubipt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaXByam14d3ppZGtyZHViaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTc1ODEsImV4cCI6MjA3MjU5MzU4MX0.ALnPITE9-FRczh3VboOfxax4BVtaQaMR835M5pcHO5Y';

// Create Supabase client with optimal configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable automatic token refresh to prevent session expiration
    autoRefreshToken: true,
    // Persist session in localStorage for user convenience
    persistSession: true,
    // Automatically detect authentication redirects (for OAuth, magic links)
    detectSessionInUrl: true,
    // Configure storage key (useful for multi-tenant applications)
    storageKey: 'kairos-journaling-auth',
    // Set session refresh threshold (refresh 60 seconds before expiry)
    refreshThreshold: 60
  },
  // Configure global headers if needed
  global: {
    headers: {
      'x-client-info': 'kairos-journaling-app@1.0.0'
    }
  }
});

/**
 * Comprehensive Authentication Service for Supabase
 * Provides all authentication operations with robust error handling
 */
class SupabaseAuthService {
  constructor() {
    this.supabase = supabase;
    this.currentUser = null;
    this.currentSession = null;
    
    // Initialize auth state
    this.initializeAuth();
  }

  /**
   * Initialize authentication state on service creation
   * Sets up current user and session from stored data
   */
  async initializeAuth() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.warn('Initial auth session error:', error);
        return;
      }
      
      this.currentSession = session;
      this.currentUser = session?.user || null;
      
      // Log authentication state for debugging
      console.log('Auth initialized:', {
        hasUser: !!this.currentUser,
        hasSession: !!this.currentSession,
        userId: this.currentUser?.id
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  /**
   * Sign up new user with email and password
   * @param {string} email - User email address
   * @param {string} password - User password (minimum 6 characters)
   * @param {Object} options - Additional signup options
   * @param {Object} options.data - Additional user metadata
   * @param {string} options.redirectTo - URL to redirect after email confirmation
   * @returns {Promise<{user, session, error}>} Signup response
   */
  async signUp(email, password, options = {}) {
    try {
      // Validate input parameters
      if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('Attempting signup for:', email.replace(/(.{2})(.*)(@.*)/, '$1***$3'));

      const { data, error } = await this.supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: options.data || {},
          emailRedirectTo: options.redirectTo || `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw this.transformAuthError(error);
      }
      
      // Update local state if signup includes session (auto-confirmed)
      if (data.session) {
        this.currentSession = data.session;
        this.currentUser = data.user;
      }
      
      console.log('Signup successful:', {
        userId: data.user?.id,
        emailConfirmed: !!data.session,
        needsConfirmation: !data.session
      });
      
      return {
        user: data.user,
        session: data.session,
        needsEmailConfirmation: !data.session,
        error: null
      };
      
    } catch (error) {
      console.error('Signup process error:', error);
      return {
        user: null,
        session: null,
        needsEmailConfirmation: false,
        error: error.message
      };
    }
  }

  /**
   * Sign in user with email and password
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<{user, session, error}>} Signin response
   */
  async signIn(email, password) {
    try {
      // Validate input parameters
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('Attempting signin for:', email.replace(/(.{2})(.*)(@.*)/, '$1***$3'));

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });
      
      if (error) {
        console.error('Signin error:', error);
        throw this.transformAuthError(error);
      }
      
      // Update local state
      this.currentSession = data.session;
      this.currentUser = data.user;
      
      console.log('Signin successful:', {
        userId: data.user?.id,
        hasSession: !!data.session
      });
      
      return {
        user: data.user,
        session: data.session,
        error: null
      };
      
    } catch (error) {
      console.error('Signin process error:', error);
      return {
        user: null,
        session: null,
        error: error.message
      };
    }
  }

  /**
   * Sign in with magic link (passwordless authentication)
   * @param {string} email - User email address
   * @param {Object} options - Magic link options
   * @param {string} options.redirectTo - URL to redirect after clicking magic link
   * @returns {Promise<{error}>} Magic link response
   */
  async signInWithMagicLink(email, options = {}) {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }

      console.log('Sending magic link to:', email.replace(/(.{2})(.*)(@.*)/, '$1***$3'));

      const { error } = await this.supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: options.redirectTo || `${window.location.origin}/dashboard`,
          shouldCreateUser: options.shouldCreateUser !== false
        }
      });
      
      if (error) {
        console.error('Magic link error:', error);
        throw this.transformAuthError(error);
      }
      
      console.log('Magic link sent successfully');
      
      return { error: null };
      
    } catch (error) {
      console.error('Magic link process error:', error);
      return { error: error.message };
    }
  }

  /**
   * Sign out current user
   * Clears session and local state
   * @returns {Promise<{error}>} Signout response
   */
  async signOut() {
    try {
      console.log('Attempting signout for user:', this.currentUser?.id);

      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        console.error('Signout error:', error);
        throw new Error(`Sign out failed: ${error.message}`);
      }
      
      // Clear local state
      this.currentSession = null;
      this.currentUser = null;
      
      console.log('Signout successful');
      
      return { error: null };
      
    } catch (error) {
      console.error('Signout process error:', error);
      return { error: error.message };
    }
  }

  /**
   * Get current user session
   * @param {boolean} forceRefresh - Force refresh session from server
   * @returns {Promise<Session|null>} Current session or null
   */
  async getSession(forceRefresh = false) {
    try {
      if (!forceRefresh && this.currentSession) {
        // Check if session is still valid (not expired)
        const now = Date.now() / 1000;
        if (this.currentSession.expires_at && this.currentSession.expires_at > now) {
          return this.currentSession;
        }
      }

      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.warn('Get session error:', error);
        this.currentSession = null;
        this.currentUser = null;
        return null;
      }
      
      this.currentSession = session;
      this.currentUser = session?.user || null;
      
      return session;
      
    } catch (error) {
      console.error('Get session process error:', error);
      this.currentSession = null;
      this.currentUser = null;
      return null;
    }
  }

  /**
   * Get current user information
   * @param {boolean} forceRefresh - Force refresh user data from server
   * @returns {Promise<User|null>} Current user or null
   */
  async getUser(forceRefresh = false) {
    try {
      if (!forceRefresh && this.currentUser) {
        return this.currentUser;
      }

      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        console.warn('Get user error:', error);
        this.currentUser = null;
        return null;
      }
      
      this.currentUser = user;
      return user;
      
    } catch (error) {
      console.error('Get user process error:', error);
      this.currentUser = null;
      return null;
    }
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function (event, session) => void
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange(callback) {
    try {
      const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event, {
          hasSession: !!session,
          userId: session?.user?.id
        });
        
        // Update local state
        this.currentSession = session;
        this.currentUser = session?.user || null;
        
        // Call the provided callback with Firebase-like interface for easier migration
        // Firebase pattern: callback(user) vs Supabase pattern: callback(event, session)
        if (typeof callback === 'function') {
          // Provide both patterns for flexibility
          callback(session?.user || null, event, session);
        }
      });
      
      return {
        unsubscribe: () => subscription?.unsubscribe()
      };
      
    } catch (error) {
      console.error('Auth state change listener error:', error);
      return { unsubscribe: () => {} };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email address
   * @param {Object} options - Reset password options
   * @param {string} options.redirectTo - URL to redirect after password reset
   * @returns {Promise<{error}>} Password reset response
   */
  async resetPassword(email, options = {}) {
    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }

      console.log('Sending password reset to:', email.replace(/(.{2})(.*)(@.*)/, '$1***$3'));

      const { error } = await this.supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: options.redirectTo || `${window.location.origin}/reset-password`
        }
      );
      
      if (error) {
        console.error('Password reset error:', error);
        throw this.transformAuthError(error);
      }
      
      console.log('Password reset email sent successfully');
      
      return { error: null };
      
    } catch (error) {
      console.error('Password reset process error:', error);
      return { error: error.message };
    }
  }

  /**
   * Update user password
   * @param {string} newPassword - New password
   * @returns {Promise<{user, error}>} Password update response
   */
  async updatePassword(newPassword) {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }

      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Password update error:', error);
        throw this.transformAuthError(error);
      }
      
      // Update local state
      this.currentUser = data.user;
      
      console.log('Password updated successfully');
      
      return {
        user: data.user,
        error: null
      };
      
    } catch (error) {
      console.error('Password update process error:', error);
      return {
        user: null,
        error: error.message
      };
    }
  }

  /**
   * Update user metadata
   * @param {Object} updates - User metadata updates
   * @param {string} updates.email - New email address
   * @param {Object} updates.data - Additional user data
   * @returns {Promise<{user, error}>} User update response
   */
  async updateUser(updates) {
    try {
      if (!updates || typeof updates !== 'object') {
        throw new Error('Updates object is required');
      }

      // Validate email if provided
      if (updates.email && !updates.email.includes('@')) {
        throw new Error('Please provide a valid email address');
      }

      const updateData = {};
      
      if (updates.email) {
        updateData.email = updates.email.toLowerCase().trim();
      }
      
      if (updates.data) {
        updateData.data = updates.data;
      }

      const { data, error } = await this.supabase.auth.updateUser(updateData);
      
      if (error) {
        console.error('User update error:', error);
        throw this.transformAuthError(error);
      }
      
      // Update local state
      this.currentUser = data.user;
      
      console.log('User updated successfully:', {
        userId: data.user?.id,
        emailChanged: !!updates.email
      });
      
      return {
        user: data.user,
        error: null
      };
      
    } catch (error) {
      console.error('User update process error:', error);
      return {
        user: null,
        error: error.message
      };
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!(this.currentUser && this.currentSession);
  }

  /**
   * Get user's access token for API calls
   * @returns {Promise<string|null>} JWT access token
   */
  async getAccessToken() {
    try {
      const session = await this.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  /**
   * Refresh the current session
   * @returns {Promise<{session, error}>} Session refresh response
   */
  async refreshSession() {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        throw this.transformAuthError(error);
      }
      
      // Update local state
      this.currentSession = data.session;
      this.currentUser = data.user;
      
      console.log('Session refreshed successfully');
      
      return {
        session: data.session,
        error: null
      };
      
    } catch (error) {
      console.error('Session refresh process error:', error);
      return {
        session: null,
        error: error.message
      };
    }
  }

  /**
   * Transform Supabase auth errors into user-friendly messages
   * @param {Object} error - Supabase error object
   * @returns {Error} Transformed error
   */
  transformAuthError(error) {
    const errorMessages = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'User not found': 'No account found with this email address. Please sign up first.',
      'Signup disabled': 'New user registration is currently disabled. Please contact support.',
      'Invalid email': 'Please provide a valid email address.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'User already registered': 'An account with this email already exists. Please sign in instead.',
      'Token has expired or is invalid': 'Your session has expired. Please sign in again.',
      'Unable to validate email address': 'Please provide a valid email address.',
      'Email rate limit exceeded': 'Too many emails sent. Please wait before requesting another.',
      'SMS rate limit exceeded': 'Too many SMS messages sent. Please wait before requesting another.',
      'Access token expired': 'Your session has expired. Please sign in again.',
      'Refresh token not found': 'Session expired. Please sign in again.'
    };

    const message = errorMessages[error.message] || error.message || 'An unexpected error occurred';
    const transformedError = new Error(message);
    transformedError.originalError = error;
    return transformedError;
  }

  /**
   * Get debugging information about current auth state
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      hasSupabaseClient: !!this.supabase,
      currentUser: this.currentUser ? {
        id: this.currentUser.id,
        email: this.currentUser.email,
        emailConfirmed: this.currentUser.email_confirmed_at !== null,
        createdAt: this.currentUser.created_at
      } : null,
      currentSession: this.currentSession ? {
        accessToken: this.currentSession.access_token ? 'Present' : 'Missing',
        refreshToken: this.currentSession.refresh_token ? 'Present' : 'Missing',
        expiresAt: this.currentSession.expires_at,
        isExpired: this.currentSession.expires_at < Date.now() / 1000
      } : null,
      isAuthenticated: this.isAuthenticated()
    };
  }
}

// Create singleton instance
const authService = new SupabaseAuthService();

// Export for ES6 modules
export default authService;
export { authService, supabase };

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.SupabaseAuthService = authService;
  window.supabase = supabase;
}