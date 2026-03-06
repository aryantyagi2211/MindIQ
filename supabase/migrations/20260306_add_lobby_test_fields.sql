-- Add test configuration fields to lobbies table
ALTER TABLE public.lobbies 
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS stream text,
ADD COLUMN IF NOT EXISTS questions jsonb,
ADD COLUMN IF NOT EXISTS test_started_at timestamptz;

-- Create lobby_test_results table to track individual member results
CREATE TABLE IF NOT EXISTS public.lobby_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id uuid NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  time_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  scores jsonb,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lobby_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lobby test results" ON public.lobby_test_results
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can insert own test results" ON public.lobby_test_results
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own test results" ON public.lobby_test_results
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for lobby_test_results
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobby_test_results;
