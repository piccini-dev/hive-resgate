-- A prévia do feed no wizard de Tráfego mostra o post completo: a view de peças
-- elegíveis passa a trazer a legenda. Coluna nova no fim (CREATE OR REPLACE aceita).
BEGIN;

CREATE OR REPLACE VIEW public.traffic_eligible_posts WITH (security_invoker = true) AS
SELECT p.id, p.user_id, p.title, p.platform, p.format, p.status, p.rendered_slides, p.carousel_text,
       p.published_url, p.published_at, p.metadata->>'ig_media_id' AS ig_media_id,
       p.caption
FROM public.user_posts p
WHERE p.status IN ('approved', 'scheduled', 'published')
  AND ((p.rendered_slides IS NOT NULL AND p.rendered_slides <> '{}'::jsonb) OR p.metadata->>'ig_media_id' IS NOT NULL);

GRANT SELECT ON public.traffic_eligible_posts TO authenticated;

COMMIT;
