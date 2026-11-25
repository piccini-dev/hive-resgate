-- Desfaz 20261125000001_estoque_vivo.sql: as duas RPCs voltam à definição de produção anterior
-- e saem a view, o gatilho, os índices e as colunas novas. As tabelas de descoberta e as
-- políticas já existiam antes (17/11) e ficam.
BEGIN;
CREATE OR REPLACE FUNCTION public.approve_cycle_production(p_cycle uuid, p_command uuid, p_expected_updated timestamp with time zone, p_bases jsonb, p_items jsonb, p_replace uuid[] DEFAULT '{}'::uuid[])
 RETURNS campaign_cycles
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE cy public.campaign_cycles; c public.contents; v public.content_base_versions;
  b jsonb; item jsonb; payload text; pos int := 0; bid uuid; old_id uuid;
BEGIN
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=p_cycle AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ciclo não encontrado.' USING ERRCODE='PT404'; END IF;
  IF p_command IS NULL OR p_replace IS NULL OR jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 40
     OR jsonb_typeof(p_bases) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Selecione de 1 a 40 peças e confira suas bases.' USING ERRCODE='PT422';
  END IF;
  payload := md5(jsonb_build_object('items',p_items,'bases',p_bases,'replace',p_replace)::text);
  IF cy.plan->'production'->>'batch_id'=p_command::text THEN
    IF cy.plan->'production'->>'payload_hash' IS DISTINCT FROM payload THEN
      RAISE EXCEPTION 'Este comando já aprovou outra proposta.' USING ERRCODE='PT409';
    END IF;
    RETURN cy;
  END IF;
  IF cy.updated_at IS DISTINCT FROM p_expected_updated THEN
    RAISE EXCEPTION 'O ciclo mudou em outra tela. Atualize antes de aprovar.' USING ERRCODE='PT409';
  END IF;
  -- Require the exact set shown in the confirmation, including a concurrent new draft.
  PERFORM 1 FROM public.user_posts WHERE cycle_id=p_cycle AND user_id=auth.uid() ORDER BY id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM public.user_posts WHERE id=ANY(p_replace) AND
      (cycle_id IS DISTINCT FROM p_cycle OR user_id IS DISTINCT FROM auth.uid() OR status NOT IN ('draft','pending_approval','idea')))
     OR (SELECT count(*) FROM public.user_posts WHERE id=ANY(p_replace)) <> cardinality(p_replace) THEN
    RAISE EXCEPTION 'A substituição contém peça protegida ou indisponível. Atualize a proposta.' USING ERRCODE='PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_posts WHERE cycle_id=p_cycle AND status IN ('draft','pending_approval','idea')
             AND NOT (id=ANY(p_replace)) AND COALESCE(metadata->>'delivery_of','')='') THEN
    RAISE EXCEPTION 'Confira as peças pendentes antes de substituir a produção.' USING ERRCODE='PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_bases) x GROUP BY x->>'id' HAVING count(*)>1) THEN
    RAISE EXCEPTION 'Há bases duplicadas na proposta.' USING ERRCODE='PT422';
  END IF;
  FOR b IN SELECT value FROM jsonb_array_elements(p_bases) ORDER BY value->>'id' LOOP
    SELECT * INTO c FROM public.contents WHERE id=(b->>'id')::uuid AND user_id=auth.uid() FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Base não encontrada.' USING ERRCODE='PT404'; END IF;
    IF NULLIF(b->>'version_id','') IS NOT NULL THEN
      SELECT * INTO v FROM public.content_base_versions WHERE id=(b->>'version_id')::uuid
        AND content_id=c.id AND user_id=auth.uid() AND status='validated';
      IF NOT FOUND OR v.body IS DISTINCT FROM b->'body' OR NOT EXISTS
        (SELECT 1 FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=c.id AND version_id=v.id AND user_id=auth.uid()) THEN
        RAISE EXCEPTION 'A versão da base mudou. Atualize antes de aprovar.' USING ERRCODE='PT409';
      END IF;
    ELSE
      IF c.cycle_id IS DISTINCT FROM p_cycle OR c.status <> 'validated' OR c.body IS DISTINCT FROM b->'body' THEN
        RAISE EXCEPTION 'A base precisa estar validada neste ciclo.' USING ERRCODE='PT409';
      END IF;
      SELECT * INTO v FROM public.content_base_versions WHERE content_id=c.id AND status='validated' AND body=c.body ORDER BY ordinal DESC LIMIT 1;
      IF NOT FOUND THEN
        INSERT INTO public.content_base_versions(content_id,user_id,draft_cycle_id,ordinal,body,considered,context_snapshot_id,note,status,validated_at)
        SELECT c.id,auth.uid(),p_cycle,COALESCE(max(ordinal),0)+1,c.body,c.considered,c.context_snapshot_id,
          'Preservação de base já validada antes da produção por formatos.','validated',now()
        FROM public.content_base_versions WHERE content_id=c.id RETURNING * INTO v;
      END IF;
      INSERT INTO public.content_base_uses(user_id,content_id,version_id,campaign_id,cycle_id,idea_id,origin,position)
      VALUES(auth.uid(),c.id,v.id,cy.campaign_id,p_cycle,c.idea_id,'legacy',c.position)
      ON CONFLICT(cycle_id,content_id) DO UPDATE SET version_id=excluded.version_id;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) x GROUP BY x->>'content_id',x->>'platform',x->>'format',x->>'editorial_slug',lower(trim(x->>'approach')) HAVING count(*)>1) THEN
    RAISE EXCEPTION 'Há peças com a mesma abordagem na proposta. Diferencie sua contribuição.' USING ERRCODE='PT422';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    bid := (item->>'content_id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_bases) base_item WHERE base_item->>'id'=bid::text) OR
       NOT EXISTS (SELECT 1 FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=bid AND user_id=auth.uid()) THEN
      RAISE EXCEPTION 'Peça sem base validada na proposta.' USING ERRCODE='PT422';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.design_variacoes WHERE manifestacao_id=item->>'template_family' AND ativo AND status='frozen') THEN
      RAISE EXCEPTION 'Esta família não tem receita pronta nesta marca.' USING ERRCODE='PT422';
    END IF;
    IF COALESCE(trim(item->>'approach'),'')='' OR COALESCE(trim(item->>'purpose'),'')='' OR
       COALESCE(item->>'format','') NOT IN ('image','carousel','story') OR
       NOT EXISTS (SELECT 1 FROM public.format_capabilities WHERE platform=item->>'platform' AND format=item->>'format') OR
       COALESCE(item->>'template_family','') NOT IN ('M01','M02','M03') THEN
      RAISE EXCEPTION 'Confira abordagem, propósito, plataforma, formato e família visual.' USING ERRCODE='PT422';
    END IF;
    IF COALESCE(item->>'editorial_slug','')='' OR NOT EXISTS
       (SELECT 1 FROM public.bee_editorials WHERE slug=item->>'editorial_slug') THEN
      RAISE EXCEPTION 'Escolha uma editoria disponível para a peça.' USING ERRCODE='PT422';
    END IF;
    IF item->>'intent_scope'='recorte' AND NULLIF(item->>'acj_primary','') IS NULL THEN RAISE EXCEPTION 'Escolha a intenção deste recorte.' USING ERRCODE='PT422'; END IF;
    IF EXISTS (SELECT 1 FROM public.content_piece_plans WHERE production_batch_id=p_command AND position=pos) THEN
      RAISE EXCEPTION 'Comando de produção já utilizado.' USING ERRCODE='PT409';
    END IF;
    IF NULLIF(item->>'context_snapshot_id','') IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.context_snapshots WHERE id=(item->>'context_snapshot_id')::uuid AND user_id=auth.uid()
        AND campaign_id=cy.campaign_id AND profile_id=(item->>'profile_id')::uuid) THEN
      RAISE EXCEPTION 'A voz desta produção não corresponde à campanha.' USING ERRCODE='PT409';
    END IF;
    SELECT version_id INTO old_id FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=bid;
    INSERT INTO public.content_piece_plans(user_id,content_id,campaign_id,cycle_id,account_id,platform,format,approach,purpose,architecture,
      origin,status,position,source_base_version_id,production_batch_id,template_family,editorial_slug,context_snapshot_id,profile_id,acj_primary,acj_secondary,acj_rationale)
    VALUES(auth.uid(),bid,cy.campaign_id,p_cycle,NULL,item->>'platform',item->>'format',left(item->>'approach',240),left(item->>'purpose',600),
      CASE WHEN item->>'format'<>'image' THEN COALESCE(NULLIF(item->>'architecture',''),'conceito') END,
      'hive','planned',pos,old_id,p_command,item->>'template_family',item->>'editorial_slug',NULLIF(item->>'context_snapshot_id','')::uuid,NULLIF(item->>'profile_id','')::uuid,NULLIF(item->>'acj_primary',''),NULLIF(item->>'acj_secondary',''),NULLIF(item->>'acj_rationale',''));
    pos := pos+1;
  END LOOP;
  -- Explicit user confirmation archives only the selected unapproved material; nothing is deleted.
  UPDATE public.user_posts SET status='archived',metadata=COALESCE(metadata,'{}')||jsonb_build_object('replaced_by_batch',p_command,'replaced_at',now())
    WHERE id=ANY(p_replace);
  UPDATE public.content_piece_plans SET status='removed' WHERE cycle_id=p_cycle AND production_batch_id IS DISTINCT FROM p_command
    AND (post_id IS NULL OR post_id=ANY(p_replace)) AND status<>'removed';
  UPDATE public.campaign_cycles SET status='producing',plan=COALESCE(plan,'{}')||jsonb_build_object('production',
    jsonb_build_object('version',2,'status','approved','batch_id',p_command,'payload_hash',payload,'approved_at',now(),'count',pos,'replaced_posts',p_replace))
    WHERE id=p_cycle RETURNING * INTO cy;
  RETURN cy;
END $function$
;

CREATE OR REPLACE FUNCTION public.save_production_progress(p_plan uuid, p_claim uuid, p_patch jsonb DEFAULT '{}'::jsonb, p_units jsonb DEFAULT NULL::jsonb, p_done boolean DEFAULT false, p_error text DEFAULT NULL::text)
 RETURNS user_posts
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$
;

DROP VIEW IF EXISTS public.discovery_availability;
DROP TRIGGER IF EXISTS trg_knowledge_discoveries_updated ON public.knowledge_discoveries;
DROP INDEX IF EXISTS public.knowledge_discoveries_user_status;
DROP INDEX IF EXISTS public.knowledge_discoveries_content;
DROP INDEX IF EXISTS public.knowledge_discoveries_tags;
DROP INDEX IF EXISTS public.content_piece_plans_discovery_ids_idx;
ALTER TABLE public.content_piece_plans DROP COLUMN IF EXISTS discovery_ids;
ALTER TABLE public.contents DROP COLUMN IF EXISTS mother_embedding, DROP COLUMN IF EXISTS mother_embedding_hash;
ALTER TABLE public.knowledge_analysis_runs DROP COLUMN IF EXISTS next_chunk;
ALTER TABLE public.knowledge_discoveries DROP COLUMN IF EXISTS kind, DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS excerpt, DROP COLUMN IF EXISTS chunk_id, DROP COLUMN IF EXISTS link_similarity,
  DROP COLUMN IF EXISTS updated_at;
COMMIT;
