// @ts-ignore: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { qualification, stream, difficulty, examType } = await req.json();

    // PING LIVE CREWAI SERVICE
    try {
      const response = await fetch("https://2iqlldau.up.railway.app/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qualification, stream, difficulty, examType }),
      });

      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify({ questions: data.questions }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch (proxyError) {
      console.error("Live CrewAI service unreachable, falling back to basic generation:", proxyError);
    }

    // FALLBACK: BASIC GROQ GENERATION (Old Logic)
    const GROQ_API_KEY = (globalThis as any).Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const prompt = `[AGENTIC ROLE: THE ARCHITECT]
    Generate 15 unique questions for ${stream} at ${qualification} level.
    Difficulty: ${difficulty}. Exam Type: ${examType}.
    Return ONLY a JSON array of objects: [{"id": number, "type": string, "question": string, "format": "mcq" | "text", "options": [".."], "correctAnswer": "..", "timeLimit": number, "maxPoints": number}]`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await groqRes.json();
    let content = data.choices[0].message.content.trim();
    if (content.startsWith("```")) content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const questions = JSON.parse(content);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
