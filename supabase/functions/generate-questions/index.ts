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

    // Build subject scope
    const subjectScope = stream && stream.trim() !== ""
      ? `ONLY the subject: "${stream}". Do NOT include topics from any other subject.`
      : `all core subjects taught at the ${qualification} level (e.g. Science, Math, Social Studies, Language Arts, etc.)`;

    // Build difficulty-based instruction
    let levelInstruction = "";
    if (difficulty === "Basic") {
      levelInstruction = `
- Draw scenarios DIRECTLY from standard ${qualification} level textbooks and curriculum.
- Situations should be familiar and relatable to a student at this level.
- One clear correct answer that a well-read student at this level would recognize.
- Language must be simple and age-appropriate.`;
    } else if (difficulty === "Standard") {
      levelInstruction = `
- Scenarios should apply ${qualification} level concepts to slightly novel, real-world contexts.
- Students must think analytically — simple recall is NOT enough.
- Introduce variables or conditions that require reasoning beyond direct memorization.
- Moderate language complexity.`;
    } else {
      levelInstruction = `
- Create highly complex, unique scenarios inspired by competitive exams (GRE, Olympiad, IAS, SAT, GMAT).
- Questions should demand cross-subject thinking, advanced logic, and nuanced judgment.
- The correct answer should NOT be obvious and requires deep understanding.
- Challenging academic vocabulary and sophisticated scenario design.`;
    }

    const systemPrompt = `You are a world-class academic examiner. Your ONLY output is a raw JSON array — NO markdown, NO explanation, NO code fences, NO intro text. Just the JSON array.`;

    const userPrompt = `Generate EXACTLY 15 MCQ Case-Study questions.

Subject scope: ${subjectScope}
Level: ${qualification}
Difficulty: ${difficulty}
${levelInstruction}

ABSOLUTE RULES — violating any rule makes your output invalid:

1. EVERY question format must be "mcq" — never "text", never open-ended.
2. EVERY question must be a case study: start with a detailed real-world scenario of at least 3 sentences describing people, events, or a situation. End with a specific analytical question about it.
3. NEVER generate: number/letter sequences, "what comes next", arithmetic drills, fill-in-the-blank, definition questions, analogy questions, or true/false disguised as MCQ.
4. Provide EXACTLY 4 answer options per question. Options are plain text — do NOT prefix with A), B), C), D).
5. "correctAnswer" must be an EXACT copy of one of the options — character for character.
6. Each question must cover a DIFFERENT scenario and topic. No two questions may be about the same situation.
7. Return ONLY a raw JSON array. Nothing before or after the array.

JSON structure for each of the 15 questions:
{
  "id": number (1-15),
  "type": "Case Study",
  "question": "3+ sentence real-world scenario followed by the analytical question",
  "format": "mcq",
  "options": ["plain option 1", "plain option 2", "plain option 3", "plain option 4"],
  "correctAnswer": "exact copy of the correct option",
  "timeLimit": number (between 90 and 150),
  "maxPoints": number (between 15 and 30)
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 8000,
      }),
    });

    const groqData = await groqRes.json();

    if (!groqData.choices || !groqData.choices[0]) {
      throw new Error("Invalid response from Groq: " + JSON.stringify(groqData));
    }

    let content = groqData.choices[0].message.content.trim();

    // Strip any accidental markdown wrapping
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // Parse and validate
    const questions = JSON.parse(content);

    if (!Array.isArray(questions)) {
      throw new Error("Groq did not return an array of questions");
    }

    // Ensure all questions are MCQ and have options
    const cleaned = questions.map((q: any) => ({
      ...q,
      format: "mcq",
      options: Array.isArray(q.options) ? q.options : [],
    })).filter((q: any) => q.options.length === 4);

    return new Response(JSON.stringify({ questions: cleaned }), {
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
