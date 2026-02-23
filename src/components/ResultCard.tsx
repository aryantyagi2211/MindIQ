import { motion } from "framer-motion";
import { Brain } from "lucide-react";

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
    aiInsight: string;
    famousMatch: string;
    famousMatchReason: string;
    superpowers: string[];
    blindSpots: string[];
  };
  field: string;
  phase: string;
}

function DimensionBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 text-right">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ delay, duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-bold text-foreground w-8">{value}</span>
    </div>
  );
}

export default function ResultCard({ percentile, tier, scores, field, phase }: ResultCardProps) {
  const dimensions = [
    { label: "Logic", value: scores.logic },
    { label: "Creativity", value: scores.creativity },
    { label: "Intuition", value: scores.intuition },
    { label: "EQ", value: scores.emotionalIntelligence },
    { label: "Systems", value: scores.systemsThinking },
  ];

  return (
    <div className={`${tier.cardClass} rounded-2xl p-8 w-full max-w-md space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-gradient-gold">MINDIQ</span>
        </div>
        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-secondary">
          Tier {tier.tier}
        </span>
      </div>

      {/* Percentile */}
      <div className="text-center space-y-1">
        <p className="text-6xl font-bold text-gradient-gold">
          {percentile}<span className="text-2xl">th</span>
        </p>
        <p className="text-lg text-muted-foreground">Percentile</p>
        <p className="text-xl font-bold text-foreground">◆ {tier.title} ◆</p>
      </div>

      {/* Dimensions */}
      <div className="space-y-3">
        {dimensions.map((d, i) => (
          <DimensionBar key={d.label} label={d.label} value={d.value} delay={phase === "done" ? 0.5 + i * 0.2 : 0} />
        ))}
      </div>

      {/* Info */}
      <div className="space-y-2 text-sm">
        <p className="text-muted-foreground">
          Rarer than {percentile}% of <span className="text-foreground font-medium">{field}</span> minds
        </p>
        <p className="text-foreground">
          Mind Match: <span className="font-bold text-primary">{scores.famousMatch}</span>
        </p>
        <p className="text-xs text-muted-foreground italic">{scores.famousMatchReason}</p>
      </div>

      {/* AI Insight */}
      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
            {scores.aiInsight}
          </p>
        </motion.div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>#{tier.tier.toString().padStart(2, "0")}-{String(Math.floor(Math.random() * 99999)).padStart(5, "0")}</span>
        <span>mindiq.ai</span>
      </div>
    </div>
  );
}
