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

    // PING LIVE CREWAI SERVICE
    try {
      const response = await fetch("https://2iqlldau.up.railway.app/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions, answers, qualification, stream, difficulty }),
      });

      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify({ scores: data.scores }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (proxyError) {
      console.error("Live CrewAI service unreachable, falling back to basic scoring:", proxyError);
    }

    // FALLBACK: BASIC GROQ SCORING (Old Logic)
    const GROQ_API_KEY = (globalThis as any).Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const qaPairs = questions.map((q: any, i: number) => ({
      question: q.question,
      userAnswer: answers[i],
      correctAnswer: q.correctAnswer || null,
    }));

    const prompt = `Evaluate these answers for a ${difficulty} test in ${stream} (${qualification}).
    Data: ${JSON.stringify(qaPairs)}
    Return ONLY a JSON object: {
      "logic": 0-100, "creativity": 0-100, "intuition": 0-100, "emotionalIntelligence": 0-100, "systemsThinking": 0-100,
      "overallScore": 0-100, "aiInsight": "..", "famousMatch": "..", "famousMatchReason": "..", "archetype_report": "..",
      "superpowers": [".."], "blindSpots": [".."]
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
