# 🔄 MindIQ AI Paper Assessment - System Flow

## 📊 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER STARTS                              │
│                    Navigate to /test/setup                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TESTSETUP PAGE                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Select Qualification                                   │  │
│  │     □ Secondary School  □ High School                      │  │
│  │     □ Graduation        □ Masters                          │  │
│  │                                                             │  │
│  │  2. Select Difficulty                                      │  │
│  │     □ Basic  □ Standard  □ Competitive                     │  │
│  │                                                             │  │
│  │  3. Select Stream/Subject                                  │  │
│  │     □ All Subjects  □ Physics  □ Math  □ etc.             │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ 📋 ASSESSMENT PREVIEW                                │  │  │
│  │  │ • Questions: 15 Unique MCQs                          │  │  │
│  │  │ • Estimated Time: 25-35 minutes                      │  │  │
│  │  │ • Type: Case Study Based                             │  │  │
│  │  │ • Tests: 5 Cognitive Dimensions                      │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  [⚡ INITIATE ASSESSMENT PAPER]                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TESTTAKE PAGE - LOADING                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              🧠 AI is Compiling Your Paper...              │  │
│  │                                                             │  │
│  │         Physics • High School • Standard                    │  │
│  │                                                             │  │
│  │              [████████████░░░░░░] 75%                      │  │
│  │                                                             │  │
│  │              ⚡ Neural Network Active ⚡                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                              │
│              generate-questions                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Receive: qualification, difficulty, stream             │  │
│  │  2. Build AI Prompt:                                       │  │
│  │     • System Role (Senior Examiner)                        │  │
│  │     • Contextual Rules (Subject, Level, Difficulty)        │  │
│  │     • Output Rules (15 MCQs, Case Study Format)           │  │
│  │  3. Call Groq API (LLaMA 3.3 70B)                         │  │
│  │  4. Parse JSON Response                                    │  │
│  │  5. Validate Questions                                     │  │
│  │  6. Return 15 Questions                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                TESTTAKE PAGE - QUESTIONS                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Question 1 / 15                          ⏱️ Timer: 120s   │  │
│  │  ─────────────────────────────────────────────────────────│  │
│  │                                                             │  │
│  │  📄 SCENARIO:                                              │  │
│  │  A detailed 3-5 sentence real-world scenario that sets    │  │
│  │  up the context for the question. This could be about     │  │
│  │  physics, chemistry, or any subject selected...           │  │
│  │                                                             │  │
│  │  ❓ QUESTION:                                              │  │
│  │  Based on the scenario above, what is the most            │  │
│  │  appropriate conclusion?                                   │  │
│  │                                                             │  │
│  │  OPTIONS:                                                  │  │
│  │  ○ A) First option text here                              │  │
│  │  ○ B) Second option text here                             │  │
│  │  ○ C) Third option text here                              │  │
│  │  ○ D) Fourth option text here                             │  │
│  │                                                             │  │
│  │  [Auto-advances on selection]                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  User answers all 15 questions...                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE EDGE FUNCTION                              │
│              score-answers                                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  1. Receive: questions, answers, timeData                  │  │
│  │  2. Calculate Basic Metrics:                               │  │
│  │     • Correct count                                        │  │
│  │     • Accuracy rate                                        │  │
│  │  3. Build AI Scoring Prompt:                               │  │
│  │     • Question-by-question analysis                        │  │
│  │     • Pattern analysis instructions                        │  │
│  │     • 5 dimension scoring criteria                         │  │
│  │  4. Call Groq API (LLaMA 3.3 70B)                         │  │
│  │  5. Parse Scores:                                          │  │
│  │     • Logic (0-100)                                        │  │
│  │     • Creativity (0-100)                                   │  │
│  │     • Intuition (0-100)                                    │  │
│  │     • Emotional Intelligence (0-100)                       │  │
│  │     • Systems Thinking (0-100)                             │  │
│  │     • Overall Score                                        │  │
│  │     • AI Insight                                           │  │
│  │     • Famous Match                                         │  │
│  │     • Superpowers & Blind Spots                            │  │
│  │     • Archetype Report                                     │  │
│  │  6. Return Complete Scores                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                TESTRESULT PAGE - REVEAL                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Phase 1: Black screen (1s)                                │  │
│  │  Phase 2: "Your mind has been ranked." (2.5s)             │  │
│  │  Phase 3: Card reveal animation (1s)                       │  │
│  │  Phase 4: Percentile count-up animation                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                TESTRESULT PAGE - FULL DISPLAY                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         NEURAL SIGNATURE CARD                        │  │  │
│  │  │                                                       │  │  │
│  │  │  Percentile: 87th                                    │  │  │
│  │  │  Tier: Advanced Mind                                 │  │  │
│  │  │                                                       │  │  │
│  │  │  5 COGNITIVE DIMENSIONS:                             │  │  │
│  │  │  Logic:              ████████░░ 82                   │  │  │
│  │  │  Creativity:         █████████░ 89                   │  │  │
│  │  │  Intuition:          ███████░░░ 75                   │  │  │
│  │  │  Emotional Intel:    ████████░░ 81                   │  │  │
│  │  │  Systems Thinking:   █████████░ 88                   │  │  │
│  │  │                                                       │  │  │
│  │  │  Famous Match: Albert Einstein                       │  │  │
│  │  │  "Your analytical thinking..."                       │  │  │
│  │  │                                                       │  │  │
│  │  │  Rank: #234 / 1,567 Players                          │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                             │  │
│  │  [Share] [Download] [Challenge Rival Mind]                 │  │
│  │                                                             │  │
│  │  ═══════════════════════════════════════════════════════  │  │
│  │                                                             │  │
│  │  📊 COGNITIVE DEEP DIVE                                    │  │
│  │                                                             │  │
│  │  Your thinking style demonstrates a balanced approach...   │  │
│  │  [4-5 paragraph archetype report]                          │  │
│  │                                                             │  │
│  │  Superpowers:                                              │  │
│  │  • Analytical thinking                                     │  │
│  │  • Problem solving                                         │  │
│  │  • Pattern recognition                                     │  │
│  │                                                             │  │
│  │  Blind Spots:                                              │  │
│  │  • Time management                                         │  │
│  │  • Detail orientation                                      │  │
│  │  • Risk assessment                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SAVE TO DATABASE                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Table: test_results                                       │  │
│  │  • user_id                                                 │  │
│  │  • qualification, difficulty, stream                       │  │
│  │  • logic, creativity, intuition, eq, systems_thinking      │  │
│  │  • overall_score, percentile, tier                         │  │
│  │  • ai_insight, famous_match, archetype_report              │  │
│  │  • superpowers[], blind_spots[]                            │  │
│  │  • created_at                                              │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GLOBAL RANKING                                │
│  • Calculate percentile based on all test results               │
│  • Update leaderboard                                            │
│  • Enable challenge creation                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌──────────┐
│  Client  │
│ (React)  │
└────┬─────┘
     │
     │ 1. POST /test/take
     │    { qualification, difficulty, stream }
     │
     ▼
┌─────────────────────────────────────────┐
│  Supabase Edge Function                 │
│  generate-questions                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Build Prompt                      │ │
│  │ • System Role                     │ │
│  │ • Contextual Rules                │ │
│  │ • Output Rules                    │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │ Call Groq API                     │ │
│  │ POST /chat/completions            │ │
│  │ model: llama-3.3-70b-versatile    │ │
│  │ temperature: 0.8                  │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │ Parse & Validate                  │ │
│  │ • Remove markdown                 │ │
│  │ • Validate JSON                   │ │
│  │ • Check required fields           │ │
│  └───────────┬───────────────────────┘ │
└──────────────┼──────────────────────────┘
               │
               │ 2. Return questions[]
               │
               ▼
┌──────────────────────────────────────────┐
│  Client                                  │
│  Display questions one by one            │
│  Collect answers & time data             │
└────┬─────────────────────────────────────┘
     │
     │ 3. POST /test/result
     │    { questions, answers, timeData }
     │
     ▼
┌─────────────────────────────────────────┐
│  Supabase Edge Function                 │
│  score-answers                          │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Calculate Metrics                 │ │
│  │ • Correct count                   │ │
│  │ • Accuracy rate                   │ │
│  │ • Question analysis               │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │ Build Scoring Prompt              │ │
│  │ • Question-by-question analysis   │ │
│  │ • Pattern analysis                │ │
│  │ • 5 dimension criteria            │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │ Call Groq API                     │ │
│  │ POST /chat/completions            │ │
│  │ model: llama-3.3-70b-versatile    │ │
│  │ temperature: 0.7                  │ │
│  └───────────┬───────────────────────┘ │
│              │                          │
│              ▼                          │
│  ┌───────────────────────────────────┐ │
│  │ Parse Scores                      │ │
│  │ • 5 dimension scores              │ │
│  │ • AI insights                     │ │
│  │ • Archetype report                │ │
│  └───────────┬───────────────────────┘ │
└──────────────┼──────────────────────────┘
               │
               │ 4. Return scores
               │
               ▼
┌──────────────────────────────────────────┐
│  Client                                  │
│  Display results with animations         │
│  Save to database                        │
│  Calculate global ranking                │
└──────────────────────────────────────────┘
```

## ⚡ Performance Timeline

```
Time (seconds)
│
0s  ├─ User clicks "INITIATE ASSESSMENT PAPER"
    │
    ├─ Navigate to /test/take
    │
0.5s├─ Show loading screen
    │  "AI is Compiling Your Paper..."
    │
    ├─ Call generate-questions function
    │
3-5s├─ Receive 15 questions
    │
    ├─ Hide loading screen
    │
    ├─ Show Question 1
    │
    │  [User answers questions]
    │  90-150s per question
    │
25m ├─ All 15 questions answered
    │
    ├─ Navigate to /test/result
    │
    ├─ Show "Analyzing..." screen
    │
    ├─ Call score-answers function
    │
4-6s├─ Receive scores
    │
    ├─ Show "Your mind has been ranked"
    │
    ├─ Reveal animation
    │
    ├─ Display full results
    │
    └─ Save to database
```

## 🎯 Key Integration Points

### 1. Frontend → Edge Function
```typescript
// TestTake.tsx
const { data, error } = await supabase.functions.invoke("generate-questions", {
  body: { qualification, stream, difficulty, examType }
});
```

### 2. Edge Function → Groq API
```typescript
// generate-questions/index.ts
const groqResponse = await fetch(GROQ_API_URL, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${GROQ_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemRole },
      { role: "user", content: fullPrompt }
    ],
    temperature: 0.8,
    max_tokens: 8000
  })
});
```

### 3. Frontend → Database
```typescript
// TestResult.tsx
const { data: insertData } = await supabase.from("test_results").insert({
  user_id: user.id,
  logic: scores.logic,
  creativity: scores.creativity,
  // ... other fields
}).select().single();
```

## 🔐 Security Flow

```
1. User Authentication
   ↓
2. Supabase RLS (Row Level Security)
   ↓
3. Edge Function Authorization
   ↓
4. Groq API Key (Server-side only)
   ↓
5. Response Validation
   ↓
6. Database Write (with user_id)
```

## 📊 Error Handling Flow

```
Try:
  ├─ Call Edge Function
  │  ├─ Try:
  │  │  ├─ Call Groq API
  │  │  ├─ Parse Response
  │  │  └─ Validate Data
  │  └─ Catch:
  │     └─ Return error JSON
  └─ Catch:
     └─ Show toast error
     └─ Navigate back to setup
```

---

This flow diagram shows the complete journey from user configuration to final results, including all AI processing steps and database interactions.
