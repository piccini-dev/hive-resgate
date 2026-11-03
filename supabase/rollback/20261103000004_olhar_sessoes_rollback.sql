-- Desfaz a E2 do Olhar Bee: remove conversas e calibração (tabelas novas; o app volta a não tê-las).
BEGIN;
DROP TABLE IF EXISTS public.olhar_calibracao;
DROP TABLE IF EXISTS public.olhar_sessions;
COMMIT;
