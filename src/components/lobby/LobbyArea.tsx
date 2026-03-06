import { motion } from "framer-motion";
import { User, X, Play, Crown, Users, LogOut } from "lucide-react";
import ResultCard from "@/components/ResultCard";
import { getTier } from "@/lib/constants";

interface LobbyMember {
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  testResult?: any;
}

interface LobbyAreaProps {
  members: LobbyMember[];
  maxMembers: number;
  isHost: boolean;
  onRemoveMember: (userId: string) => void;
  onStartTest: () => void;
  onExitLobby: () => void;
  lobbyField: string;
}

export default function LobbyArea({
  members,
  maxMembers,
  isHost,
  onRemoveMember,
  onStartTest,
  onExitLobby,
  lobbyField,
}: LobbyAreaProps) {
  const emptySlots = maxMembers - members.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Users className="h-5 w-5 text-yellow-500" />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">
              Your <span className="text-yellow-500">Lobby</span>
            </h2>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em]">
              {members.length}/{maxMembers} players • {lobbyField}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isHost && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <Crown className="h-3 w-3 text-yellow-400" />
              <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Host</span>
            </div>
          )}
          <button
            onClick={onExitLobby}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <LogOut className="h-3 w-3 text-red-400" />
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
              {isHost ? "Disband" : "Leave"}
            </span>
          </button>
        </div>
      </div>

      {/* Member cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 flex-1">
        {members.map((member) => (
          <motion.div
            key={member.user_id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {isHost && member.user_id !== members[0]?.user_id && (
              <button
                onClick={() => onRemoveMember(member.user_id)}
                className="absolute -top-2 -right-2 z-20 p-1 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 transition-all"
              >
                <X className="h-3 w-3 text-red-400" />
              </button>
            )}

            {member.testResult ? (
              <div className="transform scale-[0.6] origin-top-left -mb-[40%] -mr-[40%]">
                <ResultCard
                  percentile={member.testResult.percentile}
                  tier={getTier(member.testResult.percentile)}
                  scores={{
                    logic: member.testResult.logic,
                    creativity: member.testResult.creativity,
                    intuition: member.testResult.intuition,
                    emotionalIntelligence: member.testResult.emotional_intelligence,
                    systemsThinking: member.testResult.systems_thinking,
                    overallScore: member.testResult.overall_score,
                    famousMatch: member.testResult.famous_match || "Analyzing...",
                    famousMatchReason: member.testResult.famous_match_reason || "",
                    superpowers: member.testResult.superpowers || [],
                    blindSpots: member.testResult.blind_spots || [],
                    aiInsight: member.testResult.ai_insight || "",
                  }}
                  field={member.testResult.subfield || member.testResult.field}
                  phase="done"
                  username={member.username}
                  avatarUrl={member.avatar_url}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-white/5 border-2 border-yellow-500/30 flex items-center justify-center overflow-hidden">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} className="h-full w-full object-cover rounded-full" alt="" />
                    ) : (
                      <User className="h-8 w-8 text-white/30" />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${
                    member.is_online ? "bg-green-500" : "bg-white/20"
                  }`} />
                </div>
                <p className="text-sm font-black text-white uppercase tracking-wider">{member.username}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest">No test taken yet</p>
              </div>
            )}
          </motion.div>
        ))}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <motion.div
            key={`empty-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 flex flex-col items-center justify-center gap-3 min-h-[200px]"
          >
            <div className="h-16 w-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
              <User className="h-8 w-8 text-white/10" />
            </div>
            <p className="text-[10px] text-white/15 uppercase tracking-widest font-bold">Waiting for player...</p>
          </motion.div>
        ))}
      </div>

      {/* Start Button */}
      {isHost && members.length >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 z-30"
        >
          <button
            onClick={onStartTest}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-yellow-500 text-black font-black italic text-lg tracking-tighter transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.95] shadow-[0_0_60px_rgba(255,191,0,0.4)]"
          >
            <Play className="h-6 w-6 fill-current" />
            START TEST
          </button>
        </motion.div>
      )}
    </div>
  );
}
