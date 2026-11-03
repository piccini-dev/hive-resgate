-- Olhar Bee · E1: aprova os 9 textos da conferência v2 (03/11/2026), que fecha a base pública.
-- A1 C1 C3 C4 C5 C6 E6 G1 foram reescritos a partir da revisão 1 do Marcos; G6 é novo (CVV só com sinal de risco).
-- Idempotente: só muda o que ainda está 'aguardando'.
BEGIN;
UPDATE public.olhar_base SET status = 'aprovado', updated_at = now()
 WHERE brand_id = '0b000000-0000-4000-8000-000000000002'
   AND codigo IN ('A1','C1','C3','C4','C5','C6','E6','G1','G6')
   AND status = 'aguardando';
COMMIT;
