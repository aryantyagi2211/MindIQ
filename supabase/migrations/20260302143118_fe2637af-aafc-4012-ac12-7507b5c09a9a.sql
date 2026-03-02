
-- Recreate the policy since previous migration partially failed
-- First check if it exists, drop and recreate
DROP POLICY IF EXISTS "Participants can update battles" ON public.battles;

CREATE POLICY "Participants can update battles" ON public.battles
FOR UPDATE TO authenticated
USING (
  auth.uid() = player1_id 
  OR auth.uid() = player2_id 
  OR (status = 'waiting' AND player2_id IS NULL)
)
WITH CHECK (
  auth.uid() = player1_id 
  OR auth.uid() = player2_id
);
