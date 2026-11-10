-- Correct unambiguous JSON alias discovered by authenticated transaction tests.
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
    SELECT version_id INTO old_id FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=bid;
    INSERT INTO public.content_piece_plans(user_id,content_id,campaign_id,cycle_id,account_id,platform,format,approach,purpose,architecture,
      origin,status,position,source_base_version_id,production_batch_id,template_family,editorial_slug)
    VALUES(auth.uid(),bid,cy.campaign_id,p_cycle,NULL,item->>'platform',item->>'format',left(item->>'approach',240),left(item->>'purpose',600),
      CASE WHEN item->>'format'<>'image' THEN COALESCE(NULLIF(item->>'architecture',''),'conceito') END,
      'hive','planned',pos,old_id,p_command,item->>'template_family',item->>'editorial_slug');
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

