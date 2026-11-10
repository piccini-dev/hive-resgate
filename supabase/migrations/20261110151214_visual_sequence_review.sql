-- Revisão visual explícita de toda a sequência, sem aprovação automática durante a geração.
-- Aditiva: não altera linhas reais nem substitui o contrato canônico approve_sequence.
BEGIN;
CREATE OR REPLACE FUNCTION public.sequence_review_material(pid uuid) RETURNS jsonb
LANGUAGE sql VOLATILE SECURITY INVOKER SET search_path=public AS $$
  SELECT jsonb_build_object('version',coalesce(p.version,1),'format',p.format,'caption',coalesce(p.caption,''),'units',
    coalesce((SELECT jsonb_agg(jsonb_build_object('id',u.id,'position',u.position,'title',coalesce(u.title,''),'body',coalesce(u.body,''),
      'layout',u.layout,'rendered_url',u.rendered_url,'text_version',u.text_version,'rendered_text_version',u.rendered_text_version) ORDER BY u.position)
      FROM public.post_units u WHERE u.post_id=p.id AND u.user_id=auth.uid()),'[]'::jsonb))
  FROM public.user_posts p WHERE p.id=pid AND p.user_id=auth.uid();
$$;
CREATE OR REPLACE FUNCTION public.approve_sequence_review(pid uuid,p_expected jsonb) RETURNS public.user_posts
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE p public.user_posts; n int; maxpos int; minpos int;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id=pid AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada.' USING ERRCODE='PT404'; END IF;
  IF p.format NOT IN ('carousel','story') OR p.metadata->>'production_flow' IS DISTINCT FROM 'base_v2' THEN
    RAISE EXCEPTION 'Use a revisão própria desta peça.' USING ERRCODE='PT422';
  END IF;
  IF p.status<>'pending_approval' THEN RAISE EXCEPTION 'A peça já saiu desta revisão. Atualize.' USING ERRCODE='PT409'; END IF;
  PERFORM 1 FROM public.post_units WHERE post_id=pid AND user_id=auth.uid() ORDER BY position FOR UPDATE;
  IF p_expected IS NULL OR public.sequence_review_material(pid) IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'O conteúdo mudou depois de abrir a revisão. Confira as imagens e o texto atualizados antes de aprovar.' USING ERRCODE='PT409';
  END IF;
  SELECT count(*),max(position),min(position) INTO n,maxpos,minpos FROM public.post_units WHERE post_id=pid;
  IF n=0 OR maxpos<>n OR minpos<>1 OR NOT EXISTS(SELECT 1 FROM public.format_capabilities WHERE platform=p.platform AND format=p.format AND n BETWEEN min_units AND max_units) THEN
    RAISE EXCEPTION 'A sequência está incompleta ou fora da capacidade do formato.' USING ERRCODE='PT422';
  END IF;
  IF EXISTS(SELECT 1 FROM public.post_units WHERE post_id=pid AND (visual_status<>'ready' OR coalesce(rendered_url,'')='' OR rendered_text_version IS DISTINCT FROM text_version OR (coalesce(trim(title),'')='' AND coalesce(trim(body),'')=''))) THEN
    RAISE EXCEPTION 'Há imagens pendentes ou desatualizadas. Produza as pendentes antes de aprovar.' USING ERRCODE='PT422';
  END IF;
  -- Este comando só é chamado após o produtor confirmar a leitura de todo o material mostrado.
  UPDATE public.user_posts SET script_status='approved' WHERE id=pid;
  UPDATE public.post_units SET review_status='approved' WHERE post_id=pid AND user_id=auth.uid();
  RETURN public.approve_sequence(pid);
END $$;
REVOKE ALL ON FUNCTION public.sequence_review_material(uuid) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.approve_sequence_review(uuid,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sequence_review_material(uuid),public.approve_sequence_review(uuid,jsonb) TO authenticated;
COMMIT;
