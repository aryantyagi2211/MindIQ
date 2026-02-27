// @ts-ignore: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { qualification, field, subfield, difficulty, examType, age } = await req.json();
    const GROQ_API_KEY = (globalThis as any).Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const qual = qualification || age || "Undergraduate";

    let formatInstruction = "";
    let jsonSchema = "";

    if (examType === "mcq") {
      formatInstruction = "All questions MUST be Multiple Choice (MCQ).";
      jsonSchema = `[{"id": number, "type": string, "question": string, "format": "mcq", "options": ["A)..","B)..","C)..","D"..], "correctAnswer": string, "timeLimit": number, "maxPoints": number}]`;
    } else if (examType === "qa") {
      formatInstruction = "All questions MUST be Open-Ended Q&A (text format). DO NOT include any options or correct answers.";
      jsonSchema = `[{"id": number, "type": string, "question": string, "format": "text", "timeLimit": number, "maxPoints": number}]`;
    } else {
      formatInstruction = "Provide a mix of MCQ and text questions.";
      jsonSchema = `[{"id": number, "type": string, "question": string, "format": "mcq" | "text", "options": [".."] (if mcq), "correctAnswer": ".." (if mcq), "timeLimit": number, "maxPoints": number}]`;
    }

    // Random seed to ensure unique questions every time
    const seed = Date.now() + Math.random();

    const prompt = `[AGENTIC ROLE: THE ARCHITECT]
You are a high-level cognitive architect. Your goal is to generate specialized assessment content for the field of ${field} (${subfield}).

CRITICAL INSTRUCTION: ${formatInstruction}
You must follow this format with 100% strictness. 

CONTEXT:
Level: ${qual}
Field: ${field}
Subfield: ${subfield}
Difficulty: ${difficulty}
Seed: ${seed}

TASKS:
1. Generate 15 unique questions for ${subfield}.
2. Distribution: 3 questions each for Pattern Recognition, Logical Deduction, Creative Divergence, Ethical Reasoning, and Systems Thinking.

Return ONLY a valid JSON array matching this EXACT schema:
${jsonSchema}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are The Architect. You are a precise JSON generator that never deviates from the requested format." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
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

    let questions = JSON.parse(content);

    // Final Safety Filter: Ensure questions match the requested examType
    if (examType === "mcq") {
      questions = questions.filter((q: any) => q.format === "mcq" && q.options && q.options.length === 4);
    } else if (examType === "qa") {
      questions = questions.filter((q: any) => q.format === "text");
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-questions error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
