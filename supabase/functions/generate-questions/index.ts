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

    let formatInstruction = "";
    if (examType === "mcq") {
      formatInstruction = "FORCE MCQ ONLY: Every single question MUST be MCQ format ('format': 'mcq') with 4 options and a correctAnswer. ABSOLUTELY NO open-ended text questions.";
    } else if (examType === "qa") {
      formatInstruction = "FORCE Q&A ONLY: Every single question MUST be open-ended format ('format': 'text'). ABSOLUTELY NO MCQ options or correctAnswers. The user will type their response.";
    } else {
      formatInstruction = "MIXED MODE: Provide a balance of MCQ and open-ended text formats.";
    }

    // Random seed to ensure unique questions every time
    const seed = Date.now() + Math.random();

    const prompt = `[AGENTIC ROLE: THE ARCHITECT]
You are a high-level cognitive architect responsible for generating and validating specialized assessment content.
Your goal is to cross-check every question for scientific accuracy and eliminate any hallucinations.

CRITICAL FORMAT REQUIREMENT: ${formatInstruction}

CONTEXT:
Qualification Level: ${qual}
Field: ${field}
Subfield: ${subfield}
Difficulty: ${difficulty}
Seed: ${seed}

TASKS:
1. Generate 15 unique questions specifically for the ${subfield} specialization.
2. Distribution: 3 questions each for Pattern Recognition, Logical Deduction, Creative Divergence, Ethical Reasoning, and Systems Thinking.

SPECIFICATIONS:
- High School: Foundational scenarios.
- Undergraduate: Applied theory.
- Masters/PhD: Research-level depth.

Return ONLY valid JSON array:
[{"id": number, "type": string, "question": string, "format": "mcq" | "text", "options": ["A)..","B)..","C)..","D).."] (IF AND ONLY IF mcq), "correctAnswer": string (IF AND ONLY IF mcq), "timeLimit": number, "maxPoints": number}]`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are The Architect. You follow format instructions with 100% strictness. If the user asks for MCQ, you NEVER provide text questions. If the user asks for Q&A, you NEVER provide MCQ." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
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
