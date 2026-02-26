import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questions, answers, timeData, field, subfield } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
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

    const prompt = `Score these cognitive test answers honestly and accurately:
Questions + Answers: ${JSON.stringify(qaPairs)}
Time taken per question: ${JSON.stringify(timeData)}
User field: ${field}, Subfield: ${subfield}

For MCQ questions, the correct answer is provided. For text questions, evaluate the quality, depth, and creativity of the response.

Return ONLY valid JSON (no markdown, no code blocks):
{"logic": 0-100, "creativity": 0-100, "intuition": 0-100, "emotionalIntelligence": 0-100, "systemsThinking": 0-100, "overallScore": 0-100, "aiInsight": "3 sentences describing this specific mind uniquely", "famousMatch": "One real famous historical figure name", "famousMatchReason": "One sentence why they match", "superpowers": ["strength 1", "strength 2"], "blindSpots": ["weakness 1", "weakness 2"]}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
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
  } catch (e) {
    console.error("score-answers error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
