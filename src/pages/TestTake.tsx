import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Question } from "@/lib/constants";
import { Loader2, Zap, Brain } from "lucide-react";
import Header from "@/components/Header";

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
  const { qualification, difficulty, stream, examType = "mcq", ageGroup } = (location.state as any) || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeData, setTimeData] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [textAnswer, setTextAnswer] = useState("");

  useEffect(() => {
    if (!stream) { navigate("/test/setup"); return; }

    const fetchQuestions = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-questions", {
          body: { qualification: qualification || ageGroup, stream, difficulty, examType },
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
  }, [stream]);

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
        state: {
          questions,
          answers: finalAnswers,
          timeData: finalTimeData,
          stream,
          qualification: qualification || ageGroup,
          difficulty,
          challengeId: location.state?.challengeId
        },
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
          <p className="text-sm text-muted-foreground">Tailored to {stream} in {qualification}</p>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      {/* EXTREME FUTURISTIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#000000]" />

        {/* Continuous Dynamic Atmospheric Glows */}
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], x: [-40, 40, -40], y: [-40, 40, -40] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-yellow-500/5 blur-[220px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], x: [60, -60, 60], y: [60, -60, 60] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-yellow-600/10 blur-[220px] rounded-full"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.04)_0%,transparent_80%)]" />

        {/* High-Contrast Stardust Layer */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
      </div>

      <Header />

      <main className="relative min-h-screen flex items-center justify-center p-4 pt-20 z-10">
        <div className="w-full max-w-2xl">
          {/* Progress Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
                <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" /> Pulse {currentIndex + 1} / {questions.length}
              </span>
              <div className="w-32 h-[1px] bg-gradient-to-r from-yellow-500/30 to-transparent" />
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden sm:block h-1 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-yellow-500 shadow-[0_0_15px_rgba(255,191,0,0.8)]"
                  animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
              <TimerRing timeLeft={timeLeft} timeLimit={q.timeLimit} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.98 }}
              transition={{ duration: 0.4, type: "spring", damping: 20 }}
              className="relative group h-full"
            >
              {/* Card Decoration */}
              <div className="absolute -inset-[1px] bg-gradient-to-br from-yellow-500/30 via-white/5 to-white/5 rounded-3xl blur-[1px] opacity-50" />

              <div className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden min-h-[400px] flex flex-col">
                {/* Internal Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex items-center gap-3 mb-8">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-500 uppercase tracking-widest">{q.type}</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">{q.maxPoints} Neural Points</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-white leading-[1.2] mb-12 italic tracking-tight">
                  {q.question}
                </h2>

                <div className="flex-1">
                  {q.format === "mcq" && q.options ? (
                    <div className="grid grid-cols-1 gap-4">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleMCQAnswer(opt)}
                          className={`group relative text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${answers[currentIndex] === opt
                            ? "border-yellow-500 bg-yellow-500/10 text-white"
                            : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/20 hover:bg-white/[0.05] hover:text-white/80"
                            }`}
                        >
                          {answers[currentIndex] === opt && (
                            <motion.div layoutId="active-opt" className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay" />
                          )}
                          <div className="relative z-10 flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all ${answers[currentIndex] === opt ? "bg-yellow-500 border-yellow-500 text-black" : "border-white/10 group-hover:border-white/30"
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-bold tracking-tight">{opt}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <Textarea
                        value={textAnswer}
                        onChange={e => setTextAnswer(e.target.value)}
                        placeholder="Synthesize neural response..."
                        className="bg-white/5 border-white/10 rounded-2xl focus:border-yellow-500/50 focus:ring-yellow-500/20 min-h-[160px] text-lg font-medium p-6 resize-none"
                      />
                      <button
                        onClick={handleNext}
                        className="w-full py-4 rounded-2xl bg-yellow-500 text-black font-black italic tracking-tighter text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,191,0,0.3)]"
                      >
                        {currentIndex < questions.length - 1 ? "NEXT PULSE" : "EXECUTE SUBMISSION"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 5;
          background: linear-gradient(0deg, rgba(255,191,0,0) 0%, rgba(255,191,0,0.01) 50%, rgba(255,191,0,0) 100%);
          position: absolute;
          bottom: 100%;
          animation: scanline 8s linear infinite;
        }
        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }
      `}</style>
      <div className="scanline pointer-events-none" />
    </div>
  );

}
