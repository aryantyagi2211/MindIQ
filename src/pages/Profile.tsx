import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier } from "@/lib/constants";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [averages, setAverages] = useState<any>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }

    const fetchProfileData = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(p);

      const { data: r } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const userResults = r || [];
      setResults(userResults);

      const hasPlayed = userResults.length > 0;
      const count = hasPlayed ? userResults.length : 1; // Prevent div by 0 for logic but use 0 values

      const avg = {
        percentile: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.percentile, 0) / count) : 0,
        overall_score: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.overall_score, 0) / count) : 0,
        logic: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.logic, 0) / count) : 0,
        creativity: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.creativity, 0) / count) : 0,
        intuition: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.intuition, 0) / count) : 0,
        emotional_intelligence: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.emotional_intelligence, 0) / count) : 0,
        systems_thinking: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.systems_thinking, 0) / count) : 0,
      };
      setAverages(avg);

      const { data: allResults } = await supabase
        .from("test_results")
        .select("user_id, overall_score");

      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id");

      if (allProfiles) {
        const userGroups = new Map();
        // Initialize all users with 0
        allProfiles.forEach(p => userGroups.set(p.user_id, { sum: 0, count: 0 }));

        // Add actual test results
        (allResults || []).forEach(row => {
          const existing = userGroups.get(row.user_id) || { sum: 0, count: 0 };
          userGroups.set(row.user_id, {
            sum: existing.sum + row.overall_score,
            count: existing.count + 1
          });
        });

        const averageScores = Array.from(userGroups.values()).map(g => g.count > 0 ? g.sum / g.count : 0);
        const sortedAverages = averageScores.sort((a, b) => b - a);

        setTotalPlayers(sortedAverages.length);
        const rankIdx = sortedAverages.findIndex(s => s <= avg.overall_score);
        setGlobalRank(rankIdx === -1 ? sortedAverages.length : rankIdx + 1);
      }
    };
    fetchProfileData();
  }, [user]);

  const tier = averages ? getTier(averages.percentile) : getTier(0);
  const isTop5Percent = globalRank && totalPlayers && (globalRank / totalPlayers <= 0.05) && totalPlayers > 10;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-foreground">{profile?.username || "Loading..."}</h1>
            <div className="flex items-center justify-center gap-3">
              <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                {results.length} Tests History
              </span>
              {globalRank && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest">
                  {isTop5Percent ? `Top ${Math.max(0.1, Math.round((globalRank / totalPlayers) * 1000) / 10)}%` : `Rank #${globalRank}`}
                </span>
              )}
            </div>
          </div>

          {averages && (
            <div className={`${tier?.cardClass} rounded-2xl p-8 space-y-6 relative overflow-hidden border border-white/5 shadow-2xl bg-card/40 backdrop-blur-sm`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain className="h-24 w-24 text-primary" />
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Average Performance</p>
                  <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">{tier?.title}</h2>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black text-gradient-gold italic leading-none">{averages.percentile}<span className="text-xl not-italic ml-1">th</span></p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">Global %ile</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-white/5 relative z-10">
                {[
                  { label: "LOGIC", val: averages.logic },
                  { label: "CREA", val: averages.creativity },
                  { label: "INTU", val: averages.intuition },
                  { label: "EQ", val: averages.emotional_intelligence },
                  { label: "SYS", val: averages.systems_thinking }
                ].map(stat => (
                  <div key={stat.label} className="text-center p-2 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[9px] font-bold text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-sm font-black text-foreground">{stat.val}</p>
                  </div>
                ))}
              </div>

              <p className="text-center text-[11px] text-muted-foreground mt-4 italic">
                Averaged across your entire cognitive history to provide a stable mind profile.
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <Button size="lg" onClick={() => navigate("/test/setup")} className="glow-gold">
              <Brain className="mr-2 h-5 w-5" /> Take Another Test
            </Button>
          </div>

          {/* History */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Test History
            </h2>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tests yet</p>
            ) : (
              results.map((r, i) => {
                const tier = getTier(r.percentile);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-foreground">{tier.title}</p>
                      <p className="text-xs text-muted-foreground">{r.field} · {r.subfield} · {r.difficulty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{r.percentile}th</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
