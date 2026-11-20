-- #111 M01: restringir manutenção de marcas a owner/editor.
-- Preparação apenas: NÃO aplicar ao banco compartilhado sem portão de validação.
BEGIN;

CREATE OR REPLACE FUNCTION public.can_manage_workspace_brand(p_workspace uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members m
    WHERE m.workspace_id = p_workspace
      AND m.user_id = (SELECT auth.uid())
      AND m.role IN ('owner','editor')
  );
$$;
REVOKE ALL ON FUNCTION public.can_manage_workspace_brand(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_manage_workspace_brand(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS brands_member ON public.brands;
DROP POLICY IF EXISTS brands_read_member ON public.brands;
DROP POLICY IF EXISTS brands_insert_manager ON public.brands;
DROP POLICY IF EXISTS brands_update_manager ON public.brands;
CREATE POLICY brands_read_member ON public.brands FOR SELECT TO authenticated
  USING (public.is_workspace_member(workspace_id));
CREATE POLICY brands_insert_manager ON public.brands FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_workspace_brand(workspace_id));
CREATE POLICY brands_update_manager ON public.brands FOR UPDATE TO authenticated
  USING (public.can_manage_workspace_brand(workspace_id))
  WITH CHECK (public.can_manage_workspace_brand(workspace_id));

-- Partir de privilégio mínimo: TRUNCATE ignora RLS e não pode permanecer
-- herdado do GRANT ALL anterior, nem TRIGGER/REFERENCES/MAINTAIN.
-- O anônimo não precisa acessar a tabela; a leitura autorizada é de membros.
REVOKE ALL ON public.brands FROM PUBLIC, authenticated, anon;
GRANT SELECT, INSERT ON public.brands TO authenticated;
GRANT UPDATE (name, essence) ON public.brands TO authenticated;

-- A RPC é o único caminho de alteração de status, preservando PT404/PT409.
-- SECURITY DEFINER é necessário para a RPC atualizar status sem liberar
-- essa coluna no REST. Toda autorização é revalidada dentro da função.
CREATE OR REPLACE FUNCTION public.set_brand_archived(p_brand uuid, p_archived boolean)
RETURNS public.brands LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE result public.brands;
BEGIN
  SELECT * INTO result FROM public.brands b
   WHERE b.id=p_brand AND public.can_manage_workspace_brand(b.workspace_id)
   FOR UPDATE;
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Marca não disponível.' USING ERRCODE='PT404';
  END IF;
  IF p_archived AND (
    EXISTS(SELECT 1 FROM public.campaigns c JOIN public.communication_profiles p
      ON p.id=c.profile_id WHERE p.brand_id=p_brand AND c.status IN ('draft','active','paused'))
    OR EXISTS(SELECT 1 FROM public.user_posts u JOIN public.communication_profiles p
      ON p.id=u.profile_id WHERE p.brand_id=p_brand AND u.status IN ('approved','scheduled'))
  ) THEN
    RAISE EXCEPTION 'Esta marca possui campanhas ou peças em andamento. Conclua ou revise esses vínculos antes de arquivar.'
      USING ERRCODE='PT409';
  END IF;
  UPDATE public.brands SET status=CASE WHEN p_archived THEN 'archived' ELSE 'active' END,
    updated_at=now() WHERE id=p_brand RETURNING * INTO result;
  RETURN result;
END $function$;
REVOKE ALL ON FUNCTION public.set_brand_archived(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_brand_archived(uuid,boolean) TO authenticated, service_role;
COMMIT;
