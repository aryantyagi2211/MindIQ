import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier, getCountryFlag, FIELDS, SCHOOL_FIELDS } from "@/lib/constants";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, X, Eye, Users, Crown, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "all" | "week" | "today";
type DisplayMode = "percentile" | "score";

export default function Leaderboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [tab, setTab] = useState<TabType>("all");
  const [fieldFilter, setFieldFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("percentile");

  // Listen for header score mode toggle
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.showAsScore) setDisplayMode("score");
      else setDisplayMode("percentile");
    };
    window.addEventListener("mindiq-score-mode", handler);
    return () => window.removeEventListener("mindiq-score-mode", handler);
  }, []);

  useEffect(() => {
    fetchResults();
  }, [tab, fieldFilter]);

  const fetchResults = async () => {
    setLoading(true);

    // Fetch ALL profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, country, avatar_url");

    if (!profiles) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Fetch test results based on filters
    let query = supabase
      .from("test_results")
      .select("*");

    if (tab === "week") {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", weekAgo);
    } else if (tab === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.gte("created_at", today.toISOString());
    }

    if (fieldFilter) {
      query = query.eq("field", fieldFilter);
    }

    const { data: allResults } = await query;

    // Group results by user
    const resultsByUser = new Map<string, any[]>();
    (allResults || []).forEach(r => {
      const existing = resultsByUser.get(r.user_id) || [];
      resultsByUser.set(r.user_id, [...existing, r]);
    });

    // Merge profiles with their average results
    const leaderboardData = profiles.map(p => {
      const userTests = resultsByUser.get(p.user_id) || [];
      const hasPlayed = userTests.length > 0;
      const count = userTests.length;

      return {
        user_id: p.user_id,
        username: p.username,
        country: p.country,
        avatar_url: p.avatar_url,
        overall_score: hasPlayed ? Math.round(userTests.reduce((s, r) => s + r.overall_score, 0) / count) : 0,
        percentile: hasPlayed ? Math.round(userTests.reduce((s, r) => s + r.percentile, 0) / count) : 0,
        logic: hasPlayed ? Math.round(userTests.reduce((s, r) => s + r.logic, 0) / count) : 0,
        creativity: hasPlayed ? Math.round(userTests.reduce((s, r) => s + r.creativity, 0) / count) : 0,
        intuition: hasPlayed ? Math.round(userTests.reduce((s, r) => s + r.intuition, 0) / count) : 0,
        emotional_intelligence: hasPlayed ? Math.round(userTests.reduce((s, r) => s + r.emotional_intelligence, 0) / count) : 0,
        systems_thinking: hasPlayed ? Math.round(userTests.reduce((s, r) => s + r.systems_thinking, 0) / count) : 0,
        field: hasPlayed ? userTests[0].field : "N/A",
        tests_count: count
      };
    });

    const sorted = leaderboardData.sort((a, b) => b.overall_score - a.overall_score);
    setResults(sorted);
    setLoading(false);
  };

  const getRankBadge = (i: number, total: number) => {
    const rank = i + 1;
    const isTop5Percent = (rank / (total || 1)) <= 0.05;

    if (isTop5Percent && total > 10) {
      const topPct = Math.max(0.1, Math.round((rank / total) * 1000) / 10);
      return (
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full ${i === 0 ? "bg-primary/20 border-primary/40" : "bg-primary/10 border-primary/20"} border flex items-center justify-center`}>
            {i === 0 ? <Crown className="h-4 w-4 text-primary" /> : <Trophy className="h-3 w-3 text-primary/80" />}
          </div>
          <span className="text-[9px] font-bold text-primary mt-1 whitespace-nowrap">Top {topPct}%</span>
        </div>
      );
    }

    if (i === 0) return (
      <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
        <Crown className="h-4 w-4 text-primary" />
      </div>
    );
    if (i === 1) return (
      <div className="w-8 h-8 rounded-full bg-muted-foreground/10 border border-muted-foreground/30 flex items-center justify-center">
        <Medal className="h-4 w-4 text-muted-foreground" />
      </div>
    );
    if (i === 2) return (
      <div className="w-8 h-8 rounded-full bg-muted-foreground/5 border border-border flex items-center justify-center">
        <Medal className="h-4 w-4 text-muted-foreground/60" />
      </div>
    );
    return (
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
        <span className="text-xs font-bold text-muted-foreground">#{rank}</span>
      </div>
    );
  };

  const getRowGlow = (i: number, total: number) => {
    const rank = i + 1;
    const isTop5Percent = (rank / (total || 1)) <= 0.05 && total > 10;

    if (isTop5Percent) return "bg-primary/[0.04] border-l-2 border-l-primary/60";
    if (i === 0) return "bg-primary/5 border-l-2 border-l-primary";
    if (i === 1) return "bg-muted-foreground/5 border-l-2 border-l-muted-foreground/40";
    if (i === 2) return "bg-muted-foreground/[0.03] border-l-2 border-l-muted-foreground/20";
    return "border-l-2 border-l-transparent";
  };

  // Stats
  const totalPlayers = results.length;
  const avgPercentile = totalPlayers > 0 ? Math.round(results.reduce((s, r) => s + r.percentile, 0) / totalPlayers) : 0;
  const topTier = results.length > 0 ? getTier(results[0]?.percentile) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}>
              <Trophy className="h-14 w-14 text-primary mx-auto drop-shadow-[0_0_25px_hsl(45_100%_51%/0.5)]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-gold">Global Ranking</h1>
            <p className="text-muted-foreground text-lg">Every player ranked by their average cognitive performance across all tests</p>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4"
          >
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">{totalPlayers}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Players</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-foreground">
                {displayMode === "percentile" ? <>{avgPercentile}<span className="text-sm text-muted-foreground">th</span></> : Math.round(results.reduce((s, r) => s + r.overall_score, 0) / (totalPlayers || 1))}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{displayMode === "percentile" ? "Avg Percentile" : "Avg Score"}</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 text-center">
              <Crown className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-gradient-gold truncate">{topTier?.title || "—"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">#1 Rank Tier</p>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            {(["all", "week", "today"] as TabType[]).map(t => (
              <Button key={t} variant={tab === t ? "default" : "outline"} size="sm" onClick={() => setTab(t)}>
                {t === "all" ? "All Time" : t === "week" ? "This Week" : "Today"}
              </Button>
            ))}
            <select
              value={fieldFilter}
              onChange={e => setFieldFilter(e.target.value)}
              className="h-9 px-3 text-sm rounded-md border border-border bg-secondary text-foreground"
            >
              <option value="">All Fields</option>
              {[...new Set([...Object.keys(FIELDS), ...Object.keys(SCHOOL_FIELDS)])].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Leaderboard list */}
          <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[3.5rem_1fr_5rem_4rem_7rem_6rem_3.5rem] gap-2 px-4 py-3 text-[11px] text-muted-foreground font-semibold uppercase tracking-wider border-b border-border/60">
              <span>Rank</span>
              <span>Player</span>
              <span>{displayMode === "percentile" ? "Avg %" : "Avg Score"}</span>
              <span className="text-center">Tests</span>
              <span>Tier</span>
              <span>Field</span>
              <span className="text-center">Card</span>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Trophy className="h-8 w-8 text-primary/40 mx-auto" />
                </motion.div>
                <p className="text-muted-foreground mt-3">Loading rankings...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                <p className="text-lg text-muted-foreground">No players yet</p>
                <p className="text-sm text-muted-foreground/70">Take a few tests to start your average ranking!</p>
              </div>
            ) : (
              results.map((r, i) => {
                const tier = getTier(r.percentile);
                const isMe = user && r.user_id === user.id;
                return (
                  <motion.div
                    key={r.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 1) }}
                    className={`grid grid-cols-[3.5rem_1fr_5rem_4rem_7rem_6rem_3.5rem] gap-2 px-4 py-3 items-center text-sm border-b border-border/30 hover:bg-primary/[0.03] transition-all cursor-pointer ${getRowGlow(i, results.length)} ${isMe ? "ring-1 ring-inset ring-primary/50 bg-primary/[0.05]" : ""}`}
                    onClick={() => setSelectedUser(r)}
                  >
                    {/* Rank */}
                    <span>{getRankBadge(i, results.length)}</span>

                    {/* Player */}
                    <span className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-secondary border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
                        {r.avatar_url ? (
                          <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold truncate text-sm ${isMe ? "text-primary" : "text-foreground"}`}>
                          {r.username || "Anonymous"}
                          {isMe && <span className="ml-1.5 text-[10px] text-primary/70 font-normal">(you)</span>}
                        </p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          {getCountryFlag(r.country || "US")} {r.country || "US"}
                        </p>
                      </div>
                    </span>

                    {/* Percentile or Score */}
                    <span className={`font-bold ${i === 0 ? "text-primary" : "text-foreground"}`}>
                      {displayMode === "percentile"
                        ? <>{Math.round(r.percentile)}<span className="text-[10px] text-muted-foreground">%</span></>
                        : Math.round(r.overall_score)
                      }
                    </span>

                    {/* Tests Count */}
                    <span className="text-center">
                      <span className="px-1.5 py-0.5 rounded-md bg-secondary text-[10px] font-bold text-muted-foreground border border-border/40">
                        {r.tests_count}
                      </span>
                    </span>

                    {/* Tier */}
                    <span className={`text-xs font-medium px-2 py-1 rounded-md truncate ${tier.tier >= 6 ? "bg-primary/10 text-primary" :
                      tier.tier >= 4 ? "bg-secondary text-foreground" :
                        "text-muted-foreground"
                      }`}>
                      {tier.title}
                    </span>

                    {/* Field */}
                    <span className="text-xs text-muted-foreground truncate">{r.field}</span>

                    {/* View Card */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedUser(r); }}
                      className="mx-auto p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                      title="View Score Card"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer info */}
          {results.length > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Showing {results.length} unique players · Rankings update in real-time as new players join
            </p>
          )}
        </motion.div>
      </main>

      {/* Profile Card Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="relative"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-lg"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Rank badge on card */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg">
                {(() => {
                  const idx = results.findIndex(r => r.id === selectedUser.id);
                  const rank = idx + 1;
                  const total = results.length;
                  if ((rank / total) <= 0.05 && total > 10) {
                    return `Top ${Math.max(0.1, Math.round((rank / total) * 1000) / 10)}%`;
                  }
                  return `Rank #${rank}`;
                })()}
              </div>

              <ResultCard
                percentile={selectedUser.percentile}
                tier={getTier(selectedUser.percentile)}
                scores={{
                  logic: selectedUser.logic,
                  creativity: selectedUser.creativity,
                  intuition: selectedUser.intuition,
                  emotionalIntelligence: selectedUser.emotional_intelligence,
                  systemsThinking: selectedUser.systems_thinking,
                  overallScore: selectedUser.overall_score,
                  famousMatch: selectedUser.famous_match || "Unknown",
                  famousMatchReason: selectedUser.famous_match_reason || "",
                  superpowers: selectedUser.superpowers || [],
                  blindSpots: selectedUser.blind_spots || [],
                }}
                field={`${selectedUser.field} · ${selectedUser.subfield}`}
                phase="done"
                username={selectedUser.username}
                avatarUrl={selectedUser.avatar_url}
                rank={results.findIndex(r => r.id === selectedUser.id) + 1}
                totalPlayers={results.length}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
