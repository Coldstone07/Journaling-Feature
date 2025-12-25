// TypeScript-style interfaces for JavaScript
// This file provides type definitions and validation for the journaling application

/**
 * @typedef {Object} JournalEntry
 * @property {string} [id] - Unique identifier for the journal entry
 * @property {string} user_id - User ID who owns this entry
 * @property {string} title - Entry title
 * @property {string} content - Main entry content
 * @property {string|null} [voice_transcription] - Voice-to-text transcription
 * @property {EmotionalAnalysis} [emotional_analysis] - AI emotional analysis results
 * @property {AIInsights} [ai_insights] - AI-generated insights and suggestions
 * @property {string[]} [synchronicity_tags] - Tags for synchronicity events
 * @property {string[]} [shadow_work_prompts] - Shadow work prompts generated
 * @property {string|null} [mood] - User's reported mood
 * @property {string[]} [themes] - Themes identified in the entry
 * @property {string[]} [triggers] - Emotional triggers identified
 * @property {string} [created_at] - ISO timestamp when created
 * @property {string} [updated_at] - ISO timestamp when last updated
 */

/**
 * @typedef {Object} JournalEntryInsert
 * @property {string} user_id - User ID who owns this entry
 * @property {string} title - Entry title
 * @property {string} content - Main entry content
 * @property {string|null} [voice_transcription] - Voice-to-text transcription
 * @property {EmotionalAnalysis} [emotional_analysis] - AI emotional analysis results
 * @property {AIInsights} [ai_insights] - AI-generated insights and suggestions
 * @property {string[]} [synchronicity_tags] - Tags for synchronicity events
 * @property {string[]} [shadow_work_prompts] - Shadow work prompts generated
 * @property {string|null} [mood] - User's reported mood
 * @property {string[]} [themes] - Themes identified in the entry
 * @property {string[]} [triggers] - Emotional triggers identified
 */

/**
 * @typedef {Object} JournalEntryUpdate
 * @property {string} [title] - Entry title
 * @property {string} [content] - Main entry content
 * @property {string|null} [voice_transcription] - Voice-to-text transcription
 * @property {EmotionalAnalysis} [emotional_analysis] - AI emotional analysis results
 * @property {AIInsights} [ai_insights] - AI-generated insights and suggestions
 * @property {string[]} [synchronicity_tags] - Tags for synchronicity events
 * @property {string[]} [shadow_work_prompts] - Shadow work prompts generated
 * @property {string|null} [mood] - User's reported mood
 * @property {string[]} [themes] - Themes identified in the entry
 * @property {string[]} [triggers] - Emotional triggers identified
 */

/**
 * @typedef {Object} EmotionalAnalysis
 * @property {string} [dominant_emotion] - Primary emotion detected
 * @property {EmotionScores} [emotions] - Individual emotion scores
 * @property {number} [sentiment_score] - Overall sentiment (-1 to 1)
 * @property {number} [confidence] - Confidence score (0 to 1)
 * @property {string} [analysis_version] - Version of analysis algorithm used
 * @property {string} [processed_at] - ISO timestamp when analysis was performed
 */

/**
 * @typedef {Object} EmotionScores
 * @property {number} [joy] - Joy/happiness score (0-1)
 * @property {number} [sadness] - Sadness score (0-1)
 * @property {number} [anger] - Anger score (0-1)
 * @property {number} [fear] - Fear/anxiety score (0-1)
 * @property {number} [disgust] - Disgust score (0-1)
 * @property {number} [surprise] - Surprise score (0-1)
 * @property {number} [trust] - Trust score (0-1)
 * @property {number} [anticipation] - Anticipation score (0-1)
 */

/**
 * @typedef {Object} AIInsights
 * @property {string[]} [themes] - Main themes identified in the entry
 * @property {string[]} [key_insights] - Key insights extracted
 * @property {string[]} [growth_areas] - Areas for personal growth
 * @property {string[]} [reflection_prompts] - Suggested reflection questions
 * @property {string[]} [patterns] - Behavioral or emotional patterns detected
 * @property {string[]} [action_items] - Suggested action items
 * @property {number} [insight_confidence] - Confidence in insights (0-1)
 * @property {string} [model_version] - AI model version used
 * @property {string} [processed_at] - ISO timestamp when analysis was performed
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User's email address
 * @property {string} [phone] - User's phone number
 * @property {boolean} email_confirmed_at - Whether email is confirmed
 * @property {string} created_at - ISO timestamp when user was created
 * @property {string} updated_at - ISO timestamp when user was last updated
 * @property {UserMetadata} [user_metadata] - Additional user data
 * @property {AppMetadata} [app_metadata] - App-specific metadata
 */

/**
 * @typedef {Object} UserMetadata
 * @property {string} [full_name] - User's full name
 * @property {string} [avatar_url] - URL to user's avatar image
 * @property {string} [timezone] - User's timezone
 * @property {UserPreferences} [preferences] - User preferences
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} [theme] - UI theme preference ('light', 'dark', 'auto')
 * @property {string} [language] - Preferred language code
 * @property {boolean} [email_notifications] - Whether to receive email notifications
 * @property {boolean} [daily_reminders] - Whether to receive daily journal reminders
 * @property {string} [reminder_time] - Preferred reminder time (HH:MM format)
 * @property {boolean} [ai_insights_enabled] - Whether to enable AI insights
 */

/**
 * @typedef {Object} AppMetadata
 * @property {string[]} [roles] - User roles
 * @property {string} [plan] - Subscription plan
 * @property {boolean} [is_admin] - Whether user is an admin
 */

/**
 * @typedef {Object} Session
 * @property {string} access_token - JWT access token
 * @property {string} refresh_token - Refresh token
 * @property {number} expires_in - Token expiry time in seconds
 * @property {number} expires_at - Unix timestamp when token expires
 * @property {string} token_type - Token type (usually 'bearer')
 * @property {User} user - User object
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User|null} user - User object if successful
 * @property {Session|null} session - Session object if successful
 * @property {string|null} error - Error message if failed
 */

/**
 * @typedef {Object} DatabaseResponse
 * @property {any|null} data - Response data if successful
 * @property {string|null} error - Error message if failed
 * @property {number} [count] - Total count for paginated queries
 */

/**
 * @typedef {Object} QueryOptions
 * @property {number} [limit] - Maximum number of results
 * @property {number} [offset] - Number of results to skip
 * @property {string} [orderBy] - Column to order by
 * @property {boolean} [ascending] - Sort direction
 * @property {Object} [filters] - Additional filters to apply
 */

/**
 * @typedef {Object} SearchOptions
 * @property {string} query - Search query string
 * @property {number} [limit] - Maximum number of results
 * @property {string[]} [fields] - Fields to search in
 * @property {boolean} [fuzzy] - Whether to use fuzzy matching
 * @property {Object} [filters] - Additional filters to apply
 */

// Type validation functions
export const TypeValidators = {
  /**
   * Validate journal entry data
   * @param {any} data - Data to validate
   * @returns {boolean} Whether data is valid
   */
  isValidJournalEntry(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Required fields
    if (!data.user_id || typeof data.user_id !== 'string') return false;
    if (!data.title || typeof data.title !== 'string') return false;
    if (!data.content || typeof data.content !== 'string') return false;
    
    // Optional fields type checking
    if (data.voice_transcription !== undefined && 
        data.voice_transcription !== null && 
        typeof data.voice_transcription !== 'string') return false;
    
    if (data.mood !== undefined && 
        data.mood !== null && 
        typeof data.mood !== 'string') return false;
    
    if (data.themes !== undefined && !Array.isArray(data.themes)) return false;
    if (data.triggers !== undefined && !Array.isArray(data.triggers)) return false;
    if (data.synchronicity_tags !== undefined && !Array.isArray(data.synchronicity_tags)) return false;
    if (data.shadow_work_prompts !== undefined && !Array.isArray(data.shadow_work_prompts)) return false;
    
    return true;
  },

  /**
   * Validate emotional analysis data
   * @param {any} data - Data to validate
   * @returns {boolean} Whether data is valid
   */
  isValidEmotionalAnalysis(data) {
    if (!data || typeof data !== 'object') return true; // Optional field
    
    if (data.dominant_emotion && typeof data.dominant_emotion !== 'string') return false;
    if (data.sentiment_score !== undefined && typeof data.sentiment_score !== 'number') return false;
    if (data.confidence !== undefined && typeof data.confidence !== 'number') return false;
    
    if (data.emotions && typeof data.emotions === 'object') {
      const validEmotions = ['joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'trust', 'anticipation'];
      for (const [emotion, score] of Object.entries(data.emotions)) {
        if (!validEmotions.includes(emotion) || typeof score !== 'number' || score < 0 || score > 1) {
          return false;
        }
      }
    }
    
    return true;
  },

  /**
   * Validate AI insights data
   * @param {any} data - Data to validate
   * @returns {boolean} Whether data is valid
   */
  isValidAIInsights(data) {
    if (!data || typeof data !== 'object') return true; // Optional field
    
    const arrayFields = ['themes', 'key_insights', 'growth_areas', 'reflection_prompts', 'patterns', 'action_items'];
    
    for (const field of arrayFields) {
      if (data[field] !== undefined && !Array.isArray(data[field])) return false;
    }
    
    if (data.insight_confidence !== undefined && 
        (typeof data.insight_confidence !== 'number' || data.insight_confidence < 0 || data.insight_confidence > 1)) {
      return false;
    }
    
    return true;
  },

  /**
   * Validate user data
   * @param {any} data - Data to validate
   * @returns {boolean} Whether data is valid
   */
  isValidUser(data) {
    if (!data || typeof data !== 'object') return false;
    
    if (!data.id || typeof data.id !== 'string') return false;
    if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) return false;
    
    return true;
  },

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Whether email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result with strength info
   */
  validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { isValid: false, strength: 'invalid', message: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { isValid: false, strength: 'weak', message: 'Password must be at least 6 characters long' };
    }
    
    let strength = 'weak';
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    
    if (score >= 4) strength = 'strong';
    else if (score >= 2) strength = 'medium';
    
    return {
      isValid: password.length >= 6,
      strength,
      score,
      message: strength === 'strong' ? 'Strong password' : 
               strength === 'medium' ? 'Medium strength password' : 
               'Weak password - consider adding uppercase, numbers, or symbols'
    };
  }
};

// Data transformation utilities
export const TypeTransformers = {
  /**
   * Transform Firebase document to Supabase format
   * @param {Object} firebaseDoc - Firebase document data
   * @returns {Object} Supabase-formatted data
   */
  firebaseToSupabase(firebaseDoc) {
    if (!firebaseDoc) return null;
    
    return {
      id: firebaseDoc.id,
      user_id: firebaseDoc.userId,
      title: firebaseDoc.title || '',
      content: firebaseDoc.content || '',
      voice_transcription: firebaseDoc.voiceTranscription || null,
      emotional_analysis: firebaseDoc.emotionalAnalysis || {},
      ai_insights: firebaseDoc.aiInsights || {},
      synchronicity_tags: firebaseDoc.synchronicityTags || [],
      shadow_work_prompts: firebaseDoc.shadowWorkPrompts || [],
      mood: firebaseDoc.mood || null,
      themes: firebaseDoc.themes || [],
      triggers: firebaseDoc.triggers || [],
      created_at: firebaseDoc.createdAt?.toDate?.()?.toISOString?.() || firebaseDoc.createdAt,
      updated_at: firebaseDoc.updatedAt?.toDate?.()?.toISOString?.() || firebaseDoc.updatedAt
    };
  },

  /**
   * Transform Supabase row to client format
   * @param {Object} supabaseRow - Supabase row data
   * @returns {Object} Client-formatted data
   */
  supabaseToClient(supabaseRow) {
    if (!supabaseRow) return null;
    
    return {
      id: supabaseRow.id,
      userId: supabaseRow.user_id,
      title: supabaseRow.title,
      content: supabaseRow.content,
      voiceTranscription: supabaseRow.voice_transcription,
      emotionalAnalysis: supabaseRow.emotional_analysis,
      aiInsights: supabaseRow.ai_insights,
      synchronicityTags: supabaseRow.synchronicity_tags,
      shadowWorkPrompts: supabaseRow.shadow_work_prompts,
      mood: supabaseRow.mood,
      themes: supabaseRow.themes,
      triggers: supabaseRow.triggers,
      createdAt: supabaseRow.created_at,
      updatedAt: supabaseRow.updated_at
    };
  },

  /**
   * Sanitize journal entry data
   * @param {Object} data - Raw entry data
   * @returns {Object} Sanitized entry data
   */
  sanitizeJournalEntry(data) {
    if (!data || typeof data !== 'object') return null;
    
    return {
      title: String(data.title || '').trim().slice(0, 500),
      content: String(data.content || '').trim().slice(0, 50000),
      voice_transcription: data.voice_transcription ? 
        String(data.voice_transcription).trim().slice(0, 50000) : null,
      emotional_analysis: typeof data.emotional_analysis === 'object' ? 
        data.emotional_analysis : {},
      ai_insights: typeof data.ai_insights === 'object' ? 
        data.ai_insights : {},
      synchronicity_tags: Array.isArray(data.synchronicity_tags) ? 
        data.synchronicity_tags.slice(0, 20).map(tag => String(tag).trim().slice(0, 100)) : [],
      shadow_work_prompts: Array.isArray(data.shadow_work_prompts) ? 
        data.shadow_work_prompts.slice(0, 10).map(prompt => String(prompt).trim().slice(0, 1000)) : [],
      mood: data.mood ? String(data.mood).trim().slice(0, 50) : null,
      themes: Array.isArray(data.themes) ? 
        data.themes.slice(0, 20).map(theme => String(theme).trim().slice(0, 100)) : [],
      triggers: Array.isArray(data.triggers) ? 
        data.triggers.slice(0, 20).map(trigger => String(trigger).trim().slice(0, 100)) : []
    };
  }
};

// Constants for the application
export const APP_CONSTANTS = {
  // Database limits
  MAX_TITLE_LENGTH: 500,
  MAX_CONTENT_LENGTH: 50000,
  MAX_VOICE_TRANSCRIPTION_LENGTH: 50000,
  MAX_TAGS: 20,
  MAX_TAG_LENGTH: 100,
  MAX_PROMPTS: 10,
  MAX_PROMPT_LENGTH: 1000,
  MAX_MOOD_LENGTH: 50,
  MAX_THEMES: 20,
  MAX_TRIGGERS: 20,
  
  // Emotion types
  EMOTION_TYPES: [
    'joy', 'sadness', 'anger', 'fear', 'disgust', 'surprise', 'trust', 'anticipation'
  ],
  
  // Mood options
  MOOD_OPTIONS: [
    'excellent', 'good', 'okay', 'bad', 'terrible',
    'happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'tired'
  ],
  
  // Theme categories
  THEME_CATEGORIES: [
    'relationships', 'work', 'health', 'family', 'goals', 'fears',
    'achievements', 'challenges', 'growth', 'spirituality', 'creativity', 'love'
  ],
  
  // AI insight types
  INSIGHT_TYPES: [
    'pattern', 'growth_opportunity', 'strength', 'challenge', 'recommendation', 'reflection'
  ]
};

// Export types for documentation purposes
export const TYPES_DOCUMENTATION = {
  JournalEntry: 'Main journal entry object with all fields',
  JournalEntryInsert: 'Data structure for creating new journal entries',
  JournalEntryUpdate: 'Data structure for updating existing journal entries',
  EmotionalAnalysis: 'AI-generated emotional analysis of journal content',
  AIInsights: 'AI-generated insights and recommendations',
  User: 'User account information',
  Session: 'Authentication session data',
  AuthResponse: 'Response format for authentication operations',
  DatabaseResponse: 'Response format for database operations'
};