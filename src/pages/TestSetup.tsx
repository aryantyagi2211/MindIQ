import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QUALIFICATIONS, QUALIFICATION_FIELDS, DIFFICULTIES, type Qualification } from "@/lib/constants";
import Header from "@/components/Header";
import { Brain, ChevronRight, Zap, GraduationCap, Construction } from "lucide-react";
import { toast } from "sonner";

export default function TestSetup() {
  const navigate = useNavigate();
  const [qualification, setQualification] = useState<Qualification>("Secondary School");
  const [difficulty, setDifficulty] = useState("Basic");
  const [stream, setStream] = useState("");

  const availableStreams = QUALIFICATION_FIELDS[qualification] || [];

  // Reset stream when qualification changes
  const handleQualificationChange = (q: Qualification) => {
    setQualification(q);
    setStream("");
  };

  const canStart = qualification && difficulty;

  const handleStart = () => {
    if (!canStart) return;
    navigate("/test/take", {
      state: {
        qualification,
        difficulty,
        stream: stream || undefined,
        examType: "mcq"
      }
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden font-sans select-none">
      {/* EXTREME FUTURISTIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#000000]/60 backdrop-blur-[2px]" />

        {/* Continuous Dynamic Atmospheric Glows */}
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], x: [-40, 40, -40], y: [-40, 40, -40] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-yellow-500/5 blur-[220px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], x: [60, -60, 60], y: [60, -60, 60] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-yellow-600/10 blur-[220px] rounded-full"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.04)_0%,transparent_80%)]" />
        {/* High-Contrast Stardust Layer */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
      </div>

      <Header />

      <main className="relative container pt-12 pb-2 max-w-6xl z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10px)]">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4 flex flex-col items-center">
          {/* Header Section */}
          <div className="text-center space-y-1">
            <motion.div className="relative inline-block mb-1">
              <div className="absolute inset-0 bg-yellow-500/40 blur-3xl rounded-full scale-110 animate-pulse" />
              <Brain className="h-10 w-10 text-yellow-500 relative z-10 drop-shadow-[0_0_20px_rgba(255,191,0,0.9)]" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
              Configure <span className="text-yellow-500">Your</span> Assessment
            </h1>
            <p className="text-white/20 text-[8px] font-black tracking-[1em] uppercase w-full pl-[1em]">
              Neural Link Initialized
            </p>
          </div>

          {/* CONFIGURATION BOX */}
          <div className="flex justify-center w-full max-w-2xl mx-auto">
            {/* Box 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="w-full rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-[60px] p-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.02),0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-50" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="relative z-10 space-y-6">
                {/* Qualification Level */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" />
                    <GraduationCap className="h-3 w-3" /> Qualification Level
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {QUALIFICATIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => handleQualificationChange(q)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${qualification === q
                          ? "border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,191,0,0.5)]"
                          : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/80"
                          }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" /> Neural Complexity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTIES.map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${difficulty === d
                          ? "border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,191,0,0.5)]"
                          : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/80"
                          }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cognitive Sector (now Studies / Stream) */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" />
                    Studies / Stream
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <button
                      onClick={() => setStream("")}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${stream === ""
                        ? "border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,191,0,0.5)]"
                        : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/80"
                        }`}
                    >
                      All Subjects
                    </button>
                    {availableStreams.map(s => (
                      <button
                        key={s}
                        onClick={() => setStream(s)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${stream === s
                          ? "border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,191,0,0.5)]"
                          : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/80"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* INITIATE BUTTON */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full max-w-lg pt-2">
            <button
              disabled={!canStart}
              onClick={handleStart}
              className={`w-full group relative py-5 rounded-2xl text-xl font-black italic tracking-tighter transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] ${canStart
                ? "bg-yellow-500 text-black shadow-[0_0_120px_rgba(255,191,0,0.6)]"
                : "bg-white/5 text-white/5 cursor-not-allowed border border-white/5"
                }`}
            >
              <div className="flex items-center justify-center gap-3">
                {canStart ? (
                  <span className="flex items-center gap-3">
                    <Zap className="h-5 w-5 fill-current animate-pulse" />
                    ASSESSMENT PAPER
                  </span>
                ) : (
                  "CALIBRATION INCOMPLETE"
                )}
                <ChevronRight className={`h-6 w-6 transition-transform duration-300 ${canStart ? "group-hover:translate-x-3" : ""}`} />
              </div>
            </button>
            {!canStart && (
              <p className="text-center mt-4 text-[7px] font-black text-white/10 uppercase tracking-[1em] pl-[1em] w-full">System Awaiting Data Sync</p>
            )}
          </motion.div>
        </motion.div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 215, 0, 0.3); border-radius: 10px; }
        body { overflow-x: hidden; }
      `}</style>
    </div>
  );
}
