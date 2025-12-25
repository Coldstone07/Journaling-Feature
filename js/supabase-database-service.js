// Supabase Database Service
// Complete replacement for Firebase Firestore operations with enhanced functionality

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { TypeValidators, TypeTransformers, APP_CONSTANTS } from './types.js';

// Configuration - Using actual Supabase credentials
const supabaseUrl = 'https://ffiprjmxwzidkrdubipt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaXByam14d3ppZGtyZHViaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTc1ODEsImV4cCI6MjA3MjU5MzU4MX0.ALnPITE9-FRczh3VboOfxax4BVtaQaMR835M5pcHO5Y';

// Create Supabase client with optimized configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'kairos-journaling-database@1.0.0'
    }
  }
});

/**
 * Comprehensive Database Service for Journal Operations
 * Provides all CRUD operations with robust error handling and validation
 */
class SupabaseDatabaseService {
  constructor() {
    this.supabase = supabase;
    this.tableName = 'journal_entries';
    this.isConnected = false;
    
    // Initialize connection
    this.initializeConnection();
  }

  /**
   * Initialize database connection and verify access
   */
  async initializeConnection() {
    try {
      // Test connection by attempting to read from the table
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.warn('Database connection warning:', error);
        this.isConnected = false;
      } else {
        this.isConnected = true;
        console.log('Database connection established successfully');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      this.isConnected = false;
    }
  }

  /**
   * Create a new journal entry
   * @param {Object} entryData - Journal entry data to insert
   * @param {string} entryData.title - Entry title
   * @param {string} entryData.content - Entry content
   * @param {Object} [options] - Additional options
   * @param {boolean} [options.validate] - Whether to validate data (default: true)
   * @returns {Promise<Object>} Created journal entry with ID
   */
  async createEntry(entryData, options = { validate: true }) {
    try {
      console.log('Creating journal entry:', { 
        hasTitle: !!entryData.title, 
        contentLength: entryData.content?.length,
        userId: entryData.user_id 
      });

      // Get current user if user_id not provided
      if (!entryData.user_id) {
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated. Please sign in to create journal entries.');
        }
        entryData.user_id = user.id;
      }

      // Validate input data
      if (options.validate) {
        const sanitizedData = TypeTransformers.sanitizeJournalEntry(entryData);
        if (!TypeValidators.isValidJournalEntry({ ...sanitizedData, user_id: entryData.user_id })) {
          throw new Error('Invalid journal entry data. Please check required fields.');
        }
        entryData = { ...entryData, ...sanitizedData };
      }

      // Ensure required fields
      if (!entryData.title?.trim()) {
        throw new Error('Entry title is required');
      }
      if (!entryData.content?.trim()) {
        throw new Error('Entry content is required');
      }

      // Prepare data for insertion
      const insertData = {
        user_id: entryData.user_id,
        title: entryData.title.trim(),
        content: entryData.content.trim(),
        voice_transcription: entryData.voice_transcription || null,
        emotional_analysis: entryData.emotional_analysis || {},
        ai_insights: entryData.ai_insights || {},
        synchronicity_tags: entryData.synchronicity_tags || [],
        shadow_work_prompts: entryData.shadow_work_prompts || [],
        mood: entryData.mood || null,
        themes: entryData.themes || [],
        triggers: entryData.triggers || []
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([insertData])
        .select()
        .single();
      
      if (error) {
        console.error('Create entry database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      console.log('Journal entry created successfully:', { 
        id: data.id, 
        title: data.title.substring(0, 50) + '...' 
      });
      
      return {
        success: true,
        data: data,
        error: null
      };
      
    } catch (error) {
      console.error('Create entry error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get a specific journal entry by ID
   * @param {string} entryId - ID of the journal entry
   * @param {Object} [options] - Query options
   * @param {boolean} [options.includeUser] - Include user info in response
   * @returns {Promise<Object>} Journal entry or null if not found
   */
  async getEntry(entryId, options = {}) {
    try {
      if (!entryId || typeof entryId !== 'string') {
        throw new Error('Entry ID is required and must be a string');
      }

      console.log('Fetching journal entry:', entryId);

      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', entryId);

      // Add user information if requested
      if (options.includeUser) {
        query = query.select(`
          *,
          profiles:user_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `);
      }

      const { data, error } = await query.single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          console.log('Journal entry not found:', entryId);
          return {
            success: true,
            data: null,
            error: 'Journal entry not found'
          };
        }
        console.error('Get entry database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      console.log('Journal entry retrieved successfully:', { 
        id: data.id, 
        title: data.title.substring(0, 50) + '...' 
      });
      
      return {
        success: true,
        data: data,
        error: null
      };
      
    } catch (error) {
      console.error('Get entry error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Get all journal entries for the current user
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=50] - Maximum number of results
   * @param {number} [options.offset=0] - Number of results to skip
   * @param {string} [options.orderBy='created_at'] - Column to order by
   * @param {boolean} [options.ascending=false] - Sort direction
   * @param {Object} [options.filters] - Additional filters
   * @returns {Promise<Object>} Array of journal entries
   */
  async getUserEntries(options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        orderBy = 'created_at',
        ascending = false,
        filters = {}
      } = options;

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated. Please sign in to view journal entries.');
      }

      console.log('Fetching user entries:', { 
        userId: user.id, 
        limit, 
        offset, 
        orderBy 
      });

      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      // Apply additional filters
      if (filters.mood) {
        query = query.eq('mood', filters.mood);
      }
      
      if (filters.themes && filters.themes.length > 0) {
        query = query.overlaps('themes', filters.themes);
      }
      
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error, count } = await query;
      
      if (error) {
        console.error('Get user entries database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      console.log('User entries retrieved successfully:', { 
        count: data?.length, 
        totalCount: count 
      });
      
      return {
        success: true,
        data: data || [],
        count: count || 0,
        error: null
      };
      
    } catch (error) {
      console.error('Get user entries error:', error);
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message
      };
    }
  }

  /**
   * Update a journal entry
   * @param {string} entryId - ID of the journal entry
   * @param {Object} updateData - Data to update
   * @param {Object} [options] - Update options
   * @param {boolean} [options.validate=true] - Whether to validate data
   * @returns {Promise<Object>} Updated journal entry
   */
  async updateEntry(entryId, updateData, options = { validate: true }) {
    try {
      if (!entryId || typeof entryId !== 'string') {
        throw new Error('Entry ID is required and must be a string');
      }

      if (!updateData || typeof updateData !== 'object') {
        throw new Error('Update data is required');
      }

      console.log('Updating journal entry:', { 
        entryId, 
        updateFields: Object.keys(updateData) 
      });

      // Validate and sanitize update data
      if (options.validate) {
        const sanitizedData = TypeTransformers.sanitizeJournalEntry(updateData);
        updateData = { ...updateData, ...sanitizedData };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });
      }

      // Don't allow updating user_id, id, created_at
      delete updateData.user_id;
      delete updateData.id;
      delete updateData.created_at;

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', entryId)
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          throw new Error('Journal entry not found or you do not have permission to update it');
        }
        console.error('Update entry database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      console.log('Journal entry updated successfully:', { 
        id: data.id, 
        updatedFields: Object.keys(updateData) 
      });
      
      return {
        success: true,
        data: data,
        error: null
      };
      
    } catch (error) {
      console.error('Update entry error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Delete a journal entry
   * @param {string} entryId - ID of the journal entry
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteEntry(entryId) {
    try {
      if (!entryId || typeof entryId !== 'string') {
        throw new Error('Entry ID is required and must be a string');
      }

      console.log('Deleting journal entry:', entryId);

      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', entryId);
      
      if (error) {
        console.error('Delete entry database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      console.log('Journal entry deleted successfully:', entryId);
      
      return {
        success: true,
        data: { deleted: true, id: entryId },
        error: null
      };
      
    } catch (error) {
      console.error('Delete entry error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Search journal entries by content or title
   * @param {string} searchQuery - Search query string
   * @param {Object} [options] - Search options
   * @param {number} [options.limit=20] - Maximum number of results
   * @param {string[]} [options.fields=['title', 'content']] - Fields to search
   * @param {boolean} [options.caseSensitive=false] - Case sensitive search
   * @returns {Promise<Object>} Array of matching journal entries
   */
  async searchEntries(searchQuery, options = {}) {
    try {
      if (!searchQuery || typeof searchQuery !== 'string') {
        throw new Error('Search query is required and must be a string');
      }

      const {
        limit = 20,
        fields = ['title', 'content'],
        caseSensitive = false
      } = options;

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated. Please sign in to search journal entries.');
      }

      console.log('Searching journal entries:', { 
        query: searchQuery.substring(0, 50), 
        fields, 
        limit 
      });

      const query = searchQuery.trim();
      const searchPattern = caseSensitive ? query : query.toLowerCase();
      
      let dbQuery = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id);

      // Build search condition based on fields
      if (fields.includes('title') && fields.includes('content')) {
        if (caseSensitive) {
          dbQuery = dbQuery.or(`title.like.*${query}*,content.like.*${query}*`);
        } else {
          dbQuery = dbQuery.or(`title.ilike.*${query}*,content.ilike.*${query}*`);
        }
      } else if (fields.includes('title')) {
        if (caseSensitive) {
          dbQuery = dbQuery.like('title', `*${query}*`);
        } else {
          dbQuery = dbQuery.ilike('title', `*${query}*`);
        }
      } else if (fields.includes('content')) {
        if (caseSensitive) {
          dbQuery = dbQuery.like('content', `*${query}*`);
        } else {
          dbQuery = dbQuery.ilike('content', `*${query}*`);
        }
      }

      const { data, error } = await dbQuery
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Search entries database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      console.log('Search completed:', { 
        query: searchQuery.substring(0, 50), 
        resultCount: data?.length 
      });
      
      return {
        success: true,
        data: data || [],
        query: searchQuery,
        error: null
      };
      
    } catch (error) {
      console.error('Search entries error:', error);
      return {
        success: false,
        data: [],
        query: searchQuery,
        error: error.message
      };
    }
  }

  /**
   * Full-text search using PostgreSQL's text search capabilities
   * @param {string} searchQuery - Search query string
   * @param {Object} [options] - Search options
   * @param {number} [options.limit=20] - Maximum number of results
   * @param {string} [options.language='english'] - Language for text search
   * @returns {Promise<Object>} Array of matching journal entries ranked by relevance
   */
  async fullTextSearch(searchQuery, options = {}) {
    try {
      if (!searchQuery || typeof searchQuery !== 'string') {
        throw new Error('Search query is required and must be a string');
      }

      const {
        limit = 20,
        language = 'english'
      } = options;

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated. Please sign in to search journal entries.');
      }

      console.log('Full-text searching journal entries:', { 
        query: searchQuery.substring(0, 50), 
        limit 
      });

      // Use the stored procedure for full-text search
      const { data, error } = await this.supabase
        .rpc('search_journal_entries', {
          search_query: searchQuery.trim(),
          result_limit: limit
        });
      
      if (error) {
        console.error('Full-text search database error:', error);
        // Fallback to regular search if stored procedure doesn't exist
        return await this.searchEntries(searchQuery, options);
      }
      
      console.log('Full-text search completed:', { 
        query: searchQuery.substring(0, 50), 
        resultCount: data?.length 
      });
      
      return {
        success: true,
        data: data || [],
        query: searchQuery,
        isFullTextSearch: true,
        error: null
      };
      
    } catch (error) {
      console.error('Full-text search error:', error);
      // Fallback to regular search
      return await this.searchEntries(searchQuery, options);
    }
  }

  /**
   * Get entries by mood
   * @param {string} mood - Mood to filter by
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=20] - Maximum number of results
   * @returns {Promise<Object>} Array of journal entries with the specified mood
   */
  async getEntriesByMood(mood, options = {}) {
    try {
      if (!mood || typeof mood !== 'string') {
        throw new Error('Mood is required and must be a string');
      }

      const { limit = 20 } = options;

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching entries by mood:', { mood, limit });

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .eq('mood', mood.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Get entries by mood database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      return {
        success: true,
        data: data || [],
        mood: mood,
        error: null
      };
      
    } catch (error) {
      console.error('Get entries by mood error:', error);
      return {
        success: false,
        data: [],
        mood: mood,
        error: error.message
      };
    }
  }

  /**
   * Get entries with specific themes
   * @param {string[]} themes - Array of themes to filter by
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=20] - Maximum number of results
   * @param {boolean} [options.matchAll=false] - Whether to match all themes or any
   * @returns {Promise<Object>} Array of journal entries with the specified themes
   */
  async getEntriesByThemes(themes, options = {}) {
    try {
      if (!Array.isArray(themes) || themes.length === 0) {
        throw new Error('Themes must be a non-empty array');
      }

      const { limit = 20, matchAll = false } = options;

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching entries by themes:', { themes, limit, matchAll });

      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id);

      if (matchAll) {
        // Match all themes (array contains all specified themes)
        query = query.contains('themes', themes);
      } else {
        // Match any themes (array overlaps with specified themes)
        query = query.overlaps('themes', themes);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Get entries by themes database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      return {
        success: true,
        data: data || [],
        themes: themes,
        matchAll: matchAll,
        error: null
      };
      
    } catch (error) {
      console.error('Get entries by themes error:', error);
      return {
        success: false,
        data: [],
        themes: themes,
        error: error.message
      };
    }
  }

  /**
   * Get entries within a date range
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=50] - Maximum number of results
   * @returns {Promise<Object>} Array of journal entries within the date range
   */
  async getEntriesByDateRange(startDate, endDate, options = {}) {
    try {
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }

      const { limit = 50 } = options;

      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching entries by date range:', { startDate, endDate, limit });

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Get entries by date range database error:', error);
        throw this.transformDatabaseError(error);
      }
      
      return {
        success: true,
        data: data || [],
        dateRange: { startDate, endDate },
        error: null
      };
      
    } catch (error) {
      console.error('Get entries by date range error:', error);
      return {
        success: false,
        data: [],
        dateRange: { startDate, endDate },
        error: error.message
      };
    }
  }

  /**
   * Get statistics about user's journal entries
   * @returns {Promise<Object>} Statistics object
   */
  async getUserStatistics() {
    try {
      // Get current user
      const { data: { user }, error: userError } = await this.supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching user statistics');

      // Get total count
      const { count: totalEntries, error: countError } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) {
        throw this.transformDatabaseError(countError);
      }

      // Get entries from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: recentEntries, error: recentError } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (recentError) {
        throw this.transformDatabaseError(recentError);
      }

      // Get mood distribution
      const { data: moodData, error: moodError } = await this.supabase
        .from(this.tableName)
        .select('mood')
        .eq('user_id', user.id)
        .not('mood', 'is', null);

      if (moodError) {
        throw this.transformDatabaseError(moodError);
      }

      // Calculate mood distribution
      const moodCounts = {};
      (moodData || []).forEach(entry => {
        const mood = entry.mood;
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });

      // Get first entry date
      const { data: firstEntry, error: firstError } = await this.supabase
        .from(this.tableName)
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1);

      if (firstError) {
        throw this.transformDatabaseError(firstError);
      }

      const statistics = {
        totalEntries: totalEntries || 0,
        recentEntries: recentEntries || 0,
        firstEntryDate: firstEntry?.[0]?.created_at || null,
        moodDistribution: moodCounts,
        averageEntriesPerWeek: totalEntries && firstEntry?.[0]?.created_at ? 
          Math.round((totalEntries * 7) / ((Date.now() - new Date(firstEntry[0].created_at).getTime()) / (1000 * 60 * 60 * 24))) : 0
      };
      
      console.log('User statistics retrieved:', statistics);
      
      return {
        success: true,
        data: statistics,
        error: null
      };
      
    } catch (error) {
      console.error('Get user statistics error:', error);
      return {
        success: false,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Subscribe to real-time changes for user's journal entries
   * @param {Function} callback - Callback function to handle real-time updates
   * @param {Object} [options] - Subscription options
   * @returns {Object} Subscription object with unsubscribe method
   */
  subscribeToUserEntries(callback, options = {}) {
    try {
      if (typeof callback !== 'function') {
        throw new Error('Callback function is required');
      }

      console.log('Setting up real-time subscription for user entries');

      const channel = this.supabase
        .channel('journal_entries_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: this.tableName
        }, (payload) => {
          console.log('Real-time update received:', { 
            event: payload.eventType, 
            entryId: payload.new?.id || payload.old?.id 
          });
          
          // Transform payload for easier handling
          const transformedPayload = {
            event: payload.eventType, // INSERT, UPDATE, DELETE
            new: payload.new || null,
            old: payload.old || null,
            table: payload.table,
            timestamp: new Date().toISOString()
          };
          
          callback(transformedPayload);
        })
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return {
        unsubscribe: () => {
          console.log('Unsubscribing from real-time updates');
          this.supabase.removeChannel(channel);
        },
        channel: channel
      };
      
    } catch (error) {
      console.error('Subscribe to user entries error:', error);
      return {
        unsubscribe: () => {},
        error: error.message
      };
    }
  }

  /**
   * Batch operations for multiple entries
   * @param {Object[]} operations - Array of operations to perform
   * @param {string} operations[].type - Operation type ('create', 'update', 'delete')
   * @param {string} [operations[].id] - Entry ID (for update/delete)
   * @param {Object} [operations[].data] - Data for operation
   * @returns {Promise<Object>} Batch operation results
   */
  async batchOperations(operations) {
    try {
      if (!Array.isArray(operations) || operations.length === 0) {
        throw new Error('Operations array is required and must not be empty');
      }

      console.log('Performing batch operations:', { count: operations.length });

      const results = [];
      const errors = [];

      // Process operations sequentially to maintain data consistency
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        
        try {
          let result;
          
          switch (operation.type) {
            case 'create':
              result = await this.createEntry(operation.data);
              break;
            case 'update':
              result = await this.updateEntry(operation.id, operation.data);
              break;
            case 'delete':
              result = await this.deleteEntry(operation.id);
              break;
            default:
              throw new Error(`Unknown operation type: ${operation.type}`);
          }
          
          results.push({ index: i, operation: operation.type, result });
          
        } catch (error) {
          errors.push({ index: i, operation: operation.type, error: error.message });
        }
      }

      console.log('Batch operations completed:', { 
        successful: results.length, 
        failed: errors.length 
      });

      return {
        success: errors.length === 0,
        results: results,
        errors: errors,
        total: operations.length,
        successful: results.length,
        failed: errors.length
      };
      
    } catch (error) {
      console.error('Batch operations error:', error);
      return {
        success: false,
        results: [],
        errors: [{ error: error.message }],
        total: operations?.length || 0,
        successful: 0,
        failed: operations?.length || 0
      };
    }
  }

  /**
   * Transform database errors into user-friendly messages
   * @param {Object} error - Supabase database error
   * @returns {Error} Transformed error
   */
  transformDatabaseError(error) {
    const errorMessages = {
      '23505': 'A journal entry with this information already exists.',
      '23503': 'Invalid reference to user or related data.',
      '23514': 'Data validation failed. Please check your input.',
      '42501': 'You do not have permission to perform this operation.',
      '42P01': 'Database table not found. Please contact support.',
      'PGRST116': 'The requested journal entry was not found.',
      'PGRST301': 'Row level security policy violated. Access denied.',
      'connection_error': 'Unable to connect to database. Please try again.',
      'timeout_error': 'Database operation timed out. Please try again.'
    };

    let message = error.message || 'An unexpected database error occurred';
    
    // Map specific error codes to user-friendly messages
    if (error.code && errorMessages[error.code]) {
      message = errorMessages[error.code];
    } else if (error.message?.includes('duplicate key')) {
      message = 'A journal entry with this information already exists.';
    } else if (error.message?.includes('permission denied')) {
      message = 'You do not have permission to perform this operation.';
    } else if (error.message?.includes('connection')) {
      message = 'Unable to connect to database. Please check your internet connection and try again.';
    }

    const transformedError = new Error(message);
    transformedError.originalError = error;
    transformedError.code = error.code;
    return transformedError;
  }

  /**
   * Get debugging information about database connection and state
   * @returns {Object} Debug information
   */
  getDebugInfo() {
    return {
      isConnected: this.isConnected,
      hasSupabaseClient: !!this.supabase,
      tableName: this.tableName,
      supabaseUrl: this.supabase?.supabaseUrl || 'Not configured',
      auth: {
        hasSession: !!this.supabase?.auth?.session,
        user: this.supabase?.auth?.user?.id || 'Not authenticated'
      }
    };
  }
}

// Create singleton instance
const databaseService = new SupabaseDatabaseService();

// Export for ES6 modules
export default databaseService;
export { databaseService, supabase };

// Also make available globally for non-module usage
if (typeof window !== 'undefined') {
  window.SupabaseDatabaseService = databaseService;
}