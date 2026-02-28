import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Swords, User, Shield, ChevronRight, Zap } from "lucide-react";
import { toast } from "sonner";

interface Challenge {
    id: string;
    challenger_id: string;
    challenge_code: string;
    created_at: string;
    profiles: { username: string; avatar_url: string | null };
    test_results: { field: string; subfield: string; overall_score: number };
}

export default function ChallengeLobby() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChallenges = async () => {
            // Fetch open challenges (no specific challenged user yet)
            const { data, error } = await supabase
                .from("challenges")
                .select(`
          id,
          challenge_code,
          challenger_id,
          created_at,
          profiles:challenger_id (username, avatar_url),
          test_results:challenger_result_id (field, subfield, overall_score)
        `)
                .is("challenged_user_id", null)
                .is("challenged_result_id", null)
                .order("created_at", { ascending: false })
                .limit(10);

            if (!error && data) {
                setChallenges(data as any);
            }
            setLoading(false);
        };

        fetchChallenges();

        // Subscribe to new challenges
        const channel = supabase
            .channel("open-challenges")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "challenges" },
                () => fetchChallenges()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleAccept = (challengeCode: string) => {
        if (!user) {
            toast.error("Synchronize your profile to accept challenges");
            navigate("/auth");
            return;
        }
        navigate(`/challenge/${challengeCode}`);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <Swords className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
                            Open <span className="text-yellow-500">Challenges</span>
                        </h2>
                        <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-bold">
                            Active neural invitations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-yellow-500"
                    />
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{challenges.length}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {challenges.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-6 hover:bg-white/[0.03] transition-all overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5">
                                <Swords className="h-24 w-24 text-white rotate-12" />
                            </div>

                            <div className="flex items-start justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center p-1 overflow-hidden">
                                        {c.profiles.avatar_url ? (
                                            <img src={c.profiles.avatar_url} className="h-full w-full object-cover rounded-full" />
                                        ) : (
                                            <User className="h-6 w-6 text-white/20" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-white tracking-tight">{c.profiles.username}</p>
                                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-none">
                                            {c.test_results.field}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className="text-[9px] font-black text-yellow-500/40 uppercase tracking-widest">Target Score</span>
                                    <p className="text-2xl font-black italic tracking-tighter text-yellow-500">{c.test_results.overall_score}</p>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-3 w-3 text-white/20" />
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{c.test_results.subfield}</span>
                                    </div>
                                    <span className="text-[8px] text-white/10 uppercase tracking-widest">Sequence: #{c.challenge_code.toUpperCase()}</span>
                                </div>

                                <button
                                    onClick={() => handleAccept(c.challenge_code)}
                                    className="px-6 py-3 rounded-xl bg-yellow-500 text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,191,0,0.1)] flex items-center gap-2"
                                >
                                    Intercept <ChevronRight className="h-3 w-3" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {challenges.length === 0 && !loading && (
                    <div className="col-span-full py-20 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-4">
                        <Zap className="h-8 w-8 text-white/5 animate-pulse" />
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em] pl-[1em]">The grid is silent. No active provocations.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
