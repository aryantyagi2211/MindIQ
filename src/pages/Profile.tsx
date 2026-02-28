import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getTier } from "@/lib/constants";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Brain, User, Link as LinkIcon, Save, Edit2, X, Upload, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [averages, setAverages] = useState<any>(null);
  const [globalRank, setGlobalRank] = useState<number | null>(null);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editLinks, setEditLinks] = useState<{ label: string, url: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) navigate("/auth");
      };
      checkAuth();
      return;
    }

    const fetchProfileData = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (p) {
        const profileData = p as any;
        setProfile(profileData);
        setEditUsername(profileData.username || "");
        setEditAvatar(profileData.avatar_url || "");
        setEditLinks(profileData.links || []);
      }

      const { data: r } = await supabase
        .from("test_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const userResults = r || [];
      setResults(userResults);

      const hasPlayed = userResults.length > 0;
      const count = hasPlayed ? userResults.length : 1;

      const avg = {
        percentile: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.percentile, 0) / count) : 0,
        overall_score: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.overall_score, 0) / count) : 0,
        logic: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.logic, 0) / count) : 0,
        creativity: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.creativity, 0) / count) : 0,
        intuition: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.intuition, 0) / count) : 0,
        emotional_intelligence: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.emotional_intelligence, 0) / count) : 0,
        systems_thinking: hasPlayed ? Math.round(userResults.reduce((s, res) => s + res.systems_thinking, 0) / count) : 0,
      };
      setAverages(avg);

      const { data: allResults } = await supabase
        .from("test_results")
        .select("user_id, overall_score");

      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("user_id");

      if (allProfiles) {
        const userGroups = new Map();
        allProfiles.forEach(p => userGroups.set(p.user_id, { sum: 0, count: 0 }));
        (allResults || []).forEach(row => {
          const existing = userGroups.get(row.user_id) || { sum: 0, count: 0 };
          userGroups.set(row.user_id, {
            sum: existing.sum + row.overall_score,
            count: existing.count + 1
          });
        });

        const averageScores = Array.from(userGroups.values()).map(g => g.count > 0 ? g.sum / g.count : 0);
        const sortedAverages = averageScores.sort((a, b) => b - a);
        setTotalPlayers(sortedAverages.length);
        const rankIdx = sortedAverages.findIndex(s => s <= avg.overall_score);
        setGlobalRank(rankIdx === -1 ? sortedAverages.length : rankIdx + 1);
      }
    };
    fetchProfileData();
  }, [user, navigate]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editUsername,
          avatar_url: editAvatar,
          links: editLinks,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        username: editUsername,
        avatar_url: editAvatar,
        links: editLinks
      }));
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const addLink = () => {
    setEditLinks([...editLinks, { label: "", url: "" }]);
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = [...editLinks];
    newLinks[index][field] = value;
    setEditLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setEditLinks(editLinks.filter((_, i) => i !== index));
  };

  const tier = averages ? getTier(averages.percentile) : getTier(0);
  const isTop5Percent = globalRank && totalPlayers && (globalRank / totalPlayers <= 0.05) && totalPlayers > 10;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container pt-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Profile info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-card/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent" />

              <div className="flex justify-between items-start mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-primary/40" />
                    )}
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4 text-primary" />}
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Username</label>
                        <Input
                          value={editUsername}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all font-bold"
                          placeholder="CyberNomad"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Avatar URL</label>
                        <Input
                          value={editAvatar}
                          onChange={(e) => setEditAvatar(e.target.value)}
                          className="bg-white/5 border-white/10 focus:border-primary/50 transition-all text-xs"
                          placeholder="https://images..."
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-black text-foreground italic tracking-tight">{profile?.username || "Researcher"}</h1>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-tighter shadow-[0_0_10px_rgba(255,191,0,0.1)]">
                          {isTop5Percent ? "Elite Strategist" : "Cognitive Pioneer"}
                        </span>
                        {globalRank && (
                          <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            #{globalRank} Global
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4 border-t border-white/5 pt-6">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                    <LinkIcon className="h-3 w-3" /> Connect Neural Links
                  </h3>

                  {isEditing ? (
                    <div className="space-y-3">
                      {editLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={link.label}
                            onChange={(e) => updateLink(idx, "label", e.target.value)}
                            placeholder="X.com"
                            className="bg-white/5 border-white/10 h-8 text-xs"
                          />
                          <Input
                            value={link.url}
                            onChange={(e) => updateLink(idx, "url", e.target.value)}
                            placeholder="https://..."
                            className="bg-white/5 border-white/10 h-8 text-xs flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => removeLink(idx)} className="h-8 w-8 text-red-400 hover:text-red-300">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addLink}
                        className="w-full border border-dashed border-white/10 text-[10px] font-bold uppercase py-1"
                      >
                        + Add Network
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile?.links && profile.links.length > 0 ? (
                        profile.links.map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs font-bold flex items-center gap-2 group/link"
                          >
                            <span>{link.label}</span>
                            <ChevronRight className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity translate-x-1" />
                          </a>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No links connected.</p>
                      )}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <Button
                    className="w-full bg-primary text-black font-black italic tracking-tight hover:scale-105 transition-all"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Neural Profile</>}
                  </Button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between group cursor-pointer" onClick={() => navigate("/history")}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-black italic uppercase">View Full History</h4>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{results.length} Sessions Conducted</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Performance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 space-y-8"
          >
            {averages && (
              <div className={`${tier?.cardClass} rounded-3xl p-10 space-y-8 relative overflow-hidden border border-white/5 shadow-2xl bg-card/40 backdrop-blur-xl group`}>
                <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Brain className="h-64 w-64 text-primary" />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                  <div className="space-y-4 text-center md:text-left">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Mind Signature</p>
                      <h2 className="text-5xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter leading-none">{tier?.title}</h2>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                      Your cognitive baseline is calculated across your entire assessment history to provide a persistent profile.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="relative bg-white/5 border border-white/10 p-8 rounded-full text-center min-w-[180px]">
                      <p className="text-6xl font-black text-gradient-gold italic leading-none">{averages.percentile}</p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase mt-2 tracking-widest italic">Global %ile</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-10 border-t border-white/5 relative z-10">
                  {[
                    { label: "LOGIC", val: averages.logic, color: "text-blue-400" },
                    { label: "CREA", val: averages.creativity, color: "text-purple-400" },
                    { label: "INTU", val: averages.intuition, color: "text-amber-400" },
                    { label: "EMO_Q", val: averages.emotional_intelligence, color: "text-rose-400" },
                    { label: "SYSTEMS", val: averages.systems_thinking, color: "text-emerald-400" }
                  ].map(stat => (
                    <div key={stat.label} className="group/stat">
                      <p className="text-[9px] font-black text-muted-foreground mb-1 tracking-widest">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-black italic ${stat.color}`}>{stat.val}</p>
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stat.val}%` }}
                            className={`h-full bg-current ${stat.color} opacity-40 shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card/40 border border-white/5 rounded-3xl p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-black italic uppercase">New Assessment</h3>
                <p className="text-sm text-muted-foreground leading-relaxed"> recalibrate your neural signatures by taking a specialized cognitive challenge.</p>
                <Button size="lg" onClick={() => navigate("/test/setup")} className="w-full glow-gold mt-4 font-black italic">
                  Initiate Calibration
                </Button>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <User className="h-6 w-6 text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase text-muted-foreground">Stats</span>
                </div>
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-muted-foreground font-bold">Total Players</p>
                    <p className="text-2xl font-black italic leading-none">{totalPlayers.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-xs text-muted-foreground font-bold">Relative Standing</p>
                    <p className="text-2xl font-black italic leading-none text-primary">Top {Math.max(0.1, Math.round((globalRank! / totalPlayers) * 1000) / 10)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
