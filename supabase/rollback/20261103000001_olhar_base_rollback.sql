-- Desfaz a E1 do Olhar Bee: remove a base pública (tabela nova, nada mais depende dela).
BEGIN;
DROP TABLE IF EXISTS public.olhar_base;
COMMIT;
