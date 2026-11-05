-- Volta a restrição de origem de post_metrics ao estado anterior (só instagram_api e manual).
-- As linhas das fontes novas precisam sair antes, senão a restrição antiga não volta.
BEGIN;
DELETE FROM public.post_metrics WHERE source IN ('linkedin_apify','linkedin_export');
ALTER TABLE public.post_metrics DROP CONSTRAINT IF EXISTS post_metrics_source_check;
ALTER TABLE public.post_metrics ADD CONSTRAINT post_metrics_source_check
  CHECK (source = ANY (ARRAY['instagram_api','manual']));
COMMIT;
