import { motion, AnimatePresence } from "framer-motion";
import { X, Check, XCircle, User, Mail } from "lucide-react";
import { FriendRequest } from "@/hooks/useFriends";

interface MailboxProps {
  open: boolean;
  onClose: () => void;
  requests: FriendRequest[];
  onAccept: (requestId: string, fromUserId: string) => void;
  onReject: (requestId: string) => void;
}

export default function Mailbox({ open, onClose, requests, onAccept, onReject }: MailboxProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-4 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <Mail className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Friend Requests</h3>
                <p className="text-[9px] text-white/30 uppercase tracking-widest">{requests.length} pending</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-all">
              <X className="h-5 w-5 text-white/40" />
            </button>
          </div>

          {/* Requests list */}
          <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
            {requests.length === 0 ? (
              <div className="py-12 text-center">
                <Mail className="h-10 w-10 text-white/10 mx-auto mb-3" />
                <p className="text-white/20 text-xs uppercase tracking-widest">No pending requests</p>
              </div>
            ) : (
              requests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {req.from_profile?.avatar_url ? (
                      <img src={req.from_profile.avatar_url} className="h-full w-full object-cover rounded-full" alt="" />
                    ) : (
                      <User className="h-5 w-5 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {req.from_profile?.username || "Unknown"}
                    </p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest">
                      Wants to be friends
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAccept(req.id, req.from_user_id)}
                      className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 transition-all"
                    >
                      <Check className="h-4 w-4 text-green-400" />
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all"
                    >
                      <XCircle className="h-4 w-4 text-red-400" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
