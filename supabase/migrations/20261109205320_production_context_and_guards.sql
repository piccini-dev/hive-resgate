-- Explicit campaign voice is separate from the reusable knowledge source.
ALTER TABLE public.content_piece_plans
  ADD COLUMN IF NOT EXISTS context_snapshot_id uuid REFERENCES public.context_snapshots(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.communication_profiles(id) ON DELETE RESTRICT;
CREATE OR REPLACE FUNCTION public.approve_cycle_production(
  p_cycle uuid, p_command uuid, p_expected_updated timestamptz,
  p_bases jsonb, p_items jsonb, p_replace uuid[] DEFAULT '{}'
) RETURNS public.campaign_cycles
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
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
      origin,status,position,source_base_version_id,production_batch_id,template_family,editorial_slug,context_snapshot_id,profile_id)
    VALUES(auth.uid(),bid,cy.campaign_id,p_cycle,NULL,item->>'platform',item->>'format',left(item->>'approach',240),left(item->>'purpose',600),
      CASE WHEN item->>'format'<>'image' THEN COALESCE(NULLIF(item->>'architecture',''),'conceito') END,
      'hive','planned',pos,old_id,p_command,item->>'template_family',item->>'editorial_slug',NULLIF(item->>'context_snapshot_id','')::uuid,NULLIF(item->>'profile_id','')::uuid);
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
END $$;

CREATE OR REPLACE FUNCTION public.reserve_production_piece(p_plan uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE pl public.content_piece_plans; cy public.campaign_cycles; p public.user_posts; claim uuid;
BEGIN
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid();
  PERFORM 1 FROM public.campaign_cycles WHERE id=pl.cycle_id AND user_id=auth.uid() FOR UPDATE;
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item de produção não encontrado.' USING ERRCODE='PT404'; END IF;
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=pl.cycle_id AND user_id=auth.uid();
  IF cy.plan->'production'->>'batch_id' IS DISTINCT FROM pl.production_batch_id::text OR pl.status='removed' THEN
    RAISE EXCEPTION 'Esta proposta não é mais a produção aprovada.' USING ERRCODE='PT409';
  END IF;
  IF pl.post_id IS NOT NULL THEN
    SELECT * INTO p FROM public.user_posts WHERE id=pl.post_id AND user_id=auth.uid();
    IF pl.status='produced' OR p.status IN ('approved','scheduled','published') THEN RETURN jsonb_build_object('piece',to_jsonb(p),'claim',NULL,'done',true); END IF;
  END IF;
  IF pl.generation_claim IS NOT NULL AND pl.generation_until>now() THEN
    RAISE EXCEPTION 'Esta peça está sendo produzida em outra tela. Aguarde e atualize.' USING ERRCODE='PT409';
  END IF;
  claim := gen_random_uuid();
  IF p.id IS NULL THEN
    INSERT INTO public.user_posts(user_id,platform,format,status,title,caption,content_id,campaign_id,cycle_id,account_id,piece_role,plan_id,
      text_approved,image_approved,image_status,script_status,narrative_architecture,context_snapshot_id,profile_id,metadata)
    SELECT auth.uid(),pl.platform,pl.format,'pending_approval',c.title,'',pl.content_id,pl.campaign_id,pl.cycle_id,NULL,'unfold',pl.id,
      false,false,'pending',CASE WHEN pl.format IN ('carousel','story') THEN 'draft' END,pl.architecture,COALESCE(pl.context_snapshot_id,c.context_snapshot_id),COALESCE(pl.profile_id,c.profile_id),
      jsonb_build_object('production_flow','base_v2','source_base_version_id',pl.source_base_version_id,'production_batch_id',pl.production_batch_id,
        'editorial_slug',pl.editorial_slug,'template_family',pl.template_family,'review_stage',CASE WHEN pl.format='image' THEN 'text' ELSE 'script' END)
    FROM public.contents c WHERE c.id=pl.content_id AND c.user_id=auth.uid() RETURNING * INTO p;
  END IF;
  UPDATE public.content_piece_plans SET post_id=p.id,generation_claim=claim,generation_until=now()+interval '15 minutes',generation_error=NULL WHERE id=p_plan;
  RETURN jsonb_build_object('piece',to_jsonb(p),'claim',claim,'done',false);
END $$;

CREATE OR REPLACE FUNCTION public.prepare_piece_destinations(p_post uuid,p_expected_hash text,p_accounts uuid[],p_allow_repeat boolean DEFAULT false,p_repeat_note text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE p public.user_posts; q public.user_posts; child public.user_posts; u public.post_units; nu public.post_units;
  acc uuid; material text; fingerprint text; existing_ids uuid[]; current_ids uuid[]; result_ids uuid[]:='{}'; n int:=0;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id=p_post AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR COALESCE(p.metadata->>'delivery_of','')<>'' THEN RAISE EXCEPTION 'Abra a peça editorial original.' USING ERRCODE='PT404'; END IF;
  IF p.status NOT IN ('approved','scheduled','published') OR p.metadata->>'edited_after_approval'='true' THEN
    RAISE EXCEPTION 'Aprove a versão atual da peça antes de selecionar destinos.' USING ERRCODE='PT422';
  END IF;
  material:=public.production_material_hash(p.id); fingerprint:=public.production_text_hash(p.id);
  IF material IS DISTINCT FROM p_expected_hash THEN RAISE EXCEPTION 'O material mudou. Revise antes de confirmar as contas.' USING ERRCODE='PT409'; END IF;
  IF p_allow_repeat IS NULL THEN RAISE EXCEPTION 'Confirme a intenção de republicação.' USING ERRCODE='PT422'; END IF;
  IF cardinality(p_accounts) NOT BETWEEN 1 AND 20 OR p_accounts IS NULL OR cardinality(p_accounts)<>(SELECT count(DISTINCT x) FROM unnest(p_accounts) x) THEN
    RAISE EXCEPTION 'Escolha de 1 a 20 contas distintas.' USING ERRCODE='PT422';
  END IF;
  IF (SELECT count(*) FROM public.social_accounts WHERE id=ANY(p_accounts) AND user_id=auth.uid() AND platform=p.platform AND status='connected')<>cardinality(p_accounts) THEN
    RAISE EXCEPTION 'Uma das contas não pertence à sua voz, está desconectada ou é de outra plataforma.' USING ERRCODE='PT422';
  END IF;
  PERFORM 1 FROM public.user_posts WHERE user_id=auth.uid() AND metadata->>'delivery_of'=p.id::text ORDER BY id FOR UPDATE;
  SELECT array_agg(account_id ORDER BY account_id),array_agg(id ORDER BY id) INTO current_ids,existing_ids FROM public.user_posts
    WHERE user_id=auth.uid() AND (id=p.id OR metadata->>'delivery_of'=p.id::text) AND status<>'archived';
  IF COALESCE(p.metadata->>'intentional_republish','false')=p_allow_repeat::text
     AND (NOT p_allow_repeat OR p.metadata->>'republish_note'=p_repeat_note)
     AND current_ids=(SELECT array_agg(x ORDER BY x) FROM unnest(p_accounts) x) AND p.metadata->>'destination_material_hash'=material
     AND NOT EXISTS(SELECT 1 FROM public.user_posts WHERE id=ANY(existing_ids) AND id<>p.id AND metadata->>'delivery_source_hash' IS DISTINCT FROM material) THEN
    RETURN jsonb_build_object('post_ids',existing_ids,'unchanged',true);
  END IF;
  IF p.status IN ('scheduled','published') OR EXISTS(SELECT 1 FROM public.user_posts WHERE id=ANY(existing_ids) AND status IN ('scheduled','published')) THEN
    RAISE EXCEPTION 'Há uma publicação ou agendamento protegido. Desfaça o agendamento antes de mudar os destinos.' USING ERRCODE='PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_posts x WHERE x.user_id=auth.uid() AND x.platform=p.platform AND x.account_id=ANY(p_accounts)
    AND x.id<>p.id AND COALESCE(x.metadata->>'delivery_of','')<>p.id::text
    AND (x.status IN ('approved','scheduled','published') OR x.published_at IS NOT NULL) AND public.production_text_hash(x.id)=fingerprint)
    AND (NOT p_allow_repeat OR length(trim(COALESCE(p_repeat_note,'')))<5) THEN
    RAISE EXCEPTION 'O mesmo conteúdo já existe em um dos destinos. Confirme a republicação intencional e explique o motivo.' USING ERRCODE='PT422';
  END IF;
  -- Old unscheduled deliveries stay in history; the editorial review is never duplicated.
  UPDATE public.user_posts SET status='archived' WHERE id=ANY(existing_ids) AND id<>p.id;
  FOREACH acc IN ARRAY p_accounts LOOP
    n:=n+1;
    IF n=1 THEN
      UPDATE public.user_posts SET account_id=acc,metadata=COALESCE(metadata,'{}')||jsonb_build_object('destinations_confirmed',true,'destination_account_id',acc,'destination_material_hash',material,
        'intentional_republish',p_allow_repeat,'republish_note',p_repeat_note,'republish_text_hash',fingerprint,'destinations_at',now()) WHERE id=p.id RETURNING * INTO q;
    ELSE
      q:=p; q.id:=gen_random_uuid(); q.codigo:=NULL; q.plan_id:=NULL; q.account_id:=acc;
      q.status:='pending_approval'; q.version:=1; q.approved_version:=NULL; q.scheduled_version:=NULL; q.scheduled_package_id:=NULL;
      q.scheduled_date:=NULL; q.published_date:=NULL; q.published_at:=NULL; q.published_url:=NULL; q.publish_error:=NULL; q.publish_attempts:=0;
      q.alternative_group:=NULL; q.alternative_rank:=NULL; q.is_recommended:=false; q.created_at:=now(); q.updated_at:=now();
      q.export_package:=NULL; q.text_approved:=false; q.image_approved:=false; q.image_status:='pending';
      IF q.format IN ('carousel','story') THEN q.script_status:='draft'; END IF;
      q.metadata:=(COALESCE(p.metadata,'{}')-ARRAY['review_evidence','destinations_confirmed','destination_material_hash','edited_after_approval'])||jsonb_build_object(
        'delivery_of',p.id,'delivery_source_hash',material,'destinations_confirmed',true,'destination_account_id',acc,'intentional_republish',p_allow_repeat,'republish_note',p_repeat_note,'republish_text_hash',fingerprint,'destinations_at',now());
      INSERT INTO public.user_posts SELECT q.* RETURNING * INTO q;
      IF q.format IN ('carousel','story') THEN
        FOR u IN SELECT * FROM public.post_units WHERE post_id=p.id ORDER BY position LOOP
          nu:=u; nu.id:=gen_random_uuid(); nu.post_id:=q.id; nu.created_at:=now(); nu.updated_at:=now();
          INSERT INTO public.post_units SELECT nu.*;
        END LOOP;
        UPDATE public.user_posts SET script_status='approved' WHERE id=q.id;
        SELECT * INTO q FROM public.approve_sequence(q.id);
      ELSE
        SELECT * INTO q FROM public.approve_piece(q.id,q.rendered_slides->>'slide1',false);
      END IF;
      UPDATE public.user_posts SET metadata=metadata||jsonb_build_object('destination_material_hash',public.production_material_hash(q.id)) WHERE id=q.id;
    END IF;
    result_ids:=array_append(result_ids,q.id);
  END LOOP;
  RETURN jsonb_build_object('post_ids',result_ids,'unchanged',false);
END $$;

-- Consistent cycle → plan → post lock order, and destination identity bound to the confirmation.
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
    (p_patch->'metadata' - ARRAY['production_flow','source_base_version_id','production_batch_id','delivery_of','destinations_confirmed']); END IF;
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

  IF p_scope IN ('schedule','publish') AND p.metadata->>'production_flow'='base_v2' THEN
    IF p.account_id IS NULL OR p.metadata->>'destination_account_id' IS DISTINCT FROM p.account_id::text OR p.metadata->>'destinations_confirmed' IS DISTINCT FROM 'true'
       OR p.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(p.id) THEN
      miss:=miss||jsonb_build_object('component','destinos','reason','Confirme as contas para esta versão aprovada antes de agendar.');
    END IF;
    IF EXISTS(SELECT 1 FROM public.user_posts x WHERE x.user_id=p.user_id AND x.platform=p.platform AND x.account_id=p.account_id
      AND x.id<>p.id AND COALESCE(x.metadata->>'delivery_of','')<>COALESCE(NULLIF(p.metadata->>'delivery_of',''),p.id::text)
      AND x.id::text<>COALESCE(p.metadata->>'delivery_of','') AND (x.status IN ('approved','scheduled','published') OR x.published_at IS NOT NULL)
      AND public.production_text_hash(x.id)=public.production_text_hash(p.id))
      AND NOT (COALESCE(p.metadata->>'intentional_republish','false')='true' AND length(trim(COALESCE(p.metadata->>'republish_note','')))>=5
        AND p.metadata->>'republish_text_hash'=public.production_text_hash(p.id)) THEN
      miss:=miss||jsonb_build_object('component','repeticao','reason','O mesmo conteúdo já existe nesta conta e plataforma. Confirme uma republicação intencional antes de continuar.');
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


CREATE INDEX IF NOT EXISTS content_piece_plans_batch_idx ON public.content_piece_plans(cycle_id,production_batch_id,status) WHERE production_batch_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS posts_repetition_destination_idx ON public.user_posts(user_id,platform,account_id) WHERE status IN ('approved','scheduled','published');
