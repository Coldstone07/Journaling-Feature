// Shared Gemini API integration for Kairos Mirror Edge Functions
// Provides sacred, secure AI interactions with enhanced safety protocols

export interface GeminiConfig {
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
  safetySettings?: Array<{
    category: string
    threshold: string
  }>
}

export interface GeminiResponse {
  text: string
  finishReason?: string
  safetyRatings?: Array<{
    category: string
    probability: string
  }>
}

export class GeminiClient {
  private apiKey: string
  
  constructor() {
    this.apiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable not set')
    }
  }

  async generateContent(prompt: string, config: GeminiConfig = {}): Promise<GeminiResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`
    
    // Default configuration optimized for therapeutic inquiry
    const defaultConfig = {
      temperature: 0.5,
      maxTokens: 150, // Keep responses concise
      topP: 0.8,
      topK: 40
    }
    
    const finalConfig = { ...defaultConfig, ...config }
    
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: finalConfig.temperature,
        maxOutputTokens: finalConfig.maxTokens,
        topP: finalConfig.topP,
        topK: finalConfig.topK,
        candidateCount: 1
      },
      safetySettings: finalConfig.safetySettings || [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error('Gemini API Error:', errorBody)
        throw new Error(`Gemini API error: ${response.status} - ${errorBody}`)
      }

      const data = await response.json()
      
      // Extract the response text
      const candidate = data.candidates?.[0]
      if (!candidate) {
        throw new Error('No candidate response from Gemini')
      }

      const content = candidate.content?.parts?.[0]
      if (!content) {
        throw new Error('No content in Gemini response')
      }

      return {
        text: content.text || '',
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error)
      throw error
    }
  }

  // Specialized method for Mirror inquiry with therapeutic safeguards
  async generateMirrorQuestion(systemPrompt: string, config: GeminiConfig = {}): Promise<string> {
    // Enhanced prompt with therapeutic boundaries
    const enhancedPrompt = `${systemPrompt}

CRITICAL THERAPEUTIC BOUNDARIES:
- You are NOT a therapist, counselor, or medical professional
- You provide gentle inquiry only, never advice or diagnosis
- If you detect crisis content, respond with: "I'm concerned about your safety. Please reach out to a crisis helpline."
- Keep questions under 50 words
- Ask only ONE question
- Honor the user's protective resistance
- Move at the speed of safety

Generate your response now:`

    const mirrorConfig: GeminiConfig = {
      temperature: 0.4, // Lower temperature for more consistent therapeutic responses
      maxTokens: 100,   // Shorter responses for sacred inquiry
      ...config
    }

    const response = await this.generateContent(enhancedPrompt, mirrorConfig)
    
    // Post-processing validation
    let question = response.text.trim()
    
    // Remove any potential advice patterns
    question = this.sanitizeTherapeuticResponse(question)
    
    // Ensure it's a question
    if (!question.endsWith('?')) {
      question = question.replace(/[.!]$/, '?')
    }
    
    return question
  }

  // Remove any therapeutic boundary violations from generated text
  private sanitizeTherapeuticResponse(text: string): string {
    // Remove advice patterns
    const advicePatterns = [
      /You should\s+/gi,
      /I suggest\s+/gi,
      /Try to\s+/gi,
      /Why don't you\s+/gi,
      /Have you considered\s+/gi,
      /It might be good to\s+/gi,
      /I recommend\s+/gi
    ]

    let sanitized = text
    for (const pattern of advicePatterns) {
      sanitized = sanitized.replace(pattern, '')
    }

    // Remove numbered lists (often advice)
    sanitized = sanitized.replace(/^\d+\.\s+/gm, '')
    
    // Clean up any resulting grammar issues
    sanitized = sanitized.trim()
    sanitized = sanitized.charAt(0).toUpperCase() + sanitized.slice(1)
    
    return sanitized
  }

  // Validate that response follows therapeutic boundaries
  validateTherapeuticResponse(response: string): { valid: boolean, violations: string[] } {
    const violations: string[] = []
    
    // Check for advice giving
    const advicePatterns = [
      { pattern: /you should/i, violation: 'Contains advice' },
      { pattern: /try to/i, violation: 'Contains suggestion' },
      { pattern: /I suggest/i, violation: 'Contains suggestion' },
      { pattern: /steps?:/i, violation: 'Contains step-by-step advice' },
      { pattern: /\d+\./i, violation: 'Contains numbered list' }
    ]

    for (const { pattern, violation } of advicePatterns) {
      if (pattern.test(response)) {
        violations.push(violation)
      }
    }

    // Check length (should be concise)
    if (response.length > 200) {
      violations.push('Response too long')
    }

    // Check if it's actually a question
    if (!response.trim().endsWith('?')) {
      violations.push('Not a question')
    }

    return {
      valid: violations.length === 0,
      violations
    }
  }
}

// Export default instance
export const geminiClient = new GeminiClient()