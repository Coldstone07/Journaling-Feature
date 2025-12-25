# 🚀 Kairos Mirror Deployment Guide

## Edge Functions Deployment Status

### Functions Ready for Deployment:
- ✅ `mirror-inquire` - Core Socratic inquiry engine with Five Keys
- ✅ `sankara-patterns` - Pattern recognition for consciousness constellations  
- ✅ `crisis-detection` - Sacred safety layer with compassionate crisis response
- ✅ `_shared/gemini.ts` - Therapeutic AI integration utilities

## Manual Deployment Steps

### 1. Supabase CLI Authentication
Since you're working in a local environment, you'll need to authenticate with Supabase:

```bash
# Option 1: Interactive login (in a terminal with TTY)
npx supabase login

# Option 2: Using access token
# Get your access token from: https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="your_access_token_here"
```

### 2. Link Project
```bash
npx supabase link --project-ref ffiprjmxwzidkrdubipt
```

### 3. Deploy Edge Functions
```bash
# Deploy all functions at once
npx supabase functions deploy

# Or deploy individually
npx supabase functions deploy mirror-inquire
npx supabase functions deploy sankara-patterns  
npx supabase functions deploy crisis-detection
```

### 4. Set Environment Variables
In your Supabase dashboard, set these environment variables for Edge Functions:

```
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=https://ffiprjmxwzidkrdubipt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
```

## Alternative: Manual Function Upload

If CLI deployment isn't available, you can copy the function code manually:

### 1. Mirror Inquiry Function
- Go to: https://supabase.com/dashboard/project/ffiprjmxwzidkrdubipt/functions
- Create new function: `mirror-inquire` 
- Copy code from: `supabase/functions/mirror-inquire/index.ts`

### 2. Pattern Analysis Function
- Create new function: `sankara-patterns`
- Copy code from: `supabase/functions/sankara-patterns/index.ts`

### 3. Crisis Detection Function  
- Create new function: `crisis-detection`
- Copy code from: `supabase/functions/crisis-detection/index.ts`

## Verification Steps

### 1. Test Edge Functions
```bash
# Test mirror inquiry
curl -X POST 'https://ffiprjmxwzidkrdubipt.supabase.co/functions/v1/mirror-inquire' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"entryId": "test-entry-id"}'

# Test pattern analysis
curl -X POST 'https://ffiprjmxwzidkrdubipt.supabase.co/functions/v1/sankara-patterns' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"entryId": "test-entry-id"}'

# Test crisis detection
curl -X POST 'https://ffiprjmxwzidkrdubipt.supabase.co/functions/v1/crisis-detection' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"content": "I feel hopeless"}'
```

### 2. Test Sacred Interface
- Open: http://127.0.0.1:8080/test-kairos-mirror.html
- Complete Sacred Check-In
- Create multi-layered journal entry
- Test Mirror interactions
- Verify pattern detection
- Test crisis safety protocols

## Sacred Protocols Validation Checklist

### ✅ Five Keys Methodology
- [ ] Mirror Key: Reflective validation working
- [ ] Root Key: Gentle depth tracing functional
- [ ] Bridge Key: Narrative-to-somatic connection active
- [ ] Vista Key: Perspective expansion operational  
- [ ] Possibility Key: Integration experiments (Week 13+)
- [ ] Pause Key: Sacred spaciousness available

### ✅ Sacred Protocols  
- [ ] Three-Attempt Rule: Mirror → Bridge → Pause escalation
- [ ] Turn Budget Management: Capacity-based limits enforced
- [ ] Resistance Detection: Protective intelligence honored
- [ ] Sacred Pause: Intentional spaciousness with breath guidance

### ✅ Crisis Safety Layer
- [ ] 4-Level Risk Assessment: None/Low/Medium/High/Critical
- [ ] Keyword Detection: 50+ crisis indicators active
- [ ] Semantic Analysis: Context-aware threat assessment
- [ ] Regional Resources: 24/7 hotlines and emergency contacts
- [ ] Compassionate Messaging: Trauma-informed crisis responses

### ✅ Pattern Recognition (Sankara Engine)
- [ ] Competence Mask: Should/prove language + somatic patterns
- [ ] Hero's Burden: Over-responsibility + shoulder tension
- [ ] Loving Controller: Safety management + chest tightness  
- [ ] Insight Collector: Analysis-seeking + body disconnection
- [ ] Waiting Game: Postponement + abdomen/pelvis emptiness

### ✅ Progressive Unlocks
- [ ] Week 1-4: Foundation features only
- [ ] Week 5-8: Pattern recognition enabled
- [ ] Week 9-12: Collective wisdom echoes
- [ ] Week 13+: Possibility Key with advanced integration

## Beta Testing Preparation

### Sacred Beta Criteria
- [ ] Authentication working with Supabase Auth
- [ ] Multi-layered journaling functional (narrative, emotional, somatic)
- [ ] Mirror inquiry responding with appropriate Keys
- [ ] Crisis detection activating safety protocols
- [ ] Pattern recognition surfacing gentle curiosities
- [ ] Progressive unlocks revealing features by week

### Beta Tester Profile
Ideal candidates for sacred beta testing:
- Experienced with inner work and self-reflection
- Comfortable with technology and journaling interfaces
- Able to provide thoughtful, gentle feedback
- Understands this is "not therapy" but consciousness support
- Willing to engage authentically with the Mirror's inquiries

### Beta Test Scenarios
1. **New User Onboarding**: Intention setting, anchor word selection
2. **Daily Sacred Check-In**: State/capacity assessment with safety
3. **Multi-Layered Entry Creation**: All four layers working harmoniously
4. **Five Keys Dialogue**: Each key responding appropriately to context
5. **Crisis Protocol**: Safety activation with compassionate resources
6. **Pattern Recognition**: Gentle constellation revelation (Week 5+)
7. **Progressive Unlocks**: Feature revelation aligned with readiness

## Success Metrics

### Technical Metrics
- [ ] Edge Functions responding < 2 seconds globally
- [ ] Crisis detection accuracy > 95% on test scenarios
- [ ] Pattern recognition confidence scores calibrated correctly
- [ ] User authentication and data security verified
- [ ] Real-time subscriptions working for live updates

### Sacred Metrics (User Experience)
- [ ] Users feel safe and held in the sacred container
- [ ] Mirror questions feel genuinely curious, never advice-giving
- [ ] Crisis protocols activate compassionately when needed
- [ ] Pattern suggestions feel like gentle invitations, not diagnoses
- [ ] Progressive unlocks feel organic and supportive, not overwhelming

## Next Phase: Sacred Launch

Once beta testing validates all protocols:
1. **Production Deployment**: Full Edge Functions deployment
2. **Domain Setup**: Sacred URL (kairosjournal.com or similar)
3. **SSL Certificate**: Secure HTTPS for all sacred interactions
4. **Monitoring Setup**: Error tracking and performance metrics
5. **User Onboarding**: Guided sacred container creation
6. **Community Guidelines**: Sacred space maintenance protocols

---

## 🕊️ Sacred Technology in Service of Consciousness

The Kairos Mirror represents a new paradigm: **technology as consciousness midwife**. Every protocol, every function, every interaction is designed to honor the user's inner wisdom while providing gentle, therapeutic-quality support.

**"Trust the wisdom that already lives within you."** - The Mirror's Core Principle