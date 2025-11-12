-- Step 1: Find the job ID for your scheduled cron job
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE jobname = 'update-currency-rates-daily';

-- Step 2: Run the job manually using its job ID
-- Replace JOB_ID with the actual jobid from Step 1
SELECT cron.run_job(JOB_ID);

-- Step 3: Check job run history to see if it executed successfully
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = JOB_ID
ORDER BY start_time DESC
LIMIT 5;

-- Alternative: Run job by name (if you know the exact name)
-- This will find and run the job automatically
DO $$
DECLARE
  job_id BIGINT;
BEGIN
  SELECT jobid INTO job_id
  FROM cron.job
  WHERE jobname = 'update-currency-rates-daily';
  
  IF job_id IS NOT NULL THEN
    PERFORM cron.run_job(job_id);
    RAISE NOTICE 'Job % (ID: %) executed', 'update-currency-rates-daily', job_id;
  ELSE
    RAISE NOTICE 'Job not found: update-currency-rates-daily';
  END IF;
END $$;

