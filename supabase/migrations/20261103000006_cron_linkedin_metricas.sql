-- Métricas do LinkedIn todo dia (linkedin-import, action 'tick'): de hora em hora a função
-- acompanha o run do Apify em andamento ou, se a conta foi atualizada há mais de 20h,
-- dispara um novo (40 posts recentes; histórico inteiro a cada 7 dias). Mesma autenticação
-- dos outros crons: service_role guardado no Vault.
BEGIN;
SELECT cron.unschedule('linkedin-metrics') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'linkedin-metrics');
SELECT cron.schedule('linkedin-metrics', '15 * * * *', $$
  select net.http_post(url := 'https://djlorvdehedcupeykyes.supabase.co/functions/v1/linkedin-import',
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='service_role_key')),
    body := '{"action":"tick"}'::jsonb, timeout_milliseconds := 120000);
$$);
COMMIT;
