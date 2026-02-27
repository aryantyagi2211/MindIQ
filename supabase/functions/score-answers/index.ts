// @ts-ignore: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questions, answers, timeData, field, subfield } = await req.json();
    const GROQ_API_KEY = (globalThis as any).Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const qaPairs = questions.map((q: any, i: number) => ({
      question: q.question,
      type: q.type,
      format: q.format,
      correctAnswer: q.correctAnswer || null,
      userAnswer: answers[i],
      timeTaken: timeData[i],
      timeLimit: q.timeLimit,
      maxPoints: q.maxPoints,
    }));

    const prompt = `[AGENTIC CREW: THE EVALUATOR & THE ANALYST]
As THE EVALUATOR, your job is to score these cognitive assessments with brutal honesty and pinpoint accuracy.
As THE ANALYST, your job is to synthesize these scores into a world-class "Cognitive Archetype" report.

DATA:
Questions + Answers: ${JSON.stringify(qaPairs)}
User field: ${field}, Subfield: ${subfield}

SCORING RULES (The Evaluator):
1. For MCQ: Score only based on the provided correct answer.
2. For Text (Q&A): Ignore keywords. Score based on the DEPTH of reasoning, complexity of vocabulary, and originality of the solution. If the answer is generic or short, penalize the score.
3. Be strict. 100 is reserved for genius-level responses.

INSIGHT RULES (The Analyst):
1. Determine the "Famous Match" (Real historical figure).
2. Generate an "Archetype Report": A 4-paragraph detailed analysis of the user's cognitive structure, explaining how their dimensions (Logic, Creativity, etc.) interact. Use professional, futuristic, and encouraging language.

Return ONLY valid JSON:
{
  "logic": 0-100, 
  "creativity": 0-100, 
  "intuition": 0-100, 
  "emotionalIntelligence": 0-100, 
  "systemsThinking": 0-100, 
  "overallScore": 0-100, 
  "aiInsight": "3 sentences summary", 
  "famousMatch": "Name", 
  "famousMatchReason": "Short reason", 
  "archetype_report": "Full 4-paragraph detailed report",
  "superpowers": [".."], 
  "blindSpots": [".."]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a dual-agent system: The Evaluator (scoring) and The Analyst (archetypes). You are insightful, analytical, and futuristic." },
          { role: "user", content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq scoring error:", err);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const scores = JSON.parse(content);

    return new Response(JSON.stringify({ scores }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("score-answers error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
