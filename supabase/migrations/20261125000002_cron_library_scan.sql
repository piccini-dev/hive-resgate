-- Varredura da Biblioteca (library-scan, action 'tick'): a cada 10 minutos lê até 3 lotes de
-- 12 trechos e grava as descobertas. Mesma autenticação dos outros crons: service_role no Vault.
BEGIN;
SELECT cron.unschedule('library-scan') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'library-scan');
SELECT cron.schedule('library-scan', '*/10 * * * *', $$
  select net.http_post(url := 'https://djlorvdehedcupeykyes.supabase.co/functions/v1/library-scan',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='service_role_key')),
    body := '{"action":"tick"}'::jsonb, timeout_milliseconds := 150000);
$$);
COMMIT;
