import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { usePresence } from "@/hooks/usePresence";
import { useFriends } from "@/hooks/useFriends";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import LobbySidebar from "@/components/lobby/LobbySidebar";
import LobbyArea from "@/components/lobby/LobbyArea";
import Mailbox from "@/components/lobby/Mailbox";
import LobbyInviteNotification from "@/components/lobby/LobbyInviteNotification";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  const [lobbyHostId, setLobbyHostId] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState("Technology");
  const [inviteStatuses, setInviteStatuses] = useState<Record<string, "pending" | "accepted">>({});
  const [hostStarting, setHostStarting] = useState(false);

  // Fetch all world players
  const fetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url, country, is_online, last_seen")
      .order("is_online", { ascending: false }) as any;
    setWorldPlayers(data || []);
  }, []);

  // Real-time presence updates for world players
  useEffect(() => {
    fetchPlayers();

    const channel = supabase
      .channel("profiles-presence")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload: any) => {
          setWorldPlayers(prev => prev.map(p =>
            p.user_id === payload.new.user_id
              ? { ...p, is_online: payload.new.is_online, last_seen: payload.new.last_seen }
              : p
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPlayers]);

  // Initialize lobby
  const initLobby = useCallback(async (forcelobbyId?: string) => {
    if (!user) return;

    if (forcelobbyId) {
      const { data: lobby } = await supabase
        .from("lobbies")
        .select("*")
        .eq("id", forcelobbyId)
        .eq("status", "waiting")
        .single() as any;

      if (lobby) {
        setLobbyId(lobby.id);
        setLobbyHostId(lobby.host_id);
        fetchLobbyMembers(lobby.id);
        return;
      }
    }

    // Check if user has joined someone else's lobby
    const { data: memberships } = await supabase
      .from("lobby_members")
      .select("lobby_id")
      .eq("user_id", user.id)
      .eq("status", "joined") as any;

    if (memberships && memberships.length > 0) {
      for (const m of memberships) {
        const { data: activeLobby } = await supabase
          .from("lobbies")
          .select("*")
          .eq("id", m.lobby_id)
          .eq("status", "waiting")
          .single() as any;

        if (activeLobby) {
          setLobbyId(activeLobby.id);
          setLobbyHostId(activeLobby.host_id);
          fetchLobbyMembers(activeLobby.id);
          return;
        }
      }
    }

    // Check if user has an active lobby as host
    const { data: existing } = await supabase
      .from("lobbies")
      .select("*")
      .eq("host_id", user.id)
      .eq("status", "waiting")
      .limit(1) as any;

    if (existing && existing.length > 0) {
      setLobbyId(existing[0].id);
      setLobbyHostId(existing[0].host_id);
      fetchLobbyMembers(existing[0].id);
      return;
    }

    // Create a new lobby
    const { data: newLobby } = await supabase
      .from("lobbies")
      .insert({ host_id: user.id, field: selectedField, subfield: "General" } as any)
      .select()
      .single() as any;

    if (newLobby) {
      setLobbyId(newLobby.id);
      setLobbyHostId(newLobby.host_id);
      await supabase.from("lobby_members").insert({
        lobby_id: newLobby.id,
        user_id: user.id,
        status: "joined",
      } as any);
      fetchLobbyMembers(newLobby.id);
    }
  }, [user, selectedField]);

  useEffect(() => {
    initLobby();
  }, [user]);

  // Listen for lobby-switched events from LobbyInviteNotification
  useEffect(() => {
    const handler = (e: any) => {
      const { lobbyId: newLobbyId } = e.detail;
      initLobby(newLobbyId);
    };
    window.addEventListener("lobby-switched", handler);
    return () => window.removeEventListener("lobby-switched", handler);
  }, [initLobby]);

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

    const membersWithResults = await Promise.all(
      (profiles || []).map(async (p: any) => {
        const { data: result } = await supabase
          .from("test_results")
          .select("*")
          .eq("user_id", p.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return { ...p, testResult: result };
      })
    );

    setLobbyMembers(membersWithResults);

    setInviteStatuses(prev => {
      const updated = { ...prev };
      userIds.forEach((uid: string) => {
        if (updated[uid] === "pending") {
          updated[uid] = "accepted";
        }
      });
      return updated;
    });
  }, []);

  // Subscribe to lobby_members AND lobby status changes
  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase
      .channel(`lobby-${lobbyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lobby_members", filter: `lobby_id=eq.${lobbyId}` },
        (payload: any) => {
          // If a member was deleted (left/removed/kicked)
          if (payload.eventType === "DELETE" && payload.old) {
            const removedUserId = payload.old.user_id;
            // If I was removed, reinitialize
            if (removedUserId === user?.id) {
              toast.info("You were removed from the lobby");
              setLobbyId(null);
              setLobbyMembers([]);
              setLobbyHostId(null);
              setInviteStatuses({});
              initLobby();
              return;
            }
          }
          fetchLobbyMembers(lobbyId);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "lobbies", filter: `id=eq.${lobbyId}` },
        (payload: any) => {
          const newStatus = payload.new.status;
          // Host started the test - show overlay for non-host members
          if (newStatus === "generating_questions" && user?.id !== payload.new.host_id) {
            setHostStarting(true);
          }
          // Questions are ready - navigate all non-host members to test
          if (newStatus === "testing" && user?.id !== payload.new.host_id) {
            setHostStarting(false);
            navigate("/test/take", {
              state: {
                qualification: payload.new.qualification,
                difficulty: payload.new.difficulty,
                stream: payload.new.stream || undefined,
                examType: "mcq",
                lobbyId: lobbyId,
                isLobbyTest: true,
              }
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "lobbies", filter: `id=eq.${lobbyId}` },
        () => {
          // Lobby was disbanded by host
          if (user?.id !== lobbyHostId) {
            toast.info("The lobby was disbanded by the host");
          }
          setLobbyId(null);
          setLobbyMembers([]);
          setLobbyHostId(null);
          setInviteStatuses({});
          initLobby();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [lobbyId, fetchLobbyMembers, user, lobbyHostId, initLobby, navigate]);

  const handleInviteToLobby = async (userId: string) => {
    if (!lobbyId || !user) return;

    if (lobbyMembers.length >= MAX_LOBBY_MEMBERS) {
      toast.error("Lobby is full (max 4 players)");
      return;
    }

    const { data: existing } = await supabase
      .from("lobby_members")
      .select("id")
      .eq("lobby_id", lobbyId)
      .eq("user_id", userId) as any;

    if (existing && existing.length > 0) {
      toast.info("Player already invited or in lobby");
      return;
    }

    const { error } = await supabase.from("lobby_members").insert({
      lobby_id: lobbyId,
      user_id: userId,
      status: "invited",
    } as any);

    if (error) {
      toast.error("Failed to invite player");
    } else {
      toast.success("Invite sent!");
      setInviteStatuses(prev => ({ ...prev, [userId]: "pending" }));
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
  };

  const handleExitLobby = async () => {
    if (!lobbyId || !user) return;

    const isHost = lobbyHostId === user.id;

    if (isHost) {
      // Host: delete all members first, then lobby (triggers realtime for all members)
      await supabase.from("lobby_members").delete().eq("lobby_id", lobbyId);
      await supabase.from("lobbies").delete().eq("id", lobbyId);
      toast.success("Lobby disbanded");
    } else {
      // Member: just remove self
      await supabase.from("lobby_members").delete().eq("lobby_id", lobbyId).eq("user_id", user.id);
      toast.success("Left the lobby");
    }

    // Reset and create fresh lobby
    setLobbyId(null);
    setLobbyMembers([]);
    setLobbyHostId(null);
    setInviteStatuses({});

    const { data: newLobby } = await supabase
      .from("lobbies")
      .insert({ host_id: user.id, field: selectedField, subfield: "General" } as any)
      .select()
      .single() as any;

    if (newLobby) {
      setLobbyId(newLobby.id);
      setLobbyHostId(newLobby.host_id);
      await supabase.from("lobby_members").insert({
        lobby_id: newLobby.id,
        user_id: user.id,
        status: "joined",
      } as any);
      fetchLobbyMembers(newLobby.id);
    }
  };

  const handleStartTest = () => {
    if (lobbyMembers.length < 1) {
      toast.error("Need at least 1 player to start");
      return;
    }
    navigate(`/test/setup?lobbyId=${lobbyId}`);
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
            inviteStatuses={inviteStatuses}
          />

          <LobbyArea
            members={lobbyMembers}
            maxMembers={MAX_LOBBY_MEMBERS}
            isHost={lobbyHostId === user.id}
            onRemoveMember={handleRemoveMember}
            onStartTest={handleStartTest}
            onExitLobby={handleExitLobby}
            lobbyField={selectedField}
          />
        </div>
      </main>

      <Mailbox
        open={mailboxOpen}
        onClose={() => setMailboxOpen(false)}
        requests={pendingRequests}
        onAccept={acceptRequest}
        onReject={rejectRequest}
      />

      <LobbyInviteNotification />

      {/* Host Starting Overlay for non-host members */}
      <AnimatePresence>
        {hostStarting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center space-y-6"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-yellow-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
                <Loader2 className="h-16 w-16 text-yellow-500 relative z-10 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase">
                  Host is <span className="text-yellow-500">Starting</span> the Match
                </h2>
                <p className="text-white/40 text-sm mt-2">Preparing your assessment...</p>
              </div>
              <div className="flex items-center justify-center gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-yellow-500"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
