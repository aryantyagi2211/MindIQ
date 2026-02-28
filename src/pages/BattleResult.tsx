import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Swords, User, Trophy, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";

export default function BattleResult() {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [player1Profile, setPlayer1Profile] = useState<any>(null);
  const [player2Profile, setPlayer2Profile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!battleId || !user) return;

    const fetchResult = async () => {
      const { data } = await supabase
        .from("battles")
        .select("*")
        .eq("id", battleId)
        .single();

      if (!data) {
        navigate("/");
        return;
      }

      setBattle(data);

      // If not completed yet, subscribe for updates
      if (data.status !== "completed") {
        const channel = supabase
          .channel(`battle-result-${battleId}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "battles", filter: `id=eq.${battleId}` },
            async (payload) => {
              const updated = payload.new as any;
              setBattle(updated);
              if (updated.status === "completed") {
                await fetchProfiles(updated);
              }
            }
          )
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      }

      await fetchProfiles(data);
    };

    const fetchProfiles = async (battleData: any) => {
      const [{ data: p1 }, { data: p2 }] = await Promise.all([
        supabase.from("profiles").select("username, avatar_url, country").eq("user_id", battleData.player1_id).single(),
        supabase.from("profiles").select("username, avatar_url, country").eq("user_id", battleData.player2_id).single(),
      ]);
      setPlayer1Profile(p1);
      setPlayer2Profile(p2);
      setLoading(false);
    };

    fetchResult();
  }, [battleId, user]);

  if (loading || !battle || battle.status !== "completed") {
    return (
      <div className="min-h-screen bg-[#010101] text-white flex flex-col items-center justify-center gap-6">
        <Header />
        <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">
          Waiting for opponent to finish...
        </p>
      </div>
    );
  }

  const isPlayer1 = battle.player1_id === user?.id;
  const myScore = isPlayer1 ? battle.player1_score : battle.player2_score;
  const oppScore = isPlayer1 ? battle.player2_score : battle.player1_score;
  const myProfile = isPlayer1 ? player1Profile : player2Profile;
  const oppProfile = isPlayer1 ? player2Profile : player1Profile;
  const iWon = battle.winner_id === user?.id;
  const isDraw = !battle.winner_id;

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#000000]" />
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className={`absolute inset-0 ${iWon ? "bg-yellow-500/5" : isDraw ? "bg-white/5" : "bg-red-500/5"} blur-[200px]`}
        />
      </div>

      <Header />

      <main className="relative container pt-24 pb-16 z-10 max-w-3xl flex flex-col items-center">
        {/* Winner Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="text-center space-y-4 mb-12"
        >
          {isDraw ? (
            <>
              <Swords className="h-16 w-16 text-white/40 mx-auto" />
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white/60">Draw</h1>
            </>
          ) : iWon ? (
            <>
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Crown className="h-20 w-20 text-yellow-500 mx-auto drop-shadow-[0_0_40px_rgba(255,191,0,0.5)]" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
                <span className="text-yellow-500">Victory</span>
              </h1>
            </>
          ) : (
            <>
              <Trophy className="h-16 w-16 text-red-400/60 mx-auto" />
              <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-red-400/60">Defeated</h1>
            </>
          )}
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">
            {battle.field} • {battle.subfield}
          </p>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 items-center gap-6 w-full mb-12">
          {/* My Card */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex flex-col items-center gap-4 p-6 rounded-3xl border ${
              iWon ? "border-yellow-500/30 bg-yellow-500/5" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center overflow-hidden ${
              iWon ? "border-yellow-500/50 shadow-[0_0_30px_rgba(255,191,0,0.3)]" : "border-white/10"
            }`}>
              {myProfile?.avatar_url ? (
                <img src={myProfile.avatar_url} className="h-full w-full object-cover rounded-full" />
              ) : (
                <User className="h-8 w-8 text-white/30" />
              )}
            </div>
            <span className="text-sm font-black text-white uppercase tracking-wider">{myProfile?.username || "You"}</span>
            <div className="text-center">
              <p className={`text-4xl font-black italic tracking-tighter ${iWon ? "text-yellow-500" : "text-white/60"}`}>
                {myScore}%
              </p>
              <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Score</p>
            </div>
            {iWon && <Crown className="h-5 w-5 text-yellow-500" />}
          </motion.div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <div className="text-4xl font-black italic text-red-500/40">VS</div>
          </div>

          {/* Opponent Card */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex flex-col items-center gap-4 p-6 rounded-3xl border ${
              !iWon && !isDraw ? "border-red-500/30 bg-red-500/5" : "border-white/5 bg-white/[0.02]"
            }`}
          >
            <div className={`h-16 w-16 rounded-full border-2 flex items-center justify-center overflow-hidden ${
              !iWon && !isDraw ? "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "border-white/10"
            }`}>
              {oppProfile?.avatar_url ? (
                <img src={oppProfile.avatar_url} className="h-full w-full object-cover rounded-full" />
              ) : (
                <User className="h-8 w-8 text-white/30" />
              )}
            </div>
            <span className="text-sm font-black text-white uppercase tracking-wider">{oppProfile?.username || "Opponent"}</span>
            <div className="text-center">
              <p className={`text-4xl font-black italic tracking-tighter ${!iWon && !isDraw ? "text-red-400" : "text-white/60"}`}>
                {oppScore}%
              </p>
              <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Score</p>
            </div>
            {!iWon && !isDraw && <Crown className="h-5 w-5 text-red-400" />}
          </motion.div>
        </div>

        {/* Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-4"
        >
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] text-center">Answer Breakdown</h3>
          <div className="grid gap-2">
            {(battle.questions as any[])?.map((q: any, i: number) => {
              const myAns = isPlayer1
                ? (battle.player1_answers as any[])?.[i]
                : (battle.player2_answers as any[])?.[i];
              const oppAns = isPlayer1
                ? (battle.player2_answers as any[])?.[i]
                : (battle.player1_answers as any[])?.[i];
              const correct = q.correctAnswer?.charAt(0);
              const myCorrect = myAns?.charAt(0) === correct;
              const oppCorrect = oppAns?.charAt(0) === correct;

              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                  <span className="text-[9px] font-black text-white/20 w-6">Q{i + 1}</span>
                  <div className="flex-1 text-xs text-white/40 truncate">{q.question}</div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black ${myCorrect ? "text-green-400" : "text-red-400"}`}>
                      {myCorrect ? "✓" : "✗"}
                    </span>
                    <span className="text-[8px] text-white/10">|</span>
                    <span className={`text-[9px] font-black ${oppCorrect ? "text-green-400" : "text-red-400"}`}>
                      {oppCorrect ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => navigate("/")}
          className="mt-12 px-8 py-4 rounded-2xl bg-yellow-500 text-black font-black italic tracking-tighter text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <ArrowLeft className="h-5 w-5" />
          BACK TO BASE
        </motion.button>
      </main>
    </div>
  );
}
