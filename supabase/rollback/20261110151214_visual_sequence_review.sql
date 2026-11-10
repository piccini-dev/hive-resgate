-- Usar somente depois de retirar o cliente que chama a revisão visual simplificada.
-- Preserva todas as peças, aprovações, versões e imagens já produzidas.
BEGIN;
DROP FUNCTION IF EXISTS public.approve_sequence_review(uuid,jsonb);
DROP FUNCTION IF EXISTS public.sequence_review_material(uuid);
COMMIT;
