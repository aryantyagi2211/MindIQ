-- Fix offline users: Set users as offline if their last_seen is older than 30 seconds
UPDATE profiles
SET is_online = false
WHERE last_seen < NOW() - INTERVAL '30 seconds'
  AND is_online = true;

-- Create a function to automatically mark stale users as offline
CREATE OR REPLACE FUNCTION mark_stale_users_offline()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE profiles
  SET is_online = false
  WHERE last_seen < NOW() - INTERVAL '30 seconds'
    AND is_online = true;
END;
$$;

-- Optional: Create a scheduled job to run this every minute
-- Note: This requires pg_cron extension which may not be available on all Supabase plans
-- If you have pg_cron, uncomment the following:
-- SELECT cron.schedule(
--   'mark-stale-users-offline',
--   '* * * * *', -- Every minute
--   'SELECT mark_stale_users_offline();'
-- );
