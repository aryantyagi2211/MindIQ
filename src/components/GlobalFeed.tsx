import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Zap, TrendingUp, Trophy } from "lucide-react";
import { getTierTitle } from "@/lib/constants";

interface FeedItem {
    id: string;
    username: string;
    field: string;
    subfield: string;
    overall_score: number;
    tier: string;
    timestamp: string;
}

export default function GlobalFeed() {
    const [feed, setFeed] = useState<FeedItem[]>([]);

    useEffect(() => {
        const fetchRecent = async () => {
            const { data, error } = await supabase
                .from("test_results")
                .select(`
          id,
          overall_score,
          field,
          subfield,
          created_at,
          profiles:user_id (username)
        `)
                .order("created_at", { ascending: false })
                .limit(5);

            if (data) {
                const items = data.map((d: any) => ({
                    id: d.id,
                    username: d.profiles?.username || "Anonymous",
                    field: d.field,
                    subfield: d.subfield,
                    overall_score: d.overall_score,
                    tier: getTierTitle(d.overall_score),
                    timestamp: d.created_at,
                }));
                setFeed(items);
            }
            
        };

        fetchRecent();

        // 2. Subscribe to new results
        const channel = supabase
            .channel("global-neural-updates")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "test_results" },
                async (payload) => {
                    // Fetch the username since payload only contains the row
                    const { data: profile } = await supabase
                        .from("profiles")
                        .select("username")
                        .eq("id", payload.new.user_id)
                        .single();

                    const newItem: FeedItem = {
                        id: payload.new.id,
                        username: profile?.username || "Anonymous",
                        field: payload.new.field,
                        subfield: payload.new.subfield,
                        overall_score: payload.new.overall_score,
                        tier: getTierTitle(payload.new.overall_score),
                        timestamp: payload.new.created_at,
                    };

                    setFeed((prev) => [newItem, ...prev.slice(0, 4)]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 bg-yellow-500 rounded-full"
                    />
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Live Neural Stream</span>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-yellow-500/20 to-transparent" />
            </div>

            <div className="space-y-3">
                <AnimatePresence initial={false}>
                    {feed.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-xl hover:bg-white/[0.04] transition-all overflow-hidden"
                        >
                            {/* Scanline Effect */}
                            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-center gap-4 relative z-10">
                                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Brain className="h-5 w-5 text-white/40 group-hover:text-yellow-500 transition-colors" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white tracking-tight">{item.username}</span>
                                        <span className="text-[10px] text-white/20 uppercase font-black">reached</span>
                                        <span className="px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-black text-yellow-400 uppercase tracking-tighter shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                                            {item.tier}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-white/40 uppercase tracking-wider font-medium">
                                        {item.subfield} in {item.field}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1 relative z-10">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-yellow-500/40" />
                                    <span className="text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                                        {item.overall_score}
                                    </span>
                                </div>
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.2em]">Validated Pulse</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {feed.length === 0 && (
                <div className="h-20 flex items-center justify-center rounded-2xl border border-dashed border-white/5">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] animate-pulse">Syncing with Global Grid...</p>
                </div>
            )}
        </div>
    );
}
