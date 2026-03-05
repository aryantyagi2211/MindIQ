import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import TestSetup from "./pages/TestSetup";
import TestTake from "./pages/TestTake";
import TestResult from "./pages/TestResult";
import Leaderboard from "./pages/Leaderboard";
import HallOfFame from "./pages/HallOfFame";
import Profile from "./pages/Profile";
import History from "./pages/History";
import ChallengeView from "./pages/ChallengeView";
import BattleMatchmaking from "./pages/BattleMatchmaking";
import BattleFight from "./pages/BattleFight";
import BattleResult from "./pages/BattleResult";
import Lobby from "./pages/Lobby";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/test/setup" element={<TestSetup />} />
            <Route path="/test/take" element={<TestTake />} />
            <Route path="/test/result" element={<TestResult />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/challenge/:code" element={<ChallengeView />} />
            <Route path="/battle/:battleId" element={<BattleMatchmaking />} />
            <Route path="/battle/:battleId/fight" element={<BattleFight />} />
            <Route path="/battle/:battleId/result" element={<BattleResult />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
