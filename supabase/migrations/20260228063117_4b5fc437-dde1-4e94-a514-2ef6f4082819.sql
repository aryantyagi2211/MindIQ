
-- Create battles table for 1v1 matchmaking
CREATE TABLE public.battles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player1_id uuid NOT NULL,
  player2_id uuid,
  status text NOT NULL DEFAULT 'waiting',
  field text NOT NULL,
  subfield text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Standard',
  qualification text NOT NULL DEFAULT 'Undergraduate (UG)',
  questions jsonb,
  player1_answers jsonb DEFAULT '[]'::jsonb,
  player2_answers jsonb DEFAULT '[]'::jsonb,
  player1_score integer DEFAULT 0,
  player2_score integer DEFAULT 0,
  winner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Battles viewable by everyone" ON public.battles FOR SELECT USING (true);
CREATE POLICY "Users can create battles" ON public.battles FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "Participants can update battles" ON public.battles FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;

-- Add foreign keys to fix broken PostgREST joins
ALTER TABLE public.test_results 
  ADD CONSTRAINT test_results_user_id_profiles_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.challenges 
  ADD CONSTRAINT challenges_challenger_id_profiles_fkey 
  FOREIGN KEY (challenger_id) REFERENCES public.profiles(user_id);

ALTER TABLE public.challenges 
  ADD CONSTRAINT challenges_challenged_user_id_profiles_fkey 
  FOREIGN KEY (challenged_user_id) REFERENCES public.profiles(user_id);
