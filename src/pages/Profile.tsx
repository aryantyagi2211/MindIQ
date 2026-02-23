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

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }

    const fetchProfile = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(p);

      const { data: r } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setResults(r || []);
    };
    fetchProfile();
  }, [user]);

  const bestResult = results.length > 0
    ? results.reduce((a, b) => (a.percentile > b.percentile ? a : b))
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{profile?.username || "Loading..."}</h1>
            <p className="text-muted-foreground">{results.length} tests completed</p>
          </div>

          {bestResult && (
            <div className={`${getTier(bestResult.percentile).cardClass} rounded-xl p-6 space-y-4`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Best Result</span>
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-gradient-gold">{bestResult.percentile}th</p>
                <p className="text-lg font-semibold text-foreground mt-1">{getTier(bestResult.percentile).title}</p>
                <p className="text-sm text-muted-foreground">{bestResult.field} · {bestResult.subfield}</p>
              </div>
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
