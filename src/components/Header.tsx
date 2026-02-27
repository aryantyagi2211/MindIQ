import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, User, Trophy, Hash, Percent, Home, Activity, Swords } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAsScore, setShowAsScore] = useState(false);
  const [isTopPerformer, setIsTopPerformer] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [pendingChallenges, setPendingChallenges] = useState(0);
  const [challengersOnline, setChallengersOnline] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("test_results").select("percentile").eq("user_id", user.id)
      .order("percentile", { ascending: false }).limit(1).single()
      .then(({ data }) => {
        if (data && data.percentile >= 95) setIsTopPerformer(true);
      });

    // Neural Challenge Listener
    const fetchPending = async () => {
      const { count } = await supabase
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .eq("challenged_user_id", user.id)
        .is("challenged_result_id", null);
      setPendingChallenges(count || 0);
    };

    fetchPending();

    const channel = supabase
      .channel("my-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "challenges", filter: `challenged_user_id=eq.${user.id}` },
        () => fetchPending()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "challenges", filter: `challenged_user_id=eq.${user.id}` },
        () => fetchPending()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const fetchOnlineCount = async () => {
      const { count } = await supabase
        .from("challenges")
        .select("*", { count: "exact", head: true })
        .is("challenged_user_id", null);
      setChallengersOnline(count || 0);
    };

    fetchOnlineCount();
    const interval = setInterval(fetchOnlineCount, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Expose toggle state globally for other components
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("mindiq-score-mode", { detail: { showAsScore } }));
  }, [showAsScore]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
      ? "bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-lg"
      : "bg-transparent border-b border-transparent"
      }`}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gradient-gold leading-none">MindIQ</span>
            <span className="text-[8px] font-black text-yellow-500/40 uppercase tracking-[0.2em] mt-0.5">
              {challengersOnline} Challengers Online
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 h-full">
          <NavLink
            to="/"
            className={({ isActive }) => `
              text-sm font-medium transition-all flex items-center h-16 border-b-2 
              ${isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}
            `}
          >
            <Home className="inline h-4 w-4 mr-1.5" />Home
          </NavLink>
          <NavLink
            to="/test/setup"
            className={({ isActive }) => `
              text-sm font-medium transition-all flex items-center h-16 border-b-2 
              ${isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}
            `}
          >
            <Activity className="inline h-4 w-4 mr-1.5" />Assessment
          </NavLink>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => `
              text-sm font-medium transition-all flex items-center h-16 border-b-2 
              ${isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}
            `}
          >
            <Trophy className="inline h-4 w-4 mr-1.5" />Leaderboard
          </NavLink>
          <NavLink
            to="/hall-of-fame"
            className={({ isActive }) => `
              text-sm font-medium transition-all flex items-center h-16 border-b-2 
              ${isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}
            `}
          >
            Hall of Fame
          </NavLink>
          {isTopPerformer && (
            <button
              onClick={() => setShowAsScore(prev => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary hover:bg-primary/20 transition-all"
              title="Toggle between percentile and score display"
            >
              {showAsScore ? <Hash className="h-3.5 w-3.5" /> : <Percent className="h-3.5 w-3.5" />}
              {showAsScore ? "Score" : "%ile"}
            </button>
          )}
        </nav>

        <div className="flex items-center gap-6 h-full">
          {user ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => `
                  relative text-sm font-medium transition-all flex items-center h-16 border-b-2 
                  ${isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}
                `}
              >
                <div className="relative">
                  <User className="h-4 w-4 mr-1.5" />
                  {pendingChallenges > 0 && (
                    <span className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                  )}
                </div>
                Profile
              </NavLink>
              <button
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground transition-colors p-0 flex items-center h-16"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => navigate("/auth")}
              className="bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-black transition-all"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
