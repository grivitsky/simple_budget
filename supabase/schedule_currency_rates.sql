-- Enable required extensions for scheduling Edge Functions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the Edge Function to run daily at midnight UTC
-- Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- You can find it in your Supabase dashboard URL: https://YOUR_PROJECT_REF.supabase.co

SELECT cron.schedule(
  'update-currency-rates-daily',           -- Job name
  '0 0 * * *',                             -- Cron expression: daily at 00:00 UTC
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/update-currency-rates',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule the job later:
-- SELECT cron.unschedule('update-currency-rates-daily');

-- Note: You need to set the service_role_key in your database settings
-- Or use a different authentication method for the Edge Function

