-- Revert the app before this rollback. Never erase production history.
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM public.campaign_cycles WHERE plan->'production'->>'version'='2') THEN
    RAISE EXCEPTION 'Há ciclos usando produção v2. Preserve o app compatível e faça rollback dirigido; não reative a geração legada nesses ciclos.';
  END IF;
END $$;
DROP TRIGGER IF EXISTS guard_production_v2 ON public.user_posts;
DROP FUNCTION IF EXISTS public.guard_production_v2();
DROP FUNCTION IF EXISTS public.approve_cycle_production(uuid,uuid,timestamptz,jsonb,jsonb,uuid[]);
DROP FUNCTION IF EXISTS public.reserve_production_piece(uuid);
DROP FUNCTION IF EXISTS public.save_production_progress(uuid,uuid,jsonb,jsonb,boolean,text);
DROP FUNCTION IF EXISTS public.prepare_piece_destinations(uuid,text,uuid[],boolean,text);
DROP FUNCTION IF EXISTS public.complete_cycle_production(uuid);
DROP FUNCTION IF EXISTS public.select_production_alternative(uuid);
DROP FUNCTION IF EXISTS public.publication_material(uuid);
CREATE OR REPLACE FUNCTION public.piece_readiness(p_post uuid, p_scope text DEFAULT 'schedule'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  p public.user_posts%ROWTYPE; cap public.format_capabilities%ROWTYPE; acc record; st record;
  miss jsonb := '[]'::jsonb; n int; bad int; variant text;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = p_post;
  IF NOT FOUND THEN RETURN jsonb_build_object('ready', false, 'missing', jsonb_build_array(jsonb_build_object('component', 'peca', 'reason', 'Peça não encontrada.'))); END IF;
  IF p.status = 'published' OR (p.status = 'archived' AND p.published_at IS NOT NULL) THEN
    RETURN jsonb_build_object('ready', false, 'missing', jsonb_build_array(jsonb_build_object('component', 'historico', 'reason', 'Este conteúdo já foi publicado e permanece no histórico.')));
  END IF;

  IF p.format IN ('carousel', 'story') THEN
    SELECT * INTO cap FROM public.format_capabilities WHERE platform = p.platform AND format = p.format;
    IF p.script_status IS DISTINCT FROM 'approved' THEN miss := miss || jsonb_build_object('component', 'roteiro', 'reason', 'Roteiro ainda não aprovado.'); END IF;
    SELECT count(*), count(*) FILTER (WHERE visual_status <> 'ready' OR rendered_url IS NULL OR review_status <> 'approved') INTO n, bad FROM public.post_units WHERE post_id = p_post;
    IF n = 0 OR (cap.platform IS NOT NULL AND (n < cap.min_units OR n > cap.max_units)) THEN
      miss := miss || jsonb_build_object('component', 'paginas', 'reason', format('Sequência com %s página(s); o formato aceita de %s a %s.', n, cap.min_units, cap.max_units));
    END IF;
    IF bad > 0 THEN miss := miss || jsonb_build_object('component', 'paginas', 'reason', format('%s página(s) sem visual pronto ou sem aprovação.', bad)); END IF;
    IF p.format <> 'story' AND COALESCE(trim(p.caption), '') = '' THEN miss := miss || jsonb_build_object('component', 'legenda', 'reason', 'Falta a legenda.'); END IF;
    IF p_scope <> 'approve_piece' AND p.approved_version IS DISTINCT FROM p.version THEN
      miss := miss || jsonb_build_object('component', 'aprovacao', 'reason', 'A sequência completa ainda não foi aprovada nesta versão.');
    END IF;
  ELSIF p.format IN ('video', 'reel') THEN
    IF COALESCE(p.metadata->>'video_url', '') = '' THEN miss := miss || jsonb_build_object('component', 'video', 'reason', 'Vídeo não encontrado na peça.'); END IF;
    IF COALESCE(trim(p.caption), '') = '' THEN miss := miss || jsonb_build_object('component', 'legenda', 'reason', 'Falta a legenda.'); END IF;
  ELSE
    IF COALESCE(trim(p.caption), '') = '' THEN miss := miss || jsonb_build_object('component', 'legenda', 'reason', 'Falta a legenda.'); END IF;
    IF COALESCE(p.rendered_slides->>'slide1', '') = '' THEN miss := miss || jsonb_build_object('component', 'imagem', 'reason', 'Imagem final não renderizada.'); END IF;
    variant := p.visual_decision->>'variant';
    IF (variant IN ('M01-D', 'M01-E') OR variant LIKE 'M02-%') AND (p.metadata->>'bg_approved') IS DISTINCT FROM 'true' THEN
      miss := miss || jsonb_build_object('component', 'imagem_ia', 'reason', 'A imagem gerada por IA precisa ser aprovada.');
    END IF;
  END IF;

  IF p_scope IN ('schedule', 'publish') THEN
    IF (p.metadata->>'edited_after_approval') = 'true' THEN miss := miss || jsonb_build_object('component', 'aprovacao', 'reason', 'Há alterações ainda não aprovadas: aprove a peça antes.'); END IF;
    IF p.status NOT IN ('approved', 'scheduled') THEN miss := miss || jsonb_build_object('component', 'aprovacao', 'reason', 'A peça ainda não foi aprovada.'); END IF;
    IF p.account_id IS NOT NULL THEN
      SELECT id, user_id, platform, status, label INTO acc FROM public.social_accounts WHERE id = p.account_id;
      IF acc.id IS NULL OR acc.user_id <> p.user_id THEN miss := miss || jsonb_build_object('component', 'conta', 'reason', 'A conta desta peça não existe mais. Escolha outra conta.');
      ELSIF acc.platform <> p.platform THEN miss := miss || jsonb_build_object('component', 'conta', 'reason', format('A conta "%s" é de outra rede.', acc.label));
      ELSIF acc.status <> 'connected' THEN miss := miss || jsonb_build_object('component', 'conta', 'reason', format('A conta "%s" está desconectada.', acc.label));
      END IF;
    ELSE
      SELECT linkedin_token, linkedin_author_urn, instagram_access_token, instagram_business_account_id INTO st FROM public.user_settings WHERE user_id = p.user_id;
      IF (p.platform = 'linkedin' AND (st.linkedin_token IS NULL OR st.linkedin_author_urn IS NULL))
         OR (p.platform = 'instagram' AND (st.instagram_access_token IS NULL OR st.instagram_business_account_id IS NULL)) THEN
        miss := miss || jsonb_build_object('component', 'conta', 'reason', 'Nenhuma conta conectada para esta rede.');
      END IF;
    END IF;
  END IF;
  RETURN jsonb_build_object('ready', jsonb_array_length(miss) = 0, 'missing', miss);
END $function$

;
DROP FUNCTION IF EXISTS public.production_material_hash(uuid);
DROP FUNCTION IF EXISTS public.production_text_hash(uuid);
-- Keep nullable claim columns and historical JSON; they are harmless and may hold evidence.
