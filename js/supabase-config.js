// Supabase Configuration and Initialization
// This file replaces firebase-config.js for the Supabase migration

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase configuration
// These values are safe to be public in client-side code
// Supabase security comes from RLS policies and server-side validation
const supabaseUrl = 'https://ffiprjmxwzidkrdubipt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaXByam14d3ppZGtyZHViaXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMTc1ODEsImV4cCI6MjA3MjU5MzU4MX0.ALnPITE9-FRczh3VboOfxax4BVtaQaMR835M5pcHO5Y';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth options
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export the client for use in other modules
export { supabase };
export default supabase;

// Helper functions for journal entries (equivalent to your JournalEntry class)
export class JournalEntry {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || data.userId; // Support both naming conventions
    this.title = data.title || '';
    this.content = data.content || '';
    this.voice_transcription = data.voice_transcription || data.voiceTranscription || null;
    this.emotional_analysis = data.emotional_analysis || data.emotionalAnalysis || {};
    this.ai_insights = data.ai_insights || data.aiInsights || {};
    this.synchronicity_tags = data.synchronicity_tags || data.synchronicityTags || [];
    this.shadow_work_prompts = data.shadow_work_prompts || data.shadowWorkPrompts || [];
    this.mood = data.mood || null;
    this.themes = data.themes || [];
    this.triggers = data.triggers || [];
    this.created_at = data.created_at || data.createdAt || null;
    this.updated_at = data.updated_at || data.updatedAt || null;
  }

  // Convert to format suitable for database insertion
  toDatabase() {
    return {
      title: this.title,
      content: this.content,
      voice_transcription: this.voice_transcription,
      emotional_analysis: this.emotional_analysis,
      ai_insights: this.ai_insights,
      synchronicity_tags: this.synchronicity_tags,
      shadow_work_prompts: this.shadow_work_prompts,
      mood: this.mood,
      themes: this.themes,
      triggers: this.triggers
    };
  }
}

// Journal API functions using Supabase
export const journalAPI = {
  // Create a new journal entry
  async createEntry(entryData) {
    const entry = new JournalEntry(entryData);
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([entry.toDatabase()])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get a specific journal entry by ID
  async getEntry(entryId) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all journal entries for the current user
  async getUserEntries(limit = 50) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Update a journal entry
  async updateEntry(entryId, updateData) {
    const { data, error } = await supabase
      .from('journal_entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a journal entry
  async deleteEntry(entryId) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', entryId);
    
    if (error) throw error;
    return { success: true };
  },

  // Search entries by content or title
  async searchEntries(query, limit = 20) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get entries by mood
  async getEntriesByMood(mood, limit = 20) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('mood', mood)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get entries with specific themes
  async getEntriesByThemes(themes, limit = 20) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .overlaps('themes', themes)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};

// Authentication helper functions
export const authAPI = {
  // Sign up with email and password
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Get current user
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }
};