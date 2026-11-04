-- Para a coleta diária de métricas do LinkedIn.
BEGIN;
SELECT cron.unschedule('linkedin-metrics') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'linkedin-metrics');
COMMIT;
