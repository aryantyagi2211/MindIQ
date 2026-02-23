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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center space-y-2">
            <Brain className="h-10 w-10 text-primary mx-auto" />
            <h1 className="text-3xl font-bold">Configure Your Assessment</h1>
            <p className="text-muted-foreground">Your answers shape the AI-generated questions</p>
          </div>

          {/* Age Group */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Age Group</label>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map(a => (
                <Button key={a} variant={ageGroup === a ? "default" : "outline"} size="sm" onClick={() => setAgeGroup(a)}>
                  {a}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Difficulty</label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map(d => (
                <Button key={d} variant={difficulty === d ? "default" : "outline"} size="sm" onClick={() => setDifficulty(d)}>
                  {d}
                </Button>
              ))}
            </div>
          </div>

          {/* Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Field</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(FIELDS) as Field[]).map(f => (
                <Button
                  key={f}
                  variant={field === f ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setField(f); setSubfield(""); }}
                >
                  {f}
                </Button>
              ))}
            </div>
          </div>

          {/* Subfield */}
          {field && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <label className="text-sm font-medium text-foreground">Subfield</label>
              <div className="flex flex-wrap gap-2">
                {FIELDS[field].map(s => (
                  <Button key={s} variant={subfield === s ? "default" : "outline"} size="sm" onClick={() => setSubfield(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          <Button className="w-full py-6 text-lg glow-gold" disabled={!canStart} onClick={handleStart}>
            Begin Assessment
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
