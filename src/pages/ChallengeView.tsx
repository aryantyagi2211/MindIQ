import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Swords, Brain, Zap } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

export default function ChallengeView() {
    const { code } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [challenge, setChallenge] = useState<any>(null);

    useEffect(() => {
        const fetchChallenge = async () => {
            const { data, error } = await supabase
                .from("challenges")
                .select(`
          *,
          profiles:challenger_id (username, avatar_url),
          test_results:challenger_result_id (*)
        `)
                .eq("challenge_code", code)
                .single();

            if (error || !data) {
                toast.error("Challenge sequence not found in the grid.");
                navigate("/");
                return;
            }

            setChallenge(data);
            setLoading(false);
        };

        fetchChallenge();
    }, [code]);

    const startChallenge = () => {
        if (!challenge) return;

        // Redirect to test setup with fixed parameters from the challenge
        navigate("/test/take", {
            state: {
                qualification: challenge.test_results.age_group,
                difficulty: challenge.test_results.difficulty,
                field: challenge.test_results.field,
                subfield: challenge.test_results.subfield,
                examType: "mcq", // Defaulting to MCQ for fair comparison or derived from result
                challengeId: challenge.id
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
            <Header />
            <main className="pt-32 pb-20 px-4 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-xl p-12 rounded-[40px] border border-white/10 bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden"
                >
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 flex flex-col items-center text-center space-y-8">
                        <div className="p-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_50px_rgba(255,191,0,0.1)]">
                            <Swords className="h-12 w-12 text-yellow-500" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                                Challenge <span className="text-yellow-500">Intercepted</span>
                            </h1>
                            <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-xs">Neural Sync Code: {code?.toUpperCase()}</p>
                        </div>

                        <div className="w-full py-8 border-y border-white/5 space-y-4">
                            <div className="flex items-center justify-center gap-3">
                                <span className="text-white font-black">{challenge.profiles.username}</span>
                                <span className="text-white/20 uppercase font-black text-[10px]">vs</span>
                                <span className="text-yellow-500 font-black italic tracking-tighter uppercase">Protocol Alpha</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Field</p>
                                    <p className="text-sm font-bold text-white">{challenge.test_results.field}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Difficulty</p>
                                    <p className="text-sm font-bold text-yellow-500 uppercase">{challenge.test_results.difficulty}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 w-full">
                            <p className="text-sm text-white/60 leading-relaxed font-medium">
                                You have been summoned to a cognitive duel. Your performance will be directly compared against
                                <span className="text-white"> {challenge.profiles.username}'s </span>
                                overall score of <span className="text-yellow-500 font-bold">{challenge.test_results.overall_score}</span>.
                            </p>

                            <button
                                onClick={startChallenge}
                                className="w-full py-5 rounded-2xl bg-yellow-500 text-black text-xl font-black italic tracking-tighter shadow-[0_0_50px_rgba(255,191,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                <Zap className="h-6 w-6 fill-current" />
                                INITIATE NEURAL CLASH
                            </button>

                            <button
                                onClick={() => navigate("/")}
                                className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] hover:text-white/40 transition-colors"
                            >
                                Decline & Terminate
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
