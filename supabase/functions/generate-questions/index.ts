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
    const systemRole = `You are a Senior Academic Examiner with 20 years of experience specializing in ${stream || "comprehensive academic assessment"}.
You author questions that appear in leading educational journals worldwide.
Your output is exclusively raw JSON — no markdown, no commentary, no explanations.`;

    const subjectFocus = stream 
      ? `CRITICAL: ALL 15 questions MUST be directly related to ${stream} subject matter.
Every question must test ${stream} concepts, principles, or applications.
Use ${stream}-specific terminology, scenarios, and problems.
DO NOT create generic logic or reasoning questions - they must be ${stream}-focused.`
      : `Create questions across multiple academic subjects appropriate for ${qualification} level.`;

    const contextualRules = `Subject Focus: ${stream || "All Subjects"}
Level: ${qualification}
Difficulty Mode:
- Basic → Real scenarios from NCERT/Cambridge textbooks with straightforward ${stream || "subject"} application
- Standard → Same ${stream || "subject"} concepts with modified variables requiring analysis
- Competitive → Novel ${stream || "subject"} situations requiring advanced reasoning

${subjectFocus}

Generate questions that test cognitive abilities through ${stream || "academic"} content:
1. Logic - Deductive/inductive reasoning using ${stream || "subject"} principles
2. Creativity - Novel problem-solving in ${stream || "subject"} contexts
3. Intuition - Pattern recognition in ${stream || "subject"} scenarios
4. Emotional Intelligence - Real-world ${stream || "subject"} applications
5. Systems Thinking - Understanding interconnected ${stream || "subject"} concepts`;

    const outputRules = `STRICT OUTPUT RULES:
- Exactly 15 questions ALL about ${stream || "academic subjects"}
- All MCQ (Multiple Choice Questions) with exactly 4 options
- Each question MUST start with a 3+ sentence scenario about ${stream || "the subject"}
- The scenario should involve ${stream || "subject"}-specific concepts, problems, or situations
- After the scenario, ask a clear question testing ${stream || "subject"} understanding
- All 4 options must be plain text answers related to ${stream || "the subject"}
- correctAnswer must EXACTLY match one of the 4 options (character-by-character)
- Questions should test ${stream || "subject"} understanding, application, and analysis
- Distribute questions across all 5 cognitive dimensions BUT keep them ${stream || "subject"}-focused
- Each question should have a timeLimit (90-150 seconds based on difficulty)
- Each question worth 10 maxPoints

EXAMPLE for ${stream || "Mathematics"}:
{
  "id": 1,
  "type": "Logic",
  "scenario": "A farmer has a rectangular field that is 50 meters long and 30 meters wide. He wants to increase the area by 20% by adding equal strips of land along the length and width. The cost of land is $100 per square meter.",
  "question": "If the farmer adds strips of width 'x' meters to both dimensions, which equation correctly represents the new area?",
  "format": "mcq",
  "options": [
    "(50 + x)(30 + x) = 1800",
    "(50 + x)(30 + x) = 1500",
    "(50 + 2x)(30 + 2x) = 1800",
    "50x + 30x = 300"
  ],
  "correctAnswer": "(50 + x)(30 + x) = 1800",
  "timeLimit": 120,
  "maxPoints": 10
}

Return ONLY valid JSON in this exact format with 15 ${stream || "subject"}-specific questions.`;

    const fullPrompt = `${contextualRules}\n\n${outputRules}\n\nGenerate 15 unique MCQ case-study questions for ${qualification} level${stream ? ` SPECIFICALLY about ${stream} subject` : ""} at ${difficulty} difficulty. Remember: ALL questions must be about ${stream || "academic subjects"}, not generic reasoning puzzles.`;

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
