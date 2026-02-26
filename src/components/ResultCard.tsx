import { motion } from "framer-motion";
import { Brain, User, Zap } from "lucide-react";

interface ResultCardProps {
  percentile: number;
  tier: { tier: number; title: string; cardClass: string };
  scores: {
    logic: number;
    creativity: number;
    intuition: number;
    emotionalIntelligence: number;
    systemsThinking: number;
    overallScore: number;
    aiInsight?: string;
    famousMatch: string;
    famousMatchReason?: string;
    superpowers?: string[];
    blindSpots?: string[];
  };
  field: string;
  phase: string;
  username?: string;
  avatarUrl?: string | null;
  rank?: number;
  totalPlayers?: number;
  stats?: {
    totalQuestions: number;
    attempted: number;
    correct: number;
    attempts: number;
  };
}

function DimensionBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] uppercase tracking-widest text-white/60 w-16 font-semibold">{label}</span>
      <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-visible relative">
        <motion.div
          className="h-full rounded-full relative"
          style={{
            background: `linear-gradient(90deg, #bf953f, #fcf6ba)`,
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glowing tip */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffdb4d,0_0_15px_#ffdb4d]"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>
      </div>
      <span className="text-[11px] font-bold text-white/90 w-6 text-right tabular-nums">{value}</span>
    </div>
  );
}

export default function ResultCard({ percentile, tier, scores, field, phase, username, avatarUrl, rank, totalPlayers, stats }: ResultCardProps) {
  const dimensions = [
    { label: "LOGIC", value: scores.logic },
    { label: "CREATIVE", value: scores.creativity },
    { label: "INTUITION", value: scores.intuition },
    { label: "EQ", value: scores.emotionalIntelligence },
    { label: "SYSTEMS", value: scores.systemsThinking },
  ];

  const isExalted = rank && totalPlayers && totalPlayers > 10 && (rank / totalPlayers) <= 0.05;
  const displayRank = isExalted ? `TOP ${(Math.max(0.1, Math.round((rank / totalPlayers) * 1000) / 10))}%` : `RANK #${rank || "?"}`;

  return (
    <div className="relative w-full max-w-[690px] rounded-[2rem] p-0 overflow-hidden group shadow-[0_0_80px_rgba(0,0,0,0.9)] scale-[0.95] origin-top lg:scale-100 mx-auto transition-all duration-500">

      {/* 70% EXTENDED GOLDEN LIGHTNING BORDER WITH PULSE EFFECT */}
      <motion.div
        className="absolute inset-0 rounded-[2rem] border border-yellow-500/40 z-20 pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 65%, transparent 100%)'
        }}
        animate={{
          opacity: [0.4, 0.9, 0.4],
          boxShadow: [
            "inset 0 0 10px rgba(234,179,8,0.1)",
            "inset 0 0 25px rgba(234,179,8,0.3)",
            "inset 0 0 10px rgba(234,179,8,0.1)"
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* AMBIENT GOLDEN GLOW OVERLAY */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-yellow-500/10 via-yellow-500/5 to-transparent z-0 opacity-100" />

      <div
        className="relative z-10 bg-[#0a0a0a]/95 backdrop-blur-2xl rounded-[2rem] px-8 py-6 h-full flex flex-col items-center overflow-hidden"
      >

        {/* Header: Logo + Tier */}
        <div className="w-full flex items-center justify-between mb-4 relative z-20">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-yellow-500/70" />
            <span className="text-sm font-bold tracking-[0.2em] text-white/80 uppercase">MINDIQ</span>
          </div>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Zap className="h-3 w-3 text-yellow-500 fill-yellow-500/50" />
            <span className="text-[10px] font-bold uppercase text-white/70 tracking-wider">TIER {tier.tier} — {tier.title}</span>
          </div>
        </div>

        {/* Main Stat: Percentile section */}
        <div className="flex flex-col items-center mb-5 relative z-20 w-full">
          <div className="relative">
            <h2 className="text-6xl font-black text-yellow-500 bg-clip-text text-transparent bg-gradient-to-b from-[#fcf6ba] via-[#bf953f] to-[#aa771c] italic tracking-tighter mb-0 leading-none">
              {isExalted ? (
                <>{Math.max(0.1, Math.round((rank / totalPlayers) * 1000) / 10)}<span className="text-2xl not-italic ml-1">%</span></>
              ) : (
                <>{percentile}<span className="text-2xl not-italic ml-1">th</span></>
              )}
            </h2>
            <div className="absolute -inset-4 bg-yellow-500/10 blur-2xl rounded-full -z-10" />
          </div>

          <div className="flex items-center gap-6 w-full max-w-sm mt-1 mb-3">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 pl-[0.5em]">
              {isExalted ? "TOP %" : "PERCENTILE"}
            </span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <p className="text-lg font-black text-white italic tracking-widest mb-0.5 uppercase leading-none">
            {isExalted ? `TOP MIND` : `${rank ? `RANKED #${rank}` : `TOP ${100 - percentile}% OF MINDS`}`}
          </p>
          <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.2em]">Cognitive Evaluation Complete</p>
        </div>

        {/* User Card Area (Sleek Dark Box) */}
        <div className="w-full rounded-[1.5rem] bg-white/[0.03] border border-white/5 p-6 space-y-5 mb-4 relative overflow-hidden">
          {/* User Info */}
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center bg-white/5 overflow-hidden p-1">
              {avatarUrl ? (
                <img src={avatarUrl} alt={username} className="h-full w-full object-cover rounded-full" />
              ) : (
                <User className="h-7 w-7 text-white/20" />
              )}
            </div>
            <div>
              <p className="text-xl font-bold text-white tracking-tight leading-none mb-1.5">{username || "Anonymous"}</p>
              <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.25em]">{field}</p>
            </div>
          </div>

          {/* Dimension Bars */}
          <div className="space-y-4">
            {dimensions.map((d, i) => (
              <DimensionBar key={d.label} label={d.label} value={d.value} delay={phase === "done" ? 0.3 + i * 0.12 : 0} />
            ))}
          </div>

          {/* Mind Match Capsule */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between px-6 py-3 rounded-xl bg-white/5 border border-white/5 relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase text-white/40 tracking-[0.2em]">MIND MATCH</span>
              <span className="text-base font-black text-yellow-500/90 italic uppercase tracking-tighter shimmer-text">
                {scores.famousMatch}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
