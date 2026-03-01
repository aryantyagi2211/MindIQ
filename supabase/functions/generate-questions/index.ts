/// <reference path="../types.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface RequestBody {
  qualification?: string;
  stream?: string;
  difficulty?: string;
  examType?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { qualification, stream, difficulty, examType = "mcq" }: RequestBody = await req.json();

    if (!qualification || !difficulty) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Build the AI prompt
    const systemRole = `You are a Senior Academic Examiner with 20 years of experience.
You author questions that appear in leading educational journals worldwide.
Your output is exclusively raw JSON — no markdown, no commentary, no explanations.`;

    const contextualRules = `Subject: ${stream || "All Subjects"}
Level: ${qualification}
Difficulty Mode:
- Basic → Real scenarios from NCERT/Cambridge textbooks with straightforward application
- Standard → Same concepts with modified variables requiring analysis and reasoning
- Competitive → Novel, unseen situations requiring advanced reasoning and critical thinking

Generate questions that test cognitive abilities across 5 dimensions:
1. Logic - Deductive/inductive reasoning in cause-effect scenarios
2. Creativity - Ability to pick novel, non-obvious answers in ambiguous scenarios
3. Intuition - Pattern recognition and instinct-based decision making
4. Emotional Intelligence - Empathy/ethical judgment in people-centered scenarios
5. Systems Thinking - Understanding of interconnected consequences`;

    const outputRules = `STRICT OUTPUT RULES:
- Exactly 15 questions
- All MCQ (Multiple Choice Questions) with exactly 4 options
- Each question MUST start with a 3+ sentence scenario narrative that sets up a real-world context
- The scenario should be detailed, engaging, and relevant to ${qualification} level
- After the scenario, ask a clear question that requires analysis of the scenario
- All 4 options must be plain text (no formulas, no sequences, no fill-in-the-blank)
- correctAnswer must EXACTLY match one of the 4 options (character-by-character)
- No arithmetic sequences, no pattern completion, no direct definitions
- Questions should test understanding, application, and analysis - not just recall
- Distribute questions across all 5 cognitive dimensions
- Each question should have a timeLimit (90-150 seconds based on difficulty)
- Each question worth 10 maxPoints

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "type": "Logic",
      "scenario": "Three to five sentence real-world scenario here...",
      "question": "Based on the scenario above, what is the most appropriate conclusion?",
      "format": "mcq",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option A text",
      "timeLimit": 120,
      "maxPoints": 10
    }
  ]
}`;

    const fullPrompt = `${contextualRules}\n\n${outputRules}\n\nGenerate 15 unique MCQ case-study questions for ${qualification} level${stream ? ` focusing on ${stream}` : ""} at ${difficulty} difficulty.`;

    // Call Groq API
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemRole },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate questions from AI" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const groqData = await groqResponse.json();
    const content = groqData.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No content received from AI" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Parse JSON response (remove markdown if present)
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(cleanContent);
    const questions = parsed.questions || [];

    // Validate questions
    if (!Array.isArray(questions) || questions.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid question format received" }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Ensure all questions have required fields
    const validatedQuestions = questions.map((q: Record<string, unknown>, idx: number) => ({
      id: q.id || idx + 1,
      type: q.type || "General",
      scenario: q.scenario || "",
      question: q.question || "",
      format: "mcq",
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: q.correctAnswer || "",
      timeLimit: q.timeLimit || (difficulty === "Basic" ? 90 : difficulty === "Standard" ? 120 : 150),
      maxPoints: q.maxPoints || 10,
    }));

    return new Response(
      JSON.stringify({ questions: validatedQuestions }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );

  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
