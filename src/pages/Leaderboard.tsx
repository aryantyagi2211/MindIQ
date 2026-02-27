import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier, getCountryFlag, FIELDS, SCHOOL_FIELDS } from "@/lib/constants";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, X, Eye, Users, Crown, TrendingUp, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNeuralSignature } from "@/hooks/useNeuralSignature";

type TabType = "all" | "week" | "today";
type DisplayMode = "percentile" | "score";

export default function Leaderboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>("all");
  const [fieldFilter, setFieldFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("percentile");

  const { allRankings, totalPlayers, loading } = useNeuralSignature(user?.id);

  // Listen for header score mode toggle
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.showAsScore) setDisplayMode("score");
      else setDisplayMode("percentile");
    };
    window.addEventListener("mindiq-score-mode", handler);
    return () => window.removeEventListener("mindiq-score-mode", handler);
  }, []);

  // Filter logic for the frontend since the hook fetches all
  const filteredResults = allRankings.filter(r => {
    if (fieldFilter && r.field !== fieldFilter) return false;
    // Note: Tab filtering (today/week) would normally be done in the hook/backend 
    // for performance, but keeping it simple for now as per current data.
    return true;
  });

  const avgPercentile = filteredResults.length > 0
    ? Math.round(filteredResults.reduce((s, r) => s + r.percentile, 0) / filteredResults.length)
    : 0;
  const topTier = filteredResults.length > 0 ? getTier(filteredResults[0]?.percentile) : null;

  const getRankBadge = (i: number, total: number) => {
    const rank = i + 1;
    const isTop5Percent = (rank / (total || 1)) <= 0.05;

    if (isTop5Percent && total > 10) {
      const topPct = Math.max(0.1, Math.round((rank / total) * 1000) / 10);
      return (
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full ${i === 0 ? "bg-yellow-500/20 border-yellow-500/40" : "bg-yellow-500/10 border-yellow-500/20"} border flex items-center justify-center shadow-[0_0_15px_rgba(255,191,0,0.2)]`}>
            {i === 0 ? <Crown className="h-4 w-4 text-yellow-500" /> : <Trophy className="h-3 w-3 text-yellow-500/80" />}
          </div>
          <span className="text-[9px] font-bold text-yellow-500 mt-1 whitespace-nowrap">Top {topPct}%</span>
        </div>
      );
    }

    if (i === 0) return (
      <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,191,0,0.3)]">
        <Crown className="h-4 w-4 text-yellow-500" />
      </div>
    );
    if (i === 1) return (
      <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        <Medal className="h-4 w-4 text-white/60" />
      </div>
    );
    if (i === 2) return (
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
        <Medal className="h-4 w-4 text-white/40" />
      </div>
    );
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
        <span className="text-xs font-bold text-white/20">#{rank}</span>
      </div>
    );
  };

  const getRowGlow = (i: number, total: number) => {
    const rank = i + 1;
    const isTop5Percent = (rank / (total || 1)) <= 0.05 && total > 10;

    if (isTop5Percent) return "bg-yellow-500/[0.04] border-l-2 border-l-yellow-500/40";
    if (i === 0) return "bg-yellow-500/5 border-l-2 border-l-yellow-500 shadow-[inset_10px_0_20px_-10px_rgba(255,191,0,0.1)]";
    if (i === 1) return "bg-white/[0.03] border-l-2 border-l-white/20";
    if (i === 2) return "bg-white/[0.01] border-l-2 border-l-white/10";
    return "border-l-2 border-l-transparent";
  };

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

      <main className="relative container pt-24 pb-16 max-w-5xl z-10">
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
                {displayMode === "percentile" ? <>{avgPercentile}<span className="text-sm text-muted-foreground">th</span></> : Math.round(filteredResults.reduce((s, r) => s + r.overall_score, 0) / (totalPlayers || 1))}
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
                  <Zap className="h-8 w-8 text-yellow-500/40 mx-auto" />
                </motion.div>
                <p className="text-muted-foreground mt-3 font-medium animate-pulse">Syncing with global neural grid...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <Users className="h-10 w-10 text-white/10 mx-auto" />
                <p className="text-lg text-muted-foreground">No players detected</p>
                <p className="text-sm text-white/30 truncate">Initiate assessment to establish initial ranking.</p>
              </div>
            ) : (
              filteredResults.map((r, i) => {
                const tier = getTier(r.percentile);
                const isMe = user && r.user_id === user.id;
                return (
                  <motion.div
                    key={r.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 1) }}
                    className={`grid grid-cols-[3.5rem_1fr_5rem_4rem_7rem_6rem_3.5rem] gap-2 px-4 py-3 items-center text-sm border-b border-white/5 hover:bg-yellow-500/[0.03] transition-all cursor-pointer ${getRowGlow(i, filteredResults.length)} ${isMe ? "bg-yellow-500/[0.05]" : ""}`}
                    onClick={() => setSelectedUser(r)}
                  >
                    {/* Rank */}
                    <span>{getRankBadge(i, filteredResults.length)}</span>

                    {/* Player */}
                    <span className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {r.avatar_url ? (
                          <img src={r.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-white/20" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold truncate text-sm ${isMe ? "text-yellow-500" : "text-white"}`}>
                          {r.username || "Anonymous"}
                          {isMe && <span className="ml-1.5 text-[10px] text-yellow-500/70 font-normal">(you)</span>}
                        </p>
                        <p className="text-[10px] text-white/30 flex items-center gap-1">
                          {getCountryFlag(r.country || "US")} {r.country || "US"}
                        </p>
                      </div>
                    </span>

                    {/* Percentile or Score */}
                    <span className={`font-bold ${i === 0 ? "text-yellow-500 text-lg drop-shadow-[0_0_10px_rgba(255,191,0,0.3)]" : "text-white"}`}>
                      {displayMode === "percentile"
                        ? <>{Math.round(r.percentile)}<span className="text-[10px] text-white/30">%</span></>
                        : Math.round(r.overall_score)
                      }
                    </span>

                    {/* Tests Count */}
                    <span className="text-center">
                      <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-white/40 border border-white/10">
                        {r.test_count}
                      </span>
                    </span>

                    {/* Tier */}
                    <span className={`text-xs font-medium px-2 py-1 rounded-md truncate ${tier.tier >= 6 ? "bg-yellow-500/10 text-yellow-500" :
                      tier.tier >= 4 ? "bg-white/10 text-white" :
                        "text-white/40"
                      }`}>
                      {tier.title}
                    </span>

                    {/* Field */}
                    <span className="text-xs text-white/40 truncate">{r.field}</span>

                    {/* View Card */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedUser(r); }}
                      className="mx-auto p-1.5 rounded-lg hover:bg-yellow-500/10 text-white/20 hover:text-yellow-500 transition-all"
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
          {filteredResults.length > 0 && (
            <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.2em] pt-4">
              Real-time update active · {filteredResults.length} neural signatures verified
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
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
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
                className="absolute -top-3 -right-3 z-20 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors shadow-2xl"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Rank badge on card */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-yellow-500 text-black text-[10px] font-black italic tracking-wider shadow-[0_0_30px_rgba(255,191,0,0.5)]">
                {(() => {
                  const idx = allRankings.findIndex(r => r.user_id === selectedUser.user_id);
                  const rank = idx + 1;
                  const total = allRankings.length;
                  if ((rank / total) <= 0.05 && total > 10) {
                    return `TOP ${Math.max(0.1, Math.round((rank / total) * 1000) / 10)}%`;
                  }
                  return `GRID RANK #${rank}`;
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
                  famousMatchReason: "",
                  superpowers: selectedUser.superpowers || [],
                  blindSpots: selectedUser.blind_spots || [],
                }}
                field={`${selectedUser.field} · ${selectedUser.subfield || 'CORE'}`}
                phase="done"
                username={selectedUser.username}
                avatarUrl={selectedUser.avatar_url}
                rank={allRankings.findIndex(r => r.user_id === selectedUser.user_id) + 1}
                totalPlayers={allRankings.length}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 5;
          background: linear-gradient(0deg, rgba(255,191,0,0) 0%, rgba(255,191,0,0.01) 50%, rgba(255,191,0,0) 100%);
          position: absolute;
          bottom: 100%;
          animation: scanline 12s linear infinite;
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
