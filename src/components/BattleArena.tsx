import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ChevronRight, User, Shield, Users, Zap, Crown } from "lucide-react";
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
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [fieldPlayerCounts, setFieldPlayerCounts] = useState<Record<string, number>>({});

  const subfields = (FIELDS as any)[field] || [];

  // Fetch online players count using Supabase Presence
  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user?.id || 'anonymous',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineCount = Object.keys(state).length;
        setOnlinePlayers(onlineCount);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && user) {
          await channel.track({
            user_id: user.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Fetch player counts per field
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
    const interval = setInterval(fetchFieldCounts, 5000);
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
      // Look for existing waiting battles (removed .single() to avoid error)
      const { data: existingBattles, error: fetchError } = await supabase
        .from("battles")
        .select("*")
        .eq("status", "waiting")
        .eq("field", field)
        .eq("subfield", subfield)
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
        // Create new battle
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

  const getFieldIcon = (fieldName: string) => {
    if (fieldName === "Mastermind") return <Crown className="h-4 w-4" />;
    return <Swords className="h-4 w-4" />;
  };

  const getFieldColor = (fieldName: string) => {
    if (fieldName === "Mastermind") return "from-purple-500 to-pink-500";
    return "from-yellow-500 to-red-500";
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
        {/* Online players count */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 mt-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <Users className="h-3 w-3 text-green-400" />
          <span className="text-[10px] font-bold text-green-400">
            {onlinePlayers} player{onlinePlayers !== 1 ? "s" : ""} online
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Field Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {Object.keys(FIELDS).map((f) => {
              const playerCount = fieldPlayerCounts[f] || 0;
              const isMastermind = f === "Mastermind";
              
              return (
                <button
                  key={f}
                  onClick={() => { setField(f); setSubfield(""); }}
                  className={`relative px-4 py-3 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2 ${
                    field === f
                      ? isMastermind
                        ? "border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                        : "border-yellow-500 bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-yellow-400 shadow-[0_0_20px_rgba(255,191,0,0.3)]"
                      : "border-white/5 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {getFieldIcon(f)}
                  <span>{f}</span>
                  {playerCount > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      field === f
                        ? isMastermind
                          ? "bg-purple-500 text-white"
                          : "bg-yellow-500 text-black"
                        : "bg-white/10 text-white/30"
                    }`}>
                      {playerCount}
                    </span>
                  )}
                  {isMastermind && (
                    <Zap className="h-3 w-3 text-purple-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-8 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${
            field === "Mastermind" 
              ? "from-purple-500/5 via-transparent to-pink-500/5" 
              : "from-yellow-500/5 via-transparent to-red-500/5"
          }`} />
          <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r ${
            field === "Mastermind"
              ? "from-purple-500/30 via-transparent to-pink-500/30"
              : "from-yellow-500/30 via-transparent to-red-500/30"
          }`} />

          <div className="relative z-10">
            {/* Mastermind Warning */}
            {field === "Mastermind" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
              >
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-purple-400" />
                  <div>
                    <p className="text-sm font-black text-purple-400 uppercase tracking-wider">Elite Challenge</p>
                    <p className="text-[10px] text-purple-300/60 mt-1">
                      Mixed questions from all categories • Extremely difficult • For top minds only
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VS Cards */}
            <div className="grid grid-cols-3 items-center gap-4 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className={`h-20 w-20 rounded-full border-2 flex items-center justify-center ${
                  field === "Mastermind"
                    ? "border-purple-500/30 bg-purple-500/5"
                    : "border-yellow-500/30 bg-yellow-500/5"
                }`}>
                  <User className={`h-8 w-8 ${
                    field === "Mastermind" ? "text-purple-500/60" : "text-yellow-500/60"
                  }`} />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-wider">You</span>
                <div className={`h-[2px] w-12 rounded-full ${
                  field === "Mastermind" ? "bg-purple-500/30" : "bg-yellow-500/30"
                }`} />
              </div>

              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className={`absolute inset-0 blur-2xl rounded-full ${
                    field === "Mastermind" ? "bg-purple-500/30" : "bg-red-500/30"
                  }`} />
                  <div className={`relative text-5xl md:text-6xl font-black italic ${
                    field === "Mastermind" 
                      ? "text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                      : "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                  }`}>
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

            {/* Specialization Selection */}
            <AnimatePresence mode="wait">
              {subfields.length > 0 && (
                <motion.div
                  key={field}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 mb-8"
                >
                  <label className={`text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2 ${
                    field === "Mastermind" ? "text-purple-500/60" : "text-yellow-500/60"
                  }`}>
                    <Shield className="h-3 w-3" /> 
                    {field === "Mastermind" ? "Select Challenge Level" : "Choose Your Specialization"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {subfields.map((s: string) => (
                      <button
                        key={s}
                        onClick={() => setSubfield(s)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all duration-300 ${
                          subfield === s
                            ? field === "Mastermind"
                              ? "border-purple-500 bg-purple-500/20 text-purple-400"
                              : "border-yellow-500 bg-yellow-500/20 text-yellow-400"
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

            {/* Find Battle Button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleFindBattle}
                disabled={!subfield || searching}
                className={`group relative px-10 py-4 rounded-2xl text-lg font-black italic tracking-tighter transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] flex items-center gap-3 ${
                  subfield && !searching
                    ? field === "Mastermind"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_60px_rgba(168,85,247,0.3)]"
                      : "bg-gradient-to-r from-yellow-500 to-red-500 text-black shadow-[0_0_60px_rgba(255,191,0,0.3)]"
                    : "bg-white/5 text-white/10 cursor-not-allowed border border-white/5"
                }`}
              >
                {field === "Mastermind" ? <Crown className="h-5 w-5" /> : <Swords className="h-5 w-5" />}
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
