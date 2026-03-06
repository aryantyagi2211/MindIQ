import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function usePresence() {
  const { user } = useAuth();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) return;

    const updatePresence = async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_online: true, last_seen: new Date().toISOString() } as any)
        .eq("user_id", user.id);
      
      if (error) {
        console.error("Failed to update presence:", error);
      }
    };

    const setOffline = async () => {
      await supabase
        .from("profiles")
        .update({ is_online: false, last_seen: new Date().toISOString() } as any)
        .eq("user_id", user.id);
    };

    // Set online immediately
    updatePresence();
    
    // Update presence every 15 seconds (more frequent for better accuracy)
    intervalRef.current = setInterval(updatePresence, 15000);

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        updatePresence();
      }
    };

    // Handle before unload
    const handleBeforeUnload = () => {
      // Try to set offline status
      setOffline();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      // Set offline when component unmounts
      setOffline();
    };
  }, [user]);
}
