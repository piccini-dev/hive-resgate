-- Olhar Bee · confidencialidade (proposta, camada 3): nomes que o agente público NUNCA pode
-- escrever — clientes, alunos, colegas e empresas presentes na biblioteca da Hive.
-- Só a ESTRUTURA fica no repositório (que é público). Os termos são gravados direto no banco,
-- a partir de uma extração da biblioteca revisada à mão (03/11/2026), e editados pela Hive.
-- Uso previsto (E2): toda leitura é conferida contra esta lista antes de aparecer ao visitante.
--   exato = true  → palavra inteira, respeitando maiúsculas (um nome que também é palavra comum só barra com maiúscula);
--   exato = false → expressão de várias palavras, sem diferenciar maiúsculas nem acentos.
BEGIN;

CREATE TABLE IF NOT EXISTS public.olhar_nomes_proibidos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id   uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  termo      text NOT NULL CHECK (char_length(termo) BETWEEN 2 AND 120),
  tipo       text NOT NULL CHECK (tipo IN ('pessoa','empresa','outro')),
  exato      boolean NOT NULL DEFAULT true,
  ativo      boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (brand_id, termo)
);

ALTER TABLE public.olhar_nomes_proibidos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.olhar_nomes_proibidos FROM anon;
DROP POLICY IF EXISTS olhar_nomes_member_read ON public.olhar_nomes_proibidos;
CREATE POLICY olhar_nomes_member_read ON public.olhar_nomes_proibidos FOR SELECT TO authenticated USING (is_brand_member(brand_id));
DROP POLICY IF EXISTS olhar_nomes_member_write ON public.olhar_nomes_proibidos;
CREATE POLICY olhar_nomes_member_write ON public.olhar_nomes_proibidos FOR ALL TO authenticated
  USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));

COMMIT;
