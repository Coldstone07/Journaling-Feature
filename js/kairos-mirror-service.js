// Kairos Mirror Service - Sacred Interface for AI-Guided Inquiry
// Implements Five Keys methodology with Sacred Protocols

import { supabase } from './supabase-config.js';

class KairosMirrorService {
    constructor() {
        this.currentSession = null;
        this.debugMode = false;
    }

    // Enable debug logging
    enableDebug() {
        this.debugMode = true;
    }

    log(...args) {
        if (this.debugMode) {
            console.log('[KairosMirror]', ...args);
        }
    }

    // Sacred Check-In - Daily Ritual before journaling
    async performCheckIn(state, capacity) {
        this.log('Performing sacred check-in:', { state, capacity });
        
        const validStates = ['activated', 'centered', 'subtle'];
        const validCapacities = ['deep_dive', 'gentle', 'witnessing'];
        
        if (!validStates.includes(state)) {
            throw new Error(`Invalid state: ${state}. Must be one of: ${validStates.join(', ')}`);
        }
        
        if (!validCapacities.includes(capacity)) {
            throw new Error(`Invalid capacity: ${capacity}. Must be one of: ${validCapacities.join(', ')}`);
        }

        // Safety check for Activated + Deep Dive
        if (state === 'activated' && capacity === 'deep_dive') {
            const confirmation = await this.requestSafetyConfirmation();
            if (!confirmation) {
                capacity = 'gentle'; // Default to safer option
            }
        }

        return {
            state,
            capacity,
            turnBudget: this.calculateTurnBudget(capacity),
            timestamp: new Date().toISOString()
        };
    }

    // Calculate turn budget based on capacity
    calculateTurnBudget(capacity) {
        switch (capacity) {
            case 'witnessing': return 2;
            case 'gentle': return 4;
            case 'deep_dive': return 8;
            default: return 2;
        }
    }

    // Request safety confirmation for Activated + Deep Dive
    async requestSafetyConfirmation() {
        return new Promise((resolve) => {
            const confirmation = confirm(
                "You've selected Deep Dive while in an Activated state. " +
                "This combination can be intense. Do you feel resourced and safe to proceed?"
            );
            resolve(confirmation);
        });
    }

    // Multi-layered journal entry creation
    async createMultiLayeredEntry(entryData) {
        this.log('Creating multi-layered entry:', entryData);
        
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
            throw new Error('User not authenticated');
        }

        // Structure the multi-layered data
        const journalEntry = {
            user_id: user.user.id,
            title: entryData.title || '',
            
            // Narrative layer
            narrative: {
                text: entryData.narrative || '',
                auto_summary: null, // Generated later if needed
                user_keywords: entryData.keywords || []
            },
            
            // Emotional landscape
            emotional_landscape: entryData.emotions || [],
            
            // Somatic map
            somatic_map: entryData.somaticMarks || [],
            
            // Sacred check-in
            check_in: entryData.checkIn || {
                state: 'centered',
                capacity: 'gentle'
            },
            
            // Initialize Mirror interaction fields
            mirror_turns: [],
            resistance_count: 0,
            pattern_signals: {},
            
            // Legacy fields for compatibility
            content: entryData.narrative || '', // Maintain backward compatibility
            mood: entryData.mood || null,
            themes: entryData.themes || [],
            triggers: entryData.triggers || []
        };

        const { data, error } = await supabase
            .from('journal_entries')
            .insert([journalEntry])
            .select()
            .single();

        if (error) {
            throw error;
        }

        this.log('Multi-layered entry created:', data);
        return data;
    }

    // Ask the Mirror - Core Socratic Inquiry
    async askMirror(entryId, sessionId = null) {
        this.log('Asking the Mirror for entry:', entryId);
        
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) {
                throw new Error('User not authenticated');
            }

            // First, check for crisis content
            const entry = await this.getEntry(entryId);
            const crisisCheck = await this.checkForCrisis(entry.narrative?.text || entry.content);
            
            if (crisisCheck.crisis) {
                this.log('Crisis detected, returning safety resources');
                return {
                    crisis: true,
                    message: crisisCheck.message,
                    resources: crisisCheck.resources,
                    disableMirror: crisisCheck.disableMirror
                };
            }

            // Call the Mirror inquiry Edge Function
            const { data, error } = await supabase.functions.invoke('mirror-inquire', {
                body: {
                    entryId: entryId,
                    sessionId: sessionId || this.generateSessionId()
                }
            });

            if (error) {
                throw error;
            }

            this.log('Mirror response:', data);
            return data;

        } catch (error) {
            console.error('Error asking Mirror:', error);
            throw error;
        }
    }

    // Check for crisis content using Edge Function
    async checkForCrisis(content) {
        try {
            const { data, error } = await supabase.functions.invoke('crisis-detection', {
                body: { content }
            });

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error in crisis detection:', error);
            // Fail safe - if crisis detection fails, assume no crisis but log error
            return { crisis: false };
        }
    }

    // Analyze patterns using Sankara Engine
    async analyzePatterns(entryId) {
        this.log('Analyzing patterns for entry:', entryId);
        
        try {
            const { data, error } = await supabase.functions.invoke('sankara-patterns', {
                body: { entryId }
            });

            if (error) {
                throw error;
            }

            this.log('Pattern analysis result:', data);
            return data;
        } catch (error) {
            console.error('Error analyzing patterns:', error);
            throw error;
        }
    }

    // Submit user response to Mirror question
    async submitResponse(entryId, response, turnNumber) {
        this.log('Submitting response:', { entryId, response, turnNumber });
        
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) {
                throw new Error('User not authenticated');
            }

            // Check for resistance signals
            const isResistance = this.detectResistance(response);
            
            if (isResistance) {
                await this.incrementResistanceCount(entryId);
            }

            // Update the AI turn with user response
            const { data, error } = await supabase
                .from('ai_turns')
                .update({ 
                    user_response: response,
                    updated_at: new Date().toISOString()
                })
                .eq('entry_id', entryId)
                .eq('turn_number', turnNumber)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                success: true,
                isResistance,
                data
            };

        } catch (error) {
            console.error('Error submitting response:', error);
            throw error;
        }
    }

    // Detect resistance in user response (for Sacred Protocols)
    detectResistance(response) {
        if (!response || typeof response !== 'string') return false;
        
        const resistancePatterns = [
            /^(idk|dunno|don't know)$/i,
            /^(skip|pass|next)$/i,
            /^(stop|enough|no more)$/i,
            /^(nah|no|nope)$/i,
            /^[a-z]{1,3}$/i, // Very short responses
            /^(whatever|fine|sure)$/i
        ];

        const trimmedResponse = response.trim().toLowerCase();
        return resistancePatterns.some(pattern => pattern.test(trimmedResponse));
    }

    // Increment resistance count (Sacred Protocol)
    async incrementResistanceCount(entryId) {
        this.log('Incrementing resistance count for entry:', entryId);
        
        const { data, error } = await supabase
            .from('journal_entries')
            .update({ 
                resistance_count: supabase.sql`resistance_count + 1`
            })
            .eq('id', entryId)
            .select('resistance_count')
            .single();

        if (error) {
            console.error('Error incrementing resistance count:', error);
            return 0;
        }

        return data.resistance_count;
    }

    // Sacred Pause - intentional spaciousness
    async invokeSacredPause(entryId) {
        this.log('Invoking Sacred Pause for entry:', entryId);
        
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) {
                throw new Error('User not authenticated');
            }

            // Create a Sacred Pause AI turn
            const { data, error } = await supabase
                .from('ai_turns')
                .insert({
                    user_id: user.user.id,
                    entry_id: entryId,
                    key_used: 'Pause',
                    question: 'Take three slow breaths with me... What does this stillness want to tell you?',
                    turn_number: await this.getNextTurnNumber(entryId)
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                question: data.question,
                key: 'Pause',
                isPause: true,
                guidance: 'Take a moment to breathe and just be present. There\'s no rush.'
            };

        } catch (error) {
            console.error('Error invoking Sacred Pause:', error);
            throw error;
        }
    }

    // Get entry data
    async getEntry(entryId) {
        const { data, error } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('id', entryId)
            .single();

        if (error) {
            throw error;
        }

        return data;
    }

    // Get next turn number for an entry
    async getNextTurnNumber(entryId) {
        const { data, error } = await supabase
            .from('ai_turns')
            .select('turn_number')
            .eq('entry_id', entryId)
            .order('turn_number', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error getting turn number:', error);
            return 1;
        }

        return data.length > 0 ? data[0].turn_number + 1 : 1;
    }

    // Generate unique session ID
    generateSessionId() {
        return crypto.randomUUID();
    }

    // Get user profile for progressive unlocks
    async getUserProfile() {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // Not found is okay
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    // Initialize user profile on first use
    async initializeUserProfile(intentionCurrent = '', intentionAnchor = '') {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user.user.id,
                    intention_current: intentionCurrent,
                    intention_anchor: intentionAnchor,
                    onboarding_completed_at: new Date().toISOString(),
                    consent_flags: {
                        therapy_disclaimer: true,
                        crisis_policy: true,
                        data_usage: true
                    }
                }, {
                    onConflict: 'user_id'
                })
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        } catch (error) {
            console.error('Error initializing user profile:', error);
            throw error;
        }
    }

    // Debug and utility functions
    getDebugInfo() {
        return {
            hasSupabaseClient: !!supabase,
            currentSession: this.currentSession,
            debugMode: this.debugMode,
            service: 'KairosMirror'
        };
    }
}

// Export default instance
const kairosService = new KairosMirrorService();
export default kairosService;