-- Reverter o app antes. Versões e usos permanecem preservados para futura retomada.
BEGIN;
REVOKE EXECUTE ON FUNCTION public.save_base_draft(uuid,uuid,jsonb,text,uuid,timestamptz,jsonb),public.validate_content_base(uuid,uuid,uuid,jsonb),public.adopt_content_base(uuid,uuid,uuid) FROM authenticated;
CREATE OR REPLACE FUNCTION public.flag_derived_pieces() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body THEN
    UPDATE public.user_posts SET metadata=coalesce(metadata,'{}')||'{"source_outdated":true}'::jsonb
    WHERE content_id=NEW.id AND piece_role='unfold' AND status NOT IN ('published','archived')
      AND source_content_at IS NOT NULL AND source_content_at<now();
  END IF;
  RETURN NEW;
END $$;
COMMIT;
