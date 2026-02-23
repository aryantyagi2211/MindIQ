import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { age, field, subfield, difficulty } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const prompt = `You are a cognitive assessment engine. Generate 15 completely unique questions for:
Age: ${age}, Field: ${field}, Subfield: ${subfield}, Difficulty: ${difficulty}

Generate 3 questions of each type:
1. Pattern Recognition
2. Logical Deduction
3. Creative Divergence
4. Ethical Reasoning
5. Systems Thinking

Mix question formats — some must be MCQ (4 options, one correct), some must be open text Q&A. Never repeat common IQ test questions. Make questions feel fresh, modern, and relevant to their specific subfield. Every session must produce completely different questions.

Return ONLY valid JSON array (no markdown, no code blocks):
[{"id": number, "type": string, "question": string, "format": "mcq" or "text", "options": ["A)..","B)..","C)..","D).."] (only if mcq), "correctAnswer": string (only if mcq), "timeLimit": number in seconds, "maxPoints": number}]`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Strip markdown code blocks if present
    if (content.startsWith("```")) {
      content = content.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const questions = JSON.parse(content);

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-questions error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
