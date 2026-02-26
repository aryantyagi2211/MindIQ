import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { qualification, field, subfield, difficulty, examType, age } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const qual = qualification || age || "Undergraduate";
    
    // Determine format instruction based on examType
    let formatInstruction = "";
    if (examType === "mcq") {
      formatInstruction = "ALL 15 questions MUST be MCQ format with exactly 4 options (A, B, C, D) and one correct answer. Do NOT include any text/open-ended questions.";
    } else if (examType === "qa") {
      formatInstruction = "ALL 15 questions MUST be open-ended text format (format: 'text'). Do NOT include any MCQ questions. No options needed.";
    } else {
      formatInstruction = "Mix question formats — some MCQ (4 options, one correct), some open text Q&A.";
    }

    // Random seed to ensure unique questions every time
    const seed = Date.now() + Math.random();

    const prompt = `You are a cognitive assessment engine. Generate 15 completely unique questions for:
Qualification Level: ${qual}, Field: ${field}, Subfield: ${subfield}, Difficulty: ${difficulty}
Random Seed: ${seed}

Generate 3 questions of each type:
1. Pattern Recognition
2. Logical Deduction
3. Creative Divergence
4. Ethical Reasoning
5. Systems Thinking

IMPORTANT FORMAT RULE: ${formatInstruction}

Adjust question complexity to match the qualification level:
- Secondary/High School: simpler concepts, foundational knowledge, age-appropriate scenarios
- Undergraduate: intermediate complexity, theoretical + applied
- Postgraduate/Masters: advanced concepts, research-oriented, analytical depth
- PhD: cutting-edge, research-level, highly specialized

CRITICAL: Never repeat common IQ test questions. Every session must produce COMPLETELY DIFFERENT questions. Randomize question order, vary the types of scenarios, use different real-world contexts each time. Make questions feel fresh, modern, and relevant to their specific subfield.

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
        temperature: 1.2,
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
