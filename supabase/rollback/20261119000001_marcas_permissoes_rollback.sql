-- #111 rollback: restaurar exatamente a política/grants/RPC observados antes da mudança.
BEGIN;
DROP POLICY IF EXISTS brands_read_member ON public.brands;
DROP POLICY IF EXISTS brands_insert_manager ON public.brands;
DROP POLICY IF EXISTS brands_update_manager ON public.brands;
DROP POLICY IF EXISTS brands_member ON public.brands;
CREATE POLICY brands_member ON public.brands FOR ALL TO authenticated
  USING (public.is_workspace_member(workspace_id))
  WITH CHECK (public.is_workspace_member(workspace_id));

REVOKE UPDATE (name, essence) ON public.brands FROM authenticated;
GRANT UPDATE, DELETE ON public.brands TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.set_brand_archived(p_brand uuid, p_archived boolean)
RETURNS public.brands LANGUAGE plpgsql SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE result public.brands;
BEGIN
  SELECT * INTO result FROM public.brands WHERE id=p_brand AND public.is_brand_member(id) FOR UPDATE;
  IF result.id IS NULL THEN RAISE EXCEPTION 'Marca não disponível.' USING ERRCODE='PT404'; END IF;
  IF p_archived AND (EXISTS(SELECT 1 FROM public.campaigns c JOIN public.communication_profiles p ON p.id=c.profile_id WHERE p.brand_id=p_brand AND c.status IN ('draft','active','paused'))
    OR EXISTS(SELECT 1 FROM public.user_posts u JOIN public.communication_profiles p ON p.id=u.profile_id WHERE p.brand_id=p_brand AND u.status IN ('approved','scheduled'))) THEN
    RAISE EXCEPTION 'Esta marca possui campanhas ou peças em andamento. Conclua ou revise esses vínculos antes de arquivar.' USING ERRCODE='PT409';
  END IF;
  UPDATE public.brands SET status=CASE WHEN p_archived THEN 'archived' ELSE 'active' END,updated_at=now() WHERE id=p_brand RETURNING * INTO result;
  RETURN result;
END $function$;
REVOKE ALL ON FUNCTION public.set_brand_archived(uuid,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_brand_archived(uuid,boolean) TO authenticated, service_role;
DROP FUNCTION IF EXISTS public.can_manage_workspace_brand(uuid);
COMMIT;
