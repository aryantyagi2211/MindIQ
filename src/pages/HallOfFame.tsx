import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTier, getCountryFlag } from "@/lib/constants";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

export default function HallOfFame() {
  const [masterminds, setMasterminds] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("test_results")
        .select("*, profiles!inner(username, country)")
        .gte("percentile", 99)
        .order("overall_score", { ascending: false });

      setMasterminds(
        (data || []).map((r: any) => ({
          ...r,
          username: r.profiles?.username,
          country: r.profiles?.country,
        }))
      );
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center space-y-3">
            <Crown className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-4xl font-bold text-gradient-gold">Hall of Fame</h1>
            <p className="text-muted-foreground">
              Only <span className="text-primary font-bold">{masterminds.length}</span> {masterminds.length === 1 ? "person has" : "people have"} ever achieved Mastermind
            </p>
          </div>

          {masterminds.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No Masterminds yet. Will you be the first?</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {masterminds.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-tier-7 rounded-xl p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(m.country || "US")}</span>
                      <span className="font-bold text-foreground">{m.username || "Anonymous"}</span>
                    </div>
                    <span className="text-xs text-primary font-bold">{m.percentile}th</span>
                  </div>
                  <p className="text-xl font-bold text-gradient-gold">⚡ MASTERMIND</p>
                  <p className="text-sm text-muted-foreground">
                    Field: {m.field} · {m.subfield}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mind Match: <span className="text-foreground">{m.famous_match}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
