-- Desfaz 20261117000001_traffic_eligible_caption.sql: a view volta sem a legenda.
-- CREATE OR REPLACE não tira coluna, então recria a view.
BEGIN;
DROP VIEW IF EXISTS public.traffic_eligible_posts;
CREATE VIEW public.traffic_eligible_posts WITH (security_invoker = true) AS
SELECT p.id, p.user_id, p.title, p.platform, p.format, p.status, p.rendered_slides, p.carousel_text,
       p.published_url, p.published_at, p.metadata->>'ig_media_id' AS ig_media_id
FROM public.user_posts p
WHERE p.status IN ('approved', 'scheduled', 'published')
  AND ((p.rendered_slides IS NOT NULL AND p.rendered_slides <> '{}'::jsonb) OR p.metadata->>'ig_media_id' IS NOT NULL);
GRANT SELECT ON public.traffic_eligible_posts TO authenticated;
COMMIT;
