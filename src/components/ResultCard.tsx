import { motion } from "framer-motion";
import { Brain, User } from "lucide-react";

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
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-20 text-right font-medium">{label}</span>
      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold-glow, 45 100% 60%)))`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay, duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-bold text-foreground w-7 text-right tabular-nums">{value}</span>
    </div>
  );
}

export default function ResultCard({ percentile, tier, scores, field, phase, username, avatarUrl, stats }: ResultCardProps) {
  const dimensions = [
    { label: "Logic", value: scores.logic },
    { label: "Creative", value: scores.creativity },
    { label: "Intuition", value: scores.intuition },
    { label: "EQ", value: scores.emotionalIntelligence },
    { label: "Systems", value: scores.systemsThinking },
  ];

  return (
    <div className={`${tier.cardClass} rounded-2xl w-full max-w-sm overflow-hidden`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-xs font-bold text-gradient-gold tracking-widest">MINDIQ</span>
        </div>
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary font-medium tracking-wide">
          TIER {tier.tier}
        </span>
      </div>

      {/* User info + percentile */}
      <div className="flex items-center gap-4 px-5 pb-4">
        <div className="h-12 w-12 rounded-full bg-secondary border-2 border-primary/30 flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{username || "Anonymous"}</p>
          <p className="text-xs text-muted-foreground">{field}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gradient-gold leading-none">
            {percentile}<span className="text-sm">th</span>
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">percentile</p>
        </div>
      </div>

      {/* Tier title */}
      <div className="text-center pb-4">
        <p className="text-base font-bold text-foreground">◆ {tier.title} ◆</p>
      </div>

      {/* Dimensions */}
      <div className="space-y-2 px-5 pb-4">
        {dimensions.map((d, i) => (
          <DimensionBar key={d.label} label={d.label} value={d.value} delay={phase === "done" ? 0.3 + i * 0.12 : 0} />
        ))}
      </div>

      {/* Stats row */}
      {stats && (
        <div className="flex items-center justify-around px-5 pb-4 pt-1">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{stats.attempts}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Attempts</p>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{stats.attempted}<span className="text-xs text-muted-foreground">/{stats.totalQuestions}</span></p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Answered</p>
          </div>
          <div className="h-6 w-px bg-border" />
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{stats.correct}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Correct</p>
          </div>
        </div>
      )}

      {/* Mind Match */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Mind Match</span>
          <span className="text-sm font-bold text-primary ml-auto">{scores.famousMatch}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 pb-4 text-[10px] text-muted-foreground">
        <span>#{tier.tier.toString().padStart(2, "0")}-{String(Math.floor(Math.random() * 99999)).padStart(5, "0")}</span>
        <span>mindiq.ai</span>
      </div>
    </div>
  );
}
