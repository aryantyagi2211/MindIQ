import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Swords, Zap, Crown, Target, User, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FIELDS } from "@/lib/constants";
import { toast } from "sonner";

export default function BattleArena() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedField, setSelectedField] = useState("Technology");
  const [activeBattleGames, setActiveBattleGames] = useState(0);
  const [fieldPlayerCounts, setFieldPlayerCounts] = useState<Record<string, number>>({});
  const [searching, setSearching] = useState(false);
  const [myProfile, setMyProfile] = useState<any>(null);

  // Fetch user profile
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("user_id", user.id)
          .single();
        setMyProfile(profile);
      };
      fetchProfile();
    }
  }, [user]);

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
    const interval = setInterval(fetchFieldCounts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartBattle = async () => {
    if (!user) {
      toast.error("Login first to enter the battlefield");
      navigate("/auth");
      return;
    }

    setSearching(true);

    try {
      const { data: existingBattles, error: fetchError } = await supabase
        .from("battles")
        .select("*")
        .eq("status", "waiting")
        .eq("field", selectedField)
        .neq("player1_id", user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingBattles && existingBattles.length > 0) {
        const existing = existingBattles[0];
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
            field: selectedField,
            subfield: "General",
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
      setSearching(false);
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 mt-3">
          <Target className="h-3 w-3 text-yellow-400" />
          <span className="text-[10px] font-bold text-yellow-400">
            {activeBattleGames} active battle{activeBattleGames !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Two-Row Field Tabs */}
        <div className="space-y-4">
          {/* First Row - Mastermind Only (Centered) */}
          <div className="flex justify-center">
            {(() => {
              const field = "Mastermind";
              const playerCount = fieldPlayerCounts[field] || 0;
              const isSelected = selectedField === field;
              
              return (
                <button
                  key={field}
                  onClick={() => setSelectedField(field)}
                  className={`relative px-8 py-4 rounded-xl text-base font-bold border transition-all duration-300 flex items-center gap-3 ${
                    isSelected
                      ? "border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                      : "border-white/5 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {getFieldIcon(field)}
                  <span className="text-lg">{field}</span>
                  {playerCount > 0 && (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      isSelected
                        ? "bg-purple-500 text-white"
                        : "bg-white/10 text-white/30"
                    }`}>
                      {playerCount}
                    </span>
                  )}
                  <Zap className="h-4 w-4 text-purple-400 animate-pulse" />
                </button>
              );
            })()}
          </div>

          {/* Second Row - All Other Fields */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-max justify-center">
              {Object.keys(FIELDS).filter(f => f !== "Mastermind").map((field) => {
                const playerCount = fieldPlayerCounts[field] || 0;
                const isSelected = selectedField === field;
                
                return (
                  <button
                    key={field}
                    onClick={() => setSelectedField(field)}
                    className={`relative px-6 py-3 rounded-xl text-sm font-bold border transition-all duration-300 flex items-center gap-2 ${
                      isSelected
                        ? "border-yellow-500 bg-gradient-to-r from-yellow-500/20 to-red-500/20 text-yellow-400 shadow-[0_0_20px_rgba(255,191,0,0.3)]"
                        : "border-white/5 bg-white/5 text-white/40 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {getFieldIcon(field)}
                    <span>{field}</span>
                    {playerCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        isSelected
                          ? "bg-yellow-500 text-black"
                          : "bg-white/10 text-white/30"
                      }`}>
                        {playerCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mastermind Warning */}
        {selectedField === "Mastermind" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
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

        {/* Combat Arena */}
        <div className="relative rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-3xl p-8 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${
            selectedField === "Mastermind" 
              ? "from-purple-500/5 via-transparent to-pink-500/5" 
              : "from-yellow-500/5 via-transparent to-red-500/5"
          }`} />
          <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r ${
            selectedField === "Mastermind"
              ? "from-purple-500/30 via-transparent to-pink-500/30"
              : "from-yellow-500/30 via-transparent to-red-500/30"
          }`} />

          <div className="relative z-10">
            {/* Combat Cards */}
            <div className="grid grid-cols-3 items-center gap-8 mb-8">
              {/* Your Card */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className={`relative rounded-2xl border p-6 backdrop-blur-xl w-full ${
                  selectedField === "Mastermind"
                    ? "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5"
                    : "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5"
                }`}>
                  <div className="flex flex-col items-center gap-4">
                    <div className={`h-20 w-20 rounded-full border-2 flex items-center justify-center shadow-[0_0_40px_rgba(255,191,0,0.2)] overflow-hidden ${
                      selectedField === "Mastermind"
                        ? "border-purple-500/40 bg-purple-500/5"
                        : "border-yellow-500/40 bg-yellow-500/5"
                    }`}>
                      {myProfile?.avatar_url ? (
                        <img src={myProfile.avatar_url} className="h-full w-full object-cover rounded-full" />
                      ) : (
                        <User className={`h-10 w-10 ${
                          selectedField === "Mastermind" ? "text-purple-500" : "text-yellow-500"
                        }`} />
                      )}
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">
                        {myProfile?.username || "You"}
                      </h3>
                      <p className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${
                        selectedField === "Mastermind" ? "text-purple-400/60" : "text-yellow-400/60"
                      }`}>
                        Ready
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* VS Section */}
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative mb-4"
                >
                  <div className={`absolute inset-0 blur-2xl rounded-full ${
                    selectedField === "Mastermind" ? "bg-purple-500/30" : "bg-red-500/30"
                  }`} />
                  <div className={`relative text-5xl md:text-6xl font-black italic ${
                    selectedField === "Mastermind" 
                      ? "text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                      : "text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                  }`}>
                    VS
                  </div>
                </motion.div>
                
                <div className={`px-4 py-2 rounded-xl border text-center ${
                  selectedField === "Mastermind"
                    ? "border-purple-500/30 bg-purple-500/10"
                    : "border-yellow-500/30 bg-yellow-500/10"
                }`}>
                  <p className={`text-xs font-black uppercase tracking-wider ${
                    selectedField === "Mastermind" ? "text-purple-400" : "text-yellow-400"
                  }`}>
                    {selectedField}
                  </p>
                </div>
              </div>

              {/* Opponent Card */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex flex-col items-center"
              >
                <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl w-full">
                  <div className="flex flex-col items-center gap-4">
                    <motion.div
                      animate={{ borderColor: ["rgba(255,255,255,0.1)", "rgba(255,191,0,0.3)", "rgba(255,255,255,0.1)"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-20 w-20 rounded-full border-2 bg-white/5 flex items-center justify-center"
                    >
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-4xl text-white/40"
                      >
                        ?
                      </motion.span>
                    </motion.div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-black text-white/20 uppercase tracking-wider">
                        Opponent
                      </h3>
                      <p className="text-[10px] text-white/10 uppercase tracking-widest font-bold mt-1">
                        Waiting...
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Battle Button */}
            <div className="text-center">
              <button
                onClick={handleStartBattle}
                disabled={searching}
                className={`group relative px-12 py-4 rounded-2xl text-xl font-black italic tracking-tighter transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] flex items-center gap-3 mx-auto ${
                  searching
                    ? "bg-white/5 text-white/30 cursor-wait border border-white/5"
                    : selectedField === "Mastermind"
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_60px_rgba(168,85,247,0.3)]"
                      : "bg-gradient-to-r from-yellow-500 to-red-500 text-black shadow-[0_0_60px_rgba(255,191,0,0.3)]"
                }`}
              >
                {selectedField === "Mastermind" ? <Crown className="h-6 w-6" /> : <Swords className="h-6 w-6" />}
                {searching ? "SEARCHING FOR OPPONENT..." : "ENTER COMBAT"}
                {!searching && <ChevronRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />}
                {searching && (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                )}
              </button>
            </div>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em]"
        >
          Real-time player counts • Instant matchmaking • Same questions for fair competition
        </motion.p>
      </div>
    </motion.section>
  );
}
