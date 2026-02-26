import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTier, getCountryFlag } from "@/lib/constants";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";
import { motion } from "framer-motion";
import { Crown, Trophy, Medal } from "lucide-react";

export default function HallOfFame() {
  const [topThree, setTopThree] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("test_results")
        .select("*, profiles!inner(username, country, avatar_url)")
        .order("percentile", { ascending: false })
        .order("overall_score", { ascending: false })
        .limit(3);

      setTopThree(
        (data || []).map((r: any) => ({
          ...r,
          username: r.profiles?.username,
          country: r.profiles?.country,
          avatar_url: r.profiles?.avatar_url,
        }))
      );
    };
    fetch();
  }, []);

  const getMedalIcon = (i: number) => {
    if (i === 0) return <Crown className="h-10 w-10 text-primary drop-shadow-[0_0_15px_hsl(45_100%_51%/0.6)]" />;
    if (i === 1) return <Medal className="h-8 w-8 text-muted-foreground" />;
    return <Medal className="h-7 w-7 text-muted-foreground/60" />;
  };

  const getMedalLabel = (i: number) => {
    if (i === 0) return "🥇 1st Place";
    if (i === 1) return "🥈 2nd Place";
    return "🥉 3rd Place";
  };

  const getCardScale = (i: number) => {
    if (i === 0) return "scale-105";
    return "";
  };

  // Reorder: show 2nd, 1st, 3rd for podium effect
  const podiumOrder = topThree.length === 3 ? [topThree[1], topThree[0], topThree[2]] : topThree;
  const podiumIndexMap = topThree.length === 3 ? [1, 0, 2] : topThree.map((_, i) => i);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <Crown className="h-14 w-14 text-primary mx-auto drop-shadow-[0_0_25px_hsl(45_100%_51%/0.6)]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold">Hall of Fame</h1>
            <p className="text-muted-foreground text-lg">
              The top <span className="text-primary font-bold">3</span> minds on the global leaderboard
            </p>
          </div>

          {topThree.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No results yet. Take a test to claim the throne!</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8">
              {podiumOrder.map((m, idx) => {
                const realIndex = podiumIndexMap[idx];
                const tier = getTier(m.percentile);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + realIndex * 0.2, type: "spring" }}
                    className={`flex flex-col items-center gap-4 ${getCardScale(realIndex)}`}
                  >
                    {/* Medal badge */}
                    <div className="flex flex-col items-center gap-1">
                      {getMedalIcon(realIndex)}
                      <span className="text-sm font-bold text-foreground">{getMedalLabel(realIndex)}</span>
                      <span className="text-xs text-muted-foreground">
                        {getCountryFlag(m.country || "US")} {m.username || "Anonymous"}
                      </span>
                    </div>

                    {/* Result Card */}
                    <ResultCard
                      percentile={m.percentile}
                      tier={tier}
                      scores={{
                        logic: m.logic,
                        creativity: m.creativity,
                        intuition: m.intuition,
                        emotionalIntelligence: m.emotional_intelligence,
                        systemsThinking: m.systems_thinking,
                        overallScore: m.overall_score,
                        famousMatch: m.famous_match || "Unknown",
                        famousMatchReason: m.famous_match_reason || "",
                        superpowers: m.superpowers || [],
                        blindSpots: m.blind_spots || [],
                      }}
                      field={`${m.field} · ${m.subfield}`}
                      phase="done"
                      username={m.username}
                      avatarUrl={m.avatar_url}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
