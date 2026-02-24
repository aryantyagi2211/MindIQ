import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FIELDS, AGE_GROUPS, DIFFICULTIES, Field } from "@/lib/constants";
import Header from "@/components/Header";
import { Brain, ChevronRight } from "lucide-react";

export default function TestSetup() {
  const navigate = useNavigate();
  const [ageGroup, setAgeGroup] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [field, setField] = useState<Field | "">("");
  const [subfield, setSubfield] = useState("");

  const canStart = ageGroup && difficulty && field && subfield;

  const handleStart = () => {
    if (!canStart) return;
    navigate("/test/take", {
      state: { ageGroup, difficulty, field, subfield },
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(45_100%_51%/0.08),transparent_70%)]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(45_100%_51%/0.06),transparent_70%)]" />
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-[radial-gradient(circle,hsl(45_100%_51%/0.04),transparent_70%)]" />
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,hsl(45_100%_51%/0.04),transparent_70%)]" />
      </div>

      <Header />

      <main className="relative container pt-24 pb-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          {/* Title */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Brain className="h-14 w-14 text-primary mx-auto drop-shadow-[0_0_20px_hsl(45_100%_51%/0.5)]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Configure Your Assessment</h1>
            <p className="text-muted-foreground text-lg">Your answers shape the AI-generated questions</p>
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-8 space-y-8"
          >
            {/* Age Group & Difficulty row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground tracking-wide">Age Group</label>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUPS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAgeGroup(a)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        ageGroup === a
                          ? "border-primary text-primary bg-primary/10 shadow-[0_0_12px_hsl(45_100%_51%/0.2)]"
                          : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground tracking-wide">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        difficulty === d
                          ? "border-primary text-primary bg-primary/10 shadow-[0_0_12px_hsl(45_100%_51%/0.2)]"
                          : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground tracking-wide">Field</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(FIELDS) as Field[]).map(f => (
                  <button
                    key={f}
                    onClick={() => { setField(f); setSubfield(""); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                      field === f
                        ? "border-primary text-primary bg-primary/10 shadow-[0_0_12px_hsl(45_100%_51%/0.2)]"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Subfield */}
            {field && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <label className="text-sm font-semibold text-foreground tracking-wide">Subfield</label>
                <div className="flex flex-wrap gap-2">
                  {FIELDS[field].map(s => (
                    <button
                      key={s}
                      onClick={() => setSubfield(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 ${
                        subfield === s
                          ? "border-primary text-primary bg-primary/10 shadow-[0_0_12px_hsl(45_100%_51%/0.2)]"
                          : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Begin button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              disabled={!canStart}
              onClick={handleStart}
              className={`w-full max-w-lg mx-auto block py-5 rounded-xl text-lg font-bold transition-all duration-300 ${
                canStart
                  ? "bg-gradient-to-r from-[hsl(40,100%,45%)] via-primary to-[hsl(40,100%,45%)] text-primary-foreground glow-gold hover:shadow-[0_0_50px_hsl(45_100%_51%/0.5)]"
                  : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
              }`}
            >
              Begin Assessment <span className="ml-2">→</span>
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
