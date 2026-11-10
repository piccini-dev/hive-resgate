-- Correção pontual: extrair metadata antes de remover campos protegidos. Sem alteração de dados.
BEGIN;
CREATE OR REPLACE FUNCTION public.save_production_progress(p_plan uuid,p_claim uuid,p_patch jsonb DEFAULT '{}',p_units jsonb DEFAULT NULL,p_done boolean DEFAULT false,p_error text DEFAULT NULL)
RETURNS public.user_posts LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE pl public.content_piece_plans; p public.user_posts; u jsonb; i int:=0;
BEGIN
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid();
  PERFORM 1 FROM public.campaign_cycles WHERE id=pl.cycle_id AND user_id=auth.uid() FOR UPDATE;
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR pl.generation_claim IS DISTINCT FROM p_claim OR p_claim IS NULL OR pl.status<>'planned' THEN
    RAISE EXCEPTION 'Esta execução não é mais a produção ativa. Atualize.' USING ERRCODE='PT409';
  END IF;
  SELECT * INTO p FROM public.user_posts WHERE id=pl.post_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT EXISTS(SELECT 1 FROM public.campaign_cycles WHERE id=pl.cycle_id AND plan->'production'->>'batch_id'=pl.production_batch_id::text) THEN
    RAISE EXCEPTION 'A proposta mudou durante a geração.' USING ERRCODE='PT409';
  END IF;
  IF p.status<>'pending_approval' THEN RAISE EXCEPTION 'A peça já saiu da produção.' USING ERRCODE='PT409'; END IF;
  IF p_error IS NOT NULL THEN
    UPDATE public.content_piece_plans SET generation_error=left(p_error,500),generation_claim=NULL,generation_until=NULL WHERE id=p_plan;
    RETURN p;
  END IF;
  IF p_patch ? 'caption' THEN p.caption:=p_patch->>'caption'; END IF;
  IF p_patch ? 'carousel_text' THEN p.carousel_text:=p_patch->'carousel_text'; END IF;
  IF p_patch ? 'rendered_slides' THEN p.rendered_slides:=p_patch->'rendered_slides'; END IF;
  IF p_patch ? 'carousel_fabric_json' THEN p.carousel_fabric_json:=p_patch->'carousel_fabric_json'; END IF;
  IF p_patch ? 'visual_decision' THEN p.visual_decision:=p_patch->'visual_decision'; END IF;
  IF p_patch ? 'visual_direction' THEN p.visual_direction:=p_patch->'visual_direction'; END IF;
  IF p_patch ? 'narrative_architecture' THEN p.narrative_architecture:=p_patch->>'narrative_architecture'; END IF;
  IF p_patch ? 'metadata' THEN p.metadata:=COALESCE(p.metadata,'{}')||
    ((p_patch->'metadata') - ARRAY['production_flow','source_base_version_id','production_batch_id','delivery_of','destinations_confirmed']); END IF;
  IF p_units IS NOT NULL THEN
    IF pl.format NOT IN ('carousel','story') OR jsonb_typeof(p_units) IS DISTINCT FROM 'array' OR NOT EXISTS
      (SELECT 1 FROM public.format_capabilities WHERE platform=pl.platform AND format=pl.format AND jsonb_array_length(p_units) BETWEEN min_units AND max_units) THEN
      RAISE EXCEPTION 'Roteiro fora da capacidade do formato.' USING ERRCODE='PT422';
    END IF;
    DELETE FROM public.post_units WHERE post_id=p.id;
    FOR u IN SELECT value FROM jsonb_array_elements(p_units) LOOP
      i:=i+1;
      INSERT INTO public.post_units(user_id,post_id,position,"function",layout,title,body,visual_direction,interaction)
      VALUES(auth.uid(),p.id,i,u->>'function',u->>'layout',u->>'title',u->>'body',u->>'visual_direction',u->'interaction');
    END LOOP;
    p.script_status:='draft';
  END IF;
  UPDATE public.user_posts SET caption=p.caption,carousel_text=p.carousel_text,rendered_slides=p.rendered_slides,carousel_fabric_json=p.carousel_fabric_json,
    visual_decision=p.visual_decision,visual_direction=p.visual_direction,narrative_architecture=p.narrative_architecture,script_status=p.script_status,
    metadata=p.metadata WHERE id=p.id RETURNING * INTO p;
  IF p_done THEN
    IF pl.format='image' AND (COALESCE(trim(p.caption),'')='' OR COALESCE(p.rendered_slides->>'slide1','')='') THEN
      RAISE EXCEPTION 'A produção ainda não terminou.' USING ERRCODE='PT422';
    ELSIF pl.format<>'image' AND NOT EXISTS(SELECT 1 FROM public.post_units WHERE post_id=p.id) THEN
      RAISE EXCEPTION 'O roteiro ainda não foi produzido.' USING ERRCODE='PT422';
    END IF;
    UPDATE public.content_piece_plans SET status='produced',generation_claim=NULL,generation_until=NULL,generation_error=NULL WHERE id=p_plan;
  END IF;
  RETURN p;
END $$;
COMMIT;
