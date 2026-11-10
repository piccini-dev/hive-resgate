-- Confirmed destination identity must match both the master and each delivery.
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
     AND NOT EXISTS(SELECT 1 FROM public.user_posts x WHERE x.id=ANY(existing_ids) AND (
       x.metadata->>'destination_account_id' IS DISTINCT FROM x.account_id::text
       OR x.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(x.id)
       OR (x.id<>p.id AND x.metadata->>'delivery_source_hash' IS DISTINCT FROM material))) THEN
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

CREATE OR REPLACE FUNCTION public.complete_cycle_production(p_cycle uuid) RETURNS public.campaign_cycles
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE cy public.campaign_cycles; pl public.content_piece_plans; p public.user_posts; n int:=0;
BEGIN
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=p_cycle AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR cy.plan->'production'->>'version' IS DISTINCT FROM '2' THEN RAISE EXCEPTION 'Produção indisponível.' USING ERRCODE='PT404'; END IF;
  FOR pl IN SELECT * FROM public.content_piece_plans WHERE cycle_id=p_cycle AND production_batch_id::text=cy.plan->'production'->>'batch_id' AND status<>'removed' ORDER BY id FOR UPDATE LOOP
    n:=n+1;
    SELECT * INTO p FROM public.user_posts WHERE id=pl.post_id AND user_id=auth.uid() FOR UPDATE;
    IF pl.status<>'produced' OR p.id IS NULL OR p.status NOT IN ('approved','scheduled','published') OR p.account_id IS NULL
      OR p.metadata->>'destination_account_id' IS DISTINCT FROM p.account_id::text
      OR p.metadata->>'destinations_confirmed' IS DISTINCT FROM 'true' OR p.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(p.id) THEN
      RAISE EXCEPTION 'Há peça pendente de produção, aprovação ou confirmação de destinos.' USING ERRCODE='PT422';
    END IF;
  END LOOP;
  IF EXISTS(SELECT 1 FROM public.user_posts child JOIN public.user_posts master ON child.metadata->>'delivery_of'=master.id::text
    WHERE master.cycle_id=p_cycle AND master.metadata->>'production_batch_id'=cy.plan->'production'->>'batch_id' AND child.status<>'archived'
      AND (child.status NOT IN ('approved','scheduled','published') OR child.account_id IS NULL
        OR child.metadata->>'destination_account_id' IS DISTINCT FROM child.account_id::text
        OR child.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(child.id)
        OR child.metadata->>'delivery_source_hash' IS DISTINCT FROM public.production_material_hash(master.id))) THEN
    RAISE EXCEPTION 'Há destino com material ou conta alterados. Confira a peça antes de concluir.' USING ERRCODE='PT422';
  END IF;
  IF n=0 THEN RAISE EXCEPTION 'A produção não tem peças.' USING ERRCODE='PT422'; END IF;
  UPDATE public.campaign_cycles SET status='ready' WHERE id=p_cycle RETURNING * INTO cy;
  RETURN cy;
END $$;
