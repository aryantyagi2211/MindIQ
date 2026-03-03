import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Swords, Loader2, Zap } from "lucide-react";
import Header from "@/components/Header";
import ResultCard from "@/components/ResultCard";
import { toast } from "sonner";
import { getTier } from "@/lib/constants";

const TIMEOUT_SECONDS = 30;

export default function BattleMatchmaking() {
  const { battleId } = useParams<{ battleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [battle, setBattle] = useState<any>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [opponentStats, setOpponentStats] = useState<any>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [myStats, setMyStats] = useState<any>(null);
  const [matched, setMatched] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [countdown, setCountdown] = useState(TIMEOUT_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const channelRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (matched || timedOut) return;

    setCountdown(TIMEOUT_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [matched]);

  // Handle timeout — delete waiting battle and go back
  useEffect(() => {
    if (!timedOut || !battleId || !user) return;

    const cleanup = async () => {
      // Only delete if still waiting (player1 created it)
      if (battle?.player1_id === user.id && battle?.status === "waiting") {
        await supabase.from("battles").delete().eq("id", battleId);
      }
      toast.error("No opponent found. Try again!");
      navigate("/");
    };
    cleanup();
  }, [timedOut]);

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

      // Fetch my profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url, country")
        .eq("user_id", user.id)
        .single();
      setMyProfile(profile);

      // Fetch my stats
      const { data: myTestResults } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setMyStats(myTestResults);

      if (data.status === "active" && data.questions) {
        navigate(`/battle/${battleId}/fight`);
        return;
      }

      if (data.status === "matched" || data.player2_id) {
        await handleMatched(data);
      }
    };

    fetchBattle();

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
    // Stop the timer
    if (timerRef.current) clearInterval(timerRef.current);

    const opponentId = battleData.player1_id === user?.id ? battleData.player2_id : battleData.player1_id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, avatar_url, country")
      .eq("user_id", opponentId)
      .single();

    // Fetch opponent's latest test result
    const { data: oppTestResults } = await supabase
      .from("test_results")
      .select("*")
      .eq("user_id", opponentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    setOpponent(profile);
    setOpponentStats(oppTestResults);
    setMatched(true);

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

  // Timer ring progress
  const progress = countdown / TIMEOUT_SECONDS;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference * (1 - progress);

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
        <div className="max-w-7xl w-full space-y-12">
          {/* VS Cards - Using Real ResultCard Component */}
          <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-8">
            {/* My Card */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center"
            >
              {myStats && myProfile ? (
                <ResultCard
                  percentile={myStats.percentile}
                  tier={getTier(myStats.percentile)}
                  scores={{
                    logic: myStats.logic,
                    creativity: myStats.creativity,
                    intuition: myStats.intuition,
                    emotionalIntelligence: myStats.emotional_intelligence,
                    systemsThinking: myStats.systems_thinking,
                    overallScore: myStats.overall_score,
                    famousMatch: myStats.famous_match || "Analyzing...",
                    famousMatchReason: myStats.famous_match_reason || "",
                    superpowers: myStats.superpowers || [],
                    blindSpots: myStats.blind_spots || [],
                    aiInsight: myStats.ai_insight || "",
                  }}
                  field={myStats.subfield || myStats.field}
                  phase="done"
                  username={myProfile.username}
                  avatarUrl={myProfile.avatar_url}
                />
              ) : (
                <div className="w-full max-w-[690px] h-[600px] rounded-3xl bg-white/5 border border-white/10 p-6 animate-pulse flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-yellow-500 animate-spin" />
                </div>
              )}
            </motion.div>

            {/* VS Section */}
            <div className="flex flex-col items-center justify-center pt-20">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
                <div className="relative text-7xl font-black italic text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.6)]">
                  VS
                </div>
              </motion.div>

              {/* Status + Timer */}
              {!matched ? (
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="space-y-4 text-center"
                >
                  {/* Countdown ring */}
                  <div className="relative w-24 h-24 mx-auto">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                      <circle
                        cx="48" cy="48" r="40" fill="none"
                        stroke={countdown <= 10 ? "#ef4444" : "#eab308"}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - countdown / TIMEOUT_SECONDS)}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl font-black tabular-nums ${countdown <= 10 ? "text-red-400" : "text-yellow-400"}`}>
                        {countdown}
                      </span>
                      <span className="text-[7px] text-white/30 uppercase tracking-widest">sec</span>
                    </div>
                  </div>

                  <Loader2 className="h-6 w-6 text-yellow-500 animate-spin mx-auto" />
                  <p className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.5em]">
                    Scanning Neural Grid
                  </p>
                  <p className="text-[8px] text-white/20 uppercase tracking-[0.3em]">
                    {battle?.field} • {battle?.subfield}
                  </p>
                </motion.div>
              ) : generatingQuestions ? (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="space-y-3 text-center"
                >
                  <Zap className="h-8 w-8 text-yellow-500 animate-pulse mx-auto" />
                  <p className="text-[10px] font-black text-yellow-500/60 uppercase tracking-[0.5em]">
                    Generating Questions
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3 text-center"
                >
                  <Swords className="h-8 w-8 text-red-500 mx-auto" />
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.5em]">
                    Opponent Found
                  </p>
                </motion.div>
              )}
            </div>

            {/* Opponent Card */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex flex-col items-center"
            >
              {matched && opponent && opponentStats ? (
                <ResultCard
                  percentile={opponentStats.percentile}
                  tier={getTier(opponentStats.percentile)}
                  scores={{
                    logic: opponentStats.logic,
                    creativity: opponentStats.creativity,
                    intuition: opponentStats.intuition,
                    emotionalIntelligence: opponentStats.emotional_intelligence,
                    systemsThinking: opponentStats.systems_thinking,
                    overallScore: opponentStats.overall_score,
                    famousMatch: opponentStats.famous_match || "Analyzing...",
                    famousMatchReason: opponentStats.famous_match_reason || "",
                    superpowers: opponentStats.superpowers || [],
                    blindSpots: opponentStats.blind_spots || [],
                    aiInsight: opponentStats.ai_insight || "",
                  }}
                  field={opponentStats.subfield || opponentStats.field}
                  phase="done"
                  username={opponent.username}
                  avatarUrl={opponent.avatar_url}
                />
              ) : (
                <div className="w-full max-w-[690px] h-[600px] rounded-3xl bg-white/5 border border-white/10 p-6 animate-pulse">
                  <div className="space-y-6">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-24 bg-white/5 rounded animate-pulse" />
                      <div className="h-7 w-32 bg-white/5 rounded-full animate-pulse" />
                    </div>

                    {/* Score skeleton */}
                    <div className="flex flex-col items-center space-y-3 py-6">
                      <div className="h-20 w-40 bg-white/5 rounded-2xl animate-pulse" />
                      <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                      <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                    </div>

                    {/* User card skeleton */}
                    <div className="rounded-3xl bg-white/[0.03] border border-white/5 p-6 space-y-5">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-full bg-white/5 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
                          <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                        </div>
                      </div>

                      {/* Dimension bars skeleton */}
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                            <div className="flex-1 h-3 bg-white/5 rounded-full animate-pulse" />
                            <div className="h-3 w-6 bg-white/5 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>

                      {/* Mind match skeleton */}
                      <div className="pt-4 border-t border-white/5">
                        <div className="h-12 bg-white/5 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
