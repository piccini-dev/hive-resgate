-- Métricas do LinkedIn sem API oficial (03/11/2026).
-- linkedin_apify: curtidas/reações, comentários e compartilhamentos PÚBLICOS de cada post,
--   lidos pelo scraper do Apify (sem login na conta do Marcos), uma linha por post (upsert).
-- linkedin_export: reservado para a planilha que o próprio LinkedIn exporta (impressões).
-- A tela junta as fontes campo a campo (src/lib/campaign/performance.ts → metricsByPost).
BEGIN;
ALTER TABLE public.post_metrics DROP CONSTRAINT IF EXISTS post_metrics_source_check;
ALTER TABLE public.post_metrics ADD CONSTRAINT post_metrics_source_check
  CHECK (source = ANY (ARRAY['instagram_api','manual','linkedin_apify','linkedin_export']));
COMMIT;
