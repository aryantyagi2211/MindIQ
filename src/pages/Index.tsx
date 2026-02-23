import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, Zap, ChevronRight, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier, getCountryFlag } from "@/lib/constants";
import Header from "@/components/Header";

function FloatingCard({ result, delay }: { result: any; delay: number }) {
  const tier = getTier(result.percentile);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className={`${tier.cardClass} rounded-xl p-4 w-56 animate-float`}
      style={{ animationDelay: `${delay * 2}s` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{result.field}</span>
        <span className="text-xs font-bold text-primary">{result.percentile}th</span>
      </div>
      <p className="text-sm font-semibold text-foreground">{tier.title}</p>
      <p className="text-xs text-muted-foreground mt-1">{result.username || "Anonymous"}</p>
    </motion.div>
  );
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [totalMinds, setTotalMinds] = useState(0);
  const [recentResults, setRecentResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { count } = await supabase.from("test_results").select("*", { count: "exact", head: true });
      setTotalMinds(count || 0);

      const { data } = await supabase
        .from("test_results")
        .select("*, profiles!inner(username, country)")
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                <Zap className="h-4 w-4 text-primary" />
                AI-Powered Cognitive Ranking
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                Discover Where{" "}
                <span className="text-gradient-gold">Your Mind</span>{" "}
                Ranks
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                15 AI-generated questions. Unique every time. Scored across 5 cognitive dimensions. 
                Find your percentile among thousands of minds worldwide.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="text-lg px-8 py-6 glow-gold"
                onClick={() => navigate(user ? "/test/setup" : "/auth")}
              >
                <Brain className="mr-2 h-5 w-5" />
                Rank My Mind
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-gradient-gold">
                    {totalMinds.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Minds Ranked</p>
                </div>
              </div>

              {recentResults.length > 0 && (
                <div className="flex -space-x-2">
                  {recentResults.slice(0, 4).map((r, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs"
                    >
                      {getCountryFlag(r.country || "US")}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent feed */}
            <div className="space-y-2 max-h-48 overflow-hidden">
              <AnimatePresence>
                {recentResults.slice(0, 3).map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                    className="flex items-center gap-3 text-sm p-2 rounded-lg bg-secondary/50"
                  >
                    <span>{getCountryFlag(r.country || "US")}</span>
                    <span className="text-foreground font-medium">{r.username || "Anonymous"}</span>
                    <span className="text-muted-foreground">ranked</span>
                    <span className="text-primary font-bold">{r.percentile}th percentile</span>
                    <span className="text-muted-foreground text-xs ml-auto">{getTier(r.percentile).title}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right - floating cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="hidden lg:flex flex-col items-center gap-6 relative"
          >
            {recentResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {recentResults.slice(0, 6).map((r, i) => (
                  <FloatingCard key={r.id} result={r} delay={0.4 + i * 0.15} />
                ))}
              </div>
            ) : (
              /* Placeholder cards when no data */
              <div className="grid grid-cols-2 gap-4">
                {[
                  { percentile: 97, field: "AI/ML", tier_title: "Apex Intellect" },
                  { percentile: 82, field: "Physics", tier_title: "Advanced Mind" },
                  { percentile: 65, field: "Finance", tier_title: "Sharp Thinker" },
                  { percentile: 99, field: "Neuroscience", tier_title: "⚡ MASTERMIND" },
                ].map((mock, i) => {
                  const tier = getTier(mock.percentile);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.15, duration: 0.6 }}
                      className={`${tier.cardClass} rounded-xl p-4 w-56 animate-float`}
                      style={{ animationDelay: `${i * 1.5}s` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">{mock.field}</span>
                        <span className="text-xs font-bold text-primary">{mock.percentile}th</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{tier.title}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
