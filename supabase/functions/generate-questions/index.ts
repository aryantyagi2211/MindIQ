// @ts-ignore: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { qualification, stream, difficulty } = await req.json();

    const GROQ_API_KEY = (globalThis as any).Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const subjectContext = stream
      ? `the subject of "${stream}"`
      : `all core subjects relevant to ${qualification} level students`;

    let difficultyInstruction = "";
    if (difficulty === "Basic") {
      difficultyInstruction = `The scenarios must be directly derived from standard ${qualification} level textbooks. Present foundational concepts as real-world situations students would encounter. Language and reasoning should be accessible and straightforward.`;
    } else if (difficulty === "Standard") {
      difficultyInstruction = `The scenarios must take textbook concepts and modify key variables, add complexity, or require multi-step reasoning. Students cannot answer by simple recall — they must apply actual understanding.`;
    } else if (difficulty === "Competitive") {
      difficultyInstruction = `Create totally unique, high-stakes scenarios that are deeply analytical. These should challenge even top students with non-obvious answers, cross-disciplinary thinking, and edge-case logic. Draw inspiration from elite competitive exam styles (IAS, GRE, GMAT, Olympiad, etc.).`;
    }

    const prompt = `You are a world-class academic examiner creating a rigorous question paper.

TASK: Generate EXACTLY 15 MCQ Case-Study questions for ${qualification} level students studying ${subjectContext}.

DIFFICULTY: ${difficulty}
${difficultyInstruction}

===STRICT RULES (FOLLOW THESE OR YOUR OUTPUT IS INVALID)===

RULE 1 — FORMAT: ALL 15 questions MUST have "format": "mcq". NEVER "text". NO EXCEPTIONS.

RULE 2 — NO PATTERN QUESTIONS: You are STRICTLY FORBIDDEN from generating any of the following:
  - Number sequences (e.g. "What comes next: 2, 5, 8, 11?")
  - Letter sequences or substitutions
  - Simple arithmetic problems
  - Coding/output prediction
  - Fill in the blank
  - Direct factual recall ("What is the capital of...?")
  - True/False style questions disguised as MCQ
  - Analogy questions ("A is to B as C is to...")

RULE 3 — CASE STUDY FORMAT ONLY: Every question MUST start with a multi-sentence real-world scenario or narrative (at least 3 sentences describing a situation, person, event, or dilemma). THEN ask a specific analytical question about that scenario.

RULE 4 — OPTIONS: Provide exactly 4 distinct MCQ options. Options must NOT start with "A)", "B)", "C)", "D)". They must be plain text.

RULE 5 — CORRECT ANSWER: The "correctAnswer" must exactly match one of the options (copy-paste identical).

RULE 6 — UNIQUENESS: Each question must be about a completely different scenario and subject topic. No two questions may look similar.

RULE 7 — OUTPUT: Return ONLY a raw JSON array. No markdown, no explanation, no intro text.

JSON format for each question:
{
  "id": number,
  "type": "Case Study",
  "question": "string — 3+ sentence scenario followed by a specific question",
  "format": "mcq",
  "options": ["option 1", "option 2", "option 3", "option 4"],
  "correctAnswer": "string — must exactly match one option",
  "timeLimit": number (90 to 150 seconds),
  "maxPoints": number (15 to 30)
}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a strict academic examiner. You only output raw JSON with NO markdown. You never generate pattern recognition or sequence questions. Every question is a rich, narrative case study.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
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
