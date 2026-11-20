-- Atualização 1, autorizada por Marcos em 17/11/2026.
-- Aditiva: nenhum registro, pacote ou agendamento existente é convertido.
BEGIN;
ALTER TABLE public.knowledge_documents ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.knowledge_documents ADD COLUMN IF NOT EXISTS source_text text;
ALTER TABLE public.bee_products ADD COLUMN IF NOT EXISTS audience_ids uuid[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.brand_intelligence_settings (
  brand_id uuid PRIMARY KEY REFERENCES public.brands(id),
  discovery_enabled boolean NOT NULL DEFAULT true,
  discovery_instruction text NOT NULL DEFAULT '',
  acj_enabled_ids text[] NOT NULL DEFAULT ARRAY['ACJ-01','ACJ-02','ACJ-03','ACJ-04','ACJ-05'],
  acj_instruction text NOT NULL DEFAULT '', version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (cardinality(acj_enabled_ids)>0 AND acj_enabled_ids <@ ARRAY['ACJ-01','ACJ-02','ACJ-03','ACJ-04','ACJ-05']::text[]),
  CHECK (length(discovery_instruction)<=3000 AND length(acj_instruction)<=3000)
);
CREATE TABLE IF NOT EXISTS public.brand_intelligence_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), brand_id uuid NOT NULL REFERENCES public.brands(id),
  version integer NOT NULL, settings jsonb NOT NULL, changed_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(brand_id,version)
);
CREATE TABLE IF NOT EXISTS public.knowledge_analysis_runs (
  document_id uuid NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  brand_id uuid NOT NULL REFERENCES public.brands(id),
  status text NOT NULL CHECK(status IN ('running','completed','failed')),
  claim uuid NOT NULL, started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
  found integer NOT NULL DEFAULT 0, error text, PRIMARY KEY(document_id,user_id)
);
CREATE TABLE IF NOT EXISTS public.knowledge_discoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  brand_id uuid NOT NULL REFERENCES public.brands(id), document_id uuid REFERENCES public.knowledge_documents(id) ON DELETE SET NULL,
  title text NOT NULL CHECK(length(title) BETWEEN 1 AND 240), summary text NOT NULL CHECK(length(summary) BETWEEN 1 AND 6000),
  sources jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(sources)='array'),
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','dismissed','drafted')),
  content_id uuid REFERENCES public.contents(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,document_id,title)
);
CREATE INDEX IF NOT EXISTS knowledge_discoveries_brand ON public.knowledge_discoveries(brand_id,created_at DESC);
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['brand_intelligence_settings','brand_intelligence_history','knowledge_analysis_runs','knowledge_discoveries'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('GRANT SELECT,INSERT,UPDATE ON public.%I TO authenticated',t);
  END LOOP;
END $$;
DROP POLICY IF EXISTS intelligence_read ON public.brand_intelligence_settings;
CREATE POLICY intelligence_read ON public.brand_intelligence_settings FOR SELECT TO authenticated USING(public.is_brand_member(brand_id));
DROP POLICY IF EXISTS intelligence_write ON public.brand_intelligence_settings;
CREATE POLICY intelligence_write ON public.brand_intelligence_settings FOR ALL TO authenticated USING(public.is_brand_member(brand_id)) WITH CHECK(public.is_brand_member(brand_id));
DROP POLICY IF EXISTS intelligence_history_read ON public.brand_intelligence_history;
CREATE POLICY intelligence_history_read ON public.brand_intelligence_history FOR SELECT TO authenticated USING(public.is_brand_member(brand_id));
DROP POLICY IF EXISTS intelligence_history_add ON public.brand_intelligence_history;
CREATE POLICY intelligence_history_add ON public.brand_intelligence_history FOR INSERT TO authenticated WITH CHECK(changed_by=auth.uid() AND public.is_brand_member(brand_id));
DROP POLICY IF EXISTS analysis_own ON public.knowledge_analysis_runs;
CREATE POLICY analysis_own ON public.knowledge_analysis_runs FOR ALL TO authenticated USING(user_id=auth.uid() AND public.is_brand_member(brand_id)) WITH CHECK(user_id=auth.uid() AND public.is_brand_member(brand_id));
DROP POLICY IF EXISTS discoveries_own ON public.knowledge_discoveries;
CREATE POLICY discoveries_own ON public.knowledge_discoveries FOR ALL TO authenticated USING(user_id=auth.uid() AND public.is_brand_member(brand_id)) WITH CHECK(user_id=auth.uid() AND public.is_brand_member(brand_id));

CREATE OR REPLACE FUNCTION public.save_intelligence_settings(p_brand uuid,p_expected integer,p_settings jsonb)
RETURNS public.brand_intelligence_settings LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE old public.brand_intelligence_settings; result public.brand_intelligence_settings;
BEGIN
  PERFORM 1 FROM public.brands WHERE id=p_brand AND public.is_brand_member(id) FOR UPDATE;
  IF NOT FOUND OR auth.uid() IS NULL THEN RAISE EXCEPTION 'Marca não disponível.' USING ERRCODE='PT404'; END IF;
  SELECT * INTO old FROM public.brand_intelligence_settings WHERE brand_id=p_brand FOR UPDATE;
  IF old.version IS DISTINCT FROM p_expected THEN RAISE EXCEPTION 'Os critérios mudaram em outra tela. Atualize antes de salvar.' USING ERRCODE='PT409'; END IF;
  INSERT INTO public.brand_intelligence_settings(brand_id,discovery_enabled,discovery_instruction,acj_enabled_ids,acj_instruction,version)
  VALUES(p_brand,COALESCE((p_settings->>'discovery_enabled')::boolean,true),COALESCE(p_settings->>'discovery_instruction',''),
    ARRAY(SELECT DISTINCT jsonb_array_elements_text(p_settings->'acj_enabled_ids')),COALESCE(p_settings->>'acj_instruction',''),COALESCE(old.version,0)+1)
  ON CONFLICT(brand_id) DO UPDATE SET discovery_enabled=excluded.discovery_enabled,discovery_instruction=excluded.discovery_instruction,
    acj_enabled_ids=excluded.acj_enabled_ids,acj_instruction=excluded.acj_instruction,version=excluded.version,updated_at=now() RETURNING * INTO result;
  INSERT INTO public.brand_intelligence_history(brand_id,version,settings) VALUES(p_brand,result.version,to_jsonb(result));
  RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.claim_knowledge_analysis(p_document uuid,p_force boolean DEFAULT false)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE d public.knowledge_documents; r public.knowledge_analysis_runs; token uuid:=gen_random_uuid();
BEGIN
  SELECT * INTO d FROM public.knowledge_documents WHERE id=p_document AND NOT archived AND brand_id IS NOT NULL
    AND public.is_brand_member(brand_id) AND (user_id=auth.uid() OR is_global) FOR UPDATE;
  IF d.id IS NULL OR auth.uid() IS NULL THEN RAISE EXCEPTION 'Material não disponível nesta marca.' USING ERRCODE='PT404'; END IF;
  SELECT * INTO r FROM public.knowledge_analysis_runs WHERE document_id=p_document AND user_id=auth.uid() FOR UPDATE;
  IF (r.status='running' AND r.started_at>now()-interval '15 minutes') OR (r.status='completed' AND NOT p_force) THEN RETURN NULL; END IF;
  INSERT INTO public.knowledge_analysis_runs(document_id,user_id,brand_id,status,claim) VALUES(d.id,auth.uid(),d.brand_id,'running',token)
  ON CONFLICT(document_id,user_id) DO UPDATE SET status='running',claim=token,started_at=now(),finished_at=NULL,error=NULL,found=0;
  RETURN jsonb_build_object('claim',token,'brand_id',d.brand_id,'document_id',d.id);
END $$;
CREATE OR REPLACE FUNCTION public.finish_knowledge_analysis(p_document uuid,p_claim uuid,p_items jsonb,p_error text DEFAULT NULL)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE r public.knowledge_analysis_runs; item jsonb; src jsonb; n integer:=0;
BEGIN
  SELECT * INTO r FROM public.knowledge_analysis_runs WHERE document_id=p_document AND user_id=auth.uid() AND claim=p_claim AND status='running' FOR UPDATE;
  IF r.document_id IS NULL THEN RAISE EXCEPTION 'Esta análise já terminou ou foi substituída.' USING ERRCODE='PT409'; END IF;
  IF p_error IS NULL THEN
    IF jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items)>12 THEN RAISE EXCEPTION 'Descobertas inválidas.' USING ERRCODE='PT422'; END IF;
    FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
      IF jsonb_typeof(item->'sources')<>'array' OR jsonb_array_length(item->'sources')=0 THEN RAISE EXCEPTION 'Descoberta sem fonte.' USING ERRCODE='PT422'; END IF;
      FOR src IN SELECT * FROM jsonb_array_elements(item->'sources') LOOP
        IF NOT EXISTS(SELECT 1 FROM public.knowledge_documents d WHERE d.id=(src->>'document_id')::uuid AND d.brand_id=r.brand_id AND NOT d.archived AND (d.user_id=auth.uid() OR d.is_global)) THEN
          RAISE EXCEPTION 'Fonte fora do contexto desta análise.' USING ERRCODE='PT422';
        END IF;
      END LOOP;
      INSERT INTO public.knowledge_discoveries(user_id,brand_id,document_id,title,summary,sources)
      VALUES(auth.uid(),r.brand_id,p_document,item->>'title',item->>'summary',item->'sources') ON CONFLICT(user_id,document_id,title) DO NOTHING;
      n:=n+1;
    END LOOP;
  END IF;
  UPDATE public.knowledge_analysis_runs SET status=CASE WHEN p_error IS NULL THEN 'completed' ELSE 'failed' END,finished_at=now(),found=n,error=left(p_error,600)
    WHERE document_id=p_document AND user_id=auth.uid() AND claim=p_claim;
  RETURN n;
END $$;

-- Novo contrato: contexto obrigatório; o contrato antigo permanece disponível.
CREATE OR REPLACE FUNCTION public.match_knowledge_scoped(query_embedding vector,filter_brand_id uuid,match_count integer DEFAULT 5,match_threshold double precision DEFAULT 0.3,filter_user_id uuid DEFAULT NULL)
RETURNS TABLE(id uuid,document_id uuid,document_title text,content text,similarity double precision,metadata jsonb)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
 SELECT kc.id,kc.document_id,kd.title,kc.content,(1-(kc.embedding <=> query_embedding))::float,kc.metadata
 FROM public.knowledge_chunks kc JOIN public.knowledge_documents kd ON kd.id=kc.document_id
 WHERE kd.brand_id=filter_brand_id AND NOT kd.archived
   AND (filter_user_id=auth.uid() OR current_user IN ('service_role','postgres'))
   AND EXISTS(SELECT 1 FROM public.brands b JOIN public.workspace_members m ON m.workspace_id=b.workspace_id WHERE b.id=filter_brand_id AND m.user_id=filter_user_id)
   AND (kc.user_id=filter_user_id OR kd.is_global)
   AND 1-(kc.embedding <=> query_embedding)>match_threshold
 ORDER BY kc.embedding <=> query_embedding LIMIT LEAST(GREATEST(match_count,1),20);
$$;

CREATE OR REPLACE FUNCTION public.set_brand_archived(p_brand uuid,p_archived boolean)
RETURNS public.brands LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE result public.brands;
BEGIN
  SELECT * INTO result FROM public.brands WHERE id=p_brand AND public.is_brand_member(id) FOR UPDATE;
  IF result.id IS NULL THEN RAISE EXCEPTION 'Marca não disponível.' USING ERRCODE='PT404'; END IF;
  IF p_archived AND (EXISTS(SELECT 1 FROM public.campaigns c JOIN public.communication_profiles p ON p.id=c.profile_id WHERE p.brand_id=p_brand AND c.status IN ('draft','active','paused'))
    OR EXISTS(SELECT 1 FROM public.user_posts u JOIN public.communication_profiles p ON p.id=u.profile_id WHERE p.brand_id=p_brand AND u.status IN ('approved','scheduled'))) THEN
    RAISE EXCEPTION 'Esta marca possui campanhas ou peças em andamento. Conclua ou revise esses vínculos antes de arquivar.' USING ERRCODE='PT409';
  END IF;
  UPDATE public.brands SET status=CASE WHEN p_archived THEN 'archived' ELSE 'active' END,updated_at=now() WHERE id=p_brand RETURNING * INTO result;
  RETURN result;
END $$;
CREATE OR REPLACE FUNCTION public.set_mother_archived(p_content uuid,p_archived boolean)
RETURNS public.contents LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE c public.contents;
BEGIN
  SELECT * INTO c FROM public.contents WHERE id=p_content AND user_id=auth.uid() FOR UPDATE;
  IF c.id IS NULL THEN RAISE EXCEPTION 'Base não encontrada.' USING ERRCODE='PT404'; END IF;
  UPDATE public.contents SET status=CASE WHEN p_archived THEN 'discarded' WHEN EXISTS(SELECT 1 FROM public.content_base_versions WHERE content_id=p_content AND status='validated') THEN 'validated' ELSE 'pending_validation' END
    WHERE id=p_content RETURNING * INTO c;
  RETURN c;
END $$;

CREATE OR REPLACE FUNCTION public.guard_product_audiences() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
  IF EXISTS(SELECT 1 FROM unnest(NEW.audience_ids) a WHERE NOT EXISTS(SELECT 1 FROM public.audiences x WHERE x.id=a AND x.brand_id=NEW.brand_id AND x.status<>'archived')) THEN
    RAISE EXCEPTION 'Selecione públicos desta marca.' USING ERRCODE='PT422';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_product_audiences ON public.bee_products;
CREATE TRIGGER trg_product_audiences BEFORE INSERT OR UPDATE OF audience_ids,brand_id ON public.bee_products FOR EACH ROW EXECUTE FUNCTION public.guard_product_audiences();

ALTER TABLE public.content_piece_plans ADD COLUMN IF NOT EXISTS acj_primary text CHECK(acj_primary IS NULL OR public.acj_valid(acj_primary));
ALTER TABLE public.content_piece_plans ADD COLUMN IF NOT EXISTS acj_secondary text CHECK(acj_secondary IS NULL OR (public.acj_valid(acj_secondary) AND acj_secondary IS DISTINCT FROM acj_primary));
ALTER TABLE public.content_piece_plans ADD COLUMN IF NOT EXISTS acj_rationale text;

-- Funções de compatibilidade e herança são acrescentadas abaixo, a partir das definições verificadas.

CREATE OR REPLACE FUNCTION public.approve_cycle_production(p_cycle uuid, p_command uuid, p_expected_updated timestamp with time zone, p_bases jsonb, p_items jsonb, p_replace uuid[] DEFAULT '{}'::uuid[])
 RETURNS campaign_cycles
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE cy public.campaign_cycles; c public.contents; v public.content_base_versions;
  b jsonb; item jsonb; payload text; pos int := 0; bid uuid; old_id uuid;
BEGIN
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=p_cycle AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ciclo não encontrado.' USING ERRCODE='PT404'; END IF;
  IF p_command IS NULL OR p_replace IS NULL OR jsonb_typeof(p_items) IS DISTINCT FROM 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 40
     OR jsonb_typeof(p_bases) IS DISTINCT FROM 'array' THEN
    RAISE EXCEPTION 'Selecione de 1 a 40 peças e confira suas bases.' USING ERRCODE='PT422';
  END IF;
  payload := md5(jsonb_build_object('items',p_items,'bases',p_bases,'replace',p_replace)::text);
  IF cy.plan->'production'->>'batch_id'=p_command::text THEN
    IF cy.plan->'production'->>'payload_hash' IS DISTINCT FROM payload THEN
      RAISE EXCEPTION 'Este comando já aprovou outra proposta.' USING ERRCODE='PT409';
    END IF;
    RETURN cy;
  END IF;
  IF cy.updated_at IS DISTINCT FROM p_expected_updated THEN
    RAISE EXCEPTION 'O ciclo mudou em outra tela. Atualize antes de aprovar.' USING ERRCODE='PT409';
  END IF;
  -- Require the exact set shown in the confirmation, including a concurrent new draft.
  PERFORM 1 FROM public.user_posts WHERE cycle_id=p_cycle AND user_id=auth.uid() ORDER BY id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM public.user_posts WHERE id=ANY(p_replace) AND
      (cycle_id IS DISTINCT FROM p_cycle OR user_id IS DISTINCT FROM auth.uid() OR status NOT IN ('draft','pending_approval','idea')))
     OR (SELECT count(*) FROM public.user_posts WHERE id=ANY(p_replace)) <> cardinality(p_replace) THEN
    RAISE EXCEPTION 'A substituição contém peça protegida ou indisponível. Atualize a proposta.' USING ERRCODE='PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_posts WHERE cycle_id=p_cycle AND status IN ('draft','pending_approval','idea')
             AND NOT (id=ANY(p_replace)) AND COALESCE(metadata->>'delivery_of','')='') THEN
    RAISE EXCEPTION 'Confira as peças pendentes antes de substituir a produção.' USING ERRCODE='PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_bases) x GROUP BY x->>'id' HAVING count(*)>1) THEN
    RAISE EXCEPTION 'Há bases duplicadas na proposta.' USING ERRCODE='PT422';
  END IF;
  FOR b IN SELECT value FROM jsonb_array_elements(p_bases) ORDER BY value->>'id' LOOP
    SELECT * INTO c FROM public.contents WHERE id=(b->>'id')::uuid AND user_id=auth.uid() FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Base não encontrada.' USING ERRCODE='PT404'; END IF;
    IF NULLIF(b->>'version_id','') IS NOT NULL THEN
      SELECT * INTO v FROM public.content_base_versions WHERE id=(b->>'version_id')::uuid
        AND content_id=c.id AND user_id=auth.uid() AND status='validated';
      IF NOT FOUND OR v.body IS DISTINCT FROM b->'body' OR NOT EXISTS
        (SELECT 1 FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=c.id AND version_id=v.id AND user_id=auth.uid()) THEN
        RAISE EXCEPTION 'A versão da base mudou. Atualize antes de aprovar.' USING ERRCODE='PT409';
      END IF;
    ELSE
      IF c.cycle_id IS DISTINCT FROM p_cycle OR c.status <> 'validated' OR c.body IS DISTINCT FROM b->'body' THEN
        RAISE EXCEPTION 'A base precisa estar validada neste ciclo.' USING ERRCODE='PT409';
      END IF;
      SELECT * INTO v FROM public.content_base_versions WHERE content_id=c.id AND status='validated' AND body=c.body ORDER BY ordinal DESC LIMIT 1;
      IF NOT FOUND THEN
        INSERT INTO public.content_base_versions(content_id,user_id,draft_cycle_id,ordinal,body,considered,context_snapshot_id,note,status,validated_at)
        SELECT c.id,auth.uid(),p_cycle,COALESCE(max(ordinal),0)+1,c.body,c.considered,c.context_snapshot_id,
          'Preservação de base já validada antes da produção por formatos.','validated',now()
        FROM public.content_base_versions WHERE content_id=c.id RETURNING * INTO v;
      END IF;
      INSERT INTO public.content_base_uses(user_id,content_id,version_id,campaign_id,cycle_id,idea_id,origin,position)
      VALUES(auth.uid(),c.id,v.id,cy.campaign_id,p_cycle,c.idea_id,'legacy',c.position)
      ON CONFLICT(cycle_id,content_id) DO UPDATE SET version_id=excluded.version_id;
    END IF;
  END LOOP;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p_items) x GROUP BY x->>'content_id',x->>'platform',x->>'format',x->>'editorial_slug',lower(trim(x->>'approach')) HAVING count(*)>1) THEN
    RAISE EXCEPTION 'Há peças com a mesma abordagem na proposta. Diferencie sua contribuição.' USING ERRCODE='PT422';
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    bid := (item->>'content_id')::uuid;
    IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(p_bases) base_item WHERE base_item->>'id'=bid::text) OR
       NOT EXISTS (SELECT 1 FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=bid AND user_id=auth.uid()) THEN
      RAISE EXCEPTION 'Peça sem base validada na proposta.' USING ERRCODE='PT422';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.design_variacoes WHERE manifestacao_id=item->>'template_family' AND ativo AND status='frozen') THEN
      RAISE EXCEPTION 'Esta família não tem receita pronta nesta marca.' USING ERRCODE='PT422';
    END IF;
    IF COALESCE(trim(item->>'approach'),'')='' OR COALESCE(trim(item->>'purpose'),'')='' OR
       COALESCE(item->>'format','') NOT IN ('image','carousel','story') OR
       NOT EXISTS (SELECT 1 FROM public.format_capabilities WHERE platform=item->>'platform' AND format=item->>'format') OR
       COALESCE(item->>'template_family','') NOT IN ('M01','M02','M03') THEN
      RAISE EXCEPTION 'Confira abordagem, propósito, plataforma, formato e família visual.' USING ERRCODE='PT422';
    END IF;
    IF COALESCE(item->>'editorial_slug','')='' OR NOT EXISTS
       (SELECT 1 FROM public.bee_editorials WHERE slug=item->>'editorial_slug') THEN
      RAISE EXCEPTION 'Escolha uma editoria disponível para a peça.' USING ERRCODE='PT422';
    END IF;
    IF item->>'intent_scope'='recorte' AND NULLIF(item->>'acj_primary','') IS NULL THEN RAISE EXCEPTION 'Escolha a intenção deste recorte.' USING ERRCODE='PT422'; END IF;
    IF EXISTS (SELECT 1 FROM public.content_piece_plans WHERE production_batch_id=p_command AND position=pos) THEN
      RAISE EXCEPTION 'Comando de produção já utilizado.' USING ERRCODE='PT409';
    END IF;
    IF NULLIF(item->>'context_snapshot_id','') IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.context_snapshots WHERE id=(item->>'context_snapshot_id')::uuid AND user_id=auth.uid()
        AND campaign_id=cy.campaign_id AND profile_id=(item->>'profile_id')::uuid) THEN
      RAISE EXCEPTION 'A voz desta produção não corresponde à campanha.' USING ERRCODE='PT409';
    END IF;
    SELECT version_id INTO old_id FROM public.content_base_uses WHERE cycle_id=p_cycle AND content_id=bid;
    INSERT INTO public.content_piece_plans(user_id,content_id,campaign_id,cycle_id,account_id,platform,format,approach,purpose,architecture,
      origin,status,position,source_base_version_id,production_batch_id,template_family,editorial_slug,context_snapshot_id,profile_id,acj_primary,acj_secondary,acj_rationale)
    VALUES(auth.uid(),bid,cy.campaign_id,p_cycle,NULL,item->>'platform',item->>'format',left(item->>'approach',240),left(item->>'purpose',600),
      CASE WHEN item->>'format'<>'image' THEN COALESCE(NULLIF(item->>'architecture',''),'conceito') END,
      'hive','planned',pos,old_id,p_command,item->>'template_family',item->>'editorial_slug',NULLIF(item->>'context_snapshot_id','')::uuid,NULLIF(item->>'profile_id','')::uuid,NULLIF(item->>'acj_primary',''),NULLIF(item->>'acj_secondary',''),NULLIF(item->>'acj_rationale',''));
    pos := pos+1;
  END LOOP;
  -- Explicit user confirmation archives only the selected unapproved material; nothing is deleted.
  UPDATE public.user_posts SET status='archived',metadata=COALESCE(metadata,'{}')||jsonb_build_object('replaced_by_batch',p_command,'replaced_at',now())
    WHERE id=ANY(p_replace);
  UPDATE public.content_piece_plans SET status='removed' WHERE cycle_id=p_cycle AND production_batch_id IS DISTINCT FROM p_command
    AND (post_id IS NULL OR post_id=ANY(p_replace)) AND status<>'removed';
  UPDATE public.campaign_cycles SET status='producing',plan=COALESCE(plan,'{}')||jsonb_build_object('production',
    jsonb_build_object('version',2,'status','approved','batch_id',p_command,'payload_hash',payload,'approved_at',now(),'count',pos,'replaced_posts',p_replace))
    WHERE id=p_cycle RETURNING * INTO cy;
  RETURN cy;
END $function$;

CREATE OR REPLACE FUNCTION public.acj_piece_inherit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE c public.acj_content_contracts%ROWTYPE; pl public.content_piece_plans%ROWTYPE;
BEGIN
  -- Snapshot publicado é imutável (Adendo §8.11): ignora qualquer tentativa de mudar.
  IF TG_OP = 'UPDATE' AND OLD.acj_frozen_at IS NOT NULL THEN
    NEW.acj_primary := OLD.acj_primary; NEW.acj_secondary := OLD.acj_secondary; NEW.acj_snapshot := OLD.acj_snapshot;
    NEW.acj_status := OLD.acj_status; NEW.acj_frozen_at := OLD.acj_frozen_at;
    RETURN NEW;
  END IF;
  IF NEW.plan_id IS NOT NULL THEN
    SELECT * INTO pl FROM public.content_piece_plans WHERE id=NEW.plan_id AND user_id=NEW.user_id AND content_id=NEW.content_id;
    IF pl.acj_primary IS NOT NULL THEN
      NEW.acj_primary:=pl.acj_primary; NEW.acj_secondary:=pl.acj_secondary; NEW.acj_status:='inherited';
      NEW.acj_snapshot:=jsonb_build_object('plan_id',pl.id,'production_batch_id',pl.production_batch_id,'source_base_version_id',pl.source_base_version_id,
        'acj_primary',pl.acj_primary,'acj_secondary',pl.acj_secondary,'rationale',pl.acj_rationale,'taken_at',now());
      IF NEW.status='published' THEN NEW.acj_frozen_at:=now(); END IF;
      RETURN NEW;
    END IF;
  END IF;
  IF NEW.content_id IS NOT NULL THEN
    SELECT * INTO c FROM public.acj_content_contracts
     WHERE content_id = NEW.content_id AND status <> 'superseded' ORDER BY version DESC LIMIT 1;
    IF FOUND THEN
      NEW.acj_primary := c.acj_primary;
      NEW.acj_secondary := c.acj_secondary;
      NEW.acj_status := 'inherited';
      NEW.acj_snapshot := jsonb_build_object(
        'contract_id', c.id, 'contract_version', c.version, 'acj_primary', c.acj_primary, 'acj_secondary', c.acj_secondary,
        'audience_state_from', c.audience_state_from, 'movement_to', c.movement_to, 'connection_mechanism', c.connection_mechanism,
        'expected_response', c.expected_response, 'source_acj_version', c.source_acj_version, 'taken_at', now());
    END IF;
  END IF;
  IF NEW.status = 'published' AND NEW.acj_snapshot IS NOT NULL THEN
    NEW.acj_frozen_at := now();
  END IF;
  RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.guard_plan_intent() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE b uuid; enabled text[];
BEGIN
  IF TG_OP='UPDATE' AND OLD.post_id IS NOT NULL AND (NEW.acj_primary IS DISTINCT FROM OLD.acj_primary OR NEW.acj_secondary IS DISTINCT FROM OLD.acj_secondary OR NEW.acj_rationale IS DISTINCT FROM OLD.acj_rationale) THEN
    RAISE EXCEPTION 'A intenção desta peça já foi fixada. Crie outro recorte.' USING ERRCODE='PT409';
  END IF;
  IF NEW.acj_primary IS NOT NULL THEN
    SELECT brand_id INTO b FROM public.communication_profiles WHERE id=NEW.profile_id;
    IF b IS NULL OR NOT public.is_brand_member(b) THEN RAISE EXCEPTION 'Perfil da intenção indisponível.' USING ERRCODE='PT422'; END IF;
    SELECT acj_enabled_ids INTO enabled FROM public.brand_intelligence_settings WHERE brand_id=b;
    IF enabled IS NOT NULL AND (NOT NEW.acj_primary=ANY(enabled) OR (NEW.acj_secondary IS NOT NULL AND NOT NEW.acj_secondary=ANY(enabled))) THEN
      RAISE EXCEPTION 'A intenção selecionada foi desativada. Revise a proposta.' USING ERRCODE='PT409';
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_plan_intent_guard ON public.content_piece_plans;
CREATE TRIGGER trg_plan_intent_guard BEFORE INSERT OR UPDATE OF acj_primary,acj_secondary,acj_rationale ON public.content_piece_plans FOR EACH ROW EXECUTE FUNCTION public.guard_plan_intent();
DO $$ DECLARE f record; BEGIN
 FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
 AND p.proname IN ('save_intelligence_settings','claim_knowledge_analysis','finish_knowledge_analysis','match_knowledge_scoped','set_brand_archived','set_mother_archived') LOOP
   EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon',f.signature);
   EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated,service_role',f.signature);
 END LOOP;
END $$;
COMMIT;
