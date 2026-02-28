// @ts-ignore: Deno URL import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { questions, answers, timeData, stream, qualification, difficulty } = await req.json();

    const GROQ_API_KEY = (globalThis as any).Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not configured");

    const subjectLabel = stream && stream.trim() !== "" ? stream : "General / All Subjects";

    // Build Q&A evaluation pairs
    const qaPairs = questions.map((q: any, i: number) => ({
      questionNumber: i + 1,
      scenario: q.question,
      selectedAnswer: answers[i] || "(no answer given)",
      correctAnswer: q.correctAnswer || null,
      isCorrect: answers[i] === q.correctAnswer,
      timeTakenSeconds: timeData?.[i] || 0,
    }));

    const systemPrompt = `You are an expert cognitive psychologist and academic evaluator. Your ONLY output is a raw JSON object — NO markdown, NO code fences, NO explanation text. Just the JSON object.`;

    const userPrompt = `Evaluate the following MCQ case-study exam performance for a student.

Student Level: ${qualification}
Subject: ${subjectLabel}
Difficulty: ${difficulty}

Questions and Answers:
${JSON.stringify(qaPairs, null, 2)}

Scoring Instructions:
Analyze how the student answered the 15 MCQ case-study questions. Judge them across 5 cognitive dimensions (0-100 scale):

1. logic — Does their choice of answers reflect clear deductive reasoning? Did they pick logically sound options in cause-effect scenarios?
2. creativity — Did they tend to pick novel, out-of-the-box answers? Did they avoid the "safe" answer when cases were ambiguous?
3. intuition — Even on harder questions, did they tend to pick the correct answer quickly or without obvious pattern?
4. emotionalIntelligence — On scenarios involving people, ethics, conflict, or human judgment — did they demonstrate empathy and social awareness in their answer choices?
5. systemsThinking — Did they pick answers that showed understanding of interconnected systems, long-term consequences, and multi-variable thinking?

Based on these 5 scores, calculate overallScore as a weighted average.

Also produce:
- aiInsight: A 2-3 sentence punchy analysis of how this student thinks.
- famousMatch: A famous intellectual, scientist, leader, or fictional character whose mind profile matches this student's score pattern.
- famousMatchReason: One sentence explaining why.
- archetype_report: One sentence naming and describing their cognitive archetype.
- superpowers: Array of 2-3 specific cognitive strengths shown in their answers.
- blindSpots: Array of 1-2 cognitive areas to improve.

Return ONLY this exact JSON structure:
{
  "logic": number,
  "creativity": number,
  "intuition": number,
  "emotionalIntelligence": number,
  "systemsThinking": number,
  "overallScore": number,
  "aiInsight": "string",
  "famousMatch": "string",
  "famousMatchReason": "string",
  "archetype_report": "string",
  "superpowers": ["string", "string"],
  "blindSpots": ["string"]
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
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    const groqData = await groqRes.json();

    if (!groqData.choices || !groqData.choices[0]) {
      throw new Error("Invalid response from Groq: " + JSON.stringify(groqData));
    }

    let content = groqData.choices[0].message.content.trim();

    // Strip any accidental markdown wrapping
    content = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const scores = JSON.parse(content);

    return new Response(JSON.stringify({ scores }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("score-answers error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
