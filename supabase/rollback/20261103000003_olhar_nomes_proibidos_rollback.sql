-- Remove a lista de nomes proibidos do Olhar Bee (tabela nova; nada depende dela ainda).
BEGIN;
DROP TABLE IF EXISTS public.olhar_nomes_proibidos;
COMMIT;
