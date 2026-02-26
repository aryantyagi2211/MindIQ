import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import TestSetup from "./pages/TestSetup";
import TestTake from "./pages/TestTake";
import TestResult from "./pages/TestResult";
import Leaderboard from "./pages/Leaderboard";
import HallOfFame from "./pages/HallOfFame";
import Profile from "./pages/Profile";
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
            <Route path="/test/setup" element={<TestSetup />} />
            <Route path="/test/take" element={<TestTake />} />
            <Route path="/test/result" element={<TestResult />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/hall-of-fame" element={<HallOfFame />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
