
-- Add links column to profiles table
ALTER TABLE public.profiles ADD COLUMN links JSONB DEFAULT '[]'::jsonb;
