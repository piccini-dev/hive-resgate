-- Módulo de Tráfego · base (docs/plano/PLANO.md §6). Aditiva e idempotente.
-- Configuração da conta que anuncia (meta_connections), intenção das campanhas
-- criadas pela Hive (traffic_campaigns/traffic_ads; métricas só no espelho meta_*)
-- e a regra única de conteúdo elegível (traffic_eligible_posts).
BEGIN;

ALTER TABLE public.meta_connections
  ADD COLUMN IF NOT EXISTS ad_account_id text,
  ADD COLUMN IF NOT EXISTS page_id text,
  ADD COLUMN IF NOT EXISTS ig_user_id text,
  ADD COLUMN IF NOT EXISTS monthly_cap numeric;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'meta_connections_monthly_cap_check') THEN
    ALTER TABLE public.meta_connections
      ADD CONSTRAINT meta_connections_monthly_cap_check CHECK (monthly_cap IS NULL OR monthly_cap > 0);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.traffic_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  objective text CHECK (objective IN ('OUTCOME_AWARENESS', 'OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'creating', 'paused', 'active', 'ended', 'failed')),
  step smallint NOT NULL DEFAULT 1,
  draft jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  fb_campaign_id text,
  fb_adset_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  ended_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_traffic_campaigns_user ON public.traffic_campaigns (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.traffic_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.traffic_campaigns(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.user_posts(id) ON DELETE RESTRICT,
  mode text NOT NULL CHECK (mode IN ('ig_post', 'new_creative')),
  primary_text text,
  headline text,
  cta text,
  link_url text,
  fb_creative_id text,
  fb_ad_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_traffic_ads_campaign ON public.traffic_ads (campaign_id);

-- RLS: só o dono (padrão do projeto).
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['traffic_campaigns', 'traffic_ads'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_owner', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t || '_owner', t);
  END LOOP;
END $$;

-- Conteúdo que o módulo pode anunciar: aprovado, agendado ou publicado, e com arte.
-- security_invoker: a RLS de user_posts vale para quem consulta.
CREATE OR REPLACE VIEW public.traffic_eligible_posts WITH (security_invoker = true) AS
SELECT p.id, p.user_id, p.title, p.platform, p.format, p.status, p.rendered_slides, p.carousel_text,
       p.published_url, p.published_at, p.metadata->>'ig_media_id' AS ig_media_id
FROM public.user_posts p
WHERE p.status IN ('approved', 'scheduled', 'published')
  AND ((p.rendered_slides IS NOT NULL AND p.rendered_slides <> '{}'::jsonb) OR p.metadata->>'ig_media_id' IS NOT NULL);

GRANT SELECT ON public.traffic_eligible_posts TO authenticated;

COMMIT;
