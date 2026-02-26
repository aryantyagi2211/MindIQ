import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FIELDS, AGE_GROUPS, DIFFICULTIES, Field } from "@/lib/constants";
import Header from "@/components/Header";
import { Brain, ChevronRight, ListChecks, MessageSquareText, Sparkles, Zap } from "lucide-react";

const EXAM_TYPES = [
  { key: "mcq", label: "MCQ", icon: ListChecks, desc: "Multiple choice questions" },
  { key: "qa", label: "Q&A", icon: MessageSquareText, desc: "Open-ended written answers" },
] as const;

type ExamType = typeof EXAM_TYPES[number]["key"];

export default function TestSetup() {
  const navigate = useNavigate();
  const [ageGroup, setAgeGroup] = useState("18-24");
  const [difficulty, setDifficulty] = useState("Standard");
  const [field, setField] = useState<Field | "">("Technology");
  const [subfield, setSubfield] = useState("");
  const [examType, setExamType] = useState<ExamType>("mcq");

  const canStart = ageGroup && difficulty && field && subfield;

  const handleStart = () => {
    if (!canStart) return;
    navigate("/test/take", {
      state: { ageGroup, difficulty, field, subfield, examType },
    });
  };

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      {/* EXTREME FUTURISTIC BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep Gradient Base */}
        <div className="absolute inset-0 bg-[#000000]" />

        {/* Continuous Dynamic Atmospheric Glows */}
        <motion.div
          animate={{
            opacity: [0.15, 0.4, 0.15],
            x: [-40, 40, -40],
            y: [-40, 40, -40],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-yellow-500/5 blur-[220px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2],
            x: [60, -60, 60],
            y: [60, -60, 60],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-yellow-600/10 blur-[220px] rounded-full"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.04)_0%,transparent_80%)]" />

        {/* SVG NEURAL ARCHITECTURE / CHIP MOTHERBOARD */}
        <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="glow-master">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="trace-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0" />
              <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
            <mask id="chip-mask">
              <rect x="470" y="100" width="60" height="800" fill="white" />
            </mask>
          </defs>

          {/* Main Circuit Traces (Left & Right - 5 Rows) */}
          {[180, 330, 500, 670, 820].map((y, i) => {
            const isEven = i % 2 === 0;
            const zig = isEven ? 60 : -60;

            // Left Path Data
            const lP1 = { x: 0, y: y };
            const lP2 = { x: 140, y: y };
            const lP3 = { x: 200, y: y + zig };
            const lP4 = { x: 340, y: y + zig };
            const lP5 = { x: 400, y: y };
            const lP6 = { x: 480, y: y };

            const leftPath = `M ${lP1.x} ${lP1.y} H ${lP2.x} L ${lP3.x} ${lP3.y} H ${lP4.x} L ${lP5.x} ${lP5.y} H ${lP6.x}`;

            // Right Path Data
            const rP1 = { x: 1000, y: y };
            const rP2 = { x: 860, y: y };
            const rP3 = { x: 800, y: y - zig };
            const rP4 = { x: 660, y: y - zig };
            const rP5 = { x: 600, y: y };
            const rP6 = { x: 520, y: y };

            const rightPath = `M ${rP1.x} ${rP1.y} H ${rP2.x} L ${rP3.x} ${rP3.y} H ${rP4.x} L ${rP5.x} ${rP5.y} H ${rP6.x}`;

            return (
              <g key={y}>
                {/* Micro-Traces (Secondary detail) */}
                <path d={`M ${lP2.x} ${lP2.y} v ${zig / 2} h 40`} stroke="#FFD700" strokeWidth="0.2" fill="none" opacity="0.05" />
                <path d={`M ${rP2.x} ${rP2.y} v ${-zig / 2} h -40`} stroke="#FFD700" strokeWidth="0.2" fill="none" opacity="0.05" />

                {/* Static Trace Lines */}
                <path d={leftPath} stroke="#FFD700" strokeWidth="0.4" fill="none" opacity="0.1" />
                <path d={rightPath} stroke="#FFD700" strokeWidth="0.4" fill="none" opacity="0.1" />

                {/* Contact Pads */}
                {[lP2, lP3, lP4, lP5].map((p, idx) => (
                  <circle key={`l-${idx}`} cx={p.x} cy={p.y} r="2" fill="#FFD700" opacity="0.2" />
                ))}
                {[rP2, rP3, rP4, rP5].map((p, idx) => (
                  <circle key={`r-${idx}`} cx={p.x} cy={p.y} r="2" fill="#FFD700" opacity="0.2" />
                ))}

                {/* Traveling High-Voltage Bolts */}
                <motion.path
                  d={leftPath} stroke="#FFD700" strokeWidth="1.2" fill="none" filter="url(#glow-master)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.6,
                    times: [0, 0.15, 1],
                    repeatDelay: 1 + Math.random()
                  }}
                />
                <motion.path
                  d={rightPath} stroke="#FFD700" strokeWidth="1.2" fill="none" filter="url(#glow-master)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.6 + 1.25,
                    times: [0, 0.15, 1],
                    repeatDelay: 1 + Math.random()
                  }}
                />
              </g>
            );
          })}

          {/* high-energy jumps bridging the mid-gap */}
          {[180, 330, 500, 670, 820].map((y, i) => (
            <motion.path
              key={`bridge-${y}`}
              d={`M 480 ${y} Q 500 ${y - 20} 520 ${y}`}
              stroke="#FFD700" strokeWidth="1.5" fill="none" filter="url(#glow-master)"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: [0, 1, 0], pathLength: [0, 1] }}
              transition={{
                duration: 0.25,
                repeat: Infinity,
                repeatDelay: 1.5 + Math.random() * 2,
                delay: i * 0.4
              }}
            />
          ))}

          {/* Golden Photon Dust */}
          {[...Array(15)].map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r={Math.random() * 1.2}
              fill="#FFD700"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [0.4, 1.1, 0.4],
                y: [0, -100]
              }}
              transition={{ duration: Math.random() * 8 + 6, repeat: Infinity, delay: Math.random() * 10 }}
            />
          ))}
        </svg>

        {/* High-Contrast Stardust Layer */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay" />
      </div>

      <Header />

      <main className="relative container pt-12 pb-2 max-w-6xl z-10 flex flex-col items-center justify-center min-h-[calc(100vh-10px)]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-4 flex flex-col items-center"
        >
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

          {/* TWO BOXES DESIGN (GLASSMORPHISM) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-5xl">

            {/* Box 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-[60px] p-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.02),0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group"
            >
              {/* Inner Glow Layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-50" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="relative z-10 space-y-6">
                <div className="space-y-4">
                  <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" /> User Cycle
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map(a => (
                      <button
                        key={a}
                        onClick={() => setAgeGroup(a)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${ageGroup === a
                          ? "border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,191,0,0.5)]"
                          : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/80"
                          }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

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

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse" /> Cognitive Sector
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(FIELDS) as Field[]).map(f => (
                      <button
                        key={f}
                        onClick={() => { setField(f); setSubfield(""); }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all duration-300 ${field === f
                          ? "border-yellow-500 bg-yellow-500 text-black shadow-[0_0_20px_rgba(255,191,0,0.5)]"
                          : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/80"
                          }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Box 2 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-[60px] p-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.02),0_20px_40px_rgba(0,0,0,0.4)] relative overflow-hidden flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-50" />
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />

              <div className="relative z-10 flex-1 space-y-6">
                <AnimatePresence mode="wait">
                  {field ? (
                    <motion.div
                      key={field}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em]">Specialization Logic</label>
                      <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {FIELDS[field].map(s => (
                          <button
                            key={s}
                            onClick={() => setSubfield(s)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all duration-300 ${subfield === s
                              ? "border-yellow-500 bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "border-white/5 bg-white/5 text-white/20 hover:border-white/20 hover:text-white/70"
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-white/5 italic text-[10px] border border-dashed border-white/5 rounded-2xl">
                      Select domain to expand sub-neural networks
                    </div>
                  )}
                </AnimatePresence>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-yellow-500/60 uppercase tracking-[0.4em]">Assessment Logic</label>
                  <div className="grid grid-cols-2 gap-3">
                    {EXAM_TYPES.map(et => {
                      const Icon = et.icon;
                      const isActive = examType === et.key;
                      return (
                        <button
                          key={et.key}
                          onClick={() => setExamType(et.key)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isActive
                            ? "border-yellow-500/30 bg-yellow-500/5"
                            : "border-white/5 bg-white/5 hover:border-white/10"
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${isActive ? "bg-yellow-500/20" : "bg-white/5"}`}>
                            <Icon className={`h-4 w-4 ${isActive ? "text-yellow-500" : "text-white/20"}`} />
                          </div>
                          <div className="text-left">
                            <p className={`font-black text-[9px] ${isActive ? "text-yellow-400" : "text-white/40"}`}>{et.label}</p>
                            <p className="text-[6px] text-white/10 uppercase font-bold tracking-widest">{et.desc.split(' ')[0]}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* INITIATE BUTTON */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-lg pt-2"
          >
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
                    INITIATE NEURAL LINK
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
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 1;
          background: linear-gradient(0deg, rgba(255,191,0,0) 0%, rgba(255,191,0,0.02) 50%, rgba(255,191,0,0) 100%);
          opacity: 0.1;
          position: absolute;
          bottom: 100%;
          animation: scanline 10s linear infinite;
        }
        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }
        body { overflow-x: hidden; }
      `}</style>
      <div className="scanline pointer-events-none" />
    </div>
  );
}
