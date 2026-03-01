# MindIQ AI Paper Assessment - Edge Functions

This directory contains Supabase Edge Functions that power the AI-driven paper assessment system using Groq's LLaMA 3.3 70B model.

## Functions Overview

### 1. `generate-questions`
Generates 15 unique MCQ case-study questions tailored to the user's configuration.

**Endpoint:** `POST /functions/v1/generate-questions`

**Request Body:**
```json
{
  "qualification": "High School",
  "stream": "Physics",
  "difficulty": "Standard",
  "examType": "mcq"
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "type": "Logic",
      "scenario": "Three to five sentence real-world scenario...",
      "question": "Based on the scenario, what is the most appropriate conclusion?",
      "format": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "timeLimit": 120,
      "maxPoints": 10
    }
  ]
}
```

### 2. `score-answers`
Evaluates user answers across 5 cognitive dimensions using AI analysis.

**Endpoint:** `POST /functions/v1/score-answers`

**Request Body:**
```json
{
  "questions": [...],
  "answers": ["Option A", "Option B", ...],
  "timeData": [45, 67, 89, ...],
  "stream": "Physics",
  "qualification": "High School"
}
```

**Response:**
```json
{
  "scores": {
    "logic": 75,
    "creativity": 82,
    "intuition": 68,
    "emotionalIntelligence": 71,
    "systemsThinking": 79,
    "overallScore": 75,
    "aiInsight": "Brief cognitive profile insight...",
    "famousMatch": "Albert Einstein",
    "famousMatchReason": "Your analytical thinking...",
    "superpowers": ["Analytical thinking", "Problem solving", "Pattern recognition"],
    "blindSpots": ["Time management", "Detail orientation", "Risk assessment"],
    "archetype_report": "Multi-paragraph deep analysis..."
  },
  "correctCount": 12,
  "totalQuestions": 15,
  "accuracyRate": 80
}
```

## Environment Variables Required

Add these to your Supabase project settings:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

Get your Groq API key from: https://console.groq.com/keys

## Deployment

### Option 1: Via Lovable (Recommended for this project)
1. Push changes to GitHub
2. Lovable will automatically sync and deploy the functions

### Option 2: Via Supabase CLI
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref vertjjkacwtfjliwckrf

# Deploy functions
supabase functions deploy generate-questions
supabase functions deploy score-answers

# Set environment variables
supabase secrets set GROQ_API_KEY=your_key_here
```

## Testing Locally

```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test generate-questions
curl -X POST http://localhost:54321/functions/v1/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "qualification": "High School",
    "stream": "Physics",
    "difficulty": "Standard"
  }'

# Test score-answers
curl -X POST http://localhost:54321/functions/v1/score-answers \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [...],
    "answers": [...],
    "timeData": [...]
  }'
```

## AI Prompt Engineering

### Question Generation Strategy
The system uses a 3-part prompt structure:

1. **System Role**: Establishes the AI as a senior academic examiner
2. **Contextual Rules**: Defines subject, level, and difficulty parameters
3. **Output Rules**: Enforces strict JSON format with case-study MCQs

Key features:
- Each question starts with a 3+ sentence scenario
- All questions are MCQ with exactly 4 options
- Questions test 5 cognitive dimensions
- No arithmetic sequences or pattern completion
- Real-world, application-based scenarios

### Scoring Strategy
The AI analyzes:
- Pattern of correct/incorrect answers
- Which specific options were chosen
- Time taken per question
- Question types and difficulty

Scores 5 dimensions:
1. **Logic**: Deductive/inductive reasoning
2. **Creativity**: Novel thinking and lateral solutions
3. **Intuition**: Pattern recognition and instinct quality
4. **Emotional Intelligence**: Empathy and ethical judgment
5. **Systems Thinking**: Understanding interconnected consequences

## Model Information

- **Model**: LLaMA 3.3 70B Versatile (via Groq)
- **Provider**: Groq Cloud
- **Speed**: ~300 tokens/second
- **Context Window**: 32K tokens
- **Temperature**: 0.8 (generation), 0.7 (scoring)

## Error Handling

Both functions include:
- CORS headers for cross-origin requests
- Input validation
- Groq API error handling
- JSON parsing with markdown removal
- Fallback values for missing fields

## Performance Optimization

- Questions generated in ~3-5 seconds
- Scoring completed in ~4-6 seconds
- Parallel processing possible for multiple users
- Cached responses not implemented (ensures uniqueness)

## Future Enhancements

- [ ] Source grounding with specific textbook references
- [ ] Anti-repeat seed for guaranteed uniqueness
- [ ] Multi-language support
- [ ] Topic rotation tracking
- [ ] Question difficulty calibration
- [ ] Response caching for common configurations
