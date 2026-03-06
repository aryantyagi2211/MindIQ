import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import { Trophy, Crown, Medal, User, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LobbyMemberResult {
  user_id: string;
  username: string;
  avatar_url: string | null;
  scores: any;
  completed_at: string | null;
  rank: number;
}

export default function LobbyResults() {
  const { lobbyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const state = location.state as {
    questions: any[];
    answers: string[];
    timeData: number[];
    stream?: string;
    qualification?: string;
    difficulty?: string;
  } | null;

  const [memberResults, setMemberResults] = useState<LobbyMemberResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(true);

  useEffect(() => {
    if (!lobbyId || !user || !state) return;

    const scoreAndFetch = async () => {
      try {
        // Score current user's answers
        const { data: scoreData, error: scoreError } = await supabase.functions.invoke("score-answers", {
          body: {
            questions: state.questions,
            answers: state.answers,
            timeData: state.timeData,
            stream: state.stream,
            qualification: state.qualification
          }
        });

        if (scoreError) throw scoreError;

        // Update user's result with scores
        await supabase
          .from("lobby_test_results" as any)
          .update({
            scores: scoreData.scores,
            completed_at: new Date().toISOString()
          } as any)
          .eq("lobby_id", lobbyId)
          .eq("user_id", user.id);

        setScoring(false);

        // Fetch all member results
        await fetchResults();

        // Subscribe to real-time updates
        const channel = supabase
          .channel(`lobby-results-${lobbyId}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "lobby_test_results", filter: `lobby_id=eq.${lobbyId}` },
            () => fetchResults()
          )
          .subscribe();

        return () => { supabase.removeChannel(channel); };
      } catch (error) {
        console.error("Error scoring answers:", error);
        toast.error("Failed to score answers");
      } finally {
        setLoading(false);
      }
    };

    scoreAndFetch();
  }, [lobbyId, user, state]);

  const fetchResults = async () => {
    if (!lobbyId) return;

    try {
      // Get all test results for this lobby
      const { data: results } = await supabase
        .from("lobby_test_results" as any)
        .select("user_id, scores, completed_at")
        .eq("lobby_id", lobbyId) as any;

      if (!results || results.length === 0) {
        setMemberResults([]);
        return;
      }

      // Get user profiles
      const userIds = results.map((r: any) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url")
        .in("user_id", userIds) as any;

      // Combine results with profiles
      const combined = results
        .map((result: any) => {
          const profile = profiles?.find((p: any) => p.user_id === result.user_id);
          return {
            user_id: result.user_id,
            username: profile?.username || "Unknown",
            avatar_url: profile?.avatar_url || null,
            scores: result.scores,
            completed_at: result.completed_at
          };
        })
        .filter((r: any) => r.scores && r.completed_at) // Only show completed results
        .sort((a: any, b: any) => (b.scores?.overallScore || 0) - (a.scores?.overallScore || 0))
        .map((r: any, index: number) => ({ ...r, rank: index + 1 }));

      setMemberResults(combined);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  if (loading || scoring) {
    return (
      <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[#000000]" />
          <motion.div
            animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center space-y-6"
        >
          <Loader2 className="h-16 w-16 text-yellow-500 animate-spin mx-auto" />
          <h2 className="text-2xl font-black italic text-white">
            {scoring ? "Analyzing Your Performance..." : "Loading Results..."}
          </h2>
          <p className="text-white/40 text-sm">Please wait</p>
        </motion.div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-700" />;
    return <Trophy className="h-5 w-5 text-white/30" />;
  };

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      {/* Background */}
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
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-yellow-600/10 blur-[220px] rounded-full"
        />
      </div>

      <Header />

      <main className="relative container pt-24 pb-16 z-10 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-yellow-500/40 blur-3xl rounded-full animate-pulse" />
              <Trophy className="h-16 w-16 text-yellow-500 relative z-10 mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
              Lobby <span className="text-yellow-500">Rankings</span>
            </h1>
            <p className="text-white/40 text-sm uppercase tracking-widest">
              {memberResults.length} {memberResults.length === 1 ? "Player" : "Players"} Completed
            </p>
          </motion.div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {memberResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-white/40 text-sm">Waiting for players to complete the test...</p>
            </motion.div>
          ) : (
            memberResults.map((member, index) => (
              <motion.div
                key={member.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border p-6 ${
                  member.user_id === user?.id
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-16 flex flex-col items-center">
                    {getRankIcon(member.rank)}
                    <span className="text-2xl font-black text-white mt-2">#{member.rank}</span>
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-white/5 border-2 border-yellow-500/30 flex items-center justify-center overflow-hidden">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <User className="h-8 w-8 text-white/30" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-black text-white truncate">{member.username}</h3>
                      {member.user_id === user?.id && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-white/40">Score: </span>
                        <span className="text-yellow-500 font-bold">{member.scores?.overallScore || 0}</span>
                      </div>
                      <div>
                        <span className="text-white/40">Accuracy: </span>
                        <span className="text-white font-bold">
                          {member.scores?.correctCount || 0}/{member.scores?.totalQuestions || 15}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score Bars */}
                  <div className="hidden md:block flex-shrink-0 w-48">
                    <div className="space-y-1">
                      {["logic", "creativity", "intuition"].map((dim) => (
                        <div key={dim} className="flex items-center gap-2">
                          <span className="text-[9px] text-white/30 uppercase w-16 truncate">{dim}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500"
                              style={{ width: `${member.scores?.[dim] || 0}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate("/lobby")}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-yellow-500 text-black font-black italic text-lg tracking-tighter hover:bg-yellow-400 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Lobby
          </button>
        </motion.div>
      </main>
    </div>
  );
}
