-- Conteúdo-base é conhecimento versionado; campanha guarda seu uso, peça guarda seu destino.
-- Aditiva: nenhuma base, aprovação ou peça legada é reescrita nesta migration.
BEGIN;

CREATE TABLE IF NOT EXISTS public.content_base_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  draft_cycle_id uuid REFERENCES public.campaign_cycles(id) ON DELETE SET NULL,
  ordinal integer NOT NULL CHECK (ordinal > 0),
  body jsonb NOT NULL,
  considered jsonb,
  context_snapshot_id uuid,
  note text,
  status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','validated','superseded')),
  created_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  UNIQUE(content_id,ordinal),
  CHECK ((status='validated') = (validated_at IS NOT NULL))
);
CREATE TABLE IF NOT EXISTS public.content_base_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  content_id uuid NOT NULL REFERENCES public.contents(id) ON DELETE RESTRICT,
  version_id uuid NOT NULL REFERENCES public.content_base_versions(id) ON DELETE RESTRICT,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  cycle_id uuid NOT NULL REFERENCES public.campaign_cycles(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES public.ideas(id) ON DELETE SET NULL,
  origin text NOT NULL CHECK(origin IN ('new','archive','legacy')),
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cycle_id,content_id)
);
CREATE INDEX IF NOT EXISTS content_base_versions_owner ON public.content_base_versions(user_id,content_id,ordinal DESC);
CREATE INDEX IF NOT EXISTS content_base_uses_cycle ON public.content_base_uses(user_id,cycle_id,position);
ALTER TABLE public.content_base_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_base_uses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS base_versions_owner ON public.content_base_versions;
CREATE POLICY base_versions_owner ON public.content_base_versions TO authenticated USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);
DROP POLICY IF EXISTS base_uses_owner ON public.content_base_uses;
CREATE POLICY base_uses_owner ON public.content_base_uses TO authenticated USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);
GRANT SELECT,INSERT,UPDATE ON public.content_base_versions,public.content_base_uses TO authenticated;

ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS source_base_version_id uuid REFERENCES public.content_base_versions(id) ON DELETE RESTRICT;
ALTER TABLE public.content_piece_plans ADD COLUMN IF NOT EXISTS source_base_version_id uuid REFERENCES public.content_base_versions(id) ON DELETE RESTRICT;
ALTER TABLE public.content_piece_plans ADD COLUMN IF NOT EXISTS production_batch_id uuid;
ALTER TABLE public.content_piece_plans ADD COLUMN IF NOT EXISTS template_family text;
ALTER TABLE public.content_piece_plans ADD COLUMN IF NOT EXISTS editorial_slug text;

CREATE OR REPLACE FUNCTION public.guard_base_reference() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v public.content_base_versions; c public.contents; cy public.campaign_cycles;
BEGIN
  IF TG_TABLE_NAME='content_base_versions' THEN
    SELECT * INTO c FROM public.contents WHERE id=NEW.content_id AND user_id=NEW.user_id;
    IF NOT FOUND OR auth.uid() IS DISTINCT FROM NEW.user_id THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Base não encontrada.'; END IF;
    IF NEW.draft_cycle_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.campaign_cycles WHERE id=NEW.draft_cycle_id AND user_id=NEW.user_id) THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Ciclo da versão não encontrado.'; END IF;
    IF TG_OP='UPDATE' AND OLD.status='validated' AND
      ((to_jsonb(NEW)-'draft_cycle_id') IS DISTINCT FROM (to_jsonb(OLD)-'draft_cycle_id') OR (NEW.draft_cycle_id IS DISTINCT FROM OLD.draft_cycle_id AND NEW.draft_cycle_id IS NOT NULL)) THEN
      RAISE EXCEPTION USING ERRCODE='PT409',MESSAGE='Versão validada é histórica. Crie uma nova versão.';
    END IF;
    RETURN NEW;
  END IF;
  IF TG_TABLE_NAME='content_base_uses' THEN
    SELECT * INTO v FROM public.content_base_versions WHERE id=NEW.version_id AND user_id=NEW.user_id AND content_id=NEW.content_id AND status='validated';
    IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Versão validada não encontrada.'; END IF;
    SELECT * INTO cy FROM public.campaign_cycles WHERE id=NEW.cycle_id AND user_id=NEW.user_id AND campaign_id=NEW.campaign_id;
    IF NOT FOUND OR auth.uid() IS DISTINCT FROM NEW.user_id THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Ciclo não encontrado.'; END IF;
    IF NEW.idea_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.ideas WHERE id=NEW.idea_id AND user_id=NEW.user_id AND cycle_id=NEW.cycle_id) THEN
      RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Pauta não pertence a este ciclo.';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.source_base_version_id IS NOT NULL THEN
    SELECT * INTO v FROM public.content_base_versions WHERE id=NEW.source_base_version_id AND user_id=NEW.user_id AND status='validated';
    IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Base do acervo não encontrada.'; END IF;
    IF TG_TABLE_NAME='content_piece_plans' AND v.content_id<>NEW.content_id THEN RAISE EXCEPTION USING ERRCODE='PT422',MESSAGE='Plano e base não correspondem.'; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_base_version ON public.content_base_versions;
CREATE TRIGGER guard_base_version BEFORE INSERT OR UPDATE ON public.content_base_versions FOR EACH ROW EXECUTE FUNCTION public.guard_base_reference();
DROP TRIGGER IF EXISTS guard_base_use ON public.content_base_uses;
CREATE TRIGGER guard_base_use BEFORE INSERT OR UPDATE ON public.content_base_uses FOR EACH ROW EXECUTE FUNCTION public.guard_base_reference();
DROP TRIGGER IF EXISTS guard_idea_base ON public.ideas;
CREATE TRIGGER guard_idea_base BEFORE INSERT OR UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.guard_base_reference();
DROP TRIGGER IF EXISTS guard_plan_base ON public.content_piece_plans;
CREATE TRIGGER guard_plan_base BEFORE INSERT OR UPDATE ON public.content_piece_plans FOR EACH ROW EXECUTE FUNCTION public.guard_base_reference();

CREATE OR REPLACE FUNCTION public.save_base_draft(p_content uuid,p_cycle uuid,p_body jsonb,p_note text,p_expected_draft uuid DEFAULT NULL,p_expected_updated timestamptz DEFAULT NULL,p_considered jsonb DEFAULT NULL)
RETURNS public.content_base_versions LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.contents; d public.content_base_versions; result public.content_base_versions; n integer;
BEGIN
  SELECT * INTO c FROM public.contents WHERE id=p_content AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Base não encontrada.'; END IF;
  IF p_expected_updated IS DISTINCT FROM c.updated_at THEN RAISE EXCEPTION USING ERRCODE='PT409',MESSAGE='A base mudou em outra sessão. Reabra antes de editar.'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.campaign_cycles WHERE id=p_cycle AND user_id=auth.uid()) THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Ciclo não encontrado.'; END IF;
  IF NOT ((c.cycle_id=p_cycle) OR EXISTS(SELECT 1 FROM public.content_base_uses WHERE content_id=c.id AND cycle_id=p_cycle AND user_id=auth.uid())) THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Base não utilizada neste ciclo.'; END IF;
  IF nullif(trim(p_body->>'texto'),'') IS NULL THEN RAISE EXCEPTION USING ERRCODE='PT422',MESSAGE='Desenvolva o pensamento antes de salvar.'; END IF;
  SELECT * INTO d FROM public.content_base_versions WHERE content_id=c.id AND draft_cycle_id=p_cycle AND status='draft' ORDER BY ordinal DESC LIMIT 1;
  IF d.id IS DISTINCT FROM p_expected_draft THEN RAISE EXCEPTION USING ERRCODE='PT409',MESSAGE='O rascunho mudou em outra sessão. Reabra a base antes de editar.'; END IF;
  SELECT coalesce(max(ordinal),0)+1 INTO n FROM public.content_base_versions WHERE content_id=c.id;
  UPDATE public.content_base_versions SET status='superseded' WHERE content_id=c.id AND draft_cycle_id=p_cycle AND status='draft';
  INSERT INTO public.content_base_versions(content_id,user_id,draft_cycle_id,ordinal,body,considered,context_snapshot_id,note)
    VALUES(c.id,auth.uid(),p_cycle,n,p_body,coalesce(p_considered,c.considered),c.context_snapshot_id,p_note) RETURNING * INTO result;
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.validate_content_base(p_content uuid,p_cycle uuid,p_draft uuid DEFAULT NULL,p_expected_body jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.contents; cy public.campaign_cycles; v public.content_base_versions; n integer; o text;
BEGIN
  SELECT * INTO c FROM public.contents WHERE id=p_content AND user_id=auth.uid() FOR UPDATE;
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=p_cycle AND user_id=auth.uid();
  IF c.id IS NULL OR cy.id IS NULL THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Base/ciclo não encontrado.'; END IF;
  IF NOT (c.cycle_id=p_cycle OR EXISTS(SELECT 1 FROM public.content_base_uses WHERE content_id=c.id AND cycle_id=p_cycle AND user_id=auth.uid())) THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Base não pertence ao trabalho selecionado.'; END IF;
  IF p_draft IS NOT NULL THEN
    SELECT * INTO v FROM public.content_base_versions WHERE id=p_draft AND content_id=c.id AND user_id=auth.uid() AND draft_cycle_id=p_cycle;
    IF v.id IS NULL OR v.status='superseded' THEN RAISE EXCEPTION USING ERRCODE='PT409',MESSAGE='Rascunho substituído. Reabra a base.'; END IF;
    IF v.body IS DISTINCT FROM p_expected_body THEN RAISE EXCEPTION USING ERRCODE='PT409',MESSAGE='O texto mudou desde que você o abriu. Revise antes de validar.'; END IF;
    IF v.status='validated' AND EXISTS(SELECT 1 FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=c.id AND version_id<>v.id) THEN RAISE EXCEPTION USING ERRCODE='PT409',MESSAGE='Esta campanha já utiliza outra versão. Reabra a base.'; END IF;
    IF v.status='draft' THEN
      UPDATE public.content_base_versions SET status='validated',validated_at=now() WHERE id=v.id RETURNING * INTO v;
      UPDATE public.contents SET body=v.body,considered=v.considered,status='validated',versions=coalesce(versions,'[]')||jsonb_build_array(jsonb_build_object('id',v.id,'at',now(),'body',v.body,'note','Base validada')) WHERE id=c.id RETURNING * INTO c;
    END IF;
  ELSE
    IF c.body IS DISTINCT FROM p_expected_body THEN RAISE EXCEPTION USING ERRCODE='PT409',MESSAGE='O texto mudou desde que você o abriu. Revise antes de validar.'; END IF;
    IF nullif(trim(c.body->>'texto'),'') IS NULL THEN RAISE EXCEPTION USING ERRCODE='PT422',MESSAGE='Desenvolvimento vazio.'; END IF;
    SELECT * INTO v FROM public.content_base_versions WHERE content_id=c.id AND status='validated' AND body=c.body ORDER BY ordinal DESC LIMIT 1;
    IF v.id IS NULL THEN
      SELECT coalesce(max(ordinal),0)+1 INTO n FROM public.content_base_versions WHERE content_id=c.id;
      INSERT INTO public.content_base_versions(content_id,user_id,draft_cycle_id,ordinal,body,considered,context_snapshot_id,status,validated_at,note)
      VALUES(c.id,auth.uid(),p_cycle,n,c.body,c.considered,c.context_snapshot_id,'validated',now(),'Validação do conteúdo-base') RETURNING * INTO v;
    END IF;
    IF c.status<>'validated' THEN UPDATE public.contents SET status='validated' WHERE id=c.id RETURNING * INTO c; END IF;
  END IF;
  o:=CASE WHEN coalesce(c.metadata->>'purpose','')='knowledge_base' THEN 'new' ELSE 'legacy' END;
  INSERT INTO public.content_base_uses(user_id,content_id,version_id,campaign_id,cycle_id,idea_id,origin,position)
  VALUES(auth.uid(),c.id,v.id,cy.campaign_id,cy.id,CASE WHEN c.cycle_id=cy.id THEN c.idea_id ELSE NULL END,o,c.position)
  ON CONFLICT(cycle_id,content_id) DO UPDATE SET version_id=excluded.version_id;
  RETURN jsonb_build_object('content',to_jsonb(c),'version',to_jsonb(v));
END $$;

CREATE OR REPLACE FUNCTION public.adopt_content_base(p_version uuid,p_cycle uuid,p_idea uuid DEFAULT NULL)
RETURNS public.content_base_uses LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE v public.content_base_versions; cy public.campaign_cycles; r public.content_base_uses;
BEGIN
  SELECT * INTO v FROM public.content_base_versions WHERE id=p_version AND user_id=auth.uid() AND status='validated';
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=p_cycle AND user_id=auth.uid();
  IF v.id IS NULL OR cy.id IS NULL THEN RAISE EXCEPTION USING ERRCODE='PT404',MESSAGE='Base/ciclo não encontrado.'; END IF;
  INSERT INTO public.content_base_uses(user_id,content_id,version_id,campaign_id,cycle_id,idea_id,origin,position)
  VALUES(auth.uid(),v.content_id,v.id,cy.campaign_id,cy.id,p_idea,'archive',coalesce((SELECT max(position)+1 FROM public.content_base_uses WHERE cycle_id=cy.id),0))
  ON CONFLICT(cycle_id,content_id) DO UPDATE SET version_id=excluded.version_id,idea_id=coalesce(excluded.idea_id,content_base_uses.idea_id) RETURNING * INTO r;
  IF p_idea IS NOT NULL THEN UPDATE public.ideas SET status='developed' WHERE id=p_idea AND user_id=auth.uid() AND cycle_id=cy.id; END IF;
  RETURN r;
END $$;

-- Peças novas usam snapshot validado; a evolução do acervo não invalida seu material.
CREATE OR REPLACE FUNCTION public.flag_derived_pieces() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body THEN
    UPDATE public.user_posts SET metadata=coalesce(metadata,'{}')||'{"source_outdated":true}'::jsonb
    WHERE content_id=NEW.id AND piece_role='unfold' AND status NOT IN ('published','archived')
      AND source_content_at IS NOT NULL AND source_content_at<now()
      AND metadata->>'source_base_version_id' IS NULL;
  END IF;
  RETURN NEW;
END $$;

REVOKE ALL ON FUNCTION public.save_base_draft(uuid,uuid,jsonb,text,uuid,timestamptz,jsonb),public.validate_content_base(uuid,uuid,uuid,jsonb),public.adopt_content_base(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_base_draft(uuid,uuid,jsonb,text,uuid,timestamptz,jsonb),public.validate_content_base(uuid,uuid,uuid,jsonb),public.adopt_content_base(uuid,uuid,uuid) TO authenticated;
COMMIT;
