import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function usePresence() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      await supabase
        .from("profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() } as any)
        .eq("user_id", user.id);
    };

    updatePresence();
    intervalRef.current = setInterval(updatePresence, 30000); // every 30s

    const handleBeforeUnload = () => {
      navigator.sendBeacon && supabase
        .from("profiles")
        .update({ is_online: false } as any)
        .eq("user_id", user.id);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      supabase
        .from("profiles")
        .update({ is_online: false } as any)
        .eq("user_id", user.id);
    };
  }, [user]);
}
