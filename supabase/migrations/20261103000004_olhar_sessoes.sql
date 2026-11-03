-- Olhar Bee · E2: conversas do agente público e a bancada de calibração (docs/olhar-bee/).
-- olhar_sessions: cada conversa (desafio → perguntas → leitura). Na E2 só nascem pela
--   bancada da Hive (origem 'bancada') ou por chamada de serviço ('teste'); o site vem na E5.
-- olhar_calibracao: o veredito de quem calibra sobre uma leitura. Os "ajustar" com
--   comentário entram no prompt do agente como ajustes de calibração (curadoria humana).
-- Escrita só pela função olhar-bee (service role). Membros da marca leem.
BEGIN;

CREATE TABLE IF NOT EXISTS public.olhar_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,   -- quem rodou na bancada; nulo para visitante do site
  origem      text NOT NULL CHECK (origem IN ('bancada','teste','site')),
  caso_codigo text,                                                -- caso fictício da bancada (C01…C14), se houver
  desafio     text NOT NULL CHECK (char_length(desafio) BETWEEN 1 AND 4000),
  perguntas   jsonb NOT NULL DEFAULT '[]',
  respostas   jsonb NOT NULL DEFAULT '[]',
  resultado   jsonb,                                               -- a última resposta do contrato (questions/reading/care/refusal)
  tipo        text CHECK (tipo IN ('questions','reading','care','refusal')),
  motivo      text,                                                -- por que o agente escolheu esse caminho (só para a bancada)
  barrado     boolean NOT NULL DEFAULT false,                      -- a revisão de nomes barrou alguma tentativa
  modelo      text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS olhar_sessions_brand_idx ON public.olhar_sessions (brand_id, origem, created_at DESC);

CREATE TABLE IF NOT EXISTS public.olhar_calibracao (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id    uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  session_id  uuid NOT NULL REFERENCES public.olhar_sessions(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  caso_codigo text,
  veredito    text NOT NULL CHECK (veredito IN ('aprovada','ajustar')),
  comentario  text CHECK (char_length(comentario) <= 2000),
  ativo       boolean NOT NULL DEFAULT true,                       -- ajuste desligado deixa de entrar no prompt
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS olhar_calibracao_brand_idx ON public.olhar_calibracao (brand_id, created_at DESC);

ALTER TABLE public.olhar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.olhar_calibracao ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.olhar_sessions, public.olhar_calibracao FROM anon;
DROP POLICY IF EXISTS olhar_sessions_member_read ON public.olhar_sessions;
CREATE POLICY olhar_sessions_member_read ON public.olhar_sessions FOR SELECT TO authenticated USING (is_brand_member(brand_id));
DROP POLICY IF EXISTS olhar_calibracao_member_read ON public.olhar_calibracao;
CREATE POLICY olhar_calibracao_member_read ON public.olhar_calibracao FOR SELECT TO authenticated USING (is_brand_member(brand_id));

COMMIT;
