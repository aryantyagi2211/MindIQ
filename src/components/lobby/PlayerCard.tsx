import { User, UserPlus, Plus, Check } from "lucide-react";

interface PlayerCardProps {
  player: {
    user_id: string;
    username: string;
    avatar_url: string | null;
    is_online: boolean;
  };
  isFriend: boolean;
  isInLobby: boolean;
  onInvite: () => void;
  onSendRequest?: () => void;
  showAddFriend?: boolean;
}

export default function PlayerCard({
  player,
  isFriend,
  isInLobby,
  onInvite,
  onSendRequest,
  showAddFriend,
}: PlayerCardProps) {
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
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
            <Check className="h-3.5 w-3.5 text-green-400" />
          </div>
        ) : player.is_online ? (
          <button
            onClick={onInvite}
            className="p-2 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
            title="Invite to lobby"
          >
            <Plus className="h-3.5 w-3.5 text-yellow-400" />
          </button>
        ) : (
          <button
            onClick={onInvite}
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
