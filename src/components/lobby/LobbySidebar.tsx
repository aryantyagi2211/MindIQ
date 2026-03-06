import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Users, UserPlus, Mail, Search } from "lucide-react";
import { FriendProfile } from "@/hooks/useFriends";
import PlayerCard from "./PlayerCard";

interface LobbySidebarProps {
  activeTab: "world" | "friends";
  onTabChange: (tab: "world" | "friends") => void;
  worldPlayers: any[];
  friends: FriendProfile[];
  pendingRequestsCount: number;
  onOpenMailbox: () => void;
  onInviteToLobby: (userId: string) => void;
  onSendFriendRequest: (userId: string) => void;
  lobbyMembers: string[];
  currentUserId?: string;
  inviteStatuses?: Record<string, "pending" | "accepted">;
}

export default function LobbySidebar({
  activeTab,
  onTabChange,
  worldPlayers,
  friends,
  pendingRequestsCount,
  onOpenMailbox,
  onInviteToLobby,
  onSendFriendRequest,
  lobbyMembers,
  currentUserId,
  inviteStatuses = {},
}: LobbySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is truly online based on last_seen timestamp
  const isTrulyOnline = (player: any) => {
    if (!player.is_online) return false;
    const now = new Date();
    const lastSeen = new Date(player.last_seen);
    const secondsSinceLastSeen = (now.getTime() - lastSeen.getTime()) / 1000;
    return secondsSinceLastSeen < 45; // Consider online if active within last 45 seconds
  };

  const filteredWorld = worldPlayers
    .filter(p =>
      p.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      p.user_id !== currentUserId
    )
    .map(p => ({ ...p, is_online: isTrulyOnline(p) })) // Update online status based on last_seen
    .sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));

  // Show only online friends (with last_seen check for accuracy)
  const now = new Date();
  const filteredFriends = friends
    .filter(f => {
      // Check if user matches search
      const matchesSearch = f.username?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Check if truly online (is_online flag AND last_seen within last 45 seconds)
      const lastSeen = new Date(f.last_seen);
      const secondsSinceLastSeen = (now.getTime() - lastSeen.getTime()) / 1000;
      const isTrulyOnline = f.is_online && secondsSinceLastSeen < 45;
      
      return matchesSearch && isTrulyOnline;
    })
    .sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));

  return (
    <div className="w-full lg:w-80 h-full flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/5">
        <button
          onClick={() => onTabChange("world")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === "world"
              ? "text-yellow-400 border-b-2 border-yellow-500 bg-yellow-500/5"
              : "text-white/30 hover:text-white/60"
          }`}
        >
          <Globe className="h-4 w-4" />
          World
        </button>
        <button
          onClick={() => onTabChange("friends")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "friends"
              ? "text-yellow-400 border-b-2 border-yellow-500 bg-yellow-500/5"
              : "text-white/30 hover:text-white/60"
          }`}
        >
          <Users className="h-4 w-4" />
          Friends
          {pendingRequestsCount > 0 && (
            <span className="absolute top-2 right-4 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Mailbox button */}
      <div className="px-3 pt-3 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/30"
          />
        </div>
        <button
          onClick={onOpenMailbox}
          className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:border-yellow-500/30 transition-all"
        >
          <Mail className="h-4 w-4 text-white/40" />
          {pendingRequestsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Player list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {activeTab === "world" ? (
            filteredWorld.length === 0 ? (
              <p className="text-center text-white/20 text-[10px] uppercase tracking-widest py-8">
                No players found
              </p>
            ) : (
              filteredWorld.map((player) => (
                <motion.div
                  key={player.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PlayerCard
                    player={player}
                    isFriend={friends.some(f => f.user_id === player.user_id)}
                    isInLobby={lobbyMembers.includes(player.user_id)}
                    inviteStatus={inviteStatuses[player.user_id] || null}
                    onInvite={() => onInviteToLobby(player.user_id)}
                    onSendRequest={() => onSendFriendRequest(player.user_id)}
                    showAddFriend
                  />
                </motion.div>
              ))
            )
          ) : (
            filteredFriends.length === 0 ? (
              <p className="text-center text-white/20 text-[10px] uppercase tracking-widest py-8">
                No friends yet
              </p>
            ) : (
              filteredFriends.map((friend) => (
                <motion.div
                  key={friend.user_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PlayerCard
                    player={friend}
                    isFriend
                    isInLobby={lobbyMembers.includes(friend.user_id)}
                    inviteStatus={inviteStatuses[friend.user_id] || null}
                    onInvite={() => onInviteToLobby(friend.user_id)}
                  />
                </motion.div>
              ))
            )
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
