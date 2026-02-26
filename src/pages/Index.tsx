import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Zap, ChevronRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier, getCountryFlag } from "@/lib/constants";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalMinds, setTotalMinds] = useState(0);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [userResult, setUserResult] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [averages, setAverages] = useState<any>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

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

      // Fetch user's neural signature (averages)
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
        if (profile) setUserProfile(profile);

        const { data: results } = await supabase.from("test_results").select("*").eq("user_id", user.id);

        if (results && results.length > 0) {
          const count = results.length;
          const avg = {
            percentile: Math.round(results.reduce((s, r) => s + r.percentile, 0) / count),
            overall_score: Math.round(results.reduce((s, r) => s + r.overall_score, 0) / count),
            logic: Math.round(results.reduce((s, r) => s + r.logic, 0) / count),
            creativity: Math.round(results.reduce((s, r) => s + r.creativity, 0) / count),
            intuition: Math.round(results.reduce((s, r) => s + r.intuition, 0) / count),
            emotional_intelligence: Math.round(results.reduce((s, r) => s + r.emotional_intelligence, 0) / count),
            systems_thinking: Math.round(results.reduce((s, r) => s + r.systems_thinking, 0) / count),
            field: results[0].subfield,
          };
          setAverages(avg);
        } else {
          // Initialize with 0s for new users
          setAverages({
            percentile: 0, overall_score: 0, logic: 0, creativity: 0,
            intuition: 0, emotional_intelligence: 0, systems_thinking: 0, field: "UNRANKED"
          });
        }

        // Global Rank calculation based on averages for ALL users
        const { data: allResults } = await supabase.from("test_results").select("user_id, overall_score");
        const { data: allProfiles } = await supabase.from("profiles").select("user_id");

        if (allProfiles) {
          const userGroups = new Map();
          allProfiles.forEach(p => userGroups.set(p.user_id, { sum: 0, count: 0 }));
          (allResults || []).forEach(row => {
            const existing = userGroups.get(row.user_id) || { sum: 0, count: 0 };
            userGroups.set(row.user_id, { sum: existing.sum + row.overall_score, count: existing.count + 1 });
          });
          const allAverages = Array.from(userGroups.values()).map(g => g.count > 0 ? g.sum / g.count : 0).sort((a, b) => b - a);
          setTotalPlayers(allAverages.length);
          const currentScore = (averages?.overall_score || 0);
          const rank = allAverages.findIndex(s => s <= currentScore) + 1;
          setGlobalRank(rank);
        }
      }
    };
    fetchData();
  }, [user]);

  // Build card data - Average Neural Signature or Demo
  const cardData = averages
    ? {
      percentile: averages.percentile,
      scores: {
        logic: averages.logic,
        creativity: averages.creativity,
        intuition: averages.intuition,
        emotionalIntelligence: averages.emotional_intelligence,
        systemsThinking: averages.systems_thinking,
        overallScore: averages.overall_score,
        famousMatch: "Synchronizing...",
        famousMatchReason: "",
        superpowers: [],
        blindSpots: [],
        aiInsight: "",
      },
      username: userProfile?.username || "You",
      avatarUrl: userProfile?.avatar_url,
      field: averages.field,
      rank: globalRank,
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
      totalPlayers: 12500,
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
        {/* CENTRAL NEURAL ARC (High Intensity Lightning) */}
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-[700px] pointer-events-none z-20">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 700">
            <defs>
              <filter id="lightning-glow-heavy">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Primary Fractal Bolts */}
            {[...Array(3)].map((_, i) => (
              <motion.path
                key={i}
                d={`M 50 ${Math.random() * 50} L ${40 + Math.random() * 20} 150 L ${20 + Math.random() * 60} 300 L ${70 + Math.random() * 20} 450 L ${30 + Math.random() * 40} 600 L 50 700`}
                stroke="#FFD700"
                strokeWidth="2"
                fill="none"
                filter="url(#lightning-glow-heavy)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{
                  pathLength: [0, 1],
                  opacity: [0, 1, 0],
                  strokeWidth: [1.5, 3.5, 1.5]
                }}
                transition={{
                  duration: 0.12,
                  repeat: Infinity,
                  repeatDelay: 0.8 + Math.random() * 1.5,
                  delay: i * 0.3
                }}
              />
            ))}

            {/* Sharp Static Discharge */}
            <motion.path
              d="M 50 300 L 20 330 L 80 360 L 50 390"
              stroke="#FFD700" strokeWidth="2" fill="none" filter="url(#lightning-glow-heavy)"
              animate={{ opacity: [0, 1, 0], x: [-10, 10, -10] }}
              transition={{ duration: 0.05, repeat: Infinity, repeatDelay: 1.2 }}
            />
          </svg>
        </div>

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
              <p className="text-lg text-white/40 max-w-lg font-medium leading-relaxed">
                15 neural-generated sequences. Unique every cycle. Scored across 5 cognitive dimensions.
                Find your frequency among the global intelligence grid.
              </p>
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

            {/* Recent feed - Glassmorphism style */}
            <div className="space-y-3 pt-6">
              <AnimatePresence>
                {recentResults.slice(0, 3).map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-[2px] h-full bg-yellow-500/40 transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                    <span className="text-2xl">{getCountryFlag(r.country || "US")}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black uppercase text-[10px] tracking-wider">{r.username || "Anonymous"}</span>
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[8px] font-black uppercase tracking-widest">{getTier(r.percentile).title}</span>
                      </div>
                      <p className="text-white/30 text-[9px] font-bold mt-1 uppercase tracking-tight">Synchronized into {r.percentile}th Neural Percentile</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
              {!userResult && (
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
