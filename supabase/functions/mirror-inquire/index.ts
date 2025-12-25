// Kairos Mirror - Core Inquiry Engine
// Sacred Socratic AI that reflects wisdom through Five Keys methodology

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MirrorContext {
  entryId: string
  narrative: string
  emotions: Array<{label: string, intensity: number}>
  somaticMarks: Array<{region: string, descriptors: string[], intensity: number}>
  checkIn: {state: string, capacity: string}
  resistanceCount: number
  weeksActive: number
  userOptedPossibility: boolean
}

interface KeyPrompt {
  key: string
  systemPrompt: string
  temperature: number
}

class MirrorInquirer {
  private supabase: any
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
  }

  // Five Keys Selection Algorithm - Sacred Protocols
  selectKey(context: MirrorContext): string {
    // Sacred Pause when resistance builds
    if (context.resistanceCount >= 2) return "Pause"
    
    // Bridge when disconnected from body
    if (context.somaticMarks.length === 0) return "Bridge"
    
    // Mirror for intense challenging emotions  
    const hardEmotions = ['shame', 'fear', 'grief', 'anger', 'rage', 'despair']
    const maxIntensity = Math.max(...context.emotions.map(e => e.intensity))
    const topEmotion = context.emotions.find(e => e.intensity === maxIntensity)?.label?.toLowerCase()
    
    if (maxIntensity >= 8 && topEmotion && hardEmotions.includes(topEmotion)) {
      return "Mirror"
    }
    
    // Vista for analysis-seeking language
    const analysisLanguage = /\b(why|understand|analyze|figure out|make sense|rational)\b/i
    if (analysisLanguage.test(context.narrative)) {
      return "Vista"
    }
    
    // Possibility only for advanced users who opted in
    if (context.weeksActive >= 13 && context.userOptedPossibility) {
      return "Possibility"
    }
    
    // Root as grounding default
    return "Root"
  }

  // Crisis Detection - Pre-LLM Safety Screen
  detectCrisis(narrative: string): boolean {
    const crisisKeywords = [
      'kill myself', 'end my life', 'suicide', 'self harm', 'hurt myself',
      'want to die', 'better off dead', 'can\'t go on', 'no point living'
    ]
    
    const lowerNarrative = narrative.toLowerCase()
    return crisisKeywords.some(keyword => lowerNarrative.includes(keyword))
  }

  // Sacred Prompt Engineering - Five Keys
  buildPrompt(key: string, context: MirrorContext): KeyPrompt {
    const basePersona = `You are "The Mirror" - a presence of Unconditional Presence, Gentle Curiosity, Spacious Patience, and Warm Neutrality.

Your sacred purpose: Help users access their own wisdom through Socratic inquiry ONLY.

NEVER give advice, interpretation, diagnosis, or plans. Ask ONE concise question (≤50 words).
Honor resistance as wisdom. Move at the speed of safety. Trust their inner knowing.

Current context: ${context.checkIn.state} state, ${context.checkIn.capacity} capacity.`

    switch (key) {
      case "Mirror":
        return {
          key: "Mirror",
          systemPrompt: `${basePersona}

MIRROR KEY - Reflective Validation:
Reflect back what you hear with gentle accuracy. Use their exact words when possible.
Pattern: "I'm hearing..." "It sounds like..." "I notice..."
Focus: Accurate, validating reflection that helps them feel truly seen.

Their sharing: "${context.narrative}"
Their emotions: ${context.emotions.map(e => `${e.label} (${e.intensity}/10)`).join(', ')}`,
          temperature: 0.4
        }

      case "Root":
        return {
          key: "Root", 
          systemPrompt: `${basePersona}

ROOT KEY - Gentle Depth Tracing:
Invite soft descent toward source patterns without pushing.
Pattern: "When did you first notice..." "What does this protect?" "What needs..."
Focus: Gentle excavation of deeper layers with complete safety.

Their sharing: "${context.narrative}"
Body signals: ${context.somaticMarks.map(s => `${s.region}: ${s.descriptors.join(', ')}`).join('; ')}`,
          temperature: 0.5
        }

      case "Bridge":
        return {
          key: "Bridge",
          systemPrompt: `${basePersona}

BRIDGE KEY - Body Connection:
Link narrative to somatic wisdom. Help them feel what's alive in their body.
Pattern: "Where is this in your body?" "What's the texture/temperature/movement?"
Focus: Sacred bridge between story and body knowing.

Their sharing: "${context.narrative}"
Current body state: ${context.somaticMarks.length > 0 ? 
  context.somaticMarks.map(s => `${s.region}: ${s.descriptors.join(', ')}`).join('; ') : 
  'No body awareness noted yet'}`,
          temperature: 0.4
        }

      case "Vista": 
        return {
          key: "Vista",
          systemPrompt: `${basePersona}

VISTA KEY - Perspective Expansion:
Open wider views without fixing or solving. Invite spacious seeing.
Pattern: "What might this look like from 10 years out?" "What would your wisest self see?"
Focus: Gentle loosening of limiting frames, invitation to broader perspective.

Their sharing: "${context.narrative}"
Their inner anchor: This person seeks expanded perspective while staying grounded.`,
          temperature: 0.6
        }

      case "Possibility":
        return {
          key: "Possibility", 
          systemPrompt: `${basePersona}

POSSIBILITY KEY - Integration to Breath-Sized Action:
ONLY for users 13+ weeks who opted in. Translate insight to tiny embodied experiments.
Pattern: "What is one breath-sized step?" "How would you know it's enough for today?"
Focus: Micro-practices that honor the insight without overwhelming.

Their sharing: "${context.narrative}"
Integration focus: What tiny step might honor this insight before sleep?`,
          temperature: 0.5
        }

      case "Pause":
        return {
          key: "Pause",
          systemPrompt: `${basePersona}

SACRED PAUSE - Intentional Spaciousness:
This person needs gentle space, not more inquiry. Offer breath, stillness, or soft witnessing.
Simply acknowledge the pause is wise and ask what they need in this moment.
Pattern: "I honor this pause..." "What does this stillness want to tell you?"
Focus: Sacred rest, no probing, complete acceptance.`,
          temperature: 0.3
        }

      default:
        throw new Error(`Unknown key: ${key}`)
    }
  }

  // Output Guardrails - Post-LLM Safety
  validateOutput(question: string): {valid: boolean, reason?: string} {
    const bannedPatterns = [
      /you should/i,
      /try to/i, 
      /why don't you/i,
      /have you considered/i,
      /it sounds like you need to/i,
      /steps?:/i,
      /\d+\./i, // numbered lists
      /I suggest/i,
      /my advice/i
    ]

    for (const pattern of bannedPatterns) {
      if (pattern.test(question)) {
        return {valid: false, reason: `Contains advice pattern: ${pattern}`}
      }
    }

    if (question.length > 150) {
      return {valid: false, reason: "Question too long (>150 chars)"}
    }

    if (!question.trim().endsWith('?')) {
      return {valid: false, reason: "Not a question"}
    }

    return {valid: true}
  }

  // Call Gemini via existing pattern
  async callGemini(prompt: string, temperature: number = 0.5): Promise<string> {
    try {
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/call-gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify({
          prompt,
          temperature
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.text || data.response || ''
    } catch (error) {
      console.error('Error calling Gemini:', error)
      throw error
    }
  }

  // Main inquiry orchestration
  async processInquiry(context: MirrorContext): Promise<{question: string, key: string, crisis?: boolean}> {
    // Crisis check first
    if (this.detectCrisis(context.narrative)) {
      return {
        question: '',
        key: 'Crisis',
        crisis: true
      }
    }

    // Select appropriate key
    const selectedKey = this.selectKey(context)
    const keyPrompt = this.buildPrompt(selectedKey, context)

    // Generate question with retries
    let attempts = 0
    const maxAttempts = 2

    while (attempts < maxAttempts) {
      try {
        const question = await this.callGemini(keyPrompt.systemPrompt, keyPrompt.temperature)
        const validation = this.validateOutput(question)

        if (validation.valid) {
          return {
            question: question.trim(),
            key: selectedKey
          }
        }

        console.log(`Attempt ${attempts + 1}: Invalid output - ${validation.reason}`)
        attempts++

        // Add stronger constraints for retry
        if (attempts === maxAttempts - 1) {
          keyPrompt.systemPrompt += "\n\nCRITICAL: Ask only ONE gentle question. NO advice. NO steps. NO suggestions. Just curious inquiry."
        }

      } catch (error) {
        console.error(`Attempt ${attempts + 1} failed:`, error)
        attempts++
      }
    }

    // Fallback question if all attempts fail
    return {
      question: "What feels most alive in this for you right now?",
      key: "Mirror"
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { entryId, sessionId } = await req.json()

    if (!entryId) {
      return new Response(
        JSON.stringify({ error: 'entryId required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const inquirer = new MirrorInquirer()

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user } } = await inquirer.supabase.auth.getUser(token)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Fetch entry and user profile
    const { data: entry } = await inquirer.supabase
      .from('journal_entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single()

    if (!entry) {
      return new Response(
        JSON.stringify({ error: 'Entry not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const { data: profile } = await inquirer.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Build context
    const context: MirrorContext = {
      entryId,
      narrative: entry.narrative?.text || entry.content || '',
      emotions: entry.emotional_landscape || [],
      somaticMarks: entry.somatic_map || [],
      checkIn: entry.check_in || {state: 'centered', capacity: 'gentle'},
      resistanceCount: entry.resistance_count || 0,
      weeksActive: profile?.weeks_since_onboarding || 0,
      userOptedPossibility: false // TODO: check feature flags
    }

    // Process inquiry
    const result = await inquirer.processInquiry(context)

    if (result.crisis) {
      // Log safety event
      await inquirer.supabase
        .from('safety_events')
        .insert({
          user_id: user.id,
          event_type: 'crisis_detected',
          severity_level: 4
        })

      return new Response(
        JSON.stringify({
          crisis: true,
          message: "I'm concerned about your safety. If you're in immediate danger, please call emergency services. Would you like me to provide crisis resources for your region?"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store AI turn
    const turnNumber = entry.mirror_turns?.length || 0
    await inquirer.supabase
      .from('ai_turns')
      .insert({
        user_id: user.id,
        entry_id: entryId,
        key_used: result.key,
        question: result.question,
        turn_number: turnNumber + 1,
        session_id: sessionId
      })

    return new Response(
      JSON.stringify({
        question: result.question,
        key: result.key,
        turnNumber: turnNumber + 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Mirror inquiry error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})