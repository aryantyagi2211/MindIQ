import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier } from "@/lib/constants";
import { toast } from "sonner";
import ResultCard from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Share2, Download, Swords, Loader2, BarChart3, Brain } from "lucide-react";
import { toPng } from "html-to-image";
import Header from "@/components/Header";

export default function TestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { questions, answers, timeData, field, subfield, ageGroup, difficulty } = (location.state as any) || {};

  const [scores, setScores] = useState<any>(null);
  const [percentile, setPercentile] = useState(0);
  const [displayPercentile, setDisplayPercentile] = useState(0);
  const [rank, setRank] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [phase, setPhase] = useState<"black" | "text" | "reveal" | "done">("black");
  const [resultId, setResultId] = useState<string | null>(null);
  const [username, setUsername] = useState("You");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Calculate stats from answers
  const totalQuestions = questions?.length || 15;
  const attempted = answers ? Object.keys(answers).length : 0;
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!questions) { navigate("/"); return; }

    // Fetch profile
    if (user) {
      supabase.from("profiles").select("username, avatar_url").eq("user_id", user.id).single()
        .then(({ data }) => {
          if (data) {
            setUsername(data.username);
            setAvatarUrl(data.avatar_url);
          }
        });
    }

    scoreAndSave();
  }, []);

  // Count how many test attempts user has
  const [attemptCount, setAttemptCount] = useState(1);

  const scoreAndSave = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("score-answers", {
        body: { questions, answers, timeData, field, subfield },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const s = data.scores;
      setScores(s);
      if (typeof data.correctCount === "number") setCorrectCount(data.correctCount);

      const { count: totalCount } = await supabase.from("test_results").select("*", { count: "exact", head: true });
      const { count: higherCount } = await supabase.from("test_results").select("*", { count: "exact", head: true }).gt("overall_score", s.overallScore);

      const total = (totalCount || 0) + 1;
      const rankPos = (higherCount || 0) + 1;
      const lower = total - rankPos;

      setTotalPlayers(total);
      setRank(rankPos);

      const pct = Math.min(99, Math.max(1, Math.round((lower / total) * 100)));
      setPercentile(pct);

      const tier = getTier(pct);

      if (user) {
        // Count previous attempts
        const { count: prevCount } = await supabase.from("test_results").select("*", { count: "exact", head: true }).eq("user_id", user.id);
        setAttemptCount((prevCount || 0) + 1);

        const { data: insertData } = await supabase.from("test_results").insert({
          user_id: user.id,
          age_group: ageGroup,
          difficulty,
          field,
          subfield,
          logic: s.logic,
          creativity: s.creativity,
          intuition: s.intuition,
          emotional_intelligence: s.emotionalIntelligence,
          systems_thinking: s.systemsThinking,
          overall_score: s.overallScore,
          percentile: pct,
          tier: tier.tier,
          tier_title: tier.title,
          ai_insight: s.aiInsight,
          famous_match: s.famousMatch,
          famous_match_reason: s.famousMatchReason,
          archetype_report: s.archetype_report,
          superpowers: s.superpowers,
          blind_spots: s.blindSpots,
        }).select().single();

        if (insertData) setResultId(insertData.id);
      }

      startReveal(pct);
    } catch (e: any) {
      toast.error("Scoring failed: " + e.message);
    }
  };

  const startReveal = (pct: number) => {
    setTimeout(() => setPhase("text"), 1000);
    setTimeout(() => setPhase("reveal"), 3500);
    setTimeout(() => {
      let current = 0;
      const target = pct;
      const interval = setInterval(() => {
        current += 1;
        if (current >= target) { current = target; clearInterval(interval); }
        setDisplayPercentile(current);
      }, 20);
      setPhase("done");
    }, 4500);
  };

  const handleShare = () => {
    const tier = getTier(percentile);
    const text = `I ranked in the ${percentile}th percentile on MindIQ. My mind class is ${tier.title}. Can you beat me? → mindiq.ai`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };

  const exportRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!exportRef.current) return;
    try {
      // Temporarily show the export container for capture
      exportRef.current.style.display = "block";
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: '#000000',
        width: 1080,
        height: 1080,
      });
      exportRef.current.style.display = "none";

      const link = document.createElement("a");
      link.download = `mindiq-signature-${percentile}th.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Signature exported in 1080p High Fidelity");
    } catch {
      toast.error("Failed to download card");
    }
  };

  const handleChallenge = async () => {
    if (!user || !resultId) { toast.error("You must be logged in"); return; }
    const { data, error } = await supabase.from("challenges").insert({
      challenger_id: user.id,
      challenger_result_id: resultId,
    }).select().single();

    if (error) { toast.error("Failed to create challenge"); return; }
    const url = `${window.location.origin}/challenge/${data.challenge_code}`;
    navigator.clipboard.writeText(url);
    toast.success("Challenge link copied to clipboard!");
  };

  if (phase === "black" || phase === "text") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatePresence>
          {phase === "black" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground mt-4">Analyzing your cognitive signature...</p>
            </motion.div>
          )}
          {phase === "text" && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-2xl md:text-4xl font-bold text-foreground text-center"
            >
              Your mind has been ranked.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!scores) return null;

  const tier = getTier(percentile);

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

      {/* HIDDEN PREMIUM EXPORT CONTAINER (1080x1080) */}
      <div
        ref={exportRef}
        style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1080px', height: '1080px', backgroundColor: '#000', display: 'none' }}
        className="p-[100px] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />

        {/* Border Glows */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-12 flex flex-col items-center gap-2">
            <h4 className="text-[12px] font-black text-yellow-500/40 uppercase tracking-[1em] mb-2">Authenticated Neural Signature</h4>
            <div className="h-[1px] w-48 bg-yellow-500/20" />
          </div>

          <ResultCard
            percentile={displayPercentile}
            tier={tier}
            scores={scores}
            field={subfield}
            phase="done"
            username={username}
            avatarUrl={avatarUrl}
            rank={rank}
            totalPlayers={totalPlayers}
            stats={{
              totalQuestions,
              attempted,
              correct: correctCount,
              attempts: attemptCount,
            }}
          />

          <div className="mt-12 flex flex-col items-center gap-3">
            <div className="h-[1px] w-24 bg-yellow-500/20" />
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">MINDIQ.AI // GRID SEQUENCE #{resultId?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      <main className="relative min-h-screen flex flex-col items-center justify-center p-4 pt-20 z-10 gap-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 1.2, bounce: 0.4 }}
          ref={cardRef}
          className="relative"
        >
          {/* Neural Discharge Effect Around Card */}
          <div className="absolute -inset-20 bg-yellow-500/5 blur-[100px] rounded-full animate-pulse pointer-events-none" />

          <ResultCard
            percentile={phase === "done" ? displayPercentile : 0}
            tier={tier}
            scores={scores}
            field={subfield}
            phase={phase}
            username={username}
            avatarUrl={avatarUrl}
            rank={rank}
            totalPlayers={totalPlayers}
            stats={{
              totalQuestions,
              attempted,
              correct: correctCount,
              attempts: attemptCount,
            }}
          />
        </motion.div>

        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center items-center"
          >
            <div className="flex gap-2 p-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="hover:bg-yellow-500/20 hover:text-yellow-500 transition-all rounded-xl"
                title="Share to Global Grid"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="hover:bg-yellow-500/20 hover:text-yellow-500 transition-all rounded-xl"
                title="Download Neural Signature"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>

            <Button
              onClick={handleChallenge}
              className="bg-yellow-500 text-black font-black italic px-8 py-6 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,191,0,0.4)]"
            >
              <Swords className="h-5 w-5 mr-3" />
              CHALLENGE RIVAL MIND
            </Button>

            <Button
              variant="ghost"
              onClick={() => navigate("/leaderboard")}
              className="text-white/40 hover:text-white hover:bg-white/5 font-black uppercase text-[10px] tracking-[0.3em] px-6"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Grid Standings
            </Button>
          </motion.div>
        )}

        {/* Archetype Deep Report */}
        <AnimatePresence>
          {phase === "done" && scores.archetype_report && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1 }}
              className="w-full max-w-2xl mt-8 space-y-6"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
                <h3 className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.5em] whitespace-nowrap">Cognitive Deep Dive</h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent" />
              </div>

              <div className="rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {scores.archetype_report.split('\n').map((para: string, i: number) => para.trim() && (
                  <p key={i} className="text-white/60 text-sm md:text-base leading-relaxed font-medium tracking-wide first-letter:text-2xl first-letter:font-black first-letter:text-yellow-500 first-letter:mr-1">
                    {para}
                  </p>
                ))}

                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-yellow-500" />
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Neural Analyst Synthesis v2.0</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[8px] font-black text-yellow-500 uppercase tracking-[0.3em]">
                    Verified Insight
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 5;
          background: linear-gradient(0deg, rgba(255,191,0,0) 0%, rgba(255,191,0,0.01) 50%, rgba(255,191,0,0) 100%);
          position: absolute;
          bottom: 100%;
          animation: scanline 10s linear infinite;
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
