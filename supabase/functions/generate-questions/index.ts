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

    const outputRules = `STRICT OUTPUT RULES - FOLLOW EXACTLY:

CRITICAL REQUIREMENTS:
1. Exactly 15 questions - ALL about ${stream || "academic subjects"}
2. EVERY question MUST have exactly 4 options in an array
3. EVERY question MUST be MCQ format
4. NO questions without options - this causes errors
5. ALL questions must be about ${stream || "the subject"} - NO generic puzzles

QUESTION STRUCTURE (MANDATORY):
{
  "id": number,
  "type": "Logic" | "Creativity" | "Intuition" | "Emotional Intelligence" | "Systems Thinking",
  "scenario": "3-5 sentence ${stream || "subject"}-specific scenario",
  "question": "Clear question about the scenario",
  "format": "mcq",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],  // MUST BE ARRAY OF 4 STRINGS
  "correctAnswer": "Option 1",  // MUST MATCH ONE OPTION EXACTLY
  "timeLimit": 90-150,
  "maxPoints": 10
}

EXAMPLE FOR MATHEMATICS (Secondary School, Basic):
{
  "id": 1,
  "type": "Logic",
  "scenario": "A shopkeeper bought 144 pencils for Rs. 1,440. He sold 100 pencils at Rs. 12 each and the remaining pencils at Rs. 15 each. Calculate his total profit or loss.",
  "question": "What is the shopkeeper's total profit?",
  "format": "mcq",
  "options": ["Rs. 300", "Rs. 360", "Rs. 420", "Rs. 480"],
  "correctAnswer": "Rs. 360",
  "timeLimit": 120,
  "maxPoints": 10
}

FORBIDDEN:
- Questions without options array
- Generic reasoning puzzles not about ${stream || "the subject"}
- Questions like "Design a transportation system" (too generic)
- Questions like "If all cats are animals" (logic puzzles, not ${stream || "subject"})
- Empty options arrays
- Options that are not strings

REQUIRED FOR ${stream || "MATHEMATICS"}:
- Use numbers, calculations, equations
- Include word problems with numerical answers
- Test arithmetic, algebra, geometry concepts
- Age-appropriate for ${qualification} level
- ${difficulty} difficulty means: ${difficulty === 'Basic' ? 'straightforward calculations' : difficulty === 'Standard' ? 'multi-step problems' : 'complex reasoning'}

Return ONLY valid JSON with 15 complete questions. NO markdown, NO explanations.`;

    const fullPrompt = `YOU MUST FOLLOW THESE INSTRUCTIONS EXACTLY:

${contextualRules}

${outputRules}

FINAL INSTRUCTIONS - READ CAREFULLY:
Generate EXACTLY 15 questions for ${qualification} level at ${difficulty} difficulty.
${stream ? `EVERY SINGLE QUESTION MUST BE ABOUT ${stream.toUpperCase()} - NOT generic puzzles!` : ''}

ABSOLUTELY FORBIDDEN QUESTION TYPES:
- "Identify the next item in the sequence" - FORBIDDEN
- "Design a new mode of transportation" - FORBIDDEN  
- "If all cats are animals" - FORBIDDEN
- "Which of the following statements is a valid conclusion" - FORBIDDEN
- Any pattern recognition without ${stream || 'subject'} context - FORBIDDEN
- Any creative divergence not about ${stream || 'subject'} - FORBIDDEN
- Any ethical reasoning not about ${stream || 'subject'} - FORBIDDEN

${stream === 'Mathematics' ? `
REQUIRED FOR MATHEMATICS:
- Use NUMBERS and CALCULATIONS in EVERY question
- Include Rs., meters, kg, or other units
- Test arithmetic, algebra, or geometry
- Example: "A shopkeeper bought 144 pencils for Rs. 1,440..."
- Example: "A rectangular field is 50 meters long..."
- Example: "If 3 apples cost Rs. 45, how much do 7 apples cost?"
` : ''}

YOU MUST RETURN VALID JSON WITH 15 QUESTIONS.
EACH QUESTION MUST HAVE:
- "options": ["opt1", "opt2", "opt3", "opt4"] (ARRAY OF 4 STRINGS)
- "format": "mcq" (NOT "text")
- "scenario": "3-5 sentence ${stream || 'subject'}-specific scenario"
- All other required fields

START YOUR RESPONSE WITH: {"questions":[
DO NOT include markdown, explanations, or anything else.`;

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
