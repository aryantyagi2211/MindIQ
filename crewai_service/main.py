from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from crewai import Agent, Task, Crew, Process, LLM
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MindIQ CrewAI Service")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "MindIQ CrewAI Service"}

# Initialize LLM (Groq)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    # Fallback to empty string to avoid immediate crash at import, 
    # but we'll check again in the endpoints.
    GROQ_API_KEY = ""

llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY,
    temperature=0.7
)

# --- MODELS ---

class QuestionRequest(BaseModel):
    qualification: str
    stream: str
    difficulty: str
    examType: str  # 'mcq' or 'qa'

class UserAnswer(BaseModel):
    id: int
    answer: str

class ScoringRequest(BaseModel):
    questions: List[dict]
    answers: List[str]
    qualification: str
    stream: str
    difficulty: str

# --- AGENTS ---

architect = Agent(
    role="Cognitive Architect",
    goal="Design a specialized 15-question evaluation for {stream} at {qualification} level.",
    backstory=(
        "You are an expert in curriculum design and cognitive testing. "
        "Your duty is to create challenging, age-appropriate, and field-specific questions. "
        "For 'Basic' tests, you use established textbook knowledge. "
        "For 'Standard' tests, you apply conceptual logic with randomized variables. "
        "For 'Competitive' tests, you design high-complexity problems that stretch cognitive limits."
    ),
    llm=llm,
    allow_delegation=False,
    verbose=True
)

evaluator = Agent(
    role="Psychometric Evaluator",
    goal="Analyze user responses and provide a multi-dimensional cognitive score.",
    backstory=(
        "You are a master of psychometrics and cognitive science. "
        "You evaluate not just correctness, but the logic, creativity, and system-thinking "
        "demonstrated in responses. You score across: Logic, Creativity, Intuition, "
        "Systems Thinking, and EQ (Emotional Intelligence)."
    ),
    llm=llm,
    allow_delegation=False,
    verbose=True
)

# --- ENDPOINTS ---

@app.post("/generate")
async def generate_questions(req: QuestionRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not found in .env")
    try:
        format_instruction = (
            "All questions MUST be Multiple Choice (MCQ) with 4 options (A, B, C, D) and a clear correctAnswer." 
            if req.examType == "mcq" 
            else "All questions MUST be text-based Q&A without pre-defined options."
        )
        
        difficulty_instruction = {
            "Basic": "Use direct questions from reliable academic books and standard curriculum.",
            "Standard": "Use conceptual questions but change values, names, or scenarios to require fresh analysis.",
            "Competitive": "Make it a hard, very hard, tough paper. Focus on high-level problem solving, edge cases, and deep conceptual expertise."
        }.get(req.difficulty, "Standard")

        prompt = (
            f"Generate 15 unique questions for the stream '{req.stream}' at the '{req.qualification}' level. "
            f"Difficulty: {req.difficulty}. {difficulty_instruction} {format_instruction} "
            "Return ONLY a JSON array of objects with keys: id, type, question, format, options (if mcq), correctAnswer (if mcq), timeLimit (seconds), maxPoints."
        )

        task = Task(
            description=prompt,
            agent=architect,
            expected_output="A JSON array of 15 question objects."
        )

        crew = Crew(
            agents=[architect],
            tasks=[task],
            process=Process.sequential
        )

        result = crew.kickoff()
        
        # Clean up result if it contains markdown formatting
        content = result.raw
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        
        questions = json.loads(content)
        return {"questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate")
async def evaluate_answers(req: ScoringRequest):
    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not found in .env")
    try:
        data_to_eval = {
            "questions": req.questions,
            "answers": req.answers,
            "context": {
                "qualification": req.qualification,
                "stream": req.stream,
                "difficulty": req.difficulty
            }
        }

        prompt = (
            f"Evaluate these answers for a {req.difficulty} test in {req.stream} ({req.qualification}). "
            "Questions and user's answers are provided below. "
            f"Data: {json.dumps(data_to_eval)} "
            "Calculate scores (0-100) for: logic, creativity, intuition, systemsThinking, and emotionalIntelligence. "
            "Also provide an 'overallScore' (weighted average), a 'famousMatch' (famous person matching this cognitive profile), "
            "a 'famousMatchReason', 'aiInsight' (one-sentence analysis), and 'archetype_report' (detailed paragraph). "
            "Identify 2 'superpowers' and 2 'blindSpots' as string arrays. "
            "Return ONLY a clean JSON object with these keys."
        )

        task = Task(
            description=prompt,
            agent=evaluator,
            expected_output="A JSON object containing the cognitive scoring and profile report."
        )

        crew = Crew(
            agents=[evaluator],
            tasks=[task],
            process=Process.sequential
        )

        result = crew.kickoff()
        
        content = result.raw
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
                
        scores = json.loads(content)
        return {"scores": scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
