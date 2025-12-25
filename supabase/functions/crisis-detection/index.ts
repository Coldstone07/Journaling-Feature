// Kairos Mirror - Crisis Detection & Safety Layer
// Compassionate boundary guardian that prioritizes user safety above all

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CrisisAssessment {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical'
  triggers: string[]
  confidence: number
  resources: CrisisResource[]
  immediateAction: string
}

interface CrisisResource {
  type: 'hotline' | 'text' | 'chat' | 'emergency' | 'professional'
  name: string
  contact: string
  availability: string
  region: string
}

class CrisisDetector {
  private supabase: any
  
  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
  }

  // Primary crisis detection - keyword and semantic analysis
  detectCrisisLevel(content: string): CrisisAssessment {
    const lowerContent = content.toLowerCase()
    
    // Critical level - immediate danger
    const criticalTriggers = [
      'kill myself', 'end my life', 'suicide', 'want to die', 
      'better off dead', 'take my own life', 'ending it all',
      'kill me', 'die tonight', 'die today', 'final decision',
      'goodbye cruel world', 'last time', 'won\'t be here tomorrow'
    ]

    // High level - serious ideation  
    const highTriggers = [
      'don\'t want to be here', 'can\'t go on', 'no point living',
      'life isn\'t worth', 'tired of living', 'wish I was dead',
      'everyone would be better', 'burden on everyone', 'hate being alive',
      'can\'t take it anymore', 'give up on life'
    ]

    // Medium level - concerning thoughts
    const mediumTriggers = [
      'self harm', 'hurt myself', 'cut myself', 'harm myself',
      'punish myself', 'hate myself so much', 'want to disappear',
      'wish I would just', 'maybe if I wasn\'t here', 'dark thoughts'
    ]

    // Low level - distress signals
    const lowTriggers = [
      'hopeless', 'worthless', 'pointless', 'empty inside',
      'nothing matters', 'why bother', 'what\'s the point',
      'completely alone', 'nobody cares', 'trapped'
    ]

    // Check for critical triggers first
    const criticalMatches = criticalTriggers.filter(trigger => lowerContent.includes(trigger))
    if (criticalMatches.length > 0) {
      return {
        level: 'critical',
        triggers: criticalMatches,
        confidence: 0.95,
        resources: this.getCrisisResources('critical'),
        immediateAction: 'EMERGENCY_SERVICES'
      }
    }

    // Check high level triggers
    const highMatches = highTriggers.filter(trigger => lowerContent.includes(trigger))
    if (highMatches.length > 0) {
      return {
        level: 'high', 
        triggers: highMatches,
        confidence: 0.85,
        resources: this.getCrisisResources('high'),
        immediateAction: 'CRISIS_HOTLINE'
      }
    }

    // Check medium level triggers
    const mediumMatches = mediumTriggers.filter(trigger => lowerContent.includes(trigger))
    if (mediumMatches.length > 0) {
      return {
        level: 'medium',
        triggers: mediumMatches, 
        confidence: 0.75,
        resources: this.getCrisisResources('medium'),
        immediateAction: 'SUPPORT_RESOURCES'
      }
    }

    // Check low level triggers
    const lowMatches = lowTriggers.filter(trigger => lowerContent.includes(trigger))
    if (lowMatches.length >= 2) { // Multiple low-level indicators
      return {
        level: 'low',
        triggers: lowMatches,
        confidence: 0.65,
        resources: this.getCrisisResources('low'),
        immediateAction: 'GENTLE_CHECK_IN'
      }
    }

    return {
      level: 'none',
      triggers: [],
      confidence: 0,
      resources: [],
      immediateAction: 'CONTINUE'
    }
  }

  // Crisis resources by region and severity
  getCrisisResources(level: string): CrisisResource[] {
    const resources: CrisisResource[] = []

    // Universal emergency
    if (level === 'critical') {
      resources.push({
        type: 'emergency',
        name: 'Emergency Services',
        contact: '911 (US), 999 (UK), 000 (AU), 112 (EU)',
        availability: '24/7',
        region: 'global'
      })
    }

    // Crisis hotlines (high priority)
    if (level === 'critical' || level === 'high') {
      resources.push(
        {
          type: 'hotline',
          name: 'National Suicide Prevention Lifeline',
          contact: '988',
          availability: '24/7',
          region: 'US'
        },
        {
          type: 'text',
          name: 'Crisis Text Line', 
          contact: 'Text HOME to 741741',
          availability: '24/7',
          region: 'US'
        },
        {
          type: 'hotline',
          name: 'Samaritans',
          contact: '116 123',
          availability: '24/7',
          region: 'UK'
        },
        {
          type: 'hotline',
          name: 'Lifeline Australia',
          contact: '13 11 14',
          availability: '24/7', 
          region: 'AU'
        }
      )
    }

    // Support resources (medium/low priority)
    if (level === 'medium' || level === 'low') {
      resources.push(
        {
          type: 'chat',
          name: 'Crisis Chat',
          contact: 'suicidepreventionlifeline.org/chat',
          availability: '24/7',
          region: 'US'
        },
        {
          type: 'professional',
          name: 'Psychology Today',
          contact: 'psychologytoday.com/us/therapists',
          availability: 'Business hours',
          region: 'US'
        }
      )
    }

    return resources
  }

  // Generate compassionate crisis response
  generateCrisisResponse(assessment: CrisisAssessment): string {
    switch (assessment.level) {
      case 'critical':
        return `I'm deeply concerned about your safety right now. What you're going through sounds overwhelming, and I want you to know you don't have to face this alone.

If you're in immediate danger, please call emergency services (911 in the US) right away.

For crisis support, you can also reach:
• National Suicide Prevention Lifeline: 988 (24/7)
• Crisis Text Line: Text HOME to 741741

You matter. Your life has value. Please reach out to someone who can sit with you through this difficult moment.

Would you like me to provide more specific resources for your area?`

      case 'high':
        return `I hear how much pain you're carrying right now, and I'm genuinely concerned for you. These thoughts and feelings you're having are signals that you need and deserve support.

Please consider reaching out to:
• National Suicide Prevention Lifeline: 988 (24/7)  
• Crisis Text Line: Text HOME to 741741
• Or your local crisis center

You don't have to navigate this darkness alone. There are people trained to sit with you through this and help you find a path forward.

Is there someone in your life - a friend, family member, or counselor - you could contact right now?`

      case 'medium':
        return `I notice you're going through something really difficult, and I want to acknowledge the courage it takes to express these struggles. 

While I can't provide therapy or crisis intervention, I want you to know that support is available:
• Crisis Text Line: Text HOME to 741741
• National Suicide Prevention Lifeline: 988
• Local mental health crisis centers

If you're having thoughts of harming yourself, please reach out to one of these resources. They have trained counselors who understand what you're experiencing.

Would it help to take three slow breaths with me before deciding what feels like the right next step?`

      case 'low':
        return `I can sense you're going through a difficult time, and I want to honor the weight of what you're carrying. Sometimes when we're in pain, it can feel very isolating.

If you're experiencing thoughts of hopelessness or self-harm, please know that support is available:
• Crisis Text Line: Text HOME to 741741 (24/7)
• National Suicide Prevention Lifeline: 988 (24/7)

Even if you're not in immediate crisis, speaking with a counselor or trusted friend can provide perspective and support.

What feels like one small step you could take to care for yourself right now?`

      default:
        return ''
    }
  }

  // Enhanced semantic analysis using simple NLP techniques
  analyzeSemanticRisk(content: string): number {
    let riskScore = 0

    // Temporal urgency indicators
    const urgencyWords = ['tonight', 'today', 'now', 'soon', 'final', 'last time', 'can\'t wait']
    const urgencyMatches = urgencyWords.filter(word => content.toLowerCase().includes(word))
    riskScore += urgencyMatches.length * 0.15

    // Isolation indicators
    const isolationWords = ['alone', 'nobody', 'no one cares', 'isolated', 'abandoned']
    const isolationMatches = isolationWords.filter(word => content.toLowerCase().includes(word))
    riskScore += isolationMatches.length * 0.1

    // Plan/method indicators (very high risk)
    const methodWords = ['pills', 'rope', 'bridge', 'gun', 'knife', 'building', 'plan']
    const methodMatches = methodWords.filter(word => content.toLowerCase().includes(word))
    riskScore += methodMatches.length * 0.25

    // Hopelessness indicators
    const hopelessWords = ['hopeless', 'pointless', 'no future', 'no way out', 'trapped']
    const hopelessMatches = hopelessWords.filter(word => content.toLowerCase().includes(word))
    riskScore += hopelessMatches.length * 0.12

    return Math.min(riskScore, 1.0)
  }

  // Log safety event with privacy protection
  async logSafetyEvent(userId: string, assessment: CrisisAssessment, userResponse?: string) {
    // Create privacy-preserving context hash
    const contextData = {
      triggerCount: assessment.triggers.length,
      level: assessment.level,
      confidence: assessment.confidence,
      timestamp: new Date().toISOString()
    }
    const contextHash = await this.hashContext(JSON.stringify(contextData))

    await this.supabase
      .from('safety_events')
      .insert({
        user_id: userId,
        event_type: 'crisis_detected',
        context_hash: contextHash,
        severity_level: this.mapLevelToNumber(assessment.level),
        resources_provided: assessment.resources.map(r => r.name),
        user_acknowledged: userResponse === 'acknowledged'
      })
  }

  private async hashContext(context: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(context)
    const hash = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hash))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private mapLevelToNumber(level: string): number {
    switch (level) {
      case 'critical': return 4
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, entryId } = await req.json()

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'content required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const detector = new CrisisDetector()

    // Get user from auth
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const { data: { user } } = await detector.supabase.auth.getUser(token)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Perform crisis detection
    const assessment = detector.detectCrisisLevel(content)
    
    // Enhanced semantic analysis
    const semanticRisk = detector.analyzeSemanticRisk(content)
    if (semanticRisk > 0.6 && assessment.level === 'none') {
      assessment.level = 'low'
      assessment.confidence = semanticRisk
      assessment.resources = detector.getCrisisResources('low')
      assessment.immediateAction = 'GENTLE_CHECK_IN'
    }

    // Log safety event if crisis detected
    if (assessment.level !== 'none') {
      await detector.logSafetyEvent(user.id, assessment)

      // Temporarily disable Mirror interactions for critical/high
      if (assessment.level === 'critical' || assessment.level === 'high') {
        // TODO: Set a temporary flag to disable Mirror interactions
        // This could be a field in user_profiles or a separate crisis_state table
      }
    }

    const response = {
      crisis: assessment.level !== 'none',
      level: assessment.level,
      confidence: assessment.confidence,
      message: assessment.level !== 'none' ? detector.generateCrisisResponse(assessment) : null,
      resources: assessment.resources,
      immediateAction: assessment.immediateAction,
      disableMirror: assessment.level === 'critical' || assessment.level === 'high'
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Crisis detection error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})