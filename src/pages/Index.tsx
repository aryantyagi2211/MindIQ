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

      // Fetch user's latest result
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (profile) setUserProfile(profile);

        const { data: result } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        if (result) setUserResult(result);
      }
    };
    fetchData();
  }, [user]);

  // Build card data - real or fake
  const cardData = userResult
    ? {
        percentile: userResult.percentile,
        scores: {
          logic: userResult.logic,
          creativity: userResult.creativity,
          intuition: userResult.intuition,
          emotionalIntelligence: userResult.emotional_intelligence,
          systemsThinking: userResult.systems_thinking,
          overallScore: userResult.overall_score,
          famousMatch: userResult.famous_match || "",
          famousMatchReason: userResult.famous_match_reason || "",
          superpowers: userResult.superpowers || [],
          blindSpots: userResult.blind_spots || [],
          aiInsight: userResult.ai_insight || "",
        },
        username: userProfile?.username || "You",
        avatarUrl: userProfile?.avatar_url,
        field: userResult.subfield,
      }
    : {
        percentile: 94,
        scores: {
          logic: 88,
          creativity: 92,
          intuition: 76,
          emotionalIntelligence: 85,
          systemsThinking: 90,
          overallScore: 86,
          famousMatch: "Alan Turing",
          famousMatchReason: "",
          superpowers: [],
          blindSpots: [],
          aiInsight: "",
        },
        username: "Your Name Here",
        avatarUrl: null,
        field: "AI/ML",
      };

  const tier = getTier(cardData.percentile);

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

          {/* Right - single result card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
            className="hidden lg:flex flex-col items-center"
          >
            <ResultCard
              percentile={cardData.percentile}
              tier={tier}
              scores={cardData.scores}
              field={cardData.field}
              phase="done"
              username={cardData.username}
              avatarUrl={cardData.avatarUrl}
            />
            {!userResult && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-sm text-muted-foreground mt-4 italic"
              >
                This could be your card. Take the test →
              </motion.p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
