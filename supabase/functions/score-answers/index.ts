// @ts-ignore: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questions, answers, timeData, stream, qualification, difficulty } = await req.json();

    const GROQ_API_KEY = (globalThis as any).Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const subjectContext = stream ? `focusing on ${stream}` : "covering all related subjects generally";

    const qaPairs = questions.map((q: any, i: number) => ({
      question: q.question,
      userAnswer: answers[i],
      correctAnswer: q.correctAnswer || null,
      maxPoints: q.maxPoints || 10
    }));

    const prompt = `[AGENTIC ROLE: PERFORMANCE ANALYST]
    Evaluate the following rigorous case-study responses for a student taking a ${difficulty} difficulty exam at the ${qualification} level, ${subjectContext}.
    
    Data: ${JSON.stringify(qaPairs)}
    
    You must score the user across these 5 dimensions (0-100 scale):
    - logic: How well their answers demonstrate deductive and inductive reasoning.
    - creativity: Their ability to tackle novel scenarios presented in the case studies.
    - intuition: Their instinctual grasp of the correct answers on complex problems.
    - emotionalIntelligence: (EQ) How well they navigated scenarios involving human elements, ethics, or nuanced judgment.
    - systemsThinking: Their ability to understand interconnected systems and cascading consequences.

    Based on these scores, calculate an overallScore (0-100).
    Also provide qualitative feedback:
    - aiInsight: A brief, punchy analysis of their performance.
    - famousMatch: A famous intellectual or character they match based on their dimension spread.
    - famousMatchReason: Why they match this person.
    - archetype_report: A single sentence describing their cognitive archetype.
    - superpowers: An array of 2-3 specific strengths.
    - blindSpots: An array of 1-2 areas for improvement.

    Return ONLY a valid JSON object matching exactly this structure:
    {
      "logic": number, 
      "creativity": number, 
      "intuition": number, 
      "emotionalIntelligence": number, 
      "systemsThinking": number,
      "overallScore": number, 
      "aiInsight": string, 
      "famousMatch": string, 
      "famousMatchReason": string, 
      "archetype_report": string,
      "superpowers": [string, string], 
      "blindSpots": [string]
    }`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const data = await groqRes.json();
    let content = data.choices[0].message.content.trim();
    if (content.startsWith("```")) content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
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
