-- Desfaz a base do módulo de Tráfego (20261115000001_trafego_base.sql).
-- Apaga as campanhas registradas pela Hive (as da Meta continuam lá).
BEGIN;
DROP VIEW IF EXISTS public.traffic_eligible_posts;
DROP TABLE IF EXISTS public.traffic_ads;
DROP TABLE IF EXISTS public.traffic_campaigns;
ALTER TABLE public.meta_connections DROP CONSTRAINT IF EXISTS meta_connections_monthly_cap_check;
ALTER TABLE public.meta_connections
  DROP COLUMN IF EXISTS ad_account_id,
  DROP COLUMN IF EXISTS page_id,
  DROP COLUMN IF EXISTS ig_user_id,
  DROP COLUMN IF EXISTS monthly_cap;
COMMIT;
