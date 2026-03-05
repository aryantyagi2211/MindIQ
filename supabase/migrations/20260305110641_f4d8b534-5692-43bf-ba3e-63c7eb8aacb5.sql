
-- Friends table (accepted friendships)
CREATE TABLE public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own friends" ON public.friends
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friends" ON public.friends
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own friends" ON public.friends
FOR DELETE TO authenticated
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Friend requests table
CREATE TABLE public.friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL,
  to_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.friend_requests
FOR SELECT TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can send requests" ON public.friend_requests
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update received requests" ON public.friend_requests
FOR UPDATE TO authenticated
USING (auth.uid() = to_user_id);

CREATE POLICY "Users can delete own requests" ON public.friend_requests
FOR DELETE TO authenticated
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Lobbies table
CREATE TABLE public.lobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  field text NOT NULL DEFAULT 'Technology',
  subfield text NOT NULL DEFAULT 'General',
  difficulty text NOT NULL DEFAULT 'Standard',
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lobbies viewable by authenticated" ON public.lobbies
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can create lobbies" ON public.lobbies
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update lobby" ON public.lobbies
FOR UPDATE TO authenticated
USING (auth.uid() = host_id);

CREATE POLICY "Host can delete lobby" ON public.lobbies
FOR DELETE TO authenticated
USING (auth.uid() = host_id);

-- Lobby members table
CREATE TABLE public.lobby_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'invited',
  joined_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lobby_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members viewable by authenticated" ON public.lobby_members
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can join lobbies" ON public.lobby_members
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership" ON public.lobby_members
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can leave lobbies" ON public.lobby_members
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for lobbies and lobby_members
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.friend_requests;

-- Add presence tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen timestamptz DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
