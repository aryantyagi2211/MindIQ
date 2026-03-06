import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePresence } from "@/hooks/usePresence";
import { useFriends } from "@/hooks/useFriends";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import LobbySidebar from "@/components/lobby/LobbySidebar";
import LobbyArea from "@/components/lobby/LobbyArea";
import Mailbox from "@/components/lobby/Mailbox";
import { toast } from "sonner";

const MAX_LOBBY_MEMBERS = 4;

export default function Lobby() {
  const navigate = useNavigate();
  const { user } = useAuth();
  usePresence();

  const { friends, pendingRequests, sendFriendRequest, acceptRequest, rejectRequest } = useFriends();

  const [activeTab, setActiveTab] = useState<"world" | "friends">("friends");
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [worldPlayers, setWorldPlayers] = useState<any[]>([]);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [lobbyMembers, setLobbyMembers] = useState<any[]>([]);
  const [selectedField, setSelectedField] = useState("Technology");

  // Fetch all world players + real-time presence
  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url, country, is_online, last_seen")
      .order("is_online", { ascending: false }) as any;
    setWorldPlayers(data || []);
  }, []);

  useEffect(() => {
    fetchPlayers();

    // Subscribe to real-time profile changes (online/offline status)
    const channel = supabase
      .channel("profiles-presence")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        () => fetchPlayers()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPlayers]);

  // Create or fetch existing lobby
  useEffect(() => {
    if (!user) return;

    const initLobby = async () => {
      // Check if user has an active lobby
      const { data: existing } = await supabase
        .from("lobbies")
        .select("*")
        .eq("host_id", user.id)
        .eq("status", "waiting")
        .limit(1) as any;

      if (existing && existing.length > 0) {
        setLobbyId(existing[0].id);
        fetchLobbyMembers(existing[0].id);
      } else {
        // Create a new lobby
        const { data: newLobby } = await supabase
          .from("lobbies")
          .insert({ host_id: user.id, field: selectedField, subfield: "General" } as any)
          .select()
          .single() as any;

        if (newLobby) {
          setLobbyId(newLobby.id);
          // Add self as member
          await supabase.from("lobby_members").insert({
            lobby_id: newLobby.id,
            user_id: user.id,
            status: "joined",
          } as any);
          fetchLobbyMembers(newLobby.id);
        }
      }
    };

    initLobby();
  }, [user]);

  const fetchLobbyMembers = useCallback(async (lId: string) => {
    const { data: members } = await supabase
      .from("lobby_members")
      .select("user_id, status")
      .eq("lobby_id", lId)
      .eq("status", "joined") as any;

    if (!members || members.length === 0) {
      setLobbyMembers([]);
      return;
    }

    const userIds = members.map((m: any) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url, country, is_online, last_seen")
      .in("user_id", userIds) as any;

    // Fetch latest test results for each member
    const membersWithResults = await Promise.all(
      (profiles || []).map(async (p: any) => {
        const { data: result } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", p.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        return { ...p, testResult: result };
      })
    );

    setLobbyMembers(membersWithResults);
  }, []);

  // Subscribe to lobby changes
  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase
      .channel(`lobby-${lobbyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lobby_members", filter: `lobby_id=eq.${lobbyId}` },
        () => fetchLobbyMembers(lobbyId)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lobbyId, fetchLobbyMembers]);

  const handleInviteToLobby = async (userId: string) => {
    if (!lobbyId || !user) return;

    if (lobbyMembers.length >= MAX_LOBBY_MEMBERS) {
      toast.error("Lobby is full (max 4 players)");
      return;
    }

    // Check if already in lobby
    const { data: existing } = await supabase
      .from("lobby_members")
      .select("id")
      .eq("lobby_id", lobbyId)
      .eq("user_id", userId) as any;

    if (existing && existing.length > 0) {
      toast.info("Player already in lobby");
      return;
    }

    const { error } = await supabase.from("lobby_members").insert({
      lobby_id: lobbyId,
      user_id: userId,
      status: "joined",
    } as any);

    if (error) {
      toast.error("Failed to invite player");
    } else {
      toast.success("Player added to lobby!");
      fetchLobbyMembers(lobbyId);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!lobbyId) return;

    await supabase
      .from("lobby_members")
      .delete()
      .eq("lobby_id", lobbyId)
      .eq("user_id", userId) as any;

    toast.success("Player removed");
    fetchLobbyMembers(lobbyId);
  };

  const handleStartTest = () => {
    if (lobbyMembers.length < 1) {
      toast.error("Need at least 1 player to start");
      return;
    }
    // Navigate to test setup with lobby context
    navigate(`/test/setup?lobby=${lobbyId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
        <Header />
        <main className="relative container pt-24 pb-16 z-10 flex items-center justify-center min-h-[80vh]">
          <div className="text-center space-y-4">
            <p className="text-white/40 text-sm">Login to access the lobby</p>
            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-3 rounded-2xl bg-yellow-500 text-black font-black italic tracking-tighter"
            >
              LOGIN
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#010101] text-white relative overflow-hidden font-sans select-none">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#000000]" />
        <motion.div
          animate={{ opacity: [0.15, 0.4, 0.15], x: [-40, 40, -40] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-yellow-500/5 blur-[220px] rounded-full"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], x: [60, -60, 60] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-yellow-600/10 blur-[220px] rounded-full"
        />
      </div>

      <Header />

      <main className="relative container pt-24 pb-24 z-10">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[80vh]">
          {/* Sidebar */}
          <LobbySidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            worldPlayers={worldPlayers}
            friends={friends}
            pendingRequestsCount={pendingRequests.length}
            onOpenMailbox={() => setMailboxOpen(true)}
            onInviteToLobby={handleInviteToLobby}
            onSendFriendRequest={sendFriendRequest}
            lobbyMembers={lobbyMembers.map(m => m.user_id)}
            currentUserId={user.id}
          />

          {/* Lobby area */}
          <LobbyArea
            members={lobbyMembers}
            maxMembers={MAX_LOBBY_MEMBERS}
            isHost={true}
            onRemoveMember={handleRemoveMember}
            onStartTest={handleStartTest}
            lobbyField={selectedField}
          />
        </div>
      </main>

      {/* Mailbox modal */}
      <Mailbox
        open={mailboxOpen}
        onClose={() => setMailboxOpen(false)}
        requests={pendingRequests}
        onAccept={acceptRequest}
        onReject={rejectRequest}
      />
    </div>
  );
}
