
-- Fix: Allow lobby host to invite players (not just self-insert)
DROP POLICY IF EXISTS "Users can join lobbies" ON public.lobby_members;
CREATE POLICY "Users can join lobbies"
ON public.lobby_members FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.lobbies 
    WHERE id = lobby_id AND host_id = auth.uid() AND status = 'waiting'
  )
);

-- Enable realtime for profiles table (for online/offline status)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
