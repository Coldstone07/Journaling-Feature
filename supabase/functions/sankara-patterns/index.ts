// Kairos Mirror - Sankara Pattern Recognition Engine
// Gentle constellation mapping of recurring life patterns without diagnosis

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PatternFeatures {
  linguistic: string[]
  emotional: Array<{label: string, frequency: number}>
  somatic: Array<{region: string, frequency: number, descriptors: string[]}>
  temporal: {timeOfDay?: string, dayOfWeek?: string, frequency: number}
}

interface PatternScore {
  pattern: string
  confidence: number
  evidence: PatternFeatures
  curiosityQuestion: string
}

class SankaraEngine {
  private supabase: any
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
  }

  // Pattern Recognition Algorithms - Five Core Sankaras
  
  analyzeCompetenceMask(narrative: string, emotions: any[], somatic: any[]): number {
    let score = 0
    const weights = {
      linguistic: 0.4,
      emotional: 0.3, 
      somatic: 0.3
    }

    // Linguistic markers
    const competenceWords = [
      'should', 'prove', 'good enough', 'perfect', 'flawless', 'competent',
      'qualified', 'worthy', 'earn', 'deserve', 'measure up', 'standard'
    ]
    const linguisticScore = this.calculateLinguisticScore(narrative, competenceWords)
    score += linguisticScore * weights.linguistic

    // Emotional clusters
    const competenceEmotions = ['anxiety', 'perfectionism', 'inadequacy', 'shame', 'fear']
    const emotionalScore = this.calculateEmotionalScore(emotions, competenceEmotions)
    score += emotionalScore * weights.emotional

    // Somatic patterns (solar plexus tension is key indicator)
    const competenceSomatic = ['solar plexus', 'stomach', 'chest']
    const competenceDescriptors = ['tight', 'clenched', 'knotted', 'burning', 'heavy']
    const somaticScore = this.calculateSomaticScore(somatic, competenceSomatic, competenceDescriptors)
    score += somaticScore * weights.somatic

    return Math.min(score, 1.0)
  }

  analyzeHerosBurden(narrative: string, emotions: any[], somatic: any[]): number {
    let score = 0
    const weights = {linguistic: 0.4, emotional: 0.3, somatic: 0.3}

    // Linguistic markers
    const heroWords = [
      'only I can', 'if I don\'t', 'responsible for', 'depend on me', 'burden',
      'carry', 'weight', 'handle everything', 'fix', 'save', 'rescue'
    ]
    score += this.calculateLinguisticScore(narrative, heroWords) * weights.linguistic

    // Emotional clusters  
    const heroEmotions = ['anger', 'resentment', 'weariness', 'overwhelm', 'martyrdom']
    score += this.calculateEmotionalScore(emotions, heroEmotions) * weights.emotional

    // Somatic patterns (shoulders, upper back)
    const heroSomatic = ['shoulders', 'upper back', 'neck']
    const heroDescriptors = ['tight', 'heavy', 'carrying', 'burden', 'aching', 'rigid']
    score += this.calculateSomaticScore(somatic, heroSomatic, heroDescriptors) * weights.somatic

    return Math.min(score, 1.0)
  }

  analyzeLovingController(narrative: string, emotions: any[], somatic: any[]): number {
    let score = 0
    const weights = {linguistic: 0.4, emotional: 0.3, somatic: 0.3}

    // Linguistic markers
    const controlWords = [
      'keep safe', 'make sure', 'prevent', 'protect', 'control', 'manage',
      'anticipate', 'worry about', 'what if', 'plan for', 'prepare'
    ]
    score += this.calculateLinguisticScore(narrative, controlWords) * weights.linguistic

    // Emotional clusters
    const controlEmotions = ['worry', 'anxiety', 'fear', 'hypervigilance', 'concern']
    score += this.calculateEmotionalScore(emotions, controlEmotions) * weights.emotional

    // Somatic patterns (chest tightness)
    const controlSomatic = ['chest', 'heart', 'throat']
    const controlDescriptors = ['tight', 'constricted', 'closed', 'guarded', 'armored']
    score += this.calculateSomaticScore(somatic, controlSomatic, controlDescriptors) * weights.somatic

    return Math.min(score, 1.0)
  }

  analyzeInsightCollector(narrative: string, emotions: any[], somatic: any[]): number {
    let score = 0
    const weights = {linguistic: 0.5, emotional: 0.2, somatic: 0.3}

    // Linguistic markers (high weight - this is primarily cognitive)
    const insightWords = [
      'understand', 'analyze', 'figure out', 'make sense', 'learn', 'study',
      'research', 'knowledge', 'information', 'insight', 'clarity', 'once I know'
    ]
    score += this.calculateLinguisticScore(narrative, insightWords) * weights.linguistic

    // Emotional clusters (often less intense, more mental)
    const insightEmotions = ['curiosity', 'confusion', 'seeking', 'mental energy']
    score += this.calculateEmotionalScore(emotions, insightEmotions) * weights.emotional

    // Somatic disconnection (low body awareness is key indicator)
    const bodyDisconnectionScore = somatic.length === 0 ? 0.8 : Math.max(0, 0.8 - (somatic.length * 0.2))
    score += bodyDisconnectionScore * weights.somatic

    return Math.min(score, 1.0)
  }

  analyzeWaitingGame(narrative: string, emotions: any[], somatic: any[]): number {
    let score = 0
    const weights = {linguistic: 0.4, emotional: 0.3, somatic: 0.3}

    // Linguistic markers
    const waitingWords = [
      'later', 'someday', 'when', 'after', 'once', 'if only', 'not ready',
      'timing', 'right time', 'perfect moment', 'eventually', 'postpone'
    ]
    score += this.calculateLinguisticScore(narrative, waitingWords) * weights.linguistic

    // Emotional clusters
    const waitingEmotions = ['stagnation', 'hesitation', 'uncertainty', 'paralysis', 'yearning']
    score += this.calculateEmotionalScore(emotions, waitingEmotions) * weights.emotional

    // Somatic patterns (abdomen, pelvis emptiness)
    const waitingSomatic = ['abdomen', 'pelvis', 'belly', 'gut']
    const waitingDescriptors = ['empty', 'hollow', 'void', 'numb', 'disconnected', 'lifeless']
    score += this.calculateSomaticScore(somatic, waitingSomatic, waitingDescriptors) * weights.somatic

    return Math.min(score, 1.0)
  }

  // Helper methods for scoring
  private calculateLinguisticScore(narrative: string, keywords: string[]): number {
    const lowerNarrative = narrative.toLowerCase()
    const matches = keywords.filter(keyword => lowerNarrative.includes(keyword.toLowerCase()))
    return Math.min(matches.length / keywords.length, 1.0) * (matches.length > 0 ? 0.8 : 0)
  }

  private calculateEmotionalScore(emotions: any[], targetEmotions: string[]): number {
    if (!emotions || emotions.length === 0) return 0

    const emotionLabels = emotions.map(e => e.label.toLowerCase())
    const matches = targetEmotions.filter(target => 
      emotionLabels.some(label => label.includes(target.toLowerCase()))
    )
    
    const intensityBonus = emotions
      .filter(e => targetEmotions.some(target => e.label.toLowerCase().includes(target.toLowerCase())))
      .reduce((sum, e) => sum + (e.intensity / 10), 0) / emotions.length

    return Math.min((matches.length / targetEmotions.length) + (intensityBonus * 0.3), 1.0)
  }

  private calculateSomaticScore(somatic: any[], targetRegions: string[], targetDescriptors: string[]): number {
    if (!somatic || somatic.length === 0) return 0

    const regionMatches = somatic.filter(s => 
      targetRegions.some(region => s.region.toLowerCase().includes(region.toLowerCase()))
    )

    const descriptorMatches = somatic.filter(s =>
      s.descriptors.some((desc: string) => 
        targetDescriptors.some(target => desc.toLowerCase().includes(target.toLowerCase()))
      )
    )

    const regionScore = regionMatches.length / targetRegions.length
    const descriptorScore = descriptorMatches.length / Math.max(somatic.length, 1)
    
    return Math.min((regionScore + descriptorScore) / 2, 1.0)
  }

  // Generate curiosity-based questions (never diagnostic labels)
  generateCuriosityQuestion(pattern: string, confidence: number): string {
    const questions = {
      competence_mask: [
        "I notice themes of needing to prove worth. Does that constellation feel familiar?",
        "There's something about earning safety through perfection here. What does that stir in you?",
        "A pattern of 'not good enough' seems to be glimmering. Does that feel like it's asking for attention?"
      ],
      heros_burden: [
        "I sense a weight of responsibility for others. Does the Hero's Burden resonate?",
        "There's something about carrying what isn't yours to carry. What feels true about that?",
        "A constellation of over-responsibility seems present. Does that feel alive for you?"
      ],
      loving_controller: [
        "I notice patterns of managing others' safety. Does the Loving Controller feel familiar?", 
        "There's something about preventing harm through control. What does that bring up?",
        "A constellation of protective management is forming. Does that feel like it wants attention?"
      ],
      insight_collector: [
        "I sense a pattern of seeking understanding without integration. Does that resonate?",
        "There's something about collecting knowledge as a way of being. What feels true there?",
        "The Insight Collector constellation seems to be forming. Does that stir recognition?"
      ],
      waiting_game: [
        "I notice themes of postponing aliveness. Does the Waiting Game feel familiar?",
        "There's something about 'someday' that keeps appearing. What does that evoke?",
        "A constellation of perpetual preparation is glimmering. Does that feel alive?"
      ]
    }

    const patternQuestions = questions[pattern as keyof typeof questions] || []
    return patternQuestions[Math.floor(Math.random() * patternQuestions.length)] || 
           "A familiar constellation seems to be forming. Does anything feel like it's asking for gentle attention?"
  }

  // Main pattern analysis
  async analyzePatterns(userId: string, entryId: string): Promise<PatternScore[]> {
    // Fetch recent entries for pattern analysis (last 5 entries)
    const { data: entries } = await this.supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    if (!entries || entries.length === 0) {
      return []
    }

    const currentEntry = entries.find(e => e.id === entryId)
    if (!currentEntry) return []

    const narrative = currentEntry.narrative?.text || currentEntry.content || ''
    const emotions = currentEntry.emotional_landscape || []
    const somatic = currentEntry.somatic_map || []

    // Analyze all five patterns
    const scores: PatternScore[] = []

    const competenceScore = this.analyzeCompetenceMask(narrative, emotions, somatic)
    if (competenceScore >= 0.6) {
      scores.push({
        pattern: 'competence_mask',
        confidence: competenceScore,
        evidence: this.extractEvidence(narrative, emotions, somatic, 'competence_mask'),
        curiosityQuestion: this.generateCuriosityQuestion('competence_mask', competenceScore)
      })
    }

    const heroScore = this.analyzeHerosBurden(narrative, emotions, somatic)
    if (heroScore >= 0.6) {
      scores.push({
        pattern: 'heros_burden',
        confidence: heroScore,
        evidence: this.extractEvidence(narrative, emotions, somatic, 'heros_burden'),
        curiosityQuestion: this.generateCuriosityQuestion('heros_burden', heroScore)
      })
    }

    const controllerScore = this.analyzeLovingController(narrative, emotions, somatic)
    if (controllerScore >= 0.6) {
      scores.push({
        pattern: 'loving_controller', 
        confidence: controllerScore,
        evidence: this.extractEvidence(narrative, emotions, somatic, 'loving_controller'),
        curiosityQuestion: this.generateCuriosityQuestion('loving_controller', controllerScore)
      })
    }

    const collectorScore = this.analyzeInsightCollector(narrative, emotions, somatic)
    if (collectorScore >= 0.6) {
      scores.push({
        pattern: 'insight_collector',
        confidence: collectorScore, 
        evidence: this.extractEvidence(narrative, emotions, somatic, 'insight_collector'),
        curiosityQuestion: this.generateCuriosityQuestion('insight_collector', collectorScore)
      })
    }

    const waitingScore = this.analyzeWaitingGame(narrative, emotions, somatic)
    if (waitingScore >= 0.6) {
      scores.push({
        pattern: 'waiting_game',
        confidence: waitingScore,
        evidence: this.extractEvidence(narrative, emotions, somatic, 'waiting_game'),
        curiosityQuestion: this.generateCuriosityQuestion('waiting_game', waitingScore)
      })
    }

    return scores.sort((a, b) => b.confidence - a.confidence)
  }

  private extractEvidence(narrative: string, emotions: any[], somatic: any[], pattern: string): PatternFeatures {
    // Extract specific evidence that led to pattern detection
    return {
      linguistic: [], // TODO: implement specific keyword extraction
      emotional: emotions.map(e => ({label: e.label, frequency: 1})),
      somatic: somatic.map(s => ({region: s.region, frequency: 1, descriptors: s.descriptors})),
      temporal: {frequency: 1}
    }
  }

  // Check if user is ready for pattern insights (week 5+)
  async canShowPatterns(userId: string): Promise<boolean> {
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('weeks_since_onboarding')
      .eq('user_id', userId)
      .single()

    return profile?.weeks_since_onboarding >= 5
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { entryId } = await req.json()

    if (!entryId) {
      return new Response(
        JSON.stringify({ error: 'entryId required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const engine = new SankaraEngine()

    // Get user from auth
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user } } = await engine.supabase.auth.getUser(token)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user is ready for pattern insights
    const canShow = await engine.canShowPatterns(user.id)
    if (!canShow) {
      return new Response(
        JSON.stringify({ patterns: [], message: "Pattern recognition unlocks at week 5" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analyze patterns
    const patterns = await engine.analyzePatterns(user.id, entryId)

    // Store significant patterns
    for (const pattern of patterns) {
      if (pattern.confidence >= 0.7) {
        // Check if pattern already exists
        const { data: existing } = await engine.supabase
          .from('pattern_signals')
          .select('id')
          .eq('user_id', user.id)
          .eq('pattern_name', pattern.pattern)
          .single()

        if (!existing) {
          await engine.supabase
            .from('pattern_signals')
            .insert({
              user_id: user.id,
              pattern_name: pattern.pattern,
              confidence_score: pattern.confidence,
              evidence_entries: [entryId],
              evidence_summary: pattern.evidence
            })
        } else {
          // Update existing pattern
          await engine.supabase
            .from('pattern_signals')
            .update({
              confidence_score: pattern.confidence,
              last_seen_at: new Date().toISOString(),
              evidence_entries: [entryId] // In production, append to existing array
            })
            .eq('id', existing.id)
        }
      }
    }

    // Return most confident pattern as curiosity question (max 1 per session)
    const topPattern = patterns[0]
    const response = topPattern ? {
      pattern: topPattern.pattern,
      confidence: topPattern.confidence,
      curiosityQuestion: topPattern.curiosityQuestion
    } : null

    return new Response(
      JSON.stringify({ pattern: response, totalDetected: patterns.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Sankara pattern analysis error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})