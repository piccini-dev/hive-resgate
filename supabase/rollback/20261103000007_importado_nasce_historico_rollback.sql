-- Remove a garantia de "importado nasce histórico" (volta a depender dos importadores).
BEGIN;
DROP TRIGGER IF EXISTS user_posts_importado_historico ON public.user_posts;
DROP FUNCTION IF EXISTS public.user_posts_importado_historico();
COMMIT;
