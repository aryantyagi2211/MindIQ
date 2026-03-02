import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Users, Zap, Crown, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FIELDS } from "@/lib/constants";
import { toast } from "sonner";

export default function BattleArena() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeBattleGames, setActiveBattleGames] = useState(0);
  const [fieldPlayerCounts, setFieldPlayerCounts] = useState<Record<string, number>>({});
  const [searching, setSearching] = useState<string | null>(null);

  // Fetch active battle games count
  useEffect(() => {
    const fetchBattleGames = async () => {
      const { count } = await supabase
        .from("battles")
        .select("*", { count: "exact", head: true })
        .in("status", ["waiting", "matched", "active"]);
      
      setActiveBattleGames(count || 0);
    };

    fetchBattleGames();
    const interval = setInterval(fetchBattleGames, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time player counts per field
  useEffect(() => {
    const fetchFieldCounts = async () => {
      const { data: battles } = await supabase
        .from("battles")
        .select("field, player1_id, player2_id")
        .in("status", ["waiting", "matched", "active"]);

      const counts: Record<string, Set<string>> = {};
      
      battles?.forEach(b => {
        if (!counts[b.field]) counts[b.field] = new Set();
        if (b.player1_id) counts[b.field].add(b.player1_id);
        if (b.player2_id) counts[b.field].add(b.player2_id);
      });

      const finalCounts: Record<string, number> = {};
      Object.keys(counts).forEach(f => {
        finalCounts[f] = counts[f].size;
      });

      setFieldPlayerCounts(finalCounts);
    };

    fetchFieldCounts();
    const interval = setInterval(fetchFieldCounts, 3000); // Update every 3 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const handleSelectField = async (selectedField: string) => {
    if (!user) {
      toast.error("Login first to enter the battlefield");
      navigate("/auth");
      return;
    }

    setSearching(selectedField);

    try {
      // Look for existing waiting battles in this field (no subfield matching)
      const { data: existingBattles, error: fetchError } = await supabase
        .from("battles")
        .select("*")
        .eq("status", "waiting")
        .eq("field", selectedField)
        .neq("player1_id", user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      // If found a waiting battle, join it
      if (existingBattles && existingBattles.length > 0) {
        const existing = existingBattles[0];
        await supabase
          .from("battles")
          .update({ player2_id: user.id, status: "matched" })
          .eq("id", existing.id);
        navigate(`/battle/${existing.id}`);
      } else {
        // Create new battle (subfield set to "General" for all fields)
        const { data: newBattle, error } = await supabase
          .from("battles")
          .insert({
            player1_id: user.id,
            field: selectedField,
            subfield: "General", // Default subfield
            difficulty: "Standard",
            status: "waiting",
          })
          .select()
          .single();

        if (error) throw error;
        navigate(`/battle/${newBattle.id}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to start battle");
      setSearching(null);
    }
  };

  const getFieldIcon = (fieldName: string) => {
    if (fieldName === "Mastermind") return <Crown className="h-5 w-5" />;
    return <Swords className="h-5 w-5" />;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7 }}
      className="mt-24"
    >
      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mx-auto">
          <Swords className="h-4 w-4 text-red-500" />
          <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em]">1v1 Battlefield</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
          Neural <span className="text-yellow-500">Combat</span>
        </h2>
        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em]">
          Select your field • Challenge opponents • Prove your mastery
        </p>
        {/* Active battle games count */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mt-3">
          <Target className="h-3 w-3 text-yellow-400" />
          <span className="text-[10px] font-bold text-yellow-400">
            {activeBattleGames} active battle{activeBattleGames !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Mastermind Warning */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
        >
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-purple-400" />
            <div>
              <p className="text-sm font-black text-purple-400 uppercase tracking-wider">Mastermind Challenge Available</p>
              <p className="text-[10px] text-purple-300/60 mt-1">
                Click Mastermind field for mixed questions from all categories • Extremely difficult
              </p>
            </div>
          </div>
        </motion.div>

        {/* Field Selection Cards - Click to Start Battle */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.keys(FIELDS).map((field) => {
            const playerCount = fieldPlayerCounts[field] || 0;
            const isMastermind = field === "Mastermind";
            const isSearching = searching === field;
            
            return (
              <motion.button
                key={field}
                onClick={() => handleSelectField(field)}
                disabled={isSearching}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: isSearching ? 1 : 1.05 }}
                whileTap={{ scale: isSearching ? 1 : 0.95 }}
                className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isSearching
                    ? "border-white/20 bg-white/10 cursor-wait"
                    : isMastermind
                      ? "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                      : "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-red-500/10 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(255,191,0,0.3)]"
                }`}
              >
                {/* Background glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isMastermind
                    ? "bg-gradient-to-br from-purple-500/5 to-pink-500/5"
                    : "bg-gradient-to-br from-yellow-500/5 to-red-500/5"
                }`} />

                {/* Player count badge */}
                {playerCount > 0 && (
                  <div className="absolute top-3 right-3 z-10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black ${
                        isMastermind
                          ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                          : "bg-yellow-500 text-black shadow-[0_0_10px_rgba(255,191,0,0.5)]"
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      <span>{playerCount}</span>
                    </motion.div>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col items-center gap-4">
                  {/* Icon */}
                  <div className={`p-4 rounded-xl ${
                    isMastermind
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "bg-yellow-500/20 border border-yellow-500/30"
                  }`}>
                    {getFieldIcon(field)}
                  </div>

                  {/* Field name */}
                  <div className="text-center">
                    <h3 className={`text-lg font-black uppercase tracking-tight ${
                      isMastermind ? "text-purple-400" : "text-yellow-400"
                    }`}>
                      {field}
                    </h3>
                    {isMastermind && (
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Zap className="h-3 w-3 text-purple-400 animate-pulse" />
                        <span className="text-[8px] text-purple-300/60 uppercase tracking-widest">Elite</span>
                      </div>
                    )}
                  </div>

                  {/* Loading or CTA */}
                  {isSearching ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                      <span className="text-[10px] text-white/60 uppercase tracking-wider">Searching...</span>
                    </div>
                  ) : (
                    <div className={`text-[10px] uppercase tracking-widest font-bold ${
                      isMastermind ? "text-purple-300/60" : "text-yellow-300/60"
                    }`}>
                      Click to Battle
                    </div>
                  )}
                </div>

                {/* Hover effect line */}
                <div className={`absolute bottom-0 left-0 right-0 h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                  isMastermind
                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                    : "bg-gradient-to-r from-yellow-500 to-red-500"
                }`} />
              </motion.button>
            );
          })}
        </div>

        {/* Info text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em] mt-8"
        >
          Real-time player counts • Instant matchmaking • Same questions for fair competition
        </motion.p>
      </div>
    </motion.section>
  );
}
