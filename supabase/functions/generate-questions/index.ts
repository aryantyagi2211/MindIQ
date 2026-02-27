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

    const prompt = `[AGENTIC ROLE: THE ARCHITECT]
You are a high-level cognitive architect responsible for generating and validating specialized assessment content.
Your goal is to cross-check every question for scientific accuracy and eliminate any hallucinations or generic 'pop-psych' fluff.

CONTEXT:
Qualification Level: ${qual}
Academic/Professional Field: ${field}
Specialization (Subfield): ${subfield}
Neural Complexity (Difficulty): ${difficulty}
Random Seed: ${seed}

TASKS:
1. Generate 15 unique, high-fidelity questions tailored exactly to the subfield logic.
2. Ensure specific distribution: 3 questions each for Pattern Recognition, Logical Deduction, Creative Divergence, Ethical Reasoning, and Systems Thinking.
3. [FORMAT RULE]: ${formatInstruction}

SPECIFICATIONS:
- Secondary/High School: Foundational scenarios, intuitive logic.
- Undergraduate: Theoretical applications, interdisciplinary links.
- Masters/PhD: Research-level depth, analytical modeling, specialized subfield nuances (e.g., if Robotics, use Kinematics/AI logic).

CRITICAL: Do not repeat standard IQ questions. Create fresh, world-class scenarios. Ensure zero scientific errors.

Return ONLY valid JSON array:
[{"id": number, "type": string, "question": string, "format": "mcq" or "text", "options": ["A)..","B)..","C)..","D).."] (if mcq), "correctAnswer": string (if mcq), "timeLimit": number, "maxPoints": number}]`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are The Architect, an agentic evaluator of cognitive questions. You are precise, scientific, and thorough." },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
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
