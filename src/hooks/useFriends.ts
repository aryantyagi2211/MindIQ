import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface FriendProfile {
  user_id: string;
  username: string;
  avatar_url: string | null;
  country: string | null;
  is_online: boolean;
  last_seen: string;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  created_at: string;
  from_profile?: FriendProfile;
}

export function useFriends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!user) return;

    // Get friend relationships where user is either user_id or friend_id
    const { data: friendRows } = await supabase
      .from("friends")
      .select("user_id, friend_id")
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`) as any;

    if (friendRows && friendRows.length > 0) {
      const friendIds = friendRows.map((f: any) =>
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, country, is_online, last_seen")
        .in("user_id", friendIds) as any;

      setFriends(profiles || []);
    } else {
      setFriends([]);
    }
  }, [user]);

  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;

    const { data: requests } = await supabase
      .from("friend_requests")
      .select("*")
      .eq("to_user_id", user.id)
      .eq("status", "pending") as any;

    if (requests && requests.length > 0) {
      const fromIds = requests.map((r: any) => r.from_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, avatar_url, country, is_online, last_seen")
        .in("user_id", fromIds) as any;

      const enriched = requests.map((r: any) => ({
        ...r,
        from_profile: profiles?.find((p: any) => p.user_id === r.from_user_id),
      }));
      setPendingRequests(enriched);
    } else {
      setPendingRequests([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      await Promise.all([fetchFriends(), fetchPendingRequests()]);
      setLoading(false);
    };
    load();

    // Subscribe to friend_requests changes
    const channel = supabase
      .channel("friend-requests-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friend_requests" },
        () => {
          fetchPendingRequests();
          fetchFriends();
        }
      )
      .subscribe();

    // Subscribe to profile changes for real-time online/offline status of friends
    const presenceChannel = supabase
      .channel("friends-presence")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload: any) => {
          setFriends(prev => prev.map(f =>
            f.user_id === payload.new.user_id
              ? { ...f, is_online: payload.new.is_online, last_seen: payload.new.last_seen }
              : f
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [user, fetchFriends, fetchPendingRequests]);

  const sendFriendRequest = async (toUserId: string) => {
    if (!user) return;
    
    // Check if already friends
    const { data: existing } = await supabase
      .from("friends")
      .select("id")
      .or(`and(user_id.eq.${user.id},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${user.id})`) as any;

    if (existing && existing.length > 0) {
      toast.info("Already friends!");
      return;
    }

    // Check if request already sent
    const { data: existingReq } = await supabase
      .from("friend_requests")
      .select("id")
      .eq("from_user_id", user.id)
      .eq("to_user_id", toUserId) as any;

    if (existingReq && existingReq.length > 0) {
      toast.info("Request already sent!");
      return;
    }

    const { error } = await supabase
      .from("friend_requests")
      .insert({ from_user_id: user.id, to_user_id: toUserId } as any);

    if (error) {
      toast.error("Failed to send request");
    } else {
      toast.success("Friend request sent!");
    }
  };

  const acceptRequest = async (requestId: string, fromUserId: string) => {
    if (!user) return;

    // Update request status
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" } as any)
      .eq("id", requestId);

    // Create friendship (both directions)
    await supabase.from("friends").insert([
      { user_id: user.id, friend_id: fromUserId },
    ] as any);

    toast.success("Friend request accepted!");
    fetchFriends();
    fetchPendingRequests();
  };

  const rejectRequest = async (requestId: string) => {
    await supabase
      .from("friend_requests")
      .update({ status: "rejected" } as any)
      .eq("id", requestId);

    toast.success("Request rejected");
    fetchPendingRequests();
  };

  return {
    friends,
    pendingRequests,
    loading,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    refetchFriends: fetchFriends,
  };
}
