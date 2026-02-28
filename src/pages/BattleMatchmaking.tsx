import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Swords, User, Loader2, Zap } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

export default function BattleMatchmaking() {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [matched, setMatched] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!battleId || !user) return;

    const fetchBattle = async () => {
      const { data } = await supabase
        .from("battles")
        .select("*")
        .eq("id", battleId)
        .single();

      if (!data) {
        toast.error("Battle not found");
        navigate("/");
        return;
      }

      setBattle(data);

      if (data.status === "active" && data.questions) {
        navigate(`/battle/${battleId}/fight`);
        return;
      }

      if (data.status === "matched" || data.player2_id) {
        await handleMatched(data);
      }
    };

    fetchBattle();

    // Subscribe to battle changes
    const channel = supabase
      .channel(`battle-${battleId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "battles", filter: `id=eq.${battleId}` },
        async (payload) => {
          const updated = payload.new as any;
          setBattle(updated);

          if (updated.status === "active" && updated.questions) {
            navigate(`/battle/${battleId}/fight`);
          } else if (updated.status === "matched" && updated.player2_id) {
            await handleMatched(updated);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [battleId, user]);

  const handleMatched = async (battleData: any) => {
    // Fetch opponent profile
    const opponentId = battleData.player1_id === user?.id ? battleData.player2_id : battleData.player1_id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, country")
      .eq("user_id", opponentId)
      .single();

    setOpponent(profile);
    setMatched(true);

    // If player1, generate questions
    if (battleData.player1_id === user?.id && !battleData.questions) {
      setGeneratingQuestions(true);
      try {
        const { data: qData, error } = await supabase.functions.invoke("generate-questions", {
          body: {
            qualification: battleData.qualification,
            field: battleData.field,
            subfield: battleData.subfield,
            difficulty: battleData.difficulty,
            examType: "mcq",
          },
        });

        if (error) throw error;

        // Store questions and set status to active (only 10 questions for battle)
        const battleQuestions = (qData.questions || []).slice(0, 10);
        await supabase
          .from("battles")
          .update({ questions: battleQuestions, status: "active" })
          .eq("id", battleData.id);
      } catch (err) {
        console.error("Failed to generate questions:", err);
        toast.error("Failed to generate battle questions");
      }
      setGeneratingQuestions(false);
    }
  };

  const isPlayer1 = battle?.player1_id === user?.id;

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#000000]" />
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], x: [-40, 40, -40] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-yellow-500/5 blur-[220px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], x: [60, -60, 60] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-red-600/10 blur-[220px] rounded-full"
        />
      </div>

      <Header />

      <main className="relative container pt-24 pb-16 z-10 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="max-w-2xl w-full text-center space-y-12">
          {/* VS Cards */}
          <div className="grid grid-cols-3 items-center gap-6">
            {/* You */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="h-24 w-24 rounded-full border-2 border-yellow-500/40 bg-yellow-500/5 flex items-center justify-center shadow-[0_0_40px_rgba(255,191,0,0.2)]">
                <User className="h-10 w-10 text-yellow-500" />
              </div>
              <span className="text-lg font-black text-white uppercase tracking-wider">You</span>
            </motion.div>

            {/* VS */}
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
              <div className="relative text-6xl font-black italic text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]">
                VS
              </div>
            </motion.div>

            {/* Opponent */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              {matched && opponent ? (
                <>
                  <div className="h-24 w-24 rounded-full border-2 border-red-500/40 bg-red-500/5 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)] overflow-hidden">
                    {opponent.avatar_url ? (
                      <img src={opponent.avatar_url} className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <User className="h-10 w-10 text-red-400" />
                    )}
                  </div>
                  <span className="text-lg font-black text-white uppercase tracking-wider">{opponent.username}</span>
                </>
              ) : (
                <>
                  <motion.div
                    animate={{ borderColor: ["rgba(255,255,255,0.1)", "rgba(255,191,0,0.3)", "rgba(255,255,255,0.1)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-24 w-24 rounded-full border-2 bg-white/5 flex items-center justify-center"
                  >
                    <motion.span
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-4xl"
                    >
                      ?
                    </motion.span>
                  </motion.div>
                  <span className="text-lg font-black text-white/20 uppercase tracking-wider">Searching...</span>
                </>
              )}
            </motion.div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            {!matched ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="space-y-3"
              >
                <Loader2 className="h-8 w-8 text-yellow-500 animate-spin mx-auto" />
                <p className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.5em]">
                  Scanning Neural Grid For Opponent
                </p>
                <p className="text-[8px] text-white/20 uppercase tracking-[0.3em]">
                  {battle?.field} • {battle?.subfield}
                </p>
              </motion.div>
            ) : generatingQuestions ? (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="space-y-3"
              >
                <Zap className="h-8 w-8 text-yellow-500 animate-pulse mx-auto" />
                <p className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.5em]">
                  Generating Battle Questions
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <Swords className="h-8 w-8 text-red-500 mx-auto" />
                <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.5em]">
                  Opponent Found — Preparing Arena
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
