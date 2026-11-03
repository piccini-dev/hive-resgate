-- Devolve os 9 textos da conferência v2 para 'aguardando'.
BEGIN;
UPDATE public.olhar_base SET status = 'aguardando', updated_at = now()
 WHERE brand_id = '0b000000-0000-4000-8000-000000000002'
   AND codigo IN ('A1','C1','C3','C4','C5','C6','E6','G1','G6');
COMMIT;
