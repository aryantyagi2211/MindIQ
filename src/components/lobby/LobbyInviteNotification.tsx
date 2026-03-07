import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Check, X, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Invite {
  id: string;
  lobby_id: string;
  host_username: string;
  host_avatar: string | null;
}

export default function LobbyInviteNotification() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<Invite[]>([]);
  const processedRef = useRef<Set<string>>(new Set());

  const fetchInvites = async () => {
    if (!user) return;

    const { data: memberships } = await supabase
      .from("lobby_members")
      .select("id, lobby_id")
      .eq("user_id", user.id)
      .eq("status", "invited") as any;

    if (!memberships || memberships.length === 0) {
      setInvites([]);
      return;
    }

    // Deduplicate: only keep latest invite per lobby
    const latestPerLobby = new Map<string, any>();
    for (const m of memberships) {
      if (!latestPerLobby.has(m.lobby_id)) {
        latestPerLobby.set(m.lobby_id, m);
      }
    }
    const uniqueMemberships = Array.from(latestPerLobby.values());

    const lobbyIds = uniqueMemberships.map((m: any) => m.lobby_id);
    const { data: lobbies } = await supabase
      .from("lobbies")
      .select("id, host_id")
      .in("id", lobbyIds)
      .eq("status", "waiting") as any;

    if (!lobbies || lobbies.length === 0) {
      setInvites([]);
      return;
    }

    const hostIds = lobbies.map((l: any) => l.host_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, avatar_url")
      .in("user_id", hostIds) as any;

    const enriched: Invite[] = uniqueMemberships
      .map((m: any) => {
        const lobby = lobbies.find((l: any) => l.id === m.lobby_id);
        if (!lobby) return null;
        const host = profiles?.find((p: any) => p.user_id === lobby.host_id);
        return {
          id: m.id,
          lobby_id: m.lobby_id,
          host_username: host?.username || "Unknown",
          host_avatar: host?.avatar_url || null,
        };
      })
      .filter(Boolean) as Invite[];

    setInvites(enriched);
  };

  useEffect(() => {
    if (!user) return;
    fetchInvites();

    // Subscribe to lobby_members changes for this user specifically
    const channel = supabase
      .channel("lobby-invites-for-me")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lobby_members" },
        (payload: any) => {
          // Only react if this invite is for me
          if (payload.new.user_id === user.id && payload.new.status === "invited") {
            fetchInvites();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "lobby_members" },
        () => fetchInvites()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleAccept = async (invite: Invite) => {
    if (!user) return;

    // Delete user's own lobby (if they created one)
    const { data: ownLobbies } = await supabase
      .from("lobbies")
      .select("id")
      .eq("host_id", user.id)
      .eq("status", "waiting") as any;

    if (ownLobbies && ownLobbies.length > 0) {
      for (const ownLobby of ownLobbies) {
        if (ownLobby.id !== invite.lobby_id) {
          await supabase.from("lobby_members").delete().eq("lobby_id", ownLobby.id).eq("user_id", user.id);
          await supabase.from("lobbies").delete().eq("id", ownLobby.id);
        }
      }
    }

    // Accept the invite
    const { error } = await supabase
      .from("lobby_members")
      .update({ status: "joined" } as any)
      .eq("id", invite.id);

    if (error) {
      toast.error("Failed to accept invite");
    } else {
      toast.success("Joined lobby!");
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      window.dispatchEvent(new CustomEvent("lobby-switched", { detail: { lobbyId: invite.lobby_id } }));
      navigate("/lobby");
    }
  };

  const handleReject = async (invite: Invite) => {
    await supabase
      .from("lobby_members")
      .delete()
      .eq("id", invite.id);

    toast.success("Invite declined");
    setInvites((prev) => prev.filter((i) => i.id !== invite.id));
  };

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-3 max-w-sm">
      <AnimatePresence>
        {invites.map((invite) => (
          <motion.div
            key={invite.lobby_id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-[#111] border border-yellow-500/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(255,191,0,0.15)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-white/5 border-2 border-yellow-500/40 flex items-center justify-center overflow-hidden">
                  {invite.host_avatar ? (
                    <img src={invite.host_avatar} className="h-full w-full object-cover rounded-full" alt="" />
                  ) : (
                    <User className="h-6 w-6 text-white/30" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-yellow-500">
                  <Users className="h-2.5 w-2.5 text-black" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                  {invite.host_username}
                </p>
                <p className="text-[10px] text-yellow-400/70 uppercase tracking-widest font-bold">
                  Lobby Invitation
                </p>
              </div>
            </div>

            <p className="text-xs text-white/50 mb-3">
              <span className="text-yellow-400 font-bold">{invite.host_username}</span> invited you to join their lobby!
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(invite)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-yellow-500 text-black font-black text-xs uppercase tracking-wider hover:bg-yellow-400 transition-all"
              >
                <Check className="h-4 w-4" />
                Accept
              </button>
              <button
                onClick={() => handleReject(invite)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-black text-xs uppercase tracking-wider hover:bg-white/10 transition-all"
              >
                <X className="h-4 w-4" />
                Decline
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
