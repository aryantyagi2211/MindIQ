import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Question } from "@/lib/constants";
import { Loader2 } from "lucide-react";

function TimerRing({ timeLeft, timeLimit }: { timeLeft: number; timeLimit: number }) {
  const pct = timeLeft / timeLimit;
  const offset = 283 * (1 - pct);
  const color = pct > 0.5 ? "hsl(var(--primary))" : pct > 0.2 ? "hsl(45, 100%, 60%)" : "hsl(0, 84%, 60%)";

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6"
          className="timer-ring" style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{timeLeft}</span>
      </div>
    </div>
  );
}

export default function TestTake() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ageGroup, difficulty, field, subfield, examType = "mcq" } = (location.state as any) || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeData, setTimeData] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [textAnswer, setTextAnswer] = useState("");

  useEffect(() => {
    if (!field) { navigate("/test/setup"); return; }

    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-questions", {
          body: { age: ageGroup, field, subfield, difficulty, examType },
        });
        if (error) throw error;
        if (data.error) throw new Error(data.error);
        setQuestions(data.questions);
        setAnswers(new Array(data.questions.length).fill(""));
        setTimeData(new Array(data.questions.length).fill(0));
        setTimeLeft(data.questions[0].timeLimit);
        setQuestionStartTime(Date.now());
      } catch (e: any) {
        toast.error("Failed to generate questions: " + e.message);
        navigate("/test/setup");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [field]);

  // Timer countdown
  useEffect(() => {
    if (loading || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, currentIndex, questions.length]);

  const handleNext = useCallback(() => {
    if (questions.length === 0) return;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const newTimeData = [...timeData];
    newTimeData[currentIndex] = timeTaken;
    setTimeData(newTimeData);

    // Save text answer
    if (questions[currentIndex]?.format === "text" && textAnswer) {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = textAnswer;
      setAnswers(newAnswers);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(questions[currentIndex + 1].timeLimit);
      setQuestionStartTime(Date.now());
      setTextAnswer("");
    } else {
      // Submit
      const finalTimeData = newTimeData;
      const finalAnswers = [...answers];
      if (questions[currentIndex]?.format === "text") {
        finalAnswers[currentIndex] = textAnswer;
      }
      navigate("/test/result", {
        state: { questions, answers: finalAnswers, timeData: finalTimeData, field, subfield, ageGroup, difficulty },
      });
    }
  }, [currentIndex, questions, answers, timeData, textAnswer, questionStartTime]);

  const handleMCQAnswer = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);
    setTimeout(handleNext, 300);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-foreground">AI is crafting your unique questions...</p>
          <p className="text-sm text-muted-foreground">Tailored to {subfield} in {field}</p>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="flex-1 mx-4 h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <TimerRing timeLeft={timeLeft} timeLimit={q.timeLimit} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-xl p-8 space-y-6"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 bg-secondary rounded-full">{q.type}</span>
              <span className="px-2 py-0.5 bg-secondary rounded-full">{q.maxPoints} pts</span>
            </div>

            <h2 className="text-xl font-semibold text-foreground leading-relaxed">
              {q.question}
            </h2>

            {q.format === "mcq" && q.options ? (
              <div className="space-y-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleMCQAnswer(opt)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      answers[currentIndex] === opt
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-secondary/30 text-foreground hover:border-primary/50 hover:bg-secondary/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={textAnswer}
                  onChange={e => setTextAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  rows={4}
                  className="bg-secondary/30 border-border"
                />
                <Button onClick={handleNext} className="w-full">
                  {currentIndex < questions.length - 1 ? "Next Question" : "Submit Test"}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
