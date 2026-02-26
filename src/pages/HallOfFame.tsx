import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTier, getCountryFlag } from "@/lib/constants";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";
import { motion } from "framer-motion";
import { Crown, Trophy, Medal } from "lucide-react";

export default function HallOfFame() {
  const [topThree, setTopThree] = useState<any[]>([]);

  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch profiles and results
      const { data: profiles } = await supabase.from("profiles").select("user_id, username, country, avatar_url");
      const { data: results } = await supabase.from("test_results").select("*");

      if (!profiles || !results) return;

      const userGroups = new Map();
      profiles.forEach(p => userGroups.set(p.user_id, { profiles: p, results: [] }));
      results.forEach(r => {
        if (userGroups.has(r.user_id)) {
          userGroups.get(r.user_id).results.push(r);
        }
      });

      const averageRankings = Array.from(userGroups.values())
        .map(({ profiles, results }) => {
          const count = results.length;
          const hasPlayed = count > 0;
          return {
            user_id: profiles.user_id,
            username: profiles.username,
            country: profiles.country,
            avatar_url: profiles.avatar_url,
            overall_score: hasPlayed ? Math.round(results.reduce((s, r) => s + r.overall_score, 0) / count) : 0,
            percentile: hasPlayed ? Math.round(results.reduce((s, r) => s + r.percentile, 0) / count) : 0,
            logic: hasPlayed ? Math.round(results.reduce((s, r) => s + r.logic, 0) / count) : 0,
            creativity: hasPlayed ? Math.round(results.reduce((s, r) => s + r.creativity, 0) / count) : 0,
            intuition: hasPlayed ? Math.round(results.reduce((s, r) => s + r.intuition, 0) / count) : 0,
            emotional_intelligence: hasPlayed ? Math.round(results.reduce((s, r) => s + r.emotional_intelligence, 0) / count) : 0,
            systems_thinking: hasPlayed ? Math.round(results.reduce((s, r) => s + r.systems_thinking, 0) / count) : 0,
            field: hasPlayed ? results[0].field : "N/A",
            subfield: hasPlayed ? results[0].subfield : "NONE",
            famous_match: hasPlayed ? results[0].famous_match : "None",
            superpowers: hasPlayed ? results[0].superpowers : [],
            blind_spots: hasPlayed ? results[0].blind_spots : []
          };
        })
        .sort((a, b) => b.overall_score - a.overall_score);

      setTotalPlayers(averageRankings.length);
      setTopThree(averageRankings.slice(0, 3));
    };
    fetchData();
  }, []);

  const getMedalIcon = (i: number) => {
    if (i === 0) return <Crown className="h-10 w-10 text-primary drop-shadow-[0_0_15px_hsl(45_100%_51%/0.6)]" />;
    if (i === 1) return <Medal className="h-8 w-8 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.4)]" />;
    return <Medal className="h-7 w-7 text-amber-700 drop-shadow-[0_0_10px_rgba(180,83,9,0.4)]" />;
  };

  const getMedalLabel = (i: number) => {
    if (i === 0) return "🥇 1st Place";
    if (i === 1) return "🥈 2nd Place";
    return "🥉 3rd Place";
  };

  const getCardScale = (i: number) => {
    if (i === 0) return "scale-105 z-10 p-2 bg-primary/5 rounded-[2.5rem] border border-primary/20";
    return "";
  };

  // Reorder for podium: [2nd, 1st, 3rd]
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
                      rank={realIndex + 1}
                      totalPlayers={totalPlayers}
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
