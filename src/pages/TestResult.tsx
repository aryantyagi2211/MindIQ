import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier, getCountryFlag } from "@/lib/constants";
import { toast } from "sonner";
import ResultCard from "@/components/ResultCard";
import { Button } from "@/components/ui/button";
import { Share2, Download, Swords, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";

export default function TestResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { questions, answers, timeData, field, subfield, ageGroup, difficulty } = (location.state as any) || {};

  const [scores, setScores] = useState<any>(null);
  const [percentile, setPercentile] = useState(0);
  const [displayPercentile, setDisplayPercentile] = useState(0);
  const [phase, setPhase] = useState<"black" | "text" | "reveal" | "done">("black");
  const [resultId, setResultId] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!questions) { navigate("/"); return; }
    scoreAndSave();
  }, []);

  const scoreAndSave = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("score-answers", {
        body: { questions, answers, timeData, field, subfield },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const s = data.scores;
      setScores(s);

      // Calculate percentile from DB
      const { count: totalCount } = await supabase.from("test_results").select("*", { count: "exact", head: true });
      const { count: lowerCount } = await supabase.from("test_results").select("*", { count: "exact", head: true }).lt("overall_score", s.overallScore);
      
      const total = (totalCount || 0) + 1;
      const lower = lowerCount || 0;
      const pct = Math.min(99, Math.max(1, Math.round((lower / total) * 100)));
      setPercentile(pct);

      const tier = getTier(pct);

      // Save to DB
      if (user) {
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
          superpowers: s.superpowers,
          blind_spots: s.blindSpots,
        }).select().single();

        if (insertData) setResultId(insertData.id);
      }

      // Start cinematic reveal
      startReveal(pct);
    } catch (e: any) {
      toast.error("Scoring failed: " + e.message);
    }
  };

  const startReveal = (pct: number) => {
    setTimeout(() => setPhase("text"), 1000);
    setTimeout(() => setPhase("reveal"), 3500);
    setTimeout(() => {
      // Count up percentile
      let current = 0;
      const target = pct;
      const interval = setInterval(() => {
        current += 1;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
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

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `mindiq-result-${percentile}th.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast.error("Failed to download card");
    }
  };

  const handleChallenge = async () => {
    if (!user || !resultId) {
      toast.error("You must be logged in");
      return;
    }
    const { data, error } = await supabase.from("challenges").insert({
      challenger_id: user.id,
      challenger_result_id: resultId,
    }).select().single();

    if (error) { toast.error("Failed to create challenge"); return; }
    const url = `${window.location.origin}/challenge/${data.challenge_code}`;
    navigator.clipboard.writeText(url);
    toast.success("Challenge link copied to clipboard!");
  };

  // Cinematic phases
  if (phase === "black" || phase === "text") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatePresence>
          {phase === "black" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-8">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        ref={cardRef}
      >
        <ResultCard
          percentile={phase === "done" ? displayPercentile : 0}
          tier={tier}
          scores={scores}
          field={subfield}
          phase={phase}
        />
      </motion.div>

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" /> Share to Twitter
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download Card
          </Button>
          <Button onClick={handleChallenge}>
            <Swords className="mr-2 h-4 w-4" /> Challenge a Friend
          </Button>
          <Button variant="ghost" onClick={() => navigate("/leaderboard")}>
            View Leaderboard
          </Button>
        </motion.div>
      )}
    </div>
  );
}
