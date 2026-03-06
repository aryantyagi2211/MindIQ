import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Question } from "@/lib/constants";
import { Loader2, Zap, Brain, Users } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const state = location.state as { 
    qualification?: string; 
    difficulty?: string; 
    stream?: string; 
    examType?: string; 
    ageGroup?: string;
    challengeId?: string;
    lobbyId?: string;
    isLobbyTest?: boolean;
  } | null;
  
  const { qualification, difficulty, stream, examType = "mcq", ageGroup, challengeId, lobbyId, isLobbyTest } = state || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeData, setTimeData] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [waitingForTest, setWaitingForTest] = useState(false);


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (isLobbyTest && lobbyId) {
          // Lobby mode: Check if user is host
          const { data: lobby } = await supabase
            .from("lobbies")
            .select("host_id, questions, status")
            .eq("id", lobbyId)
            .single() as any;

          if (!lobby) throw new Error("Lobby not found");

          const userIsHost = lobby.host_id === user?.id;
          setIsHost(userIsHost);

          if (userIsHost) {
            // Host generates questions
            const { data, error } = await supabase.functions.invoke("generate-questions", {
              body: { qualification: qualification || ageGroup, stream, difficulty, examType },
            });
            if (error) throw error;
            if (data.error) throw new Error(data.error);

            // Save questions to lobby
            await supabase
              .from("lobbies")
              .update({
                questions: data.questions,
                status: "in_progress",
                test_started_at: new Date().toISOString()
              } as any)
              .eq("id", lobbyId);

            setQuestions(data.questions);
            setAnswers(new Array(data.questions.length).fill(""));
            setTimeData(new Array(data.questions.length).fill(0));
            setTimeLeft(data.questions[0].timeLimit);
            setQuestionStartTime(Date.now());
          } else {
            // Member waits for questions
            if (lobby.questions && lobby.status === "in_progress") {
              // Questions already available
              setQuestions(lobby.questions);
              setAnswers(new Array(lobby.questions.length).fill(""));
              setTimeData(new Array(lobby.questions.length).fill(0));
              setTimeLeft(lobby.questions[0].timeLimit);
              setQuestionStartTime(Date.now());
            } else {
              // Wait for host to generate questions
              setWaitingForTest(true);
              
              // Subscribe to lobby changes
              const channel = supabase
                .channel(`lobby-test-${lobbyId}`)
                .on(
                  "postgres_changes",
                  { event: "UPDATE", schema: "public", table: "lobbies", filter: `id=eq.${lobbyId}` },
                  (payload: any) => {
                    if (payload.new.questions && payload.new.status === "in_progress") {
                      setQuestions(payload.new.questions);
                      setAnswers(new Array(payload.new.questions.length).fill(""));
                      setTimeData(new Array(payload.new.questions.length).fill(0));
                      setTimeLeft(payload.new.questions[0].timeLimit);
                      setQuestionStartTime(Date.now());
                      setWaitingForTest(false);
                      supabase.removeChannel(channel);
                    }
                  }
                )
                .subscribe();

              return () => { supabase.removeChannel(channel); };
            }
          }
        } else {
          // Solo mode: Generate questions normally
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
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Unknown error";
        toast.error("Failed to generate questions: " + errorMessage);
        navigate(isLobbyTest ? "/lobby" : "/test/setup");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [qualification, ageGroup, stream, difficulty, examType, navigate, isLobbyTest, lobbyId, user]);

  const handleNext = useCallback(async () => {
    if (questions.length === 0) return;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    const newTimeData = [...timeData];
    newTimeData[currentIndex] = timeTaken;
    setTimeData(newTimeData);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(questions[currentIndex + 1].timeLimit);
      setQuestionStartTime(Date.now());
    } else {
      // Submit
      const finalTimeData = newTimeData;
      const finalAnswers = [...answers];

      if (isLobbyTest && lobbyId && user) {
        // Lobby mode: Save to lobby_test_results and navigate to lobby results
        try {
          // Save answers and time data
          const { data: existingResult } = await supabase
            .from("lobby_test_results" as any)
            .select("id")
            .eq("lobby_id", lobbyId)
            .eq("user_id", user.id)
            .single() as any;

          if (existingResult) {
            // Update existing
            await supabase
              .from("lobby_test_results" as any)
              .update({
                answers: finalAnswers,
                time_data: finalTimeData
              } as any)
              .eq("id", existingResult.id);
          } else {
            // Insert new
            await supabase
              .from("lobby_test_results" as any)
              .insert({
                lobby_id: lobbyId,
                user_id: user.id,
                answers: finalAnswers,
                time_data: finalTimeData
              } as any);
          }

          // Navigate to lobby results page
          navigate(`/lobby/results/${lobbyId}`, {
            state: {
              questions,
              answers: finalAnswers,
              timeData: finalTimeData,
              stream,
              qualification: qualification || ageGroup,
              difficulty
            }
          });
        } catch (error) {
          console.error("Error saving lobby test results:", error);
          toast.error("Failed to save results");
        }
      } else {
        // Solo mode: Navigate to regular results
        navigate("/test/result", {
          state: {
            questions,
            answers: finalAnswers,
            timeData: finalTimeData,
            stream,
            qualification: qualification || ageGroup,
            difficulty,
            challengeId: challengeId
          },
        });
      }
    }
  }, [currentIndex, questions, answers, timeData, questionStartTime, navigate, stream, qualification, ageGroup, difficulty, challengeId, isLobbyTest, lobbyId, user]);

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
  }, [loading, questions.length, handleNext]);

  const handleMCQAnswer = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = option;
    setAnswers(newAnswers);
    setTimeout(handleNext, 300);
  };

  if (loading || waitingForTest) {
    return (
      <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden flex items-center justify-center">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#000000]" />
          <motion.div
            animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full"
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="relative z-10 text-center space-y-8 max-w-2xl px-4"
        >
          {/* Animated Brain Icon */}
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-block"
          >
            <div className="absolute inset-0 bg-yellow-500/40 blur-3xl rounded-full animate-pulse" />
            <Brain className="h-20 w-20 text-yellow-500 relative z-10 drop-shadow-[0_0_30px_rgba(255,191,0,0.9)]" />
          </motion.div>

          {/* Main Message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-white">
              {waitingForTest ? "Waiting for Host to Start..." : "AI is Compiling Your Paper..."}
            </h2>
            {isLobbyTest && (
              <div className="flex items-center justify-center gap-2 text-yellow-500/80 text-sm font-bold uppercase tracking-[0.3em]">
                <Users className="h-4 w-4" />
                <span>Lobby Test</span>
              </div>
            )}
            <p className="text-yellow-500/80 text-sm md:text-base font-bold uppercase tracking-[0.3em]">
              {stream || "All Subjects"} • {qualification}
            </p>
            <p className="text-white/40 text-xs md:text-sm font-medium">
              Difficulty: {difficulty} • 15 Unique Questions
            </p>
          </div>

          {/* Progress Animation */}
          {!waitingForTest && (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-yellow-500 rounded-full"
                  />
                ))}
              </div>
              
              {/* Simulated Progress Bar */}
              <div className="w-full max-w-md mx-auto h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-[0_0_15px_rgba(255,191,0,0.8)]"
                />
              </div>
            </div>
          )}

          {/* Status Messages */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/30 text-xs font-black uppercase tracking-[0.5em]"
          >
            {waitingForTest ? "Standby Mode Active" : "Neural Network Active"}
          </motion.div>
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

      <main className="relative h-screen flex flex-col pt-20 pb-4 px-4 z-10 overflow-hidden">
        {/* Top Progress Bar */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0 max-w-[70%] mx-auto w-full">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
              <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" /> Pulse {currentIndex + 1} / {questions.length}
            </span>
            <div className="hidden sm:flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-500 uppercase tracking-widest">{q.type}</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">{q.maxPoints} pts</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block h-1 w-32 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-yellow-500 shadow-[0_0_15px_rgba(255,191,0,0.8)]"
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <TimerRing timeLeft={timeLeft} timeLimit={q.timeLimit} />
          </div>
        </div>

        {/* Split Layout - 70% Width Container */}
        <div className="flex-1 flex justify-center min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35, type: "spring", damping: 22 }}
              className="w-[70%] grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-hidden"
            >
            {/* LEFT: Scenario + Question */}
            <div className="relative flex flex-col min-h-0">
              <div className="absolute -inset-[1px] bg-gradient-to-br from-yellow-500/20 via-white/5 to-transparent rounded-3xl blur-[1px] opacity-40" />
              <div className="relative bg-black/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto flex-1 flex flex-col">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                {q.scenario && (
                  <div className="mb-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1 h-1 bg-yellow-500/60 rounded-full" />
                      <span className="text-[8px] font-black text-yellow-500/60 uppercase tracking-[0.4em]">Scenario</span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed font-medium">
                      {q.scenario}
                    </p>
                  </div>
                )}

                <h2 className="text-lg md:text-xl font-black text-white leading-[1.4] tracking-tight">
                  {q.question}
                </h2>
              </div>
            </div>

            {/* RIGHT: Options */}
            <div className="relative flex flex-col min-h-0">
              <div className="absolute -inset-[1px] bg-gradient-to-bl from-yellow-500/10 via-white/5 to-transparent rounded-3xl blur-[1px] opacity-30" />
              <div className="relative bg-black/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl overflow-y-auto flex-1 flex flex-col justify-center">
                {(!q.options || q.options.length === 0) ? (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-white/40 text-sm italic">Question format error — click Skip.</p>
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-bold text-sm hover:bg-white/10 transition-all"
                    >
                      Skip →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleMCQAnswer(opt)}
                        className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${answers[currentIndex] === opt
                          ? "border-yellow-500 bg-yellow-500/10 text-white"
                          : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/20 hover:bg-white/[0.05] hover:text-white/80"
                          }`}
                      >
                        {answers[currentIndex] === opt && (
                          <motion.div layoutId="active-opt" className="absolute inset-0 bg-yellow-500/5 mix-blend-overlay" />
                        )}
                        <div className="relative z-10 flex items-center gap-4">
                          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[11px] font-black transition-all ${answers[currentIndex] === opt ? "bg-yellow-500 border-yellow-500 text-black" : "border-white/10 group-hover:border-white/30"
                            }`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="font-bold tracking-tight text-sm">{opt}</span>
                        </div>
                      </button>
                    ))}
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
