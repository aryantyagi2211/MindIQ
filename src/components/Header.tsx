import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, User, Trophy, Hash, Percent, Home, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAsScore, setShowAsScore] = useState(false);
  const [isTopPerformer, setIsTopPerformer] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
  }, [user]);

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
          <span className="text-xl font-bold text-gradient-gold">MindIQ</span>
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
                  text-sm font-medium transition-all flex items-center h-16 border-b-2 
                  ${isActive ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"}
                `}
              >
                <User className="h-4 w-4 mr-1.5" /> Profile
              </NavLink>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="hover:bg-transparent hover:text-foreground p-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
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
