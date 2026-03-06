import { useState, useEffect } from "react";
import { User, UserPlus, Plus, Check, Clock } from "lucide-react";

interface PlayerCardProps {
  player: {
    user_id: string;
    username: string;
    avatar_url: string | null;
    is_online: boolean;
  };
  isFriend: boolean;
  isInLobby: boolean;
  inviteStatus?: "pending" | "accepted" | null;
  onInvite: () => void;
  onSendRequest?: () => void;
  showAddFriend?: boolean;
}

export default function PlayerCard({
  player,
  isFriend,
  isInLobby,
  inviteStatus,
  onInvite,
  onSendRequest,
  showAddFriend,
}: PlayerCardProps) {
  const [localInviteStatus, setLocalInviteStatus] = useState<"pending" | "accepted" | null>(inviteStatus || null);
  const [canReinvite, setCanReinvite] = useState(true);

  useEffect(() => {
    setLocalInviteStatus(inviteStatus || null);
  }, [inviteStatus]);

  const handleInvite = () => {
    if (!canReinvite) return;
    
    setLocalInviteStatus("pending");
    setCanReinvite(false);
    onInvite();

    // Allow re-invite after 3 seconds if not accepted
    setTimeout(() => {
      setLocalInviteStatus((current) => {
        if (current === "pending") {
          setCanReinvite(true);
          return null;
        }
        return current;
      });
    }, 3000);
  };

  // Update status when player joins lobby
  useEffect(() => {
    if (isInLobby && localInviteStatus === "pending") {
      setLocalInviteStatus("accepted");
    }
  }, [isInLobby, localInviteStatus]);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group">
      {/* Avatar with online indicator */}
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
          {player.avatar_url ? (
            <img src={player.avatar_url} className="h-full w-full object-cover rounded-full" alt="" />
          ) : (
            <User className="h-5 w-5 text-white/30" />
          )}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#010101] ${
          player.is_online ? "bg-green-500" : "bg-white/20"
        }`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{player.username}</p>
        <p className={`text-[9px] uppercase tracking-widest font-bold ${
          player.is_online ? "text-green-400" : "text-white/20"
        }`}>
          {player.is_online ? "Online" : "Offline"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {showAddFriend && !isFriend && onSendRequest && (
          <button
            onClick={onSendRequest}
            className="p-2 rounded-lg bg-white/5 hover:bg-yellow-500/10 border border-white/5 hover:border-yellow-500/30 transition-all"
            title="Send friend request"
          >
            <UserPlus className="h-3.5 w-3.5 text-white/40 hover:text-yellow-400" />
          </button>
        )}
        {isInLobby ? (
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30" title="In lobby">
            <Check className="h-3.5 w-3.5 text-green-400" />
          </div>
        ) : localInviteStatus === "pending" ? (
          <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 animate-pulse" title="Invite pending">
            <Clock className="h-3.5 w-3.5 text-yellow-400" />
          </div>
        ) : player.is_online ? (
          <button
            onClick={handleInvite}
            disabled={!canReinvite}
            className={`p-2 rounded-lg transition-all ${
              canReinvite
                ? "bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40"
                : "bg-white/5 border border-white/5 opacity-50 cursor-not-allowed"
            }`}
            title={canReinvite ? "Invite to lobby" : "Wait to re-invite"}
          >
            <Plus className={`h-3.5 w-3.5 ${canReinvite ? "text-yellow-400" : "text-white/20"}`} />
          </button>
        ) : (
          <button
            className="p-2 rounded-lg bg-white/5 border border-white/5 opacity-50 cursor-not-allowed"
            disabled
            title="Player is offline"
          >
            <Plus className="h-3.5 w-3.5 text-white/20" />
          </button>
        )}
      </div>
    </div>
  );
}
