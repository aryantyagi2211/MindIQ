import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Brain, LogOut, User, Trophy, Hash, Percent } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showAsScore, setShowAsScore] = useState(false);
  const [isTopPerformer, setIsTopPerformer] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-gradient-gold">MindIQ</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Trophy className="inline h-4 w-4 mr-1" />Leaderboard
          </Link>
          <Link to="/hall-of-fame" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Hall of Fame
          </Link>
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

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-1" /> Profile
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
