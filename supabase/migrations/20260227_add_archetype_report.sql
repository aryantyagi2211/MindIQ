-- Add archetype_report column to test_results
ALTER TABLE public.test_results ADD COLUMN IF NOT EXISTS archetype_report TEXT;

-- Update the realtime publication if necessary (already done for the whole table, but good to be safe)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.test_results;
