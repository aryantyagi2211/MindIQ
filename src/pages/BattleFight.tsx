import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Swords, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  timeLimit: number;
  type: string;
}

export default function BattleFight() {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!battleId) return;
    const fetchBattle = async () => {
      const { data } = await supabase
        .from("battles")
        .select("*")
        .eq("id", battleId)
        .single();

      if (!data || !data.questions) {
        toast.error("Battle not ready");
        navigate("/");
        return;
      }

      setBattle(data);
      const qs = (data.questions as any[]) || [];
      setQuestions(qs);
      if (qs.length > 0) setTimeLeft(qs[0].timeLimit || 30);
    };
    fetchBattle();
  }, [battleId]);

  // Timer
  useEffect(() => {
    if (finished || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQ, finished, questions.length]);

  const handleNext = (answer: string) => {
    clearInterval(timerRef.current);
    const newAnswers = [...answers, answer || ""];

    if (currentQ >= questions.length - 1) {
      setAnswers(newAnswers);
      setFinished(true);
      submitAnswers(newAnswers);
    } else {
      setAnswers(newAnswers);
      setSelectedAnswer(null);
      setCurrentQ((prev) => prev + 1);
      setTimeLeft(questions[currentQ + 1]?.timeLimit || 30);
    }
  };

  const handleSelect = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    setTimeout(() => handleNext(option), 600);
  };

  const submitAnswers = async (finalAnswers: string[]) => {
    if (!battle || !user || submitting) return;
    setSubmitting(true);

    const isPlayer1 = battle.player1_id === user.id;

    // Score answers
    let score = 0;
    questions.forEach((q, i) => {
      const userAns = finalAnswers[i] || "";
      if (q.correctAnswer && userAns.startsWith(q.correctAnswer.charAt(0))) {
        score += 1;
      }
    });

    const scorePercent = Math.round((score / questions.length) * 100);

    const updateData: any = {};
    if (isPlayer1) {
      updateData.player1_answers = finalAnswers;
      updateData.player1_score = scorePercent;
    } else {
      updateData.player2_answers = finalAnswers;
      updateData.player2_score = scorePercent;
    }

    await supabase
      .from("battles")
      .update(updateData)
      .eq("id", battle.id);

    // Check if both players are done
    const { data: updated } = await supabase
      .from("battles")
      .select("*")
      .eq("id", battle.id)
      .single();

    if (updated) {
      const p1Done = (updated.player1_answers as any[])?.length > 0;
      const p2Done = (updated.player2_answers as any[])?.length > 0;

      if (p1Done && p2Done) {
        // Determine winner
        let winnerId = null;
        if (updated.player1_score > updated.player2_score) winnerId = updated.player1_id;
        else if (updated.player2_score > updated.player1_score) winnerId = updated.player2_id;

        await supabase
          .from("battles")
          .update({ status: "completed", winner_id: winnerId })
          .eq("id", battle.id);
      }
    }

    navigate(`/battle/${battle.id}/result`);
  };

  const question = questions[currentQ];

  if (!question) {
    return (
      <div className="min-h-screen bg-[#010101] text-white flex items-center justify-center">
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          <p className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.5em]">Loading Arena...</p>
        </motion.div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[#010101] text-white flex flex-col items-center justify-center gap-6">
        <Header />
        <CheckCircle2 className="h-16 w-16 text-yellow-500" />
        <p className="text-xl font-black italic tracking-tighter uppercase">Battle Complete</p>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.5em]">Waiting for opponent to finish...</p>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </motion.div>
      </div>
    );
  }

  const timerColor = timeLeft <= 5 ? "text-red-500" : timeLeft <= 10 ? "text-yellow-500" : "text-white/60";

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#000000]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
      </div>

      <Header />

      <main className="relative container pt-24 pb-16 z-10 max-w-3xl">
        {/* Progress bar */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-red-500" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Question {currentQ + 1} / {questions.length}
              </span>
            </div>
            <div className={`flex items-center gap-2 ${timerColor}`}>
              <Clock className="h-4 w-4" />
              <span className="text-xl font-black italic tracking-tighter">{timeLeft}s</span>
            </div>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="space-y-8"
          >
            <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-8">
              <p className="text-[9px] font-black text-yellow-500/40 uppercase tracking-[0.3em] mb-3">
                {question.type || "Cognitive Challenge"}
              </p>
              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {question.question}
              </h2>
            </div>

            {/* Options */}
            <div className="grid gap-3">
              {(question.options || []).map((option, i) => {
                const isSelected = selectedAnswer === option;
                const letter = String.fromCharCode(65 + i);
                return (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleSelect(option)}
                    disabled={!!selectedAnswer}
                    className={`group relative w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? "border-yellow-500 bg-yellow-500/10 shadow-[0_0_30px_rgba(255,191,0,0.15)]"
                        : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black ${
                        isSelected ? "bg-yellow-500 text-black" : "bg-white/5 text-white/30"
                      }`}>
                        {letter}
                      </div>
                      <span className={`font-medium ${isSelected ? "text-yellow-400" : "text-white/70"}`}>
                        {option.replace(/^[A-D]\)\s*/, "")}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
