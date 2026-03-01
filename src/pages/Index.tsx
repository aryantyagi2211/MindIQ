import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Zap, ChevronRight, TrendingUp, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier, getCountryFlag } from "@/lib/constants";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";
import { useNeuralSignature } from "@/hooks/useNeuralSignature";
import NeuralHistory from "@/components/NeuralHistory";
import GlobalFeed from "@/components/GlobalFeed";
import ChallengeLobby from "@/components/ChallengeLobby";
import BattleArena from "@/components/BattleArena";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalMinds, setTotalMinds] = useState(0);
  const [recentResults, setRecentResults] = useState<any[]>([]);

  const { userSignature, userHistory, totalPlayers, loading: rankingsLoading } = useNeuralSignature(user?.id);

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await supabase.from("test_results").select("*", { count: "exact", head: true });
      setTotalMinds(count || 0);

      const { data } = await supabase
        .from("test_results")
        .select("*, profiles!inner(username, country, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) {
        setRecentResults(data.map((r: any) => ({
          ...r,
          username: r.profiles?.username,
          country: r.profiles?.country,
        })));
      }
    };
    fetchData();
  }, []);

  // Build card data - Global Neural Signature or Demo
  const hasResults = userSignature && userSignature.overall_score > 0;

  const cardData = hasResults
    ? {
      percentile: userSignature.percentile,
      scores: {
        logic: userSignature.logic,
        creativity: userSignature.creativity,
        intuition: userSignature.intuition,
        emotionalIntelligence: userSignature.emotional_intelligence,
        systemsThinking: userSignature.systems_thinking,
        overallScore: userSignature.overall_score,
        famousMatch: userSignature.famous_match || "Determining...",
        famousMatchReason: "",
        superpowers: userSignature.superpowers || [],
        blindSpots: userSignature.blind_spots || [],
        aiInsight: "",
      },
      username: userSignature.username || "You",
      avatarUrl: userSignature.avatar_url,
      field: userSignature.subfield,
      rank: userSignature.rank,
      totalPlayers: totalPlayers,
    }
    : {
      percentile: 98,
      scores: {
        logic: 95,
        creativity: 91,
        intuition: 88,
        emotionalIntelligence: 94,
        systemsThinking: 92,
        overallScore: 93,
        famousMatch: "Nikola Tesla",
        famousMatchReason: "",
        superpowers: [],
        blindSpots: [],
        aiInsight: "",
      },
      username: "Elite Mind Demo",
      avatarUrl: null,
      field: "Quantum Logic",
      rank: 3,
      totalPlayers: totalPlayers || 12500,
    };

  const tier = getTier(cardData.percentile);

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      {/* EXTREME FUTURISTIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#000000]" />

        {/* Continuous Dynamic Atmospheric Glows */}
        <motion.div
          animate={{
            opacity: [0.15, 0.4, 0.15],
            x: [-40, 40, -40],
            y: [-40, 40, -40],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-yellow-500/5 blur-[220px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [60, -60, 60],
            y: [60, -60, 60],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-yellow-600/10 blur-[220px] rounded-full"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.04)_0%,transparent_80%)]" />

        {/* High-Contrast Stardust Layer */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
      </div>

      <Header />

      <main className="relative container pt-24 pb-16 z-10">

        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] relative z-10">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-yellow-500/80 text-[10px] font-black uppercase tracking-[0.3em]">
                <Zap className="h-3 w-3 fill-current animate-pulse" />
                Neural Ranking Active
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1] tracking-tighter uppercase italic text-white">
                Discover Where <span className="text-yellow-500">Your Mind</span> Ranks
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate(user ? "/test/setup" : "/auth")}
                className="group relative px-8 py-5 rounded-2xl bg-yellow-500 text-black text-xl font-black italic tracking-tighter transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] shadow-[0_0_80px_rgba(255,191,0,0.4)]"
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 fill-current" />
                  INITIATE COGNITIVE SCAN
                  <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                </div>
              </button>
            </div>

            <div className="flex items-center gap-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                  <TrendingUp className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white italic tracking-tighter leading-none">
                    {totalMinds.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-yellow-500/60 font-black uppercase tracking-[0.2em] mt-1">Minds Synchronized</p>
                </div>
              </div>

              {recentResults.length > 0 && (
                <div className="flex -space-x-3">
                  {recentResults.slice(0, 5).map((r, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="h-10 w-10 rounded-full bg-[#111] border-2 border-yellow-500/30 flex items-center justify-center text-lg filter drop-shadow-[0_0_10px_rgba(255,191,0,0.2)]"
                    >
                      {getCountryFlag(r.country || "US")}
                    </motion.div>
                  ))}
                  <div className="h-10 w-10 rounded-full bg-yellow-500 text-black border-2 border-yellow-500 flex items-center justify-center text-[10px] font-black">
                    +{Math.max(0, totalMinds - 5)}
                  </div>
                </div>
              )}
            </div>

          </motion.div>

          {/* Right - single result card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
            className="hidden lg:flex flex-col items-center relative"
          >
            <div className="absolute -inset-20 bg-yellow-500/5 blur-[100px] rounded-full animate-pulse" />
            <div className="relative z-10">
              <ResultCard
                percentile={cardData.percentile}
                tier={tier}
                scores={cardData.scores}
                field={cardData.field}
                phase="done"
                username={cardData.username}
                avatarUrl={cardData.avatarUrl}
                rank={cardData.rank}
                totalPlayers={cardData.totalPlayers}
              />
              {!hasResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-8 flex flex-col items-center gap-2"
                >
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] pl-[0.5em]">Future Neural Instance</p>
                  <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── 1v1 Battle Arena ── */}
        <BattleArena />

        {/* ── Live Activity Section ── */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mt-24"
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Live Neural Stream */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <Radio className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                    Live Neural <span className="text-yellow-500">Stream</span>
                  </h2>
                  <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">
                    Real-time test completions worldwide
                  </p>
                </div>
              </div>
              <GlobalFeed />
            </div>

            {/* Open Challenges (simplified) */}
            <div className="space-y-4">
              <ChallengeLobby />
            </div>
          </div>
        </motion.section>
        <AnimatePresence>
          {hasResults && userHistory.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-24 space-y-8"
            >
              <div className="text-center space-y-2 mb-12">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase">Neural <span className="text-yellow-500">Growth</span> History</h2>
                <div className="w-24 h-[1px] bg-yellow-500/20 mx-auto" />
                <p className="text-[10px] text-white/30 uppercase tracking-[0.4em]">Tracking your cognitive evolution across the global grid</p>
              </div>

              <NeuralHistory history={userHistory} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style>{`
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 1;
          background: linear-gradient(0deg, rgba(255,191,0,0) 0%, rgba(255,191,0,0.02) 50%, rgba(255,191,0,0) 100%);
          opacity: 0.1;
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
