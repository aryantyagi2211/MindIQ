/// <reference path="../types.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface RequestBody {
  questions?: Array<Record<string, unknown>>;
  answers?: string[];
  timeData?: number[];
  stream?: string;
  qualification?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { questions, answers, timeData, stream, qualification }: RequestBody = await req.json();

    if (!questions || !answers) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate basic metrics
    let correctCount = 0;
    const questionAnalysis = questions.map((q: Record<string, unknown>, idx: number) => {
      const userAnswer = answers[idx] || "";
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        type: q.type,
        scenario: q.scenario,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: userAnswer,
        isCorrect: isCorrect,
        timeTaken: timeData?.[idx] || 0,
      };
    });

    const totalQuestions = questions.length;
    const accuracyRate = (correctCount / totalQuestions) * 100;

    // Build AI scoring prompt
    const systemRole = `You are an expert cognitive psychologist and psychometrician specializing in multidimensional intelligence assessment.
You analyze test performance across 5 cognitive dimensions and provide deep psychological insights.
Your output is exclusively raw JSON — no markdown, no commentary.`;

    const scoringPrompt = `Analyze this test performance and score across 5 cognitive dimensions:

TEST CONTEXT:
- Level: ${qualification}
- Subject: ${stream || "General"}
- Total Questions: ${totalQuestions}
- Correct Answers: ${correctCount}
- Accuracy Rate: ${accuracyRate.toFixed(1)}%

QUESTION-BY-QUESTION ANALYSIS:
${questionAnalysis.map((qa: Record<string, unknown>, i: number) => {
  const options = Array.isArray(qa.options) ? qa.options.join(" | ") : "N/A";
  return `
Question ${i + 1} [${qa.type}]:
Scenario: ${qa.scenario}
Question: ${qa.question}
Options: ${options}
Correct Answer: ${qa.correctAnswer}
User Answer: ${qa.userAnswer || "No answer"}
Result: ${qa.isCorrect ? "✓ Correct" : "✗ Incorrect"}
Time Taken: ${qa.timeTaken}s
`;
}).join("\n")}

SCORING INSTRUCTIONS:
Analyze the pattern of correct/incorrect answers, which specific options were chosen, and time taken to derive scores for:

1. LOGIC (0-100): Deductive/inductive reasoning ability
   - Look at performance on cause-effect scenarios
   - Consider if wrong answers show logical fallacies
   - Higher score if correct on complex reasoning questions

2. CREATIVITY (0-100): Novel thinking and non-obvious solutions
   - Look at performance on ambiguous scenarios
   - Consider if answers show conventional vs creative thinking
   - Higher score if correct on questions requiring lateral thinking

3. INTUITION (0-100): Pattern recognition and instinct quality
   - Look at performance on difficult questions answered quickly
   - Consider accuracy rate on questions with incomplete information
   - Higher score if correct on questions requiring gut feeling

4. EMOTIONAL INTELLIGENCE (0-100): Empathy and ethical judgment
   - Look at performance on people-centered scenarios
   - Consider answers involving social dynamics, ethics, emotions
   - Higher score if correct on questions requiring empathy

5. SYSTEMS THINKING (0-100): Understanding interconnected consequences
   - Look at performance on multi-factor scenarios
   - Consider answers involving complex systems, feedback loops
   - Higher score if correct on questions with cascading effects

OVERALL SCORE: Calculate weighted average (0-100) based on all dimensions

PSYCHOLOGICAL INSIGHTS:
- Provide a 2-3 sentence AI insight about their cognitive profile
- Match them to a famous mind (scientist, thinker, leader) with reasoning
- Identify 2-3 superpowers (cognitive strengths)
- Identify 2-3 blind spots (areas for improvement)
- Write a 4-5 paragraph archetype report analyzing their thinking style

Return ONLY valid JSON in this exact format:
{
  "logic": 75,
  "creativity": 82,
  "intuition": 68,
  "emotionalIntelligence": 71,
  "systemsThinking": 79,
  "overallScore": 75,
  "aiInsight": "Brief insight about their cognitive profile...",
  "famousMatch": "Name of famous person",
  "famousMatchReason": "Why they match this person...",
  "superpowers": ["Strength 1", "Strength 2", "Strength 3"],
  "blindSpots": ["Area 1", "Area 2", "Area 3"],
  "archetype_report": "Multi-paragraph deep analysis of their thinking style, patterns, and potential..."
}`;

    // Call Groq API for scoring
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemRole },
          { role: "user", content: scoringPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to score answers with AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content received from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse JSON response
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/```\n?/g, "");
    }

    const scores = JSON.parse(cleanContent);

    // Validate and ensure all fields exist
    const validatedScores = {
      logic: scores.logic || 50,
      creativity: scores.creativity || 50,
      intuition: scores.intuition || 50,
      emotionalIntelligence: scores.emotionalIntelligence || 50,
      systemsThinking: scores.systemsThinking || 50,
      overallScore: scores.overallScore || 50,
      aiInsight: scores.aiInsight || "Your cognitive profile shows balanced thinking across multiple dimensions.",
      famousMatch: scores.famousMatch || "Renaissance Thinker",
      famousMatchReason: scores.famousMatchReason || "You demonstrate versatile thinking across multiple domains.",
      superpowers: Array.isArray(scores.superpowers) ? scores.superpowers : ["Analytical thinking", "Problem solving", "Adaptability"],
      blindSpots: Array.isArray(scores.blindSpots) ? scores.blindSpots : ["Time management", "Detail orientation", "Risk assessment"],
      archetype_report: scores.archetype_report || "Your thinking style demonstrates a balanced approach to problem-solving, combining analytical rigor with creative exploration. You show potential for growth across multiple cognitive dimensions.",
    };

    return new Response(
      JSON.stringify({ 
        scores: validatedScores,
        correctCount: correctCount,
        totalQuestions: totalQuestions,
        accuracyRate: accuracyRate
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
