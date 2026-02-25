import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier, getCountryFlag, FIELDS, Field } from "@/lib/constants";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabType = "all" | "week" | "today";

export default function Leaderboard() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [tab, setTab] = useState<TabType>("all");
  const [fieldFilter, setFieldFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    fetchResults();
  }, [tab, fieldFilter]);

  const fetchResults = async () => {
    setLoading(true);
    let query = supabase
      .from("test_results")
      .select("*, profiles!inner(username, country, avatar_url)")
      .order("percentile", { ascending: false })
      .limit(100);

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

    const { data } = await query;
    setResults(
      (data || []).map((r: any) => ({
        ...r,
        username: r.profiles?.username,
        country: r.profiles?.country,
        avatar_url: r.profiles?.avatar_url,
      }))
    );
    setLoading(false);
  };

  const getRankStyle = (i: number) => {
    if (i === 0) return "bg-primary/10 border-primary/30";
    if (i === 1) return "bg-secondary border-muted-foreground/30";
    if (i === 2) return "bg-secondary border-border";
    return "";
  };

  const getRankIcon = (i: number) => {
    if (i === 0) return <Trophy className="h-5 w-5 text-primary" />;
    if (i === 1) return <Medal className="h-5 w-5 text-muted-foreground" />;
    if (i === 2) return <Medal className="h-5 w-5 text-muted-foreground/60" />;
    return <span className="text-sm text-muted-foreground w-5 text-center">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gradient-gold">Global Leaderboard</h1>
            <p className="text-muted-foreground">Top cognitive performers worldwide</p>
          </div>

          {/* Tabs */}
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
              {(Object.keys(FIELDS) as Field[]).map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_5rem_6rem_6rem_3rem] gap-2 p-3 text-xs text-muted-foreground font-medium border-b border-border">
              <span>#</span>
              <span>User</span>
              <span>%ile</span>
              <span>Tier</span>
              <span>Field</span>
              <span></span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No results yet. Be the first!</div>
            ) : (
              results.map((r, i) => {
                const tier = getTier(r.percentile);
                const isMe = user && r.user_id === user.id;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`grid grid-cols-[3rem_1fr_5rem_6rem_6rem_3rem] gap-2 p-3 items-center text-sm border-b border-border/50 hover:bg-secondary/30 transition-colors ${getRankStyle(i)} ${isMe ? "ring-1 ring-primary" : ""}`}
                  >
                    <span>{getRankIcon(i)}</span>
                    <span className="flex items-center gap-2 truncate">
                      <span>{getCountryFlag(r.country || "US")}</span>
                      <span className={`font-medium ${isMe ? "text-primary" : "text-foreground"}`}>
                        {r.username || "Anonymous"}
                      </span>
                    </span>
                    <span className="font-bold text-primary">{r.percentile}th</span>
                    <span className="text-xs text-muted-foreground">{tier.title}</span>
                    <span className="text-xs text-muted-foreground truncate">{r.field}</span>
                    <button
                      onClick={() => setSelectedUser(r)}
                      className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title="View Score Card"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>
      </main>

      {/* Profile Card Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative"
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute -top-3 -right-3 z-10 p-1.5 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
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
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
