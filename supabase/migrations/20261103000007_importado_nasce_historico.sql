-- Identidade (Fase 1, f15 "histórico importado não é referência de voz"): todo post
-- importado (Instagram/LinkedIn) nasce reference_status = 'historical'. A migration
-- 20261015000001 corrigiu o que existia, mas os importadores não gravam o campo — a
-- importação do LinkedIn de 03/11 criou 5 posts sem ele. A garantia fica no banco,
-- valendo para qualquer importador, atual ou futuro.
BEGIN;
CREATE OR REPLACE FUNCTION public.user_posts_importado_historico() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reference_status IS NULL AND NEW.metadata->>'imported_from' IN ('instagram', 'linkedin') THEN
    NEW.reference_status := 'historical';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS user_posts_importado_historico ON public.user_posts;
CREATE TRIGGER user_posts_importado_historico BEFORE INSERT ON public.user_posts
  FOR EACH ROW EXECUTE FUNCTION public.user_posts_importado_historico();
COMMIT;
