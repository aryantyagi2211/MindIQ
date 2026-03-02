import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ChevronRight, User, Shield, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FIELDS } from "@/lib/constants";
import { toast } from "sonner";

export default function BattleArena() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [field, setField] = useState("Technology");
  const [subfield, setSubfield] = useState("");
  const [difficulty, setDifficulty] = useState("Standard");
  const [searching, setSearching] = useState(false);
  const [activePlayers, setActivePlayers] = useState(0);

  const subfields = (FIELDS as any)[field] || [];

  // Fetch active player count
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("battles")
        .select("*", { count: "exact", head: true })
        .in("status", ["waiting", "matched", "active"]);
      // Each battle has 1-2 players
      setActivePlayers((count || 0) * 2);
    };
    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleFindBattle = async () => {
    if (!user) {
      toast.error("Login first to enter the battlefield");
      navigate("/auth");
      return;
    }
    if (!subfield) {
      toast.error("Select a specialization first");
      return;
    }

    setSearching(true);

    try {
      const { data: existing } = await supabase
        .from("battles")
        .select("*")
        .eq("status", "waiting")
        .eq("field", field)
        .eq("subfield", subfield)
        .neq("player1_id", user.id)
        .limit(1)
        .single();

      if (existing) {
        await supabase
          .from("battles")
          .update({ player2_id: user.id, status: "matched" })
          .eq("id", existing.id);
        navigate(`/battle/${existing.id}`);
      } else {
        const { data: newBattle, error } = await supabase
          .from("battles")
          .insert({
            player1_id: user.id,
            field,
            subfield,
            difficulty,
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
      setSearching(false);
    }
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
          Challenge a random opponent • Same questions • One winner
        </p>
        {/* Live player count */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mt-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <Users className="h-3 w-3 text-green-400" />
          <span className="text-[10px] font-bold text-green-400">
            {activePlayers} player{activePlayers !== 1 ? "s" : ""} online
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-red-500/5" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-yellow-500/30 via-transparent to-red-500/30" />

          <div className="relative z-10">
            {/* VS Cards */}
            <div className="grid grid-cols-3 items-center gap-4 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full border-2 border-yellow-500/30 bg-yellow-500/5 flex items-center justify-center">
                  <User className="h-8 w-8 text-yellow-500/60" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-wider">You</span>
                <div className="h-[2px] w-12 bg-yellow-500/30 rounded-full" />
              </div>

              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full" />
                  <div className="relative text-5xl md:text-6xl font-black italic text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                    VS
                  </div>
                </motion.div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="h-20 w-20 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center">
                  <span className="text-3xl animate-pulse">?</span>
                </div>
                <span className="text-sm font-black text-white/30 uppercase tracking-wider">Opponent</span>
                <div className="h-[2px] w-12 bg-white/10 rounded-full" />
              </div>
            </div>

            {/* Field Selection */}
            <div className="space-y-4">
              <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
                <Shield className="h-3 w-3" /> Choose Your Battlefield
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(FIELDS).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setField(f); setSubfield(""); }}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${
                      field === f
                        ? "border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,191,0,0.5)]"
                        : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {subfields.length > 0 && (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Specialization</label>
                    <div className="flex flex-wrap gap-2">
                      {subfields.map((s: string) => (
                        <button
                          key={s}
                          onClick={() => setSubfield(s)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all duration-300 ${
                            subfield === s
                              ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                              : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/70"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Find Battle Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleFindBattle}
                disabled={!subfield || searching}
                className={`group relative px-10 py-4 rounded-2xl text-lg font-black italic tracking-tighter transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] flex items-center gap-3 ${
                  subfield && !searching
                    ? "bg-gradient-to-r from-yellow-500 to-red-500 text-black shadow-[0_0_60px_rgba(255,191,0,0.3)]"
                    : "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
                }`}
              >
                <Swords className="h-5 w-5" />
                {searching ? "SEARCHING..." : "FIND OPPONENT"}
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
