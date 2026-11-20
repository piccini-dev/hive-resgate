-- #111: baseline de metadados Storage, somente para instância local descartável.
-- Nenhum arquivo ou linha de produção é copiado. Não é migration de produção.
BEGIN;
DROP POLICY IF EXISTS "design_obj_delete" ON storage."objects";
CREATE POLICY "design_obj_delete" ON storage."objects" AS PERMISSIVE FOR DELETE TO "authenticated"
  USING ((bucket_id = 'design'::text));
DROP POLICY IF EXISTS "design_obj_read" ON storage."objects";
CREATE POLICY "design_obj_read" ON storage."objects" AS PERMISSIVE FOR SELECT TO PUBLIC
  USING ((bucket_id = 'design'::text));
DROP POLICY IF EXISTS "design_obj_update" ON storage."objects";
CREATE POLICY "design_obj_update" ON storage."objects" AS PERMISSIVE FOR UPDATE TO "authenticated"
  USING ((bucket_id = 'design'::text));
DROP POLICY IF EXISTS "design_obj_write" ON storage."objects";
CREATE POLICY "design_obj_write" ON storage."objects" AS PERMISSIVE FOR INSERT TO "authenticated"
  WITH CHECK ((bucket_id = 'design'::text));
DROP POLICY IF EXISTS "media_authenticated_upload" ON storage."objects";
CREATE POLICY "media_authenticated_upload" ON storage."objects" AS PERMISSIVE FOR INSERT TO "authenticated"
  WITH CHECK (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
DROP POLICY IF EXISTS "media_delete_own" ON storage."objects";
CREATE POLICY "media_delete_own" ON storage."objects" AS PERMISSIVE FOR DELETE TO "authenticated"
  USING (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
DROP POLICY IF EXISTS "media_owner_delete" ON storage."objects";
CREATE POLICY "media_owner_delete" ON storage."objects" AS PERMISSIVE FOR DELETE TO "authenticated"
  USING (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
DROP POLICY IF EXISTS "media_owner_update" ON storage."objects";
CREATE POLICY "media_owner_update" ON storage."objects" AS PERMISSIVE FOR UPDATE TO "authenticated"
  USING (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
DROP POLICY IF EXISTS "media_public_read" ON storage."objects";
CREATE POLICY "media_public_read" ON storage."objects" AS PERMISSIVE FOR SELECT TO PUBLIC
  USING ((bucket_id = 'media'::text));
DROP POLICY IF EXISTS "media_read_public" ON storage."objects";
CREATE POLICY "media_read_public" ON storage."objects" AS PERMISSIVE FOR SELECT TO PUBLIC
  USING ((bucket_id = 'media'::text));
DROP POLICY IF EXISTS "media_update_own" ON storage."objects";
CREATE POLICY "media_update_own" ON storage."objects" AS PERMISSIVE FOR UPDATE TO "authenticated"
  USING (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
DROP POLICY IF EXISTS "media_upload_own" ON storage."objects";
CREATE POLICY "media_upload_own" ON storage."objects" AS PERMISSIVE FOR INSERT TO "authenticated"
  WITH CHECK (((bucket_id = 'media'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));
DROP POLICY IF EXISTS "packages_public_read" ON storage."objects";
CREATE POLICY "packages_public_read" ON storage."objects" AS PERMISSIVE FOR SELECT TO PUBLIC
  USING ((bucket_id = 'packages'::text));
COMMIT;
