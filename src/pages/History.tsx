import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier } from "@/lib/constants";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Brain, ChevronRight } from "lucide-react";

export default function History() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            const checkAuth = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) navigate("/auth");
            };
            checkAuth();
            return;
        }

        const fetchHistory = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("test_results")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching history:", error);
            } else {
                setResults(data || []);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container pt-24 pb-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-foreground flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-primary" />
                                MATCH HISTORY
                            </h1>
                            <p className="text-muted-foreground">Review your cognitive performance evolution.</p>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3">
                            <div className="text-right border-r border-primary/20 pr-3">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Total Sessions</p>
                                <p className="text-xl font-black text-foreground leading-none">{results.length}</p>
                            </div>
                            <Brain className="h-6 w-6 text-primary" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 w-full bg-card/50 rounded-xl animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-20 space-y-4 bg-card/20 rounded-2xl border border-dashed border-white/10">
                            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                <Brain className="h-8 w-8 text-primary/40" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-foreground">No matches found</h3>
                                <p className="text-sm text-muted-foreground">Complete your first assessment to start tracking progress.</p>
                            </div>
                            <button
                                onClick={() => navigate("/test/setup")}
                                className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:scale-105 transition-transform"
                            >
                                Start assessment
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {results.map((r, i) => {
                                const tier = getTier(r.percentile);
                                const date = new Date(r.created_at);

                                return (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => navigate(`/test/result?id=${r.id}`)}
                                        className="group relative bg-card/40 backdrop-blur-sm border border-white/5 rounded-2xl p-5 hover:bg-card/60 transition-all cursor-pointer overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-xl font-black italic`}>
                                                    {r.percentile}<span className="text-[10px] not-italic">%</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground text-lg italic uppercase tracking-tight">{tier.title}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5">{r.field}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                    <div className="flex justify-between gap-2">
                                                        <span>LOG</span>
                                                        <span className="text-foreground">{r.logic}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-2">
                                                        <span>CRE</span>
                                                        <span className="text-foreground">{r.creativity}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary group-hover:translate-x-1 transition-transform">
                                                    <span className="text-xs font-black uppercase italic">Details</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress bar background decoration */}
                                        <div className="absolute bottom-0 left-0 h-[2px] bg-primary/20 w-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary shadow-[0_0_10px_rgba(255,191,0,0.5)]"
                                                style={{ width: `${r.percentile}%` }}
                                            />
                                        </div>
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
