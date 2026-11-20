-- #111: baseline SOMENTE de schema para regressão local descartável.
-- Exportado do catálogo em 20/11/2026; não contém linhas de tabelas, usuários, tokens ou arquivos.
-- Não é migration de produção e nunca deve ser aplicado ao projeto hospedado.
-- PostgreSQL 17 + Auth/Storage/funções locais; a correção 20261119000001 é aplicada depois.
BEGIN;
SET check_function_bodies=off;
SET search_path=public,extensions,auth;
CREATE SEQUENCE public."usage_events_id_seq" AS bigint START WITH 1 INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 NO CYCLE;
CREATE TABLE public."acj_campaign_plans" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"campaign_id" uuid NOT NULL,"version" integer NOT NULL,"status" text NOT NULL,"adoption" text NOT NULL,"adoption_note" text,"audience_state" text,"desired_state" text,"journey_needs" jsonb NOT NULL,"target_mix" jsonb NOT NULL,"phases" jsonb NOT NULL,"sequence_hypotheses" jsonb NOT NULL,"success_signals" jsonb NOT NULL,"recalibration_rules" jsonb NOT NULL,"exclusions" jsonb NOT NULL,"summary" jsonb NOT NULL,"confidence" text,"human_decisions_required" jsonb NOT NULL,"source_acj_version" text,"decision_origin" text NOT NULL,"instruction" text,"approved_by" uuid,"approved_at" timestamp with time zone,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."acj_content_contracts" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"content_id" uuid NOT NULL,"version" integer NOT NULL,"status" text NOT NULL,"campaign_plan_id" uuid,"cycle_plan_id" uuid,"acj_primary" text NOT NULL,"acj_secondary" text,"attribution_confidence" text,"rationale" text,"alternative_considered" text,"alternative_reason" text,"audience_state_from" text NOT NULL,"journey_need" text NOT NULL,"movement_to" text NOT NULL,"connection_mechanism" text NOT NULL,"authorial_gesture" text,"expected_experience" text,"expected_response" jsonb NOT NULL,"failure_modes" jsonb NOT NULL,"expression_context" jsonb NOT NULL,"not_to_do" text,"source_acj_version" text,"assigned_late" boolean NOT NULL,"validation" jsonb,"marcos_feedback" jsonb,"decision_origin" text NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."acj_cycle_plans" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"cycle_id" uuid NOT NULL,"campaign_plan_id" uuid NOT NULL,"campaign_plan_version" integer NOT NULL,"version" integer NOT NULL,"cycle_mix" jsonb NOT NULL,"counts" jsonb NOT NULL,"realized" jsonb NOT NULL,"gaps" jsonb NOT NULL,"saturation_flags" jsonb NOT NULL,"priorities" jsonb NOT NULL,"circulation_rules" jsonb NOT NULL,"rationale" text,"plan_status_at_creation" text,"status" text NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."acj_definitions" ("acj_id" text NOT NULL,"version" text NOT NULL,"status" text NOT NULL,"name" text NOT NULL,"short_phrase" text,"purpose" text,"desired_effect" text,"primary_question" text,"state_from" text,"state_to" text,"mechanism" text,"color" text,"editorial_hints" text[] NOT NULL,"data" jsonb NOT NULL,"document_ref" text,"effective_from" timestamp with time zone NOT NULL,"deprecated_at" timestamp with time zone,"created_at" timestamp with time zone NOT NULL,"brand_id" uuid);
CREATE TABLE public."acj_learning_decisions" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"entry_id" uuid NOT NULL,"from_status" text,"to_status" text NOT NULL,"change_class" text,"confidence" text,"note" text,"decided_by" uuid,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."acj_learning_entries" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"code" text NOT NULL,"title" text NOT NULL,"acj_ids" text[] NOT NULL,"object_type" text,"campaign_id" uuid,"cycle_id" uuid,"content_id" uuid,"post_id" uuid,"observed_fact" text NOT NULL,"context" text,"sources" text[] NOT NULL,"candidate_pattern" text,"hypothesis" text,"alternatives" text,"test_design" jsonb NOT NULL,"probable_causes" text[] NOT NULL,"status" text NOT NULL,"confidence" text NOT NULL,"change_class" text,"next_action" text,"affected_document" text,"promotion_status" text NOT NULL,"reopen_reason" text,"origin" text NOT NULL,"approved_by" uuid,"approved_at" timestamp with time zone,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."acj_learning_evidence" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"entry_id" uuid NOT NULL,"source" text NOT NULL,"post_id" uuid,"content_id" uuid,"description" text NOT NULL,"data" jsonb NOT NULL,"limitations" text,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."acj_signal_readings" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"acj_primary" text,"comment_count" integer NOT NULL,"movement_evidence" text,"probable_causes" text[] NOT NULL,"signals" jsonb NOT NULL,"summary" text,"limitations" text,"model" text,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."ai_chat_messages" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"role" text NOT NULL,"content" text NOT NULL,"proposals" jsonb NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."ai_generations" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"editorial_slug" text,"target_avatar" text,"platform" text,"briefing" text,"arsenal_item_id" uuid,"model" text,"variations_count" integer NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."ai_learnings" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"texto" text NOT NULL,"categoria" text NOT NULL,"evidencias" integer NOT NULL,"ativo" boolean NOT NULL,"exemplo_antes" text,"exemplo_depois" text,"origem_review_id" uuid,"last_reforcada_em" timestamp with time zone NOT NULL,"created_at" timestamp with time zone NOT NULL,"facet" text NOT NULL,"origem" text NOT NULL,"editorial_slug" text,"platform" text,"target_avatar" text,"origem_chat_message_id" uuid,"brand_id" uuid,"front_id" uuid,"emitter_id" uuid,"profile_id" uuid);
CREATE TABLE public."ai_measurement_events" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"event_key" text NOT NULL,"payload" jsonb NOT NULL,"status" text NOT NULL,"attempts" integer NOT NULL,"error" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."ai_reviews" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"variation_id" uuid,"generation_id" uuid,"post_id" uuid NOT NULL,"quote_original" text NOT NULL,"quote_final" text NOT NULL,"caption_original" text NOT NULL,"caption_final" text NOT NULL,"quote_changed" boolean NOT NULL,"caption_changed" boolean NOT NULL,"changed" boolean NOT NULL,"drift_pct" numeric,"created_at" timestamp with time zone NOT NULL,"quote_drift_pct" numeric,"caption_drift_pct" numeric,"has_image" boolean NOT NULL,"image_changed" boolean NOT NULL);
CREATE TABLE public."ai_segment_gate" ("user_id" uuid NOT NULL,"editorial_slug" text NOT NULL,"platform" text NOT NULL,"target_avatar" text NOT NULL,"unlocked" boolean NOT NULL,"unlocked_at" timestamp with time zone,"relocked_at" timestamp with time zone,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."ai_variations" ("id" uuid NOT NULL,"generation_id" uuid NOT NULL,"user_id" uuid NOT NULL,"idx" integer NOT NULL,"quote" text NOT NULL,"caption" text NOT NULL,"headline_type" text,"analogy" text,"post_id" uuid,"created_at" timestamp with time zone NOT NULL,"virality_score" integer,"virality_reason" text);
CREATE TABLE public."alma_crencas" ("id" uuid NOT NULL,"texto" text NOT NULL,"dimensao_slug" text,"direcao" text,"forca" integer,"estagio" text,"evidencias" integer,"origem" text,"source_ref" text,"last_reforcada_em" timestamp with time zone,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."alma_dimensoes" ("id" uuid NOT NULL,"slug" text NOT NULL,"nome" text NOT NULL,"ordem" integer,"natureza" text,"consciencia" text,"formula_mecanica" text,"frase_mecanica" text,"sintomas" text,"frase_sistemica" text,"impactos" text,"oitava" integer,"updated_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."alma_estado" ("id" boolean NOT NULL,"humor" text,"atualizado_em" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."alma_eventos" ("id" uuid NOT NULL,"tipo" text NOT NULL,"descricao" text,"source" text,"dimensao_slug" text,"delta" integer,"payload" jsonb,"user_id" uuid,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."alma_objetivo" ("id" uuid NOT NULL,"texto" text NOT NULL,"is_current" boolean,"edited_by" uuid,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."alma_pulsoes" ("id" uuid NOT NULL,"nome" text NOT NULL,"nota" text,"intensidade" integer,"vigiada" boolean,"ordem" integer,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."alma_sombra" ("id" uuid NOT NULL,"mecanismo" text NOT NULL,"fala" text,"nao_acolhe" text,"dimensao_slug" text,"ativa" boolean,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."audiences" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"front_id" uuid,"name" text NOT NULL,"definition" text,"situations" text[] NOT NULL,"needs" text[] NOT NULL,"language_notes" text,"roles" jsonb NOT NULL,"status" text NOT NULL,"notes" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."bee_analogies" ("id" uuid NOT NULL,"name" text NOT NULL,"description" text,"domain" text,"used" boolean,"best_for" text,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."bee_arsenal" ("id" uuid NOT NULL,"editorial_slug" text NOT NULL,"type" text NOT NULL,"title" text NOT NULL,"summary" text,"details" text,"source" text,"metadata" jsonb,"position" integer,"created_at" timestamp with time zone,"is_active" boolean NOT NULL,"usage_count" integer NOT NULL,"last_used_at" timestamp with time zone,"performance_score" numeric NOT NULL,"source_type" text,"source_id" uuid,"brand_id" uuid);
CREATE TABLE public."bee_avatars" ("id" uuid NOT NULL,"slug" text NOT NULL,"name" text NOT NULL,"state" text,"dor" text,"desafio_comunicacao" text,"gatilhos" text[],"beneficios" text[],"example_phrases" text[],"position" integer,"brand_id" uuid);
CREATE TABLE public."bee_directives" ("id" uuid NOT NULL,"scope" text NOT NULL,"scope_ref" text,"titulo" text,"instrucao" text NOT NULL,"ordem" integer,"ativo" boolean,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"tipo" text NOT NULL,"inviolavel" boolean NOT NULL,"brand_id" uuid,"front_id" uuid,"emitter_id" uuid,"profile_id" uuid);
CREATE TABLE public."bee_editorials" ("id" uuid NOT NULL,"slug" text NOT NULL,"name" text NOT NULL,"description" text,"frequency_hint" text,"structure_template" text,"emotional_sequence" text[],"position" integer,"is_active" boolean,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"is_system" boolean NOT NULL,"objetivo" text,"tom" text,"fazer" text[] NOT NULL,"evitar" text[] NOT NULL,"temas" text[] NOT NULL,"audience" jsonb NOT NULL,"color" text,"brand_id" uuid,"front_id" uuid,"territorio" text,"perguntas" text[] NOT NULL,"material" text,"exemplo" text,"curation_status" text NOT NULL);
CREATE TABLE public."bee_example_posts" ("id" uuid NOT NULL,"editorial_slug" text,"avatar_slug" text,"image_quote" text NOT NULL,"caption" text NOT NULL,"why_good" text,"headline_type" text,"analogy" text,"source" text,"position" integer,"is_active" boolean NOT NULL,"usage_count" integer NOT NULL,"last_used_at" timestamp with time zone,"performance_score" numeric NOT NULL,"source_type" text,"source_id" uuid,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."bee_glossary" ("id" uuid NOT NULL,"term" text NOT NULL,"meaning" text NOT NULL,"usage_note" text,"must_appear" boolean,"created_at" timestamp with time zone,"is_mantra" boolean,"brand_id" uuid);
CREATE TABLE public."bee_hashtags" ("id" uuid NOT NULL,"tag" text NOT NULL,"required" boolean,"topic" text,"position" integer,"brand_id" uuid);
CREATE TABLE public."bee_headline_types" ("id" uuid NOT NULL,"slug" text NOT NULL,"name" text NOT NULL,"description" text,"examples" text[],"position" integer,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."bee_logics" ("id" uuid NOT NULL,"slug" text NOT NULL,"name" text NOT NULL,"common_belief" text,"deconstructive_logic" text,"position" integer,"brand_id" uuid);
CREATE TABLE public."bee_personas" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"nome" text NOT NULL,"idade" integer,"cargo" text,"empresa" text,"historia" text,"rotina" text,"personalidade" text,"memorias" text[] NOT NULL,"valores" text[] NOT NULL,"dor" text,"desejo" text,"objecoes" text[] NOT NULL,"gatilhos" text[] NOT NULL,"linguagem" text,"base_tipo" text,"base_ref" text,"is_active" boolean NOT NULL,"position" integer NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."bee_products" ("id" uuid NOT NULL,"user_id" uuid,"slug" text NOT NULL,"name" text NOT NULL,"description" text,"type" text,"pre_launch_start" date,"launch_date" date,"post_launch_end" date,"status" text,"promessa" text,"pillars" text[],"cta_text" text,"cta_link" text,"metadata" jsonb,"is_system" boolean,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"brand_id" uuid,"audience_ids" uuid[] NOT NULL);
CREATE TABLE public."bee_style_rules" ("id" uuid NOT NULL,"category" text NOT NULL,"rule" text NOT NULL,"rationale" text,"position" integer,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."bee_suggestions" ("id" uuid NOT NULL,"kind" text NOT NULL,"status" text NOT NULL,"editorial_slug" text,"payload" jsonb NOT NULL,"source_type" text,"source_id" uuid,"source_excerpt" text,"confidence" numeric,"created_by" uuid,"reviewed_by" uuid,"reviewed_at" timestamp with time zone,"approved_target_id" uuid,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."bee_themes" ("id" uuid NOT NULL,"slug" text NOT NULL,"name" text NOT NULL,"senso_comum" text,"olhar_bee" text,"analogies_keys" text[],"key_phrases" text[],"avoid_phrases" text[],"example_roteiro" text,"position" integer,"brand_id" uuid);
CREATE TABLE public."brand_intelligence_history" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"version" integer NOT NULL,"settings" jsonb NOT NULL,"changed_by" uuid NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."brand_intelligence_settings" ("brand_id" uuid NOT NULL,"discovery_enabled" boolean NOT NULL,"discovery_instruction" text NOT NULL,"acj_enabled_ids" text[] NOT NULL,"acj_instruction" text NOT NULL,"version" integer NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."brands" ("id" uuid NOT NULL,"workspace_id" uuid NOT NULL,"name" text NOT NULL,"slug" text NOT NULL,"essence" text,"status" text NOT NULL,"is_default" boolean NOT NULL,"metadata" jsonb NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."business_fronts" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"name" text NOT NULL,"slug" text NOT NULL,"description" text,"territories" text[] NOT NULL,"offer_ids" uuid[] NOT NULL,"status" text NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."campaign_cycles" ("id" uuid NOT NULL,"campaign_id" uuid NOT NULL,"user_id" uuid NOT NULL,"idx" smallint NOT NULL,"start_date" date NOT NULL,"end_date" date NOT NULL,"status" text NOT NULL,"plan" jsonb,"review_due" date,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."campaigns" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"name" text NOT NULL,"type" text NOT NULL,"status" text NOT NULL,"intent" text,"moment" jsonb,"strategy" jsonb,"duration_weeks" smallint,"start_date" date,"end_date" date,"product_id" uuid,"color" text,"account_ids" uuid[] NOT NULL,"cadence" jsonb NOT NULL,"activated_at" timestamp with time zone,"metadata" jsonb NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"profile_id" uuid,"profile_needs_review" boolean NOT NULL,"profile_version" integer);
CREATE TABLE public."communication_profile_versions" ("id" uuid NOT NULL,"profile_id" uuid NOT NULL,"version" integer NOT NULL,"status" text NOT NULL,"data" jsonb NOT NULL,"reason" text,"created_by" uuid,"activated_at" timestamp with time zone,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."communication_profiles" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"emitter_id" uuid NOT NULL,"front_id" uuid NOT NULL,"primary_audience_id" uuid,"secondary_audience_ids" uuid[] NOT NULL,"name" text NOT NULL,"positioning" text,"expression" text,"cta_policy" text NOT NULL,"offer_ids" uuid[] NOT NULL,"status" text NOT NULL,"version" integer NOT NULL,"is_default" boolean NOT NULL,"needs_recalibration" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."content_base_uses" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"content_id" uuid NOT NULL,"version_id" uuid NOT NULL,"campaign_id" uuid NOT NULL,"cycle_id" uuid NOT NULL,"idea_id" uuid,"origin" text NOT NULL,"position" integer NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."content_base_versions" ("id" uuid NOT NULL,"content_id" uuid NOT NULL,"user_id" uuid NOT NULL,"draft_cycle_id" uuid,"ordinal" integer NOT NULL,"body" jsonb NOT NULL,"considered" jsonb,"context_snapshot_id" uuid,"note" text,"status" text NOT NULL,"created_at" timestamp with time zone NOT NULL,"validated_at" timestamp with time zone);
CREATE TABLE public."content_idea_feedback" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"idea_id" uuid,"idea_title" text,"feedback" text,"reason" text,"created_at" timestamp with time zone);
CREATE TABLE public."content_ideas_cache" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"prompt_hash" text NOT NULL,"ideas" jsonb NOT NULL,"metadata" jsonb,"expires_at" timestamp with time zone,"created_at" timestamp with time zone);
CREATE TABLE public."content_memory" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid,"platform" text,"origin" text NOT NULL,"text" text NOT NULL,"said_at" timestamp with time zone,"text_hash" text NOT NULL,"embedding" vector(1536) NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."content_piece_plans" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"content_id" uuid NOT NULL,"campaign_id" uuid,"cycle_id" uuid,"account_id" uuid,"platform" text NOT NULL,"format" text NOT NULL,"approach" text,"purpose" text,"architecture" text,"origin" text NOT NULL,"status" text NOT NULL,"post_id" uuid,"position" integer NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"source_base_version_id" uuid,"production_batch_id" uuid,"template_family" text,"editorial_slug" text,"generation_claim" uuid,"generation_until" timestamp with time zone,"generation_error" text,"context_snapshot_id" uuid,"profile_id" uuid,"acj_primary" text,"acj_secondary" text,"acj_rationale" text);
CREATE TABLE public."contents" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"idea_id" uuid,"campaign_id" uuid,"cycle_id" uuid,"title" text NOT NULL,"strategic_function" text,"editorial_slug" text,"validation_format" text NOT NULL,"body" jsonb NOT NULL,"considered" jsonb,"status" text NOT NULL,"versions" jsonb NOT NULL,"position" smallint NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"metadata" jsonb NOT NULL,"profile_id" uuid,"context_snapshot_id" uuid);
CREATE TABLE public."context_snapshots" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"brand_id" uuid,"profile_id" uuid,"profile_version" integer,"emitter_id" uuid,"front_id" uuid,"audience_ids" uuid[] NOT NULL,"interlocutor_state" text,"campaign_id" uuid,"fallback" boolean NOT NULL,"summary" text NOT NULL,"data" jsonb NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."design_assets" ("id" uuid NOT NULL,"kind" text NOT NULL,"title" text NOT NULL,"storage_path" text,"url" text,"mime_type" text,"width" integer,"height" integer,"origin" text NOT NULL,"semantic" jsonb NOT NULL,"tags" text[],"is_active" boolean,"usage_count" integer,"last_used_at" timestamp with time zone,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"source_image_id" uuid,"person_slug" text,"brand_id" uuid);
CREATE TABLE public."design_manifestacoes" ("id" text NOT NULL,"nome" text NOT NULL,"operacao" text,"funcao" text,"quando_usar" jsonb,"quando_nao" jsonb,"score_criteria" jsonb,"ativo" boolean,"ordem" integer,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"auto_select" boolean NOT NULL,"brand_id" uuid);
CREATE TABLE public."design_selection_config" ("id" uuid NOT NULL,"scope" text NOT NULL,"weights" jsonb NOT NULL,"thresholds" jsonb NOT NULL,"diversity" jsonb NOT NULL,"ativo" boolean,"updated_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."design_tokens" ("id" uuid NOT NULL,"kind" text NOT NULL,"slug" text NOT NULL,"label" text,"value" jsonb NOT NULL,"is_official" boolean,"notes" text,"ordem" integer,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."design_variacoes" ("id" text NOT NULL,"manifestacao_id" text NOT NULL,"nome" text NOT NULL,"operacao" text,"sensacao" jsonb,"quando_usar" jsonb,"quando_nao" jsonb,"limites" jsonb,"layer_stack" jsonb,"asset_requirements" jsonb,"selection_rule" jsonb,"status" text,"version" text,"ativo" boolean,"ordem" integer,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."editorial_line_runs" ("id" uuid NOT NULL,"line_id" uuid NOT NULL,"post_id" uuid,"user_id" uuid NOT NULL,"platform" text,"editorial_slug" text,"status" text,"error_message" text,"scheduled_for" timestamp with time zone,"run_at" timestamp with time zone,"duration_ms" integer,"metadata" jsonb);
CREATE TABLE public."editorial_lines" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"product_id" uuid,"name" text NOT NULL,"description" text,"editorial_slugs" text[] NOT NULL,"rotation_cursor" integer,"target_avatar" text,"platforms" text[],"campaign_phase" text,"frequency_type" text,"frequency_days" integer[],"preferred_hour" integer,"start_date" date,"end_date" date,"briefing_base" text,"theme" text,"status" text,"next_run_at" timestamp with time zone,"last_run_at" timestamp with time zone,"posts_generated_count" integer,"metadata" jsonb,"created_at" timestamp with time zone,"updated_at" timestamp with time zone);
CREATE TABLE public."emitters" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"kind" text NOT NULL,"name" text NOT NULL,"voice" text,"authority" text,"first_person" boolean NOT NULL,"speaking_rules" text,"photo_profile" text,"facts_status" text NOT NULL,"status" text NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."format_capabilities" ("platform" text NOT NULL,"format" text NOT NULL,"min_units" integer NOT NULL,"max_units" integer NOT NULL,"recommended_units" int4range,"width" integer NOT NULL,"height" integer NOT NULL,"export_kind" text NOT NULL,"auto_publish" boolean NOT NULL,"notes" text,"version" integer NOT NULL,"verified_at" date NOT NULL);
CREATE TABLE public."genesis_avatares" ("id" uuid NOT NULL,"slug" text NOT NULL,"nome" text NOT NULL,"ordem" integer,"eixo_percepcao" integer,"eixo_identificacao" integer,"pergunta_central" text,"sofrimento" text,"relacao_autoridade" text,"linguagem" text,"frase_silenciosa" text,"o_que_teme" text,"o_que_busca" text,"frases_tipicas" text[],"como_conversar" text,"erros_comuns" text,"movimento_seguinte" text,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."genesis_core" ("id" boolean NOT NULL,"version" text NOT NULL,"pergunta_fundadora" text,"pergunta_silenciosa" text,"produto_real" text,"frase_organizadora" text,"missao" text,"persona_nome" text,"persona_postura" text,"voz_como_escreve" text,"voz_verbos" text[],"voz_nunca" text[],"updated_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."genesis_fluxo" ("id" uuid NOT NULL,"ordem" integer NOT NULL,"pergunta" text NOT NULL,"nota" text,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."genesis_lentes" ("id" uuid NOT NULL,"slug" text NOT NULL,"nome" text NOT NULL,"ordem" integer,"natureza" text,"consciencia" text,"formula_mecanica" text,"frase_mecanica" text,"sintomas" text,"frase_sistemica" text,"impactos" text,"oitava" integer,"updated_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."genesis_principios" ("id" uuid NOT NULL,"camada" text NOT NULL,"codigo" text NOT NULL,"titulo" text,"principio" text NOT NULL,"aplicacao" text,"ordem" integer,"inviolavel" boolean,"ativo" boolean,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."genesis_tensoes" ("id" uuid NOT NULL,"slug" text NOT NULL,"nome" text NOT NULL,"arquetipo" text,"logica" text,"potencia" text,"limite" text,"sofrimento_tipico" text,"ordem" integer,"created_at" timestamp with time zone,"brand_id" uuid);
CREATE TABLE public."ideas" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"campaign_id" uuid,"cycle_id" uuid,"title" text NOT NULL,"summary" text,"strategic_function" text,"editorial_slug" text,"channels" jsonb NOT NULL,"suggested_pieces" smallint NOT NULL,"origin" text NOT NULL,"status" text NOT NULL,"position" smallint NOT NULL,"rationale" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"acj_primary" text,"acj_secondary" text,"acj_role" text,"acj_rationale" text,"acj_confidence" text,"repeat_of" jsonb,"profile_id" uuid,"source_base_version_id" uuid);
CREATE TABLE public."image_model_trials" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"model" text NOT NULL,"prompt" text,"cost_usd" numeric,"tokens_input" integer,"tokens_output" integer,"approved" boolean NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."kanban_columns" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"name" text NOT NULL,"color" text,"position" integer NOT NULL,"is_default" boolean,"created_at" timestamp with time zone);
CREATE TABLE public."knowledge_analysis_runs" ("document_id" uuid NOT NULL,"user_id" uuid NOT NULL,"brand_id" uuid NOT NULL,"status" text NOT NULL,"claim" uuid NOT NULL,"started_at" timestamp with time zone NOT NULL,"finished_at" timestamp with time zone,"found" integer NOT NULL,"error" text);
CREATE TABLE public."knowledge_chunks" ("id" uuid NOT NULL,"document_id" uuid,"user_id" uuid,"chunk_index" integer NOT NULL,"content" text NOT NULL,"tokens" integer,"embedding" vector(1536),"metadata" jsonb,"created_at" timestamp with time zone);
CREATE TABLE public."knowledge_discoveries" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"brand_id" uuid NOT NULL,"document_id" uuid,"title" text NOT NULL,"summary" text NOT NULL,"sources" jsonb NOT NULL,"status" text NOT NULL,"content_id" uuid,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."knowledge_documents" ("id" uuid NOT NULL,"user_id" uuid,"title" text NOT NULL,"source_type" text,"source_size" integer,"chunk_count" integer,"is_global" boolean,"metadata" jsonb,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"brand_id" uuid,"archived" boolean NOT NULL,"source_text" text);
CREATE TABLE public."meta_ad_accounts" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"fb_account_id" text NOT NULL,"fb_business_id" text,"ownership" text,"name" text,"currency" text,"timezone_name" text,"account_status" integer,"amount_spent" numeric,"created_time" timestamp with time zone,"raw" jsonb,"insights_error" text,"history_since" date,"synced_at" timestamp with time zone NOT NULL);
CREATE TABLE public."meta_ad_insights_daily" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"fb_account_id" text NOT NULL,"fb_campaign_id" text,"campaign_name" text,"fb_adset_id" text,"adset_name" text,"fb_ad_id" text NOT NULL,"ad_name" text,"date" date NOT NULL,"spend" numeric,"impressions" bigint,"reach" bigint,"frequency" numeric,"clicks" bigint,"inline_link_clicks" bigint,"ctr" numeric,"cpc" numeric,"cpm" numeric,"actions" jsonb,"action_values" jsonb,"cost_per_action_type" jsonb,"raw" jsonb,"synced_at" timestamp with time zone NOT NULL);
CREATE TABLE public."meta_ads" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"fb_account_id" text NOT NULL,"fb_campaign_id" text,"fb_adset_id" text,"fb_ad_id" text NOT NULL,"name" text,"status" text,"effective_status" text,"created_time" timestamp with time zone,"creative" jsonb,"ig_media_id" text,"raw" jsonb,"synced_at" timestamp with time zone NOT NULL,"ig_account_id" text,"ig_username" text,"fb_page_id" text,"attribution_source" text,"attributed_at" timestamp with time zone);
CREATE TABLE public."meta_adsets" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"fb_account_id" text NOT NULL,"fb_campaign_id" text,"fb_adset_id" text NOT NULL,"name" text,"status" text,"effective_status" text,"optimization_goal" text,"billing_event" text,"daily_budget" numeric,"lifetime_budget" numeric,"start_time" timestamp with time zone,"end_time" timestamp with time zone,"created_time" timestamp with time zone,"targeting" jsonb,"raw" jsonb,"synced_at" timestamp with time zone NOT NULL);
CREATE TABLE public."meta_businesses" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"fb_business_id" text NOT NULL,"name" text,"verification_status" text,"raw" jsonb,"synced_at" timestamp with time zone NOT NULL);
CREATE TABLE public."meta_campaigns" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"fb_account_id" text NOT NULL,"fb_campaign_id" text NOT NULL,"name" text,"objective" text,"status" text,"effective_status" text,"buying_type" text,"daily_budget" numeric,"lifetime_budget" numeric,"start_time" timestamp with time zone,"stop_time" timestamp with time zone,"created_time" timestamp with time zone,"raw" jsonb,"synced_at" timestamp with time zone NOT NULL);
CREATE TABLE public."meta_connections" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"fb_user_id" text,"fb_user_name" text,"access_token" text NOT NULL,"token_expires_at" timestamp with time zone,"scopes" text[],"status" text NOT NULL,"sync_state" jsonb NOT NULL,"last_synced_at" timestamp with time zone,"history_complete_at" timestamp with time zone,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"ad_account_id" text,"page_id" text,"ig_user_id" text,"monthly_cap" numeric);
CREATE TABLE public."olhar_base" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"codigo" text NOT NULL,"grupo" text NOT NULL,"area" text,"titulo" text NOT NULL,"texto" text NOT NULL,"nota" text,"status" text NOT NULL,"ordem" integer NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."olhar_calibracao" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"session_id" uuid NOT NULL,"user_id" uuid,"caso_codigo" text,"veredito" text NOT NULL,"comentario" text,"ativo" boolean NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."olhar_nomes_proibidos" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"termo" text NOT NULL,"tipo" text NOT NULL,"exato" boolean NOT NULL,"ativo" boolean NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."olhar_sessions" ("id" uuid NOT NULL,"brand_id" uuid NOT NULL,"user_id" uuid,"origem" text NOT NULL,"caso_codigo" text,"desafio" text NOT NULL,"perguntas" jsonb NOT NULL,"respostas" jsonb NOT NULL,"resultado" jsonb,"tipo" text,"motivo" text,"barrado" boolean NOT NULL,"modelo" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."photo_generations" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"producer_id" text NOT NULL,"producer_profile_version" text NOT NULL,"post_id" uuid,"parent_id" uuid,"purpose" text NOT NULL,"origin" text NOT NULL,"source_ref_keys" text[] NOT NULL,"style_id" text,"variant_id" text,"expression_id" text,"wardrobe_id" text,"environment_id" text,"gaze" text,"crop" text,"text_space" text,"aspect" text,"mother_text" text,"content_semantics" jsonb,"plan" jsonb,"prompt" text,"model" text,"image_url" text,"storage_path" text,"width" integer,"height" integer,"attempt" integer NOT NULL,"gates" jsonb,"auto_status" text,"hard_fail" text,"identity_status" text,"realism_status" text,"review_status" text NOT NULL,"reviewer_notes" text,"approved_by" uuid,"approved_at" timestamp with time zone,"library_asset_id" uuid,"generated_at" timestamp with time zone,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."photo_references" ("id" uuid NOT NULL,"producer_id" text NOT NULL,"ref_key" text NOT NULL,"priority" text NOT NULL,"roles" text[] NOT NULL,"url" text NOT NULL,"storage_path" text,"asset_id" uuid,"file_name" text,"is_active" boolean NOT NULL,"created_at" timestamp with time zone NOT NULL,"brand_id" uuid);
CREATE TABLE public."photo_style_approvals" ("user_id" uuid NOT NULL,"style_id" text NOT NULL,"status" text NOT NULL,"board_generation_ids" uuid[] NOT NULL,"notes" text,"decided_at" timestamp with time zone,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."piece_candidates" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"operation_id" text NOT NULL,"base_version" integer NOT NULL,"base_candidate_id" uuid,"action" text NOT NULL,"mutable_paths" text[] NOT NULL,"scope" text NOT NULL,"unit_ids" text[] NOT NULL,"field_paths" text[] NOT NULL,"instruction" text,"selected_template_id" text,"selected_asset" jsonb,"preserved" jsonb NOT NULL,"proposal" jsonb,"diff" jsonb,"affected_components" text[] NOT NULL,"impact" text,"status" text NOT NULL,"error" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"applied_at" timestamp with time zone);
CREATE TABLE public."piece_versions" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"version" integer NOT NULL,"components" jsonb NOT NULL,"approvals" jsonb NOT NULL,"action" text,"candidate_id" uuid,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."podcast_clips" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"podcast_id" uuid,"title" text,"video_path" text,"video_url" text,"transcript" text,"visual_summary" text,"duration_seconds" integer,"content_type" text,"post_id" uuid,"metadata" jsonb,"created_at" timestamp with time zone,"updated_at" timestamp with time zone);
CREATE TABLE public."podcasts" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"youtube_url" text,"youtube_video_id" text,"title" text NOT NULL,"description" text,"channel" text,"thumbnail_url" text,"metadata" jsonb,"created_at" timestamp with time zone,"updated_at" timestamp with time zone);
CREATE TABLE public."post_comments" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"account_id" uuid,"platform" text NOT NULL,"external_id" text NOT NULL,"parent_external_id" text,"text" text,"author_username" text,"is_own" boolean NOT NULL,"like_count" integer,"commented_at" timestamp with time zone,"raw" jsonb,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."post_drafts" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid,"draft_data" jsonb NOT NULL,"updated_at" timestamp with time zone);
CREATE TABLE public."post_metrics" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"account_id" uuid,"source" text NOT NULL,"captured_at" timestamp with time zone NOT NULL,"reach" integer,"impressions" integer,"likes" integer,"comments" integer,"saves" integer,"shares" integer,"engagement_rate" numeric,"raw" jsonb,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."post_publications" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"version" integer NOT NULL,"destination" text NOT NULL,"platform" text NOT NULL,"account_id" uuid,"format" text NOT NULL,"status" text NOT NULL,"units_total" integer NOT NULL,"units_published" integer NOT NULL,"external_id" text,"url" text,"error" text,"started_at" timestamp with time zone NOT NULL,"finished_at" timestamp with time zone,"package_id" uuid,"attempt_id" uuid,"stage" text NOT NULL,"lease_expires_at" timestamp with time zone,"failure_class" text,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."post_templates" ("id" uuid NOT NULL,"user_id" uuid,"name" text NOT NULL,"description" text,"category" text,"preview_image_url" text,"thumbnail_url" text,"slides_count" integer,"template_config" jsonb NOT NULL,"platform" text,"format" text,"is_default" boolean,"is_premium" boolean,"is_archived" boolean,"is_public" boolean,"is_system" boolean,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"slug" text);
CREATE TABLE public."post_unit_publications" ("id" uuid NOT NULL,"publication_id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"unit_id" uuid NOT NULL,"position" integer NOT NULL,"status" text NOT NULL,"external_id" text,"error" text,"published_at" timestamp with time zone);
CREATE TABLE public."post_units" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"position" integer NOT NULL,"function" text,"title" text,"body" text,"visual_direction" text,"layout" text NOT NULL,"media_type" text NOT NULL,"assets" jsonb NOT NULL,"fabric_json" jsonb,"rendered_url" text,"text_version" integer NOT NULL,"rendered_text_version" integer,"visual_status" text NOT NULL,"review_status" text NOT NULL,"error" text,"duration_ms" integer,"narration" text,"subtitles" text,"audio" jsonb,"transition" text,"alt_text" text,"interaction" jsonb,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."profiles" ("id" uuid NOT NULL,"name" text NOT NULL,"email" text,"role" text,"avatar_color" text,"created_at" timestamp with time zone,"updated_at" timestamp with time zone);
CREATE TABLE public."publication_packages" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"schema_version" integer NOT NULL,"source_version" integer NOT NULL,"platform" text NOT NULL,"format" text NOT NULL,"account_id" uuid,"destination" text NOT NULL,"manifest" jsonb NOT NULL,"manifest_sha256" text NOT NULL,"origin" text NOT NULL,"command_id" uuid,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."schedule_commands" ("command_id" uuid NOT NULL,"user_id" uuid NOT NULL,"post_id" uuid NOT NULL,"plan_id" uuid,"intent" text NOT NULL,"params_sha256" text NOT NULL,"result" jsonb NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."schedule_plans" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"summary" text,"rows" jsonb NOT NULL,"status" text NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."setup_sessions" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"brand_id" uuid,"mode" text NOT NULL,"target_profile_ids" uuid[] NOT NULL,"targets" text[] NOT NULL,"base_versions" jsonb NOT NULL,"answers" jsonb NOT NULL,"sources" jsonb NOT NULL,"proposals" jsonb NOT NULL,"step" text NOT NULL,"status" text NOT NULL,"result" jsonb,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"title" text,"reviews" jsonb NOT NULL,"calibrations" jsonb NOT NULL,"activated_at" timestamp with time zone);
CREATE TABLE public."social_accounts" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"platform" text NOT NULL,"label" text NOT NULL,"handle" text,"is_default" boolean NOT NULL,"status" text NOT NULL,"linkedin_token" text,"linkedin_author_urn" text,"instagram_access_token" text,"instagram_business_account_id" text,"instagram_token_expires_at" timestamp with time zone,"scopes" text[],"metadata" jsonb NOT NULL,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."traffic_ads" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"campaign_id" uuid NOT NULL,"post_id" uuid NOT NULL,"mode" text NOT NULL,"primary_text" text,"headline" text,"cta" text,"link_url" text,"fb_creative_id" text,"fb_ad_id" text,"error" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL);
CREATE TABLE public."traffic_campaigns" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"name" text NOT NULL,"objective" text,"status" text NOT NULL,"step" smallint NOT NULL,"draft" jsonb NOT NULL,"ai_notes" jsonb NOT NULL,"fb_campaign_id" text,"fb_adset_id" text,"error" text,"created_at" timestamp with time zone NOT NULL,"updated_at" timestamp with time zone NOT NULL,"activated_at" timestamp with time zone,"ended_at" timestamp with time zone);
CREATE TABLE public."usage_events" ("id" bigint NOT NULL,"user_id" uuid,"provider" text NOT NULL,"product" text NOT NULL,"model" text,"tokens_input" integer,"tokens_output" integer,"cost_usd" numeric(10,6),"metadata" jsonb,"created_at" timestamp with time zone);
CREATE TABLE public."user_feedback" ("id" uuid NOT NULL,"user_id" uuid,"type" text,"title" text,"description" text,"metadata" jsonb,"created_at" timestamp with time zone);
CREATE TABLE public."user_posts" ("id" uuid NOT NULL,"user_id" uuid NOT NULL,"template_id" uuid,"title" text,"briefing" text,"platform" text,"format" text,"carousel_text" jsonb,"carousel_fabric_json" jsonb,"generated_images" jsonb,"rendered_slides" jsonb,"caption" text,"status" text,"scheduled_date" timestamp with time zone,"published_date" timestamp with time zone,"is_favorite" boolean,"kanban_column_id" uuid,"metadata" jsonb,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"editorial_line_id" uuid,"companion_post_id" uuid,"product_id" uuid,"published_url" text,"published_at" timestamp with time zone,"publish_error" text,"publish_attempts" integer,"codigo" text,"virality_score" integer,"virality_reason" text,"ai_edit_rounds" integer NOT NULL,"manual_edits" integer NOT NULL,"editorial_locked" boolean,"text_approved" boolean,"image_status" text,"image_approved" boolean,"visual_decision" jsonb,"content_id" uuid,"campaign_id" uuid,"cycle_id" uuid,"account_id" uuid,"piece_role" text,"alternative_group" uuid,"alternative_rank" smallint,"is_recommended" boolean,"schedule_priority" smallint,"suggested_start" date,"suggested_end" date,"acj_primary" text,"acj_secondary" text,"acj_snapshot" jsonb,"acj_status" text,"acj_frozen_at" timestamp with time zone,"acj_deviation" jsonb,"profile_id" uuid,"context_snapshot_id" uuid,"reference_status" text,"version" integer NOT NULL,"scheduled_version" integer,"plan_id" uuid,"narrative_architecture" text,"script_status" text,"visual_direction" jsonb,"approved_version" integer,"export_package" jsonb,"source_content_at" timestamp with time zone,"scheduled_package_id" uuid);
CREATE TABLE public."user_settings" ("user_id" uuid NOT NULL,"archetype" text,"persona" text,"tone_of_voice" text,"content_structure" text,"caption_prompt_template" text,"image_style_prompt" text,"brand_colors" text[],"brand_logo_url" text,"brand_font" text,"gemini_api_key" text,"serpapi_key" text,"linkedin_token" text,"linkedin_user_id" text,"linkedin_publish_enabled" boolean,"use_ai_images" boolean,"default_template_id" uuid,"content_analysis" jsonb,"created_at" timestamp with time zone,"updated_at" timestamp with time zone,"linkedin_author_urn" text,"instagram_access_token" text,"instagram_business_account_id" text,"distribution_prefs" jsonb NOT NULL,"instagram_token_expires_at" timestamp with time zone,"openai_api_key" text,"validation_format" text NOT NULL,"timezone" text NOT NULL);
CREATE TABLE public."workspace_members" ("workspace_id" uuid NOT NULL,"user_id" uuid NOT NULL,"role" text NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE TABLE public."workspaces" ("id" uuid NOT NULL,"name" text NOT NULL,"slug" text NOT NULL,"created_at" timestamp with time zone NOT NULL);
CREATE OR REPLACE FUNCTION public._setup_arr(j jsonb)
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE WHEN j IS NULL OR jsonb_typeof(j) <> 'array' THEN NULL ELSE ARRAY(SELECT jsonb_array_elements_text(j)) END
$function$;
ALTER FUNCTION public."_setup_arr"(j jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."_setup_arr"(j jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."_setup_arr"(j jsonb) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."_setup_arr"(j jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."_setup_arr"(j jsonb) TO "anon";
GRANT EXECUTE ON FUNCTION public."_setup_arr"(j jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."_setup_arr"(j jsonb) TO "service_role";
CREATE OR REPLACE FUNCTION public._setup_ref(refs jsonb, x text)
 RETURNS uuid
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT CASE WHEN x IS NULL OR x = '' THEN NULL WHEN refs ? x THEN (refs->>x)::uuid WHEN x LIKE 'new:%' THEN NULL ELSE x::uuid END
$function$;
ALTER FUNCTION public."_setup_ref"(refs jsonb, x text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."_setup_ref"(refs jsonb, x text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."_setup_ref"(refs jsonb, x text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."_setup_ref"(refs jsonb, x text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."_setup_ref"(refs jsonb, x text) TO "anon";
GRANT EXECUTE ON FUNCTION public."_setup_ref"(refs jsonb, x text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."_setup_ref"(refs jsonb, x text) TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_campaign_plan_after()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status IN ('approved', 'active') AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('approved', 'active')) THEN
    UPDATE public.acj_campaign_plans SET status = 'archived'
     WHERE campaign_id = NEW.campaign_id AND id <> NEW.id AND status IN ('approved', 'active', 'recommended', 'draft', 'recalibration_needed');
  END IF;
  RETURN NULL;
END $function$;
ALTER FUNCTION public."acj_campaign_plan_after"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_campaign_plan_after"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_after"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_after"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_after"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_after"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_after"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_campaign_plan_guard()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.version IS NULL THEN
      SELECT COALESCE(max(version), 0) + 1 INTO NEW.version FROM public.acj_campaign_plans WHERE campaign_id = NEW.campaign_id;
    END IF;
    RETURN NEW;
  END IF;
  IF OLD.status IN ('approved', 'active', 'completed', 'archived')
     AND (NEW.target_mix IS DISTINCT FROM OLD.target_mix OR NEW.phases IS DISTINCT FROM OLD.phases
          OR NEW.audience_state IS DISTINCT FROM OLD.audience_state OR NEW.journey_needs IS DISTINCT FROM OLD.journey_needs) THEN
    RAISE EXCEPTION 'Plano ACJ aprovado é imutável: crie uma nova versão.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."acj_campaign_plan_guard"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_campaign_plan_guard"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_guard"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_guard"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_guard"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_guard"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_campaign_plan_guard"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_contract_guard()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.version IS NULL THEN
      SELECT COALESCE(max(version), 0) + 1 INTO NEW.version FROM public.acj_content_contracts WHERE content_id = NEW.content_id;
    END IF;
    UPDATE public.acj_content_contracts SET status = 'superseded' WHERE content_id = NEW.content_id AND status <> 'superseded';
    RETURN NEW;
  END IF;
  IF NEW.acj_primary IS DISTINCT FROM OLD.acj_primary OR NEW.acj_secondary IS DISTINCT FROM OLD.acj_secondary
     OR NEW.movement_to IS DISTINCT FROM OLD.movement_to OR NEW.connection_mechanism IS DISTINCT FROM OLD.connection_mechanism
     OR NEW.audience_state_from IS DISTINCT FROM OLD.audience_state_from OR NEW.content_id IS DISTINCT FROM OLD.content_id THEN
    RAISE EXCEPTION 'Mudança de movimento exige nova versão do contrato ACJ.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."acj_contract_guard"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_contract_guard"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_contract_guard"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_contract_guard"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_contract_guard"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_contract_guard"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_contract_guard"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_contract_propagate()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.user_posts SET acj_snapshot = acj_snapshot WHERE content_id = NEW.content_id AND acj_frozen_at IS NULL;
  RETURN NULL;
END $function$;
ALTER FUNCTION public."acj_contract_propagate"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_contract_propagate"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_contract_propagate"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_contract_propagate"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_contract_propagate"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_contract_propagate"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_contract_propagate"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_cycle_plan_before()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.version IS NULL THEN
    SELECT COALESCE(max(version), 0) + 1 INTO NEW.version FROM public.acj_cycle_plans WHERE cycle_id = NEW.cycle_id;
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_object_keys(NEW.counts) k WHERE NOT public.acj_valid(k)) THEN
    RAISE EXCEPTION 'Plano do ciclo: só ACJ-01 a ACJ-05.' USING ERRCODE = 'check_violation';
  END IF;
  UPDATE public.acj_cycle_plans SET status = 'archived' WHERE cycle_id = NEW.cycle_id AND status <> 'archived';
  RETURN NEW;
END $function$;
ALTER FUNCTION public."acj_cycle_plan_before"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_cycle_plan_before"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_cycle_plan_before"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_cycle_plan_before"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_cycle_plan_before"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_cycle_plan_before"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_cycle_plan_before"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_learning_audit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.acj_learning_decisions (user_id, entry_id, from_status, to_status, change_class, confidence, note, decided_by)
    VALUES (NEW.user_id, NEW.id, CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END, NEW.status, NEW.change_class, NEW.confidence,
            CASE WHEN TG_OP = 'INSERT' THEN 'Registro aberto' ELSE NEW.next_action END, auth.uid());
  END IF;
  RETURN NULL;
END $function$;
ALTER FUNCTION public."acj_learning_audit"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_learning_audit"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_learning_audit"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_learning_audit"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_learning_audit"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_learning_audit"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_learning_audit"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_learning_guard()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE ok boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.code IS NULL OR NEW.code = '' THEN
      PERFORM pg_advisory_xact_lock(hashtext('acjl' || NEW.user_id::text));
      SELECT 'ACJL-' || to_char(now(), 'YYYY') || '-' || lpad((COALESCE(max(split_part(code, '-', 3)::int), 0) + 1)::text, 3, '0')
        INTO NEW.code FROM public.acj_learning_entries
       WHERE user_id = NEW.user_id AND code LIKE 'ACJL-' || to_char(now(), 'YYYY') || '-%';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.code IS DISTINCT FROM OLD.code THEN
    RAISE EXCEPTION 'O ID do registro é imutável.' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    ok := CASE OLD.status
      WHEN 'open' THEN NEW.status IN ('hypothesis', 'inconclusive')
      WHEN 'hypothesis' THEN NEW.status IN ('testing', 'suspended', 'rejected', 'inconclusive')
      WHEN 'testing' THEN NEW.status IN ('provisional', 'rejected', 'inconclusive', 'suspended')
      WHEN 'provisional' THEN NEW.status IN ('testing', 'validated', 'rejected', 'inconclusive')
      WHEN 'validated' THEN NEW.status IN ('consolidated')
      WHEN 'suspended' THEN NEW.status IN ('hypothesis', 'testing')
      ELSE NEW.status IN ('open', 'hypothesis') AND COALESCE(NEW.reopen_reason, '') <> '' AND NEW.reopen_reason IS DISTINCT FROM OLD.reopen_reason
    END;
    IF NOT ok THEN
      RAISE EXCEPTION 'Transição não permitida no Registro Vivo: % → %', OLD.status, NEW.status USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."acj_learning_guard"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_learning_guard"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_learning_guard"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_learning_guard"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_learning_guard"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_learning_guard"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_learning_guard"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_learning_no_delete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF current_user IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'Registros do Registro Vivo não são apagados; encerre como rejeitado ou inconclusivo.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN OLD;
END $function$;
ALTER FUNCTION public."acj_learning_no_delete"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_learning_no_delete"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_learning_no_delete"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_learning_no_delete"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_learning_no_delete"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_learning_no_delete"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_learning_no_delete"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_mix_ok(m jsonb)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT m IS NOT NULL AND jsonb_typeof(m) = 'object'
    AND NOT EXISTS (SELECT 1 FROM jsonb_object_keys(m) k WHERE NOT public.acj_valid(k))
    AND NOT EXISTS (SELECT 1 FROM jsonb_each(m) e WHERE jsonb_typeof(e.value) <> 'number' OR (e.value)::numeric < 0 OR (e.value)::numeric > 100)
    AND abs(COALESCE((SELECT sum((e.value)::numeric) FROM jsonb_each(m) e), 0) - 100) <= 1
$function$;
ALTER FUNCTION public."acj_mix_ok"(m jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_mix_ok"(m jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_mix_ok"(m jsonb) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_mix_ok"(m jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_mix_ok"(m jsonb) TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_mix_ok"(m jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_mix_ok"(m jsonb) TO "service_role";
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
ALTER FUNCTION public."acj_piece_inherit"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_piece_inherit"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_piece_inherit"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_piece_inherit"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_piece_inherit"() TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_piece_inherit"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_piece_inherit"() TO "service_role";
CREATE OR REPLACE FUNCTION public.acj_valid(id text)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$ SELECT id IN ('ACJ-01','ACJ-02','ACJ-03','ACJ-04','ACJ-05') $function$;
ALTER FUNCTION public."acj_valid"(id text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acj_valid"(id text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acj_valid"(id text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."acj_valid"(id text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."acj_valid"(id text) TO "anon";
GRANT EXECUTE ON FUNCTION public."acj_valid"(id text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."acj_valid"(id text) TO "service_role";
CREATE OR REPLACE FUNCTION public.acquire_publication(p_post uuid, p_user uuid, p_package uuid, p_destination text, p_attempt uuid, p_lease_seconds integer DEFAULT 300)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE p public.user_posts%ROWTYPE; op public.post_publications%ROWTYPE; v int; nunits int := 1;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = p_post FOR UPDATE;
  IF NOT FOUND OR p.user_id <> p_user THEN RAISE EXCEPTION 'Post nao encontrado' USING ERRCODE = 'PT404'; END IF;

  SELECT * INTO op FROM public.post_publications WHERE post_id = p_post AND stage = 'confirmed' ORDER BY finished_at DESC NULLS LAST LIMIT 1;
  IF FOUND THEN
    -- reparo da projeção: confirmado na rede mas a peça não ficou como publicada (01 §5.4)
    IF p.status <> 'published' THEN
      UPDATE public.user_posts SET status = 'published', published_url = COALESCE(op.url, published_url), published_at = COALESCE(published_at, op.finished_at, now()),
             published_date = COALESCE(published_date, op.finished_at, now()), publish_error = NULL WHERE id = p_post;
    END IF;
    RETURN jsonb_build_object('state', 'already_published', 'publication_id', op.id, 'url', op.url, 'external_id', op.external_id);
  END IF;
  IF p.status = 'published' THEN RETURN jsonb_build_object('state', 'already_published', 'url', p.published_url); END IF;

  SELECT * INTO op FROM public.post_publications WHERE post_id = p_post AND stage IN ('reserved', 'sending', 'unknown') FOR UPDATE;
  IF FOUND THEN
    IF op.stage = 'unknown' THEN RETURN jsonb_build_object('state', 'needs_reconciliation', 'publication_id', op.id, 'error', op.error); END IF;
    IF op.lease_expires_at > now() THEN RETURN jsonb_build_object('state', 'in_progress', 'publication_id', op.id); END IF;
    IF op.stage = 'sending' THEN
      -- o executor anterior pode ter enviado: vencer o prazo NÃO autoriza reenviar
      UPDATE public.post_publications SET stage = 'unknown', failure_class = 'lease_expired_while_sending', status = 'failed',
             error = COALESCE(error, 'A execução anterior parou durante o envio.'), updated_at = now() WHERE id = op.id;
      RETURN jsonb_build_object('state', 'needs_reconciliation', 'publication_id', op.id);
    END IF;
    -- reserva vencida sem envio iniciado: esta tentativa assume
    UPDATE public.post_publications SET attempt_id = p_attempt, lease_expires_at = now() + make_interval(secs => p_lease_seconds),
           package_id = p_package, destination = p_destination, updated_at = now() WHERE id = op.id;
    RETURN jsonb_build_object('state', 'acquired', 'publication_id', op.id, 'attempt_id', p_attempt);
  END IF;

  IF p_package IS NOT NULL THEN
    SELECT source_version, COALESCE(jsonb_array_length(manifest->'units'), 1) INTO v, nunits FROM public.publication_packages WHERE id = p_package AND post_id = p_post;
    IF v IS NULL THEN RAISE EXCEPTION 'Pacote não pertence a esta peça.' USING ERRCODE = 'PT409'; END IF;
  ELSE
    v := COALESCE(p.scheduled_version, p.version, 1);
  END IF;

  -- mesma (peça, versão, destino) que falhou comprovadamente antes do envio: nova tentativa no mesmo registro
  UPDATE public.post_publications SET stage = 'reserved', status = 'in_progress', attempt_id = p_attempt, package_id = p_package,
         lease_expires_at = now() + make_interval(secs => p_lease_seconds), error = NULL, failure_class = NULL, finished_at = NULL, updated_at = now()
   WHERE post_id = p_post AND version = v AND destination = p_destination AND stage = 'failed_before_send'
  RETURNING * INTO op;
  IF NOT FOUND THEN
    INSERT INTO public.post_publications (user_id, post_id, version, destination, platform, account_id, format, status, stage, units_total, package_id, attempt_id, lease_expires_at)
    VALUES (p.user_id, p_post, v, p_destination, p.platform, p.account_id, p.format, 'in_progress', 'reserved', GREATEST(nunits, 1), p_package, p_attempt, now() + make_interval(secs => p_lease_seconds))
    RETURNING * INTO op;
  END IF;
  RETURN jsonb_build_object('state', 'acquired', 'publication_id', op.id, 'attempt_id', p_attempt);
END $function$;
ALTER FUNCTION public."acquire_publication"(p_post uuid, p_user uuid, p_package uuid, p_destination text, p_attempt uuid, p_lease_seconds integer) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."acquire_publication"(p_post uuid, p_user uuid, p_package uuid, p_destination text, p_attempt uuid, p_lease_seconds integer) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."acquire_publication"(p_post uuid, p_user uuid, p_package uuid, p_destination text, p_attempt uuid, p_lease_seconds integer) TO "postgres";
GRANT EXECUTE ON FUNCTION public."acquire_publication"(p_post uuid, p_user uuid, p_package uuid, p_destination text, p_attempt uuid, p_lease_seconds integer) TO "service_role";
CREATE OR REPLACE FUNCTION public.activate_setup_session(sid uuid, adoption text DEFAULT 'future'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  s public.setup_sessions%ROWTYPE;
  b uuid; refs jsonb := '{}'::jsonb; it jsonb; nid uuid; oid uuid; k text; v text;
  inplace_e uuid[] := '{}'; inplace_f uuid[] := '{}'; inplace_a uuid[] := '{}';
  created_p uuid[] := '{}'; updated_p uuid[] := '{}'; touched uuid[]; pid uuid;
  forks jsonb := '[]'::jsonb; versions jsonb := '[]'::jsonb; eds jsonb := '[]'::jsonb; learned int := 0;
  oldv int; newv int; pst text; v_slug text; n int; recal boolean; offers uuid[]; pinned int := 0; cal jsonb; r public.communication_profiles%ROWTYPE;
  blk text;
BEGIN
  IF adoption NOT IN ('future', 'all') THEN RAISE EXCEPTION 'Alcance de adoção inválido' USING ERRCODE = 'PT400'; END IF;
  SELECT * INTO s FROM public.setup_sessions WHERE id = sid FOR UPDATE;
  IF NOT FOUND OR s.user_id IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'Sessão não encontrada' USING ERRCODE = 'PT404'; END IF;
  IF s.status = 'done' THEN RETURN s.result; END IF;
  b := s.brand_id;
  IF b IS NULL OR NOT public.is_brand_member(b) THEN RAISE EXCEPTION 'Sem acesso a esta marca' USING ERRCODE = 'PT403'; END IF;
  recal := s.mode = 'recalibrate';

  -- Versão-base: o perfil não pode ter mudado por outra sessão desde o início desta.
  FOR k, v IN SELECT key, value FROM jsonb_each_text(s.base_versions) LOOP
    IF (SELECT version FROM public.communication_profiles WHERE id = k::uuid) IS DISTINCT FROM v::int THEN
      RAISE EXCEPTION 'Conflito: o perfil foi alterado depois do início desta sessão. Revise antes de ativar.' USING ERRCODE = 'PT409';
    END IF;
  END LOOP;

  -- Marca (núcleo): só a natureza da contribuição; Genesis segue na edição detalhada.
  IF s.proposals->'brand'->>'status' = 'accepted' AND s.proposals->'brand' ? 'essence' THEN
    UPDATE public.brands SET essence = s.proposals->'brand'->>'essence', updated_at = now() WHERE id = b;
  END IF;

  -- Emissores
  IF s.proposals->'emitters'->>'status' = 'accepted' THEN
    FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(s.proposals->'emitters'->'items', '[]')) LOOP
      IF it->>'action' = 'create' THEN
        INSERT INTO public.emitters (brand_id, kind, name, voice, authority, first_person, speaking_rules, facts_status)
        VALUES (b, COALESCE(it->>'kind', 'person'), it->>'name', it->>'voice', it->>'authority', COALESCE((it->>'first_person')::boolean, (it->>'kind') <> 'institutional'),
                it->>'speaking_rules', COALESCE(it->>'facts_status', 'to_confirm')) RETURNING id INTO nid;
        refs := refs || jsonb_build_object(it->>'ref', nid);
      ELSIF it->>'action' = 'update' THEN
        oid := (it->>'ref')::uuid;
        IF recal AND EXISTS (SELECT 1 FROM public.communication_profiles cp WHERE cp.brand_id = b AND cp.status <> 'archived' AND cp.emitter_id = oid AND NOT cp.id = ANY(s.target_profile_ids)) THEN
          INSERT INTO public.emitters (brand_id, kind, name, voice, authority, first_person, speaking_rules, photo_profile, facts_status)
          SELECT b, e.kind, COALESCE(it->>'name', e.name), COALESCE(it->>'voice', e.voice), COALESCE(it->>'authority', e.authority), COALESCE((it->>'first_person')::boolean, e.first_person),
                 COALESCE(it->>'speaking_rules', e.speaking_rules), e.photo_profile, COALESCE(it->>'facts_status', e.facts_status) FROM public.emitters e WHERE e.id = oid AND e.brand_id = b
          RETURNING id INTO nid;
          refs := refs || jsonb_build_object(oid::text, nid); forks := forks || jsonb_build_object('kind', 'emitter', 'from', oid, 'to', nid);
        ELSE
          UPDATE public.emitters e SET name = COALESCE(it->>'name', e.name), voice = COALESCE(it->>'voice', e.voice), authority = COALESCE(it->>'authority', e.authority),
                 first_person = COALESCE((it->>'first_person')::boolean, e.first_person), speaking_rules = COALESCE(it->>'speaking_rules', e.speaking_rules),
                 facts_status = COALESCE(it->>'facts_status', e.facts_status), updated_at = now()
           WHERE e.id = oid AND e.brand_id = b;
          IF NOT FOUND THEN RAISE EXCEPTION 'Emissor fora desta marca' USING ERRCODE = 'PT403'; END IF;
          inplace_e := inplace_e || oid;
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Frentes
  IF s.proposals->'fronts'->>'status' = 'accepted' THEN
    FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(s.proposals->'fronts'->'items', '[]')) LOOP
      offers := CASE WHEN jsonb_typeof(it->'offers') = 'array' THEN ARRAY(SELECT id FROM public.bee_products WHERE slug = ANY(public._setup_arr(it->'offers'))) END;
      IF it->>'action' = 'create' THEN
        v_slug := trim(both '-' from regexp_replace(translate(lower(COALESCE(NULLIF(it->>'slug', ''), it->>'name')), 'áàâãéêíóôõúç', 'aaaaeeiooouc'), '[^a-z0-9]+', '-', 'g'));
        WHILE EXISTS (SELECT 1 FROM public.business_fronts f WHERE f.brand_id = b AND f.slug = v_slug) LOOP v_slug := v_slug || '-2'; END LOOP;
        INSERT INTO public.business_fronts (brand_id, name, slug, description, territories, offer_ids)
        VALUES (b, it->>'name', v_slug, it->>'description', COALESCE(public._setup_arr(it->'territories'), '{}'), COALESCE(offers, '{}')) RETURNING id INTO nid;
        refs := refs || jsonb_build_object(it->>'ref', nid);
      ELSIF it->>'action' = 'update' THEN
        oid := (it->>'ref')::uuid;
        IF recal AND EXISTS (SELECT 1 FROM public.communication_profiles cp WHERE cp.brand_id = b AND cp.status <> 'archived' AND cp.front_id = oid AND NOT cp.id = ANY(s.target_profile_ids)) THEN
          -- Frente compartilhada com perfil fora do alvo: a recalibração NÃO mexe nela (o perfil-alvo guarda as diferenças).
          forks := forks || jsonb_build_object('kind', 'front', 'from', oid, 'to', NULL, 'note', 'frente compartilhada mantida; diferença registrada no perfil');
        ELSE
          UPDATE public.business_fronts f SET name = COALESCE(it->>'name', f.name), description = COALESCE(it->>'description', f.description),
                 territories = COALESCE(public._setup_arr(it->'territories'), f.territories), offer_ids = COALESCE(offers, f.offer_ids), updated_at = now()
           WHERE f.id = oid AND f.brand_id = b;
          IF NOT FOUND THEN RAISE EXCEPTION 'Frente fora desta marca' USING ERRCODE = 'PT403'; END IF;
          inplace_f := inplace_f || oid;
        END IF;
      ELSIF it->>'action' = 'archive' AND NOT recal THEN
        UPDATE public.business_fronts SET status = 'archived', updated_at = now() WHERE id = (it->>'ref')::uuid AND brand_id = b;
      END IF;
    END LOOP;
  END IF;

  -- Públicos (pessoas/papéis/situações — não estado do interlocutor)
  IF s.proposals->'audiences'->>'status' = 'accepted' THEN
    FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(s.proposals->'audiences'->'items', '[]')) LOOP
      IF it->>'action' = 'create' THEN
        INSERT INTO public.audiences (brand_id, front_id, name, definition, situations, needs, language_notes, status, notes)
        VALUES (b, public._setup_ref(refs, it->>'front_ref'), it->>'name', it->>'definition', COALESCE(public._setup_arr(it->'situations'), '{}'),
                COALESCE(public._setup_arr(it->'needs'), '{}'), it->>'language_notes', COALESCE(it->>'status', 'hypothesis'), it->>'notes') RETURNING id INTO nid;
        refs := refs || jsonb_build_object(it->>'ref', nid);
      ELSIF it->>'action' = 'update' THEN
        oid := (it->>'ref')::uuid;
        IF recal AND EXISTS (SELECT 1 FROM public.communication_profiles cp WHERE cp.brand_id = b AND cp.status <> 'archived' AND NOT cp.id = ANY(s.target_profile_ids)
                              AND (cp.primary_audience_id = oid OR oid = ANY(cp.secondary_audience_ids))) THEN
          INSERT INTO public.audiences (brand_id, front_id, name, definition, situations, needs, language_notes, roles, status, notes)
          SELECT b, a.front_id, COALESCE(it->>'name', a.name), COALESCE(it->>'definition', a.definition), COALESCE(public._setup_arr(it->'situations'), a.situations),
                 COALESCE(public._setup_arr(it->'needs'), a.needs), COALESCE(it->>'language_notes', a.language_notes), a.roles, COALESCE(it->>'status', a.status), COALESCE(it->>'notes', a.notes)
            FROM public.audiences a WHERE a.id = oid AND a.brand_id = b RETURNING id INTO nid;
          refs := refs || jsonb_build_object(oid::text, nid); forks := forks || jsonb_build_object('kind', 'audience', 'from', oid, 'to', nid);
        ELSE
          UPDATE public.audiences a SET name = COALESCE(it->>'name', a.name), definition = COALESCE(it->>'definition', a.definition),
                 situations = COALESCE(public._setup_arr(it->'situations'), a.situations), needs = COALESCE(public._setup_arr(it->'needs'), a.needs),
                 language_notes = COALESCE(it->>'language_notes', a.language_notes), status = COALESCE(it->>'status', a.status), notes = COALESCE(it->>'notes', a.notes), updated_at = now()
           WHERE a.id = oid AND a.brand_id = b;
          IF NOT FOUND THEN RAISE EXCEPTION 'Público fora desta marca' USING ERRCODE = 'PT403'; END IF;
          inplace_a := inplace_a || oid;
        END IF;
      ELSIF it->>'action' = 'archive' AND NOT recal THEN
        UPDATE public.audiences SET status = 'archived', updated_at = now() WHERE id = (it->>'ref')::uuid AND brand_id = b;
      END IF;
    END LOOP;
  END IF;

  -- Perfis
  IF s.proposals->'profiles'->>'status' = 'accepted' THEN
    FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(s.proposals->'profiles'->'items', '[]')) LOOP
      offers := CASE WHEN jsonb_typeof(it->'offers') = 'array' THEN ARRAY(SELECT id FROM public.bee_products WHERE slug = ANY(public._setup_arr(it->'offers'))) END;
      IF it->>'action' = 'create' THEN
        INSERT INTO public.communication_profiles (brand_id, emitter_id, front_id, primary_audience_id, secondary_audience_ids, name, positioning, expression, cta_policy, offer_ids, status, needs_recalibration, version)
        VALUES (b, public._setup_ref(refs, it->>'emitter_ref'), public._setup_ref(refs, it->>'front_ref'), public._setup_ref(refs, it->>'primary_audience_ref'),
                COALESCE(ARRAY(SELECT public._setup_ref(refs, x) FROM jsonb_array_elements_text(COALESCE(it->'secondary_audience_refs', '[]')) x WHERE public._setup_ref(refs, x) IS NOT NULL), '{}'),
                it->>'name', it->>'positioning', it->>'expression', COALESCE(it->>'cta_policy', 'by_intent'), COALESCE(offers, '{}'), COALESCE(it->>'status', 'draft'), it->>'needs_recalibration', 0)
        RETURNING id INTO nid;
        refs := refs || jsonb_build_object(it->>'ref', nid); created_p := created_p || nid;
      ELSIF it->>'action' = 'update' THEN
        oid := (it->>'ref')::uuid;
        IF recal AND NOT oid = ANY(s.target_profile_ids) THEN CONTINUE; END IF;   -- recalibração toca só os perfis-alvo
        UPDATE public.communication_profiles p SET
               emitter_id = COALESCE(public._setup_ref(refs, it->>'emitter_ref'), p.emitter_id), front_id = COALESCE(public._setup_ref(refs, it->>'front_ref'), p.front_id),
               primary_audience_id = CASE WHEN it ? 'primary_audience_ref' THEN public._setup_ref(refs, it->>'primary_audience_ref') ELSE p.primary_audience_id END,
               secondary_audience_ids = CASE WHEN it ? 'secondary_audience_refs' THEN COALESCE(ARRAY(SELECT public._setup_ref(refs, x) FROM jsonb_array_elements_text(it->'secondary_audience_refs') x WHERE public._setup_ref(refs, x) IS NOT NULL), '{}') ELSE p.secondary_audience_ids END,
               name = COALESCE(it->>'name', p.name), positioning = COALESCE(it->>'positioning', p.positioning), expression = COALESCE(it->>'expression', p.expression),
               cta_policy = COALESCE(it->>'cta_policy', p.cta_policy), offer_ids = COALESCE(offers, p.offer_ids), status = COALESCE(it->>'status', p.status),
               needs_recalibration = CASE WHEN it ? 'needs_recalibration' THEN NULLIF(it->>'needs_recalibration', '') ELSE p.needs_recalibration END, updated_at = now()
         WHERE p.id = oid AND p.brand_id = b;
        IF NOT FOUND THEN RAISE EXCEPTION 'Perfil fora desta marca' USING ERRCODE = 'PT403'; END IF;
        updated_p := updated_p || oid;
      ELSIF it->>'action' = 'archive' AND NOT recal THEN
        UPDATE public.communication_profiles SET status = 'archived', is_default = false, updated_at = now() WHERE id = (it->>'ref')::uuid AND brand_id = b;
      END IF;
    END LOOP;
  END IF;

  -- Perfis-alvo passam a apontar para as cópias (fork) do que era compartilhado.
  FOR r IN SELECT * FROM public.communication_profiles WHERE id = ANY(s.target_profile_ids) AND brand_id = b LOOP
    UPDATE public.communication_profiles p SET
      emitter_id = COALESCE(public._setup_ref(refs, p.emitter_id::text), p.emitter_id),
      primary_audience_id = CASE WHEN p.primary_audience_id IS NULL THEN NULL ELSE COALESCE(public._setup_ref(refs, p.primary_audience_id::text), p.primary_audience_id) END,
      secondary_audience_ids = ARRAY(SELECT COALESCE(public._setup_ref(refs, x::text), x) FROM unnest(p.secondary_audience_ids) x)
     WHERE p.id = r.id AND (refs ? p.emitter_id::text OR refs ? COALESCE(p.primary_audience_id::text, '-') OR EXISTS (SELECT 1 FROM unnest(p.secondary_audience_ids) x WHERE refs ? x::text));
    IF FOUND AND NOT r.id = ANY(updated_p) THEN updated_p := updated_p || r.id; END IF;
  END LOOP;

  -- Perfis afetados: criados, atualizados e os que usam o que mudou no lugar.
  touched := ARRAY(SELECT DISTINCT x FROM unnest(created_p || updated_p || ARRAY(
    SELECT cp.id FROM public.communication_profiles cp WHERE cp.brand_id = b AND cp.status <> 'archived'
       AND (cp.emitter_id = ANY(inplace_e) OR cp.front_id = ANY(inplace_f) OR cp.primary_audience_id = ANY(inplace_a) OR cp.secondary_audience_ids && inplace_a))) x);

  FOREACH pid IN ARRAY touched LOOP
    SELECT version, status INTO oldv, pst FROM public.communication_profiles WHERE id = pid;
    newv := oldv + 1;
    UPDATE public.communication_profiles SET version = newv, updated_at = now() WHERE id = pid;
    UPDATE public.communication_profile_versions SET status = 'superseded' WHERE profile_id = pid AND status IN ('active', 'reviewed');
    INSERT INTO public.communication_profile_versions (profile_id, version, status, data, reason, created_by, activated_at)
    VALUES (pid, newv, CASE WHEN pst = 'active' THEN 'active' ELSE 'reviewed' END, public.profile_composition(pid),
            COALESCE(s.title, 'Sessão Minha identidade') || ' (' || s.mode || ')', auth.uid(), CASE WHEN pst = 'active' THEN now() END);
    -- Alcance: "só novas criações" prende as campanhas em andamento na versão anterior.
    IF adoption = 'future' AND oldv > 0 THEN
      UPDATE public.campaigns SET profile_version = oldv WHERE profile_id = pid AND profile_version IS NULL AND status IN ('draft', 'active', 'paused');
      GET DIAGNOSTICS n = ROW_COUNT; pinned := pinned + n;
    END IF;
    versions := versions || jsonb_build_object('profile_id', pid, 'name', (SELECT name FROM public.communication_profiles WHERE id = pid), 'from', oldv, 'to', newv, 'created', pid = ANY(created_p));
  END LOOP;
  -- Perfil padrão: se nenhum ativo for padrão, o primeiro ativo vira padrão.
  IF NOT EXISTS (SELECT 1 FROM public.communication_profiles WHERE brand_id = b AND is_default AND status = 'active') THEN
    UPDATE public.communication_profiles SET is_default = false WHERE brand_id = b AND is_default;
    UPDATE public.communication_profiles SET is_default = true WHERE id = (SELECT id FROM public.communication_profiles WHERE brand_id = b AND status = 'active' ORDER BY created_at LIMIT 1);
  END IF;

  -- Editorias (curadoria: nunca apaga; arquivar = inativar)
  IF s.proposals->'editorials'->>'status' = 'accepted' THEN
    FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(s.proposals->'editorials'->'items', '[]')) LOOP
      IF it->>'action' = 'create' THEN
        v_slug := trim(both '-' from regexp_replace(translate(lower(COALESCE(NULLIF(it->>'slug', ''), it->>'name')), 'áàâãéêíóôõúç', 'aaaaeeiooouc'), '[^a-z0-9]+', '-', 'g'));
        WHILE EXISTS (SELECT 1 FROM public.bee_editorials e WHERE e.slug = v_slug) LOOP v_slug := v_slug || '-2'; END LOOP;
        INSERT INTO public.bee_editorials (slug, name, description, objetivo, territorio, perguntas, material, exemplo, front_id, brand_id, is_active, is_system, curation_status, position, temas)
        VALUES (v_slug, it->>'name', COALESCE(it->>'description', it->>'objetivo'), it->>'objetivo', it->>'territorio', COALESCE(public._setup_arr(it->'perguntas'), '{}'), it->>'material', it->>'exemplo',
                public._setup_ref(refs, it->>'front_ref'), b, true, false, COALESCE(it->>'curation_status', 'testing'),
                COALESCE((SELECT max(position) FROM public.bee_editorials), 0) + 1, COALESCE(public._setup_arr(it->'temas'), '{}'))
        RETURNING id INTO nid;
        eds := eds || jsonb_build_object('action', 'create', 'slug', v_slug, 'name', it->>'name');
      ELSIF it->>'action' = 'update' THEN
        UPDATE public.bee_editorials e SET name = COALESCE(it->>'name', e.name), objetivo = COALESCE(it->>'objetivo', e.objetivo), territorio = COALESCE(it->>'territorio', e.territorio),
               perguntas = COALESCE(public._setup_arr(it->'perguntas'), e.perguntas), material = COALESCE(it->>'material', e.material), exemplo = COALESCE(it->>'exemplo', e.exemplo),
               front_id = CASE WHEN it ? 'front_ref' THEN public._setup_ref(refs, it->>'front_ref') ELSE e.front_id END,
               curation_status = COALESCE(it->>'curation_status', e.curation_status), updated_at = now()
         WHERE e.id = (it->>'ref')::uuid AND e.brand_id = b;
        IF FOUND THEN eds := eds || jsonb_build_object('action', 'update', 'name', it->>'name'); END IF;
      ELSIF it->>'action' = 'archive' THEN
        UPDATE public.bee_editorials SET is_active = false, curation_status = 'archived', updated_at = now() WHERE id = (it->>'ref')::uuid AND brand_id = b AND NOT is_system;
        IF FOUND THEN eds := eds || jsonb_build_object('action', 'archive', 'name', it->>'name'); END IF;
      END IF;
    END LOOP;
  END IF;

  -- Feedback da calibração marcado para aprender → lição com o escopo do perfil (não vira norma global).
  learned := 0;
  FOR cal IN SELECT * FROM jsonb_array_elements(s.calibrations) LOOP
    IF (cal->'feedback'->>'learn')::boolean IS TRUE AND COALESCE(cal->'feedback'->>'lesson', '') <> '' THEN
      pid := public._setup_ref(refs, cal->>'profile_ref');
      INSERT INTO public.ai_learnings (user_id, texto, categoria, evidencias, ativo, origem, facet, brand_id, front_id, emitter_id, profile_id)
      SELECT s.user_id, cal->'feedback'->>'lesson', 'calibracao', 1, true, 'conversa', 'texto', b, p.front_id, NULL, p.id
        FROM public.communication_profiles p WHERE p.id = pid;
      learned := learned + 1;
    END IF;
  END LOOP;

  UPDATE public.setup_sessions SET status = 'done', step = 'done', activated_at = now(),
         result = jsonb_build_object('versions', versions, 'forks', forks, 'editorials', eds, 'learnings', learned, 'adoption', adoption, 'pinned_campaigns', pinned, 'activated_at', now())
   WHERE id = sid RETURNING result INTO it;
  RETURN it;
END $function$;
ALTER FUNCTION public."activate_setup_session"(sid uuid, adoption text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."activate_setup_session"(sid uuid, adoption text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."activate_setup_session"(sid uuid, adoption text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."activate_setup_session"(sid uuid, adoption text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."activate_setup_session"(sid uuid, adoption text) TO "service_role";
CREATE OR REPLACE FUNCTION public.adopt_content_base(p_version uuid, p_cycle uuid, p_idea uuid DEFAULT NULL::uuid)
 RETURNS content_base_uses
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."adopt_content_base"(p_version uuid, p_cycle uuid, p_idea uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."adopt_content_base"(p_version uuid, p_cycle uuid, p_idea uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."adopt_content_base"(p_version uuid, p_cycle uuid, p_idea uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."adopt_content_base"(p_version uuid, p_cycle uuid, p_idea uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."adopt_content_base"(p_version uuid, p_cycle uuid, p_idea uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."adopt_content_base"(p_version uuid, p_cycle uuid, p_idea uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.ads_spend_guard(p_user uuid, p_campaign uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH m AS (
    SELECT t.today,
           date_trunc('month', t.today)::date AS first_day,
           (date_trunc('month', t.today) + interval '1 month - 1 day')::date AS last_day
    FROM (SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date AS today) t
  ), v AS (
    SELECT
      (SELECT mc.monthly_cap FROM meta_connections mc WHERE mc.user_id = p_user LIMIT 1) AS cap,
      (SELECT coalesce(sum(i.spend), 0) FROM meta_ad_insights_daily i
        WHERE i.user_id = p_user AND i.date BETWEEN m.first_day AND m.last_day) AS spent,
      (SELECT coalesce(sum(CASE
          WHEN c.draft->>'budget_type' = 'lifetime' THEN coalesce((c.draft->>'amount')::numeric, 0)
          ELSE coalesce((c.draft->>'amount')::numeric, 0) * greatest(0,
            least((nullif(c.draft->>'ends_at', '')::timestamptz AT TIME ZONE 'America/Sao_Paulo')::date, m.last_day)
            - greatest((nullif(c.draft->>'starts_at', '')::timestamptz AT TIME ZONE 'America/Sao_Paulo')::date, m.today)
            + 1)
        END), 0)
        FROM traffic_campaigns c
        WHERE c.user_id = p_user AND (c.status IN ('active', 'creating') OR c.id = p_campaign)) AS committed
    FROM m
  )
  SELECT jsonb_build_object(
    'ok', v.cap IS NOT NULL AND v.cap - v.spent - v.committed >= 0,
    'cap', v.cap,
    'spent', v.spent,
    'committed', v.committed,
    'available', v.cap - v.spent - v.committed
  )
  FROM v;
$function$;
ALTER FUNCTION public."ads_spend_guard"(p_user uuid, p_campaign uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."ads_spend_guard"(p_user uuid, p_campaign uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."ads_spend_guard"(p_user uuid, p_campaign uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."ads_spend_guard"(p_user uuid, p_campaign uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.ai_facet_peso(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean)
 RETURNS numeric
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select case
    when p_is_image and not p_has_image then null           -- faceta N/A
    when p_is_image then case when p_changed then 0.0 else 1.0 end  -- imagem: binária
    when not p_changed then 1.0                              -- intacto
    when coalesce(p_drift, 100) <= 15 then 0.6               -- ajuste cosmético
    else 0.0                                                 -- reescrita
  end;
$function$;
ALTER FUNCTION public."ai_facet_peso"(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."ai_facet_peso"(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."ai_facet_peso"(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."ai_facet_peso"(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean) TO "postgres";
GRANT EXECUTE ON FUNCTION public."ai_facet_peso"(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean) TO "anon";
GRANT EXECUTE ON FUNCTION public."ai_facet_peso"(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."ai_facet_peso"(p_changed boolean, p_drift numeric, p_is_image boolean, p_has_image boolean) TO "service_role";
CREATE OR REPLACE FUNCTION public.ai_gate_recompute()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  u uuid := new.user_id;
  seg record;
  s jsonb;
  v_prev boolean;
  v_new boolean;
  v_ok boolean;
begin
  -- segmento desta review (via a geração)
  select g.editorial_slug, g.platform, coalesce(g.target_avatar, 'ambos') as target_avatar
    into seg
    from public.ai_generations g where g.id = new.generation_id;
  if seg.editorial_slug is null or seg.platform is null then
    return new; -- review sem segmento (não deveria acontecer) — ignora
  end if;

  -- acha o status deste segmento no retorno de ai_segment_status
  select elem into s
    from jsonb_array_elements(public.ai_segment_status(u)) elem
   where elem->>'editorial_slug' = seg.editorial_slug
     and elem->>'platform' = seg.platform
     and elem->>'target_avatar' = seg.target_avatar
   limit 1;
  if s is null then return new; end if;

  -- "pronto pra destravar" = todas as facetas aplicáveis passam e amostra cheia
  v_ok := (s->>'amostra')::int >= 8
      and (s#>>'{texto,passa}')::boolean
      and (s#>>'{legenda,passa}')::boolean
      and coalesce((s#>>'{imagem,passa}')::boolean, true);

  select st.unlocked into v_prev from public.ai_segment_gate st
    where st.user_id = u and st.editorial_slug = seg.editorial_slug
      and st.platform = seg.platform and st.target_avatar = seg.target_avatar;
  v_prev := coalesce(v_prev, false);

  if v_prev then
    -- destravado: só retrava se ALGUMA faceta cai abaixo da banda (80)
    v_new := (
      (s#>>'{texto,acuracia}')::numeric >= 80
      and (s#>>'{legenda,acuracia}')::numeric >= 80
      and coalesce((s#>>'{imagem,acuracia}')::numeric, 100) >= 80
    );
  else
    v_new := v_ok;
  end if;

  insert into public.ai_segment_gate (user_id, editorial_slug, platform, target_avatar, unlocked, unlocked_at, relocked_at, updated_at)
  values (u, seg.editorial_slug, seg.platform, seg.target_avatar, v_new,
          case when v_new then now() end, case when not v_new then now() end, now())
  on conflict (user_id, editorial_slug, platform, target_avatar) do update set
    unlocked    = excluded.unlocked,
    unlocked_at = case when v_new and not v_prev then now() else public.ai_segment_gate.unlocked_at end,
    relocked_at = case when not v_new and v_prev then now() else public.ai_segment_gate.relocked_at end,
    updated_at  = now();

  if v_new is distinct from v_prev then
    insert into public.alma_eventos (tipo, descricao, source, user_id)
    values (
      case when v_new then 'segmento_destravado' else 'segmento_retravado' end,
      format('%s · %s · %s %s',
        seg.editorial_slug, seg.platform, seg.target_avatar,
        case when v_new then 'liberou pra autonomia' else 'RETRAVOU (eficácia caiu)' end),
      'ai-gate', u
    );
  end if;

  return new;
end;
$function$;
ALTER FUNCTION public."ai_gate_recompute"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."ai_gate_recompute"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."ai_gate_recompute"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."ai_gate_recompute"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."ai_gate_recompute"() TO "anon";
GRANT EXECUTE ON FUNCTION public."ai_gate_recompute"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."ai_gate_recompute"() TO "service_role";
CREATE OR REPLACE FUNCTION public.ai_gate_status(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with segs as (
    select jsonb_array_elements(public.ai_segment_status(p_user_id)) as s
  ),
  agg as (
    select
      count(*)::int as total_segmentos,
      count(*) filter (where (s->>'destravada')::boolean)::int as destravados,
      count(*) filter (where (s->>'em_risco')::boolean)::int as em_risco_n,
      coalesce(sum((s->>'amostra')::int), 0)::int as amostra_total
    from segs
  )
  select jsonb_build_object(
    'meta', 90,
    'min_amostra', 8,
    'relock_band', 80,
    'ajuste_max_drift', 15,
    'total_segmentos', a.total_segmentos,
    'destravados', a.destravados,
    'em_risco', a.em_risco_n > 0,
    -- a campanha está "disponível" assim que UM segmento libera
    'destravada', a.destravados > 0,
    'amostra_total', a.amostra_total,
    'segmentos', public.ai_segment_status(p_user_id)
  )
  from agg a;
$function$;
ALTER FUNCTION public."ai_gate_status"(p_user_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."ai_gate_status"(p_user_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."ai_gate_status"(p_user_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."ai_gate_status"(p_user_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."ai_gate_status"(p_user_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."ai_gate_status"(p_user_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."ai_gate_status"(p_user_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.ai_prompt_learnings(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer DEFAULT 12, p_front uuid DEFAULT NULL::uuid, p_emitter uuid DEFAULT NULL::uuid, p_profile uuid DEFAULT NULL::uuid)
 RETURNS TABLE(texto text, categoria text, facet text, evidencias integer, especificidade integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  select l.texto, l.categoria, l.facet, l.evidencias,
    ((l.editorial_slug is not null)::int + (l.platform is not null)::int + (l.target_avatar is not null)::int
      + (l.front_id is not null)::int + (l.emitter_id is not null)::int + (l.profile_id is not null)::int) as especificidade
  from public.ai_learnings l
  where l.user_id = p_user and l.ativo and l.facet = any(p_facets)
    and (l.editorial_slug is null or l.editorial_slug = p_editorial)
    and (l.platform is null or l.platform = p_platform)
    and (l.target_avatar is null or l.target_avatar = coalesce(p_avatar, 'ambos'))
    and (l.front_id is null or l.front_id = p_front)
    and (l.emitter_id is null or l.emitter_id = p_emitter)
    and (l.profile_id is null or l.profile_id = p_profile)
  order by especificidade desc, l.evidencias desc, l.last_reforcada_em desc
  limit p_limit;
$function$;
ALTER FUNCTION public."ai_prompt_learnings"(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer, p_front uuid, p_emitter uuid, p_profile uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."ai_prompt_learnings"(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer, p_front uuid, p_emitter uuid, p_profile uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."ai_prompt_learnings"(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer, p_front uuid, p_emitter uuid, p_profile uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."ai_prompt_learnings"(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer, p_front uuid, p_emitter uuid, p_profile uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."ai_prompt_learnings"(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer, p_front uuid, p_emitter uuid, p_profile uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."ai_prompt_learnings"(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer, p_front uuid, p_emitter uuid, p_profile uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."ai_prompt_learnings"(p_user uuid, p_editorial text, p_platform text, p_avatar text, p_facets text[], p_limit integer, p_front uuid, p_emitter uuid, p_profile uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.ai_segment_status(p_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with alvo as (select coalesce(p_user_id, auth.uid()) as uid),
  -- junta cada review ao seu segmento (via a geração) e mantém as últimas 8 por segmento
  rev as (
    select
      g.editorial_slug,
      g.platform,
      coalesce(g.target_avatar, 'ambos') as target_avatar,
      r.created_at, r.id,
      r.quote_changed, r.quote_drift_pct,
      r.caption_changed, r.caption_drift_pct,
      r.has_image, r.image_changed,
      row_number() over (
        partition by g.editorial_slug, g.platform, coalesce(g.target_avatar, 'ambos')
        order by r.created_at desc, r.id desc
      ) as rn
    from public.ai_reviews r
    join public.ai_generations g on g.id = r.generation_id
    cross join alvo
    where r.user_id = alvo.uid and g.editorial_slug is not null and g.platform is not null
  ),
  janela as (select * from rev where rn <= 8),
  -- acumula peso por faceta em cada segmento
  facetado as (
    select
      editorial_slug, platform, target_avatar,
      count(*)::int as amostra,
      count(*)::int as texto_n,
      avg(public.ai_facet_peso(quote_changed, quote_drift_pct, false, true)) as texto_acc,
      count(*)::int as legenda_n,
      avg(public.ai_facet_peso(caption_changed, caption_drift_pct, false, true)) as legenda_acc,
      count(*) filter (where has_image)::int as imagem_n,
      avg(public.ai_facet_peso(image_changed, null, true, has_image)) as imagem_acc
    from janela
    group by editorial_slug, platform, target_avatar
  ),
  julgado as (
    select
      f.*,
      -- cada faceta aplicável (com amostra) precisa bater 90%; sem amostra = N/A
      (f.texto_n   > 0 and round(f.texto_acc   * 100, 1) >= 90) as texto_passa,
      (f.legenda_n > 0 and round(f.legenda_acc * 100, 1) >= 90) as legenda_passa,
      (f.imagem_n = 0 or round(f.imagem_acc * 100, 1) >= 90)    as imagem_ok,
      st.unlocked as estado_guardado
    from facetado f
    left join public.ai_segment_gate st
      on st.user_id = (select uid from alvo)
     and st.editorial_slug = f.editorial_slug
     and st.platform = f.platform
     and st.target_avatar = f.target_avatar
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'editorial_slug', editorial_slug,
    'platform', platform,
    'target_avatar', target_avatar,
    'amostra', amostra,
    'texto',   jsonb_build_object('amostra', texto_n,   'acuracia', round(texto_acc   * 100, 1), 'passa', texto_passa),
    'legenda', jsonb_build_object('amostra', legenda_n, 'acuracia', round(legenda_acc * 100, 1), 'passa', legenda_passa),
    'imagem',  jsonb_build_object('amostra', imagem_n,  'acuracia', case when imagem_n = 0 then null else round(imagem_acc * 100, 1) end, 'passa', case when imagem_n = 0 then null else imagem_ok end),
    -- destravada vem do estado guardado (histerese); sem estado = regra fria
    'destravada', coalesce(estado_guardado, (amostra >= 8 and texto_passa and legenda_passa and imagem_ok)),
    'em_risco', coalesce(estado_guardado, false) and not (texto_passa and legenda_passa and imagem_ok)
  ) order by editorial_slug, platform, target_avatar), '[]'::jsonb)
  from julgado;
$function$;
ALTER FUNCTION public."ai_segment_status"(p_user_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."ai_segment_status"(p_user_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."ai_segment_status"(p_user_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."ai_segment_status"(p_user_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."ai_segment_status"(p_user_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."ai_segment_status"(p_user_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."ai_segment_status"(p_user_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.apply_piece_candidate(cand_id uuid)
 RETURNS user_posts
 LANGUAGE plpgsql
AS $function$
DECLARE
  c public.piece_candidates%ROWTYPE;
  p public.user_posts%ROWTYPE;
  cur jsonb; prop jsonb; m text[];
  quote_changed boolean; caption_changed boolean; image_changed boolean; visual_changed boolean;
  meta jsonb;
BEGIN
  SELECT * INTO c FROM public.piece_candidates WHERE id = cand_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proposta não encontrada' USING ERRCODE = 'no_data_found'; END IF;
  IF c.status = 'applied' THEN SELECT * INTO p FROM public.user_posts WHERE id = c.post_id; RETURN p; END IF; -- idempotente
  IF c.status <> 'ready' THEN RAISE EXCEPTION 'Proposta não está pronta (%)', c.status USING ERRCODE = 'check_violation'; END IF;
  SELECT * INTO p FROM public.user_posts WHERE id = c.post_id FOR UPDATE;
  IF p.version <> c.base_version THEN
    UPDATE public.piece_candidates SET status = 'conflict', error = format('A peça mudou (v%s) depois desta proposta (base v%s).', p.version, c.base_version) WHERE id = c.id;
    RAISE EXCEPTION 'Conflito: a peça foi alterada depois desta proposta. Compare com a versão atual.' USING ERRCODE = 'PT409'; -- 40001 faz o PostgREST repetir em laço
  END IF;
  cur := public.piece_components(p);
  prop := COALESCE(c.proposal, '{}'::jsonb);
  m := c.mutable_paths;

  -- Preservação NO BANCO (não só no prompt): componente fora de mutable_paths não pode mudar.
  IF NOT ('quote' = ANY(m)) AND prop ? 'quote' AND (prop->>'quote') IS DISTINCT FROM (cur->>'quote') THEN
    UPDATE public.piece_candidates SET status = 'rejected', error = 'A proposta alterou o texto, que deveria ser preservado.' WHERE id = c.id;
    RAISE EXCEPTION 'Proposta rejeitada: alterou o texto preservado.' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT ('caption' = ANY(m)) AND prop ? 'caption' AND (prop->>'caption') IS DISTINCT FROM (cur->>'caption') THEN
    UPDATE public.piece_candidates SET status = 'rejected', error = 'A proposta alterou a legenda, que deveria ser preservada.' WHERE id = c.id;
    RAISE EXCEPTION 'Proposta rejeitada: alterou a legenda preservada.' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT ('image' = ANY(m)) AND prop ? 'image_ref' AND (prop->>'image_ref') IS DISTINCT FROM (cur->>'image_ref') THEN
    UPDATE public.piece_candidates SET status = 'rejected', error = 'A proposta trocou a imagem, que deveria ser preservada.' WHERE id = c.id;
    RAISE EXCEPTION 'Proposta rejeitada: trocou a imagem preservada.' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT ('visual' = ANY(m)) AND NOT ('quote' = ANY(m)) AND NOT ('image' = ANY(m)) AND prop ? 'variant' AND (prop->>'variant') IS DISTINCT FROM (cur->>'variant') THEN
    UPDATE public.piece_candidates SET status = 'rejected', error = 'A proposta trocou o template, que deveria ser preservado.' WHERE id = c.id;
    RAISE EXCEPTION 'Proposta rejeitada: trocou o template preservado.' USING ERRCODE = 'check_violation';
  END IF;

  -- Guarda a versão atual (histórico/restauração/publicação programada).
  INSERT INTO public.piece_versions (user_id, post_id, version, components, approvals, action)
  VALUES (p.user_id, p.id, p.version, cur,
          jsonb_build_object('text', p.text_approved, 'image', p.image_approved, 'image_status', p.image_status, 'status', p.status,
                             'titulo', p.metadata->>'titulo_status', 'legenda', p.metadata->>'legenda_status'), 'base')
  ON CONFLICT (post_id, version) DO NOTHING;

  quote_changed := prop ? 'quote' AND (prop->>'quote') IS DISTINCT FROM (cur->>'quote');
  caption_changed := prop ? 'caption' AND (prop->>'caption') IS DISTINCT FROM (cur->>'caption');
  image_changed := prop ? 'image_ref' AND (prop->>'image_ref') IS DISTINCT FROM (cur->>'image_ref');
  visual_changed := prop ? 'rendered_slides' AND (prop->'rendered_slides') IS DISTINCT FROM (cur->'rendered_slides');

  meta := COALESCE(p.metadata, '{}'::jsonb);
  IF quote_changed THEN meta := meta || '{"titulo_status":"pending"}'::jsonb; END IF;
  IF caption_changed THEN meta := meta || '{"legenda_status":"pending"}'::jsonb; END IF;
  IF image_changed THEN meta := meta || '{"bg_approved":false}'::jsonb; END IF;
  IF p.status = 'scheduled' AND (quote_changed OR caption_changed OR visual_changed) THEN
    meta := meta || '{"scheduled_outdated":true}'::jsonb;   -- o pacote programado continua o anterior
  END IF;
  meta := meta || jsonb_build_object('last_operation', jsonb_build_object('action', c.action, 'candidate_id', c.id, 'at', now()));

  UPDATE public.user_posts SET
    carousel_text = CASE WHEN quote_changed THEN jsonb_set(COALESCE(carousel_text, '{}'::jsonb), '{quote}', to_jsonb(prop->>'quote')) ELSE carousel_text END,
    caption = CASE WHEN caption_changed THEN prop->>'caption' ELSE caption END,
    carousel_fabric_json = CASE WHEN prop ? 'carousel_fabric_json' THEN prop->'carousel_fabric_json' ELSE carousel_fabric_json END,
    rendered_slides = CASE WHEN prop ? 'rendered_slides' THEN prop->'rendered_slides' ELSE rendered_slides END,
    visual_decision = CASE WHEN prop ? 'visual_decision' THEN prop->'visual_decision' ELSE visual_decision END,
    -- Aprovação por componente: só o que mudou volta para revisão.
    text_approved = CASE WHEN quote_changed OR caption_changed THEN false ELSE text_approved END,
    image_approved = CASE WHEN image_changed THEN false ELSE image_approved END,
    image_status = CASE WHEN image_changed OR visual_changed THEN 'pending' ELSE image_status END,
    status = CASE WHEN status = 'approved' AND (quote_changed OR caption_changed OR visual_changed) THEN 'pending_approval' ELSE status END,
    scheduled_version = CASE WHEN status = 'scheduled' THEN COALESCE(scheduled_version, version) ELSE scheduled_version END,
    version = version + 1,
    metadata = meta
  WHERE id = p.id
  RETURNING * INTO p;

  INSERT INTO public.piece_versions (user_id, post_id, version, components, approvals, action, candidate_id)
  VALUES (p.user_id, p.id, p.version, public.piece_components(p),
          jsonb_build_object('text', p.text_approved, 'image', p.image_approved, 'image_status', p.image_status, 'status', p.status), c.action, c.id)
  ON CONFLICT (post_id, version) DO NOTHING;
  UPDATE public.piece_candidates SET status = 'applied', applied_at = now(), error = NULL WHERE id = c.id;
  RETURN p;
END $function$;
ALTER FUNCTION public."apply_piece_candidate"(cand_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."apply_piece_candidate"(cand_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."apply_piece_candidate"(cand_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."apply_piece_candidate"(cand_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."apply_piece_candidate"(cand_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."apply_piece_candidate"(cand_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."apply_piece_candidate"(cand_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.apply_unit_candidate(cand_id uuid)
 RETURNS user_posts
 LANGUAGE plpgsql
AS $function$
DECLARE
  c public.piece_candidates%ROWTYPE; p public.user_posts%ROWTYPE; u jsonb; cur public.post_units%ROWTYPE; m text[];
BEGIN
  SELECT * INTO c FROM public.piece_candidates WHERE id = cand_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Proposta não encontrada' USING ERRCODE = 'PT404'; END IF;
  IF c.status = 'applied' THEN SELECT * INTO p FROM public.user_posts WHERE id = c.post_id; RETURN p; END IF;
  IF c.status <> 'ready' THEN RAISE EXCEPTION 'Proposta não está pronta (%)', c.status USING ERRCODE = 'PT409'; END IF;
  SELECT * INTO p FROM public.user_posts WHERE id = c.post_id FOR UPDATE;
  IF p.version <> c.base_version THEN
    RAISE EXCEPTION 'Conflito: a peça foi alterada depois desta proposta. Compare com a versão atual.' USING ERRCODE = 'PT409';
  END IF;
  m := c.mutable_paths;
  -- Validação de escopo e preservação (no banco, não só no prompt).
  FOR u IN SELECT * FROM jsonb_array_elements(COALESCE(c.proposal->'units', '[]'::jsonb)) LOOP
    IF NOT (u->>'id') = ANY(c.unit_ids) THEN RAISE EXCEPTION 'Proposta rejeitada: alterou página fora da seleção.' USING ERRCODE = 'PT422'; END IF;
    SELECT * INTO cur FROM public.post_units WHERE id = (u->>'id')::uuid AND post_id = p.id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Proposta rejeitada: página inexistente.' USING ERRCODE = 'PT422'; END IF;
    IF NOT ('text' = ANY(m)) AND ((u ? 'title' AND (u->>'title') IS DISTINCT FROM cur.title) OR (u ? 'body' AND (u->>'body') IS DISTINCT FROM cur.body)) THEN
      RAISE EXCEPTION 'Proposta rejeitada: alterou o texto preservado.' USING ERRCODE = 'PT422';
    END IF;
    IF NOT ('image' = ANY(m)) AND u ? 'assets' AND (u->'assets'->>'image_ref') IS DISTINCT FROM (cur.assets->>'image_ref') THEN
      RAISE EXCEPTION 'Proposta rejeitada: trocou a imagem preservada.' USING ERRCODE = 'PT422';
    END IF;
  END LOOP;
  IF NOT ('caption' = ANY(m)) AND c.proposal ? 'caption' AND (c.proposal->>'caption') IS DISTINCT FROM p.caption THEN
    RAISE EXCEPTION 'Proposta rejeitada: alterou a legenda preservada.' USING ERRCODE = 'PT422';
  END IF;

  INSERT INTO public.piece_versions (user_id, post_id, version, components, action) VALUES (p.user_id, p.id, p.version, public.piece_components(p), 'base')
  ON CONFLICT (post_id, version) DO NOTHING;
  FOR u IN SELECT * FROM jsonb_array_elements(COALESCE(c.proposal->'units', '[]'::jsonb)) LOOP
    UPDATE public.post_units x SET
      title = CASE WHEN u ? 'title' THEN u->>'title' ELSE x.title END,
      body = CASE WHEN u ? 'body' THEN u->>'body' ELSE x.body END,
      assets = CASE WHEN u ? 'assets' THEN u->'assets' ELSE x.assets END,
      fabric_json = CASE WHEN u ? 'fabric_json' THEN u->'fabric_json' ELSE x.fabric_json END,
      rendered_url = CASE WHEN u ? 'rendered_url' THEN u->>'rendered_url' ELSE x.rendered_url END,
      rendered_text_version = CASE WHEN u ? 'rendered_url' THEN x.text_version + CASE WHEN (u ? 'title' AND (u->>'title') IS DISTINCT FROM x.title) OR (u ? 'body' AND (u->>'body') IS DISTINCT FROM x.body) THEN 1 ELSE 0 END ELSE x.rendered_text_version END,
      visual_status = CASE WHEN u ? 'rendered_url' THEN 'ready' ELSE x.visual_status END,
      review_status = 'pending'
    WHERE x.id = (u->>'id')::uuid;
  END LOOP;
  PERFORM public.sync_unit_projection(p.id);
  UPDATE public.user_posts SET
    caption = CASE WHEN c.proposal ? 'caption' THEN c.proposal->>'caption' ELSE caption END,
    visual_direction = CASE WHEN c.proposal ? 'visual_direction' THEN c.proposal->'visual_direction' ELSE visual_direction END,
    metadata = COALESCE(metadata, '{}'::jsonb) || CASE WHEN c.proposal ? 'caption' THEN '{"legenda_status":"pending"}'::jsonb ELSE '{}'::jsonb END
              || CASE WHEN 'text' = ANY(m) THEN '{"coherence_review": true}'::jsonb ELSE '{}'::jsonb END,
    status = CASE WHEN status = 'approved' THEN 'pending_approval' ELSE status END,
    approved_version = CASE WHEN status = 'approved' THEN NULL ELSE approved_version END,
    version = version + 1, updated_at = now()
  WHERE id = p.id RETURNING * INTO p;
  IF p.status = 'scheduled' THEN UPDATE public.user_posts SET metadata = metadata || '{"scheduled_outdated": true}'::jsonb WHERE id = p.id RETURNING * INTO p; END IF;
  INSERT INTO public.piece_versions (user_id, post_id, version, components, action, candidate_id) VALUES (p.user_id, p.id, p.version, public.piece_components(p), c.action, c.id);
  UPDATE public.piece_candidates SET status = 'applied', applied_at = now(), error = NULL WHERE id = c.id;
  RETURN p;
END $function$;
ALTER FUNCTION public."apply_unit_candidate"(cand_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."apply_unit_candidate"(cand_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."apply_unit_candidate"(cand_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."apply_unit_candidate"(cand_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."apply_unit_candidate"(cand_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."apply_unit_candidate"(cand_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."apply_unit_candidate"(cand_id uuid) TO "service_role";
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
ALTER FUNCTION public."approve_cycle_production"(p_cycle uuid, p_command uuid, p_expected_updated timestamp with time zone, p_bases jsonb, p_items jsonb, p_replace uuid[]) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."approve_cycle_production"(p_cycle uuid, p_command uuid, p_expected_updated timestamp with time zone, p_bases jsonb, p_items jsonb, p_replace uuid[]) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."approve_cycle_production"(p_cycle uuid, p_command uuid, p_expected_updated timestamp with time zone, p_bases jsonb, p_items jsonb, p_replace uuid[]) TO "postgres";
GRANT EXECUTE ON FUNCTION public."approve_cycle_production"(p_cycle uuid, p_command uuid, p_expected_updated timestamp with time zone, p_bases jsonb, p_items jsonb, p_replace uuid[]) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."approve_cycle_production"(p_cycle uuid, p_command uuid, p_expected_updated timestamp with time zone, p_bases jsonb, p_items jsonb, p_replace uuid[]) TO "service_role";
CREATE OR REPLACE FUNCTION public.approve_piece(p_post uuid, p_rendered text DEFAULT NULL::text, p_approve_ai boolean DEFAULT false)
 RETURNS user_posts
 LANGUAGE plpgsql
AS $function$
DECLARE p public.user_posts%ROWTYPE; rd jsonb; variant text;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = p_post FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada.' USING ERRCODE = 'PT404'; END IF;
  IF p.format IN ('carousel', 'story') THEN RAISE EXCEPTION 'Sequências são aprovadas na revisão da sequência.' USING ERRCODE = 'PT422'; END IF;
  IF p_rendered IS NOT NULL AND split_part(COALESCE(p.rendered_slides->>'slide1', ''), '?', 1) IS DISTINCT FROM split_part(p_rendered, '?', 1) THEN
    RAISE EXCEPTION 'A imagem mudou desde que você abriu a peça. Revise a versão atual antes de aprovar.' USING ERRCODE = 'PT409';
  END IF;
  variant := p.visual_decision->>'variant';
  IF p_approve_ai AND (variant IN ('M01-D', 'M01-E') OR variant LIKE 'M02-%') THEN
    UPDATE public.user_posts SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"bg_approved":true}'::jsonb WHERE id = p_post RETURNING * INTO p;
  END IF;
  rd := public.piece_readiness(p_post, 'approve_piece');
  IF NOT (rd->>'ready')::boolean THEN
    RAISE EXCEPTION 'A peça ainda não pode ser aprovada: %', (SELECT string_agg(m->>'reason', ' ') FROM jsonb_array_elements(rd->'missing') m) USING ERRCODE = 'PT422';
  END IF;
  UPDATE public.user_posts SET
    status = CASE WHEN status = 'scheduled' THEN 'scheduled' ELSE 'approved' END,
    image_approved = true, image_status = 'approved', text_approved = true, approved_version = version,
    metadata = (COALESCE(metadata, '{}'::jsonb) - 'edited_after_approval') || jsonb_build_object('titulo_status', 'approved', 'legenda_status', 'approved', 'review_stage', 'done',
      'review_evidence', COALESCE(metadata->'review_evidence', '{}'::jsonb) || jsonb_build_object(
        'peca', jsonb_build_object('rendered', p.rendered_slides->>'slide1', 'caption_sha256', public.sha256_text(p.caption),
                                   'quote_sha256', public.sha256_text(public.review_component_text(p, 'titulo')), 'at', now())))
   WHERE id = p_post RETURNING * INTO p;
  RETURN p;
END $function$;
ALTER FUNCTION public."approve_piece"(p_post uuid, p_rendered text, p_approve_ai boolean) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."approve_piece"(p_post uuid, p_rendered text, p_approve_ai boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."approve_piece"(p_post uuid, p_rendered text, p_approve_ai boolean) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."approve_piece"(p_post uuid, p_rendered text, p_approve_ai boolean) TO "postgres";
GRANT EXECUTE ON FUNCTION public."approve_piece"(p_post uuid, p_rendered text, p_approve_ai boolean) TO "anon";
GRANT EXECUTE ON FUNCTION public."approve_piece"(p_post uuid, p_rendered text, p_approve_ai boolean) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."approve_piece"(p_post uuid, p_rendered text, p_approve_ai boolean) TO "service_role";
CREATE OR REPLACE FUNCTION public.approve_sequence(pid uuid)
 RETURNS user_posts
 LANGUAGE plpgsql
AS $function$
DECLARE p public.user_posts%ROWTYPE; cap public.format_capabilities%ROWTYPE; n int; bad int;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = pid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada' USING ERRCODE = 'PT404'; END IF;
  IF p.script_status IS DISTINCT FROM 'approved' THEN RAISE EXCEPTION 'Aprove o roteiro antes.' USING ERRCODE = 'PT422'; END IF;
  SELECT * INTO cap FROM public.format_capabilities WHERE platform = p.platform AND format = p.format;
  SELECT count(*), count(*) FILTER (WHERE visual_status <> 'ready' OR rendered_url IS NULL OR review_status <> 'approved') INTO n, bad FROM public.post_units WHERE post_id = pid;
  IF n = 0 OR (cap.platform IS NOT NULL AND (n < cap.min_units OR n > cap.max_units)) THEN
    RAISE EXCEPTION 'Sequência incompleta: % página(s) (permitido % a %).', n, cap.min_units, cap.max_units USING ERRCODE = 'PT422';
  END IF;
  IF bad > 0 THEN RAISE EXCEPTION 'Peça incompleta: % página(s) sem visual pronto ou sem aprovação.', bad USING ERRCODE = 'PT422'; END IF;
  IF p.format <> 'story' AND COALESCE(trim(p.caption), '') = '' THEN RAISE EXCEPTION 'Peça incompleta: falta a legenda.' USING ERRCODE = 'PT422'; END IF;
  PERFORM public.sync_unit_projection(pid);
  UPDATE public.user_posts SET status = CASE WHEN status = 'scheduled' THEN 'scheduled' ELSE 'approved' END,
         approved_version = version, image_status = 'approved', image_approved = true, text_approved = true,
         metadata = COALESCE(metadata, '{}'::jsonb) - 'coherence_review' || '{"review_stage":"done","legenda_status":"approved"}'::jsonb
   WHERE id = pid RETURNING * INTO p;
  INSERT INTO public.piece_versions (user_id, post_id, version, components, action) VALUES (p.user_id, p.id, p.version, public.piece_components(p), 'approve')
  ON CONFLICT (post_id, version) DO NOTHING;
  RETURN p;
END $function$;
ALTER FUNCTION public."approve_sequence"(pid uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."approve_sequence"(pid uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."approve_sequence"(pid uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."approve_sequence"(pid uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."approve_sequence"(pid uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."approve_sequence"(pid uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."approve_sequence"(pid uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.approve_sequence_review(pid uuid, p_expected jsonb)
 RETURNS user_posts
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE p public.user_posts; n int; maxpos int; minpos int;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id=pid AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada.' USING ERRCODE='PT404'; END IF;
  IF p.format NOT IN ('carousel','story') OR p.metadata->>'production_flow' IS DISTINCT FROM 'base_v2' THEN
    RAISE EXCEPTION 'Use a revisão própria desta peça.' USING ERRCODE='PT422';
  END IF;
  IF p.status<>'pending_approval' THEN RAISE EXCEPTION 'A peça já saiu desta revisão. Atualize.' USING ERRCODE='PT409'; END IF;
  PERFORM 1 FROM public.post_units WHERE post_id=pid AND user_id=auth.uid() ORDER BY position FOR UPDATE;
  IF p_expected IS NULL OR public.sequence_review_material(pid) IS DISTINCT FROM p_expected THEN
    RAISE EXCEPTION 'O conteúdo mudou depois de abrir a revisão. Confira as imagens e o texto atualizados antes de aprovar.' USING ERRCODE='PT409';
  END IF;
  SELECT count(*),max(position),min(position) INTO n,maxpos,minpos FROM public.post_units WHERE post_id=pid;
  IF n=0 OR maxpos<>n OR minpos<>1 OR NOT EXISTS(SELECT 1 FROM public.format_capabilities WHERE platform=p.platform AND format=p.format AND n BETWEEN min_units AND max_units) THEN
    RAISE EXCEPTION 'A sequência está incompleta ou fora da capacidade do formato.' USING ERRCODE='PT422';
  END IF;
  IF EXISTS(SELECT 1 FROM public.post_units WHERE post_id=pid AND (visual_status<>'ready' OR coalesce(rendered_url,'')='' OR rendered_text_version IS DISTINCT FROM text_version OR (coalesce(trim(title),'')='' AND coalesce(trim(body),'')=''))) THEN
    RAISE EXCEPTION 'Há imagens pendentes ou desatualizadas. Produza as pendentes antes de aprovar.' USING ERRCODE='PT422';
  END IF;
  -- Este comando só é chamado após o produtor confirmar a leitura de todo o material mostrado.
  UPDATE public.user_posts SET script_status='approved' WHERE id=pid;
  UPDATE public.post_units SET review_status='approved' WHERE post_id=pid AND user_id=auth.uid();
  RETURN public.approve_sequence(pid);
END $function$;
ALTER FUNCTION public."approve_sequence_review"(pid uuid, p_expected jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."approve_sequence_review"(pid uuid, p_expected jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."approve_sequence_review"(pid uuid, p_expected jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."approve_sequence_review"(pid uuid, p_expected jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."approve_sequence_review"(pid uuid, p_expected jsonb) TO "service_role";
CREATE OR REPLACE FUNCTION public.brand_readable(b uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT b IS NULL OR public.is_brand_member(b)
$function$;
ALTER FUNCTION public."brand_readable"(b uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."brand_readable"(b uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."brand_readable"(b uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."brand_readable"(b uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."brand_readable"(b uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."brand_readable"(b uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."brand_readable"(b uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.bump_arsenal_usage(p_id uuid)
 RETURNS void
 LANGUAGE sql
AS $function$
  UPDATE public.bee_arsenal
  SET usage_count = usage_count + 1, last_used_at = NOW()
  WHERE id = p_id;
$function$;
ALTER FUNCTION public."bump_arsenal_usage"(p_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."bump_arsenal_usage"(p_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."bump_arsenal_usage"(p_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."bump_arsenal_usage"(p_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."bump_arsenal_usage"(p_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."bump_arsenal_usage"(p_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."bump_arsenal_usage"(p_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.bump_example_usage(p_id uuid)
 RETURNS void
 LANGUAGE sql
AS $function$
  UPDATE public.bee_example_posts
  SET usage_count = usage_count + 1, last_used_at = NOW()
  WHERE id = p_id;
$function$;
ALTER FUNCTION public."bump_example_usage"(p_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."bump_example_usage"(p_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."bump_example_usage"(p_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."bump_example_usage"(p_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."bump_example_usage"(p_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."bump_example_usage"(p_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."bump_example_usage"(p_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.calc_next_run_at(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
  base_time TIMESTAMPTZ := COALESCE(last_run, NOW());
  candidate TIMESTAMPTZ;
  i INT;
BEGIN
  -- se nao tem frequencia automatica, retorna null
  IF freq_type = 'manual' THEN RETURN NULL; END IF;
  -- daily: proximo dia as Xh
  IF freq_type = 'daily' THEN
    candidate := date_trunc('day', base_time) + INTERVAL '1 day' + (hour || ' hours')::INTERVAL;
    IF start_dt IS NOT NULL AND candidate::DATE < start_dt THEN
      candidate := start_dt + (hour || ' hours')::INTERVAL;
    END IF;
    RETURN candidate;
  END IF;
  -- weekly ou custom_days: proximo dia da semana em freq_days (1=seg, 7=dom)
  IF freq_days IS NULL OR array_length(freq_days, 1) IS NULL THEN
    RETURN base_time + INTERVAL '7 days';
  END IF;
  FOR i IN 1..14 LOOP
    candidate := date_trunc('day', base_time + (i || ' days')::INTERVAL) + (hour || ' hours')::INTERVAL;
    IF EXTRACT(ISODOW FROM candidate)::INT = ANY(freq_days) THEN
      IF start_dt IS NULL OR candidate::DATE >= start_dt THEN
        RETURN candidate;
      END IF;
    END IF;
  END LOOP;
  RETURN base_time + INTERVAL '7 days';
END;
$function$;
ALTER FUNCTION public."calc_next_run_at"(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."calc_next_run_at"(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."calc_next_run_at"(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."calc_next_run_at"(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date) TO "postgres";
GRANT EXECUTE ON FUNCTION public."calc_next_run_at"(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date) TO "anon";
GRANT EXECUTE ON FUNCTION public."calc_next_run_at"(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."calc_next_run_at"(freq_type text, freq_days integer[], hour integer, last_run timestamp with time zone, start_dt date) TO "service_role";
CREATE OR REPLACE FUNCTION public.claim_knowledge_analysis(p_document uuid, p_force boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."claim_knowledge_analysis"(p_document uuid, p_force boolean) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."claim_knowledge_analysis"(p_document uuid, p_force boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."claim_knowledge_analysis"(p_document uuid, p_force boolean) TO "postgres";
GRANT EXECUTE ON FUNCTION public."claim_knowledge_analysis"(p_document uuid, p_force boolean) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."claim_knowledge_analysis"(p_document uuid, p_force boolean) TO "service_role";
CREATE OR REPLACE FUNCTION public.commit_schedule(p_command uuid, p_user uuid, p_post uuid, p_intent text, p_when timestamp with time zone, p_package uuid, p_expected_version integer, p_params_sha text, p_plan uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE p public.user_posts%ROWTYPE; prev public.schedule_commands%ROWTYPE; pk public.publication_packages%ROWTYPE; rd jsonb; res jsonb;
BEGIN
  SELECT * INTO prev FROM public.schedule_commands WHERE command_id = p_command;
  IF FOUND THEN
    IF prev.params_sha256 <> p_params_sha OR prev.post_id <> p_post THEN
      RAISE EXCEPTION 'Este pedido de agendamento já foi usado com outros dados.' USING ERRCODE = 'PT409';
    END IF;
    RETURN prev.result || jsonb_build_object('replayed', true);
  END IF;

  SELECT * INTO p FROM public.user_posts WHERE id = p_post FOR UPDATE;
  IF NOT FOUND OR p.user_id <> p_user THEN RAISE EXCEPTION 'Peça não encontrada.' USING ERRCODE = 'PT404'; END IF;
  IF p.status = 'published' OR (p.status = 'archived' AND p.published_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Este conteúdo já foi publicado e permanece no histórico.' USING ERRCODE = 'PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM public.post_publications WHERE post_id = p_post AND stage IN ('reserved', 'sending', 'unknown')) THEN
    RAISE EXCEPTION 'A publicação desta peça está em andamento ou precisa ser conferida.' USING ERRCODE = 'PT409';
  END IF;
  IF p_expected_version IS NOT NULL AND p.version IS DISTINCT FROM p_expected_version THEN
    RAISE EXCEPTION 'A peça mudou enquanto você agendava (versão % → %). Revise e tente de novo.', p_expected_version, p.version USING ERRCODE = 'PT409';
  END IF;
  IF p_intent IN ('schedule', 'reschedule') AND (p_when IS NULL OR p_when <= now()) THEN
    RAISE EXCEPTION 'O horário escolhido já passou. Escolha uma data futura.' USING ERRCODE = 'PT422';
  END IF;
  IF p_intent IN ('schedule', 'replace_package') THEN
    SELECT * INTO pk FROM public.publication_packages WHERE id = p_package AND post_id = p_post;
    IF NOT FOUND THEN RAISE EXCEPTION 'O pacote a programar não pertence a esta peça.' USING ERRCODE = 'PT409'; END IF;
    rd := public.piece_readiness(p_post, 'schedule');
    IF NOT (rd->>'ready')::boolean THEN
      RAISE EXCEPTION 'A peça não está pronta para agendar: %', (SELECT string_agg(m->>'reason', ' ') FROM jsonb_array_elements(rd->'missing') m) USING ERRCODE = 'PT422';
    END IF;
  END IF;

  IF p_intent = 'schedule' THEN
    UPDATE public.user_posts SET status = 'scheduled', scheduled_date = p_when, scheduled_package_id = pk.id
     WHERE id = p_post RETURNING * INTO p;
    -- pin_scheduled_version só fixa ao ENTRAR em agendado: a referência canônica manda
    UPDATE public.user_posts SET scheduled_version = pk.source_version, metadata = COALESCE(metadata, '{}'::jsonb) - 'scheduled_outdated'
     WHERE id = p_post RETURNING * INTO p;
  ELSIF p_intent = 'reschedule' THEN
    IF p.status <> 'scheduled' THEN RAISE EXCEPTION 'A peça não está agendada.' USING ERRCODE = 'PT409'; END IF;
    UPDATE public.user_posts SET scheduled_date = p_when WHERE id = p_post RETURNING * INTO p;      -- pacote inalterado
  ELSIF p_intent = 'replace_package' THEN
    IF p.status <> 'scheduled' THEN RAISE EXCEPTION 'A peça não está agendada.' USING ERRCODE = 'PT409'; END IF;
    UPDATE public.user_posts SET scheduled_package_id = pk.id, scheduled_version = pk.source_version,
           metadata = COALESCE(metadata, '{}'::jsonb) - 'scheduled_outdated' WHERE id = p_post RETURNING * INTO p;
  ELSIF p_intent = 'unschedule' THEN
    UPDATE public.user_posts SET status = CASE WHEN status = 'scheduled' THEN 'approved' ELSE status END, scheduled_date = NULL, scheduled_package_id = NULL
     WHERE id = p_post RETURNING * INTO p;
  ELSE
    RAISE EXCEPTION 'Intenção desconhecida: %', p_intent USING ERRCODE = 'PT422';
  END IF;

  res := jsonb_build_object('intent', p_intent, 'post_id', p.id, 'status', p.status, 'scheduled_date', p.scheduled_date,
    'scheduled_package_id', p.scheduled_package_id, 'scheduled_version', p.scheduled_version, 'version', p.version);
  INSERT INTO public.schedule_commands (command_id, user_id, post_id, plan_id, intent, params_sha256, result)
  VALUES (p_command, p_user, p_post, p_plan, p_intent, p_params_sha, res);
  RETURN res;
END $function$;
ALTER FUNCTION public."commit_schedule"(p_command uuid, p_user uuid, p_post uuid, p_intent text, p_when timestamp with time zone, p_package uuid, p_expected_version integer, p_params_sha text, p_plan uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."commit_schedule"(p_command uuid, p_user uuid, p_post uuid, p_intent text, p_when timestamp with time zone, p_package uuid, p_expected_version integer, p_params_sha text, p_plan uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."commit_schedule"(p_command uuid, p_user uuid, p_post uuid, p_intent text, p_when timestamp with time zone, p_package uuid, p_expected_version integer, p_params_sha text, p_plan uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."commit_schedule"(p_command uuid, p_user uuid, p_post uuid, p_intent text, p_when timestamp with time zone, p_package uuid, p_expected_version integer, p_params_sha text, p_plan uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.complete_cycle_production(p_cycle uuid)
 RETURNS campaign_cycles
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE cy public.campaign_cycles; pl public.content_piece_plans; p public.user_posts; n int:=0;
BEGIN
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=p_cycle AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR cy.plan->'production'->>'version' IS DISTINCT FROM '2' THEN RAISE EXCEPTION 'Produção indisponível.' USING ERRCODE='PT404'; END IF;
  FOR pl IN SELECT * FROM public.content_piece_plans WHERE cycle_id=p_cycle AND production_batch_id::text=cy.plan->'production'->>'batch_id' AND status<>'removed' ORDER BY id FOR UPDATE LOOP
    n:=n+1;
    SELECT * INTO p FROM public.user_posts WHERE id=pl.post_id AND user_id=auth.uid() FOR UPDATE;
    IF pl.status<>'produced' OR p.id IS NULL OR p.status NOT IN ('approved','scheduled','published') OR p.account_id IS NULL
      OR p.metadata->>'destination_account_id' IS DISTINCT FROM p.account_id::text
      OR p.metadata->>'destinations_confirmed' IS DISTINCT FROM 'true' OR p.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(p.id) THEN
      RAISE EXCEPTION 'Há peça pendente de produção, aprovação ou confirmação de destinos.' USING ERRCODE='PT422';
    END IF;
  END LOOP;
  IF EXISTS(SELECT 1 FROM public.user_posts child JOIN public.user_posts master ON child.metadata->>'delivery_of'=master.id::text
    WHERE master.cycle_id=p_cycle AND master.metadata->>'production_batch_id'=cy.plan->'production'->>'batch_id' AND child.status<>'archived'
      AND (child.status NOT IN ('approved','scheduled','published') OR child.account_id IS NULL
        OR child.metadata->>'destination_account_id' IS DISTINCT FROM child.account_id::text
        OR child.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(child.id)
        OR child.metadata->>'delivery_source_hash' IS DISTINCT FROM public.production_material_hash(master.id))) THEN
    RAISE EXCEPTION 'Há destino com material ou conta alterados. Confira a peça antes de concluir.' USING ERRCODE='PT422';
  END IF;
  IF n=0 THEN RAISE EXCEPTION 'A produção não tem peças.' USING ERRCODE='PT422'; END IF;
  UPDATE public.campaign_cycles SET status='ready' WHERE id=p_cycle RETURNING * INTO cy;
  RETURN cy;
END $function$;
ALTER FUNCTION public."complete_cycle_production"(p_cycle uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."complete_cycle_production"(p_cycle uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."complete_cycle_production"(p_cycle uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."complete_cycle_production"(p_cycle uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."complete_cycle_production"(p_cycle uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.confirm_publication(p_pub uuid, p_external_id text, p_url text, p_units integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE op public.post_publications%ROWTYPE;
BEGIN
  UPDATE public.post_publications SET stage = 'confirmed', status = 'published', external_id = p_external_id, url = p_url, error = NULL, failure_class = NULL,
         units_published = COALESCE(p_units, units_total), finished_at = now(), updated_at = now()
   WHERE id = p_pub RETURNING * INTO op;
  IF NOT FOUND THEN RAISE EXCEPTION 'Publicação não encontrada.' USING ERRCODE = 'PT404'; END IF;
  UPDATE public.user_posts SET status = 'published', published_url = p_url, published_at = now(), published_date = now(), publish_error = NULL,
         metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('published_version', op.version, 'published_package_id', op.package_id)
   WHERE id = op.post_id;
END $function$;
ALTER FUNCTION public."confirm_publication"(p_pub uuid, p_external_id text, p_url text, p_units integer) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."confirm_publication"(p_pub uuid, p_external_id text, p_url text, p_units integer) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."confirm_publication"(p_pub uuid, p_external_id text, p_url text, p_units integer) TO "postgres";
GRANT EXECUTE ON FUNCTION public."confirm_publication"(p_pub uuid, p_external_id text, p_url text, p_units integer) TO "service_role";
CREATE OR REPLACE FUNCTION public.create_my_workspace(p_workspace text, p_brand text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE uid uuid := auth.uid(); ws uuid; b uuid; s text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Não autenticado' USING ERRCODE = 'PT401'; END IF;
  IF EXISTS (SELECT 1 FROM public.workspace_members WHERE user_id = uid) THEN
    RAISE EXCEPTION 'Você já participa de um espaço de trabalho.' USING ERRCODE = 'PT409';
  END IF;
  IF COALESCE(trim(p_brand), '') = '' THEN RAISE EXCEPTION 'Informe o nome da marca.' USING ERRCODE = 'PT400'; END IF;
  s := trim(both '-' from regexp_replace(translate(lower(p_brand), 'áàâãéêíóôõúç', 'aaaaeeiooouc'), '[^a-z0-9]+', '-', 'g'));
  INSERT INTO public.workspaces (name, slug) VALUES (COALESCE(NULLIF(trim(p_workspace), ''), p_brand), s || '-' || substr(gen_random_uuid()::text, 1, 6)) RETURNING id INTO ws;
  INSERT INTO public.workspace_members (workspace_id, user_id, role) VALUES (ws, uid, 'owner');
  INSERT INTO public.brands (workspace_id, name, slug, is_default) VALUES (ws, trim(p_brand), s, true) RETURNING id INTO b;
  RETURN b;
END $function$;
ALTER FUNCTION public."create_my_workspace"(p_workspace text, p_brand text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."create_my_workspace"(p_workspace text, p_brand text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."create_my_workspace"(p_workspace text, p_brand text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."create_my_workspace"(p_workspace text, p_brand text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."create_my_workspace"(p_workspace text, p_brand text) TO "service_role";
CREATE OR REPLACE FUNCTION public.editorial_line_set_next_run()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status <> 'active' OR
     NEW.frequency_type <> OLD.frequency_type OR NEW.frequency_days IS DISTINCT FROM OLD.frequency_days OR
     NEW.preferred_hour <> OLD.preferred_hour OR NEW.start_date IS DISTINCT FROM OLD.start_date) THEN
    NEW.next_run_at := public.calc_next_run_at(
      NEW.frequency_type, NEW.frequency_days, NEW.preferred_hour,
      NEW.last_run_at, NEW.start_date
    );
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$function$;
ALTER FUNCTION public."editorial_line_set_next_run"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."editorial_line_set_next_run"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."editorial_line_set_next_run"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."editorial_line_set_next_run"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."editorial_line_set_next_run"() TO "anon";
GRANT EXECUTE ON FUNCTION public."editorial_line_set_next_run"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."editorial_line_set_next_run"() TO "service_role";
CREATE OR REPLACE FUNCTION public.expire_publication_leases()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE n int;
BEGIN
  UPDATE public.post_publications SET stage = 'unknown', status = 'failed', failure_class = 'lease_expired_while_sending',
         error = COALESCE(error, 'A execução parou durante o envio.'), updated_at = now()
   WHERE stage = 'sending' AND lease_expires_at < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $function$;
ALTER FUNCTION public."expire_publication_leases"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."expire_publication_leases"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."expire_publication_leases"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."expire_publication_leases"() TO "service_role";
CREATE OR REPLACE FUNCTION public.fail_publication(p_pub uuid, p_before_send boolean, p_error text, p_class text DEFAULT NULL::text, p_units integer DEFAULT NULL::integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE op public.post_publications%ROWTYPE;
BEGIN
  UPDATE public.post_publications SET stage = CASE WHEN p_before_send THEN 'failed_before_send' ELSE 'unknown' END,
         status = CASE WHEN COALESCE(p_units, 0) > 0 THEN 'partial' ELSE 'failed' END,
         units_published = COALESCE(p_units, units_published), error = left(p_error, 1000), failure_class = p_class, finished_at = now(), updated_at = now()
   WHERE id = p_pub RETURNING * INTO op;
  IF FOUND THEN UPDATE public.user_posts SET publish_error = left(p_error, 1000) WHERE id = op.post_id; END IF;
END $function$;
ALTER FUNCTION public."fail_publication"(p_pub uuid, p_before_send boolean, p_error text, p_class text, p_units integer) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."fail_publication"(p_pub uuid, p_before_send boolean, p_error text, p_class text, p_units integer) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."fail_publication"(p_pub uuid, p_before_send boolean, p_error text, p_class text, p_units integer) TO "postgres";
GRANT EXECUTE ON FUNCTION public."fail_publication"(p_pub uuid, p_before_send boolean, p_error text, p_class text, p_units integer) TO "service_role";
CREATE OR REPLACE FUNCTION public.finish_knowledge_analysis(p_document uuid, p_claim uuid, p_items jsonb, p_error text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."finish_knowledge_analysis"(p_document uuid, p_claim uuid, p_items jsonb, p_error text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."finish_knowledge_analysis"(p_document uuid, p_claim uuid, p_items jsonb, p_error text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."finish_knowledge_analysis"(p_document uuid, p_claim uuid, p_items jsonb, p_error text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."finish_knowledge_analysis"(p_document uuid, p_claim uuid, p_items jsonb, p_error text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."finish_knowledge_analysis"(p_document uuid, p_claim uuid, p_items jsonb, p_error text) TO "service_role";
CREATE OR REPLACE FUNCTION public.flag_derived_pieces()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.body IS DISTINCT FROM OLD.body THEN
    UPDATE public.user_posts SET metadata=coalesce(metadata,'{}')||'{"source_outdated":true}'::jsonb
    WHERE content_id=NEW.id AND piece_role='unfold' AND status NOT IN ('published','archived')
      AND source_content_at IS NOT NULL AND source_content_at<now()
      AND metadata->>'source_base_version_id' IS NULL;
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."flag_derived_pieces"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."flag_derived_pieces"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."flag_derived_pieces"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."flag_derived_pieces"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."flag_derived_pieces"() TO "anon";
GRANT EXECUTE ON FUNCTION public."flag_derived_pieces"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."flag_derived_pieces"() TO "service_role";
CREATE OR REPLACE FUNCTION public.guard_base_reference()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."guard_base_reference"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."guard_base_reference"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."guard_base_reference"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."guard_base_reference"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."guard_base_reference"() TO "anon";
GRANT EXECUTE ON FUNCTION public."guard_base_reference"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."guard_base_reference"() TO "service_role";
CREATE OR REPLACE FUNCTION public.guard_plan_intent()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."guard_plan_intent"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."guard_plan_intent"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."guard_plan_intent"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."guard_plan_intent"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."guard_plan_intent"() TO "anon";
GRANT EXECUTE ON FUNCTION public."guard_plan_intent"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."guard_plan_intent"() TO "service_role";
CREATE OR REPLACE FUNCTION public.guard_product_audiences()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS(SELECT 1 FROM unnest(NEW.audience_ids) a WHERE NOT EXISTS(SELECT 1 FROM public.audiences x WHERE x.id=a AND x.brand_id=NEW.brand_id AND x.status<>'archived')) THEN
    RAISE EXCEPTION 'Selecione públicos desta marca.' USING ERRCODE='PT422';
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."guard_product_audiences"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."guard_product_audiences"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."guard_product_audiences"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."guard_product_audiences"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."guard_product_audiences"() TO "anon";
GRANT EXECUTE ON FUNCTION public."guard_product_audiences"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."guard_product_audiences"() TO "service_role";
CREATE OR REPLACE FUNCTION public.guard_production_v2()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE batch text; pl public.content_piece_plans;
BEGIN
  SELECT plan->'production'->>'batch_id' INTO batch FROM public.campaign_cycles WHERE id=NEW.cycle_id;
  IF batch IS NOT NULL AND NEW.content_id IS NOT NULL AND COALESCE(NEW.metadata->>'delivery_of','')='' THEN
    SELECT * INTO pl FROM public.content_piece_plans WHERE id=NEW.plan_id AND user_id=NEW.user_id;
    IF NEW.metadata->>'production_flow' IS DISTINCT FROM 'base_v2' OR pl.id IS NULL OR pl.status='removed'
      OR pl.production_batch_id::text IS DISTINCT FROM batch OR NEW.content_id IS DISTINCT FROM pl.content_id
      OR NEW.platform IS DISTINCT FROM pl.platform OR NEW.format IS DISTINCT FROM pl.format THEN
      RAISE EXCEPTION 'Esta campanha usa a nova produção. Atualize a página para continuar pelo plano aprovado.' USING ERRCODE='PT409';
    END IF;
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."guard_production_v2"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."guard_production_v2"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."guard_production_v2"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."guard_production_v2"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."guard_production_v2"() TO "anon";
GRANT EXECUTE ON FUNCTION public."guard_production_v2"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."guard_production_v2"() TO "service_role";
CREATE OR REPLACE FUNCTION public.guard_profile_brand()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.profile_id IS NOT NULL AND auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.communication_profiles p WHERE p.id = NEW.profile_id AND public.is_brand_member(p.brand_id)) THEN
    RAISE EXCEPTION 'Perfil de comunicação fora das suas marcas.' USING ERRCODE = 'PT403';
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."guard_profile_brand"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."guard_profile_brand"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."guard_profile_brand"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."guard_profile_brand"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."guard_profile_brand"() TO "anon";
GRANT EXECUTE ON FUNCTION public."guard_profile_brand"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."guard_profile_brand"() TO "service_role";
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  BEGIN
    INSERT INTO public.profiles (id, name, email) VALUES (NEW.id,
  COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
  NEW.email);
    INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
    INSERT INTO public.kanban_columns (user_id, name, color, position,
  is_default) VALUES (NEW.id, 'Ideia', '#94A3B8', 0, TRUE);
    INSERT INTO public.kanban_columns (user_id, name, color, position,
  is_default) VALUES (NEW.id, 'Rascunho', '#E8A04C', 1, TRUE);
    INSERT INTO public.kanban_columns (user_id, name, color, position,
  is_default) VALUES (NEW.id, 'Aprovado', '#10B981', 2, TRUE);
    INSERT INTO public.kanban_columns (user_id, name, color, position,
  is_default) VALUES (NEW.id, 'Agendado', '#3B82F6', 3, TRUE);
    INSERT INTO public.kanban_columns (user_id, name, color, position,
  is_default) VALUES (NEW.id, 'Publicado', '#2D4A5C', 4, TRUE);
    RETURN NEW;
  END;
  $function$;
ALTER FUNCTION public."handle_new_user"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."handle_new_user"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."handle_new_user"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."handle_new_user"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."handle_new_user"() TO "anon";
GRANT EXECUTE ON FUNCTION public."handle_new_user"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."handle_new_user"() TO "service_role";
CREATE OR REPLACE FUNCTION public.invalidate_on_edit()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE txt boolean; cap boolean; img boolean;
BEGIN
  IF OLD.status NOT IN ('approved', 'scheduled') OR OLD.format IN ('carousel', 'story') THEN RETURN NEW; END IF;
  -- Escritores explícitos não são reinterpretados: aprovar (status/aprovação) e aplicar uma proposta comparada
  -- (apply_piece_candidate avança a versão e cuida das próprias aprovações — Fase 2).
  IF NEW.status IS DISTINCT FROM OLD.status OR NEW.image_approved IS DISTINCT FROM OLD.image_approved
     OR NEW.approved_version IS DISTINCT FROM OLD.approved_version OR NEW.version IS DISTINCT FROM OLD.version THEN RETURN NEW; END IF;
  txt := COALESCE(NEW.carousel_text->>'quote', '') IS DISTINCT FROM COALESCE(OLD.carousel_text->>'quote', '');
  cap := COALESCE(NEW.caption, '') IS DISTINCT FROM COALESCE(OLD.caption, '');
  img := split_part(COALESCE(NEW.rendered_slides->>'slide1', ''), '?', 1) IS DISTINCT FROM split_part(COALESCE(OLD.rendered_slides->>'slide1', ''), '?', 1)
         OR NEW.carousel_fabric_json IS DISTINCT FROM OLD.carousel_fabric_json
         OR NEW.visual_decision IS DISTINCT FROM OLD.visual_decision;
  IF NOT (txt OR cap OR img) THEN RETURN NEW; END IF;
  NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) || '{"edited_after_approval":true}'::jsonb
    || CASE WHEN txt THEN '{"titulo_status":"pending"}'::jsonb ELSE '{}'::jsonb END
    || CASE WHEN cap THEN '{"legenda_status":"pending"}'::jsonb ELSE '{}'::jsonb END
    || CASE WHEN OLD.status = 'scheduled' THEN '{"scheduled_outdated":true}'::jsonb ELSE '{}'::jsonb END;
  IF img THEN NEW.image_approved := false; NEW.image_status := 'pending'; END IF;
  IF OLD.status = 'approved' THEN NEW.status := 'pending_approval'; END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."invalidate_on_edit"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."invalidate_on_edit"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."invalidate_on_edit"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."invalidate_on_edit"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."invalidate_on_edit"() TO "anon";
GRANT EXECUTE ON FUNCTION public."invalidate_on_edit"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."invalidate_on_edit"() TO "service_role";
CREATE OR REPLACE FUNCTION public.is_brand_member(b uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.brands br JOIN public.workspace_members m ON m.workspace_id = br.workspace_id
                  WHERE br.id = b AND m.user_id = auth.uid())
$function$;
ALTER FUNCTION public."is_brand_member"(b uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."is_brand_member"(b uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."is_brand_member"(b uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."is_brand_member"(b uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."is_brand_member"(b uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."is_brand_member"(b uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."is_brand_member"(b uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.workspace_members m WHERE m.workspace_id = ws AND m.user_id = auth.uid())
$function$;
ALTER FUNCTION public."is_workspace_member"(ws uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."is_workspace_member"(ws uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."is_workspace_member"(ws uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."is_workspace_member"(ws uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."is_workspace_member"(ws uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."is_workspace_member"(ws uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."is_workspace_member"(ws uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.mark_publication_sending(p_pub uuid, p_attempt uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE public.post_publications SET stage = 'sending', updated_at = now(), lease_expires_at = GREATEST(lease_expires_at, now() + interval '5 minutes')
   WHERE id = p_pub AND attempt_id = p_attempt AND stage = 'reserved';
  IF NOT FOUND THEN RAISE EXCEPTION 'A reserva desta publicação não pertence mais a esta tentativa.' USING ERRCODE = 'PT409'; END IF;
END $function$;
ALTER FUNCTION public."mark_publication_sending"(p_pub uuid, p_attempt uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."mark_publication_sending"(p_pub uuid, p_attempt uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."mark_publication_sending"(p_pub uuid, p_attempt uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."mark_publication_sending"(p_pub uuid, p_attempt uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.match_content_memory(query_embedding vector, filter_user_id uuid, match_count integer DEFAULT 5, exclude_post uuid DEFAULT NULL::uuid)
 RETURNS TABLE(post_id uuid, platform text, origin text, text text, said_at timestamp with time zone, similarity double precision)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT m.post_id, m.platform, m.origin, m.text, m.said_at, (1 - (m.embedding <=> query_embedding))::float AS similarity
    FROM public.content_memory m
   WHERE m.user_id = filter_user_id AND (exclude_post IS NULL OR m.post_id IS DISTINCT FROM exclude_post)
   ORDER BY m.embedding <=> query_embedding ASC
   LIMIT match_count
$function$;
ALTER FUNCTION public."match_content_memory"(query_embedding vector, filter_user_id uuid, match_count integer, exclude_post uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."match_content_memory"(query_embedding vector, filter_user_id uuid, match_count integer, exclude_post uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."match_content_memory"(query_embedding vector, filter_user_id uuid, match_count integer, exclude_post uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."match_content_memory"(query_embedding vector, filter_user_id uuid, match_count integer, exclude_post uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."match_content_memory"(query_embedding vector, filter_user_id uuid, match_count integer, exclude_post uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."match_content_memory"(query_embedding vector, filter_user_id uuid, match_count integer, exclude_post uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."match_content_memory"(query_embedding vector, filter_user_id uuid, match_count integer, exclude_post uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.match_knowledge(query_embedding vector, match_count integer DEFAULT 5, match_threshold double precision DEFAULT 0.3, filter_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, document_id uuid, document_title text, content text, similarity double precision, metadata jsonb)
 LANGUAGE sql
 STABLE
AS $function$
  SELECT kc.id, kc.document_id, kd.title AS document_title, kc.content, (1 - (kc.embedding <=> query_embedding))::FLOAT AS similarity, kc.metadata
  FROM public.knowledge_chunks kc
  JOIN public.knowledge_documents kd ON kd.id = kc.document_id
  WHERE (
      (filter_user_id IS NOT NULL AND kc.user_id = filter_user_id)
      OR (kd.is_global = TRUE AND (kd.brand_id IS NULL OR kd.brand_id IN (
            SELECT b.id FROM public.brands b JOIN public.workspace_members m ON m.workspace_id = b.workspace_id WHERE m.user_id = filter_user_id)))
    )
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding ASC
  LIMIT match_count;
$function$;
ALTER FUNCTION public."match_knowledge"(query_embedding vector, match_count integer, match_threshold double precision, filter_user_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."match_knowledge"(query_embedding vector, match_count integer, match_threshold double precision, filter_user_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."match_knowledge"(query_embedding vector, match_count integer, match_threshold double precision, filter_user_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."match_knowledge"(query_embedding vector, match_count integer, match_threshold double precision, filter_user_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."match_knowledge"(query_embedding vector, match_count integer, match_threshold double precision, filter_user_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."match_knowledge"(query_embedding vector, match_count integer, match_threshold double precision, filter_user_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."match_knowledge"(query_embedding vector, match_count integer, match_threshold double precision, filter_user_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.match_knowledge_scoped(query_embedding vector, filter_brand_id uuid, match_count integer DEFAULT 5, match_threshold double precision DEFAULT 0.3, filter_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, document_id uuid, document_title text, content text, similarity double precision, metadata jsonb)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
 SELECT kc.id,kc.document_id,kd.title,kc.content,(1-(kc.embedding <=> query_embedding))::float,kc.metadata
 FROM public.knowledge_chunks kc JOIN public.knowledge_documents kd ON kd.id=kc.document_id
 WHERE kd.brand_id=filter_brand_id AND NOT kd.archived
   AND (filter_user_id=auth.uid() OR current_user IN ('service_role','postgres'))
   AND EXISTS(SELECT 1 FROM public.brands b JOIN public.workspace_members m ON m.workspace_id=b.workspace_id WHERE b.id=filter_brand_id AND m.user_id=filter_user_id)
   AND (kc.user_id=filter_user_id OR kd.is_global)
   AND 1-(kc.embedding <=> query_embedding)>match_threshold
 ORDER BY kc.embedding <=> query_embedding LIMIT LEAST(GREATEST(match_count,1),20);
$function$;
ALTER FUNCTION public."match_knowledge_scoped"(query_embedding vector, filter_brand_id uuid, match_count integer, match_threshold double precision, filter_user_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."match_knowledge_scoped"(query_embedding vector, filter_brand_id uuid, match_count integer, match_threshold double precision, filter_user_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."match_knowledge_scoped"(query_embedding vector, filter_brand_id uuid, match_count integer, match_threshold double precision, filter_user_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."match_knowledge_scoped"(query_embedding vector, filter_brand_id uuid, match_count integer, match_threshold double precision, filter_user_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."match_knowledge_scoped"(query_embedding vector, filter_brand_id uuid, match_count integer, match_threshold double precision, filter_user_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.merge_post_review(p_post uuid, p_patch jsonb, p_expect jsonb DEFAULT '{}'::jsonb)
 RETURNS user_posts
 LANGUAGE plpgsql
AS $function$
DECLARE p public.user_posts%ROWTYPE; k text; allowed text[] := ARRAY['titulo_status', 'legenda_status', 'review_stage', 'imagem_status'];
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = p_post FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada.' USING ERRCODE = 'PT404'; END IF;
  FOR k IN SELECT jsonb_object_keys(p_patch) LOOP
    IF NOT (k = ANY (allowed)) THEN RAISE EXCEPTION 'Campo de revisão desconhecido: %', k USING ERRCODE = 'PT422'; END IF;
  END LOOP;
  FOR k IN SELECT jsonb_object_keys(COALESCE(p_expect, '{}'::jsonb)) LOOP
    IF public.sha256_text(public.review_component_text(p, k)) IS DISTINCT FROM p_expect->>k THEN
      RAISE EXCEPTION 'O texto % mudou enquanto você aprovava. Revise a versão atual.', CASE k WHEN 'titulo' THEN 'da frase' ELSE 'da legenda' END USING ERRCODE = 'PT409';
    END IF;
  END LOOP;
  UPDATE public.user_posts SET metadata = COALESCE(metadata, '{}'::jsonb) || p_patch
     || CASE WHEN COALESCE(p_expect, '{}'::jsonb) = '{}'::jsonb THEN '{}'::jsonb
             ELSE jsonb_build_object('review_evidence', COALESCE(metadata->'review_evidence', '{}'::jsonb) || (
               SELECT jsonb_object_agg(e.key, jsonb_build_object('sha256', e.value, 'at', now())) FROM jsonb_each_text(p_expect) e)) END
   WHERE id = p_post RETURNING * INTO p;
  RETURN p;
END $function$;
ALTER FUNCTION public."merge_post_review"(p_post uuid, p_patch jsonb, p_expect jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."merge_post_review"(p_post uuid, p_patch jsonb, p_expect jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."merge_post_review"(p_post uuid, p_patch jsonb, p_expect jsonb) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."merge_post_review"(p_post uuid, p_patch jsonb, p_expect jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."merge_post_review"(p_post uuid, p_patch jsonb, p_expect jsonb) TO "anon";
GRANT EXECUTE ON FUNCTION public."merge_post_review"(p_post uuid, p_patch jsonb, p_expect jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."merge_post_review"(p_post uuid, p_patch jsonb, p_expect jsonb) TO "service_role";
CREATE OR REPLACE FUNCTION public.meta_ads_summary(p_user uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  SELECT jsonb_build_object(
    'businesses', (SELECT count(*) FROM public.meta_businesses WHERE user_id = p_user),
    'ad_accounts', (SELECT count(*) FROM public.meta_ad_accounts WHERE user_id = p_user),
    'campaigns', (SELECT count(*) FROM public.meta_campaigns WHERE user_id = p_user),
    'adsets', (SELECT count(*) FROM public.meta_adsets WHERE user_id = p_user),
    'ads', (SELECT count(*) FROM public.meta_ads WHERE user_id = p_user),
    'insight_rows', (SELECT count(*) FROM public.meta_ad_insights_daily WHERE user_id = p_user),
    'date_min', (SELECT min(date) FROM public.meta_ad_insights_daily WHERE user_id = p_user),
    'date_max', (SELECT max(date) FROM public.meta_ad_insights_daily WHERE user_id = p_user),
    'spend', (SELECT coalesce(jsonb_object_agg(currency, total), '{}'::jsonb) FROM (
      SELECT a.currency, round(sum(i.spend)::numeric, 2) total FROM public.meta_ad_insights_daily i
      JOIN public.meta_ad_accounts a ON a.user_id = i.user_id AND a.fb_account_id = i.fb_account_id
      WHERE i.user_id = p_user GROUP BY a.currency) s)
  );
$function$;
ALTER FUNCTION public."meta_ads_summary"(p_user uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."meta_ads_summary"(p_user uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."meta_ads_summary"(p_user uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."meta_ads_summary"(p_user uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."meta_ads_summary"(p_user uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."meta_ads_summary"(p_user uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."meta_ads_summary"(p_user uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.piece_components(p user_posts)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  SELECT jsonb_build_object(
    'quote', p.carousel_text->>'quote', 'caption', p.caption, 'carousel_text', p.carousel_text,
    'carousel_fabric_json', p.carousel_fabric_json, 'rendered_slides', p.rendered_slides, 'visual_decision', p.visual_decision,
    'image_ref', public.piece_image_ref(p.visual_decision, p.carousel_fabric_json),
    'variant', p.visual_decision->>'variant',
    'visual_direction', p.visual_direction,
    'units', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', u.id, 'position', u.position, 'function', u.function, 'title', u.title, 'body', u.body,
                         'layout', u.layout, 'assets', u.assets, 'rendered_url', u.rendered_url, 'text_version', u.text_version) ORDER BY u.position)
                       FROM public.post_units u WHERE u.post_id = p.id), '[]'::jsonb))
$function$;
ALTER FUNCTION public."piece_components"(p user_posts) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."piece_components"(p user_posts) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."piece_components"(p user_posts) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."piece_components"(p user_posts) TO "postgres";
GRANT EXECUTE ON FUNCTION public."piece_components"(p user_posts) TO "anon";
GRANT EXECUTE ON FUNCTION public."piece_components"(p user_posts) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."piece_components"(p user_posts) TO "service_role";
CREATE OR REPLACE FUNCTION public.piece_image_ref(vd jsonb, fabric jsonb)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT COALESCE(
    vd->>'image_ref',
    vd->'asset'->>'url',
    (SELECT o->>'src' FROM jsonb_array_elements(COALESCE(fabric->0->'objects', '[]'::jsonb)) o
      WHERE o->>'type' IN ('Image', 'image') AND COALESCE(o->>'src', '') NOT ILIKE '%espiral%' AND COALESCE(o->>'src', '') NOT ILIKE '%spiral%'
      LIMIT 1)
  )
$function$;
ALTER FUNCTION public."piece_image_ref"(vd jsonb, fabric jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."piece_image_ref"(vd jsonb, fabric jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."piece_image_ref"(vd jsonb, fabric jsonb) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."piece_image_ref"(vd jsonb, fabric jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."piece_image_ref"(vd jsonb, fabric jsonb) TO "anon";
GRANT EXECUTE ON FUNCTION public."piece_image_ref"(vd jsonb, fabric jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."piece_image_ref"(vd jsonb, fabric jsonb) TO "service_role";
CREATE OR REPLACE FUNCTION public.piece_inherit_context()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.content_id IS NOT NULL AND (NEW.context_snapshot_id IS NULL OR NEW.profile_id IS NULL) THEN
    SELECT COALESCE(NEW.profile_id, c.profile_id), COALESCE(NEW.context_snapshot_id, c.context_snapshot_id)
      INTO NEW.profile_id, NEW.context_snapshot_id
      FROM public.contents c WHERE c.id = NEW.content_id;
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."piece_inherit_context"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."piece_inherit_context"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."piece_inherit_context"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."piece_inherit_context"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."piece_inherit_context"() TO "anon";
GRANT EXECUTE ON FUNCTION public."piece_inherit_context"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."piece_inherit_context"() TO "service_role";
CREATE OR REPLACE FUNCTION public.piece_readiness(p_post uuid, p_scope text DEFAULT 'schedule'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  p public.user_posts%ROWTYPE; cap public.format_capabilities%ROWTYPE; acc record; st record;
  miss jsonb := '[]'::jsonb; n int; bad int; variant text;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = p_post;
  IF NOT FOUND THEN RETURN jsonb_build_object('ready', false, 'missing', jsonb_build_array(jsonb_build_object('component', 'peca', 'reason', 'Peça não encontrada.'))); END IF;
  IF p.status = 'published' OR (p.status = 'archived' AND p.published_at IS NOT NULL) THEN
    RETURN jsonb_build_object('ready', false, 'missing', jsonb_build_array(jsonb_build_object('component', 'historico', 'reason', 'Este conteúdo já foi publicado e permanece no histórico.')));
  END IF;

  IF p.format IN ('carousel', 'story') THEN
    SELECT * INTO cap FROM public.format_capabilities WHERE platform = p.platform AND format = p.format;
    IF p.script_status IS DISTINCT FROM 'approved' THEN miss := miss || jsonb_build_object('component', 'roteiro', 'reason', 'Roteiro ainda não aprovado.'); END IF;
    SELECT count(*), count(*) FILTER (WHERE visual_status <> 'ready' OR rendered_url IS NULL OR review_status <> 'approved') INTO n, bad FROM public.post_units WHERE post_id = p_post;
    IF n = 0 OR (cap.platform IS NOT NULL AND (n < cap.min_units OR n > cap.max_units)) THEN
      miss := miss || jsonb_build_object('component', 'paginas', 'reason', format('Sequência com %s página(s); o formato aceita de %s a %s.', n, cap.min_units, cap.max_units));
    END IF;
    IF bad > 0 THEN miss := miss || jsonb_build_object('component', 'paginas', 'reason', format('%s página(s) sem visual pronto ou sem aprovação.', bad)); END IF;
    IF p.format <> 'story' AND COALESCE(trim(p.caption), '') = '' THEN miss := miss || jsonb_build_object('component', 'legenda', 'reason', 'Falta a legenda.'); END IF;
    IF p_scope <> 'approve_piece' AND p.approved_version IS DISTINCT FROM p.version THEN
      miss := miss || jsonb_build_object('component', 'aprovacao', 'reason', 'A sequência completa ainda não foi aprovada nesta versão.');
    END IF;
  ELSIF p.format IN ('video', 'reel') THEN
    IF COALESCE(p.metadata->>'video_url', '') = '' THEN miss := miss || jsonb_build_object('component', 'video', 'reason', 'Vídeo não encontrado na peça.'); END IF;
    IF COALESCE(trim(p.caption), '') = '' THEN miss := miss || jsonb_build_object('component', 'legenda', 'reason', 'Falta a legenda.'); END IF;
  ELSE
    IF COALESCE(trim(p.caption), '') = '' THEN miss := miss || jsonb_build_object('component', 'legenda', 'reason', 'Falta a legenda.'); END IF;
    IF COALESCE(p.rendered_slides->>'slide1', '') = '' THEN miss := miss || jsonb_build_object('component', 'imagem', 'reason', 'Imagem final não renderizada.'); END IF;
    variant := p.visual_decision->>'variant';
    IF (variant IN ('M01-D', 'M01-E') OR variant LIKE 'M02-%') AND (p.metadata->>'bg_approved') IS DISTINCT FROM 'true' THEN
      miss := miss || jsonb_build_object('component', 'imagem_ia', 'reason', 'A imagem gerada por IA precisa ser aprovada.');
    END IF;
  END IF;

  IF p_scope IN ('schedule','publish') AND p.metadata->>'production_flow'='base_v2' THEN
    IF p.account_id IS NULL OR p.metadata->>'destination_account_id' IS DISTINCT FROM p.account_id::text OR p.metadata->>'destinations_confirmed' IS DISTINCT FROM 'true'
       OR p.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(p.id) THEN
      miss:=miss||jsonb_build_object('component','destinos','reason','Confirme as contas para esta versão aprovada antes de agendar.');
    END IF;
    IF EXISTS(SELECT 1 FROM public.user_posts x WHERE x.user_id=p.user_id AND x.platform=p.platform AND x.account_id=p.account_id
      AND x.id<>p.id AND COALESCE(x.metadata->>'delivery_of','')<>COALESCE(NULLIF(p.metadata->>'delivery_of',''),p.id::text)
      AND x.id::text<>COALESCE(p.metadata->>'delivery_of','') AND (x.status IN ('approved','scheduled','published') OR x.published_at IS NOT NULL)
      AND public.production_text_hash(x.id)=public.production_text_hash(p.id))
      AND NOT (COALESCE(p.metadata->>'intentional_republish','false')='true' AND length(trim(COALESCE(p.metadata->>'republish_note','')))>=5
        AND p.metadata->>'republish_text_hash'=public.production_text_hash(p.id)) THEN
      miss:=miss||jsonb_build_object('component','repeticao','reason','O mesmo conteúdo já existe nesta conta e plataforma. Confirme uma republicação intencional antes de continuar.');
    END IF;
  END IF;
  IF p_scope IN ('schedule', 'publish') THEN
    IF (p.metadata->>'edited_after_approval') = 'true' THEN miss := miss || jsonb_build_object('component', 'aprovacao', 'reason', 'Há alterações ainda não aprovadas: aprove a peça antes.'); END IF;
    IF p.status NOT IN ('approved', 'scheduled') THEN miss := miss || jsonb_build_object('component', 'aprovacao', 'reason', 'A peça ainda não foi aprovada.'); END IF;
    IF p.account_id IS NOT NULL THEN
      SELECT id, user_id, platform, status, label INTO acc FROM public.social_accounts WHERE id = p.account_id;
      IF acc.id IS NULL OR acc.user_id <> p.user_id THEN miss := miss || jsonb_build_object('component', 'conta', 'reason', 'A conta desta peça não existe mais. Escolha outra conta.');
      ELSIF acc.platform <> p.platform THEN miss := miss || jsonb_build_object('component', 'conta', 'reason', format('A conta "%s" é de outra rede.', acc.label));
      ELSIF acc.status <> 'connected' THEN miss := miss || jsonb_build_object('component', 'conta', 'reason', format('A conta "%s" está desconectada.', acc.label));
      END IF;
    ELSE
      SELECT linkedin_token, linkedin_author_urn, instagram_access_token, instagram_business_account_id INTO st FROM public.user_settings WHERE user_id = p.user_id;
      IF (p.platform = 'linkedin' AND (st.linkedin_token IS NULL OR st.linkedin_author_urn IS NULL))
         OR (p.platform = 'instagram' AND (st.instagram_access_token IS NULL OR st.instagram_business_account_id IS NULL)) THEN
        miss := miss || jsonb_build_object('component', 'conta', 'reason', 'Nenhuma conta conectada para esta rede.');
      END IF;
    END IF;
  END IF;
  RETURN jsonb_build_object('ready', jsonb_array_length(miss) = 0, 'missing', miss);
END $function$;
ALTER FUNCTION public."piece_readiness"(p_post uuid, p_scope text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."piece_readiness"(p_post uuid, p_scope text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."piece_readiness"(p_post uuid, p_scope text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."piece_readiness"(p_post uuid, p_scope text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."piece_readiness"(p_post uuid, p_scope text) TO "anon";
GRANT EXECUTE ON FUNCTION public."piece_readiness"(p_post uuid, p_scope text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."piece_readiness"(p_post uuid, p_scope text) TO "service_role";
CREATE OR REPLACE FUNCTION public.piece_versions_append_only()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.components IS DISTINCT FROM NEW.components THEN
    RAISE EXCEPTION 'Versão % da peça já registrada: o histórico não é reescrito.', OLD.version USING ERRCODE = 'PT409';
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."piece_versions_append_only"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."piece_versions_append_only"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."piece_versions_append_only"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."piece_versions_append_only"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."piece_versions_append_only"() TO "anon";
GRANT EXECUTE ON FUNCTION public."piece_versions_append_only"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."piece_versions_append_only"() TO "service_role";
CREATE OR REPLACE FUNCTION public.pin_scheduled_version()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'scheduled' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'scheduled') THEN
    NEW.scheduled_version := NEW.version;
    NEW.metadata := COALESCE(NEW.metadata, '{}'::jsonb) - 'scheduled_outdated';
  ELSIF NEW.status NOT IN ('scheduled', 'published') AND TG_OP = 'UPDATE' AND OLD.status = 'scheduled' THEN
    NEW.scheduled_version := NULL;
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."pin_scheduled_version"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."pin_scheduled_version"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."pin_scheduled_version"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."pin_scheduled_version"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."pin_scheduled_version"() TO "anon";
GRANT EXECUTE ON FUNCTION public."pin_scheduled_version"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."pin_scheduled_version"() TO "service_role";
CREATE OR REPLACE FUNCTION public.post_units_guard()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE numbering boolean;
BEGIN
  NEW.updated_at := now();
  IF NEW.title IS DISTINCT FROM OLD.title OR NEW.body IS DISTINCT FROM OLD.body THEN
    NEW.text_version := OLD.text_version + 1;
    NEW.review_status := 'pending';
    IF NEW.rendered_url IS NOT DISTINCT FROM OLD.rendered_url AND OLD.visual_status IN ('ready', 'failed') THEN NEW.visual_status := 'stale'; END IF;
  END IF;
  IF NEW.position IS DISTINCT FROM OLD.position AND NEW.rendered_url IS NOT DISTINCT FROM OLD.rendered_url AND OLD.visual_status = 'ready' THEN
    SELECT COALESCE((visual_direction->>'numbering')::boolean, false) INTO numbering FROM public.user_posts WHERE id = NEW.post_id;
    IF numbering THEN NEW.visual_status := 'stale'; NEW.review_status := 'pending'; END IF;
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."post_units_guard"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."post_units_guard"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."post_units_guard"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."post_units_guard"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."post_units_guard"() TO "anon";
GRANT EXECUTE ON FUNCTION public."post_units_guard"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."post_units_guard"() TO "service_role";
CREATE OR REPLACE FUNCTION public.post_units_touch_post()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE pid uuid := COALESCE(NEW.post_id, OLD.post_id);
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.title IS NOT DISTINCT FROM OLD.title AND NEW.body IS NOT DISTINCT FROM OLD.body
     AND NEW.position IS NOT DISTINCT FROM OLD.position AND NEW.rendered_url IS NOT DISTINCT FROM OLD.rendered_url THEN
    RETURN NULL;                                     -- só estado de revisão/render: não invalida a peça
  END IF;
  UPDATE public.user_posts SET status = 'pending_approval', approved_version = NULL, image_approved = false
   WHERE id = pid AND status = 'approved';
  UPDATE public.user_posts SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"scheduled_outdated": true}'::jsonb
   WHERE id = pid AND status = 'scheduled';
  RETURN NULL;
END $function$;
ALTER FUNCTION public."post_units_touch_post"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."post_units_touch_post"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."post_units_touch_post"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."post_units_touch_post"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."post_units_touch_post"() TO "anon";
GRANT EXECUTE ON FUNCTION public."post_units_touch_post"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."post_units_touch_post"() TO "service_role";
CREATE OR REPLACE FUNCTION public.prepare_piece_destinations(p_post uuid, p_expected_hash text, p_accounts uuid[], p_allow_repeat boolean DEFAULT false, p_repeat_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE p public.user_posts; q public.user_posts; child public.user_posts; u public.post_units; nu public.post_units;
  acc uuid; material text; fingerprint text; existing_ids uuid[]; current_ids uuid[]; result_ids uuid[]:='{}'; n int:=0;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id=p_post AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR COALESCE(p.metadata->>'delivery_of','')<>'' THEN RAISE EXCEPTION 'Abra a peça editorial original.' USING ERRCODE='PT404'; END IF;
  IF p.status NOT IN ('approved','scheduled','published') OR p.metadata->>'edited_after_approval'='true' THEN
    RAISE EXCEPTION 'Aprove a versão atual da peça antes de selecionar destinos.' USING ERRCODE='PT422';
  END IF;
  material:=public.production_material_hash(p.id); fingerprint:=public.production_text_hash(p.id);
  IF material IS DISTINCT FROM p_expected_hash THEN RAISE EXCEPTION 'O material mudou. Revise antes de confirmar as contas.' USING ERRCODE='PT409'; END IF;
  IF p_allow_repeat IS NULL THEN RAISE EXCEPTION 'Confirme a intenção de republicação.' USING ERRCODE='PT422'; END IF;
  IF cardinality(p_accounts) NOT BETWEEN 1 AND 20 OR p_accounts IS NULL OR cardinality(p_accounts)<>(SELECT count(DISTINCT x) FROM unnest(p_accounts) x) THEN
    RAISE EXCEPTION 'Escolha de 1 a 20 contas distintas.' USING ERRCODE='PT422';
  END IF;
  IF (SELECT count(*) FROM public.social_accounts WHERE id=ANY(p_accounts) AND user_id=auth.uid() AND platform=p.platform AND status='connected')<>cardinality(p_accounts) THEN
    RAISE EXCEPTION 'Uma das contas não pertence à sua voz, está desconectada ou é de outra plataforma.' USING ERRCODE='PT422';
  END IF;
  PERFORM 1 FROM public.user_posts WHERE user_id=auth.uid() AND metadata->>'delivery_of'=p.id::text ORDER BY id FOR UPDATE;
  SELECT array_agg(account_id ORDER BY account_id),array_agg(id ORDER BY id) INTO current_ids,existing_ids FROM public.user_posts
    WHERE user_id=auth.uid() AND (id=p.id OR metadata->>'delivery_of'=p.id::text) AND status<>'archived';
  IF COALESCE(p.metadata->>'intentional_republish','false')=p_allow_repeat::text
     AND (NOT p_allow_repeat OR p.metadata->>'republish_note'=p_repeat_note)
     AND current_ids=(SELECT array_agg(x ORDER BY x) FROM unnest(p_accounts) x) AND p.metadata->>'destination_material_hash'=material
     AND NOT EXISTS(SELECT 1 FROM public.user_posts x WHERE x.id=ANY(existing_ids) AND (
       x.metadata->>'destination_account_id' IS DISTINCT FROM x.account_id::text
       OR x.metadata->>'destination_material_hash' IS DISTINCT FROM public.production_material_hash(x.id)
       OR (x.id<>p.id AND x.metadata->>'delivery_source_hash' IS DISTINCT FROM material))) THEN
    RETURN jsonb_build_object('post_ids',existing_ids,'unchanged',true);
  END IF;
  IF p.status IN ('scheduled','published') OR EXISTS(SELECT 1 FROM public.user_posts WHERE id=ANY(existing_ids) AND status IN ('scheduled','published')) THEN
    RAISE EXCEPTION 'Há uma publicação ou agendamento protegido. Desfaça o agendamento antes de mudar os destinos.' USING ERRCODE='PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_posts x WHERE x.user_id=auth.uid() AND x.platform=p.platform AND x.account_id=ANY(p_accounts)
    AND x.id<>p.id AND COALESCE(x.metadata->>'delivery_of','')<>p.id::text
    AND (x.status IN ('approved','scheduled','published') OR x.published_at IS NOT NULL) AND public.production_text_hash(x.id)=fingerprint)
    AND (NOT p_allow_repeat OR length(trim(COALESCE(p_repeat_note,'')))<5) THEN
    RAISE EXCEPTION 'O mesmo conteúdo já existe em um dos destinos. Confirme a republicação intencional e explique o motivo.' USING ERRCODE='PT422';
  END IF;
  -- Old unscheduled deliveries stay in history; the editorial review is never duplicated.
  UPDATE public.user_posts SET status='archived' WHERE id=ANY(existing_ids) AND id<>p.id;
  FOREACH acc IN ARRAY p_accounts LOOP
    n:=n+1;
    IF n=1 THEN
      UPDATE public.user_posts SET account_id=acc,metadata=COALESCE(metadata,'{}')||jsonb_build_object('destinations_confirmed',true,'destination_account_id',acc,'destination_material_hash',material,
        'intentional_republish',p_allow_repeat,'republish_note',p_repeat_note,'republish_text_hash',fingerprint,'destinations_at',now()) WHERE id=p.id RETURNING * INTO q;
    ELSE
      q:=p; q.id:=gen_random_uuid(); q.codigo:=NULL; q.plan_id:=NULL; q.account_id:=acc;
      q.status:='pending_approval'; q.version:=1; q.approved_version:=NULL; q.scheduled_version:=NULL; q.scheduled_package_id:=NULL;
      q.scheduled_date:=NULL; q.published_date:=NULL; q.published_at:=NULL; q.published_url:=NULL; q.publish_error:=NULL; q.publish_attempts:=0;
      q.alternative_group:=NULL; q.alternative_rank:=NULL; q.is_recommended:=false; q.created_at:=now(); q.updated_at:=now();
      q.export_package:=NULL; q.text_approved:=false; q.image_approved:=false; q.image_status:='pending';
      IF q.format IN ('carousel','story') THEN q.script_status:='draft'; END IF;
      q.metadata:=(COALESCE(p.metadata,'{}')-ARRAY['review_evidence','destinations_confirmed','destination_material_hash','edited_after_approval'])||jsonb_build_object(
        'delivery_of',p.id,'delivery_source_hash',material,'destinations_confirmed',true,'destination_account_id',acc,'intentional_republish',p_allow_repeat,'republish_note',p_repeat_note,'republish_text_hash',fingerprint,'destinations_at',now());
      INSERT INTO public.user_posts SELECT q.* RETURNING * INTO q;
      IF q.format IN ('carousel','story') THEN
        FOR u IN SELECT * FROM public.post_units WHERE post_id=p.id ORDER BY position LOOP
          nu:=u; nu.id:=gen_random_uuid(); nu.post_id:=q.id; nu.created_at:=now(); nu.updated_at:=now();
          INSERT INTO public.post_units SELECT nu.*;
        END LOOP;
        UPDATE public.user_posts SET script_status='approved' WHERE id=q.id;
        SELECT * INTO q FROM public.approve_sequence(q.id);
      ELSE
        SELECT * INTO q FROM public.approve_piece(q.id,q.rendered_slides->>'slide1',false);
      END IF;
      UPDATE public.user_posts SET metadata=metadata||jsonb_build_object('destination_material_hash',public.production_material_hash(q.id)) WHERE id=q.id;
    END IF;
    result_ids:=array_append(result_ids,q.id);
  END LOOP;
  RETURN jsonb_build_object('post_ids',result_ids,'unchanged',false);
END $function$;
ALTER FUNCTION public."prepare_piece_destinations"(p_post uuid, p_expected_hash text, p_accounts uuid[], p_allow_repeat boolean, p_repeat_note text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."prepare_piece_destinations"(p_post uuid, p_expected_hash text, p_accounts uuid[], p_allow_repeat boolean, p_repeat_note text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."prepare_piece_destinations"(p_post uuid, p_expected_hash text, p_accounts uuid[], p_allow_repeat boolean, p_repeat_note text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."prepare_piece_destinations"(p_post uuid, p_expected_hash text, p_accounts uuid[], p_allow_repeat boolean, p_repeat_note text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."prepare_piece_destinations"(p_post uuid, p_expected_hash text, p_accounts uuid[], p_allow_repeat boolean, p_repeat_note text) TO "service_role";
CREATE OR REPLACE FUNCTION public.production_material_hash(p_post uuid)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT md5(public.piece_components(p)::text) FROM public.user_posts p WHERE id=p_post
$function$;
ALTER FUNCTION public."production_material_hash"(p_post uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."production_material_hash"(p_post uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."production_material_hash"(p_post uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."production_material_hash"(p_post uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."production_material_hash"(p_post uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.production_text_hash(p_post uuid)
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  SELECT md5(lower(regexp_replace(trim(concat_ws(' ',p.carousel_text->>'quote',p.caption,
    (SELECT string_agg(concat_ws(' ',u.title,u.body),' ' ORDER BY u.position) FROM public.post_units u WHERE u.post_id=p.id))), '\s+', ' ', 'g')))
  FROM public.user_posts p WHERE id=p_post
$function$;
ALTER FUNCTION public."production_text_hash"(p_post uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."production_text_hash"(p_post uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."production_text_hash"(p_post uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."production_text_hash"(p_post uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."production_text_hash"(p_post uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.profile_composition(pid uuid)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  SELECT jsonb_build_object(
    'profile', to_jsonb(p) - 'created_at' - 'updated_at',
    'emitter', (SELECT to_jsonb(e) - 'created_at' - 'updated_at' FROM public.emitters e WHERE e.id = p.emitter_id),
    'front', (SELECT to_jsonb(f) - 'created_at' - 'updated_at' FROM public.business_fronts f WHERE f.id = p.front_id),
    'audiences', COALESCE((SELECT jsonb_agg(to_jsonb(a) - 'created_at' - 'updated_at') FROM public.audiences a
                            WHERE a.id = p.primary_audience_id OR a.id = ANY(p.secondary_audience_ids)), '[]'::jsonb),
    'offers', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', o.id, 'name', o.name, 'promessa', o.promessa)) FROM public.bee_products o
                         WHERE o.id = ANY(p.offer_ids)), '[]'::jsonb))
  FROM public.communication_profiles p WHERE p.id = pid
$function$;
ALTER FUNCTION public."profile_composition"(pid uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."profile_composition"(pid uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."profile_composition"(pid uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."profile_composition"(pid uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."profile_composition"(pid uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."profile_composition"(pid uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."profile_composition"(pid uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.protect_published()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.status = 'published' OR (OLD.status = 'archived' AND OLD.published_at IS NOT NULL) THEN
    IF NEW.status NOT IN ('published', 'archived') THEN
      RAISE EXCEPTION 'Este conteúdo já foi publicado e permanece no histórico.' USING ERRCODE = 'PT409';
    END IF;
    IF NEW.scheduled_date IS DISTINCT FROM OLD.scheduled_date THEN
      RAISE EXCEPTION 'Este conteúdo já foi publicado e permanece no histórico: a data não pode ser alterada.' USING ERRCODE = 'PT409';
    END IF;
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."protect_published"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."protect_published"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."protect_published"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."protect_published"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."protect_published"() TO "anon";
GRANT EXECUTE ON FUNCTION public."protect_published"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."protect_published"() TO "service_role";
CREATE OR REPLACE FUNCTION public.publication_material(p_post uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'public'
AS $function$
DECLARE p public.user_posts; fingerprint text;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id=p_post AND user_id=auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada.' USING ERRCODE='PT404'; END IF;
  fingerprint:=public.production_text_hash(p.id);
  RETURN jsonb_build_object('hash',public.production_material_hash(p.id),'duplicates',COALESCE((
    SELECT jsonb_agg(jsonb_build_object('id',x.id,'account_id',x.account_id,'platform',x.platform,'published_at',x.published_at,'status',x.status))
    FROM public.user_posts x WHERE x.user_id=auth.uid() AND x.platform=p.platform AND x.id<>p.id AND x.account_id IS NOT NULL
      AND COALESCE(x.metadata->>'delivery_of','')<>p.id::text
      AND (x.status IN ('approved','scheduled','published') OR x.published_at IS NOT NULL)
      AND public.production_text_hash(x.id)=fingerprint),'[]'::jsonb),
    'deliveries',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',x.id,'account_id',x.account_id,'status',x.status,'source_hash',x.metadata->>'delivery_source_hash'))
      FROM public.user_posts x WHERE x.user_id=auth.uid() AND (x.id=p.id OR x.metadata->>'delivery_of'=p.id::text) AND x.status<>'archived'),'[]'::jsonb));
END $function$;
ALTER FUNCTION public."publication_material"(p_post uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."publication_material"(p_post uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."publication_material"(p_post uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."publication_material"(p_post uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."publication_material"(p_post uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.publication_packages_immutable()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Pacote de publicação é imutável: crie outro pacote.' USING ERRCODE = 'PT409';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_posts WHERE id = OLD.post_id) THEN
    RAISE EXCEPTION 'Pacote de publicação é imutável: só é removido junto com a peça.' USING ERRCODE = 'PT409';
  END IF;
  RETURN OLD;
END $function$;
ALTER FUNCTION public."publication_packages_immutable"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."publication_packages_immutable"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."publication_packages_immutable"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."publication_packages_immutable"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."publication_packages_immutable"() TO "anon";
GRANT EXECUTE ON FUNCTION public."publication_packages_immutable"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."publication_packages_immutable"() TO "service_role";
CREATE OR REPLACE FUNCTION public.reconcile_publication(p_pub uuid, p_published boolean, p_url text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE op public.post_publications%ROWTYPE;
BEGIN
  SELECT * INTO op FROM public.post_publications WHERE id = p_pub FOR UPDATE;
  IF NOT FOUND OR op.user_id <> auth.uid() THEN RAISE EXCEPTION 'Publicação não encontrada.' USING ERRCODE = 'PT404'; END IF;
  IF op.stage <> 'unknown' THEN RAISE EXCEPTION 'Esta publicação não está aguardando conferência.' USING ERRCODE = 'PT409'; END IF;
  IF p_published THEN
    IF COALESCE(trim(p_url), '') = '' THEN RAISE EXCEPTION 'Informe o link da publicação.' USING ERRCODE = 'PT422'; END IF;
    PERFORM public.confirm_publication(p_pub, NULL, p_url, NULL);
    UPDATE public.post_publications SET failure_class = 'reconciled_published' WHERE id = p_pub;
  ELSE
    UPDATE public.post_publications SET stage = 'failed_before_send', failure_class = 'reconciled_not_published', updated_at = now() WHERE id = p_pub;
    UPDATE public.post_unit_publications SET status = 'failed' WHERE publication_id = p_pub AND status = 'unknown';
  END IF;
  RETURN jsonb_build_object('ok', true);
END $function$;
ALTER FUNCTION public."reconcile_publication"(p_pub uuid, p_published boolean, p_url text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."reconcile_publication"(p_pub uuid, p_published boolean, p_url text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."reconcile_publication"(p_pub uuid, p_published boolean, p_url text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."reconcile_publication"(p_pub uuid, p_published boolean, p_url text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."reconcile_publication"(p_pub uuid, p_published boolean, p_url text) TO "anon";
GRANT EXECUTE ON FUNCTION public."reconcile_publication"(p_pub uuid, p_published boolean, p_url text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."reconcile_publication"(p_pub uuid, p_published boolean, p_url text) TO "service_role";
CREATE OR REPLACE FUNCTION public.register_manual_publication(p_post uuid, p_url text DEFAULT NULL::text)
 RETURNS user_posts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE p public.user_posts%ROWTYPE; pub uuid;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = p_post FOR UPDATE;
  IF NOT FOUND OR p.user_id <> auth.uid() THEN RAISE EXCEPTION 'Peça não encontrada.' USING ERRCODE = 'PT404'; END IF;
  IF p.status = 'published' THEN RETURN p; END IF;
  IF EXISTS (SELECT 1 FROM public.post_publications WHERE post_id = p_post AND stage IN ('reserved', 'sending', 'unknown')) THEN
    RAISE EXCEPTION 'Há uma publicação automática em andamento ou a conferir para esta peça.' USING ERRCODE = 'PT409';
  END IF;
  INSERT INTO public.post_publications (user_id, post_id, version, destination, platform, account_id, format, status, stage, units_total, units_published, url, finished_at)
  VALUES (p.user_id, p.id, COALESCE(p.scheduled_version, p.version, 1), 'manual:' || p.platform, p.platform, p.account_id, p.format, 'published', 'confirmed', 1, 1, NULLIF(trim(p_url), ''), now())
  ON CONFLICT (post_id, version, destination) DO UPDATE SET stage = 'confirmed', status = 'published', url = EXCLUDED.url, finished_at = now()
  RETURNING id INTO pub;
  UPDATE public.user_posts SET status = 'published', published_url = NULLIF(trim(p_url), ''), published_at = now(), published_date = now(), publish_error = NULL,
         metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('published_manually', true, 'published_version', COALESCE(p.scheduled_version, p.version))
   WHERE id = p_post RETURNING * INTO p;
  RETURN p;
END $function$;
ALTER FUNCTION public."register_manual_publication"(p_post uuid, p_url text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."register_manual_publication"(p_post uuid, p_url text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."register_manual_publication"(p_post uuid, p_url text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."register_manual_publication"(p_post uuid, p_url text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."register_manual_publication"(p_post uuid, p_url text) TO "anon";
GRANT EXECUTE ON FUNCTION public."register_manual_publication"(p_post uuid, p_url text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."register_manual_publication"(p_post uuid, p_url text) TO "service_role";
CREATE OR REPLACE FUNCTION public.remap_social_account(old_id uuid, new_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE o text := old_id::text; n text := new_id::text; c int; cy int; i int; p int;
BEGIN
  IF old_id = new_id THEN RETURN jsonb_build_object('campaigns', 0); END IF;
  IF NOT EXISTS (SELECT 1 FROM public.social_accounts WHERE id = new_id) THEN
    RAISE EXCEPTION 'Conta de destino não encontrada' USING ERRCODE = 'foreign_key_violation';
  END IF;
  UPDATE public.campaigns SET
      account_ids = (SELECT array_agg(DISTINCT x) FROM unnest(array_replace(account_ids, old_id, new_id)) x),
      cadence = CASE WHEN cadence ? o THEN (cadence - o) || jsonb_build_object(n, COALESCE((cadence->>n)::int, 0) + (cadence->>o)::int) ELSE cadence END
    WHERE old_id = ANY(account_ids) OR cadence ? o;
  GET DIAGNOSTICS c = ROW_COUNT;
  UPDATE public.campaign_cycles SET plan = replace(plan::text, o, n)::jsonb WHERE plan::text LIKE '%' || o || '%';
  GET DIAGNOSTICS cy = ROW_COUNT;
  UPDATE public.ideas SET channels = replace(channels::text, o, n)::jsonb WHERE channels::text LIKE '%' || o || '%';
  GET DIAGNOSTICS i = ROW_COUNT;
  UPDATE public.user_posts SET account_id = new_id WHERE account_id = old_id;
  GET DIAGNOSTICS p = ROW_COUNT;
  RETURN jsonb_build_object('campaigns', c, 'cycles', cy, 'ideas', i, 'posts', p);
END $function$;
ALTER FUNCTION public."remap_social_account"(old_id uuid, new_id uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."remap_social_account"(old_id uuid, new_id uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."remap_social_account"(old_id uuid, new_id uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."remap_social_account"(old_id uuid, new_id uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."remap_social_account"(old_id uuid, new_id uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."remap_social_account"(old_id uuid, new_id uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."remap_social_account"(old_id uuid, new_id uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.reorder_units(pid uuid, unit_ids uuid[])
 RETURNS user_posts
 LANGUAGE plpgsql
AS $function$
DECLARE p public.user_posts%ROWTYPE; n int;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id = pid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Peça não encontrada' USING ERRCODE = 'PT404'; END IF;
  IF p.status = 'published' THEN RAISE EXCEPTION 'Peça publicada: o histórico não muda.' USING ERRCODE = 'PT409'; END IF;
  SELECT count(*) INTO n FROM public.post_units WHERE post_id = pid;
  IF n <> COALESCE(array_length(unit_ids, 1), 0) OR EXISTS (SELECT 1 FROM public.post_units u WHERE u.post_id = pid AND NOT u.id = ANY(unit_ids)) THEN
    RAISE EXCEPTION 'A nova ordem precisa conter exatamente as páginas atuais.' USING ERRCODE = 'PT400';
  END IF;
  INSERT INTO public.piece_versions (user_id, post_id, version, components, action) VALUES (p.user_id, p.id, p.version, public.piece_components(p), 'base')
  ON CONFLICT (post_id, version) DO NOTHING;
  UPDATE public.post_units u SET position = x.ord FROM unnest(unit_ids) WITH ORDINALITY AS x(uid, ord) WHERE u.id = x.uid AND u.post_id = pid AND u.position <> x.ord;
  PERFORM public.sync_unit_projection(pid);
  UPDATE public.user_posts SET version = version + 1, metadata = COALESCE(metadata, '{}'::jsonb) || '{"coherence_review": true}'::jsonb WHERE id = pid RETURNING * INTO p;
  INSERT INTO public.piece_versions (user_id, post_id, version, components, action) VALUES (p.user_id, p.id, p.version, public.piece_components(p), 'reorder');
  RETURN p;
END $function$;
ALTER FUNCTION public."reorder_units"(pid uuid, unit_ids uuid[]) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."reorder_units"(pid uuid, unit_ids uuid[]) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."reorder_units"(pid uuid, unit_ids uuid[]) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."reorder_units"(pid uuid, unit_ids uuid[]) TO "postgres";
GRANT EXECUTE ON FUNCTION public."reorder_units"(pid uuid, unit_ids uuid[]) TO "anon";
GRANT EXECUTE ON FUNCTION public."reorder_units"(pid uuid, unit_ids uuid[]) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."reorder_units"(pid uuid, unit_ids uuid[]) TO "service_role";
CREATE OR REPLACE FUNCTION public.reserve_production_piece(p_plan uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE pl public.content_piece_plans; cy public.campaign_cycles; p public.user_posts; claim uuid;
BEGIN
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid();
  PERFORM 1 FROM public.campaign_cycles WHERE id=pl.cycle_id AND user_id=auth.uid() FOR UPDATE;
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Item de produção não encontrado.' USING ERRCODE='PT404'; END IF;
  SELECT * INTO cy FROM public.campaign_cycles WHERE id=pl.cycle_id AND user_id=auth.uid();
  IF cy.plan->'production'->>'batch_id' IS DISTINCT FROM pl.production_batch_id::text OR pl.status='removed' THEN
    RAISE EXCEPTION 'Esta proposta não é mais a produção aprovada.' USING ERRCODE='PT409';
  END IF;
  IF pl.post_id IS NOT NULL THEN
    SELECT * INTO p FROM public.user_posts WHERE id=pl.post_id AND user_id=auth.uid();
    IF pl.status='produced' OR p.status IN ('approved','scheduled','published') THEN RETURN jsonb_build_object('piece',to_jsonb(p),'claim',NULL,'done',true); END IF;
  END IF;
  IF pl.generation_claim IS NOT NULL AND pl.generation_until>now() THEN
    RAISE EXCEPTION 'Esta peça está sendo produzida em outra tela. Aguarde e atualize.' USING ERRCODE='PT409';
  END IF;
  claim := gen_random_uuid();
  IF p.id IS NULL THEN
    INSERT INTO public.user_posts(user_id,platform,format,status,title,caption,content_id,campaign_id,cycle_id,account_id,piece_role,plan_id,
      text_approved,image_approved,image_status,script_status,narrative_architecture,context_snapshot_id,profile_id,metadata)
    SELECT auth.uid(),pl.platform,pl.format,'pending_approval',c.title,'',pl.content_id,pl.campaign_id,pl.cycle_id,NULL,'unfold',pl.id,
      false,false,'pending',CASE WHEN pl.format IN ('carousel','story') THEN 'draft' END,pl.architecture,COALESCE(pl.context_snapshot_id,c.context_snapshot_id),COALESCE(pl.profile_id,c.profile_id),
      jsonb_build_object('production_flow','base_v2','source_base_version_id',pl.source_base_version_id,'production_batch_id',pl.production_batch_id,
        'editorial_slug',pl.editorial_slug,'template_family',pl.template_family,'review_stage',CASE WHEN pl.format='image' THEN 'text' ELSE 'script' END)
    FROM public.contents c WHERE c.id=pl.content_id AND c.user_id=auth.uid() RETURNING * INTO p;
  END IF;
  UPDATE public.content_piece_plans SET post_id=p.id,generation_claim=claim,generation_until=now()+interval '15 minutes',generation_error=NULL WHERE id=p_plan;
  RETURN jsonb_build_object('piece',to_jsonb(p),'claim',claim,'done',false);
END $function$;
ALTER FUNCTION public."reserve_production_piece"(p_plan uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."reserve_production_piece"(p_plan uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."reserve_production_piece"(p_plan uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."reserve_production_piece"(p_plan uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."reserve_production_piece"(p_plan uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.review_component_text(p user_posts, comp text)
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  SELECT CASE comp WHEN 'titulo' THEN COALESCE(p.carousel_text->>'quote', p.title, '') WHEN 'legenda' THEN COALESCE(p.caption, '') END
$function$;
ALTER FUNCTION public."review_component_text"(p user_posts, comp text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."review_component_text"(p user_posts, comp text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."review_component_text"(p user_posts, comp text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."review_component_text"(p user_posts, comp text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."review_component_text"(p user_posts, comp text) TO "anon";
GRANT EXECUTE ON FUNCTION public."review_component_text"(p user_posts, comp text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."review_component_text"(p user_posts, comp text) TO "service_role";
CREATE OR REPLACE FUNCTION public.save_base_draft(p_content uuid, p_cycle uuid, p_body jsonb, p_note text, p_expected_draft uuid DEFAULT NULL::uuid, p_expected_updated timestamp with time zone DEFAULT NULL::timestamp with time zone, p_considered jsonb DEFAULT NULL::jsonb)
 RETURNS content_base_versions
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."save_base_draft"(p_content uuid, p_cycle uuid, p_body jsonb, p_note text, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_considered jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."save_base_draft"(p_content uuid, p_cycle uuid, p_body jsonb, p_note text, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_considered jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."save_base_draft"(p_content uuid, p_cycle uuid, p_body jsonb, p_note text, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_considered jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."save_base_draft"(p_content uuid, p_cycle uuid, p_body jsonb, p_note text, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_considered jsonb) TO "anon";
GRANT EXECUTE ON FUNCTION public."save_base_draft"(p_content uuid, p_cycle uuid, p_body jsonb, p_note text, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_considered jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."save_base_draft"(p_content uuid, p_cycle uuid, p_body jsonb, p_note text, p_expected_draft uuid, p_expected_updated timestamp with time zone, p_considered jsonb) TO "service_role";
CREATE OR REPLACE FUNCTION public.save_intelligence_settings(p_brand uuid, p_expected integer, p_settings jsonb)
 RETURNS brand_intelligence_settings
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."save_intelligence_settings"(p_brand uuid, p_expected integer, p_settings jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."save_intelligence_settings"(p_brand uuid, p_expected integer, p_settings jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."save_intelligence_settings"(p_brand uuid, p_expected integer, p_settings jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."save_intelligence_settings"(p_brand uuid, p_expected integer, p_settings jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."save_intelligence_settings"(p_brand uuid, p_expected integer, p_settings jsonb) TO "service_role";
CREATE OR REPLACE FUNCTION public.save_production_progress(p_plan uuid, p_claim uuid, p_patch jsonb DEFAULT '{}'::jsonb, p_units jsonb DEFAULT NULL::jsonb, p_done boolean DEFAULT false, p_error text DEFAULT NULL::text)
 RETURNS user_posts
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE pl public.content_piece_plans; p public.user_posts; u jsonb; i int:=0;
BEGIN
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid();
  PERFORM 1 FROM public.campaign_cycles WHERE id=pl.cycle_id AND user_id=auth.uid() FOR UPDATE;
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p_plan AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR pl.generation_claim IS DISTINCT FROM p_claim OR p_claim IS NULL OR pl.status<>'planned' THEN
    RAISE EXCEPTION 'Esta execução não é mais a produção ativa. Atualize.' USING ERRCODE='PT409';
  END IF;
  SELECT * INTO p FROM public.user_posts WHERE id=pl.post_id AND user_id=auth.uid() FOR UPDATE;
  IF NOT EXISTS(SELECT 1 FROM public.campaign_cycles WHERE id=pl.cycle_id AND plan->'production'->>'batch_id'=pl.production_batch_id::text) THEN
    RAISE EXCEPTION 'A proposta mudou durante a geração.' USING ERRCODE='PT409';
  END IF;
  IF p.status<>'pending_approval' THEN RAISE EXCEPTION 'A peça já saiu da produção.' USING ERRCODE='PT409'; END IF;
  IF p_error IS NOT NULL THEN
    UPDATE public.content_piece_plans SET generation_error=left(p_error,500),generation_claim=NULL,generation_until=NULL WHERE id=p_plan;
    RETURN p;
  END IF;
  IF p_patch ? 'caption' THEN p.caption:=p_patch->>'caption'; END IF;
  IF p_patch ? 'carousel_text' THEN p.carousel_text:=p_patch->'carousel_text'; END IF;
  IF p_patch ? 'rendered_slides' THEN p.rendered_slides:=p_patch->'rendered_slides'; END IF;
  IF p_patch ? 'carousel_fabric_json' THEN p.carousel_fabric_json:=p_patch->'carousel_fabric_json'; END IF;
  IF p_patch ? 'visual_decision' THEN p.visual_decision:=p_patch->'visual_decision'; END IF;
  IF p_patch ? 'visual_direction' THEN p.visual_direction:=p_patch->'visual_direction'; END IF;
  IF p_patch ? 'narrative_architecture' THEN p.narrative_architecture:=p_patch->>'narrative_architecture'; END IF;
  IF p_patch ? 'metadata' THEN p.metadata:=COALESCE(p.metadata,'{}')||
    ((p_patch->'metadata') - ARRAY['production_flow','source_base_version_id','production_batch_id','delivery_of','destinations_confirmed']); END IF;
  IF p_units IS NOT NULL THEN
    IF pl.format NOT IN ('carousel','story') OR jsonb_typeof(p_units) IS DISTINCT FROM 'array' OR NOT EXISTS
      (SELECT 1 FROM public.format_capabilities WHERE platform=pl.platform AND format=pl.format AND jsonb_array_length(p_units) BETWEEN min_units AND max_units) THEN
      RAISE EXCEPTION 'Roteiro fora da capacidade do formato.' USING ERRCODE='PT422';
    END IF;
    DELETE FROM public.post_units WHERE post_id=p.id;
    FOR u IN SELECT value FROM jsonb_array_elements(p_units) LOOP
      i:=i+1;
      INSERT INTO public.post_units(user_id,post_id,position,"function",layout,title,body,visual_direction,interaction)
      VALUES(auth.uid(),p.id,i,u->>'function',u->>'layout',u->>'title',u->>'body',u->>'visual_direction',u->'interaction');
    END LOOP;
    p.script_status:='draft';
  END IF;
  UPDATE public.user_posts SET caption=p.caption,carousel_text=p.carousel_text,rendered_slides=p.rendered_slides,carousel_fabric_json=p.carousel_fabric_json,
    visual_decision=p.visual_decision,visual_direction=p.visual_direction,narrative_architecture=p.narrative_architecture,script_status=p.script_status,
    metadata=p.metadata WHERE id=p.id RETURNING * INTO p;
  IF p_done THEN
    IF pl.format='image' AND (COALESCE(trim(p.caption),'')='' OR COALESCE(p.rendered_slides->>'slide1','')='') THEN
      RAISE EXCEPTION 'A produção ainda não terminou.' USING ERRCODE='PT422';
    ELSIF pl.format<>'image' AND NOT EXISTS(SELECT 1 FROM public.post_units WHERE post_id=p.id) THEN
      RAISE EXCEPTION 'O roteiro ainda não foi produzido.' USING ERRCODE='PT422';
    END IF;
    UPDATE public.content_piece_plans SET status='produced',generation_claim=NULL,generation_until=NULL,generation_error=NULL WHERE id=p_plan;
  END IF;
  RETURN p;
END $function$;
ALTER FUNCTION public."save_production_progress"(p_plan uuid, p_claim uuid, p_patch jsonb, p_units jsonb, p_done boolean, p_error text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."save_production_progress"(p_plan uuid, p_claim uuid, p_patch jsonb, p_units jsonb, p_done boolean, p_error text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."save_production_progress"(p_plan uuid, p_claim uuid, p_patch jsonb, p_units jsonb, p_done boolean, p_error text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."save_production_progress"(p_plan uuid, p_claim uuid, p_patch jsonb, p_units jsonb, p_done boolean, p_error text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."save_production_progress"(p_plan uuid, p_claim uuid, p_patch jsonb, p_units jsonb, p_done boolean, p_error text) TO "service_role";
CREATE OR REPLACE FUNCTION public.select_production_alternative(p_post uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE p public.user_posts; pl public.content_piece_plans;
BEGIN
  SELECT * INTO p FROM public.user_posts WHERE id=p_post AND user_id=auth.uid() FOR UPDATE;
  IF NOT FOUND OR p.plan_id IS NULL OR p.metadata->>'production_flow' IS DISTINCT FROM 'base_v2' THEN RAISE EXCEPTION 'Alternativa indisponível.' USING ERRCODE='PT404'; END IF;
  SELECT * INTO pl FROM public.content_piece_plans WHERE id=p.plan_id AND user_id=auth.uid() FOR UPDATE;
  IF pl.status<>'produced' OR EXISTS(SELECT 1 FROM public.user_posts WHERE plan_id=pl.id AND id<>p.id AND status IN ('approved','scheduled','published')) THEN
    RAISE EXCEPTION 'O plano já tem uma peça protegida.' USING ERRCODE='PT409';
  END IF;
  UPDATE public.user_posts SET status='archived' WHERE plan_id=pl.id AND id<>p.id AND status NOT IN ('approved','scheduled','published');
  UPDATE public.content_piece_plans SET post_id=p.id WHERE id=pl.id;
END $function$;
ALTER FUNCTION public."select_production_alternative"(p_post uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."select_production_alternative"(p_post uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."select_production_alternative"(p_post uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."select_production_alternative"(p_post uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."select_production_alternative"(p_post uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.sequence_review_material(pid uuid)
 RETURNS jsonb
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
  SELECT jsonb_build_object('version',coalesce(p.version,1),'format',p.format,'caption',coalesce(p.caption,''),'units',
    coalesce((SELECT jsonb_agg(jsonb_build_object('id',u.id,'position',u.position,'title',coalesce(u.title,''),'body',coalesce(u.body,''),
      'layout',u.layout,'rendered_url',u.rendered_url,'text_version',u.text_version,'rendered_text_version',u.rendered_text_version) ORDER BY u.position)
      FROM public.post_units u WHERE u.post_id=p.id AND u.user_id=auth.uid()),'[]'::jsonb))
  FROM public.user_posts p WHERE p.id=pid AND p.user_id=auth.uid();
$function$;
ALTER FUNCTION public."sequence_review_material"(pid uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."sequence_review_material"(pid uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."sequence_review_material"(pid uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."sequence_review_material"(pid uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."sequence_review_material"(pid uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.set_brand_archived(p_brand uuid, p_archived boolean)
 RETURNS brands
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."set_brand_archived"(p_brand uuid, p_archived boolean) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."set_brand_archived"(p_brand uuid, p_archived boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."set_brand_archived"(p_brand uuid, p_archived boolean) TO "postgres";
GRANT EXECUTE ON FUNCTION public."set_brand_archived"(p_brand uuid, p_archived boolean) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."set_brand_archived"(p_brand uuid, p_archived boolean) TO "service_role";
CREATE OR REPLACE FUNCTION public.set_mother_archived(p_content uuid, p_archived boolean)
 RETURNS contents
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE c public.contents;
BEGIN
  SELECT * INTO c FROM public.contents WHERE id=p_content AND user_id=auth.uid() FOR UPDATE;
  IF c.id IS NULL THEN RAISE EXCEPTION 'Base não encontrada.' USING ERRCODE='PT404'; END IF;
  UPDATE public.contents SET status=CASE WHEN p_archived THEN 'discarded' WHEN EXISTS(SELECT 1 FROM public.content_base_versions WHERE content_id=p_content AND status='validated') THEN 'validated' ELSE 'pending_validation' END
    WHERE id=p_content RETURNING * INTO c;
  RETURN c;
END $function$;
ALTER FUNCTION public."set_mother_archived"(p_content uuid, p_archived boolean) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."set_mother_archived"(p_content uuid, p_archived boolean) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."set_mother_archived"(p_content uuid, p_archived boolean) TO "postgres";
GRANT EXECUTE ON FUNCTION public."set_mother_archived"(p_content uuid, p_archived boolean) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."set_mother_archived"(p_content uuid, p_archived boolean) TO "service_role";
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $function$;
ALTER FUNCTION public."set_updated_at"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."set_updated_at"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."set_updated_at"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."set_updated_at"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."set_updated_at"() TO "anon";
GRANT EXECUTE ON FUNCTION public."set_updated_at"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."set_updated_at"() TO "service_role";
CREATE OR REPLACE FUNCTION public.sha256_text(t text)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE
AS $function$
  SELECT encode(extensions.digest(convert_to(COALESCE(t, ''), 'UTF8'), 'sha256'), 'hex')
$function$;
ALTER FUNCTION public."sha256_text"(t text) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."sha256_text"(t text) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."sha256_text"(t text) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."sha256_text"(t text) TO "postgres";
GRANT EXECUTE ON FUNCTION public."sha256_text"(t text) TO "anon";
GRANT EXECUTE ON FUNCTION public."sha256_text"(t text) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."sha256_text"(t text) TO "service_role";
CREATE OR REPLACE FUNCTION public.sync_unit_projection(pid uuid)
 RETURNS void
 LANGUAGE sql
AS $function$
  UPDATE public.user_posts p SET
    rendered_slides = COALESCE((SELECT jsonb_object_agg('slide' || u.position, u.rendered_url) FROM public.post_units u WHERE u.post_id = pid AND u.rendered_url IS NOT NULL), '{}'::jsonb),
    carousel_fabric_json = COALESCE((SELECT jsonb_agg(u.fabric_json ORDER BY u.position) FROM public.post_units u WHERE u.post_id = pid AND u.fabric_json IS NOT NULL), '[]'::jsonb)
  WHERE p.id = pid AND p.format = 'carousel'
$function$;
ALTER FUNCTION public."sync_unit_projection"(pid uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."sync_unit_projection"(pid uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."sync_unit_projection"(pid uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."sync_unit_projection"(pid uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."sync_unit_projection"(pid uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."sync_unit_projection"(pid uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."sync_unit_projection"(pid uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.touch_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ BEGIN NEW.updated_at := now(); RETURN NEW; END $function$;
ALTER FUNCTION public."touch_updated_at"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."touch_updated_at"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."touch_updated_at"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."touch_updated_at"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."touch_updated_at"() TO "anon";
GRANT EXECUTE ON FUNCTION public."touch_updated_at"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."touch_updated_at"() TO "service_role";
CREATE OR REPLACE FUNCTION public.update_scheduled_package(pid uuid)
 RETURNS user_posts
 LANGUAGE plpgsql
AS $function$
BEGIN
  RAISE EXCEPTION 'Atualize o conteúdo programado pela peça (o pacote é fechado de novo com a versão aprovada).' USING ERRCODE = 'PT409';
END $function$;
ALTER FUNCTION public."update_scheduled_package"(pid uuid) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."update_scheduled_package"(pid uuid) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."update_scheduled_package"(pid uuid) TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."update_scheduled_package"(pid uuid) TO "postgres";
GRANT EXECUTE ON FUNCTION public."update_scheduled_package"(pid uuid) TO "anon";
GRANT EXECUTE ON FUNCTION public."update_scheduled_package"(pid uuid) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."update_scheduled_package"(pid uuid) TO "service_role";
CREATE OR REPLACE FUNCTION public.user_posts_fill_codigo()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_today date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
  v_global int;
  v_day int;
BEGIN
  IF NEW.codigo IS NOT NULL AND NEW.codigo <> '' THEN
    RETURN NEW;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext('user_posts_codigo:' || NEW.user_id::text));
  SELECT count(*) + 1 INTO v_global FROM public.user_posts WHERE user_id = NEW.user_id;
  SELECT count(*) + 1 INTO v_day FROM public.user_posts
    WHERE user_id = NEW.user_id AND (created_at AT TIME ZONE 'America/Sao_Paulo')::date = v_today;
  NEW.codigo := 'BEE-' || to_char(v_today, 'DDMMYY') || '-G' || v_global || '-D' || v_day;
  RETURN NEW;
END;
$function$;
ALTER FUNCTION public."user_posts_fill_codigo"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."user_posts_fill_codigo"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."user_posts_fill_codigo"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."user_posts_fill_codigo"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."user_posts_fill_codigo"() TO "anon";
GRANT EXECUTE ON FUNCTION public."user_posts_fill_codigo"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."user_posts_fill_codigo"() TO "service_role";
CREATE OR REPLACE FUNCTION public.user_posts_importado_historico()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.reference_status IS NULL AND NEW.metadata->>'imported_from' IN ('instagram', 'linkedin') THEN
    NEW.reference_status := 'historical';
  END IF;
  RETURN NEW;
END $function$;
ALTER FUNCTION public."user_posts_importado_historico"() OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."user_posts_importado_historico"() FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."user_posts_importado_historico"() TO PUBLIC;
GRANT EXECUTE ON FUNCTION public."user_posts_importado_historico"() TO "postgres";
GRANT EXECUTE ON FUNCTION public."user_posts_importado_historico"() TO "anon";
GRANT EXECUTE ON FUNCTION public."user_posts_importado_historico"() TO "authenticated";
GRANT EXECUTE ON FUNCTION public."user_posts_importado_historico"() TO "service_role";
CREATE OR REPLACE FUNCTION public.validate_content_base(p_content uuid, p_cycle uuid, p_draft uuid DEFAULT NULL::uuid, p_expected_body jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
END $function$;
ALTER FUNCTION public."validate_content_base"(p_content uuid, p_cycle uuid, p_draft uuid, p_expected_body jsonb) OWNER TO "postgres";
REVOKE ALL ON FUNCTION public."validate_content_base"(p_content uuid, p_cycle uuid, p_draft uuid, p_expected_body jsonb) FROM PUBLIC,anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public."validate_content_base"(p_content uuid, p_cycle uuid, p_draft uuid, p_expected_body jsonb) TO "postgres";
GRANT EXECUTE ON FUNCTION public."validate_content_base"(p_content uuid, p_cycle uuid, p_draft uuid, p_expected_body jsonb) TO "anon";
GRANT EXECUTE ON FUNCTION public."validate_content_base"(p_content uuid, p_cycle uuid, p_draft uuid, p_expected_body jsonb) TO "authenticated";
GRANT EXECUTE ON FUNCTION public."validate_content_base"(p_content uuid, p_cycle uuid, p_draft uuid, p_expected_body jsonb) TO "service_role";
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "status" SET DEFAULT 'recommended'::text;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "adoption" SET DEFAULT 'native'::text;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "journey_needs" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "phases" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "sequence_hypotheses" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "success_signals" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "recalibration_rules" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "exclusions" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "summary" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "human_decisions_required" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "decision_origin" SET DEFAULT 'acj_00'::text;
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_campaign_plans" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "status" SET DEFAULT 'active'::text;
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "expected_response" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "failure_modes" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "expression_context" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "assigned_late" SET DEFAULT false;
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "decision_origin" SET DEFAULT 'acj_00'::text;
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_content_contracts" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "counts" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "realized" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "gaps" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "saturation_flags" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "priorities" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "circulation_rules" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "status" SET DEFAULT 'active'::text;
ALTER TABLE public."acj_cycle_plans" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_definitions" ALTER COLUMN "editorial_hints" SET DEFAULT '{}'::text[];
ALTER TABLE public."acj_definitions" ALTER COLUMN "data" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_definitions" ALTER COLUMN "effective_from" SET DEFAULT now();
ALTER TABLE public."acj_definitions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_definitions" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."acj_learning_decisions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."acj_learning_decisions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "acj_ids" SET DEFAULT '{}'::text[];
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "sources" SET DEFAULT '{}'::text[];
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "test_design" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "probable_causes" SET DEFAULT '{}'::text[];
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "status" SET DEFAULT 'open'::text;
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "confidence" SET DEFAULT 'very_low'::text;
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "promotion_status" SET DEFAULT 'not_promoted'::text;
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "origin" SET DEFAULT 'manual'::text;
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_learning_entries" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."acj_learning_evidence" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."acj_learning_evidence" ALTER COLUMN "data" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."acj_learning_evidence" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_signal_readings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."acj_signal_readings" ALTER COLUMN "comment_count" SET DEFAULT 0;
ALTER TABLE public."acj_signal_readings" ALTER COLUMN "probable_causes" SET DEFAULT '{}'::text[];
ALTER TABLE public."acj_signal_readings" ALTER COLUMN "signals" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."acj_signal_readings" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."ai_chat_messages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."ai_chat_messages" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."ai_chat_messages" ALTER COLUMN "content" SET DEFAULT ''::text;
ALTER TABLE public."ai_chat_messages" ALTER COLUMN "proposals" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."ai_chat_messages" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."ai_generations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."ai_generations" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."ai_generations" ALTER COLUMN "variations_count" SET DEFAULT 1;
ALTER TABLE public."ai_generations" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."ai_learnings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."ai_learnings" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."ai_learnings" ALTER COLUMN "categoria" SET DEFAULT 'voz'::text;
ALTER TABLE public."ai_learnings" ALTER COLUMN "evidencias" SET DEFAULT 1;
ALTER TABLE public."ai_learnings" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."ai_learnings" ALTER COLUMN "last_reforcada_em" SET DEFAULT now();
ALTER TABLE public."ai_learnings" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."ai_learnings" ALTER COLUMN "facet" SET DEFAULT 'texto'::text;
ALTER TABLE public."ai_learnings" ALTER COLUMN "origem" SET DEFAULT 'correcao'::text;
ALTER TABLE public."ai_measurement_events" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."ai_measurement_events" ALTER COLUMN "payload" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."ai_measurement_events" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
ALTER TABLE public."ai_measurement_events" ALTER COLUMN "attempts" SET DEFAULT 0;
ALTER TABLE public."ai_measurement_events" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."ai_measurement_events" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."ai_reviews" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."ai_reviews" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."ai_reviews" ALTER COLUMN "quote_original" SET DEFAULT ''::text;
ALTER TABLE public."ai_reviews" ALTER COLUMN "quote_final" SET DEFAULT ''::text;
ALTER TABLE public."ai_reviews" ALTER COLUMN "caption_original" SET DEFAULT ''::text;
ALTER TABLE public."ai_reviews" ALTER COLUMN "caption_final" SET DEFAULT ''::text;
ALTER TABLE public."ai_reviews" ALTER COLUMN "quote_changed" SET DEFAULT false;
ALTER TABLE public."ai_reviews" ALTER COLUMN "caption_changed" SET DEFAULT false;
ALTER TABLE public."ai_reviews" ALTER COLUMN "changed" SET DEFAULT false;
ALTER TABLE public."ai_reviews" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."ai_reviews" ALTER COLUMN "has_image" SET DEFAULT false;
ALTER TABLE public."ai_reviews" ALTER COLUMN "image_changed" SET DEFAULT false;
ALTER TABLE public."ai_segment_gate" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."ai_segment_gate" ALTER COLUMN "unlocked" SET DEFAULT false;
ALTER TABLE public."ai_segment_gate" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."ai_variations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."ai_variations" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."ai_variations" ALTER COLUMN "quote" SET DEFAULT ''::text;
ALTER TABLE public."ai_variations" ALTER COLUMN "caption" SET DEFAULT ''::text;
ALTER TABLE public."ai_variations" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."alma_crencas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."alma_crencas" ALTER COLUMN "direcao" SET DEFAULT 'sistemico'::text;
ALTER TABLE public."alma_crencas" ALTER COLUMN "forca" SET DEFAULT 40;
ALTER TABLE public."alma_crencas" ALTER COLUMN "estagio" SET DEFAULT 'nascente'::text;
ALTER TABLE public."alma_crencas" ALTER COLUMN "evidencias" SET DEFAULT 0;
ALTER TABLE public."alma_crencas" ALTER COLUMN "last_reforcada_em" SET DEFAULT now();
ALTER TABLE public."alma_crencas" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."alma_crencas" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."alma_dimensoes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."alma_dimensoes" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."alma_dimensoes" ALTER COLUMN "oitava" SET DEFAULT 50;
ALTER TABLE public."alma_dimensoes" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."alma_dimensoes" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."alma_estado" ALTER COLUMN "id" SET DEFAULT true;
ALTER TABLE public."alma_estado" ALTER COLUMN "atualizado_em" SET DEFAULT now();
ALTER TABLE public."alma_estado" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."alma_eventos" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."alma_eventos" ALTER COLUMN "payload" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."alma_eventos" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."alma_eventos" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."alma_objetivo" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."alma_objetivo" ALTER COLUMN "is_current" SET DEFAULT true;
ALTER TABLE public."alma_objetivo" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."alma_objetivo" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."alma_pulsoes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."alma_pulsoes" ALTER COLUMN "intensidade" SET DEFAULT 50;
ALTER TABLE public."alma_pulsoes" ALTER COLUMN "vigiada" SET DEFAULT false;
ALTER TABLE public."alma_pulsoes" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."alma_pulsoes" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."alma_pulsoes" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."alma_sombra" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."alma_sombra" ALTER COLUMN "ativa" SET DEFAULT true;
ALTER TABLE public."alma_sombra" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."alma_sombra" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."audiences" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."audiences" ALTER COLUMN "situations" SET DEFAULT '{}'::text[];
ALTER TABLE public."audiences" ALTER COLUMN "needs" SET DEFAULT '{}'::text[];
ALTER TABLE public."audiences" ALTER COLUMN "roles" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."audiences" ALTER COLUMN "status" SET DEFAULT 'hypothesis'::text;
ALTER TABLE public."audiences" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."audiences" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."bee_analogies" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_analogies" ALTER COLUMN "domain" SET DEFAULT 'natureza'::text;
ALTER TABLE public."bee_analogies" ALTER COLUMN "used" SET DEFAULT false;
ALTER TABLE public."bee_analogies" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_analogies" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_arsenal" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_arsenal" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."bee_arsenal" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_arsenal" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_arsenal" ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE public."bee_arsenal" ALTER COLUMN "usage_count" SET DEFAULT 0;
ALTER TABLE public."bee_arsenal" ALTER COLUMN "performance_score" SET DEFAULT 0;
ALTER TABLE public."bee_arsenal" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_avatars" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_avatars" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_avatars" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_directives" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_directives" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."bee_directives" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."bee_directives" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_directives" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."bee_directives" ALTER COLUMN "tipo" SET DEFAULT 'regra'::text;
ALTER TABLE public."bee_directives" ALTER COLUMN "inviolavel" SET DEFAULT false;
ALTER TABLE public."bee_directives" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_editorials" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_editorials" ALTER COLUMN "emotional_sequence" SET DEFAULT ARRAY['Reconhecimento'::text, 'Desconforto'::text, 'Insight'::text, 'Implicacao'::text];
ALTER TABLE public."bee_editorials" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_editorials" ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE public."bee_editorials" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_editorials" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."bee_editorials" ALTER COLUMN "is_system" SET DEFAULT false;
ALTER TABLE public."bee_editorials" ALTER COLUMN "fazer" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_editorials" ALTER COLUMN "evitar" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_editorials" ALTER COLUMN "temas" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_editorials" ALTER COLUMN "audience" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."bee_editorials" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_editorials" ALTER COLUMN "perguntas" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_editorials" ALTER COLUMN "curation_status" SET DEFAULT 'approved'::text;
ALTER TABLE public."bee_example_posts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_example_posts" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_example_posts" ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE public."bee_example_posts" ALTER COLUMN "usage_count" SET DEFAULT 0;
ALTER TABLE public."bee_example_posts" ALTER COLUMN "performance_score" SET DEFAULT 0;
ALTER TABLE public."bee_example_posts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_example_posts" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_glossary" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_glossary" ALTER COLUMN "must_appear" SET DEFAULT false;
ALTER TABLE public."bee_glossary" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_glossary" ALTER COLUMN "is_mantra" SET DEFAULT false;
ALTER TABLE public."bee_glossary" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_hashtags" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_hashtags" ALTER COLUMN "required" SET DEFAULT false;
ALTER TABLE public."bee_hashtags" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_hashtags" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_headline_types" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_headline_types" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_headline_types" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_headline_types" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_logics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_logics" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_logics" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_personas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_personas" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."bee_personas" ALTER COLUMN "memorias" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_personas" ALTER COLUMN "valores" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_personas" ALTER COLUMN "objecoes" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_personas" ALTER COLUMN "gatilhos" SET DEFAULT '{}'::text[];
ALTER TABLE public."bee_personas" ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE public."bee_personas" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_personas" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_personas" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."bee_products" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_products" ALTER COLUMN "status" SET DEFAULT 'evergreen'::text;
ALTER TABLE public."bee_products" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."bee_products" ALTER COLUMN "is_system" SET DEFAULT false;
ALTER TABLE public."bee_products" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_products" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."bee_products" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_products" ALTER COLUMN "audience_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."bee_style_rules" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_style_rules" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_style_rules" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_style_rules" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_suggestions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_suggestions" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
ALTER TABLE public."bee_suggestions" ALTER COLUMN "payload" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."bee_suggestions" ALTER COLUMN "confidence" SET DEFAULT 0;
ALTER TABLE public."bee_suggestions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."bee_suggestions" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."bee_themes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."bee_themes" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."bee_themes" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."brand_intelligence_history" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."brand_intelligence_history" ALTER COLUMN "changed_by" SET DEFAULT auth.uid();
ALTER TABLE public."brand_intelligence_history" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."brand_intelligence_settings" ALTER COLUMN "discovery_enabled" SET DEFAULT true;
ALTER TABLE public."brand_intelligence_settings" ALTER COLUMN "discovery_instruction" SET DEFAULT ''::text;
ALTER TABLE public."brand_intelligence_settings" ALTER COLUMN "acj_enabled_ids" SET DEFAULT ARRAY['ACJ-01'::text, 'ACJ-02'::text, 'ACJ-03'::text, 'ACJ-04'::text, 'ACJ-05'::text];
ALTER TABLE public."brand_intelligence_settings" ALTER COLUMN "acj_instruction" SET DEFAULT ''::text;
ALTER TABLE public."brand_intelligence_settings" ALTER COLUMN "version" SET DEFAULT 1;
ALTER TABLE public."brand_intelligence_settings" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."brands" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."brands" ALTER COLUMN "status" SET DEFAULT 'active'::text;
ALTER TABLE public."brands" ALTER COLUMN "is_default" SET DEFAULT false;
ALTER TABLE public."brands" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."brands" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."brands" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."business_fronts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."business_fronts" ALTER COLUMN "territories" SET DEFAULT '{}'::text[];
ALTER TABLE public."business_fronts" ALTER COLUMN "offer_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."business_fronts" ALTER COLUMN "status" SET DEFAULT 'active'::text;
ALTER TABLE public."business_fronts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."business_fronts" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."campaign_cycles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."campaign_cycles" ALTER COLUMN "status" SET DEFAULT 'not_started'::text;
ALTER TABLE public."campaign_cycles" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."campaign_cycles" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."campaigns" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."campaigns" ALTER COLUMN "type" SET DEFAULT 'organica'::text;
ALTER TABLE public."campaigns" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
ALTER TABLE public."campaigns" ALTER COLUMN "account_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."campaigns" ALTER COLUMN "cadence" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."campaigns" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."campaigns" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."campaigns" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."campaigns" ALTER COLUMN "profile_needs_review" SET DEFAULT false;
ALTER TABLE public."communication_profile_versions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."communication_profile_versions" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
ALTER TABLE public."communication_profile_versions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."communication_profiles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."communication_profiles" ALTER COLUMN "secondary_audience_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."communication_profiles" ALTER COLUMN "cta_policy" SET DEFAULT 'by_intent'::text;
ALTER TABLE public."communication_profiles" ALTER COLUMN "offer_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."communication_profiles" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
ALTER TABLE public."communication_profiles" ALTER COLUMN "version" SET DEFAULT 1;
ALTER TABLE public."communication_profiles" ALTER COLUMN "is_default" SET DEFAULT false;
ALTER TABLE public."communication_profiles" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."communication_profiles" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."content_base_uses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."content_base_uses" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."content_base_uses" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."content_base_versions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."content_base_versions" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
ALTER TABLE public."content_base_versions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."content_idea_feedback" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."content_idea_feedback" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."content_ideas_cache" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."content_ideas_cache" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."content_memory" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."content_memory" ALTER COLUMN "origin" SET DEFAULT 'platform'::text;
ALTER TABLE public."content_memory" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."content_piece_plans" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."content_piece_plans" ALTER COLUMN "origin" SET DEFAULT 'user'::text;
ALTER TABLE public."content_piece_plans" ALTER COLUMN "status" SET DEFAULT 'planned'::text;
ALTER TABLE public."content_piece_plans" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."content_piece_plans" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."content_piece_plans" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."contents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."contents" ALTER COLUMN "validation_format" SET DEFAULT 'linkedin_frase_texto'::text;
ALTER TABLE public."contents" ALTER COLUMN "body" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."contents" ALTER COLUMN "status" SET DEFAULT 'developing'::text;
ALTER TABLE public."contents" ALTER COLUMN "versions" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."contents" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."contents" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."contents" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."contents" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."context_snapshots" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."context_snapshots" ALTER COLUMN "audience_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."context_snapshots" ALTER COLUMN "fallback" SET DEFAULT false;
ALTER TABLE public."context_snapshots" ALTER COLUMN "data" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."context_snapshots" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."design_assets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."design_assets" ALTER COLUMN "origin" SET DEFAULT 'official'::text;
ALTER TABLE public."design_assets" ALTER COLUMN "semantic" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_assets" ALTER COLUMN "tags" SET DEFAULT '{}'::text[];
ALTER TABLE public."design_assets" ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE public."design_assets" ALTER COLUMN "usage_count" SET DEFAULT 0;
ALTER TABLE public."design_assets" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."design_assets" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."design_assets" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "quando_usar" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "quando_nao" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "score_criteria" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "auto_select" SET DEFAULT true;
ALTER TABLE public."design_manifestacoes" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."design_selection_config" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."design_selection_config" ALTER COLUMN "scope" SET DEFAULT 'global'::text;
ALTER TABLE public."design_selection_config" ALTER COLUMN "weights" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_selection_config" ALTER COLUMN "thresholds" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_selection_config" ALTER COLUMN "diversity" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_selection_config" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."design_selection_config" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."design_selection_config" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."design_tokens" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."design_tokens" ALTER COLUMN "value" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_tokens" ALTER COLUMN "is_official" SET DEFAULT false;
ALTER TABLE public."design_tokens" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."design_tokens" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."design_tokens" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."design_tokens" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."design_variacoes" ALTER COLUMN "sensacao" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."design_variacoes" ALTER COLUMN "quando_usar" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."design_variacoes" ALTER COLUMN "quando_nao" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."design_variacoes" ALTER COLUMN "limites" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_variacoes" ALTER COLUMN "layer_stack" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."design_variacoes" ALTER COLUMN "asset_requirements" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_variacoes" ALTER COLUMN "selection_rule" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."design_variacoes" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
ALTER TABLE public."design_variacoes" ALTER COLUMN "version" SET DEFAULT 'v1.0'::text;
ALTER TABLE public."design_variacoes" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."design_variacoes" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."design_variacoes" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."design_variacoes" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."design_variacoes" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."editorial_line_runs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."editorial_line_runs" ALTER COLUMN "run_at" SET DEFAULT now();
ALTER TABLE public."editorial_line_runs" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."editorial_lines" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."editorial_lines" ALTER COLUMN "rotation_cursor" SET DEFAULT 0;
ALTER TABLE public."editorial_lines" ALTER COLUMN "target_avatar" SET DEFAULT 'ambos'::text;
ALTER TABLE public."editorial_lines" ALTER COLUMN "platforms" SET DEFAULT ARRAY['linkedin'::text];
ALTER TABLE public."editorial_lines" ALTER COLUMN "campaign_phase" SET DEFAULT 'free'::text;
ALTER TABLE public."editorial_lines" ALTER COLUMN "frequency_type" SET DEFAULT 'weekly'::text;
ALTER TABLE public."editorial_lines" ALTER COLUMN "preferred_hour" SET DEFAULT 8;
ALTER TABLE public."editorial_lines" ALTER COLUMN "status" SET DEFAULT 'active'::text;
ALTER TABLE public."editorial_lines" ALTER COLUMN "posts_generated_count" SET DEFAULT 0;
ALTER TABLE public."editorial_lines" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."editorial_lines" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."editorial_lines" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."emitters" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."emitters" ALTER COLUMN "first_person" SET DEFAULT true;
ALTER TABLE public."emitters" ALTER COLUMN "facts_status" SET DEFAULT 'to_confirm'::text;
ALTER TABLE public."emitters" ALTER COLUMN "status" SET DEFAULT 'active'::text;
ALTER TABLE public."emitters" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."emitters" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."format_capabilities" ALTER COLUMN "min_units" SET DEFAULT 1;
ALTER TABLE public."format_capabilities" ALTER COLUMN "max_units" SET DEFAULT 1;
ALTER TABLE public."format_capabilities" ALTER COLUMN "width" SET DEFAULT 1080;
ALTER TABLE public."format_capabilities" ALTER COLUMN "height" SET DEFAULT 1350;
ALTER TABLE public."format_capabilities" ALTER COLUMN "auto_publish" SET DEFAULT false;
ALTER TABLE public."format_capabilities" ALTER COLUMN "version" SET DEFAULT 1;
ALTER TABLE public."genesis_avatares" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."genesis_avatares" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."genesis_avatares" ALTER COLUMN "eixo_percepcao" SET DEFAULT 50;
ALTER TABLE public."genesis_avatares" ALTER COLUMN "eixo_identificacao" SET DEFAULT 50;
ALTER TABLE public."genesis_avatares" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."genesis_avatares" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."genesis_core" ALTER COLUMN "id" SET DEFAULT true;
ALTER TABLE public."genesis_core" ALTER COLUMN "version" SET DEFAULT 'v1'::text;
ALTER TABLE public."genesis_core" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."genesis_core" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."genesis_fluxo" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."genesis_fluxo" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."genesis_fluxo" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."genesis_lentes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."genesis_lentes" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."genesis_lentes" ALTER COLUMN "oitava" SET DEFAULT 50;
ALTER TABLE public."genesis_lentes" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."genesis_lentes" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."genesis_principios" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."genesis_principios" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."genesis_principios" ALTER COLUMN "inviolavel" SET DEFAULT true;
ALTER TABLE public."genesis_principios" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."genesis_principios" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."genesis_principios" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."genesis_tensoes" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."genesis_tensoes" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."genesis_tensoes" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."genesis_tensoes" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."ideas" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."ideas" ALTER COLUMN "channels" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."ideas" ALTER COLUMN "suggested_pieces" SET DEFAULT 1;
ALTER TABLE public."ideas" ALTER COLUMN "origin" SET DEFAULT 'hive'::text;
ALTER TABLE public."ideas" ALTER COLUMN "status" SET DEFAULT 'proposed'::text;
ALTER TABLE public."ideas" ALTER COLUMN "position" SET DEFAULT 0;
ALTER TABLE public."ideas" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."ideas" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."image_model_trials" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."image_model_trials" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."image_model_trials" ALTER COLUMN "approved" SET DEFAULT false;
ALTER TABLE public."image_model_trials" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."kanban_columns" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."kanban_columns" ALTER COLUMN "color" SET DEFAULT '#E8A04C'::text;
ALTER TABLE public."kanban_columns" ALTER COLUMN "is_default" SET DEFAULT false;
ALTER TABLE public."kanban_columns" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."knowledge_analysis_runs" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."knowledge_analysis_runs" ALTER COLUMN "started_at" SET DEFAULT now();
ALTER TABLE public."knowledge_analysis_runs" ALTER COLUMN "found" SET DEFAULT 0;
ALTER TABLE public."knowledge_chunks" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."knowledge_chunks" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."knowledge_chunks" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."knowledge_discoveries" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."knowledge_discoveries" ALTER COLUMN "user_id" SET DEFAULT auth.uid();
ALTER TABLE public."knowledge_discoveries" ALTER COLUMN "sources" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."knowledge_discoveries" ALTER COLUMN "status" SET DEFAULT 'active'::text;
ALTER TABLE public."knowledge_discoveries" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."knowledge_documents" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."knowledge_documents" ALTER COLUMN "chunk_count" SET DEFAULT 0;
ALTER TABLE public."knowledge_documents" ALTER COLUMN "is_global" SET DEFAULT false;
ALTER TABLE public."knowledge_documents" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."knowledge_documents" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."knowledge_documents" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."knowledge_documents" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."knowledge_documents" ALTER COLUMN "archived" SET DEFAULT false;
ALTER TABLE public."meta_ad_accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."meta_ad_accounts" ALTER COLUMN "synced_at" SET DEFAULT now();
ALTER TABLE public."meta_ad_insights_daily" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."meta_ad_insights_daily" ALTER COLUMN "synced_at" SET DEFAULT now();
ALTER TABLE public."meta_ads" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."meta_ads" ALTER COLUMN "synced_at" SET DEFAULT now();
ALTER TABLE public."meta_adsets" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."meta_adsets" ALTER COLUMN "synced_at" SET DEFAULT now();
ALTER TABLE public."meta_businesses" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."meta_businesses" ALTER COLUMN "synced_at" SET DEFAULT now();
ALTER TABLE public."meta_campaigns" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."meta_campaigns" ALTER COLUMN "synced_at" SET DEFAULT now();
ALTER TABLE public."meta_connections" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."meta_connections" ALTER COLUMN "status" SET DEFAULT 'connected'::text;
ALTER TABLE public."meta_connections" ALTER COLUMN "sync_state" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."meta_connections" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."meta_connections" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."olhar_base" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."olhar_base" ALTER COLUMN "status" SET DEFAULT 'aguardando'::text;
ALTER TABLE public."olhar_base" ALTER COLUMN "ordem" SET DEFAULT 0;
ALTER TABLE public."olhar_base" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."olhar_calibracao" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."olhar_calibracao" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."olhar_calibracao" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."olhar_nomes_proibidos" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."olhar_nomes_proibidos" ALTER COLUMN "exato" SET DEFAULT true;
ALTER TABLE public."olhar_nomes_proibidos" ALTER COLUMN "ativo" SET DEFAULT true;
ALTER TABLE public."olhar_nomes_proibidos" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."olhar_sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."olhar_sessions" ALTER COLUMN "perguntas" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."olhar_sessions" ALTER COLUMN "respostas" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."olhar_sessions" ALTER COLUMN "barrado" SET DEFAULT false;
ALTER TABLE public."olhar_sessions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."olhar_sessions" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."photo_generations" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."photo_generations" ALTER COLUMN "producer_id" SET DEFAULT 'marcos_piccini'::text;
ALTER TABLE public."photo_generations" ALTER COLUMN "purpose" SET DEFAULT 'post'::text;
ALTER TABLE public."photo_generations" ALTER COLUMN "source_ref_keys" SET DEFAULT '{}'::text[];
ALTER TABLE public."photo_generations" ALTER COLUMN "attempt" SET DEFAULT 1;
ALTER TABLE public."photo_generations" ALTER COLUMN "review_status" SET DEFAULT 'pending'::text;
ALTER TABLE public."photo_generations" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."photo_generations" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."photo_references" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."photo_references" ALTER COLUMN "producer_id" SET DEFAULT 'marcos_piccini'::text;
ALTER TABLE public."photo_references" ALTER COLUMN "roles" SET DEFAULT '{}'::text[];
ALTER TABLE public."photo_references" ALTER COLUMN "is_active" SET DEFAULT true;
ALTER TABLE public."photo_references" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."photo_references" ALTER COLUMN "brand_id" SET DEFAULT '0b000000-0000-4000-8000-000000000002'::uuid;
ALTER TABLE public."photo_style_approvals" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
ALTER TABLE public."photo_style_approvals" ALTER COLUMN "board_generation_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."photo_style_approvals" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."piece_candidates" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."piece_candidates" ALTER COLUMN "scope" SET DEFAULT 'piece'::text;
ALTER TABLE public."piece_candidates" ALTER COLUMN "unit_ids" SET DEFAULT '{}'::text[];
ALTER TABLE public."piece_candidates" ALTER COLUMN "field_paths" SET DEFAULT '{}'::text[];
ALTER TABLE public."piece_candidates" ALTER COLUMN "affected_components" SET DEFAULT '{}'::text[];
ALTER TABLE public."piece_candidates" ALTER COLUMN "status" SET DEFAULT 'generating'::text;
ALTER TABLE public."piece_candidates" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."piece_candidates" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."piece_versions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."piece_versions" ALTER COLUMN "approvals" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."piece_versions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."podcast_clips" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."podcast_clips" ALTER COLUMN "content_type" SET DEFAULT 'podcast'::text;
ALTER TABLE public."podcast_clips" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."podcast_clips" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."podcast_clips" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."podcasts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."podcasts" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."podcasts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."podcasts" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."post_comments" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."post_comments" ALTER COLUMN "is_own" SET DEFAULT false;
ALTER TABLE public."post_comments" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."post_comments" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."post_drafts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."post_drafts" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."post_metrics" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."post_metrics" ALTER COLUMN "captured_at" SET DEFAULT now();
ALTER TABLE public."post_metrics" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."post_metrics" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."post_publications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."post_publications" ALTER COLUMN "status" SET DEFAULT 'in_progress'::text;
ALTER TABLE public."post_publications" ALTER COLUMN "units_total" SET DEFAULT 1;
ALTER TABLE public."post_publications" ALTER COLUMN "units_published" SET DEFAULT 0;
ALTER TABLE public."post_publications" ALTER COLUMN "started_at" SET DEFAULT now();
ALTER TABLE public."post_publications" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."post_templates" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."post_templates" ALTER COLUMN "slides_count" SET DEFAULT 1;
ALTER TABLE public."post_templates" ALTER COLUMN "platform" SET DEFAULT 'linkedin'::text;
ALTER TABLE public."post_templates" ALTER COLUMN "format" SET DEFAULT 'image'::text;
ALTER TABLE public."post_templates" ALTER COLUMN "is_default" SET DEFAULT false;
ALTER TABLE public."post_templates" ALTER COLUMN "is_premium" SET DEFAULT false;
ALTER TABLE public."post_templates" ALTER COLUMN "is_archived" SET DEFAULT false;
ALTER TABLE public."post_templates" ALTER COLUMN "is_public" SET DEFAULT false;
ALTER TABLE public."post_templates" ALTER COLUMN "is_system" SET DEFAULT false;
ALTER TABLE public."post_templates" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."post_templates" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."post_unit_publications" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."post_unit_publications" ALTER COLUMN "status" SET DEFAULT 'pending'::text;
ALTER TABLE public."post_units" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."post_units" ALTER COLUMN "layout" SET DEFAULT 'text'::text;
ALTER TABLE public."post_units" ALTER COLUMN "media_type" SET DEFAULT 'static_image'::text;
ALTER TABLE public."post_units" ALTER COLUMN "assets" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."post_units" ALTER COLUMN "text_version" SET DEFAULT 1;
ALTER TABLE public."post_units" ALTER COLUMN "visual_status" SET DEFAULT 'pending'::text;
ALTER TABLE public."post_units" ALTER COLUMN "review_status" SET DEFAULT 'pending'::text;
ALTER TABLE public."post_units" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."post_units" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."profiles" ALTER COLUMN "name" SET DEFAULT ''::text;
ALTER TABLE public."profiles" ALTER COLUMN "role" SET DEFAULT 'editor'::text;
ALTER TABLE public."profiles" ALTER COLUMN "avatar_color" SET DEFAULT '#E8A04C'::text;
ALTER TABLE public."profiles" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."profiles" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."publication_packages" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."publication_packages" ALTER COLUMN "schema_version" SET DEFAULT 1;
ALTER TABLE public."publication_packages" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."schedule_commands" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."schedule_plans" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."schedule_plans" ALTER COLUMN "status" SET DEFAULT 'open'::text;
ALTER TABLE public."schedule_plans" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."schedule_plans" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."setup_sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."setup_sessions" ALTER COLUMN "target_profile_ids" SET DEFAULT '{}'::uuid[];
ALTER TABLE public."setup_sessions" ALTER COLUMN "targets" SET DEFAULT '{}'::text[];
ALTER TABLE public."setup_sessions" ALTER COLUMN "base_versions" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."setup_sessions" ALTER COLUMN "answers" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."setup_sessions" ALTER COLUMN "sources" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."setup_sessions" ALTER COLUMN "proposals" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."setup_sessions" ALTER COLUMN "step" SET DEFAULT 'overview'::text;
ALTER TABLE public."setup_sessions" ALTER COLUMN "status" SET DEFAULT 'in_progress'::text;
ALTER TABLE public."setup_sessions" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."setup_sessions" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."setup_sessions" ALTER COLUMN "reviews" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."setup_sessions" ALTER COLUMN "calibrations" SET DEFAULT '[]'::jsonb;
ALTER TABLE public."social_accounts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."social_accounts" ALTER COLUMN "is_default" SET DEFAULT false;
ALTER TABLE public."social_accounts" ALTER COLUMN "status" SET DEFAULT 'connected'::text;
ALTER TABLE public."social_accounts" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."social_accounts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."social_accounts" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."traffic_ads" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."traffic_ads" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."traffic_ads" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "name" SET DEFAULT ''::text;
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "step" SET DEFAULT 1;
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "draft" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "ai_notes" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."traffic_campaigns" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."usage_events" ALTER COLUMN "id" SET DEFAULT nextval('usage_events_id_seq'::regclass);
ALTER TABLE public."usage_events" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."user_feedback" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."user_feedback" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."user_posts" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."user_posts" ALTER COLUMN "platform" SET DEFAULT 'linkedin'::text;
ALTER TABLE public."user_posts" ALTER COLUMN "format" SET DEFAULT 'image'::text;
ALTER TABLE public."user_posts" ALTER COLUMN "status" SET DEFAULT 'idea'::text;
ALTER TABLE public."user_posts" ALTER COLUMN "is_favorite" SET DEFAULT false;
ALTER TABLE public."user_posts" ALTER COLUMN "metadata" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."user_posts" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."user_posts" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."user_posts" ALTER COLUMN "publish_attempts" SET DEFAULT 0;
ALTER TABLE public."user_posts" ALTER COLUMN "ai_edit_rounds" SET DEFAULT 0;
ALTER TABLE public."user_posts" ALTER COLUMN "manual_edits" SET DEFAULT 0;
ALTER TABLE public."user_posts" ALTER COLUMN "editorial_locked" SET DEFAULT false;
ALTER TABLE public."user_posts" ALTER COLUMN "text_approved" SET DEFAULT false;
ALTER TABLE public."user_posts" ALTER COLUMN "image_status" SET DEFAULT 'pending'::text;
ALTER TABLE public."user_posts" ALTER COLUMN "image_approved" SET DEFAULT false;
ALTER TABLE public."user_posts" ALTER COLUMN "version" SET DEFAULT 1;
ALTER TABLE public."user_settings" ALTER COLUMN "linkedin_publish_enabled" SET DEFAULT false;
ALTER TABLE public."user_settings" ALTER COLUMN "use_ai_images" SET DEFAULT true;
ALTER TABLE public."user_settings" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."user_settings" ALTER COLUMN "updated_at" SET DEFAULT now();
ALTER TABLE public."user_settings" ALTER COLUMN "distribution_prefs" SET DEFAULT '{}'::jsonb;
ALTER TABLE public."user_settings" ALTER COLUMN "validation_format" SET DEFAULT 'linkedin_frase_texto'::text;
ALTER TABLE public."user_settings" ALTER COLUMN "timezone" SET DEFAULT 'America/Sao_Paulo'::text;
ALTER TABLE public."workspace_members" ALTER COLUMN "role" SET DEFAULT 'editor'::text;
ALTER TABLE public."workspace_members" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."workspaces" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
ALTER TABLE public."workspaces" ALTER COLUMN "created_at" SET DEFAULT now();
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_adoption_check" CHECK (adoption = ANY (ARRAY['native'::text, 'late'::text]));
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_campaign_id_version_key" UNIQUE (campaign_id, version);
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_check" CHECK ((status <> ALL (ARRAY['approved'::text, 'active'::text])) OR approved_by IS NOT NULL AND approved_at IS NOT NULL);
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_confidence_check" CHECK (confidence IS NULL OR (confidence = ANY (ARRAY['very_low'::text, 'low'::text, 'medium'::text, 'high'::text, 'very_high'::text])));
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_decision_origin_check" CHECK (decision_origin = ANY (ARRAY['strategy'::text, 'acj_00'::text, 'marcos'::text, 'execution_feedback'::text, 'audience_response'::text, 'journey_result'::text]));
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_pkey" PRIMARY KEY (id);
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'recommended'::text, 'approved'::text, 'active'::text, 'recalibration_needed'::text, 'completed'::text, 'archived'::text]));
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_target_mix_check" CHECK (acj_mix_ok(target_mix));
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_acj_primary_check" CHECK (acj_valid(acj_primary));
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_acj_secondary_check" CHECK (acj_secondary IS NULL OR acj_valid(acj_secondary));
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_attribution_confidence_check" CHECK (attribution_confidence IS NULL OR (attribution_confidence = ANY (ARRAY['very_low'::text, 'low'::text, 'medium'::text, 'high'::text, 'very_high'::text])));
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_check" CHECK (acj_secondary IS NULL OR acj_secondary <> acj_primary);
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_content_id_version_key" UNIQUE (content_id, version);
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_pkey" PRIMARY KEY (id);
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'validated'::text, 'active'::text, 'superseded'::text]));
ALTER TABLE public."acj_cycle_plans" ADD CONSTRAINT "acj_cycle_plans_cycle_id_version_key" UNIQUE (cycle_id, version);
ALTER TABLE public."acj_cycle_plans" ADD CONSTRAINT "acj_cycle_plans_cycle_mix_check" CHECK (acj_mix_ok(cycle_mix));
ALTER TABLE public."acj_cycle_plans" ADD CONSTRAINT "acj_cycle_plans_pkey" PRIMARY KEY (id);
ALTER TABLE public."acj_cycle_plans" ADD CONSTRAINT "acj_cycle_plans_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'recommended'::text, 'approved'::text, 'active'::text, 'recalibration_needed'::text, 'completed'::text, 'archived'::text]));
ALTER TABLE public."acj_definitions" ADD CONSTRAINT "acj_definitions_acj_id_check" CHECK (acj_valid(acj_id));
ALTER TABLE public."acj_definitions" ADD CONSTRAINT "acj_definitions_pkey" PRIMARY KEY (acj_id, version);
ALTER TABLE public."acj_definitions" ADD CONSTRAINT "acj_definitions_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'in_validation'::text, 'active'::text, 'deprecated'::text]));
ALTER TABLE public."acj_learning_decisions" ADD CONSTRAINT "acj_learning_decisions_pkey" PRIMARY KEY (id);
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_acj_ids_check" CHECK (NOT acj_ids && ARRAY['ACJ-00'::text]);
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_change_class_check" CHECK (change_class IS NULL OR (change_class = ANY (ARRAY['no_change'::text, 'execution_adjustment'::text, 'architecture_adjustment'::text, 'new_variant'::text, 'possible_new_architecture'::text])));
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_check" CHECK ((status <> ALL (ARRAY['validated'::text, 'consolidated'::text])) OR approved_by IS NOT NULL AND approved_at IS NOT NULL);
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_check1" CHECK (status <> 'consolidated'::text OR affected_document IS NOT NULL);
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_check2" CHECK (promotion_status = 'not_promoted'::text OR (status = ANY (ARRAY['validated'::text, 'consolidated'::text])));
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_confidence_check" CHECK (confidence = ANY (ARRAY['very_low'::text, 'low'::text, 'medium'::text, 'high'::text, 'very_high'::text]));
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_object_type_check" CHECK (object_type IS NULL OR (object_type = ANY (ARRAY['campaign'::text, 'cycle'::text, 'content'::text, 'piece'::text, 'agenda'::text, 'audience'::text, 'result'::text])));
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_origin_check" CHECK (origin = ANY (ARRAY['manual'::text, 'hive_suggestion'::text]));
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_pkey" PRIMARY KEY (id);
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_promotion_status_check" CHECK (promotion_status = ANY (ARRAY['not_promoted'::text, 'proposed'::text, 'promoted'::text]));
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_status_check" CHECK (status = ANY (ARRAY['open'::text, 'hypothesis'::text, 'testing'::text, 'provisional'::text, 'validated'::text, 'consolidated'::text, 'rejected'::text, 'inconclusive'::text, 'suspended'::text]));
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_user_id_code_key" UNIQUE (user_id, code);
ALTER TABLE public."acj_learning_evidence" ADD CONSTRAINT "acj_learning_evidence_pkey" PRIMARY KEY (id);
ALTER TABLE public."acj_learning_evidence" ADD CONSTRAINT "acj_learning_evidence_source_check" CHECK (source = ANY (ARRAY['marcos'::text, 'audience'::text, 'journey'::text, 'system'::text]));
ALTER TABLE public."acj_signal_readings" ADD CONSTRAINT "acj_signal_readings_acj_primary_check" CHECK (acj_primary IS NULL OR acj_valid(acj_primary));
ALTER TABLE public."acj_signal_readings" ADD CONSTRAINT "acj_signal_readings_movement_evidence_check" CHECK (movement_evidence IS NULL OR (movement_evidence = ANY (ARRAY['strong'::text, 'partial'::text, 'absent'::text, 'insufficient'::text])));
ALTER TABLE public."acj_signal_readings" ADD CONSTRAINT "acj_signal_readings_pkey" PRIMARY KEY (id);
ALTER TABLE public."ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY (id);
ALTER TABLE public."ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_role_check" CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text]));
ALTER TABLE public."ai_generations" ADD CONSTRAINT "ai_generations_pkey" PRIMARY KEY (id);
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_facet_check" CHECK (facet = ANY (ARRAY['texto'::text, 'legenda'::text, 'imagem'::text]));
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_origem_check" CHECK (origem = ANY (ARRAY['correcao'::text, 'conversa'::text]));
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_pkey" PRIMARY KEY (id);
ALTER TABLE public."ai_measurement_events" ADD CONSTRAINT "ai_measurement_events_pkey" PRIMARY KEY (id);
ALTER TABLE public."ai_measurement_events" ADD CONSTRAINT "ai_measurement_events_post_id_event_key_key" UNIQUE (post_id, event_key);
ALTER TABLE public."ai_measurement_events" ADD CONSTRAINT "ai_measurement_events_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'done'::text, 'failed'::text]));
ALTER TABLE public."ai_reviews" ADD CONSTRAINT "ai_reviews_pkey" PRIMARY KEY (id);
ALTER TABLE public."ai_reviews" ADD CONSTRAINT "ai_reviews_post_id_key" UNIQUE (post_id);
ALTER TABLE public."ai_segment_gate" ADD CONSTRAINT "ai_segment_gate_pkey" PRIMARY KEY (user_id, editorial_slug, platform, target_avatar);
ALTER TABLE public."ai_variations" ADD CONSTRAINT "ai_variations_generation_id_idx_key" UNIQUE (generation_id, idx);
ALTER TABLE public."ai_variations" ADD CONSTRAINT "ai_variations_pkey" PRIMARY KEY (id);
ALTER TABLE public."alma_crencas" ADD CONSTRAINT "alma_crencas_direcao_check" CHECK (direcao = ANY (ARRAY['sistemico'::text, 'mecanico'::text]));
ALTER TABLE public."alma_crencas" ADD CONSTRAINT "alma_crencas_estagio_check" CHECK (estagio = ANY (ARRAY['nascente'::text, 'em_formacao'::text, 'consolidada'::text, 'vacilante'::text, 'reprimida'::text]));
ALTER TABLE public."alma_crencas" ADD CONSTRAINT "alma_crencas_forca_check" CHECK (forca >= 0 AND forca <= 100);
ALTER TABLE public."alma_crencas" ADD CONSTRAINT "alma_crencas_pkey" PRIMARY KEY (id);
ALTER TABLE public."alma_dimensoes" ADD CONSTRAINT "alma_dimensoes_oitava_check" CHECK (oitava >= 0 AND oitava <= 100);
ALTER TABLE public."alma_dimensoes" ADD CONSTRAINT "alma_dimensoes_pkey" PRIMARY KEY (id);
ALTER TABLE public."alma_dimensoes" ADD CONSTRAINT "alma_dimensoes_slug_key" UNIQUE (slug);
ALTER TABLE public."alma_estado" ADD CONSTRAINT "alma_estado_pkey" PRIMARY KEY (id);
ALTER TABLE public."alma_estado" ADD CONSTRAINT "alma_estado_singleton" CHECK (id);
ALTER TABLE public."alma_eventos" ADD CONSTRAINT "alma_eventos_pkey" PRIMARY KEY (id);
ALTER TABLE public."alma_objetivo" ADD CONSTRAINT "alma_objetivo_pkey" PRIMARY KEY (id);
ALTER TABLE public."alma_pulsoes" ADD CONSTRAINT "alma_pulsoes_intensidade_check" CHECK (intensidade >= 0 AND intensidade <= 100);
ALTER TABLE public."alma_pulsoes" ADD CONSTRAINT "alma_pulsoes_pkey" PRIMARY KEY (id);
ALTER TABLE public."alma_sombra" ADD CONSTRAINT "alma_sombra_pkey" PRIMARY KEY (id);
ALTER TABLE public."audiences" ADD CONSTRAINT "audiences_pkey" PRIMARY KEY (id);
ALTER TABLE public."audiences" ADD CONSTRAINT "audiences_status_check" CHECK (status = ANY (ARRAY['hypothesis'::text, 'draft'::text, 'active'::text, 'archived'::text]));
ALTER TABLE public."bee_analogies" ADD CONSTRAINT "bee_analogies_name_key" UNIQUE (name);
ALTER TABLE public."bee_analogies" ADD CONSTRAINT "bee_analogies_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_arsenal" ADD CONSTRAINT "bee_arsenal_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_avatars" ADD CONSTRAINT "bee_avatars_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_avatars" ADD CONSTRAINT "bee_avatars_slug_key" UNIQUE (slug);
ALTER TABLE public."bee_directives" ADD CONSTRAINT "bee_directives_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_directives" ADD CONSTRAINT "bee_directives_scope_check" CHECK (scope = ANY (ARRAY['universal'::text, 'platform'::text, 'editorial'::text]));
ALTER TABLE public."bee_directives" ADD CONSTRAINT "bee_directives_tipo_chk" CHECK (tipo = ANY (ARRAY['regra'::text, 'evitar'::text, 'fortalecer'::text, 'fluxo'::text, 'criterio'::text, 'parametro'::text]));
ALTER TABLE public."bee_editorials" ADD CONSTRAINT "bee_editorials_curation_status_check" CHECK (curation_status = ANY (ARRAY['testing'::text, 'approved'::text, 'archived'::text]));
ALTER TABLE public."bee_editorials" ADD CONSTRAINT "bee_editorials_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_editorials" ADD CONSTRAINT "bee_editorials_slug_key" UNIQUE (slug);
ALTER TABLE public."bee_example_posts" ADD CONSTRAINT "bee_example_posts_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_glossary" ADD CONSTRAINT "bee_glossary_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_glossary" ADD CONSTRAINT "bee_glossary_term_key" UNIQUE (term);
ALTER TABLE public."bee_hashtags" ADD CONSTRAINT "bee_hashtags_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_hashtags" ADD CONSTRAINT "bee_hashtags_tag_key" UNIQUE (tag);
ALTER TABLE public."bee_headline_types" ADD CONSTRAINT "bee_headline_types_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_headline_types" ADD CONSTRAINT "bee_headline_types_slug_key" UNIQUE (slug);
ALTER TABLE public."bee_logics" ADD CONSTRAINT "bee_logics_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_logics" ADD CONSTRAINT "bee_logics_slug_key" UNIQUE (slug);
ALTER TABLE public."bee_personas" ADD CONSTRAINT "bee_personas_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_products" ADD CONSTRAINT "bee_products_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_products" ADD CONSTRAINT "bee_products_status_check" CHECK (status = ANY (ARRAY['em_construcao'::text, 'pre_launch'::text, 'launching'::text, 'post_launch'::text, 'evergreen'::text, 'archived'::text]));
ALTER TABLE public."bee_products" ADD CONSTRAINT "bee_products_user_id_slug_key" UNIQUE (user_id, slug);
ALTER TABLE public."bee_style_rules" ADD CONSTRAINT "bee_style_rules_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_suggestions" ADD CONSTRAINT "bee_suggestions_kind_check" CHECK (kind = ANY (ARRAY['arsenal'::text, 'example_post'::text, 'analogy'::text]));
ALTER TABLE public."bee_suggestions" ADD CONSTRAINT "bee_suggestions_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_suggestions" ADD CONSTRAINT "bee_suggestions_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));
ALTER TABLE public."bee_themes" ADD CONSTRAINT "bee_themes_pkey" PRIMARY KEY (id);
ALTER TABLE public."bee_themes" ADD CONSTRAINT "bee_themes_slug_key" UNIQUE (slug);
ALTER TABLE public."brand_intelligence_history" ADD CONSTRAINT "brand_intelligence_history_brand_id_version_key" UNIQUE (brand_id, version);
ALTER TABLE public."brand_intelligence_history" ADD CONSTRAINT "brand_intelligence_history_pkey" PRIMARY KEY (id);
ALTER TABLE public."brand_intelligence_settings" ADD CONSTRAINT "brand_intelligence_settings_acj_enabled_ids_check" CHECK (cardinality(acj_enabled_ids) > 0 AND acj_enabled_ids <@ ARRAY['ACJ-01'::text, 'ACJ-02'::text, 'ACJ-03'::text, 'ACJ-04'::text, 'ACJ-05'::text]);
ALTER TABLE public."brand_intelligence_settings" ADD CONSTRAINT "brand_intelligence_settings_check" CHECK (length(discovery_instruction) <= 3000 AND length(acj_instruction) <= 3000);
ALTER TABLE public."brand_intelligence_settings" ADD CONSTRAINT "brand_intelligence_settings_pkey" PRIMARY KEY (brand_id);
ALTER TABLE public."brands" ADD CONSTRAINT "brands_pkey" PRIMARY KEY (id);
ALTER TABLE public."brands" ADD CONSTRAINT "brands_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]));
ALTER TABLE public."brands" ADD CONSTRAINT "brands_workspace_id_slug_key" UNIQUE (workspace_id, slug);
ALTER TABLE public."business_fronts" ADD CONSTRAINT "business_fronts_brand_id_slug_key" UNIQUE (brand_id, slug);
ALTER TABLE public."business_fronts" ADD CONSTRAINT "business_fronts_pkey" PRIMARY KEY (id);
ALTER TABLE public."business_fronts" ADD CONSTRAINT "business_fronts_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]));
ALTER TABLE public."campaign_cycles" ADD CONSTRAINT "campaign_cycles_campaign_id_idx_key" UNIQUE (campaign_id, idx);
ALTER TABLE public."campaign_cycles" ADD CONSTRAINT "campaign_cycles_pkey" PRIMARY KEY (id);
ALTER TABLE public."campaign_cycles" ADD CONSTRAINT "campaign_cycles_status_check" CHECK (status = ANY (ARRAY['not_started'::text, 'planned'::text, 'pauta_ready'::text, 'pauta_approved'::text, 'developing'::text, 'producing'::text, 'ready'::text, 'done'::text]));
ALTER TABLE public."campaigns" ADD CONSTRAINT "campaigns_duration_weeks_check" CHECK (duration_weeks IS NULL OR duration_weeks >= 1 AND duration_weeks <= 52);
ALTER TABLE public."campaigns" ADD CONSTRAINT "campaigns_pkey" PRIMARY KEY (id);
ALTER TABLE public."campaigns" ADD CONSTRAINT "campaigns_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'ended'::text]));
ALTER TABLE public."campaigns" ADD CONSTRAINT "campaigns_type_check" CHECK (type = ANY (ARRAY['organica'::text, 'vendas'::text]));
ALTER TABLE public."communication_profile_versions" ADD CONSTRAINT "communication_profile_versions_pkey" PRIMARY KEY (id);
ALTER TABLE public."communication_profile_versions" ADD CONSTRAINT "communication_profile_versions_profile_id_version_key" UNIQUE (profile_id, version);
ALTER TABLE public."communication_profile_versions" ADD CONSTRAINT "communication_profile_versions_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'reviewed'::text, 'active'::text, 'superseded'::text]));
ALTER TABLE public."communication_profiles" ADD CONSTRAINT "communication_profiles_cta_policy_check" CHECK (cta_policy = ANY (ARRAY['by_intent'::text, 'never'::text, 'soft'::text]));
ALTER TABLE public."communication_profiles" ADD CONSTRAINT "communication_profiles_pkey" PRIMARY KEY (id);
ALTER TABLE public."communication_profiles" ADD CONSTRAINT "communication_profiles_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]));
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_cycle_id_content_id_key" UNIQUE (cycle_id, content_id);
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_origin_check" CHECK (origin = ANY (ARRAY['new'::text, 'archive'::text, 'legacy'::text]));
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_pkey" PRIMARY KEY (id);
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_check" CHECK ((status = 'validated'::text) = (validated_at IS NOT NULL));
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_content_id_ordinal_key" UNIQUE (content_id, ordinal);
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_ordinal_check" CHECK (ordinal > 0);
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_pkey" PRIMARY KEY (id);
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'validated'::text, 'superseded'::text]));
ALTER TABLE public."content_idea_feedback" ADD CONSTRAINT "content_idea_feedback_feedback_check" CHECK (feedback = ANY (ARRAY['like'::text, 'dislike'::text, 'used'::text]));
ALTER TABLE public."content_idea_feedback" ADD CONSTRAINT "content_idea_feedback_pkey" PRIMARY KEY (id);
ALTER TABLE public."content_ideas_cache" ADD CONSTRAINT "content_ideas_cache_pkey" PRIMARY KEY (id);
ALTER TABLE public."content_memory" ADD CONSTRAINT "content_memory_origin_check" CHECK (origin = ANY (ARRAY['platform'::text, 'instagram_import'::text, 'linkedin_import'::text]));
ALTER TABLE public."content_memory" ADD CONSTRAINT "content_memory_pkey" PRIMARY KEY (id);
ALTER TABLE public."content_memory" ADD CONSTRAINT "content_memory_post_id_key" UNIQUE (post_id);
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_acj_primary_check" CHECK (acj_primary IS NULL OR acj_valid(acj_primary));
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_check" CHECK (acj_secondary IS NULL OR acj_valid(acj_secondary) AND acj_secondary IS DISTINCT FROM acj_primary);
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_format_check" CHECK (format = ANY (ARRAY['image'::text, 'carousel'::text, 'story'::text, 'reel'::text]));
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_origin_check" CHECK (origin = ANY (ARRAY['default'::text, 'hive'::text, 'user'::text]));
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_pkey" PRIMARY KEY (id);
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_platform_check" CHECK (platform = ANY (ARRAY['linkedin'::text, 'instagram'::text]));
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_post_id_key" UNIQUE (post_id);
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_status_check" CHECK (status = ANY (ARRAY['planned'::text, 'produced'::text, 'removed'::text]));
ALTER TABLE public."contents" ADD CONSTRAINT "contents_pkey" PRIMARY KEY (id);
ALTER TABLE public."contents" ADD CONSTRAINT "contents_status_check" CHECK (status = ANY (ARRAY['developing'::text, 'pending_validation'::text, 'validated'::text, 'discarded'::text]));
ALTER TABLE public."contents" ADD CONSTRAINT "contents_strategic_function_check" CHECK (strategic_function IS NULL OR (strategic_function = ANY (ARRAY['presenca'::text, 'posicionamento'::text, 'autoridade'::text, 'relacionamento'::text, 'produtos'::text])));
ALTER TABLE public."context_snapshots" ADD CONSTRAINT "context_snapshots_pkey" PRIMARY KEY (id);
ALTER TABLE public."design_assets" ADD CONSTRAINT "design_assets_kind_check" CHECK (kind = ANY (ARRAY['spiral'::text, 'background'::text, 'texture'::text, 'photo'::text, 'signature'::text, 'logo'::text, 'graphic'::text, 'generated'::text]));
ALTER TABLE public."design_assets" ADD CONSTRAINT "design_assets_origin_check" CHECK (origin = ANY (ARRAY['official'::text, 'real'::text, 'real_adapted'::text, 'generated'::text]));
ALTER TABLE public."design_assets" ADD CONSTRAINT "design_assets_pkey" PRIMARY KEY (id);
ALTER TABLE public."design_manifestacoes" ADD CONSTRAINT "design_manifestacoes_pkey" PRIMARY KEY (id);
ALTER TABLE public."design_selection_config" ADD CONSTRAINT "design_selection_config_pkey" PRIMARY KEY (id);
ALTER TABLE public."design_tokens" ADD CONSTRAINT "design_tokens_kind_check" CHECK (kind = ANY (ARRAY['color'::text, 'font'::text, 'symbol'::text, 'geometry'::text, 'treatment'::text]));
ALTER TABLE public."design_tokens" ADD CONSTRAINT "design_tokens_pkey" PRIMARY KEY (id);
ALTER TABLE public."design_tokens" ADD CONSTRAINT "design_tokens_slug_key" UNIQUE (slug);
ALTER TABLE public."design_variacoes" ADD CONSTRAINT "design_variacoes_pkey" PRIMARY KEY (id);
ALTER TABLE public."design_variacoes" ADD CONSTRAINT "design_variacoes_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'frozen'::text, 'archived'::text]));
ALTER TABLE public."editorial_line_runs" ADD CONSTRAINT "editorial_line_runs_pkey" PRIMARY KEY (id);
ALTER TABLE public."editorial_line_runs" ADD CONSTRAINT "editorial_line_runs_status_check" CHECK (status = ANY (ARRAY['success'::text, 'failed'::text, 'skipped'::text]));
ALTER TABLE public."editorial_lines" ADD CONSTRAINT "editorial_lines_campaign_phase_check" CHECK (campaign_phase = ANY (ARRAY['free'::text, 'pre_launch'::text, 'launch'::text, 'post_launch'::text]));
ALTER TABLE public."editorial_lines" ADD CONSTRAINT "editorial_lines_frequency_type_check" CHECK (frequency_type = ANY (ARRAY['weekly'::text, 'daily'::text, 'custom_days'::text, 'manual'::text]));
ALTER TABLE public."editorial_lines" ADD CONSTRAINT "editorial_lines_pkey" PRIMARY KEY (id);
ALTER TABLE public."editorial_lines" ADD CONSTRAINT "editorial_lines_preferred_hour_check" CHECK (preferred_hour >= 0 AND preferred_hour <= 23);
ALTER TABLE public."editorial_lines" ADD CONSTRAINT "editorial_lines_status_check" CHECK (status = ANY (ARRAY['active'::text, 'paused'::text, 'ended'::text, 'draft'::text]));
ALTER TABLE public."emitters" ADD CONSTRAINT "emitters_facts_status_check" CHECK (facts_status = ANY (ARRAY['confirmed'::text, 'to_confirm'::text]));
ALTER TABLE public."emitters" ADD CONSTRAINT "emitters_kind_check" CHECK (kind = ANY (ARRAY['person'::text, 'institutional'::text]));
ALTER TABLE public."emitters" ADD CONSTRAINT "emitters_pkey" PRIMARY KEY (id);
ALTER TABLE public."emitters" ADD CONSTRAINT "emitters_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text]));
ALTER TABLE public."format_capabilities" ADD CONSTRAINT "format_capabilities_export_kind_check" CHECK (export_kind = ANY (ARRAY['image'::text, 'images'::text, 'pdf'::text, 'video'::text]));
ALTER TABLE public."format_capabilities" ADD CONSTRAINT "format_capabilities_pkey" PRIMARY KEY (platform, format);
ALTER TABLE public."genesis_avatares" ADD CONSTRAINT "genesis_avatares_eixo_identificacao_check" CHECK (eixo_identificacao >= 0 AND eixo_identificacao <= 100);
ALTER TABLE public."genesis_avatares" ADD CONSTRAINT "genesis_avatares_eixo_percepcao_check" CHECK (eixo_percepcao >= 0 AND eixo_percepcao <= 100);
ALTER TABLE public."genesis_avatares" ADD CONSTRAINT "genesis_avatares_pkey" PRIMARY KEY (id);
ALTER TABLE public."genesis_avatares" ADD CONSTRAINT "genesis_avatares_slug_key" UNIQUE (slug);
ALTER TABLE public."genesis_core" ADD CONSTRAINT "genesis_core_pkey" PRIMARY KEY (id);
ALTER TABLE public."genesis_core" ADD CONSTRAINT "genesis_core_singleton" CHECK (id);
ALTER TABLE public."genesis_fluxo" ADD CONSTRAINT "genesis_fluxo_pkey" PRIMARY KEY (id);
ALTER TABLE public."genesis_lentes" ADD CONSTRAINT "genesis_dimensoes_oitava_check" CHECK (oitava >= 0 AND oitava <= 100);
ALTER TABLE public."genesis_lentes" ADD CONSTRAINT "genesis_dimensoes_pkey" PRIMARY KEY (id);
ALTER TABLE public."genesis_lentes" ADD CONSTRAINT "genesis_dimensoes_slug_key" UNIQUE (slug);
ALTER TABLE public."genesis_principios" ADD CONSTRAINT "genesis_principios_codigo_key" UNIQUE (codigo);
ALTER TABLE public."genesis_principios" ADD CONSTRAINT "genesis_principios_pkey" PRIMARY KEY (id);
ALTER TABLE public."genesis_tensoes" ADD CONSTRAINT "genesis_paradigmas_pkey" PRIMARY KEY (id);
ALTER TABLE public."genesis_tensoes" ADD CONSTRAINT "genesis_paradigmas_slug_key" UNIQUE (slug);
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_acj_check" CHECK ((acj_primary IS NULL OR acj_valid(acj_primary)) AND (acj_secondary IS NULL OR acj_valid(acj_secondary) AND acj_primary IS NOT NULL AND acj_secondary <> acj_primary));
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_origin_check" CHECK (origin = ANY (ARRAY['hive'::text, 'user'::text, 'result'::text]));
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_pkey" PRIMARY KEY (id);
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_status_check" CHECK (status = ANY (ARRAY['backlog'::text, 'proposed'::text, 'approved'::text, 'discarded'::text, 'developed'::text]));
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_strategic_function_check" CHECK (strategic_function IS NULL OR (strategic_function = ANY (ARRAY['presenca'::text, 'posicionamento'::text, 'autoridade'::text, 'relacionamento'::text, 'produtos'::text])));
ALTER TABLE public."image_model_trials" ADD CONSTRAINT "image_model_trials_pkey" PRIMARY KEY (id);
ALTER TABLE public."kanban_columns" ADD CONSTRAINT "kanban_columns_pkey" PRIMARY KEY (id);
ALTER TABLE public."knowledge_analysis_runs" ADD CONSTRAINT "knowledge_analysis_runs_pkey" PRIMARY KEY (document_id, user_id);
ALTER TABLE public."knowledge_analysis_runs" ADD CONSTRAINT "knowledge_analysis_runs_status_check" CHECK (status = ANY (ARRAY['running'::text, 'completed'::text, 'failed'::text]));
ALTER TABLE public."knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY (id);
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_pkey" PRIMARY KEY (id);
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_sources_check" CHECK (jsonb_typeof(sources) = 'array'::text);
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_status_check" CHECK (status = ANY (ARRAY['active'::text, 'dismissed'::text, 'drafted'::text]));
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_summary_check" CHECK (length(summary) >= 1 AND length(summary) <= 6000);
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_title_check" CHECK (length(title) >= 1 AND length(title) <= 240);
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_user_id_document_id_title_key" UNIQUE (user_id, document_id, title);
ALTER TABLE public."knowledge_documents" ADD CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_ownership_check" CHECK (ownership = ANY (ARRAY['owned'::text, 'client'::text, 'personal'::text]));
ALTER TABLE public."meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_user_id_fb_account_id_key" UNIQUE (user_id, fb_account_id);
ALTER TABLE public."meta_ad_insights_daily" ADD CONSTRAINT "meta_ad_insights_daily_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_ad_insights_daily" ADD CONSTRAINT "meta_ad_insights_daily_user_id_fb_ad_id_date_key" UNIQUE (user_id, fb_ad_id, date);
ALTER TABLE public."meta_ads" ADD CONSTRAINT "meta_ads_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_ads" ADD CONSTRAINT "meta_ads_user_id_fb_ad_id_key" UNIQUE (user_id, fb_ad_id);
ALTER TABLE public."meta_adsets" ADD CONSTRAINT "meta_adsets_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_adsets" ADD CONSTRAINT "meta_adsets_user_id_fb_adset_id_key" UNIQUE (user_id, fb_adset_id);
ALTER TABLE public."meta_businesses" ADD CONSTRAINT "meta_businesses_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_businesses" ADD CONSTRAINT "meta_businesses_user_id_fb_business_id_key" UNIQUE (user_id, fb_business_id);
ALTER TABLE public."meta_campaigns" ADD CONSTRAINT "meta_campaigns_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_campaigns" ADD CONSTRAINT "meta_campaigns_user_id_fb_campaign_id_key" UNIQUE (user_id, fb_campaign_id);
ALTER TABLE public."meta_connections" ADD CONSTRAINT "meta_connections_monthly_cap_check" CHECK (monthly_cap IS NULL OR monthly_cap > 0::numeric);
ALTER TABLE public."meta_connections" ADD CONSTRAINT "meta_connections_pkey" PRIMARY KEY (id);
ALTER TABLE public."meta_connections" ADD CONSTRAINT "meta_connections_status_check" CHECK (status = ANY (ARRAY['connected'::text, 'no_ads_permission'::text, 'expired'::text, 'error'::text]));
ALTER TABLE public."meta_connections" ADD CONSTRAINT "meta_connections_user_id_key" UNIQUE (user_id);
ALTER TABLE public."olhar_base" ADD CONSTRAINT "olhar_base_area_check" CHECK (area = ANY (ARRAY['estrategia'::text, 'estrutura'::text, 'cultura'::text, 'top_team'::text, 'times'::text, 'lideranca'::text]));
ALTER TABLE public."olhar_base" ADD CONSTRAINT "olhar_base_brand_id_codigo_key" UNIQUE (brand_id, codigo);
ALTER TABLE public."olhar_base" ADD CONSTRAINT "olhar_base_grupo_check" CHECK (grupo = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text, 'F'::text, 'G'::text, 'H'::text]));
ALTER TABLE public."olhar_base" ADD CONSTRAINT "olhar_base_pkey" PRIMARY KEY (id);
ALTER TABLE public."olhar_base" ADD CONSTRAINT "olhar_base_status_check" CHECK (status = ANY (ARRAY['aprovado'::text, 'aguardando'::text, 'retirado'::text]));
ALTER TABLE public."olhar_calibracao" ADD CONSTRAINT "olhar_calibracao_comentario_check" CHECK (char_length(comentario) <= 2000);
ALTER TABLE public."olhar_calibracao" ADD CONSTRAINT "olhar_calibracao_pkey" PRIMARY KEY (id);
ALTER TABLE public."olhar_calibracao" ADD CONSTRAINT "olhar_calibracao_veredito_check" CHECK (veredito = ANY (ARRAY['aprovada'::text, 'ajustar'::text]));
ALTER TABLE public."olhar_nomes_proibidos" ADD CONSTRAINT "olhar_nomes_proibidos_brand_id_termo_key" UNIQUE (brand_id, termo);
ALTER TABLE public."olhar_nomes_proibidos" ADD CONSTRAINT "olhar_nomes_proibidos_pkey" PRIMARY KEY (id);
ALTER TABLE public."olhar_nomes_proibidos" ADD CONSTRAINT "olhar_nomes_proibidos_termo_check" CHECK (char_length(termo) >= 2 AND char_length(termo) <= 120);
ALTER TABLE public."olhar_nomes_proibidos" ADD CONSTRAINT "olhar_nomes_proibidos_tipo_check" CHECK (tipo = ANY (ARRAY['pessoa'::text, 'empresa'::text, 'outro'::text]));
ALTER TABLE public."olhar_sessions" ADD CONSTRAINT "olhar_sessions_desafio_check" CHECK (char_length(desafio) >= 1 AND char_length(desafio) <= 4000);
ALTER TABLE public."olhar_sessions" ADD CONSTRAINT "olhar_sessions_origem_check" CHECK (origem = ANY (ARRAY['bancada'::text, 'teste'::text, 'site'::text]));
ALTER TABLE public."olhar_sessions" ADD CONSTRAINT "olhar_sessions_pkey" PRIMARY KEY (id);
ALTER TABLE public."olhar_sessions" ADD CONSTRAINT "olhar_sessions_tipo_check" CHECK (tipo = ANY (ARRAY['questions'::text, 'reading'::text, 'care'::text, 'refusal'::text]));
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_auto_status_check" CHECK (auto_status = ANY (ARRAY['aprovada'::text, 'revisar'::text, 'rejeitada'::text]));
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_origin_check" CHECK (origin = ANY (ARRAY['real'::text, 'adaptada'::text, 'gerada'::text]));
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_pkey" PRIMARY KEY (id);
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_purpose_check" CHECK (purpose = ANY (ARRAY['post'::text, 'validation_board'::text]));
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_review_status_check" CHECK (review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'adjust'::text, 'rejected'::text]));
ALTER TABLE public."photo_references" ADD CONSTRAINT "photo_references_pkey" PRIMARY KEY (id);
ALTER TABLE public."photo_references" ADD CONSTRAINT "photo_references_priority_check" CHECK (priority = ANY (ARRAY['A0'::text, 'A'::text, 'B'::text, 'C'::text, 'D'::text]));
ALTER TABLE public."photo_references" ADD CONSTRAINT "photo_references_producer_id_ref_key_key" UNIQUE (producer_id, ref_key);
ALTER TABLE public."photo_style_approvals" ADD CONSTRAINT "photo_style_approvals_pkey" PRIMARY KEY (user_id, style_id);
ALTER TABLE public."photo_style_approvals" ADD CONSTRAINT "photo_style_approvals_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'approved'::text, 'rejected'::text]));
ALTER TABLE public."photo_style_approvals" ADD CONSTRAINT "photo_style_approvals_style_id_check" CHECK (style_id = ANY (ARRAY['F01'::text, 'F02'::text, 'F03'::text, 'F04'::text]));
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_action_check" CHECK (action = ANY (ARRAY['adjust_text'::text, 'swap_image'::text, 'swap_template'::text, 'explore_visual'::text, 'other_approach'::text, 'vary_both'::text, 'restore'::text]));
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_pkey" PRIMARY KEY (id);
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_scope_check" CHECK (scope = ANY (ARRAY['piece'::text, 'caption'::text, 'units'::text, 'sequence'::text]));
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_status_check" CHECK (status = ANY (ARRAY['generating'::text, 'ready'::text, 'applied'::text, 'discarded'::text, 'failed'::text, 'conflict'::text, 'rejected'::text]));
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_user_id_operation_id_key" UNIQUE (user_id, operation_id);
ALTER TABLE public."piece_versions" ADD CONSTRAINT "piece_versions_pkey" PRIMARY KEY (id);
ALTER TABLE public."piece_versions" ADD CONSTRAINT "piece_versions_post_id_version_key" UNIQUE (post_id, version);
ALTER TABLE public."podcast_clips" ADD CONSTRAINT "podcast_clips_pkey" PRIMARY KEY (id);
ALTER TABLE public."podcasts" ADD CONSTRAINT "podcasts_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_platform_check" CHECK (platform = ANY (ARRAY['instagram'::text, 'linkedin'::text]));
ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_platform_external_id_key" UNIQUE (platform, external_id);
ALTER TABLE public."post_drafts" ADD CONSTRAINT "post_drafts_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_metrics" ADD CONSTRAINT "post_metrics_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_metrics" ADD CONSTRAINT "post_metrics_post_id_source_key" UNIQUE (post_id, source);
ALTER TABLE public."post_metrics" ADD CONSTRAINT "post_metrics_source_check" CHECK (source = ANY (ARRAY['instagram_api'::text, 'manual'::text, 'linkedin_apify'::text, 'linkedin_export'::text]));
ALTER TABLE public."post_publications" ADD CONSTRAINT "post_publications_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_publications" ADD CONSTRAINT "post_publications_post_id_version_destination_key" UNIQUE (post_id, version, destination);
ALTER TABLE public."post_publications" ADD CONSTRAINT "post_publications_stage_check" CHECK (stage = ANY (ARRAY['reserved'::text, 'sending'::text, 'confirmed'::text, 'failed_before_send'::text, 'unknown'::text]));
ALTER TABLE public."post_publications" ADD CONSTRAINT "post_publications_status_check" CHECK (status = ANY (ARRAY['in_progress'::text, 'published'::text, 'partial'::text, 'failed'::text]));
ALTER TABLE public."post_templates" ADD CONSTRAINT "post_templates_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_unit_publications" ADD CONSTRAINT "post_unit_publications_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_unit_publications" ADD CONSTRAINT "post_unit_publications_publication_id_unit_id_key" UNIQUE (publication_id, unit_id);
ALTER TABLE public."post_unit_publications" ADD CONSTRAINT "post_unit_publications_status_check" CHECK (status = ANY (ARRAY['pending'::text, 'published'::text, 'failed'::text, 'unknown'::text]));
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_layout_check" CHECK (layout = ANY (ARRAY['cover'::text, 'text'::text, 'closing'::text]));
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_media_type_check" CHECK (media_type = ANY (ARRAY['static_image'::text, 'photo'::text, 'video'::text]));
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_pkey" PRIMARY KEY (id);
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_position_check" CHECK ("position" >= 1);
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_review_status_check" CHECK (review_status = ANY (ARRAY['pending'::text, 'approved'::text, 'needs_review'::text]));
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_visual_status_check" CHECK (visual_status = ANY (ARRAY['pending'::text, 'rendering'::text, 'ready'::text, 'failed'::text, 'stale'::text]));
ALTER TABLE public."post_units" ADD CONSTRAINT "uq_post_units_position" UNIQUE (post_id, "position") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_pkey" PRIMARY KEY (id);
ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_role_check" CHECK (role = ANY (ARRAY['admin'::text, 'editor'::text, 'viewer'::text]));
ALTER TABLE public."publication_packages" ADD CONSTRAINT "publication_packages_origin_check" CHECK (origin = ANY (ARRAY['schedule'::text, 'publish_now'::text, 'legacy_confirmed'::text]));
ALTER TABLE public."publication_packages" ADD CONSTRAINT "publication_packages_pkey" PRIMARY KEY (id);
ALTER TABLE public."schedule_commands" ADD CONSTRAINT "schedule_commands_intent_check" CHECK (intent = ANY (ARRAY['schedule'::text, 'reschedule'::text, 'unschedule'::text, 'replace_package'::text]));
ALTER TABLE public."schedule_commands" ADD CONSTRAINT "schedule_commands_pkey" PRIMARY KEY (command_id);
ALTER TABLE public."schedule_plans" ADD CONSTRAINT "schedule_plans_pkey" PRIMARY KEY (id);
ALTER TABLE public."schedule_plans" ADD CONSTRAINT "schedule_plans_status_check" CHECK (status = ANY (ARRAY['open'::text, 'done'::text, 'dismissed'::text]));
ALTER TABLE public."setup_sessions" ADD CONSTRAINT "setup_sessions_mode_check" CHECK (mode = ANY (ARRAY['setup'::text, 'review'::text, 'add_front'::text, 'recalibrate'::text]));
ALTER TABLE public."setup_sessions" ADD CONSTRAINT "setup_sessions_pkey" PRIMARY KEY (id);
ALTER TABLE public."setup_sessions" ADD CONSTRAINT "setup_sessions_status_check" CHECK (status = ANY (ARRAY['in_progress'::text, 'ready_for_review'::text, 'calibrating'::text, 'done'::text, 'archived'::text]));
ALTER TABLE public."social_accounts" ADD CONSTRAINT "social_accounts_pkey" PRIMARY KEY (id);
ALTER TABLE public."social_accounts" ADD CONSTRAINT "social_accounts_platform_check" CHECK (platform = ANY (ARRAY['linkedin'::text, 'instagram'::text]));
ALTER TABLE public."social_accounts" ADD CONSTRAINT "social_accounts_status_check" CHECK (status = ANY (ARRAY['connected'::text, 'disconnected'::text, 'expired'::text]));
ALTER TABLE public."traffic_ads" ADD CONSTRAINT "traffic_ads_mode_check" CHECK (mode = ANY (ARRAY['ig_post'::text, 'new_creative'::text]));
ALTER TABLE public."traffic_ads" ADD CONSTRAINT "traffic_ads_pkey" PRIMARY KEY (id);
ALTER TABLE public."traffic_campaigns" ADD CONSTRAINT "traffic_campaigns_objective_check" CHECK (objective = ANY (ARRAY['OUTCOME_AWARENESS'::text, 'OUTCOME_TRAFFIC'::text, 'OUTCOME_ENGAGEMENT'::text]));
ALTER TABLE public."traffic_campaigns" ADD CONSTRAINT "traffic_campaigns_pkey" PRIMARY KEY (id);
ALTER TABLE public."traffic_campaigns" ADD CONSTRAINT "traffic_campaigns_status_check" CHECK (status = ANY (ARRAY['draft'::text, 'creating'::text, 'paused'::text, 'active'::text, 'ended'::text, 'failed'::text]));
ALTER TABLE public."usage_events" ADD CONSTRAINT "usage_events_pkey" PRIMARY KEY (id);
ALTER TABLE public."user_feedback" ADD CONSTRAINT "user_feedback_pkey" PRIMARY KEY (id);
ALTER TABLE public."user_feedback" ADD CONSTRAINT "user_feedback_type_check" CHECK (type = ANY (ARRAY['bug'::text, 'suggestion'::text, 'feedback'::text]));
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_acj_check" CHECK ((acj_primary IS NULL OR acj_valid(acj_primary)) AND (acj_secondary IS NULL OR acj_valid(acj_secondary)) AND (acj_status IS NULL OR (acj_status = ANY (ARRAY['inherited'::text, 'legacy_unassigned'::text, 'not_applicable'::text, 'unknown'::text]))));
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_image_status_check" CHECK (image_status = ANY (ARRAY['pending'::text, 'approved'::text, 'revision'::text, 'rejected'::text]));
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_piece_role_check" CHECK (piece_role IS NULL OR (piece_role = ANY (ARRAY['validation'::text, 'unfold'::text])));
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_pkey" PRIMARY KEY (id);
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_reference_status_check" CHECK (reference_status IS NULL OR (reference_status = ANY (ARRAY['not_reviewed'::text, 'current_voice'::text, 'historical'::text, 'excluded'::text])));
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_script_status_check" CHECK (script_status IS NULL OR (script_status = ANY (ARRAY['draft'::text, 'approved'::text])));
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_status_check" CHECK (status = ANY (ARRAY['idea'::text, 'draft'::text, 'pending_approval'::text, 'approved'::text, 'scheduled'::text, 'published'::text, 'archived'::text]));
ALTER TABLE public."user_settings" ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY (user_id);
ALTER TABLE public."workspace_members" ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY (workspace_id, user_id);
ALTER TABLE public."workspace_members" ADD CONSTRAINT "workspace_members_role_check" CHECK (role = ANY (ARRAY['owner'::text, 'editor'::text, 'viewer'::text]));
ALTER TABLE public."workspaces" ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY (id);
ALTER TABLE public."workspaces" ADD CONSTRAINT "workspaces_slug_key" UNIQUE (slug);
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
ALTER TABLE public."acj_campaign_plans" ADD CONSTRAINT "acj_campaign_plans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_campaign_plan_id_fkey" FOREIGN KEY (campaign_plan_id) REFERENCES acj_campaign_plans(id) ON DELETE SET NULL;
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE;
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_cycle_plan_id_fkey" FOREIGN KEY (cycle_plan_id) REFERENCES acj_cycle_plans(id) ON DELETE SET NULL;
ALTER TABLE public."acj_content_contracts" ADD CONSTRAINT "acj_content_contracts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."acj_cycle_plans" ADD CONSTRAINT "acj_cycle_plans_campaign_plan_id_fkey" FOREIGN KEY (campaign_plan_id) REFERENCES acj_campaign_plans(id) ON DELETE CASCADE;
ALTER TABLE public."acj_cycle_plans" ADD CONSTRAINT "acj_cycle_plans_cycle_id_fkey" FOREIGN KEY (cycle_id) REFERENCES campaign_cycles(id) ON DELETE CASCADE;
ALTER TABLE public."acj_cycle_plans" ADD CONSTRAINT "acj_cycle_plans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."acj_definitions" ADD CONSTRAINT "acj_definitions_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."acj_learning_decisions" ADD CONSTRAINT "acj_learning_decisions_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES acj_learning_entries(id) ON DELETE CASCADE;
ALTER TABLE public."acj_learning_decisions" ADD CONSTRAINT "acj_learning_decisions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_approved_by_fkey" FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL;
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_cycle_id_fkey" FOREIGN KEY (cycle_id) REFERENCES campaign_cycles(id) ON DELETE SET NULL;
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."acj_learning_entries" ADD CONSTRAINT "acj_learning_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."acj_learning_evidence" ADD CONSTRAINT "acj_learning_evidence_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL;
ALTER TABLE public."acj_learning_evidence" ADD CONSTRAINT "acj_learning_evidence_entry_id_fkey" FOREIGN KEY (entry_id) REFERENCES acj_learning_entries(id) ON DELETE CASCADE;
ALTER TABLE public."acj_learning_evidence" ADD CONSTRAINT "acj_learning_evidence_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."acj_learning_evidence" ADD CONSTRAINT "acj_learning_evidence_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."acj_signal_readings" ADD CONSTRAINT "acj_signal_readings_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."acj_signal_readings" ADD CONSTRAINT "acj_signal_readings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_emitter_id_fkey" FOREIGN KEY (emitter_id) REFERENCES emitters(id) ON DELETE SET NULL;
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_front_id_fkey" FOREIGN KEY (front_id) REFERENCES business_fronts(id) ON DELETE SET NULL;
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_origem_chat_message_id_fkey" FOREIGN KEY (origem_chat_message_id) REFERENCES ai_chat_messages(id) ON DELETE SET NULL;
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_origem_review_id_fkey" FOREIGN KEY (origem_review_id) REFERENCES ai_reviews(id) ON DELETE SET NULL;
ALTER TABLE public."ai_learnings" ADD CONSTRAINT "ai_learnings_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE SET NULL;
ALTER TABLE public."ai_measurement_events" ADD CONSTRAINT "ai_measurement_events_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."ai_measurement_events" ADD CONSTRAINT "ai_measurement_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."ai_reviews" ADD CONSTRAINT "ai_reviews_generation_id_fkey" FOREIGN KEY (generation_id) REFERENCES ai_generations(id) ON DELETE SET NULL;
ALTER TABLE public."ai_reviews" ADD CONSTRAINT "ai_reviews_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."ai_reviews" ADD CONSTRAINT "ai_reviews_variation_id_fkey" FOREIGN KEY (variation_id) REFERENCES ai_variations(id) ON DELETE SET NULL;
ALTER TABLE public."ai_variations" ADD CONSTRAINT "ai_variations_generation_id_fkey" FOREIGN KEY (generation_id) REFERENCES ai_generations(id) ON DELETE CASCADE;
ALTER TABLE public."ai_variations" ADD CONSTRAINT "ai_variations_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."alma_crencas" ADD CONSTRAINT "alma_crencas_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."alma_crencas" ADD CONSTRAINT "alma_crencas_dimensao_slug_fkey" FOREIGN KEY (dimensao_slug) REFERENCES alma_dimensoes(slug) ON DELETE SET NULL;
ALTER TABLE public."alma_dimensoes" ADD CONSTRAINT "alma_dimensoes_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."alma_estado" ADD CONSTRAINT "alma_estado_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."alma_eventos" ADD CONSTRAINT "alma_eventos_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."alma_objetivo" ADD CONSTRAINT "alma_objetivo_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."alma_pulsoes" ADD CONSTRAINT "alma_pulsoes_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."alma_sombra" ADD CONSTRAINT "alma_sombra_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."alma_sombra" ADD CONSTRAINT "alma_sombra_dimensao_slug_fkey" FOREIGN KEY (dimensao_slug) REFERENCES alma_dimensoes(slug) ON DELETE SET NULL;
ALTER TABLE public."audiences" ADD CONSTRAINT "audiences_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."audiences" ADD CONSTRAINT "audiences_front_id_fkey" FOREIGN KEY (front_id) REFERENCES business_fronts(id) ON DELETE SET NULL;
ALTER TABLE public."bee_analogies" ADD CONSTRAINT "bee_analogies_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_arsenal" ADD CONSTRAINT "bee_arsenal_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_arsenal" ADD CONSTRAINT "bee_arsenal_editorial_slug_fkey" FOREIGN KEY (editorial_slug) REFERENCES bee_editorials(slug) ON DELETE CASCADE;
ALTER TABLE public."bee_avatars" ADD CONSTRAINT "bee_avatars_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."bee_directives" ADD CONSTRAINT "bee_directives_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_directives" ADD CONSTRAINT "bee_directives_emitter_id_fkey" FOREIGN KEY (emitter_id) REFERENCES emitters(id) ON DELETE SET NULL;
ALTER TABLE public."bee_directives" ADD CONSTRAINT "bee_directives_front_id_fkey" FOREIGN KEY (front_id) REFERENCES business_fronts(id) ON DELETE SET NULL;
ALTER TABLE public."bee_directives" ADD CONSTRAINT "bee_directives_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE SET NULL;
ALTER TABLE public."bee_editorials" ADD CONSTRAINT "bee_editorials_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_editorials" ADD CONSTRAINT "bee_editorials_front_id_fkey" FOREIGN KEY (front_id) REFERENCES business_fronts(id) ON DELETE SET NULL;
ALTER TABLE public."bee_example_posts" ADD CONSTRAINT "bee_example_posts_avatar_slug_fkey" FOREIGN KEY (avatar_slug) REFERENCES bee_avatars(slug) ON DELETE SET NULL;
ALTER TABLE public."bee_example_posts" ADD CONSTRAINT "bee_example_posts_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_example_posts" ADD CONSTRAINT "bee_example_posts_editorial_slug_fkey" FOREIGN KEY (editorial_slug) REFERENCES bee_editorials(slug) ON DELETE SET NULL;
ALTER TABLE public."bee_glossary" ADD CONSTRAINT "bee_glossary_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_hashtags" ADD CONSTRAINT "bee_hashtags_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_headline_types" ADD CONSTRAINT "bee_headline_types_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_logics" ADD CONSTRAINT "bee_logics_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."bee_products" ADD CONSTRAINT "bee_products_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_products" ADD CONSTRAINT "bee_products_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."bee_style_rules" ADD CONSTRAINT "bee_style_rules_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."bee_suggestions" ADD CONSTRAINT "bee_suggestions_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."bee_suggestions" ADD CONSTRAINT "bee_suggestions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."bee_suggestions" ADD CONSTRAINT "bee_suggestions_editorial_slug_fkey" FOREIGN KEY (editorial_slug) REFERENCES bee_editorials(slug) ON DELETE SET NULL;
ALTER TABLE public."bee_suggestions" ADD CONSTRAINT "bee_suggestions_reviewed_by_fkey" FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."bee_themes" ADD CONSTRAINT "bee_themes_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."brand_intelligence_history" ADD CONSTRAINT "brand_intelligence_history_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id);
ALTER TABLE public."brand_intelligence_history" ADD CONSTRAINT "brand_intelligence_history_changed_by_fkey" FOREIGN KEY (changed_by) REFERENCES auth.users(id);
ALTER TABLE public."brand_intelligence_settings" ADD CONSTRAINT "brand_intelligence_settings_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id);
ALTER TABLE public."brands" ADD CONSTRAINT "brands_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE public."business_fronts" ADD CONSTRAINT "business_fronts_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."campaign_cycles" ADD CONSTRAINT "campaign_cycles_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
ALTER TABLE public."campaign_cycles" ADD CONSTRAINT "campaign_cycles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."campaigns" ADD CONSTRAINT "campaigns_product_id_fkey" FOREIGN KEY (product_id) REFERENCES bee_products(id) ON DELETE SET NULL;
ALTER TABLE public."campaigns" ADD CONSTRAINT "campaigns_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE SET NULL;
ALTER TABLE public."campaigns" ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."communication_profile_versions" ADD CONSTRAINT "communication_profile_versions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."communication_profile_versions" ADD CONSTRAINT "communication_profile_versions_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE CASCADE;
ALTER TABLE public."communication_profiles" ADD CONSTRAINT "communication_profiles_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."communication_profiles" ADD CONSTRAINT "communication_profiles_emitter_id_fkey" FOREIGN KEY (emitter_id) REFERENCES emitters(id);
ALTER TABLE public."communication_profiles" ADD CONSTRAINT "communication_profiles_front_id_fkey" FOREIGN KEY (front_id) REFERENCES business_fronts(id);
ALTER TABLE public."communication_profiles" ADD CONSTRAINT "communication_profiles_primary_audience_id_fkey" FOREIGN KEY (primary_audience_id) REFERENCES audiences(id) ON DELETE SET NULL;
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE RESTRICT;
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_cycle_id_fkey" FOREIGN KEY (cycle_id) REFERENCES campaign_cycles(id) ON DELETE CASCADE;
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_idea_id_fkey" FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL;
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public."content_base_uses" ADD CONSTRAINT "content_base_uses_version_id_fkey" FOREIGN KEY (version_id) REFERENCES content_base_versions(id) ON DELETE RESTRICT;
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE RESTRICT;
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_draft_cycle_id_fkey" FOREIGN KEY (draft_cycle_id) REFERENCES campaign_cycles(id) ON DELETE SET NULL;
ALTER TABLE public."content_base_versions" ADD CONSTRAINT "content_base_versions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public."content_idea_feedback" ADD CONSTRAINT "content_idea_feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."content_ideas_cache" ADD CONSTRAINT "content_ideas_cache_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."content_memory" ADD CONSTRAINT "content_memory_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."content_memory" ADD CONSTRAINT "content_memory_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_account_id_fkey" FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE SET NULL;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE CASCADE;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_context_snapshot_id_fkey" FOREIGN KEY (context_snapshot_id) REFERENCES context_snapshots(id) ON DELETE RESTRICT;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_cycle_id_fkey" FOREIGN KEY (cycle_id) REFERENCES campaign_cycles(id) ON DELETE CASCADE;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE RESTRICT;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_source_base_version_id_fkey" FOREIGN KEY (source_base_version_id) REFERENCES content_base_versions(id) ON DELETE RESTRICT;
ALTER TABLE public."content_piece_plans" ADD CONSTRAINT "content_piece_plans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."contents" ADD CONSTRAINT "contents_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE public."contents" ADD CONSTRAINT "contents_context_snapshot_id_fkey" FOREIGN KEY (context_snapshot_id) REFERENCES context_snapshots(id) ON DELETE SET NULL;
ALTER TABLE public."contents" ADD CONSTRAINT "contents_cycle_id_fkey" FOREIGN KEY (cycle_id) REFERENCES campaign_cycles(id) ON DELETE SET NULL;
ALTER TABLE public."contents" ADD CONSTRAINT "contents_idea_id_fkey" FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL;
ALTER TABLE public."contents" ADD CONSTRAINT "contents_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE SET NULL;
ALTER TABLE public."contents" ADD CONSTRAINT "contents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."context_snapshots" ADD CONSTRAINT "context_snapshots_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."context_snapshots" ADD CONSTRAINT "context_snapshots_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE public."context_snapshots" ADD CONSTRAINT "context_snapshots_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE SET NULL;
ALTER TABLE public."context_snapshots" ADD CONSTRAINT "context_snapshots_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."design_assets" ADD CONSTRAINT "design_assets_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."design_assets" ADD CONSTRAINT "design_assets_source_image_id_fkey" FOREIGN KEY (source_image_id) REFERENCES design_assets(id) ON DELETE SET NULL;
ALTER TABLE public."design_manifestacoes" ADD CONSTRAINT "design_manifestacoes_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."design_selection_config" ADD CONSTRAINT "design_selection_config_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."design_tokens" ADD CONSTRAINT "design_tokens_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."design_variacoes" ADD CONSTRAINT "design_variacoes_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."design_variacoes" ADD CONSTRAINT "design_variacoes_manifestacao_id_fkey" FOREIGN KEY (manifestacao_id) REFERENCES design_manifestacoes(id) ON DELETE CASCADE;
ALTER TABLE public."editorial_line_runs" ADD CONSTRAINT "editorial_line_runs_line_id_fkey" FOREIGN KEY (line_id) REFERENCES editorial_lines(id) ON DELETE CASCADE;
ALTER TABLE public."editorial_line_runs" ADD CONSTRAINT "editorial_line_runs_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."editorial_line_runs" ADD CONSTRAINT "editorial_line_runs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."editorial_lines" ADD CONSTRAINT "editorial_lines_product_id_fkey" FOREIGN KEY (product_id) REFERENCES bee_products(id) ON DELETE SET NULL;
ALTER TABLE public."editorial_lines" ADD CONSTRAINT "editorial_lines_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."emitters" ADD CONSTRAINT "emitters_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."genesis_avatares" ADD CONSTRAINT "genesis_avatares_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."genesis_core" ADD CONSTRAINT "genesis_core_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."genesis_fluxo" ADD CONSTRAINT "genesis_fluxo_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."genesis_lentes" ADD CONSTRAINT "genesis_lentes_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."genesis_principios" ADD CONSTRAINT "genesis_principios_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."genesis_tensoes" ADD CONSTRAINT "genesis_tensoes_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_cycle_id_fkey" FOREIGN KEY (cycle_id) REFERENCES campaign_cycles(id) ON DELETE SET NULL;
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE SET NULL;
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_source_base_version_id_fkey" FOREIGN KEY (source_base_version_id) REFERENCES content_base_versions(id) ON DELETE RESTRICT;
ALTER TABLE public."ideas" ADD CONSTRAINT "ideas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."kanban_columns" ADD CONSTRAINT "kanban_columns_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."knowledge_analysis_runs" ADD CONSTRAINT "knowledge_analysis_runs_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id);
ALTER TABLE public."knowledge_analysis_runs" ADD CONSTRAINT "knowledge_analysis_runs_document_id_fkey" FOREIGN KEY (document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE;
ALTER TABLE public."knowledge_analysis_runs" ADD CONSTRAINT "knowledge_analysis_runs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public."knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_document_id_fkey" FOREIGN KEY (document_id) REFERENCES knowledge_documents(id) ON DELETE CASCADE;
ALTER TABLE public."knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id);
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL;
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_document_id_fkey" FOREIGN KEY (document_id) REFERENCES knowledge_documents(id) ON DELETE SET NULL;
ALTER TABLE public."knowledge_discoveries" ADD CONSTRAINT "knowledge_discoveries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public."knowledge_documents" ADD CONSTRAINT "knowledge_documents_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."knowledge_documents" ADD CONSTRAINT "knowledge_documents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."meta_ad_accounts" ADD CONSTRAINT "meta_ad_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."meta_ad_insights_daily" ADD CONSTRAINT "meta_ad_insights_daily_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."meta_ads" ADD CONSTRAINT "meta_ads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."meta_adsets" ADD CONSTRAINT "meta_adsets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."meta_businesses" ADD CONSTRAINT "meta_businesses_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."meta_campaigns" ADD CONSTRAINT "meta_campaigns_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."meta_connections" ADD CONSTRAINT "meta_connections_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."olhar_base" ADD CONSTRAINT "olhar_base_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."olhar_calibracao" ADD CONSTRAINT "olhar_calibracao_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."olhar_calibracao" ADD CONSTRAINT "olhar_calibracao_session_id_fkey" FOREIGN KEY (session_id) REFERENCES olhar_sessions(id) ON DELETE CASCADE;
ALTER TABLE public."olhar_calibracao" ADD CONSTRAINT "olhar_calibracao_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."olhar_nomes_proibidos" ADD CONSTRAINT "olhar_nomes_proibidos_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."olhar_sessions" ADD CONSTRAINT "olhar_sessions_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."olhar_sessions" ADD CONSTRAINT "olhar_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_library_asset_id_fkey" FOREIGN KEY (library_asset_id) REFERENCES design_assets(id) ON DELETE SET NULL;
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES photo_generations(id) ON DELETE SET NULL;
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."photo_generations" ADD CONSTRAINT "photo_generations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."photo_references" ADD CONSTRAINT "photo_references_asset_id_fkey" FOREIGN KEY (asset_id) REFERENCES design_assets(id) ON DELETE SET NULL;
ALTER TABLE public."photo_references" ADD CONSTRAINT "photo_references_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL;
ALTER TABLE public."photo_style_approvals" ADD CONSTRAINT "photo_style_approvals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_base_candidate_id_fkey" FOREIGN KEY (base_candidate_id) REFERENCES piece_candidates(id) ON DELETE SET NULL;
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."piece_candidates" ADD CONSTRAINT "piece_candidates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."piece_versions" ADD CONSTRAINT "piece_versions_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."piece_versions" ADD CONSTRAINT "piece_versions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."podcast_clips" ADD CONSTRAINT "podcast_clips_podcast_id_fkey" FOREIGN KEY (podcast_id) REFERENCES podcasts(id) ON DELETE SET NULL;
ALTER TABLE public."podcast_clips" ADD CONSTRAINT "podcast_clips_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."podcast_clips" ADD CONSTRAINT "podcast_clips_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."podcasts" ADD CONSTRAINT "podcasts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_account_id_fkey" FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE SET NULL;
ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."post_comments" ADD CONSTRAINT "post_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."post_drafts" ADD CONSTRAINT "post_drafts_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."post_drafts" ADD CONSTRAINT "post_drafts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."post_metrics" ADD CONSTRAINT "post_metrics_account_id_fkey" FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE SET NULL;
ALTER TABLE public."post_metrics" ADD CONSTRAINT "post_metrics_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."post_metrics" ADD CONSTRAINT "post_metrics_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."post_publications" ADD CONSTRAINT "post_publications_package_id_fkey" FOREIGN KEY (package_id) REFERENCES publication_packages(id);
ALTER TABLE public."post_publications" ADD CONSTRAINT "post_publications_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."post_publications" ADD CONSTRAINT "post_publications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."post_templates" ADD CONSTRAINT "post_templates_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."post_unit_publications" ADD CONSTRAINT "post_unit_publications_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."post_unit_publications" ADD CONSTRAINT "post_unit_publications_publication_id_fkey" FOREIGN KEY (publication_id) REFERENCES post_publications(id) ON DELETE CASCADE;
ALTER TABLE public."post_unit_publications" ADD CONSTRAINT "post_unit_publications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."post_units" ADD CONSTRAINT "post_units_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."publication_packages" ADD CONSTRAINT "publication_packages_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."publication_packages" ADD CONSTRAINT "publication_packages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."schedule_commands" ADD CONSTRAINT "schedule_commands_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE CASCADE;
ALTER TABLE public."schedule_commands" ADD CONSTRAINT "schedule_commands_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."schedule_plans" ADD CONSTRAINT "schedule_plans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."setup_sessions" ADD CONSTRAINT "setup_sessions_brand_id_fkey" FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;
ALTER TABLE public."setup_sessions" ADD CONSTRAINT "setup_sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."social_accounts" ADD CONSTRAINT "social_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."traffic_ads" ADD CONSTRAINT "traffic_ads_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES traffic_campaigns(id) ON DELETE CASCADE;
ALTER TABLE public."traffic_ads" ADD CONSTRAINT "traffic_ads_post_id_fkey" FOREIGN KEY (post_id) REFERENCES user_posts(id) ON DELETE RESTRICT;
ALTER TABLE public."traffic_ads" ADD CONSTRAINT "traffic_ads_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."traffic_campaigns" ADD CONSTRAINT "traffic_campaigns_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."usage_events" ADD CONSTRAINT "usage_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."user_feedback" ADD CONSTRAINT "user_feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_account_id_fkey" FOREIGN KEY (account_id) REFERENCES social_accounts(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_campaign_id_fkey" FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_companion_post_id_fkey" FOREIGN KEY (companion_post_id) REFERENCES user_posts(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_content_id_fkey" FOREIGN KEY (content_id) REFERENCES contents(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_context_snapshot_id_fkey" FOREIGN KEY (context_snapshot_id) REFERENCES context_snapshots(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_cycle_id_fkey" FOREIGN KEY (cycle_id) REFERENCES campaign_cycles(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_editorial_line_id_fkey" FOREIGN KEY (editorial_line_id) REFERENCES editorial_lines(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES content_piece_plans(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_product_id_fkey" FOREIGN KEY (product_id) REFERENCES bee_products(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES communication_profiles(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_scheduled_package_id_fkey" FOREIGN KEY (scheduled_package_id) REFERENCES publication_packages(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_template_id_fkey" FOREIGN KEY (template_id) REFERENCES post_templates(id) ON DELETE SET NULL;
ALTER TABLE public."user_posts" ADD CONSTRAINT "user_posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public."workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE;
CREATE INDEX idx_acj_cplans_campaign ON public.acj_campaign_plans USING btree (campaign_id, version DESC);
CREATE UNIQUE INDEX uq_acj_contract_current ON public.acj_content_contracts USING btree (content_id) WHERE (status <> 'superseded'::text);
CREATE INDEX idx_acj_cyplans_cycle ON public.acj_cycle_plans USING btree (cycle_id, version DESC);
CREATE INDEX idx_acj_learning_user ON public.acj_learning_entries USING btree (user_id, created_at DESC);
CREATE INDEX idx_acj_readings_post ON public.acj_signal_readings USING btree (post_id, created_at DESC);
CREATE INDEX ai_chat_messages_user_idx ON public.ai_chat_messages USING btree (user_id, created_at);
CREATE INDEX ai_learnings_user_ativo_idx ON public.ai_learnings USING btree (user_id, ativo, evidencias DESC);
CREATE INDEX idx_ai_measurement_pending ON public.ai_measurement_events USING btree (user_id) WHERE (status <> 'done'::text);
CREATE INDEX ai_reviews_user_created_idx ON public.ai_reviews USING btree (user_id, created_at DESC);
CREATE INDEX idx_alma_eventos_created ON public.alma_eventos USING btree (created_at DESC);
CREATE INDEX idx_arsenal_rotation ON public.bee_arsenal USING btree (editorial_slug, is_active, last_used_at NULLS FIRST);
CREATE INDEX bee_directives_scope_idx ON public.bee_directives USING btree (scope, scope_ref, ordem);
CREATE INDEX bee_directives_tipo_idx ON public.bee_directives USING btree (scope, scope_ref, tipo, ordem);
CREATE INDEX idx_examples_rotation ON public.bee_example_posts USING btree (editorial_slug, is_active, last_used_at NULLS FIRST);
CREATE INDEX bee_personas_user_idx ON public.bee_personas USING btree (user_id, "position");
CREATE INDEX idx_products_user ON public.bee_products USING btree (user_id);
CREATE INDEX idx_products_status ON public.bee_products USING btree (status);
CREATE INDEX idx_suggestions_status ON public.bee_suggestions USING btree (status, created_at DESC);
CREATE INDEX idx_suggestions_editorial ON public.bee_suggestions USING btree (editorial_slug);
CREATE UNIQUE INDEX idx_suggestions_dedup ON public.bee_suggestions USING btree (kind, source_type, source_id, md5(COALESCE(source_excerpt, ''::text))) WHERE (source_id IS NOT NULL);
CREATE INDEX idx_cycles_user ON public.campaign_cycles USING btree (user_id, start_date);
CREATE INDEX idx_campaigns_user ON public.campaigns USING btree (user_id, status);
CREATE UNIQUE INDEX uq_profile_default_per_brand ON public.communication_profiles USING btree (brand_id) WHERE is_default;
CREATE INDEX content_base_uses_cycle ON public.content_base_uses USING btree (user_id, cycle_id, "position");
CREATE INDEX content_base_versions_owner ON public.content_base_versions USING btree (user_id, content_id, ordinal DESC);
CREATE INDEX idx_ideas_cache_user_hash ON public.content_ideas_cache USING btree (user_id, prompt_hash);
CREATE INDEX idx_content_memory_user ON public.content_memory USING btree (user_id, said_at DESC);
CREATE INDEX idx_piece_plans_content ON public.content_piece_plans USING btree (content_id, "position");
CREATE INDEX content_piece_plans_batch_idx ON public.content_piece_plans USING btree (cycle_id, production_batch_id, status) WHERE (production_batch_id IS NOT NULL);
CREATE INDEX idx_contents_user ON public.contents USING btree (user_id, status);
CREATE INDEX idx_contents_cycle ON public.contents USING btree (cycle_id);
CREATE INDEX idx_contents_campaign ON public.contents USING btree (campaign_id);
CREATE INDEX idx_contents_idea ON public.contents USING btree (idea_id);
CREATE INDEX idx_ctx_snapshots_user ON public.context_snapshots USING btree (user_id, created_at DESC);
CREATE INDEX idx_design_assets_kind ON public.design_assets USING btree (kind) WHERE is_active;
CREATE INDEX idx_design_assets_semantic ON public.design_assets USING gin (semantic);
CREATE INDEX idx_design_assets_tags ON public.design_assets USING gin (tags);
CREATE INDEX idx_design_assets_source ON public.design_assets USING btree (source_image_id);
CREATE INDEX idx_design_assets_person ON public.design_assets USING btree (person_slug) WHERE is_active;
CREATE INDEX idx_design_variacoes_manifestacao ON public.design_variacoes USING btree (manifestacao_id);
CREATE INDEX idx_runs_line ON public.editorial_line_runs USING btree (line_id, run_at DESC);
CREATE INDEX idx_runs_user ON public.editorial_line_runs USING btree (user_id, run_at DESC);
CREATE INDEX idx_lines_user ON public.editorial_lines USING btree (user_id);
CREATE INDEX idx_lines_next_run ON public.editorial_lines USING btree (next_run_at) WHERE (status = 'active'::text);
CREATE INDEX idx_ideas_user ON public.ideas USING btree (user_id, status);
CREATE INDEX idx_ideas_cycle ON public.ideas USING btree (cycle_id);
CREATE INDEX idx_ideas_campaign ON public.ideas USING btree (campaign_id);
CREATE INDEX idx_ideas_acj ON public.ideas USING btree (cycle_id, acj_primary);
CREATE INDEX idx_chunks_user ON public.knowledge_chunks USING btree (user_id);
CREATE INDEX idx_chunks_doc ON public.knowledge_chunks USING btree (document_id);
CREATE INDEX idx_chunks_embedding ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists='100');
CREATE INDEX knowledge_discoveries_brand ON public.knowledge_discoveries USING btree (brand_id, created_at DESC);
CREATE INDEX idx_meta_insights_account_date ON public.meta_ad_insights_daily USING btree (user_id, fb_account_id, date DESC);
CREATE INDEX idx_meta_insights_campaign ON public.meta_ad_insights_daily USING btree (user_id, fb_campaign_id, date DESC);
CREATE INDEX idx_meta_ads_ig_media ON public.meta_ads USING btree (user_id, ig_media_id) WHERE (ig_media_id IS NOT NULL);
CREATE INDEX idx_meta_ads_ig_account ON public.meta_ads USING btree (user_id, ig_account_id);
CREATE INDEX olhar_base_brand_status_idx ON public.olhar_base USING btree (brand_id, status, grupo, ordem);
CREATE INDEX olhar_calibracao_brand_idx ON public.olhar_calibracao USING btree (brand_id, created_at DESC);
CREATE INDEX olhar_sessions_brand_idx ON public.olhar_sessions USING btree (brand_id, origem, created_at DESC);
CREATE INDEX idx_photo_gen_user_recent ON public.photo_generations USING btree (user_id, created_at DESC);
CREATE INDEX idx_photo_gen_post ON public.photo_generations USING btree (post_id);
CREATE INDEX idx_piece_candidates_post ON public.piece_candidates USING btree (post_id, created_at DESC);
CREATE INDEX idx_clips_user ON public.podcast_clips USING btree (user_id, created_at DESC);
CREATE INDEX idx_clips_podcast ON public.podcast_clips USING btree (podcast_id);
CREATE UNIQUE INDEX idx_podcasts_user_video ON public.podcasts USING btree (user_id, youtube_video_id) WHERE (youtube_video_id IS NOT NULL);
CREATE INDEX idx_podcasts_user ON public.podcasts USING btree (user_id);
CREATE INDEX idx_post_comments_post ON public.post_comments USING btree (post_id, commented_at);
CREATE INDEX idx_post_metrics_user ON public.post_metrics USING btree (user_id, captured_at DESC);
CREATE INDEX idx_post_publications_post ON public.post_publications USING btree (post_id, started_at DESC);
CREATE UNIQUE INDEX uq_post_publications_active ON public.post_publications USING btree (post_id) WHERE (stage = ANY (ARRAY['reserved'::text, 'sending'::text, 'unknown'::text]));
CREATE UNIQUE INDEX post_templates_slug_key ON public.post_templates USING btree (slug);
CREATE INDEX idx_post_units_post ON public.post_units USING btree (post_id, "position");
CREATE INDEX idx_publication_packages_post ON public.publication_packages USING btree (post_id, created_at DESC);
CREATE INDEX idx_schedule_commands_post ON public.schedule_commands USING btree (post_id, created_at DESC);
CREATE INDEX idx_schedule_commands_plan ON public.schedule_commands USING btree (plan_id) WHERE (plan_id IS NOT NULL);
CREATE INDEX idx_schedule_plans_open ON public.schedule_plans USING btree (user_id, created_at DESC) WHERE (status = 'open'::text);
CREATE INDEX idx_social_accounts_user ON public.social_accounts USING btree (user_id, platform);
CREATE INDEX idx_traffic_ads_campaign ON public.traffic_ads USING btree (campaign_id);
CREATE INDEX idx_traffic_campaigns_user ON public.traffic_campaigns USING btree (user_id, updated_at DESC);
CREATE INDEX idx_usage_events_user_date ON public.usage_events USING btree (user_id, created_at DESC);
CREATE INDEX idx_user_posts_user_status ON public.user_posts USING btree (user_id, status);
CREATE INDEX idx_user_posts_line ON public.user_posts USING btree (editorial_line_id);
CREATE INDEX idx_user_posts_companion ON public.user_posts USING btree (companion_post_id);
CREATE INDEX idx_user_posts_product ON public.user_posts USING btree (product_id);
CREATE INDEX user_posts_user_created_idx ON public.user_posts USING btree (user_id, created_at);
CREATE INDEX idx_posts_content ON public.user_posts USING btree (content_id);
CREATE INDEX idx_posts_campaign ON public.user_posts USING btree (campaign_id);
CREATE INDEX idx_posts_cycle ON public.user_posts USING btree (cycle_id);
CREATE INDEX idx_posts_account ON public.user_posts USING btree (account_id);
CREATE INDEX idx_posts_alt_group ON public.user_posts USING btree (alternative_group) WHERE (alternative_group IS NOT NULL);
CREATE INDEX idx_posts_acj ON public.user_posts USING btree (campaign_id, acj_primary) WHERE (acj_primary IS NOT NULL);
CREATE INDEX posts_repetition_destination_idx ON public.user_posts USING btree (user_id, platform, account_id) WHERE (status = ANY (ARRAY['approved'::text, 'scheduled'::text, 'published'::text]));
CREATE VIEW public."acj_piece_results" WITH (security_invoker=true) AS  SELECT p.id AS post_id,
    p.user_id,
    p.campaign_id,
    p.cycle_id,
    p.content_id,
    p.platform,
    p.account_id,
    p.status,
    p.published_at,
    p.acj_primary,
    p.acj_secondary,
    p.acj_status,
    p.acj_frozen_at,
    p.acj_snapshot,
    m.reach,
    m.likes,
    m.comments,
    m.saves,
    m.shares,
    m.engagement_rate,
    m.captured_at,
    ( SELECT count(*) AS count
           FROM post_comments c
          WHERE c.post_id = p.id AND NOT c.is_own) AS audience_comments
   FROM user_posts p
     LEFT JOIN LATERAL ( SELECT pm.id,
            pm.user_id,
            pm.post_id,
            pm.account_id,
            pm.source,
            pm.captured_at,
            pm.reach,
            pm.impressions,
            pm.likes,
            pm.comments,
            pm.saves,
            pm.shares,
            pm.engagement_rate,
            pm.raw,
            pm.created_at,
            pm.updated_at
           FROM post_metrics pm
          WHERE pm.post_id = p.id
          ORDER BY pm.captured_at DESC
         LIMIT 1) m ON true;
CREATE VIEW public."traffic_eligible_posts" WITH (security_invoker=true) AS  SELECT id,
    user_id,
    title,
    platform,
    format,
    status,
    rendered_slides,
    carousel_text,
    published_url,
    published_at,
    metadata ->> 'ig_media_id'::text AS ig_media_id,
    caption
   FROM user_posts p
  WHERE (status = ANY (ARRAY['approved'::text, 'scheduled'::text, 'published'::text])) AND (rendered_slides IS NOT NULL AND rendered_slides <> '{}'::jsonb OR (metadata ->> 'ig_media_id'::text) IS NOT NULL) AND (platform <> 'instagram'::text OR account_id IS NULL OR NOT (EXISTS ( SELECT 1
           FROM meta_connections m
          WHERE m.user_id = p.user_id AND m.ig_user_id IS NOT NULL)) OR (EXISTS ( SELECT 1
           FROM social_accounts a
             JOIN meta_connections m ON m.user_id = a.user_id AND m.ig_user_id = a.instagram_business_account_id
          WHERE a.id = p.account_id)));
ALTER TABLE public."acj_campaign_plans" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_campaign_plans" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_campaign_plans" TO "postgres";
GRANT SELECT ON public."acj_campaign_plans" TO "postgres";
GRANT UPDATE ON public."acj_campaign_plans" TO "postgres";
GRANT DELETE ON public."acj_campaign_plans" TO "postgres";
GRANT TRUNCATE ON public."acj_campaign_plans" TO "postgres";
GRANT REFERENCES ON public."acj_campaign_plans" TO "postgres";
GRANT TRIGGER ON public."acj_campaign_plans" TO "postgres";
GRANT MAINTAIN ON public."acj_campaign_plans" TO "postgres";
GRANT INSERT ON public."acj_campaign_plans" TO "anon";
GRANT SELECT ON public."acj_campaign_plans" TO "anon";
GRANT UPDATE ON public."acj_campaign_plans" TO "anon";
GRANT DELETE ON public."acj_campaign_plans" TO "anon";
GRANT TRUNCATE ON public."acj_campaign_plans" TO "anon";
GRANT REFERENCES ON public."acj_campaign_plans" TO "anon";
GRANT TRIGGER ON public."acj_campaign_plans" TO "anon";
GRANT MAINTAIN ON public."acj_campaign_plans" TO "anon";
GRANT INSERT ON public."acj_campaign_plans" TO "authenticated";
GRANT SELECT ON public."acj_campaign_plans" TO "authenticated";
GRANT UPDATE ON public."acj_campaign_plans" TO "authenticated";
GRANT DELETE ON public."acj_campaign_plans" TO "authenticated";
GRANT TRUNCATE ON public."acj_campaign_plans" TO "authenticated";
GRANT REFERENCES ON public."acj_campaign_plans" TO "authenticated";
GRANT TRIGGER ON public."acj_campaign_plans" TO "authenticated";
GRANT MAINTAIN ON public."acj_campaign_plans" TO "authenticated";
GRANT INSERT ON public."acj_campaign_plans" TO "service_role";
GRANT SELECT ON public."acj_campaign_plans" TO "service_role";
GRANT UPDATE ON public."acj_campaign_plans" TO "service_role";
GRANT DELETE ON public."acj_campaign_plans" TO "service_role";
GRANT TRUNCATE ON public."acj_campaign_plans" TO "service_role";
GRANT REFERENCES ON public."acj_campaign_plans" TO "service_role";
GRANT TRIGGER ON public."acj_campaign_plans" TO "service_role";
GRANT MAINTAIN ON public."acj_campaign_plans" TO "service_role";
ALTER TABLE public."acj_content_contracts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_content_contracts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_content_contracts" TO "postgres";
GRANT SELECT ON public."acj_content_contracts" TO "postgres";
GRANT UPDATE ON public."acj_content_contracts" TO "postgres";
GRANT DELETE ON public."acj_content_contracts" TO "postgres";
GRANT TRUNCATE ON public."acj_content_contracts" TO "postgres";
GRANT REFERENCES ON public."acj_content_contracts" TO "postgres";
GRANT TRIGGER ON public."acj_content_contracts" TO "postgres";
GRANT MAINTAIN ON public."acj_content_contracts" TO "postgres";
GRANT INSERT ON public."acj_content_contracts" TO "anon";
GRANT SELECT ON public."acj_content_contracts" TO "anon";
GRANT UPDATE ON public."acj_content_contracts" TO "anon";
GRANT DELETE ON public."acj_content_contracts" TO "anon";
GRANT TRUNCATE ON public."acj_content_contracts" TO "anon";
GRANT REFERENCES ON public."acj_content_contracts" TO "anon";
GRANT TRIGGER ON public."acj_content_contracts" TO "anon";
GRANT MAINTAIN ON public."acj_content_contracts" TO "anon";
GRANT INSERT ON public."acj_content_contracts" TO "authenticated";
GRANT SELECT ON public."acj_content_contracts" TO "authenticated";
GRANT UPDATE ON public."acj_content_contracts" TO "authenticated";
GRANT DELETE ON public."acj_content_contracts" TO "authenticated";
GRANT TRUNCATE ON public."acj_content_contracts" TO "authenticated";
GRANT REFERENCES ON public."acj_content_contracts" TO "authenticated";
GRANT TRIGGER ON public."acj_content_contracts" TO "authenticated";
GRANT MAINTAIN ON public."acj_content_contracts" TO "authenticated";
GRANT INSERT ON public."acj_content_contracts" TO "service_role";
GRANT SELECT ON public."acj_content_contracts" TO "service_role";
GRANT UPDATE ON public."acj_content_contracts" TO "service_role";
GRANT DELETE ON public."acj_content_contracts" TO "service_role";
GRANT TRUNCATE ON public."acj_content_contracts" TO "service_role";
GRANT REFERENCES ON public."acj_content_contracts" TO "service_role";
GRANT TRIGGER ON public."acj_content_contracts" TO "service_role";
GRANT MAINTAIN ON public."acj_content_contracts" TO "service_role";
ALTER TABLE public."acj_cycle_plans" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_cycle_plans" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_cycle_plans" TO "postgres";
GRANT SELECT ON public."acj_cycle_plans" TO "postgres";
GRANT UPDATE ON public."acj_cycle_plans" TO "postgres";
GRANT DELETE ON public."acj_cycle_plans" TO "postgres";
GRANT TRUNCATE ON public."acj_cycle_plans" TO "postgres";
GRANT REFERENCES ON public."acj_cycle_plans" TO "postgres";
GRANT TRIGGER ON public."acj_cycle_plans" TO "postgres";
GRANT MAINTAIN ON public."acj_cycle_plans" TO "postgres";
GRANT INSERT ON public."acj_cycle_plans" TO "anon";
GRANT SELECT ON public."acj_cycle_plans" TO "anon";
GRANT UPDATE ON public."acj_cycle_plans" TO "anon";
GRANT DELETE ON public."acj_cycle_plans" TO "anon";
GRANT TRUNCATE ON public."acj_cycle_plans" TO "anon";
GRANT REFERENCES ON public."acj_cycle_plans" TO "anon";
GRANT TRIGGER ON public."acj_cycle_plans" TO "anon";
GRANT MAINTAIN ON public."acj_cycle_plans" TO "anon";
GRANT INSERT ON public."acj_cycle_plans" TO "authenticated";
GRANT SELECT ON public."acj_cycle_plans" TO "authenticated";
GRANT UPDATE ON public."acj_cycle_plans" TO "authenticated";
GRANT DELETE ON public."acj_cycle_plans" TO "authenticated";
GRANT TRUNCATE ON public."acj_cycle_plans" TO "authenticated";
GRANT REFERENCES ON public."acj_cycle_plans" TO "authenticated";
GRANT TRIGGER ON public."acj_cycle_plans" TO "authenticated";
GRANT MAINTAIN ON public."acj_cycle_plans" TO "authenticated";
GRANT INSERT ON public."acj_cycle_plans" TO "service_role";
GRANT SELECT ON public."acj_cycle_plans" TO "service_role";
GRANT UPDATE ON public."acj_cycle_plans" TO "service_role";
GRANT DELETE ON public."acj_cycle_plans" TO "service_role";
GRANT TRUNCATE ON public."acj_cycle_plans" TO "service_role";
GRANT REFERENCES ON public."acj_cycle_plans" TO "service_role";
GRANT TRIGGER ON public."acj_cycle_plans" TO "service_role";
GRANT MAINTAIN ON public."acj_cycle_plans" TO "service_role";
ALTER TABLE public."acj_definitions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_definitions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_definitions" TO "postgres";
GRANT SELECT ON public."acj_definitions" TO "postgres";
GRANT UPDATE ON public."acj_definitions" TO "postgres";
GRANT DELETE ON public."acj_definitions" TO "postgres";
GRANT TRUNCATE ON public."acj_definitions" TO "postgres";
GRANT REFERENCES ON public."acj_definitions" TO "postgres";
GRANT TRIGGER ON public."acj_definitions" TO "postgres";
GRANT MAINTAIN ON public."acj_definitions" TO "postgres";
GRANT INSERT ON public."acj_definitions" TO "anon";
GRANT SELECT ON public."acj_definitions" TO "anon";
GRANT UPDATE ON public."acj_definitions" TO "anon";
GRANT DELETE ON public."acj_definitions" TO "anon";
GRANT TRUNCATE ON public."acj_definitions" TO "anon";
GRANT REFERENCES ON public."acj_definitions" TO "anon";
GRANT TRIGGER ON public."acj_definitions" TO "anon";
GRANT MAINTAIN ON public."acj_definitions" TO "anon";
GRANT INSERT ON public."acj_definitions" TO "authenticated";
GRANT SELECT ON public."acj_definitions" TO "authenticated";
GRANT UPDATE ON public."acj_definitions" TO "authenticated";
GRANT DELETE ON public."acj_definitions" TO "authenticated";
GRANT TRUNCATE ON public."acj_definitions" TO "authenticated";
GRANT REFERENCES ON public."acj_definitions" TO "authenticated";
GRANT TRIGGER ON public."acj_definitions" TO "authenticated";
GRANT MAINTAIN ON public."acj_definitions" TO "authenticated";
GRANT INSERT ON public."acj_definitions" TO "service_role";
GRANT SELECT ON public."acj_definitions" TO "service_role";
GRANT UPDATE ON public."acj_definitions" TO "service_role";
GRANT DELETE ON public."acj_definitions" TO "service_role";
GRANT TRUNCATE ON public."acj_definitions" TO "service_role";
GRANT REFERENCES ON public."acj_definitions" TO "service_role";
GRANT TRIGGER ON public."acj_definitions" TO "service_role";
GRANT MAINTAIN ON public."acj_definitions" TO "service_role";
ALTER TABLE public."acj_learning_decisions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_learning_decisions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_learning_decisions" TO "postgres";
GRANT SELECT ON public."acj_learning_decisions" TO "postgres";
GRANT UPDATE ON public."acj_learning_decisions" TO "postgres";
GRANT DELETE ON public."acj_learning_decisions" TO "postgres";
GRANT TRUNCATE ON public."acj_learning_decisions" TO "postgres";
GRANT REFERENCES ON public."acj_learning_decisions" TO "postgres";
GRANT TRIGGER ON public."acj_learning_decisions" TO "postgres";
GRANT MAINTAIN ON public."acj_learning_decisions" TO "postgres";
GRANT INSERT ON public."acj_learning_decisions" TO "anon";
GRANT SELECT ON public."acj_learning_decisions" TO "anon";
GRANT UPDATE ON public."acj_learning_decisions" TO "anon";
GRANT DELETE ON public."acj_learning_decisions" TO "anon";
GRANT TRUNCATE ON public."acj_learning_decisions" TO "anon";
GRANT REFERENCES ON public."acj_learning_decisions" TO "anon";
GRANT TRIGGER ON public."acj_learning_decisions" TO "anon";
GRANT MAINTAIN ON public."acj_learning_decisions" TO "anon";
GRANT INSERT ON public."acj_learning_decisions" TO "authenticated";
GRANT SELECT ON public."acj_learning_decisions" TO "authenticated";
GRANT UPDATE ON public."acj_learning_decisions" TO "authenticated";
GRANT DELETE ON public."acj_learning_decisions" TO "authenticated";
GRANT TRUNCATE ON public."acj_learning_decisions" TO "authenticated";
GRANT REFERENCES ON public."acj_learning_decisions" TO "authenticated";
GRANT TRIGGER ON public."acj_learning_decisions" TO "authenticated";
GRANT MAINTAIN ON public."acj_learning_decisions" TO "authenticated";
GRANT INSERT ON public."acj_learning_decisions" TO "service_role";
GRANT SELECT ON public."acj_learning_decisions" TO "service_role";
GRANT UPDATE ON public."acj_learning_decisions" TO "service_role";
GRANT DELETE ON public."acj_learning_decisions" TO "service_role";
GRANT TRUNCATE ON public."acj_learning_decisions" TO "service_role";
GRANT REFERENCES ON public."acj_learning_decisions" TO "service_role";
GRANT TRIGGER ON public."acj_learning_decisions" TO "service_role";
GRANT MAINTAIN ON public."acj_learning_decisions" TO "service_role";
ALTER TABLE public."acj_learning_entries" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_learning_entries" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_learning_entries" TO "postgres";
GRANT SELECT ON public."acj_learning_entries" TO "postgres";
GRANT UPDATE ON public."acj_learning_entries" TO "postgres";
GRANT DELETE ON public."acj_learning_entries" TO "postgres";
GRANT TRUNCATE ON public."acj_learning_entries" TO "postgres";
GRANT REFERENCES ON public."acj_learning_entries" TO "postgres";
GRANT TRIGGER ON public."acj_learning_entries" TO "postgres";
GRANT MAINTAIN ON public."acj_learning_entries" TO "postgres";
GRANT INSERT ON public."acj_learning_entries" TO "anon";
GRANT SELECT ON public."acj_learning_entries" TO "anon";
GRANT UPDATE ON public."acj_learning_entries" TO "anon";
GRANT DELETE ON public."acj_learning_entries" TO "anon";
GRANT TRUNCATE ON public."acj_learning_entries" TO "anon";
GRANT REFERENCES ON public."acj_learning_entries" TO "anon";
GRANT TRIGGER ON public."acj_learning_entries" TO "anon";
GRANT MAINTAIN ON public."acj_learning_entries" TO "anon";
GRANT INSERT ON public."acj_learning_entries" TO "authenticated";
GRANT SELECT ON public."acj_learning_entries" TO "authenticated";
GRANT UPDATE ON public."acj_learning_entries" TO "authenticated";
GRANT DELETE ON public."acj_learning_entries" TO "authenticated";
GRANT TRUNCATE ON public."acj_learning_entries" TO "authenticated";
GRANT REFERENCES ON public."acj_learning_entries" TO "authenticated";
GRANT TRIGGER ON public."acj_learning_entries" TO "authenticated";
GRANT MAINTAIN ON public."acj_learning_entries" TO "authenticated";
GRANT INSERT ON public."acj_learning_entries" TO "service_role";
GRANT SELECT ON public."acj_learning_entries" TO "service_role";
GRANT UPDATE ON public."acj_learning_entries" TO "service_role";
GRANT DELETE ON public."acj_learning_entries" TO "service_role";
GRANT TRUNCATE ON public."acj_learning_entries" TO "service_role";
GRANT REFERENCES ON public."acj_learning_entries" TO "service_role";
GRANT TRIGGER ON public."acj_learning_entries" TO "service_role";
GRANT MAINTAIN ON public."acj_learning_entries" TO "service_role";
ALTER TABLE public."acj_learning_evidence" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_learning_evidence" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_learning_evidence" TO "postgres";
GRANT SELECT ON public."acj_learning_evidence" TO "postgres";
GRANT UPDATE ON public."acj_learning_evidence" TO "postgres";
GRANT DELETE ON public."acj_learning_evidence" TO "postgres";
GRANT TRUNCATE ON public."acj_learning_evidence" TO "postgres";
GRANT REFERENCES ON public."acj_learning_evidence" TO "postgres";
GRANT TRIGGER ON public."acj_learning_evidence" TO "postgres";
GRANT MAINTAIN ON public."acj_learning_evidence" TO "postgres";
GRANT INSERT ON public."acj_learning_evidence" TO "anon";
GRANT SELECT ON public."acj_learning_evidence" TO "anon";
GRANT UPDATE ON public."acj_learning_evidence" TO "anon";
GRANT DELETE ON public."acj_learning_evidence" TO "anon";
GRANT TRUNCATE ON public."acj_learning_evidence" TO "anon";
GRANT REFERENCES ON public."acj_learning_evidence" TO "anon";
GRANT TRIGGER ON public."acj_learning_evidence" TO "anon";
GRANT MAINTAIN ON public."acj_learning_evidence" TO "anon";
GRANT INSERT ON public."acj_learning_evidence" TO "authenticated";
GRANT SELECT ON public."acj_learning_evidence" TO "authenticated";
GRANT UPDATE ON public."acj_learning_evidence" TO "authenticated";
GRANT DELETE ON public."acj_learning_evidence" TO "authenticated";
GRANT TRUNCATE ON public."acj_learning_evidence" TO "authenticated";
GRANT REFERENCES ON public."acj_learning_evidence" TO "authenticated";
GRANT TRIGGER ON public."acj_learning_evidence" TO "authenticated";
GRANT MAINTAIN ON public."acj_learning_evidence" TO "authenticated";
GRANT INSERT ON public."acj_learning_evidence" TO "service_role";
GRANT SELECT ON public."acj_learning_evidence" TO "service_role";
GRANT UPDATE ON public."acj_learning_evidence" TO "service_role";
GRANT DELETE ON public."acj_learning_evidence" TO "service_role";
GRANT TRUNCATE ON public."acj_learning_evidence" TO "service_role";
GRANT REFERENCES ON public."acj_learning_evidence" TO "service_role";
GRANT TRIGGER ON public."acj_learning_evidence" TO "service_role";
GRANT MAINTAIN ON public."acj_learning_evidence" TO "service_role";
REVOKE ALL ON public."acj_piece_results" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_piece_results" TO "postgres";
GRANT SELECT ON public."acj_piece_results" TO "postgres";
GRANT UPDATE ON public."acj_piece_results" TO "postgres";
GRANT DELETE ON public."acj_piece_results" TO "postgres";
GRANT TRUNCATE ON public."acj_piece_results" TO "postgres";
GRANT REFERENCES ON public."acj_piece_results" TO "postgres";
GRANT TRIGGER ON public."acj_piece_results" TO "postgres";
GRANT MAINTAIN ON public."acj_piece_results" TO "postgres";
GRANT INSERT ON public."acj_piece_results" TO "anon";
GRANT SELECT ON public."acj_piece_results" TO "anon";
GRANT UPDATE ON public."acj_piece_results" TO "anon";
GRANT DELETE ON public."acj_piece_results" TO "anon";
GRANT TRUNCATE ON public."acj_piece_results" TO "anon";
GRANT REFERENCES ON public."acj_piece_results" TO "anon";
GRANT TRIGGER ON public."acj_piece_results" TO "anon";
GRANT MAINTAIN ON public."acj_piece_results" TO "anon";
GRANT INSERT ON public."acj_piece_results" TO "authenticated";
GRANT SELECT ON public."acj_piece_results" TO "authenticated";
GRANT UPDATE ON public."acj_piece_results" TO "authenticated";
GRANT DELETE ON public."acj_piece_results" TO "authenticated";
GRANT TRUNCATE ON public."acj_piece_results" TO "authenticated";
GRANT REFERENCES ON public."acj_piece_results" TO "authenticated";
GRANT TRIGGER ON public."acj_piece_results" TO "authenticated";
GRANT MAINTAIN ON public."acj_piece_results" TO "authenticated";
GRANT INSERT ON public."acj_piece_results" TO "service_role";
GRANT SELECT ON public."acj_piece_results" TO "service_role";
GRANT UPDATE ON public."acj_piece_results" TO "service_role";
GRANT DELETE ON public."acj_piece_results" TO "service_role";
GRANT TRUNCATE ON public."acj_piece_results" TO "service_role";
GRANT REFERENCES ON public."acj_piece_results" TO "service_role";
GRANT TRIGGER ON public."acj_piece_results" TO "service_role";
GRANT MAINTAIN ON public."acj_piece_results" TO "service_role";
ALTER TABLE public."acj_signal_readings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."acj_signal_readings" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."acj_signal_readings" TO "postgres";
GRANT SELECT ON public."acj_signal_readings" TO "postgres";
GRANT UPDATE ON public."acj_signal_readings" TO "postgres";
GRANT DELETE ON public."acj_signal_readings" TO "postgres";
GRANT TRUNCATE ON public."acj_signal_readings" TO "postgres";
GRANT REFERENCES ON public."acj_signal_readings" TO "postgres";
GRANT TRIGGER ON public."acj_signal_readings" TO "postgres";
GRANT MAINTAIN ON public."acj_signal_readings" TO "postgres";
GRANT INSERT ON public."acj_signal_readings" TO "anon";
GRANT SELECT ON public."acj_signal_readings" TO "anon";
GRANT UPDATE ON public."acj_signal_readings" TO "anon";
GRANT DELETE ON public."acj_signal_readings" TO "anon";
GRANT TRUNCATE ON public."acj_signal_readings" TO "anon";
GRANT REFERENCES ON public."acj_signal_readings" TO "anon";
GRANT TRIGGER ON public."acj_signal_readings" TO "anon";
GRANT MAINTAIN ON public."acj_signal_readings" TO "anon";
GRANT INSERT ON public."acj_signal_readings" TO "authenticated";
GRANT SELECT ON public."acj_signal_readings" TO "authenticated";
GRANT UPDATE ON public."acj_signal_readings" TO "authenticated";
GRANT DELETE ON public."acj_signal_readings" TO "authenticated";
GRANT TRUNCATE ON public."acj_signal_readings" TO "authenticated";
GRANT REFERENCES ON public."acj_signal_readings" TO "authenticated";
GRANT TRIGGER ON public."acj_signal_readings" TO "authenticated";
GRANT MAINTAIN ON public."acj_signal_readings" TO "authenticated";
GRANT INSERT ON public."acj_signal_readings" TO "service_role";
GRANT SELECT ON public."acj_signal_readings" TO "service_role";
GRANT UPDATE ON public."acj_signal_readings" TO "service_role";
GRANT DELETE ON public."acj_signal_readings" TO "service_role";
GRANT TRUNCATE ON public."acj_signal_readings" TO "service_role";
GRANT REFERENCES ON public."acj_signal_readings" TO "service_role";
GRANT TRIGGER ON public."acj_signal_readings" TO "service_role";
GRANT MAINTAIN ON public."acj_signal_readings" TO "service_role";
ALTER TABLE public."ai_chat_messages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ai_chat_messages" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ai_chat_messages" TO "postgres";
GRANT SELECT ON public."ai_chat_messages" TO "postgres";
GRANT UPDATE ON public."ai_chat_messages" TO "postgres";
GRANT DELETE ON public."ai_chat_messages" TO "postgres";
GRANT TRUNCATE ON public."ai_chat_messages" TO "postgres";
GRANT REFERENCES ON public."ai_chat_messages" TO "postgres";
GRANT TRIGGER ON public."ai_chat_messages" TO "postgres";
GRANT MAINTAIN ON public."ai_chat_messages" TO "postgres";
GRANT INSERT ON public."ai_chat_messages" TO "anon";
GRANT SELECT ON public."ai_chat_messages" TO "anon";
GRANT UPDATE ON public."ai_chat_messages" TO "anon";
GRANT DELETE ON public."ai_chat_messages" TO "anon";
GRANT TRUNCATE ON public."ai_chat_messages" TO "anon";
GRANT REFERENCES ON public."ai_chat_messages" TO "anon";
GRANT TRIGGER ON public."ai_chat_messages" TO "anon";
GRANT MAINTAIN ON public."ai_chat_messages" TO "anon";
GRANT INSERT ON public."ai_chat_messages" TO "authenticated";
GRANT SELECT ON public."ai_chat_messages" TO "authenticated";
GRANT UPDATE ON public."ai_chat_messages" TO "authenticated";
GRANT DELETE ON public."ai_chat_messages" TO "authenticated";
GRANT TRUNCATE ON public."ai_chat_messages" TO "authenticated";
GRANT REFERENCES ON public."ai_chat_messages" TO "authenticated";
GRANT TRIGGER ON public."ai_chat_messages" TO "authenticated";
GRANT MAINTAIN ON public."ai_chat_messages" TO "authenticated";
GRANT INSERT ON public."ai_chat_messages" TO "service_role";
GRANT SELECT ON public."ai_chat_messages" TO "service_role";
GRANT UPDATE ON public."ai_chat_messages" TO "service_role";
GRANT DELETE ON public."ai_chat_messages" TO "service_role";
GRANT TRUNCATE ON public."ai_chat_messages" TO "service_role";
GRANT REFERENCES ON public."ai_chat_messages" TO "service_role";
GRANT TRIGGER ON public."ai_chat_messages" TO "service_role";
GRANT MAINTAIN ON public."ai_chat_messages" TO "service_role";
ALTER TABLE public."ai_generations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ai_generations" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ai_generations" TO "postgres";
GRANT SELECT ON public."ai_generations" TO "postgres";
GRANT UPDATE ON public."ai_generations" TO "postgres";
GRANT DELETE ON public."ai_generations" TO "postgres";
GRANT TRUNCATE ON public."ai_generations" TO "postgres";
GRANT REFERENCES ON public."ai_generations" TO "postgres";
GRANT TRIGGER ON public."ai_generations" TO "postgres";
GRANT MAINTAIN ON public."ai_generations" TO "postgres";
GRANT INSERT ON public."ai_generations" TO "anon";
GRANT SELECT ON public."ai_generations" TO "anon";
GRANT UPDATE ON public."ai_generations" TO "anon";
GRANT DELETE ON public."ai_generations" TO "anon";
GRANT TRUNCATE ON public."ai_generations" TO "anon";
GRANT REFERENCES ON public."ai_generations" TO "anon";
GRANT TRIGGER ON public."ai_generations" TO "anon";
GRANT MAINTAIN ON public."ai_generations" TO "anon";
GRANT INSERT ON public."ai_generations" TO "authenticated";
GRANT SELECT ON public."ai_generations" TO "authenticated";
GRANT UPDATE ON public."ai_generations" TO "authenticated";
GRANT DELETE ON public."ai_generations" TO "authenticated";
GRANT TRUNCATE ON public."ai_generations" TO "authenticated";
GRANT REFERENCES ON public."ai_generations" TO "authenticated";
GRANT TRIGGER ON public."ai_generations" TO "authenticated";
GRANT MAINTAIN ON public."ai_generations" TO "authenticated";
GRANT INSERT ON public."ai_generations" TO "service_role";
GRANT SELECT ON public."ai_generations" TO "service_role";
GRANT UPDATE ON public."ai_generations" TO "service_role";
GRANT DELETE ON public."ai_generations" TO "service_role";
GRANT TRUNCATE ON public."ai_generations" TO "service_role";
GRANT REFERENCES ON public."ai_generations" TO "service_role";
GRANT TRIGGER ON public."ai_generations" TO "service_role";
GRANT MAINTAIN ON public."ai_generations" TO "service_role";
ALTER TABLE public."ai_learnings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ai_learnings" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ai_learnings" TO "postgres";
GRANT SELECT ON public."ai_learnings" TO "postgres";
GRANT UPDATE ON public."ai_learnings" TO "postgres";
GRANT DELETE ON public."ai_learnings" TO "postgres";
GRANT TRUNCATE ON public."ai_learnings" TO "postgres";
GRANT REFERENCES ON public."ai_learnings" TO "postgres";
GRANT TRIGGER ON public."ai_learnings" TO "postgres";
GRANT MAINTAIN ON public."ai_learnings" TO "postgres";
GRANT INSERT ON public."ai_learnings" TO "anon";
GRANT SELECT ON public."ai_learnings" TO "anon";
GRANT UPDATE ON public."ai_learnings" TO "anon";
GRANT DELETE ON public."ai_learnings" TO "anon";
GRANT TRUNCATE ON public."ai_learnings" TO "anon";
GRANT REFERENCES ON public."ai_learnings" TO "anon";
GRANT TRIGGER ON public."ai_learnings" TO "anon";
GRANT MAINTAIN ON public."ai_learnings" TO "anon";
GRANT INSERT ON public."ai_learnings" TO "authenticated";
GRANT SELECT ON public."ai_learnings" TO "authenticated";
GRANT UPDATE ON public."ai_learnings" TO "authenticated";
GRANT DELETE ON public."ai_learnings" TO "authenticated";
GRANT TRUNCATE ON public."ai_learnings" TO "authenticated";
GRANT REFERENCES ON public."ai_learnings" TO "authenticated";
GRANT TRIGGER ON public."ai_learnings" TO "authenticated";
GRANT MAINTAIN ON public."ai_learnings" TO "authenticated";
GRANT INSERT ON public."ai_learnings" TO "service_role";
GRANT SELECT ON public."ai_learnings" TO "service_role";
GRANT UPDATE ON public."ai_learnings" TO "service_role";
GRANT DELETE ON public."ai_learnings" TO "service_role";
GRANT TRUNCATE ON public."ai_learnings" TO "service_role";
GRANT REFERENCES ON public."ai_learnings" TO "service_role";
GRANT TRIGGER ON public."ai_learnings" TO "service_role";
GRANT MAINTAIN ON public."ai_learnings" TO "service_role";
ALTER TABLE public."ai_measurement_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ai_measurement_events" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ai_measurement_events" TO "postgres";
GRANT SELECT ON public."ai_measurement_events" TO "postgres";
GRANT UPDATE ON public."ai_measurement_events" TO "postgres";
GRANT DELETE ON public."ai_measurement_events" TO "postgres";
GRANT TRUNCATE ON public."ai_measurement_events" TO "postgres";
GRANT REFERENCES ON public."ai_measurement_events" TO "postgres";
GRANT TRIGGER ON public."ai_measurement_events" TO "postgres";
GRANT MAINTAIN ON public."ai_measurement_events" TO "postgres";
GRANT INSERT ON public."ai_measurement_events" TO "anon";
GRANT SELECT ON public."ai_measurement_events" TO "anon";
GRANT UPDATE ON public."ai_measurement_events" TO "anon";
GRANT DELETE ON public."ai_measurement_events" TO "anon";
GRANT TRUNCATE ON public."ai_measurement_events" TO "anon";
GRANT REFERENCES ON public."ai_measurement_events" TO "anon";
GRANT TRIGGER ON public."ai_measurement_events" TO "anon";
GRANT MAINTAIN ON public."ai_measurement_events" TO "anon";
GRANT INSERT ON public."ai_measurement_events" TO "authenticated";
GRANT SELECT ON public."ai_measurement_events" TO "authenticated";
GRANT UPDATE ON public."ai_measurement_events" TO "authenticated";
GRANT DELETE ON public."ai_measurement_events" TO "authenticated";
GRANT TRUNCATE ON public."ai_measurement_events" TO "authenticated";
GRANT REFERENCES ON public."ai_measurement_events" TO "authenticated";
GRANT TRIGGER ON public."ai_measurement_events" TO "authenticated";
GRANT MAINTAIN ON public."ai_measurement_events" TO "authenticated";
GRANT INSERT ON public."ai_measurement_events" TO "service_role";
GRANT SELECT ON public."ai_measurement_events" TO "service_role";
GRANT UPDATE ON public."ai_measurement_events" TO "service_role";
GRANT DELETE ON public."ai_measurement_events" TO "service_role";
GRANT TRUNCATE ON public."ai_measurement_events" TO "service_role";
GRANT REFERENCES ON public."ai_measurement_events" TO "service_role";
GRANT TRIGGER ON public."ai_measurement_events" TO "service_role";
GRANT MAINTAIN ON public."ai_measurement_events" TO "service_role";
ALTER TABLE public."ai_reviews" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ai_reviews" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ai_reviews" TO "postgres";
GRANT SELECT ON public."ai_reviews" TO "postgres";
GRANT UPDATE ON public."ai_reviews" TO "postgres";
GRANT DELETE ON public."ai_reviews" TO "postgres";
GRANT TRUNCATE ON public."ai_reviews" TO "postgres";
GRANT REFERENCES ON public."ai_reviews" TO "postgres";
GRANT TRIGGER ON public."ai_reviews" TO "postgres";
GRANT MAINTAIN ON public."ai_reviews" TO "postgres";
GRANT INSERT ON public."ai_reviews" TO "anon";
GRANT SELECT ON public."ai_reviews" TO "anon";
GRANT UPDATE ON public."ai_reviews" TO "anon";
GRANT DELETE ON public."ai_reviews" TO "anon";
GRANT TRUNCATE ON public."ai_reviews" TO "anon";
GRANT REFERENCES ON public."ai_reviews" TO "anon";
GRANT TRIGGER ON public."ai_reviews" TO "anon";
GRANT MAINTAIN ON public."ai_reviews" TO "anon";
GRANT INSERT ON public."ai_reviews" TO "authenticated";
GRANT SELECT ON public."ai_reviews" TO "authenticated";
GRANT UPDATE ON public."ai_reviews" TO "authenticated";
GRANT DELETE ON public."ai_reviews" TO "authenticated";
GRANT TRUNCATE ON public."ai_reviews" TO "authenticated";
GRANT REFERENCES ON public."ai_reviews" TO "authenticated";
GRANT TRIGGER ON public."ai_reviews" TO "authenticated";
GRANT MAINTAIN ON public."ai_reviews" TO "authenticated";
GRANT INSERT ON public."ai_reviews" TO "service_role";
GRANT SELECT ON public."ai_reviews" TO "service_role";
GRANT UPDATE ON public."ai_reviews" TO "service_role";
GRANT DELETE ON public."ai_reviews" TO "service_role";
GRANT TRUNCATE ON public."ai_reviews" TO "service_role";
GRANT REFERENCES ON public."ai_reviews" TO "service_role";
GRANT TRIGGER ON public."ai_reviews" TO "service_role";
GRANT MAINTAIN ON public."ai_reviews" TO "service_role";
ALTER TABLE public."ai_segment_gate" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ai_segment_gate" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ai_segment_gate" TO "postgres";
GRANT SELECT ON public."ai_segment_gate" TO "postgres";
GRANT UPDATE ON public."ai_segment_gate" TO "postgres";
GRANT DELETE ON public."ai_segment_gate" TO "postgres";
GRANT TRUNCATE ON public."ai_segment_gate" TO "postgres";
GRANT REFERENCES ON public."ai_segment_gate" TO "postgres";
GRANT TRIGGER ON public."ai_segment_gate" TO "postgres";
GRANT MAINTAIN ON public."ai_segment_gate" TO "postgres";
GRANT INSERT ON public."ai_segment_gate" TO "anon";
GRANT SELECT ON public."ai_segment_gate" TO "anon";
GRANT UPDATE ON public."ai_segment_gate" TO "anon";
GRANT DELETE ON public."ai_segment_gate" TO "anon";
GRANT TRUNCATE ON public."ai_segment_gate" TO "anon";
GRANT REFERENCES ON public."ai_segment_gate" TO "anon";
GRANT TRIGGER ON public."ai_segment_gate" TO "anon";
GRANT MAINTAIN ON public."ai_segment_gate" TO "anon";
GRANT INSERT ON public."ai_segment_gate" TO "authenticated";
GRANT SELECT ON public."ai_segment_gate" TO "authenticated";
GRANT UPDATE ON public."ai_segment_gate" TO "authenticated";
GRANT DELETE ON public."ai_segment_gate" TO "authenticated";
GRANT TRUNCATE ON public."ai_segment_gate" TO "authenticated";
GRANT REFERENCES ON public."ai_segment_gate" TO "authenticated";
GRANT TRIGGER ON public."ai_segment_gate" TO "authenticated";
GRANT MAINTAIN ON public."ai_segment_gate" TO "authenticated";
GRANT INSERT ON public."ai_segment_gate" TO "service_role";
GRANT SELECT ON public."ai_segment_gate" TO "service_role";
GRANT UPDATE ON public."ai_segment_gate" TO "service_role";
GRANT DELETE ON public."ai_segment_gate" TO "service_role";
GRANT TRUNCATE ON public."ai_segment_gate" TO "service_role";
GRANT REFERENCES ON public."ai_segment_gate" TO "service_role";
GRANT TRIGGER ON public."ai_segment_gate" TO "service_role";
GRANT MAINTAIN ON public."ai_segment_gate" TO "service_role";
ALTER TABLE public."ai_variations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ai_variations" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ai_variations" TO "postgres";
GRANT SELECT ON public."ai_variations" TO "postgres";
GRANT UPDATE ON public."ai_variations" TO "postgres";
GRANT DELETE ON public."ai_variations" TO "postgres";
GRANT TRUNCATE ON public."ai_variations" TO "postgres";
GRANT REFERENCES ON public."ai_variations" TO "postgres";
GRANT TRIGGER ON public."ai_variations" TO "postgres";
GRANT MAINTAIN ON public."ai_variations" TO "postgres";
GRANT INSERT ON public."ai_variations" TO "anon";
GRANT SELECT ON public."ai_variations" TO "anon";
GRANT UPDATE ON public."ai_variations" TO "anon";
GRANT DELETE ON public."ai_variations" TO "anon";
GRANT TRUNCATE ON public."ai_variations" TO "anon";
GRANT REFERENCES ON public."ai_variations" TO "anon";
GRANT TRIGGER ON public."ai_variations" TO "anon";
GRANT MAINTAIN ON public."ai_variations" TO "anon";
GRANT INSERT ON public."ai_variations" TO "authenticated";
GRANT SELECT ON public."ai_variations" TO "authenticated";
GRANT UPDATE ON public."ai_variations" TO "authenticated";
GRANT DELETE ON public."ai_variations" TO "authenticated";
GRANT TRUNCATE ON public."ai_variations" TO "authenticated";
GRANT REFERENCES ON public."ai_variations" TO "authenticated";
GRANT TRIGGER ON public."ai_variations" TO "authenticated";
GRANT MAINTAIN ON public."ai_variations" TO "authenticated";
GRANT INSERT ON public."ai_variations" TO "service_role";
GRANT SELECT ON public."ai_variations" TO "service_role";
GRANT UPDATE ON public."ai_variations" TO "service_role";
GRANT DELETE ON public."ai_variations" TO "service_role";
GRANT TRUNCATE ON public."ai_variations" TO "service_role";
GRANT REFERENCES ON public."ai_variations" TO "service_role";
GRANT TRIGGER ON public."ai_variations" TO "service_role";
GRANT MAINTAIN ON public."ai_variations" TO "service_role";
ALTER TABLE public."alma_crencas" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."alma_crencas" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."alma_crencas" TO "postgres";
GRANT SELECT ON public."alma_crencas" TO "postgres";
GRANT UPDATE ON public."alma_crencas" TO "postgres";
GRANT DELETE ON public."alma_crencas" TO "postgres";
GRANT TRUNCATE ON public."alma_crencas" TO "postgres";
GRANT REFERENCES ON public."alma_crencas" TO "postgres";
GRANT TRIGGER ON public."alma_crencas" TO "postgres";
GRANT MAINTAIN ON public."alma_crencas" TO "postgres";
GRANT INSERT ON public."alma_crencas" TO "anon";
GRANT SELECT ON public."alma_crencas" TO "anon";
GRANT UPDATE ON public."alma_crencas" TO "anon";
GRANT DELETE ON public."alma_crencas" TO "anon";
GRANT TRUNCATE ON public."alma_crencas" TO "anon";
GRANT REFERENCES ON public."alma_crencas" TO "anon";
GRANT TRIGGER ON public."alma_crencas" TO "anon";
GRANT MAINTAIN ON public."alma_crencas" TO "anon";
GRANT INSERT ON public."alma_crencas" TO "authenticated";
GRANT SELECT ON public."alma_crencas" TO "authenticated";
GRANT UPDATE ON public."alma_crencas" TO "authenticated";
GRANT DELETE ON public."alma_crencas" TO "authenticated";
GRANT TRUNCATE ON public."alma_crencas" TO "authenticated";
GRANT REFERENCES ON public."alma_crencas" TO "authenticated";
GRANT TRIGGER ON public."alma_crencas" TO "authenticated";
GRANT MAINTAIN ON public."alma_crencas" TO "authenticated";
GRANT INSERT ON public."alma_crencas" TO "service_role";
GRANT SELECT ON public."alma_crencas" TO "service_role";
GRANT UPDATE ON public."alma_crencas" TO "service_role";
GRANT DELETE ON public."alma_crencas" TO "service_role";
GRANT TRUNCATE ON public."alma_crencas" TO "service_role";
GRANT REFERENCES ON public."alma_crencas" TO "service_role";
GRANT TRIGGER ON public."alma_crencas" TO "service_role";
GRANT MAINTAIN ON public."alma_crencas" TO "service_role";
ALTER TABLE public."alma_dimensoes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."alma_dimensoes" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."alma_dimensoes" TO "postgres";
GRANT SELECT ON public."alma_dimensoes" TO "postgres";
GRANT UPDATE ON public."alma_dimensoes" TO "postgres";
GRANT DELETE ON public."alma_dimensoes" TO "postgres";
GRANT TRUNCATE ON public."alma_dimensoes" TO "postgres";
GRANT REFERENCES ON public."alma_dimensoes" TO "postgres";
GRANT TRIGGER ON public."alma_dimensoes" TO "postgres";
GRANT MAINTAIN ON public."alma_dimensoes" TO "postgres";
GRANT INSERT ON public."alma_dimensoes" TO "anon";
GRANT SELECT ON public."alma_dimensoes" TO "anon";
GRANT UPDATE ON public."alma_dimensoes" TO "anon";
GRANT DELETE ON public."alma_dimensoes" TO "anon";
GRANT TRUNCATE ON public."alma_dimensoes" TO "anon";
GRANT REFERENCES ON public."alma_dimensoes" TO "anon";
GRANT TRIGGER ON public."alma_dimensoes" TO "anon";
GRANT MAINTAIN ON public."alma_dimensoes" TO "anon";
GRANT INSERT ON public."alma_dimensoes" TO "authenticated";
GRANT SELECT ON public."alma_dimensoes" TO "authenticated";
GRANT UPDATE ON public."alma_dimensoes" TO "authenticated";
GRANT DELETE ON public."alma_dimensoes" TO "authenticated";
GRANT TRUNCATE ON public."alma_dimensoes" TO "authenticated";
GRANT REFERENCES ON public."alma_dimensoes" TO "authenticated";
GRANT TRIGGER ON public."alma_dimensoes" TO "authenticated";
GRANT MAINTAIN ON public."alma_dimensoes" TO "authenticated";
GRANT INSERT ON public."alma_dimensoes" TO "service_role";
GRANT SELECT ON public."alma_dimensoes" TO "service_role";
GRANT UPDATE ON public."alma_dimensoes" TO "service_role";
GRANT DELETE ON public."alma_dimensoes" TO "service_role";
GRANT TRUNCATE ON public."alma_dimensoes" TO "service_role";
GRANT REFERENCES ON public."alma_dimensoes" TO "service_role";
GRANT TRIGGER ON public."alma_dimensoes" TO "service_role";
GRANT MAINTAIN ON public."alma_dimensoes" TO "service_role";
ALTER TABLE public."alma_estado" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."alma_estado" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."alma_estado" TO "postgres";
GRANT SELECT ON public."alma_estado" TO "postgres";
GRANT UPDATE ON public."alma_estado" TO "postgres";
GRANT DELETE ON public."alma_estado" TO "postgres";
GRANT TRUNCATE ON public."alma_estado" TO "postgres";
GRANT REFERENCES ON public."alma_estado" TO "postgres";
GRANT TRIGGER ON public."alma_estado" TO "postgres";
GRANT MAINTAIN ON public."alma_estado" TO "postgres";
GRANT INSERT ON public."alma_estado" TO "anon";
GRANT SELECT ON public."alma_estado" TO "anon";
GRANT UPDATE ON public."alma_estado" TO "anon";
GRANT DELETE ON public."alma_estado" TO "anon";
GRANT TRUNCATE ON public."alma_estado" TO "anon";
GRANT REFERENCES ON public."alma_estado" TO "anon";
GRANT TRIGGER ON public."alma_estado" TO "anon";
GRANT MAINTAIN ON public."alma_estado" TO "anon";
GRANT INSERT ON public."alma_estado" TO "authenticated";
GRANT SELECT ON public."alma_estado" TO "authenticated";
GRANT UPDATE ON public."alma_estado" TO "authenticated";
GRANT DELETE ON public."alma_estado" TO "authenticated";
GRANT TRUNCATE ON public."alma_estado" TO "authenticated";
GRANT REFERENCES ON public."alma_estado" TO "authenticated";
GRANT TRIGGER ON public."alma_estado" TO "authenticated";
GRANT MAINTAIN ON public."alma_estado" TO "authenticated";
GRANT INSERT ON public."alma_estado" TO "service_role";
GRANT SELECT ON public."alma_estado" TO "service_role";
GRANT UPDATE ON public."alma_estado" TO "service_role";
GRANT DELETE ON public."alma_estado" TO "service_role";
GRANT TRUNCATE ON public."alma_estado" TO "service_role";
GRANT REFERENCES ON public."alma_estado" TO "service_role";
GRANT TRIGGER ON public."alma_estado" TO "service_role";
GRANT MAINTAIN ON public."alma_estado" TO "service_role";
ALTER TABLE public."alma_eventos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."alma_eventos" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."alma_eventos" TO "postgres";
GRANT SELECT ON public."alma_eventos" TO "postgres";
GRANT UPDATE ON public."alma_eventos" TO "postgres";
GRANT DELETE ON public."alma_eventos" TO "postgres";
GRANT TRUNCATE ON public."alma_eventos" TO "postgres";
GRANT REFERENCES ON public."alma_eventos" TO "postgres";
GRANT TRIGGER ON public."alma_eventos" TO "postgres";
GRANT MAINTAIN ON public."alma_eventos" TO "postgres";
GRANT INSERT ON public."alma_eventos" TO "anon";
GRANT SELECT ON public."alma_eventos" TO "anon";
GRANT UPDATE ON public."alma_eventos" TO "anon";
GRANT DELETE ON public."alma_eventos" TO "anon";
GRANT TRUNCATE ON public."alma_eventos" TO "anon";
GRANT REFERENCES ON public."alma_eventos" TO "anon";
GRANT TRIGGER ON public."alma_eventos" TO "anon";
GRANT MAINTAIN ON public."alma_eventos" TO "anon";
GRANT INSERT ON public."alma_eventos" TO "authenticated";
GRANT SELECT ON public."alma_eventos" TO "authenticated";
GRANT UPDATE ON public."alma_eventos" TO "authenticated";
GRANT DELETE ON public."alma_eventos" TO "authenticated";
GRANT TRUNCATE ON public."alma_eventos" TO "authenticated";
GRANT REFERENCES ON public."alma_eventos" TO "authenticated";
GRANT TRIGGER ON public."alma_eventos" TO "authenticated";
GRANT MAINTAIN ON public."alma_eventos" TO "authenticated";
GRANT INSERT ON public."alma_eventos" TO "service_role";
GRANT SELECT ON public."alma_eventos" TO "service_role";
GRANT UPDATE ON public."alma_eventos" TO "service_role";
GRANT DELETE ON public."alma_eventos" TO "service_role";
GRANT TRUNCATE ON public."alma_eventos" TO "service_role";
GRANT REFERENCES ON public."alma_eventos" TO "service_role";
GRANT TRIGGER ON public."alma_eventos" TO "service_role";
GRANT MAINTAIN ON public."alma_eventos" TO "service_role";
ALTER TABLE public."alma_objetivo" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."alma_objetivo" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."alma_objetivo" TO "postgres";
GRANT SELECT ON public."alma_objetivo" TO "postgres";
GRANT UPDATE ON public."alma_objetivo" TO "postgres";
GRANT DELETE ON public."alma_objetivo" TO "postgres";
GRANT TRUNCATE ON public."alma_objetivo" TO "postgres";
GRANT REFERENCES ON public."alma_objetivo" TO "postgres";
GRANT TRIGGER ON public."alma_objetivo" TO "postgres";
GRANT MAINTAIN ON public."alma_objetivo" TO "postgres";
GRANT INSERT ON public."alma_objetivo" TO "anon";
GRANT SELECT ON public."alma_objetivo" TO "anon";
GRANT UPDATE ON public."alma_objetivo" TO "anon";
GRANT DELETE ON public."alma_objetivo" TO "anon";
GRANT TRUNCATE ON public."alma_objetivo" TO "anon";
GRANT REFERENCES ON public."alma_objetivo" TO "anon";
GRANT TRIGGER ON public."alma_objetivo" TO "anon";
GRANT MAINTAIN ON public."alma_objetivo" TO "anon";
GRANT INSERT ON public."alma_objetivo" TO "authenticated";
GRANT SELECT ON public."alma_objetivo" TO "authenticated";
GRANT UPDATE ON public."alma_objetivo" TO "authenticated";
GRANT DELETE ON public."alma_objetivo" TO "authenticated";
GRANT TRUNCATE ON public."alma_objetivo" TO "authenticated";
GRANT REFERENCES ON public."alma_objetivo" TO "authenticated";
GRANT TRIGGER ON public."alma_objetivo" TO "authenticated";
GRANT MAINTAIN ON public."alma_objetivo" TO "authenticated";
GRANT INSERT ON public."alma_objetivo" TO "service_role";
GRANT SELECT ON public."alma_objetivo" TO "service_role";
GRANT UPDATE ON public."alma_objetivo" TO "service_role";
GRANT DELETE ON public."alma_objetivo" TO "service_role";
GRANT TRUNCATE ON public."alma_objetivo" TO "service_role";
GRANT REFERENCES ON public."alma_objetivo" TO "service_role";
GRANT TRIGGER ON public."alma_objetivo" TO "service_role";
GRANT MAINTAIN ON public."alma_objetivo" TO "service_role";
ALTER TABLE public."alma_pulsoes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."alma_pulsoes" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."alma_pulsoes" TO "postgres";
GRANT SELECT ON public."alma_pulsoes" TO "postgres";
GRANT UPDATE ON public."alma_pulsoes" TO "postgres";
GRANT DELETE ON public."alma_pulsoes" TO "postgres";
GRANT TRUNCATE ON public."alma_pulsoes" TO "postgres";
GRANT REFERENCES ON public."alma_pulsoes" TO "postgres";
GRANT TRIGGER ON public."alma_pulsoes" TO "postgres";
GRANT MAINTAIN ON public."alma_pulsoes" TO "postgres";
GRANT INSERT ON public."alma_pulsoes" TO "anon";
GRANT SELECT ON public."alma_pulsoes" TO "anon";
GRANT UPDATE ON public."alma_pulsoes" TO "anon";
GRANT DELETE ON public."alma_pulsoes" TO "anon";
GRANT TRUNCATE ON public."alma_pulsoes" TO "anon";
GRANT REFERENCES ON public."alma_pulsoes" TO "anon";
GRANT TRIGGER ON public."alma_pulsoes" TO "anon";
GRANT MAINTAIN ON public."alma_pulsoes" TO "anon";
GRANT INSERT ON public."alma_pulsoes" TO "authenticated";
GRANT SELECT ON public."alma_pulsoes" TO "authenticated";
GRANT UPDATE ON public."alma_pulsoes" TO "authenticated";
GRANT DELETE ON public."alma_pulsoes" TO "authenticated";
GRANT TRUNCATE ON public."alma_pulsoes" TO "authenticated";
GRANT REFERENCES ON public."alma_pulsoes" TO "authenticated";
GRANT TRIGGER ON public."alma_pulsoes" TO "authenticated";
GRANT MAINTAIN ON public."alma_pulsoes" TO "authenticated";
GRANT INSERT ON public."alma_pulsoes" TO "service_role";
GRANT SELECT ON public."alma_pulsoes" TO "service_role";
GRANT UPDATE ON public."alma_pulsoes" TO "service_role";
GRANT DELETE ON public."alma_pulsoes" TO "service_role";
GRANT TRUNCATE ON public."alma_pulsoes" TO "service_role";
GRANT REFERENCES ON public."alma_pulsoes" TO "service_role";
GRANT TRIGGER ON public."alma_pulsoes" TO "service_role";
GRANT MAINTAIN ON public."alma_pulsoes" TO "service_role";
ALTER TABLE public."alma_sombra" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."alma_sombra" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."alma_sombra" TO "postgres";
GRANT SELECT ON public."alma_sombra" TO "postgres";
GRANT UPDATE ON public."alma_sombra" TO "postgres";
GRANT DELETE ON public."alma_sombra" TO "postgres";
GRANT TRUNCATE ON public."alma_sombra" TO "postgres";
GRANT REFERENCES ON public."alma_sombra" TO "postgres";
GRANT TRIGGER ON public."alma_sombra" TO "postgres";
GRANT MAINTAIN ON public."alma_sombra" TO "postgres";
GRANT INSERT ON public."alma_sombra" TO "anon";
GRANT SELECT ON public."alma_sombra" TO "anon";
GRANT UPDATE ON public."alma_sombra" TO "anon";
GRANT DELETE ON public."alma_sombra" TO "anon";
GRANT TRUNCATE ON public."alma_sombra" TO "anon";
GRANT REFERENCES ON public."alma_sombra" TO "anon";
GRANT TRIGGER ON public."alma_sombra" TO "anon";
GRANT MAINTAIN ON public."alma_sombra" TO "anon";
GRANT INSERT ON public."alma_sombra" TO "authenticated";
GRANT SELECT ON public."alma_sombra" TO "authenticated";
GRANT UPDATE ON public."alma_sombra" TO "authenticated";
GRANT DELETE ON public."alma_sombra" TO "authenticated";
GRANT TRUNCATE ON public."alma_sombra" TO "authenticated";
GRANT REFERENCES ON public."alma_sombra" TO "authenticated";
GRANT TRIGGER ON public."alma_sombra" TO "authenticated";
GRANT MAINTAIN ON public."alma_sombra" TO "authenticated";
GRANT INSERT ON public."alma_sombra" TO "service_role";
GRANT SELECT ON public."alma_sombra" TO "service_role";
GRANT UPDATE ON public."alma_sombra" TO "service_role";
GRANT DELETE ON public."alma_sombra" TO "service_role";
GRANT TRUNCATE ON public."alma_sombra" TO "service_role";
GRANT REFERENCES ON public."alma_sombra" TO "service_role";
GRANT TRIGGER ON public."alma_sombra" TO "service_role";
GRANT MAINTAIN ON public."alma_sombra" TO "service_role";
ALTER TABLE public."audiences" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."audiences" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."audiences" TO "postgres";
GRANT SELECT ON public."audiences" TO "postgres";
GRANT UPDATE ON public."audiences" TO "postgres";
GRANT DELETE ON public."audiences" TO "postgres";
GRANT TRUNCATE ON public."audiences" TO "postgres";
GRANT REFERENCES ON public."audiences" TO "postgres";
GRANT TRIGGER ON public."audiences" TO "postgres";
GRANT MAINTAIN ON public."audiences" TO "postgres";
GRANT INSERT ON public."audiences" TO "anon";
GRANT SELECT ON public."audiences" TO "anon";
GRANT UPDATE ON public."audiences" TO "anon";
GRANT DELETE ON public."audiences" TO "anon";
GRANT TRUNCATE ON public."audiences" TO "anon";
GRANT REFERENCES ON public."audiences" TO "anon";
GRANT TRIGGER ON public."audiences" TO "anon";
GRANT MAINTAIN ON public."audiences" TO "anon";
GRANT INSERT ON public."audiences" TO "authenticated";
GRANT SELECT ON public."audiences" TO "authenticated";
GRANT UPDATE ON public."audiences" TO "authenticated";
GRANT DELETE ON public."audiences" TO "authenticated";
GRANT TRUNCATE ON public."audiences" TO "authenticated";
GRANT REFERENCES ON public."audiences" TO "authenticated";
GRANT TRIGGER ON public."audiences" TO "authenticated";
GRANT MAINTAIN ON public."audiences" TO "authenticated";
GRANT INSERT ON public."audiences" TO "service_role";
GRANT SELECT ON public."audiences" TO "service_role";
GRANT UPDATE ON public."audiences" TO "service_role";
GRANT DELETE ON public."audiences" TO "service_role";
GRANT TRUNCATE ON public."audiences" TO "service_role";
GRANT REFERENCES ON public."audiences" TO "service_role";
GRANT TRIGGER ON public."audiences" TO "service_role";
GRANT MAINTAIN ON public."audiences" TO "service_role";
ALTER TABLE public."bee_analogies" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_analogies" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_analogies" TO "postgres";
GRANT SELECT ON public."bee_analogies" TO "postgres";
GRANT UPDATE ON public."bee_analogies" TO "postgres";
GRANT DELETE ON public."bee_analogies" TO "postgres";
GRANT TRUNCATE ON public."bee_analogies" TO "postgres";
GRANT REFERENCES ON public."bee_analogies" TO "postgres";
GRANT TRIGGER ON public."bee_analogies" TO "postgres";
GRANT MAINTAIN ON public."bee_analogies" TO "postgres";
GRANT INSERT ON public."bee_analogies" TO "anon";
GRANT SELECT ON public."bee_analogies" TO "anon";
GRANT UPDATE ON public."bee_analogies" TO "anon";
GRANT DELETE ON public."bee_analogies" TO "anon";
GRANT TRUNCATE ON public."bee_analogies" TO "anon";
GRANT REFERENCES ON public."bee_analogies" TO "anon";
GRANT TRIGGER ON public."bee_analogies" TO "anon";
GRANT MAINTAIN ON public."bee_analogies" TO "anon";
GRANT INSERT ON public."bee_analogies" TO "authenticated";
GRANT SELECT ON public."bee_analogies" TO "authenticated";
GRANT UPDATE ON public."bee_analogies" TO "authenticated";
GRANT DELETE ON public."bee_analogies" TO "authenticated";
GRANT TRUNCATE ON public."bee_analogies" TO "authenticated";
GRANT REFERENCES ON public."bee_analogies" TO "authenticated";
GRANT TRIGGER ON public."bee_analogies" TO "authenticated";
GRANT MAINTAIN ON public."bee_analogies" TO "authenticated";
GRANT INSERT ON public."bee_analogies" TO "service_role";
GRANT SELECT ON public."bee_analogies" TO "service_role";
GRANT UPDATE ON public."bee_analogies" TO "service_role";
GRANT DELETE ON public."bee_analogies" TO "service_role";
GRANT TRUNCATE ON public."bee_analogies" TO "service_role";
GRANT REFERENCES ON public."bee_analogies" TO "service_role";
GRANT TRIGGER ON public."bee_analogies" TO "service_role";
GRANT MAINTAIN ON public."bee_analogies" TO "service_role";
ALTER TABLE public."bee_arsenal" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_arsenal" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_arsenal" TO "postgres";
GRANT SELECT ON public."bee_arsenal" TO "postgres";
GRANT UPDATE ON public."bee_arsenal" TO "postgres";
GRANT DELETE ON public."bee_arsenal" TO "postgres";
GRANT TRUNCATE ON public."bee_arsenal" TO "postgres";
GRANT REFERENCES ON public."bee_arsenal" TO "postgres";
GRANT TRIGGER ON public."bee_arsenal" TO "postgres";
GRANT MAINTAIN ON public."bee_arsenal" TO "postgres";
GRANT INSERT ON public."bee_arsenal" TO "anon";
GRANT SELECT ON public."bee_arsenal" TO "anon";
GRANT UPDATE ON public."bee_arsenal" TO "anon";
GRANT DELETE ON public."bee_arsenal" TO "anon";
GRANT TRUNCATE ON public."bee_arsenal" TO "anon";
GRANT REFERENCES ON public."bee_arsenal" TO "anon";
GRANT TRIGGER ON public."bee_arsenal" TO "anon";
GRANT MAINTAIN ON public."bee_arsenal" TO "anon";
GRANT INSERT ON public."bee_arsenal" TO "authenticated";
GRANT SELECT ON public."bee_arsenal" TO "authenticated";
GRANT UPDATE ON public."bee_arsenal" TO "authenticated";
GRANT DELETE ON public."bee_arsenal" TO "authenticated";
GRANT TRUNCATE ON public."bee_arsenal" TO "authenticated";
GRANT REFERENCES ON public."bee_arsenal" TO "authenticated";
GRANT TRIGGER ON public."bee_arsenal" TO "authenticated";
GRANT MAINTAIN ON public."bee_arsenal" TO "authenticated";
GRANT INSERT ON public."bee_arsenal" TO "service_role";
GRANT SELECT ON public."bee_arsenal" TO "service_role";
GRANT UPDATE ON public."bee_arsenal" TO "service_role";
GRANT DELETE ON public."bee_arsenal" TO "service_role";
GRANT TRUNCATE ON public."bee_arsenal" TO "service_role";
GRANT REFERENCES ON public."bee_arsenal" TO "service_role";
GRANT TRIGGER ON public."bee_arsenal" TO "service_role";
GRANT MAINTAIN ON public."bee_arsenal" TO "service_role";
ALTER TABLE public."bee_avatars" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_avatars" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_avatars" TO "postgres";
GRANT SELECT ON public."bee_avatars" TO "postgres";
GRANT UPDATE ON public."bee_avatars" TO "postgres";
GRANT DELETE ON public."bee_avatars" TO "postgres";
GRANT TRUNCATE ON public."bee_avatars" TO "postgres";
GRANT REFERENCES ON public."bee_avatars" TO "postgres";
GRANT TRIGGER ON public."bee_avatars" TO "postgres";
GRANT MAINTAIN ON public."bee_avatars" TO "postgres";
GRANT INSERT ON public."bee_avatars" TO "anon";
GRANT SELECT ON public."bee_avatars" TO "anon";
GRANT UPDATE ON public."bee_avatars" TO "anon";
GRANT DELETE ON public."bee_avatars" TO "anon";
GRANT TRUNCATE ON public."bee_avatars" TO "anon";
GRANT REFERENCES ON public."bee_avatars" TO "anon";
GRANT TRIGGER ON public."bee_avatars" TO "anon";
GRANT MAINTAIN ON public."bee_avatars" TO "anon";
GRANT INSERT ON public."bee_avatars" TO "authenticated";
GRANT SELECT ON public."bee_avatars" TO "authenticated";
GRANT UPDATE ON public."bee_avatars" TO "authenticated";
GRANT DELETE ON public."bee_avatars" TO "authenticated";
GRANT TRUNCATE ON public."bee_avatars" TO "authenticated";
GRANT REFERENCES ON public."bee_avatars" TO "authenticated";
GRANT TRIGGER ON public."bee_avatars" TO "authenticated";
GRANT MAINTAIN ON public."bee_avatars" TO "authenticated";
GRANT INSERT ON public."bee_avatars" TO "service_role";
GRANT SELECT ON public."bee_avatars" TO "service_role";
GRANT UPDATE ON public."bee_avatars" TO "service_role";
GRANT DELETE ON public."bee_avatars" TO "service_role";
GRANT TRUNCATE ON public."bee_avatars" TO "service_role";
GRANT REFERENCES ON public."bee_avatars" TO "service_role";
GRANT TRIGGER ON public."bee_avatars" TO "service_role";
GRANT MAINTAIN ON public."bee_avatars" TO "service_role";
ALTER TABLE public."bee_directives" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_directives" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_directives" TO "postgres";
GRANT SELECT ON public."bee_directives" TO "postgres";
GRANT UPDATE ON public."bee_directives" TO "postgres";
GRANT DELETE ON public."bee_directives" TO "postgres";
GRANT TRUNCATE ON public."bee_directives" TO "postgres";
GRANT REFERENCES ON public."bee_directives" TO "postgres";
GRANT TRIGGER ON public."bee_directives" TO "postgres";
GRANT MAINTAIN ON public."bee_directives" TO "postgres";
GRANT INSERT ON public."bee_directives" TO "anon";
GRANT SELECT ON public."bee_directives" TO "anon";
GRANT UPDATE ON public."bee_directives" TO "anon";
GRANT DELETE ON public."bee_directives" TO "anon";
GRANT TRUNCATE ON public."bee_directives" TO "anon";
GRANT REFERENCES ON public."bee_directives" TO "anon";
GRANT TRIGGER ON public."bee_directives" TO "anon";
GRANT MAINTAIN ON public."bee_directives" TO "anon";
GRANT INSERT ON public."bee_directives" TO "authenticated";
GRANT SELECT ON public."bee_directives" TO "authenticated";
GRANT UPDATE ON public."bee_directives" TO "authenticated";
GRANT DELETE ON public."bee_directives" TO "authenticated";
GRANT TRUNCATE ON public."bee_directives" TO "authenticated";
GRANT REFERENCES ON public."bee_directives" TO "authenticated";
GRANT TRIGGER ON public."bee_directives" TO "authenticated";
GRANT MAINTAIN ON public."bee_directives" TO "authenticated";
GRANT INSERT ON public."bee_directives" TO "service_role";
GRANT SELECT ON public."bee_directives" TO "service_role";
GRANT UPDATE ON public."bee_directives" TO "service_role";
GRANT DELETE ON public."bee_directives" TO "service_role";
GRANT TRUNCATE ON public."bee_directives" TO "service_role";
GRANT REFERENCES ON public."bee_directives" TO "service_role";
GRANT TRIGGER ON public."bee_directives" TO "service_role";
GRANT MAINTAIN ON public."bee_directives" TO "service_role";
ALTER TABLE public."bee_editorials" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_editorials" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_editorials" TO "postgres";
GRANT SELECT ON public."bee_editorials" TO "postgres";
GRANT UPDATE ON public."bee_editorials" TO "postgres";
GRANT DELETE ON public."bee_editorials" TO "postgres";
GRANT TRUNCATE ON public."bee_editorials" TO "postgres";
GRANT REFERENCES ON public."bee_editorials" TO "postgres";
GRANT TRIGGER ON public."bee_editorials" TO "postgres";
GRANT MAINTAIN ON public."bee_editorials" TO "postgres";
GRANT INSERT ON public."bee_editorials" TO "anon";
GRANT SELECT ON public."bee_editorials" TO "anon";
GRANT UPDATE ON public."bee_editorials" TO "anon";
GRANT DELETE ON public."bee_editorials" TO "anon";
GRANT TRUNCATE ON public."bee_editorials" TO "anon";
GRANT REFERENCES ON public."bee_editorials" TO "anon";
GRANT TRIGGER ON public."bee_editorials" TO "anon";
GRANT MAINTAIN ON public."bee_editorials" TO "anon";
GRANT INSERT ON public."bee_editorials" TO "authenticated";
GRANT SELECT ON public."bee_editorials" TO "authenticated";
GRANT UPDATE ON public."bee_editorials" TO "authenticated";
GRANT DELETE ON public."bee_editorials" TO "authenticated";
GRANT TRUNCATE ON public."bee_editorials" TO "authenticated";
GRANT REFERENCES ON public."bee_editorials" TO "authenticated";
GRANT TRIGGER ON public."bee_editorials" TO "authenticated";
GRANT MAINTAIN ON public."bee_editorials" TO "authenticated";
GRANT INSERT ON public."bee_editorials" TO "service_role";
GRANT SELECT ON public."bee_editorials" TO "service_role";
GRANT UPDATE ON public."bee_editorials" TO "service_role";
GRANT DELETE ON public."bee_editorials" TO "service_role";
GRANT TRUNCATE ON public."bee_editorials" TO "service_role";
GRANT REFERENCES ON public."bee_editorials" TO "service_role";
GRANT TRIGGER ON public."bee_editorials" TO "service_role";
GRANT MAINTAIN ON public."bee_editorials" TO "service_role";
ALTER TABLE public."bee_example_posts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_example_posts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_example_posts" TO "postgres";
GRANT SELECT ON public."bee_example_posts" TO "postgres";
GRANT UPDATE ON public."bee_example_posts" TO "postgres";
GRANT DELETE ON public."bee_example_posts" TO "postgres";
GRANT TRUNCATE ON public."bee_example_posts" TO "postgres";
GRANT REFERENCES ON public."bee_example_posts" TO "postgres";
GRANT TRIGGER ON public."bee_example_posts" TO "postgres";
GRANT MAINTAIN ON public."bee_example_posts" TO "postgres";
GRANT INSERT ON public."bee_example_posts" TO "anon";
GRANT SELECT ON public."bee_example_posts" TO "anon";
GRANT UPDATE ON public."bee_example_posts" TO "anon";
GRANT DELETE ON public."bee_example_posts" TO "anon";
GRANT TRUNCATE ON public."bee_example_posts" TO "anon";
GRANT REFERENCES ON public."bee_example_posts" TO "anon";
GRANT TRIGGER ON public."bee_example_posts" TO "anon";
GRANT MAINTAIN ON public."bee_example_posts" TO "anon";
GRANT INSERT ON public."bee_example_posts" TO "authenticated";
GRANT SELECT ON public."bee_example_posts" TO "authenticated";
GRANT UPDATE ON public."bee_example_posts" TO "authenticated";
GRANT DELETE ON public."bee_example_posts" TO "authenticated";
GRANT TRUNCATE ON public."bee_example_posts" TO "authenticated";
GRANT REFERENCES ON public."bee_example_posts" TO "authenticated";
GRANT TRIGGER ON public."bee_example_posts" TO "authenticated";
GRANT MAINTAIN ON public."bee_example_posts" TO "authenticated";
GRANT INSERT ON public."bee_example_posts" TO "service_role";
GRANT SELECT ON public."bee_example_posts" TO "service_role";
GRANT UPDATE ON public."bee_example_posts" TO "service_role";
GRANT DELETE ON public."bee_example_posts" TO "service_role";
GRANT TRUNCATE ON public."bee_example_posts" TO "service_role";
GRANT REFERENCES ON public."bee_example_posts" TO "service_role";
GRANT TRIGGER ON public."bee_example_posts" TO "service_role";
GRANT MAINTAIN ON public."bee_example_posts" TO "service_role";
ALTER TABLE public."bee_glossary" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_glossary" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_glossary" TO "postgres";
GRANT SELECT ON public."bee_glossary" TO "postgres";
GRANT UPDATE ON public."bee_glossary" TO "postgres";
GRANT DELETE ON public."bee_glossary" TO "postgres";
GRANT TRUNCATE ON public."bee_glossary" TO "postgres";
GRANT REFERENCES ON public."bee_glossary" TO "postgres";
GRANT TRIGGER ON public."bee_glossary" TO "postgres";
GRANT MAINTAIN ON public."bee_glossary" TO "postgres";
GRANT INSERT ON public."bee_glossary" TO "anon";
GRANT SELECT ON public."bee_glossary" TO "anon";
GRANT UPDATE ON public."bee_glossary" TO "anon";
GRANT DELETE ON public."bee_glossary" TO "anon";
GRANT TRUNCATE ON public."bee_glossary" TO "anon";
GRANT REFERENCES ON public."bee_glossary" TO "anon";
GRANT TRIGGER ON public."bee_glossary" TO "anon";
GRANT MAINTAIN ON public."bee_glossary" TO "anon";
GRANT INSERT ON public."bee_glossary" TO "authenticated";
GRANT SELECT ON public."bee_glossary" TO "authenticated";
GRANT UPDATE ON public."bee_glossary" TO "authenticated";
GRANT DELETE ON public."bee_glossary" TO "authenticated";
GRANT TRUNCATE ON public."bee_glossary" TO "authenticated";
GRANT REFERENCES ON public."bee_glossary" TO "authenticated";
GRANT TRIGGER ON public."bee_glossary" TO "authenticated";
GRANT MAINTAIN ON public."bee_glossary" TO "authenticated";
GRANT INSERT ON public."bee_glossary" TO "service_role";
GRANT SELECT ON public."bee_glossary" TO "service_role";
GRANT UPDATE ON public."bee_glossary" TO "service_role";
GRANT DELETE ON public."bee_glossary" TO "service_role";
GRANT TRUNCATE ON public."bee_glossary" TO "service_role";
GRANT REFERENCES ON public."bee_glossary" TO "service_role";
GRANT TRIGGER ON public."bee_glossary" TO "service_role";
GRANT MAINTAIN ON public."bee_glossary" TO "service_role";
ALTER TABLE public."bee_hashtags" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_hashtags" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_hashtags" TO "postgres";
GRANT SELECT ON public."bee_hashtags" TO "postgres";
GRANT UPDATE ON public."bee_hashtags" TO "postgres";
GRANT DELETE ON public."bee_hashtags" TO "postgres";
GRANT TRUNCATE ON public."bee_hashtags" TO "postgres";
GRANT REFERENCES ON public."bee_hashtags" TO "postgres";
GRANT TRIGGER ON public."bee_hashtags" TO "postgres";
GRANT MAINTAIN ON public."bee_hashtags" TO "postgres";
GRANT INSERT ON public."bee_hashtags" TO "anon";
GRANT SELECT ON public."bee_hashtags" TO "anon";
GRANT UPDATE ON public."bee_hashtags" TO "anon";
GRANT DELETE ON public."bee_hashtags" TO "anon";
GRANT TRUNCATE ON public."bee_hashtags" TO "anon";
GRANT REFERENCES ON public."bee_hashtags" TO "anon";
GRANT TRIGGER ON public."bee_hashtags" TO "anon";
GRANT MAINTAIN ON public."bee_hashtags" TO "anon";
GRANT INSERT ON public."bee_hashtags" TO "authenticated";
GRANT SELECT ON public."bee_hashtags" TO "authenticated";
GRANT UPDATE ON public."bee_hashtags" TO "authenticated";
GRANT DELETE ON public."bee_hashtags" TO "authenticated";
GRANT TRUNCATE ON public."bee_hashtags" TO "authenticated";
GRANT REFERENCES ON public."bee_hashtags" TO "authenticated";
GRANT TRIGGER ON public."bee_hashtags" TO "authenticated";
GRANT MAINTAIN ON public."bee_hashtags" TO "authenticated";
GRANT INSERT ON public."bee_hashtags" TO "service_role";
GRANT SELECT ON public."bee_hashtags" TO "service_role";
GRANT UPDATE ON public."bee_hashtags" TO "service_role";
GRANT DELETE ON public."bee_hashtags" TO "service_role";
GRANT TRUNCATE ON public."bee_hashtags" TO "service_role";
GRANT REFERENCES ON public."bee_hashtags" TO "service_role";
GRANT TRIGGER ON public."bee_hashtags" TO "service_role";
GRANT MAINTAIN ON public."bee_hashtags" TO "service_role";
ALTER TABLE public."bee_headline_types" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_headline_types" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_headline_types" TO "postgres";
GRANT SELECT ON public."bee_headline_types" TO "postgres";
GRANT UPDATE ON public."bee_headline_types" TO "postgres";
GRANT DELETE ON public."bee_headline_types" TO "postgres";
GRANT TRUNCATE ON public."bee_headline_types" TO "postgres";
GRANT REFERENCES ON public."bee_headline_types" TO "postgres";
GRANT TRIGGER ON public."bee_headline_types" TO "postgres";
GRANT MAINTAIN ON public."bee_headline_types" TO "postgres";
GRANT INSERT ON public."bee_headline_types" TO "anon";
GRANT SELECT ON public."bee_headline_types" TO "anon";
GRANT UPDATE ON public."bee_headline_types" TO "anon";
GRANT DELETE ON public."bee_headline_types" TO "anon";
GRANT TRUNCATE ON public."bee_headline_types" TO "anon";
GRANT REFERENCES ON public."bee_headline_types" TO "anon";
GRANT TRIGGER ON public."bee_headline_types" TO "anon";
GRANT MAINTAIN ON public."bee_headline_types" TO "anon";
GRANT INSERT ON public."bee_headline_types" TO "authenticated";
GRANT SELECT ON public."bee_headline_types" TO "authenticated";
GRANT UPDATE ON public."bee_headline_types" TO "authenticated";
GRANT DELETE ON public."bee_headline_types" TO "authenticated";
GRANT TRUNCATE ON public."bee_headline_types" TO "authenticated";
GRANT REFERENCES ON public."bee_headline_types" TO "authenticated";
GRANT TRIGGER ON public."bee_headline_types" TO "authenticated";
GRANT MAINTAIN ON public."bee_headline_types" TO "authenticated";
GRANT INSERT ON public."bee_headline_types" TO "service_role";
GRANT SELECT ON public."bee_headline_types" TO "service_role";
GRANT UPDATE ON public."bee_headline_types" TO "service_role";
GRANT DELETE ON public."bee_headline_types" TO "service_role";
GRANT TRUNCATE ON public."bee_headline_types" TO "service_role";
GRANT REFERENCES ON public."bee_headline_types" TO "service_role";
GRANT TRIGGER ON public."bee_headline_types" TO "service_role";
GRANT MAINTAIN ON public."bee_headline_types" TO "service_role";
ALTER TABLE public."bee_logics" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_logics" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_logics" TO "postgres";
GRANT SELECT ON public."bee_logics" TO "postgres";
GRANT UPDATE ON public."bee_logics" TO "postgres";
GRANT DELETE ON public."bee_logics" TO "postgres";
GRANT TRUNCATE ON public."bee_logics" TO "postgres";
GRANT REFERENCES ON public."bee_logics" TO "postgres";
GRANT TRIGGER ON public."bee_logics" TO "postgres";
GRANT MAINTAIN ON public."bee_logics" TO "postgres";
GRANT INSERT ON public."bee_logics" TO "anon";
GRANT SELECT ON public."bee_logics" TO "anon";
GRANT UPDATE ON public."bee_logics" TO "anon";
GRANT DELETE ON public."bee_logics" TO "anon";
GRANT TRUNCATE ON public."bee_logics" TO "anon";
GRANT REFERENCES ON public."bee_logics" TO "anon";
GRANT TRIGGER ON public."bee_logics" TO "anon";
GRANT MAINTAIN ON public."bee_logics" TO "anon";
GRANT INSERT ON public."bee_logics" TO "authenticated";
GRANT SELECT ON public."bee_logics" TO "authenticated";
GRANT UPDATE ON public."bee_logics" TO "authenticated";
GRANT DELETE ON public."bee_logics" TO "authenticated";
GRANT TRUNCATE ON public."bee_logics" TO "authenticated";
GRANT REFERENCES ON public."bee_logics" TO "authenticated";
GRANT TRIGGER ON public."bee_logics" TO "authenticated";
GRANT MAINTAIN ON public."bee_logics" TO "authenticated";
GRANT INSERT ON public."bee_logics" TO "service_role";
GRANT SELECT ON public."bee_logics" TO "service_role";
GRANT UPDATE ON public."bee_logics" TO "service_role";
GRANT DELETE ON public."bee_logics" TO "service_role";
GRANT TRUNCATE ON public."bee_logics" TO "service_role";
GRANT REFERENCES ON public."bee_logics" TO "service_role";
GRANT TRIGGER ON public."bee_logics" TO "service_role";
GRANT MAINTAIN ON public."bee_logics" TO "service_role";
ALTER TABLE public."bee_personas" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_personas" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_personas" TO "postgres";
GRANT SELECT ON public."bee_personas" TO "postgres";
GRANT UPDATE ON public."bee_personas" TO "postgres";
GRANT DELETE ON public."bee_personas" TO "postgres";
GRANT TRUNCATE ON public."bee_personas" TO "postgres";
GRANT REFERENCES ON public."bee_personas" TO "postgres";
GRANT TRIGGER ON public."bee_personas" TO "postgres";
GRANT MAINTAIN ON public."bee_personas" TO "postgres";
GRANT INSERT ON public."bee_personas" TO "anon";
GRANT SELECT ON public."bee_personas" TO "anon";
GRANT UPDATE ON public."bee_personas" TO "anon";
GRANT DELETE ON public."bee_personas" TO "anon";
GRANT TRUNCATE ON public."bee_personas" TO "anon";
GRANT REFERENCES ON public."bee_personas" TO "anon";
GRANT TRIGGER ON public."bee_personas" TO "anon";
GRANT MAINTAIN ON public."bee_personas" TO "anon";
GRANT INSERT ON public."bee_personas" TO "authenticated";
GRANT SELECT ON public."bee_personas" TO "authenticated";
GRANT UPDATE ON public."bee_personas" TO "authenticated";
GRANT DELETE ON public."bee_personas" TO "authenticated";
GRANT TRUNCATE ON public."bee_personas" TO "authenticated";
GRANT REFERENCES ON public."bee_personas" TO "authenticated";
GRANT TRIGGER ON public."bee_personas" TO "authenticated";
GRANT MAINTAIN ON public."bee_personas" TO "authenticated";
GRANT INSERT ON public."bee_personas" TO "service_role";
GRANT SELECT ON public."bee_personas" TO "service_role";
GRANT UPDATE ON public."bee_personas" TO "service_role";
GRANT DELETE ON public."bee_personas" TO "service_role";
GRANT TRUNCATE ON public."bee_personas" TO "service_role";
GRANT REFERENCES ON public."bee_personas" TO "service_role";
GRANT TRIGGER ON public."bee_personas" TO "service_role";
GRANT MAINTAIN ON public."bee_personas" TO "service_role";
ALTER TABLE public."bee_products" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_products" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_products" TO "postgres";
GRANT SELECT ON public."bee_products" TO "postgres";
GRANT UPDATE ON public."bee_products" TO "postgres";
GRANT DELETE ON public."bee_products" TO "postgres";
GRANT TRUNCATE ON public."bee_products" TO "postgres";
GRANT REFERENCES ON public."bee_products" TO "postgres";
GRANT TRIGGER ON public."bee_products" TO "postgres";
GRANT MAINTAIN ON public."bee_products" TO "postgres";
GRANT INSERT ON public."bee_products" TO "anon";
GRANT SELECT ON public."bee_products" TO "anon";
GRANT UPDATE ON public."bee_products" TO "anon";
GRANT DELETE ON public."bee_products" TO "anon";
GRANT TRUNCATE ON public."bee_products" TO "anon";
GRANT REFERENCES ON public."bee_products" TO "anon";
GRANT TRIGGER ON public."bee_products" TO "anon";
GRANT MAINTAIN ON public."bee_products" TO "anon";
GRANT INSERT ON public."bee_products" TO "authenticated";
GRANT SELECT ON public."bee_products" TO "authenticated";
GRANT UPDATE ON public."bee_products" TO "authenticated";
GRANT DELETE ON public."bee_products" TO "authenticated";
GRANT TRUNCATE ON public."bee_products" TO "authenticated";
GRANT REFERENCES ON public."bee_products" TO "authenticated";
GRANT TRIGGER ON public."bee_products" TO "authenticated";
GRANT MAINTAIN ON public."bee_products" TO "authenticated";
GRANT INSERT ON public."bee_products" TO "service_role";
GRANT SELECT ON public."bee_products" TO "service_role";
GRANT UPDATE ON public."bee_products" TO "service_role";
GRANT DELETE ON public."bee_products" TO "service_role";
GRANT TRUNCATE ON public."bee_products" TO "service_role";
GRANT REFERENCES ON public."bee_products" TO "service_role";
GRANT TRIGGER ON public."bee_products" TO "service_role";
GRANT MAINTAIN ON public."bee_products" TO "service_role";
ALTER TABLE public."bee_style_rules" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_style_rules" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_style_rules" TO "postgres";
GRANT SELECT ON public."bee_style_rules" TO "postgres";
GRANT UPDATE ON public."bee_style_rules" TO "postgres";
GRANT DELETE ON public."bee_style_rules" TO "postgres";
GRANT TRUNCATE ON public."bee_style_rules" TO "postgres";
GRANT REFERENCES ON public."bee_style_rules" TO "postgres";
GRANT TRIGGER ON public."bee_style_rules" TO "postgres";
GRANT MAINTAIN ON public."bee_style_rules" TO "postgres";
GRANT INSERT ON public."bee_style_rules" TO "anon";
GRANT SELECT ON public."bee_style_rules" TO "anon";
GRANT UPDATE ON public."bee_style_rules" TO "anon";
GRANT DELETE ON public."bee_style_rules" TO "anon";
GRANT TRUNCATE ON public."bee_style_rules" TO "anon";
GRANT REFERENCES ON public."bee_style_rules" TO "anon";
GRANT TRIGGER ON public."bee_style_rules" TO "anon";
GRANT MAINTAIN ON public."bee_style_rules" TO "anon";
GRANT INSERT ON public."bee_style_rules" TO "authenticated";
GRANT SELECT ON public."bee_style_rules" TO "authenticated";
GRANT UPDATE ON public."bee_style_rules" TO "authenticated";
GRANT DELETE ON public."bee_style_rules" TO "authenticated";
GRANT TRUNCATE ON public."bee_style_rules" TO "authenticated";
GRANT REFERENCES ON public."bee_style_rules" TO "authenticated";
GRANT TRIGGER ON public."bee_style_rules" TO "authenticated";
GRANT MAINTAIN ON public."bee_style_rules" TO "authenticated";
GRANT INSERT ON public."bee_style_rules" TO "service_role";
GRANT SELECT ON public."bee_style_rules" TO "service_role";
GRANT UPDATE ON public."bee_style_rules" TO "service_role";
GRANT DELETE ON public."bee_style_rules" TO "service_role";
GRANT TRUNCATE ON public."bee_style_rules" TO "service_role";
GRANT REFERENCES ON public."bee_style_rules" TO "service_role";
GRANT TRIGGER ON public."bee_style_rules" TO "service_role";
GRANT MAINTAIN ON public."bee_style_rules" TO "service_role";
ALTER TABLE public."bee_suggestions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_suggestions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_suggestions" TO "postgres";
GRANT SELECT ON public."bee_suggestions" TO "postgres";
GRANT UPDATE ON public."bee_suggestions" TO "postgres";
GRANT DELETE ON public."bee_suggestions" TO "postgres";
GRANT TRUNCATE ON public."bee_suggestions" TO "postgres";
GRANT REFERENCES ON public."bee_suggestions" TO "postgres";
GRANT TRIGGER ON public."bee_suggestions" TO "postgres";
GRANT MAINTAIN ON public."bee_suggestions" TO "postgres";
GRANT INSERT ON public."bee_suggestions" TO "anon";
GRANT SELECT ON public."bee_suggestions" TO "anon";
GRANT UPDATE ON public."bee_suggestions" TO "anon";
GRANT DELETE ON public."bee_suggestions" TO "anon";
GRANT TRUNCATE ON public."bee_suggestions" TO "anon";
GRANT REFERENCES ON public."bee_suggestions" TO "anon";
GRANT TRIGGER ON public."bee_suggestions" TO "anon";
GRANT MAINTAIN ON public."bee_suggestions" TO "anon";
GRANT INSERT ON public."bee_suggestions" TO "authenticated";
GRANT SELECT ON public."bee_suggestions" TO "authenticated";
GRANT UPDATE ON public."bee_suggestions" TO "authenticated";
GRANT DELETE ON public."bee_suggestions" TO "authenticated";
GRANT TRUNCATE ON public."bee_suggestions" TO "authenticated";
GRANT REFERENCES ON public."bee_suggestions" TO "authenticated";
GRANT TRIGGER ON public."bee_suggestions" TO "authenticated";
GRANT MAINTAIN ON public."bee_suggestions" TO "authenticated";
GRANT INSERT ON public."bee_suggestions" TO "service_role";
GRANT SELECT ON public."bee_suggestions" TO "service_role";
GRANT UPDATE ON public."bee_suggestions" TO "service_role";
GRANT DELETE ON public."bee_suggestions" TO "service_role";
GRANT TRUNCATE ON public."bee_suggestions" TO "service_role";
GRANT REFERENCES ON public."bee_suggestions" TO "service_role";
GRANT TRIGGER ON public."bee_suggestions" TO "service_role";
GRANT MAINTAIN ON public."bee_suggestions" TO "service_role";
ALTER TABLE public."bee_themes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."bee_themes" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."bee_themes" TO "postgres";
GRANT SELECT ON public."bee_themes" TO "postgres";
GRANT UPDATE ON public."bee_themes" TO "postgres";
GRANT DELETE ON public."bee_themes" TO "postgres";
GRANT TRUNCATE ON public."bee_themes" TO "postgres";
GRANT REFERENCES ON public."bee_themes" TO "postgres";
GRANT TRIGGER ON public."bee_themes" TO "postgres";
GRANT MAINTAIN ON public."bee_themes" TO "postgres";
GRANT INSERT ON public."bee_themes" TO "anon";
GRANT SELECT ON public."bee_themes" TO "anon";
GRANT UPDATE ON public."bee_themes" TO "anon";
GRANT DELETE ON public."bee_themes" TO "anon";
GRANT TRUNCATE ON public."bee_themes" TO "anon";
GRANT REFERENCES ON public."bee_themes" TO "anon";
GRANT TRIGGER ON public."bee_themes" TO "anon";
GRANT MAINTAIN ON public."bee_themes" TO "anon";
GRANT INSERT ON public."bee_themes" TO "authenticated";
GRANT SELECT ON public."bee_themes" TO "authenticated";
GRANT UPDATE ON public."bee_themes" TO "authenticated";
GRANT DELETE ON public."bee_themes" TO "authenticated";
GRANT TRUNCATE ON public."bee_themes" TO "authenticated";
GRANT REFERENCES ON public."bee_themes" TO "authenticated";
GRANT TRIGGER ON public."bee_themes" TO "authenticated";
GRANT MAINTAIN ON public."bee_themes" TO "authenticated";
GRANT INSERT ON public."bee_themes" TO "service_role";
GRANT SELECT ON public."bee_themes" TO "service_role";
GRANT UPDATE ON public."bee_themes" TO "service_role";
GRANT DELETE ON public."bee_themes" TO "service_role";
GRANT TRUNCATE ON public."bee_themes" TO "service_role";
GRANT REFERENCES ON public."bee_themes" TO "service_role";
GRANT TRIGGER ON public."bee_themes" TO "service_role";
GRANT MAINTAIN ON public."bee_themes" TO "service_role";
ALTER TABLE public."brand_intelligence_history" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."brand_intelligence_history" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."brand_intelligence_history" TO "postgres";
GRANT SELECT ON public."brand_intelligence_history" TO "postgres";
GRANT UPDATE ON public."brand_intelligence_history" TO "postgres";
GRANT DELETE ON public."brand_intelligence_history" TO "postgres";
GRANT TRUNCATE ON public."brand_intelligence_history" TO "postgres";
GRANT REFERENCES ON public."brand_intelligence_history" TO "postgres";
GRANT TRIGGER ON public."brand_intelligence_history" TO "postgres";
GRANT MAINTAIN ON public."brand_intelligence_history" TO "postgres";
GRANT INSERT ON public."brand_intelligence_history" TO "anon";
GRANT SELECT ON public."brand_intelligence_history" TO "anon";
GRANT UPDATE ON public."brand_intelligence_history" TO "anon";
GRANT DELETE ON public."brand_intelligence_history" TO "anon";
GRANT TRUNCATE ON public."brand_intelligence_history" TO "anon";
GRANT REFERENCES ON public."brand_intelligence_history" TO "anon";
GRANT TRIGGER ON public."brand_intelligence_history" TO "anon";
GRANT MAINTAIN ON public."brand_intelligence_history" TO "anon";
GRANT INSERT ON public."brand_intelligence_history" TO "authenticated";
GRANT SELECT ON public."brand_intelligence_history" TO "authenticated";
GRANT UPDATE ON public."brand_intelligence_history" TO "authenticated";
GRANT DELETE ON public."brand_intelligence_history" TO "authenticated";
GRANT TRUNCATE ON public."brand_intelligence_history" TO "authenticated";
GRANT REFERENCES ON public."brand_intelligence_history" TO "authenticated";
GRANT TRIGGER ON public."brand_intelligence_history" TO "authenticated";
GRANT MAINTAIN ON public."brand_intelligence_history" TO "authenticated";
GRANT INSERT ON public."brand_intelligence_history" TO "service_role";
GRANT SELECT ON public."brand_intelligence_history" TO "service_role";
GRANT UPDATE ON public."brand_intelligence_history" TO "service_role";
GRANT DELETE ON public."brand_intelligence_history" TO "service_role";
GRANT TRUNCATE ON public."brand_intelligence_history" TO "service_role";
GRANT REFERENCES ON public."brand_intelligence_history" TO "service_role";
GRANT TRIGGER ON public."brand_intelligence_history" TO "service_role";
GRANT MAINTAIN ON public."brand_intelligence_history" TO "service_role";
ALTER TABLE public."brand_intelligence_settings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."brand_intelligence_settings" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."brand_intelligence_settings" TO "postgres";
GRANT SELECT ON public."brand_intelligence_settings" TO "postgres";
GRANT UPDATE ON public."brand_intelligence_settings" TO "postgres";
GRANT DELETE ON public."brand_intelligence_settings" TO "postgres";
GRANT TRUNCATE ON public."brand_intelligence_settings" TO "postgres";
GRANT REFERENCES ON public."brand_intelligence_settings" TO "postgres";
GRANT TRIGGER ON public."brand_intelligence_settings" TO "postgres";
GRANT MAINTAIN ON public."brand_intelligence_settings" TO "postgres";
GRANT INSERT ON public."brand_intelligence_settings" TO "anon";
GRANT SELECT ON public."brand_intelligence_settings" TO "anon";
GRANT UPDATE ON public."brand_intelligence_settings" TO "anon";
GRANT DELETE ON public."brand_intelligence_settings" TO "anon";
GRANT TRUNCATE ON public."brand_intelligence_settings" TO "anon";
GRANT REFERENCES ON public."brand_intelligence_settings" TO "anon";
GRANT TRIGGER ON public."brand_intelligence_settings" TO "anon";
GRANT MAINTAIN ON public."brand_intelligence_settings" TO "anon";
GRANT INSERT ON public."brand_intelligence_settings" TO "authenticated";
GRANT SELECT ON public."brand_intelligence_settings" TO "authenticated";
GRANT UPDATE ON public."brand_intelligence_settings" TO "authenticated";
GRANT DELETE ON public."brand_intelligence_settings" TO "authenticated";
GRANT TRUNCATE ON public."brand_intelligence_settings" TO "authenticated";
GRANT REFERENCES ON public."brand_intelligence_settings" TO "authenticated";
GRANT TRIGGER ON public."brand_intelligence_settings" TO "authenticated";
GRANT MAINTAIN ON public."brand_intelligence_settings" TO "authenticated";
GRANT INSERT ON public."brand_intelligence_settings" TO "service_role";
GRANT SELECT ON public."brand_intelligence_settings" TO "service_role";
GRANT UPDATE ON public."brand_intelligence_settings" TO "service_role";
GRANT DELETE ON public."brand_intelligence_settings" TO "service_role";
GRANT TRUNCATE ON public."brand_intelligence_settings" TO "service_role";
GRANT REFERENCES ON public."brand_intelligence_settings" TO "service_role";
GRANT TRIGGER ON public."brand_intelligence_settings" TO "service_role";
GRANT MAINTAIN ON public."brand_intelligence_settings" TO "service_role";
ALTER TABLE public."brands" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."brands" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."brands" TO "postgres";
GRANT SELECT ON public."brands" TO "postgres";
GRANT UPDATE ON public."brands" TO "postgres";
GRANT DELETE ON public."brands" TO "postgres";
GRANT TRUNCATE ON public."brands" TO "postgres";
GRANT REFERENCES ON public."brands" TO "postgres";
GRANT TRIGGER ON public."brands" TO "postgres";
GRANT MAINTAIN ON public."brands" TO "postgres";
GRANT INSERT ON public."brands" TO "anon";
GRANT SELECT ON public."brands" TO "anon";
GRANT UPDATE ON public."brands" TO "anon";
GRANT DELETE ON public."brands" TO "anon";
GRANT TRUNCATE ON public."brands" TO "anon";
GRANT REFERENCES ON public."brands" TO "anon";
GRANT TRIGGER ON public."brands" TO "anon";
GRANT MAINTAIN ON public."brands" TO "anon";
GRANT INSERT ON public."brands" TO "authenticated";
GRANT SELECT ON public."brands" TO "authenticated";
GRANT UPDATE ON public."brands" TO "authenticated";
GRANT DELETE ON public."brands" TO "authenticated";
GRANT TRUNCATE ON public."brands" TO "authenticated";
GRANT REFERENCES ON public."brands" TO "authenticated";
GRANT TRIGGER ON public."brands" TO "authenticated";
GRANT MAINTAIN ON public."brands" TO "authenticated";
GRANT INSERT ON public."brands" TO "service_role";
GRANT SELECT ON public."brands" TO "service_role";
GRANT UPDATE ON public."brands" TO "service_role";
GRANT DELETE ON public."brands" TO "service_role";
GRANT TRUNCATE ON public."brands" TO "service_role";
GRANT REFERENCES ON public."brands" TO "service_role";
GRANT TRIGGER ON public."brands" TO "service_role";
GRANT MAINTAIN ON public."brands" TO "service_role";
ALTER TABLE public."business_fronts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."business_fronts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."business_fronts" TO "postgres";
GRANT SELECT ON public."business_fronts" TO "postgres";
GRANT UPDATE ON public."business_fronts" TO "postgres";
GRANT DELETE ON public."business_fronts" TO "postgres";
GRANT TRUNCATE ON public."business_fronts" TO "postgres";
GRANT REFERENCES ON public."business_fronts" TO "postgres";
GRANT TRIGGER ON public."business_fronts" TO "postgres";
GRANT MAINTAIN ON public."business_fronts" TO "postgres";
GRANT INSERT ON public."business_fronts" TO "anon";
GRANT SELECT ON public."business_fronts" TO "anon";
GRANT UPDATE ON public."business_fronts" TO "anon";
GRANT DELETE ON public."business_fronts" TO "anon";
GRANT TRUNCATE ON public."business_fronts" TO "anon";
GRANT REFERENCES ON public."business_fronts" TO "anon";
GRANT TRIGGER ON public."business_fronts" TO "anon";
GRANT MAINTAIN ON public."business_fronts" TO "anon";
GRANT INSERT ON public."business_fronts" TO "authenticated";
GRANT SELECT ON public."business_fronts" TO "authenticated";
GRANT UPDATE ON public."business_fronts" TO "authenticated";
GRANT DELETE ON public."business_fronts" TO "authenticated";
GRANT TRUNCATE ON public."business_fronts" TO "authenticated";
GRANT REFERENCES ON public."business_fronts" TO "authenticated";
GRANT TRIGGER ON public."business_fronts" TO "authenticated";
GRANT MAINTAIN ON public."business_fronts" TO "authenticated";
GRANT INSERT ON public."business_fronts" TO "service_role";
GRANT SELECT ON public."business_fronts" TO "service_role";
GRANT UPDATE ON public."business_fronts" TO "service_role";
GRANT DELETE ON public."business_fronts" TO "service_role";
GRANT TRUNCATE ON public."business_fronts" TO "service_role";
GRANT REFERENCES ON public."business_fronts" TO "service_role";
GRANT TRIGGER ON public."business_fronts" TO "service_role";
GRANT MAINTAIN ON public."business_fronts" TO "service_role";
ALTER TABLE public."campaign_cycles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."campaign_cycles" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."campaign_cycles" TO "postgres";
GRANT SELECT ON public."campaign_cycles" TO "postgres";
GRANT UPDATE ON public."campaign_cycles" TO "postgres";
GRANT DELETE ON public."campaign_cycles" TO "postgres";
GRANT TRUNCATE ON public."campaign_cycles" TO "postgres";
GRANT REFERENCES ON public."campaign_cycles" TO "postgres";
GRANT TRIGGER ON public."campaign_cycles" TO "postgres";
GRANT MAINTAIN ON public."campaign_cycles" TO "postgres";
GRANT INSERT ON public."campaign_cycles" TO "anon";
GRANT SELECT ON public."campaign_cycles" TO "anon";
GRANT UPDATE ON public."campaign_cycles" TO "anon";
GRANT DELETE ON public."campaign_cycles" TO "anon";
GRANT TRUNCATE ON public."campaign_cycles" TO "anon";
GRANT REFERENCES ON public."campaign_cycles" TO "anon";
GRANT TRIGGER ON public."campaign_cycles" TO "anon";
GRANT MAINTAIN ON public."campaign_cycles" TO "anon";
GRANT INSERT ON public."campaign_cycles" TO "authenticated";
GRANT SELECT ON public."campaign_cycles" TO "authenticated";
GRANT UPDATE ON public."campaign_cycles" TO "authenticated";
GRANT DELETE ON public."campaign_cycles" TO "authenticated";
GRANT TRUNCATE ON public."campaign_cycles" TO "authenticated";
GRANT REFERENCES ON public."campaign_cycles" TO "authenticated";
GRANT TRIGGER ON public."campaign_cycles" TO "authenticated";
GRANT MAINTAIN ON public."campaign_cycles" TO "authenticated";
GRANT INSERT ON public."campaign_cycles" TO "service_role";
GRANT SELECT ON public."campaign_cycles" TO "service_role";
GRANT UPDATE ON public."campaign_cycles" TO "service_role";
GRANT DELETE ON public."campaign_cycles" TO "service_role";
GRANT TRUNCATE ON public."campaign_cycles" TO "service_role";
GRANT REFERENCES ON public."campaign_cycles" TO "service_role";
GRANT TRIGGER ON public."campaign_cycles" TO "service_role";
GRANT MAINTAIN ON public."campaign_cycles" TO "service_role";
ALTER TABLE public."campaigns" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."campaigns" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."campaigns" TO "postgres";
GRANT SELECT ON public."campaigns" TO "postgres";
GRANT UPDATE ON public."campaigns" TO "postgres";
GRANT DELETE ON public."campaigns" TO "postgres";
GRANT TRUNCATE ON public."campaigns" TO "postgres";
GRANT REFERENCES ON public."campaigns" TO "postgres";
GRANT TRIGGER ON public."campaigns" TO "postgres";
GRANT MAINTAIN ON public."campaigns" TO "postgres";
GRANT INSERT ON public."campaigns" TO "anon";
GRANT SELECT ON public."campaigns" TO "anon";
GRANT UPDATE ON public."campaigns" TO "anon";
GRANT DELETE ON public."campaigns" TO "anon";
GRANT TRUNCATE ON public."campaigns" TO "anon";
GRANT REFERENCES ON public."campaigns" TO "anon";
GRANT TRIGGER ON public."campaigns" TO "anon";
GRANT MAINTAIN ON public."campaigns" TO "anon";
GRANT INSERT ON public."campaigns" TO "authenticated";
GRANT SELECT ON public."campaigns" TO "authenticated";
GRANT UPDATE ON public."campaigns" TO "authenticated";
GRANT DELETE ON public."campaigns" TO "authenticated";
GRANT TRUNCATE ON public."campaigns" TO "authenticated";
GRANT REFERENCES ON public."campaigns" TO "authenticated";
GRANT TRIGGER ON public."campaigns" TO "authenticated";
GRANT MAINTAIN ON public."campaigns" TO "authenticated";
GRANT INSERT ON public."campaigns" TO "service_role";
GRANT SELECT ON public."campaigns" TO "service_role";
GRANT UPDATE ON public."campaigns" TO "service_role";
GRANT DELETE ON public."campaigns" TO "service_role";
GRANT TRUNCATE ON public."campaigns" TO "service_role";
GRANT REFERENCES ON public."campaigns" TO "service_role";
GRANT TRIGGER ON public."campaigns" TO "service_role";
GRANT MAINTAIN ON public."campaigns" TO "service_role";
ALTER TABLE public."communication_profile_versions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."communication_profile_versions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."communication_profile_versions" TO "postgres";
GRANT SELECT ON public."communication_profile_versions" TO "postgres";
GRANT UPDATE ON public."communication_profile_versions" TO "postgres";
GRANT DELETE ON public."communication_profile_versions" TO "postgres";
GRANT TRUNCATE ON public."communication_profile_versions" TO "postgres";
GRANT REFERENCES ON public."communication_profile_versions" TO "postgres";
GRANT TRIGGER ON public."communication_profile_versions" TO "postgres";
GRANT MAINTAIN ON public."communication_profile_versions" TO "postgres";
GRANT INSERT ON public."communication_profile_versions" TO "anon";
GRANT SELECT ON public."communication_profile_versions" TO "anon";
GRANT UPDATE ON public."communication_profile_versions" TO "anon";
GRANT DELETE ON public."communication_profile_versions" TO "anon";
GRANT TRUNCATE ON public."communication_profile_versions" TO "anon";
GRANT REFERENCES ON public."communication_profile_versions" TO "anon";
GRANT TRIGGER ON public."communication_profile_versions" TO "anon";
GRANT MAINTAIN ON public."communication_profile_versions" TO "anon";
GRANT INSERT ON public."communication_profile_versions" TO "authenticated";
GRANT SELECT ON public."communication_profile_versions" TO "authenticated";
GRANT UPDATE ON public."communication_profile_versions" TO "authenticated";
GRANT DELETE ON public."communication_profile_versions" TO "authenticated";
GRANT TRUNCATE ON public."communication_profile_versions" TO "authenticated";
GRANT REFERENCES ON public."communication_profile_versions" TO "authenticated";
GRANT TRIGGER ON public."communication_profile_versions" TO "authenticated";
GRANT MAINTAIN ON public."communication_profile_versions" TO "authenticated";
GRANT INSERT ON public."communication_profile_versions" TO "service_role";
GRANT SELECT ON public."communication_profile_versions" TO "service_role";
GRANT UPDATE ON public."communication_profile_versions" TO "service_role";
GRANT DELETE ON public."communication_profile_versions" TO "service_role";
GRANT TRUNCATE ON public."communication_profile_versions" TO "service_role";
GRANT REFERENCES ON public."communication_profile_versions" TO "service_role";
GRANT TRIGGER ON public."communication_profile_versions" TO "service_role";
GRANT MAINTAIN ON public."communication_profile_versions" TO "service_role";
ALTER TABLE public."communication_profiles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."communication_profiles" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."communication_profiles" TO "postgres";
GRANT SELECT ON public."communication_profiles" TO "postgres";
GRANT UPDATE ON public."communication_profiles" TO "postgres";
GRANT DELETE ON public."communication_profiles" TO "postgres";
GRANT TRUNCATE ON public."communication_profiles" TO "postgres";
GRANT REFERENCES ON public."communication_profiles" TO "postgres";
GRANT TRIGGER ON public."communication_profiles" TO "postgres";
GRANT MAINTAIN ON public."communication_profiles" TO "postgres";
GRANT INSERT ON public."communication_profiles" TO "anon";
GRANT SELECT ON public."communication_profiles" TO "anon";
GRANT UPDATE ON public."communication_profiles" TO "anon";
GRANT DELETE ON public."communication_profiles" TO "anon";
GRANT TRUNCATE ON public."communication_profiles" TO "anon";
GRANT REFERENCES ON public."communication_profiles" TO "anon";
GRANT TRIGGER ON public."communication_profiles" TO "anon";
GRANT MAINTAIN ON public."communication_profiles" TO "anon";
GRANT INSERT ON public."communication_profiles" TO "authenticated";
GRANT SELECT ON public."communication_profiles" TO "authenticated";
GRANT UPDATE ON public."communication_profiles" TO "authenticated";
GRANT DELETE ON public."communication_profiles" TO "authenticated";
GRANT TRUNCATE ON public."communication_profiles" TO "authenticated";
GRANT REFERENCES ON public."communication_profiles" TO "authenticated";
GRANT TRIGGER ON public."communication_profiles" TO "authenticated";
GRANT MAINTAIN ON public."communication_profiles" TO "authenticated";
GRANT INSERT ON public."communication_profiles" TO "service_role";
GRANT SELECT ON public."communication_profiles" TO "service_role";
GRANT UPDATE ON public."communication_profiles" TO "service_role";
GRANT DELETE ON public."communication_profiles" TO "service_role";
GRANT TRUNCATE ON public."communication_profiles" TO "service_role";
GRANT REFERENCES ON public."communication_profiles" TO "service_role";
GRANT TRIGGER ON public."communication_profiles" TO "service_role";
GRANT MAINTAIN ON public."communication_profiles" TO "service_role";
ALTER TABLE public."content_base_uses" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."content_base_uses" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."content_base_uses" TO "postgres";
GRANT SELECT ON public."content_base_uses" TO "postgres";
GRANT UPDATE ON public."content_base_uses" TO "postgres";
GRANT DELETE ON public."content_base_uses" TO "postgres";
GRANT TRUNCATE ON public."content_base_uses" TO "postgres";
GRANT REFERENCES ON public."content_base_uses" TO "postgres";
GRANT TRIGGER ON public."content_base_uses" TO "postgres";
GRANT MAINTAIN ON public."content_base_uses" TO "postgres";
GRANT INSERT ON public."content_base_uses" TO "anon";
GRANT SELECT ON public."content_base_uses" TO "anon";
GRANT UPDATE ON public."content_base_uses" TO "anon";
GRANT DELETE ON public."content_base_uses" TO "anon";
GRANT TRUNCATE ON public."content_base_uses" TO "anon";
GRANT REFERENCES ON public."content_base_uses" TO "anon";
GRANT TRIGGER ON public."content_base_uses" TO "anon";
GRANT MAINTAIN ON public."content_base_uses" TO "anon";
GRANT INSERT ON public."content_base_uses" TO "authenticated";
GRANT SELECT ON public."content_base_uses" TO "authenticated";
GRANT UPDATE ON public."content_base_uses" TO "authenticated";
GRANT DELETE ON public."content_base_uses" TO "authenticated";
GRANT TRUNCATE ON public."content_base_uses" TO "authenticated";
GRANT REFERENCES ON public."content_base_uses" TO "authenticated";
GRANT TRIGGER ON public."content_base_uses" TO "authenticated";
GRANT MAINTAIN ON public."content_base_uses" TO "authenticated";
GRANT INSERT ON public."content_base_uses" TO "service_role";
GRANT SELECT ON public."content_base_uses" TO "service_role";
GRANT UPDATE ON public."content_base_uses" TO "service_role";
GRANT DELETE ON public."content_base_uses" TO "service_role";
GRANT TRUNCATE ON public."content_base_uses" TO "service_role";
GRANT REFERENCES ON public."content_base_uses" TO "service_role";
GRANT TRIGGER ON public."content_base_uses" TO "service_role";
GRANT MAINTAIN ON public."content_base_uses" TO "service_role";
ALTER TABLE public."content_base_versions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."content_base_versions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."content_base_versions" TO "postgres";
GRANT SELECT ON public."content_base_versions" TO "postgres";
GRANT UPDATE ON public."content_base_versions" TO "postgres";
GRANT DELETE ON public."content_base_versions" TO "postgres";
GRANT TRUNCATE ON public."content_base_versions" TO "postgres";
GRANT REFERENCES ON public."content_base_versions" TO "postgres";
GRANT TRIGGER ON public."content_base_versions" TO "postgres";
GRANT MAINTAIN ON public."content_base_versions" TO "postgres";
GRANT INSERT ON public."content_base_versions" TO "anon";
GRANT SELECT ON public."content_base_versions" TO "anon";
GRANT UPDATE ON public."content_base_versions" TO "anon";
GRANT DELETE ON public."content_base_versions" TO "anon";
GRANT TRUNCATE ON public."content_base_versions" TO "anon";
GRANT REFERENCES ON public."content_base_versions" TO "anon";
GRANT TRIGGER ON public."content_base_versions" TO "anon";
GRANT MAINTAIN ON public."content_base_versions" TO "anon";
GRANT INSERT ON public."content_base_versions" TO "authenticated";
GRANT SELECT ON public."content_base_versions" TO "authenticated";
GRANT UPDATE ON public."content_base_versions" TO "authenticated";
GRANT DELETE ON public."content_base_versions" TO "authenticated";
GRANT TRUNCATE ON public."content_base_versions" TO "authenticated";
GRANT REFERENCES ON public."content_base_versions" TO "authenticated";
GRANT TRIGGER ON public."content_base_versions" TO "authenticated";
GRANT MAINTAIN ON public."content_base_versions" TO "authenticated";
GRANT INSERT ON public."content_base_versions" TO "service_role";
GRANT SELECT ON public."content_base_versions" TO "service_role";
GRANT UPDATE ON public."content_base_versions" TO "service_role";
GRANT DELETE ON public."content_base_versions" TO "service_role";
GRANT TRUNCATE ON public."content_base_versions" TO "service_role";
GRANT REFERENCES ON public."content_base_versions" TO "service_role";
GRANT TRIGGER ON public."content_base_versions" TO "service_role";
GRANT MAINTAIN ON public."content_base_versions" TO "service_role";
ALTER TABLE public."content_idea_feedback" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."content_idea_feedback" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."content_idea_feedback" TO "postgres";
GRANT SELECT ON public."content_idea_feedback" TO "postgres";
GRANT UPDATE ON public."content_idea_feedback" TO "postgres";
GRANT DELETE ON public."content_idea_feedback" TO "postgres";
GRANT TRUNCATE ON public."content_idea_feedback" TO "postgres";
GRANT REFERENCES ON public."content_idea_feedback" TO "postgres";
GRANT TRIGGER ON public."content_idea_feedback" TO "postgres";
GRANT MAINTAIN ON public."content_idea_feedback" TO "postgres";
GRANT INSERT ON public."content_idea_feedback" TO "anon";
GRANT SELECT ON public."content_idea_feedback" TO "anon";
GRANT UPDATE ON public."content_idea_feedback" TO "anon";
GRANT DELETE ON public."content_idea_feedback" TO "anon";
GRANT TRUNCATE ON public."content_idea_feedback" TO "anon";
GRANT REFERENCES ON public."content_idea_feedback" TO "anon";
GRANT TRIGGER ON public."content_idea_feedback" TO "anon";
GRANT MAINTAIN ON public."content_idea_feedback" TO "anon";
GRANT INSERT ON public."content_idea_feedback" TO "authenticated";
GRANT SELECT ON public."content_idea_feedback" TO "authenticated";
GRANT UPDATE ON public."content_idea_feedback" TO "authenticated";
GRANT DELETE ON public."content_idea_feedback" TO "authenticated";
GRANT TRUNCATE ON public."content_idea_feedback" TO "authenticated";
GRANT REFERENCES ON public."content_idea_feedback" TO "authenticated";
GRANT TRIGGER ON public."content_idea_feedback" TO "authenticated";
GRANT MAINTAIN ON public."content_idea_feedback" TO "authenticated";
GRANT INSERT ON public."content_idea_feedback" TO "service_role";
GRANT SELECT ON public."content_idea_feedback" TO "service_role";
GRANT UPDATE ON public."content_idea_feedback" TO "service_role";
GRANT DELETE ON public."content_idea_feedback" TO "service_role";
GRANT TRUNCATE ON public."content_idea_feedback" TO "service_role";
GRANT REFERENCES ON public."content_idea_feedback" TO "service_role";
GRANT TRIGGER ON public."content_idea_feedback" TO "service_role";
GRANT MAINTAIN ON public."content_idea_feedback" TO "service_role";
ALTER TABLE public."content_ideas_cache" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."content_ideas_cache" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."content_ideas_cache" TO "postgres";
GRANT SELECT ON public."content_ideas_cache" TO "postgres";
GRANT UPDATE ON public."content_ideas_cache" TO "postgres";
GRANT DELETE ON public."content_ideas_cache" TO "postgres";
GRANT TRUNCATE ON public."content_ideas_cache" TO "postgres";
GRANT REFERENCES ON public."content_ideas_cache" TO "postgres";
GRANT TRIGGER ON public."content_ideas_cache" TO "postgres";
GRANT MAINTAIN ON public."content_ideas_cache" TO "postgres";
GRANT INSERT ON public."content_ideas_cache" TO "anon";
GRANT SELECT ON public."content_ideas_cache" TO "anon";
GRANT UPDATE ON public."content_ideas_cache" TO "anon";
GRANT DELETE ON public."content_ideas_cache" TO "anon";
GRANT TRUNCATE ON public."content_ideas_cache" TO "anon";
GRANT REFERENCES ON public."content_ideas_cache" TO "anon";
GRANT TRIGGER ON public."content_ideas_cache" TO "anon";
GRANT MAINTAIN ON public."content_ideas_cache" TO "anon";
GRANT INSERT ON public."content_ideas_cache" TO "authenticated";
GRANT SELECT ON public."content_ideas_cache" TO "authenticated";
GRANT UPDATE ON public."content_ideas_cache" TO "authenticated";
GRANT DELETE ON public."content_ideas_cache" TO "authenticated";
GRANT TRUNCATE ON public."content_ideas_cache" TO "authenticated";
GRANT REFERENCES ON public."content_ideas_cache" TO "authenticated";
GRANT TRIGGER ON public."content_ideas_cache" TO "authenticated";
GRANT MAINTAIN ON public."content_ideas_cache" TO "authenticated";
GRANT INSERT ON public."content_ideas_cache" TO "service_role";
GRANT SELECT ON public."content_ideas_cache" TO "service_role";
GRANT UPDATE ON public."content_ideas_cache" TO "service_role";
GRANT DELETE ON public."content_ideas_cache" TO "service_role";
GRANT TRUNCATE ON public."content_ideas_cache" TO "service_role";
GRANT REFERENCES ON public."content_ideas_cache" TO "service_role";
GRANT TRIGGER ON public."content_ideas_cache" TO "service_role";
GRANT MAINTAIN ON public."content_ideas_cache" TO "service_role";
ALTER TABLE public."content_memory" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."content_memory" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."content_memory" TO "postgres";
GRANT SELECT ON public."content_memory" TO "postgres";
GRANT UPDATE ON public."content_memory" TO "postgres";
GRANT DELETE ON public."content_memory" TO "postgres";
GRANT TRUNCATE ON public."content_memory" TO "postgres";
GRANT REFERENCES ON public."content_memory" TO "postgres";
GRANT TRIGGER ON public."content_memory" TO "postgres";
GRANT MAINTAIN ON public."content_memory" TO "postgres";
GRANT INSERT ON public."content_memory" TO "anon";
GRANT SELECT ON public."content_memory" TO "anon";
GRANT UPDATE ON public."content_memory" TO "anon";
GRANT DELETE ON public."content_memory" TO "anon";
GRANT TRUNCATE ON public."content_memory" TO "anon";
GRANT REFERENCES ON public."content_memory" TO "anon";
GRANT TRIGGER ON public."content_memory" TO "anon";
GRANT MAINTAIN ON public."content_memory" TO "anon";
GRANT INSERT ON public."content_memory" TO "authenticated";
GRANT SELECT ON public."content_memory" TO "authenticated";
GRANT UPDATE ON public."content_memory" TO "authenticated";
GRANT DELETE ON public."content_memory" TO "authenticated";
GRANT TRUNCATE ON public."content_memory" TO "authenticated";
GRANT REFERENCES ON public."content_memory" TO "authenticated";
GRANT TRIGGER ON public."content_memory" TO "authenticated";
GRANT MAINTAIN ON public."content_memory" TO "authenticated";
GRANT INSERT ON public."content_memory" TO "service_role";
GRANT SELECT ON public."content_memory" TO "service_role";
GRANT UPDATE ON public."content_memory" TO "service_role";
GRANT DELETE ON public."content_memory" TO "service_role";
GRANT TRUNCATE ON public."content_memory" TO "service_role";
GRANT REFERENCES ON public."content_memory" TO "service_role";
GRANT TRIGGER ON public."content_memory" TO "service_role";
GRANT MAINTAIN ON public."content_memory" TO "service_role";
ALTER TABLE public."content_piece_plans" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."content_piece_plans" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."content_piece_plans" TO "postgres";
GRANT SELECT ON public."content_piece_plans" TO "postgres";
GRANT UPDATE ON public."content_piece_plans" TO "postgres";
GRANT DELETE ON public."content_piece_plans" TO "postgres";
GRANT TRUNCATE ON public."content_piece_plans" TO "postgres";
GRANT REFERENCES ON public."content_piece_plans" TO "postgres";
GRANT TRIGGER ON public."content_piece_plans" TO "postgres";
GRANT MAINTAIN ON public."content_piece_plans" TO "postgres";
GRANT INSERT ON public."content_piece_plans" TO "anon";
GRANT SELECT ON public."content_piece_plans" TO "anon";
GRANT UPDATE ON public."content_piece_plans" TO "anon";
GRANT DELETE ON public."content_piece_plans" TO "anon";
GRANT TRUNCATE ON public."content_piece_plans" TO "anon";
GRANT REFERENCES ON public."content_piece_plans" TO "anon";
GRANT TRIGGER ON public."content_piece_plans" TO "anon";
GRANT MAINTAIN ON public."content_piece_plans" TO "anon";
GRANT INSERT ON public."content_piece_plans" TO "authenticated";
GRANT SELECT ON public."content_piece_plans" TO "authenticated";
GRANT UPDATE ON public."content_piece_plans" TO "authenticated";
GRANT DELETE ON public."content_piece_plans" TO "authenticated";
GRANT TRUNCATE ON public."content_piece_plans" TO "authenticated";
GRANT REFERENCES ON public."content_piece_plans" TO "authenticated";
GRANT TRIGGER ON public."content_piece_plans" TO "authenticated";
GRANT MAINTAIN ON public."content_piece_plans" TO "authenticated";
GRANT INSERT ON public."content_piece_plans" TO "service_role";
GRANT SELECT ON public."content_piece_plans" TO "service_role";
GRANT UPDATE ON public."content_piece_plans" TO "service_role";
GRANT DELETE ON public."content_piece_plans" TO "service_role";
GRANT TRUNCATE ON public."content_piece_plans" TO "service_role";
GRANT REFERENCES ON public."content_piece_plans" TO "service_role";
GRANT TRIGGER ON public."content_piece_plans" TO "service_role";
GRANT MAINTAIN ON public."content_piece_plans" TO "service_role";
ALTER TABLE public."contents" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."contents" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."contents" TO "postgres";
GRANT SELECT ON public."contents" TO "postgres";
GRANT UPDATE ON public."contents" TO "postgres";
GRANT DELETE ON public."contents" TO "postgres";
GRANT TRUNCATE ON public."contents" TO "postgres";
GRANT REFERENCES ON public."contents" TO "postgres";
GRANT TRIGGER ON public."contents" TO "postgres";
GRANT MAINTAIN ON public."contents" TO "postgres";
GRANT INSERT ON public."contents" TO "anon";
GRANT SELECT ON public."contents" TO "anon";
GRANT UPDATE ON public."contents" TO "anon";
GRANT DELETE ON public."contents" TO "anon";
GRANT TRUNCATE ON public."contents" TO "anon";
GRANT REFERENCES ON public."contents" TO "anon";
GRANT TRIGGER ON public."contents" TO "anon";
GRANT MAINTAIN ON public."contents" TO "anon";
GRANT INSERT ON public."contents" TO "authenticated";
GRANT SELECT ON public."contents" TO "authenticated";
GRANT UPDATE ON public."contents" TO "authenticated";
GRANT DELETE ON public."contents" TO "authenticated";
GRANT TRUNCATE ON public."contents" TO "authenticated";
GRANT REFERENCES ON public."contents" TO "authenticated";
GRANT TRIGGER ON public."contents" TO "authenticated";
GRANT MAINTAIN ON public."contents" TO "authenticated";
GRANT INSERT ON public."contents" TO "service_role";
GRANT SELECT ON public."contents" TO "service_role";
GRANT UPDATE ON public."contents" TO "service_role";
GRANT DELETE ON public."contents" TO "service_role";
GRANT TRUNCATE ON public."contents" TO "service_role";
GRANT REFERENCES ON public."contents" TO "service_role";
GRANT TRIGGER ON public."contents" TO "service_role";
GRANT MAINTAIN ON public."contents" TO "service_role";
ALTER TABLE public."context_snapshots" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."context_snapshots" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."context_snapshots" TO "postgres";
GRANT SELECT ON public."context_snapshots" TO "postgres";
GRANT UPDATE ON public."context_snapshots" TO "postgres";
GRANT DELETE ON public."context_snapshots" TO "postgres";
GRANT TRUNCATE ON public."context_snapshots" TO "postgres";
GRANT REFERENCES ON public."context_snapshots" TO "postgres";
GRANT TRIGGER ON public."context_snapshots" TO "postgres";
GRANT MAINTAIN ON public."context_snapshots" TO "postgres";
GRANT INSERT ON public."context_snapshots" TO "anon";
GRANT SELECT ON public."context_snapshots" TO "anon";
GRANT UPDATE ON public."context_snapshots" TO "anon";
GRANT DELETE ON public."context_snapshots" TO "anon";
GRANT TRUNCATE ON public."context_snapshots" TO "anon";
GRANT REFERENCES ON public."context_snapshots" TO "anon";
GRANT TRIGGER ON public."context_snapshots" TO "anon";
GRANT MAINTAIN ON public."context_snapshots" TO "anon";
GRANT INSERT ON public."context_snapshots" TO "authenticated";
GRANT SELECT ON public."context_snapshots" TO "authenticated";
GRANT UPDATE ON public."context_snapshots" TO "authenticated";
GRANT DELETE ON public."context_snapshots" TO "authenticated";
GRANT TRUNCATE ON public."context_snapshots" TO "authenticated";
GRANT REFERENCES ON public."context_snapshots" TO "authenticated";
GRANT TRIGGER ON public."context_snapshots" TO "authenticated";
GRANT MAINTAIN ON public."context_snapshots" TO "authenticated";
GRANT INSERT ON public."context_snapshots" TO "service_role";
GRANT SELECT ON public."context_snapshots" TO "service_role";
GRANT UPDATE ON public."context_snapshots" TO "service_role";
GRANT DELETE ON public."context_snapshots" TO "service_role";
GRANT TRUNCATE ON public."context_snapshots" TO "service_role";
GRANT REFERENCES ON public."context_snapshots" TO "service_role";
GRANT TRIGGER ON public."context_snapshots" TO "service_role";
GRANT MAINTAIN ON public."context_snapshots" TO "service_role";
ALTER TABLE public."design_assets" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."design_assets" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."design_assets" TO "postgres";
GRANT SELECT ON public."design_assets" TO "postgres";
GRANT UPDATE ON public."design_assets" TO "postgres";
GRANT DELETE ON public."design_assets" TO "postgres";
GRANT TRUNCATE ON public."design_assets" TO "postgres";
GRANT REFERENCES ON public."design_assets" TO "postgres";
GRANT TRIGGER ON public."design_assets" TO "postgres";
GRANT MAINTAIN ON public."design_assets" TO "postgres";
GRANT INSERT ON public."design_assets" TO "anon";
GRANT SELECT ON public."design_assets" TO "anon";
GRANT UPDATE ON public."design_assets" TO "anon";
GRANT DELETE ON public."design_assets" TO "anon";
GRANT TRUNCATE ON public."design_assets" TO "anon";
GRANT REFERENCES ON public."design_assets" TO "anon";
GRANT TRIGGER ON public."design_assets" TO "anon";
GRANT MAINTAIN ON public."design_assets" TO "anon";
GRANT INSERT ON public."design_assets" TO "authenticated";
GRANT SELECT ON public."design_assets" TO "authenticated";
GRANT UPDATE ON public."design_assets" TO "authenticated";
GRANT DELETE ON public."design_assets" TO "authenticated";
GRANT TRUNCATE ON public."design_assets" TO "authenticated";
GRANT REFERENCES ON public."design_assets" TO "authenticated";
GRANT TRIGGER ON public."design_assets" TO "authenticated";
GRANT MAINTAIN ON public."design_assets" TO "authenticated";
GRANT INSERT ON public."design_assets" TO "service_role";
GRANT SELECT ON public."design_assets" TO "service_role";
GRANT UPDATE ON public."design_assets" TO "service_role";
GRANT DELETE ON public."design_assets" TO "service_role";
GRANT TRUNCATE ON public."design_assets" TO "service_role";
GRANT REFERENCES ON public."design_assets" TO "service_role";
GRANT TRIGGER ON public."design_assets" TO "service_role";
GRANT MAINTAIN ON public."design_assets" TO "service_role";
ALTER TABLE public."design_manifestacoes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."design_manifestacoes" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."design_manifestacoes" TO "postgres";
GRANT SELECT ON public."design_manifestacoes" TO "postgres";
GRANT UPDATE ON public."design_manifestacoes" TO "postgres";
GRANT DELETE ON public."design_manifestacoes" TO "postgres";
GRANT TRUNCATE ON public."design_manifestacoes" TO "postgres";
GRANT REFERENCES ON public."design_manifestacoes" TO "postgres";
GRANT TRIGGER ON public."design_manifestacoes" TO "postgres";
GRANT MAINTAIN ON public."design_manifestacoes" TO "postgres";
GRANT INSERT ON public."design_manifestacoes" TO "anon";
GRANT SELECT ON public."design_manifestacoes" TO "anon";
GRANT UPDATE ON public."design_manifestacoes" TO "anon";
GRANT DELETE ON public."design_manifestacoes" TO "anon";
GRANT TRUNCATE ON public."design_manifestacoes" TO "anon";
GRANT REFERENCES ON public."design_manifestacoes" TO "anon";
GRANT TRIGGER ON public."design_manifestacoes" TO "anon";
GRANT MAINTAIN ON public."design_manifestacoes" TO "anon";
GRANT INSERT ON public."design_manifestacoes" TO "authenticated";
GRANT SELECT ON public."design_manifestacoes" TO "authenticated";
GRANT UPDATE ON public."design_manifestacoes" TO "authenticated";
GRANT DELETE ON public."design_manifestacoes" TO "authenticated";
GRANT TRUNCATE ON public."design_manifestacoes" TO "authenticated";
GRANT REFERENCES ON public."design_manifestacoes" TO "authenticated";
GRANT TRIGGER ON public."design_manifestacoes" TO "authenticated";
GRANT MAINTAIN ON public."design_manifestacoes" TO "authenticated";
GRANT INSERT ON public."design_manifestacoes" TO "service_role";
GRANT SELECT ON public."design_manifestacoes" TO "service_role";
GRANT UPDATE ON public."design_manifestacoes" TO "service_role";
GRANT DELETE ON public."design_manifestacoes" TO "service_role";
GRANT TRUNCATE ON public."design_manifestacoes" TO "service_role";
GRANT REFERENCES ON public."design_manifestacoes" TO "service_role";
GRANT TRIGGER ON public."design_manifestacoes" TO "service_role";
GRANT MAINTAIN ON public."design_manifestacoes" TO "service_role";
ALTER TABLE public."design_selection_config" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."design_selection_config" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."design_selection_config" TO "postgres";
GRANT SELECT ON public."design_selection_config" TO "postgres";
GRANT UPDATE ON public."design_selection_config" TO "postgres";
GRANT DELETE ON public."design_selection_config" TO "postgres";
GRANT TRUNCATE ON public."design_selection_config" TO "postgres";
GRANT REFERENCES ON public."design_selection_config" TO "postgres";
GRANT TRIGGER ON public."design_selection_config" TO "postgres";
GRANT MAINTAIN ON public."design_selection_config" TO "postgres";
GRANT INSERT ON public."design_selection_config" TO "anon";
GRANT SELECT ON public."design_selection_config" TO "anon";
GRANT UPDATE ON public."design_selection_config" TO "anon";
GRANT DELETE ON public."design_selection_config" TO "anon";
GRANT TRUNCATE ON public."design_selection_config" TO "anon";
GRANT REFERENCES ON public."design_selection_config" TO "anon";
GRANT TRIGGER ON public."design_selection_config" TO "anon";
GRANT MAINTAIN ON public."design_selection_config" TO "anon";
GRANT INSERT ON public."design_selection_config" TO "authenticated";
GRANT SELECT ON public."design_selection_config" TO "authenticated";
GRANT UPDATE ON public."design_selection_config" TO "authenticated";
GRANT DELETE ON public."design_selection_config" TO "authenticated";
GRANT TRUNCATE ON public."design_selection_config" TO "authenticated";
GRANT REFERENCES ON public."design_selection_config" TO "authenticated";
GRANT TRIGGER ON public."design_selection_config" TO "authenticated";
GRANT MAINTAIN ON public."design_selection_config" TO "authenticated";
GRANT INSERT ON public."design_selection_config" TO "service_role";
GRANT SELECT ON public."design_selection_config" TO "service_role";
GRANT UPDATE ON public."design_selection_config" TO "service_role";
GRANT DELETE ON public."design_selection_config" TO "service_role";
GRANT TRUNCATE ON public."design_selection_config" TO "service_role";
GRANT REFERENCES ON public."design_selection_config" TO "service_role";
GRANT TRIGGER ON public."design_selection_config" TO "service_role";
GRANT MAINTAIN ON public."design_selection_config" TO "service_role";
ALTER TABLE public."design_tokens" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."design_tokens" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."design_tokens" TO "postgres";
GRANT SELECT ON public."design_tokens" TO "postgres";
GRANT UPDATE ON public."design_tokens" TO "postgres";
GRANT DELETE ON public."design_tokens" TO "postgres";
GRANT TRUNCATE ON public."design_tokens" TO "postgres";
GRANT REFERENCES ON public."design_tokens" TO "postgres";
GRANT TRIGGER ON public."design_tokens" TO "postgres";
GRANT MAINTAIN ON public."design_tokens" TO "postgres";
GRANT INSERT ON public."design_tokens" TO "anon";
GRANT SELECT ON public."design_tokens" TO "anon";
GRANT UPDATE ON public."design_tokens" TO "anon";
GRANT DELETE ON public."design_tokens" TO "anon";
GRANT TRUNCATE ON public."design_tokens" TO "anon";
GRANT REFERENCES ON public."design_tokens" TO "anon";
GRANT TRIGGER ON public."design_tokens" TO "anon";
GRANT MAINTAIN ON public."design_tokens" TO "anon";
GRANT INSERT ON public."design_tokens" TO "authenticated";
GRANT SELECT ON public."design_tokens" TO "authenticated";
GRANT UPDATE ON public."design_tokens" TO "authenticated";
GRANT DELETE ON public."design_tokens" TO "authenticated";
GRANT TRUNCATE ON public."design_tokens" TO "authenticated";
GRANT REFERENCES ON public."design_tokens" TO "authenticated";
GRANT TRIGGER ON public."design_tokens" TO "authenticated";
GRANT MAINTAIN ON public."design_tokens" TO "authenticated";
GRANT INSERT ON public."design_tokens" TO "service_role";
GRANT SELECT ON public."design_tokens" TO "service_role";
GRANT UPDATE ON public."design_tokens" TO "service_role";
GRANT DELETE ON public."design_tokens" TO "service_role";
GRANT TRUNCATE ON public."design_tokens" TO "service_role";
GRANT REFERENCES ON public."design_tokens" TO "service_role";
GRANT TRIGGER ON public."design_tokens" TO "service_role";
GRANT MAINTAIN ON public."design_tokens" TO "service_role";
ALTER TABLE public."design_variacoes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."design_variacoes" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."design_variacoes" TO "postgres";
GRANT SELECT ON public."design_variacoes" TO "postgres";
GRANT UPDATE ON public."design_variacoes" TO "postgres";
GRANT DELETE ON public."design_variacoes" TO "postgres";
GRANT TRUNCATE ON public."design_variacoes" TO "postgres";
GRANT REFERENCES ON public."design_variacoes" TO "postgres";
GRANT TRIGGER ON public."design_variacoes" TO "postgres";
GRANT MAINTAIN ON public."design_variacoes" TO "postgres";
GRANT INSERT ON public."design_variacoes" TO "anon";
GRANT SELECT ON public."design_variacoes" TO "anon";
GRANT UPDATE ON public."design_variacoes" TO "anon";
GRANT DELETE ON public."design_variacoes" TO "anon";
GRANT TRUNCATE ON public."design_variacoes" TO "anon";
GRANT REFERENCES ON public."design_variacoes" TO "anon";
GRANT TRIGGER ON public."design_variacoes" TO "anon";
GRANT MAINTAIN ON public."design_variacoes" TO "anon";
GRANT INSERT ON public."design_variacoes" TO "authenticated";
GRANT SELECT ON public."design_variacoes" TO "authenticated";
GRANT UPDATE ON public."design_variacoes" TO "authenticated";
GRANT DELETE ON public."design_variacoes" TO "authenticated";
GRANT TRUNCATE ON public."design_variacoes" TO "authenticated";
GRANT REFERENCES ON public."design_variacoes" TO "authenticated";
GRANT TRIGGER ON public."design_variacoes" TO "authenticated";
GRANT MAINTAIN ON public."design_variacoes" TO "authenticated";
GRANT INSERT ON public."design_variacoes" TO "service_role";
GRANT SELECT ON public."design_variacoes" TO "service_role";
GRANT UPDATE ON public."design_variacoes" TO "service_role";
GRANT DELETE ON public."design_variacoes" TO "service_role";
GRANT TRUNCATE ON public."design_variacoes" TO "service_role";
GRANT REFERENCES ON public."design_variacoes" TO "service_role";
GRANT TRIGGER ON public."design_variacoes" TO "service_role";
GRANT MAINTAIN ON public."design_variacoes" TO "service_role";
ALTER TABLE public."editorial_line_runs" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."editorial_line_runs" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."editorial_line_runs" TO "postgres";
GRANT SELECT ON public."editorial_line_runs" TO "postgres";
GRANT UPDATE ON public."editorial_line_runs" TO "postgres";
GRANT DELETE ON public."editorial_line_runs" TO "postgres";
GRANT TRUNCATE ON public."editorial_line_runs" TO "postgres";
GRANT REFERENCES ON public."editorial_line_runs" TO "postgres";
GRANT TRIGGER ON public."editorial_line_runs" TO "postgres";
GRANT MAINTAIN ON public."editorial_line_runs" TO "postgres";
GRANT INSERT ON public."editorial_line_runs" TO "anon";
GRANT SELECT ON public."editorial_line_runs" TO "anon";
GRANT UPDATE ON public."editorial_line_runs" TO "anon";
GRANT DELETE ON public."editorial_line_runs" TO "anon";
GRANT TRUNCATE ON public."editorial_line_runs" TO "anon";
GRANT REFERENCES ON public."editorial_line_runs" TO "anon";
GRANT TRIGGER ON public."editorial_line_runs" TO "anon";
GRANT MAINTAIN ON public."editorial_line_runs" TO "anon";
GRANT INSERT ON public."editorial_line_runs" TO "authenticated";
GRANT SELECT ON public."editorial_line_runs" TO "authenticated";
GRANT UPDATE ON public."editorial_line_runs" TO "authenticated";
GRANT DELETE ON public."editorial_line_runs" TO "authenticated";
GRANT TRUNCATE ON public."editorial_line_runs" TO "authenticated";
GRANT REFERENCES ON public."editorial_line_runs" TO "authenticated";
GRANT TRIGGER ON public."editorial_line_runs" TO "authenticated";
GRANT MAINTAIN ON public."editorial_line_runs" TO "authenticated";
GRANT INSERT ON public."editorial_line_runs" TO "service_role";
GRANT SELECT ON public."editorial_line_runs" TO "service_role";
GRANT UPDATE ON public."editorial_line_runs" TO "service_role";
GRANT DELETE ON public."editorial_line_runs" TO "service_role";
GRANT TRUNCATE ON public."editorial_line_runs" TO "service_role";
GRANT REFERENCES ON public."editorial_line_runs" TO "service_role";
GRANT TRIGGER ON public."editorial_line_runs" TO "service_role";
GRANT MAINTAIN ON public."editorial_line_runs" TO "service_role";
ALTER TABLE public."editorial_lines" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."editorial_lines" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."editorial_lines" TO "postgres";
GRANT SELECT ON public."editorial_lines" TO "postgres";
GRANT UPDATE ON public."editorial_lines" TO "postgres";
GRANT DELETE ON public."editorial_lines" TO "postgres";
GRANT TRUNCATE ON public."editorial_lines" TO "postgres";
GRANT REFERENCES ON public."editorial_lines" TO "postgres";
GRANT TRIGGER ON public."editorial_lines" TO "postgres";
GRANT MAINTAIN ON public."editorial_lines" TO "postgres";
GRANT INSERT ON public."editorial_lines" TO "anon";
GRANT SELECT ON public."editorial_lines" TO "anon";
GRANT UPDATE ON public."editorial_lines" TO "anon";
GRANT DELETE ON public."editorial_lines" TO "anon";
GRANT TRUNCATE ON public."editorial_lines" TO "anon";
GRANT REFERENCES ON public."editorial_lines" TO "anon";
GRANT TRIGGER ON public."editorial_lines" TO "anon";
GRANT MAINTAIN ON public."editorial_lines" TO "anon";
GRANT INSERT ON public."editorial_lines" TO "authenticated";
GRANT SELECT ON public."editorial_lines" TO "authenticated";
GRANT UPDATE ON public."editorial_lines" TO "authenticated";
GRANT DELETE ON public."editorial_lines" TO "authenticated";
GRANT TRUNCATE ON public."editorial_lines" TO "authenticated";
GRANT REFERENCES ON public."editorial_lines" TO "authenticated";
GRANT TRIGGER ON public."editorial_lines" TO "authenticated";
GRANT MAINTAIN ON public."editorial_lines" TO "authenticated";
GRANT INSERT ON public."editorial_lines" TO "service_role";
GRANT SELECT ON public."editorial_lines" TO "service_role";
GRANT UPDATE ON public."editorial_lines" TO "service_role";
GRANT DELETE ON public."editorial_lines" TO "service_role";
GRANT TRUNCATE ON public."editorial_lines" TO "service_role";
GRANT REFERENCES ON public."editorial_lines" TO "service_role";
GRANT TRIGGER ON public."editorial_lines" TO "service_role";
GRANT MAINTAIN ON public."editorial_lines" TO "service_role";
ALTER TABLE public."emitters" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."emitters" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."emitters" TO "postgres";
GRANT SELECT ON public."emitters" TO "postgres";
GRANT UPDATE ON public."emitters" TO "postgres";
GRANT DELETE ON public."emitters" TO "postgres";
GRANT TRUNCATE ON public."emitters" TO "postgres";
GRANT REFERENCES ON public."emitters" TO "postgres";
GRANT TRIGGER ON public."emitters" TO "postgres";
GRANT MAINTAIN ON public."emitters" TO "postgres";
GRANT INSERT ON public."emitters" TO "anon";
GRANT SELECT ON public."emitters" TO "anon";
GRANT UPDATE ON public."emitters" TO "anon";
GRANT DELETE ON public."emitters" TO "anon";
GRANT TRUNCATE ON public."emitters" TO "anon";
GRANT REFERENCES ON public."emitters" TO "anon";
GRANT TRIGGER ON public."emitters" TO "anon";
GRANT MAINTAIN ON public."emitters" TO "anon";
GRANT INSERT ON public."emitters" TO "authenticated";
GRANT SELECT ON public."emitters" TO "authenticated";
GRANT UPDATE ON public."emitters" TO "authenticated";
GRANT DELETE ON public."emitters" TO "authenticated";
GRANT TRUNCATE ON public."emitters" TO "authenticated";
GRANT REFERENCES ON public."emitters" TO "authenticated";
GRANT TRIGGER ON public."emitters" TO "authenticated";
GRANT MAINTAIN ON public."emitters" TO "authenticated";
GRANT INSERT ON public."emitters" TO "service_role";
GRANT SELECT ON public."emitters" TO "service_role";
GRANT UPDATE ON public."emitters" TO "service_role";
GRANT DELETE ON public."emitters" TO "service_role";
GRANT TRUNCATE ON public."emitters" TO "service_role";
GRANT REFERENCES ON public."emitters" TO "service_role";
GRANT TRIGGER ON public."emitters" TO "service_role";
GRANT MAINTAIN ON public."emitters" TO "service_role";
ALTER TABLE public."format_capabilities" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."format_capabilities" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."format_capabilities" TO "postgres";
GRANT SELECT ON public."format_capabilities" TO "postgres";
GRANT UPDATE ON public."format_capabilities" TO "postgres";
GRANT DELETE ON public."format_capabilities" TO "postgres";
GRANT TRUNCATE ON public."format_capabilities" TO "postgres";
GRANT REFERENCES ON public."format_capabilities" TO "postgres";
GRANT TRIGGER ON public."format_capabilities" TO "postgres";
GRANT MAINTAIN ON public."format_capabilities" TO "postgres";
GRANT INSERT ON public."format_capabilities" TO "anon";
GRANT SELECT ON public."format_capabilities" TO "anon";
GRANT UPDATE ON public."format_capabilities" TO "anon";
GRANT DELETE ON public."format_capabilities" TO "anon";
GRANT TRUNCATE ON public."format_capabilities" TO "anon";
GRANT REFERENCES ON public."format_capabilities" TO "anon";
GRANT TRIGGER ON public."format_capabilities" TO "anon";
GRANT MAINTAIN ON public."format_capabilities" TO "anon";
GRANT INSERT ON public."format_capabilities" TO "authenticated";
GRANT SELECT ON public."format_capabilities" TO "authenticated";
GRANT UPDATE ON public."format_capabilities" TO "authenticated";
GRANT DELETE ON public."format_capabilities" TO "authenticated";
GRANT TRUNCATE ON public."format_capabilities" TO "authenticated";
GRANT REFERENCES ON public."format_capabilities" TO "authenticated";
GRANT TRIGGER ON public."format_capabilities" TO "authenticated";
GRANT MAINTAIN ON public."format_capabilities" TO "authenticated";
GRANT INSERT ON public."format_capabilities" TO "service_role";
GRANT SELECT ON public."format_capabilities" TO "service_role";
GRANT UPDATE ON public."format_capabilities" TO "service_role";
GRANT DELETE ON public."format_capabilities" TO "service_role";
GRANT TRUNCATE ON public."format_capabilities" TO "service_role";
GRANT REFERENCES ON public."format_capabilities" TO "service_role";
GRANT TRIGGER ON public."format_capabilities" TO "service_role";
GRANT MAINTAIN ON public."format_capabilities" TO "service_role";
ALTER TABLE public."genesis_avatares" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."genesis_avatares" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."genesis_avatares" TO "postgres";
GRANT SELECT ON public."genesis_avatares" TO "postgres";
GRANT UPDATE ON public."genesis_avatares" TO "postgres";
GRANT DELETE ON public."genesis_avatares" TO "postgres";
GRANT TRUNCATE ON public."genesis_avatares" TO "postgres";
GRANT REFERENCES ON public."genesis_avatares" TO "postgres";
GRANT TRIGGER ON public."genesis_avatares" TO "postgres";
GRANT MAINTAIN ON public."genesis_avatares" TO "postgres";
GRANT INSERT ON public."genesis_avatares" TO "anon";
GRANT SELECT ON public."genesis_avatares" TO "anon";
GRANT UPDATE ON public."genesis_avatares" TO "anon";
GRANT DELETE ON public."genesis_avatares" TO "anon";
GRANT TRUNCATE ON public."genesis_avatares" TO "anon";
GRANT REFERENCES ON public."genesis_avatares" TO "anon";
GRANT TRIGGER ON public."genesis_avatares" TO "anon";
GRANT MAINTAIN ON public."genesis_avatares" TO "anon";
GRANT INSERT ON public."genesis_avatares" TO "authenticated";
GRANT SELECT ON public."genesis_avatares" TO "authenticated";
GRANT UPDATE ON public."genesis_avatares" TO "authenticated";
GRANT DELETE ON public."genesis_avatares" TO "authenticated";
GRANT TRUNCATE ON public."genesis_avatares" TO "authenticated";
GRANT REFERENCES ON public."genesis_avatares" TO "authenticated";
GRANT TRIGGER ON public."genesis_avatares" TO "authenticated";
GRANT MAINTAIN ON public."genesis_avatares" TO "authenticated";
GRANT INSERT ON public."genesis_avatares" TO "service_role";
GRANT SELECT ON public."genesis_avatares" TO "service_role";
GRANT UPDATE ON public."genesis_avatares" TO "service_role";
GRANT DELETE ON public."genesis_avatares" TO "service_role";
GRANT TRUNCATE ON public."genesis_avatares" TO "service_role";
GRANT REFERENCES ON public."genesis_avatares" TO "service_role";
GRANT TRIGGER ON public."genesis_avatares" TO "service_role";
GRANT MAINTAIN ON public."genesis_avatares" TO "service_role";
ALTER TABLE public."genesis_core" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."genesis_core" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."genesis_core" TO "postgres";
GRANT SELECT ON public."genesis_core" TO "postgres";
GRANT UPDATE ON public."genesis_core" TO "postgres";
GRANT DELETE ON public."genesis_core" TO "postgres";
GRANT TRUNCATE ON public."genesis_core" TO "postgres";
GRANT REFERENCES ON public."genesis_core" TO "postgres";
GRANT TRIGGER ON public."genesis_core" TO "postgres";
GRANT MAINTAIN ON public."genesis_core" TO "postgres";
GRANT INSERT ON public."genesis_core" TO "anon";
GRANT SELECT ON public."genesis_core" TO "anon";
GRANT UPDATE ON public."genesis_core" TO "anon";
GRANT DELETE ON public."genesis_core" TO "anon";
GRANT TRUNCATE ON public."genesis_core" TO "anon";
GRANT REFERENCES ON public."genesis_core" TO "anon";
GRANT TRIGGER ON public."genesis_core" TO "anon";
GRANT MAINTAIN ON public."genesis_core" TO "anon";
GRANT INSERT ON public."genesis_core" TO "authenticated";
GRANT SELECT ON public."genesis_core" TO "authenticated";
GRANT UPDATE ON public."genesis_core" TO "authenticated";
GRANT DELETE ON public."genesis_core" TO "authenticated";
GRANT TRUNCATE ON public."genesis_core" TO "authenticated";
GRANT REFERENCES ON public."genesis_core" TO "authenticated";
GRANT TRIGGER ON public."genesis_core" TO "authenticated";
GRANT MAINTAIN ON public."genesis_core" TO "authenticated";
GRANT INSERT ON public."genesis_core" TO "service_role";
GRANT SELECT ON public."genesis_core" TO "service_role";
GRANT UPDATE ON public."genesis_core" TO "service_role";
GRANT DELETE ON public."genesis_core" TO "service_role";
GRANT TRUNCATE ON public."genesis_core" TO "service_role";
GRANT REFERENCES ON public."genesis_core" TO "service_role";
GRANT TRIGGER ON public."genesis_core" TO "service_role";
GRANT MAINTAIN ON public."genesis_core" TO "service_role";
ALTER TABLE public."genesis_fluxo" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."genesis_fluxo" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."genesis_fluxo" TO "postgres";
GRANT SELECT ON public."genesis_fluxo" TO "postgres";
GRANT UPDATE ON public."genesis_fluxo" TO "postgres";
GRANT DELETE ON public."genesis_fluxo" TO "postgres";
GRANT TRUNCATE ON public."genesis_fluxo" TO "postgres";
GRANT REFERENCES ON public."genesis_fluxo" TO "postgres";
GRANT TRIGGER ON public."genesis_fluxo" TO "postgres";
GRANT MAINTAIN ON public."genesis_fluxo" TO "postgres";
GRANT INSERT ON public."genesis_fluxo" TO "anon";
GRANT SELECT ON public."genesis_fluxo" TO "anon";
GRANT UPDATE ON public."genesis_fluxo" TO "anon";
GRANT DELETE ON public."genesis_fluxo" TO "anon";
GRANT TRUNCATE ON public."genesis_fluxo" TO "anon";
GRANT REFERENCES ON public."genesis_fluxo" TO "anon";
GRANT TRIGGER ON public."genesis_fluxo" TO "anon";
GRANT MAINTAIN ON public."genesis_fluxo" TO "anon";
GRANT INSERT ON public."genesis_fluxo" TO "authenticated";
GRANT SELECT ON public."genesis_fluxo" TO "authenticated";
GRANT UPDATE ON public."genesis_fluxo" TO "authenticated";
GRANT DELETE ON public."genesis_fluxo" TO "authenticated";
GRANT TRUNCATE ON public."genesis_fluxo" TO "authenticated";
GRANT REFERENCES ON public."genesis_fluxo" TO "authenticated";
GRANT TRIGGER ON public."genesis_fluxo" TO "authenticated";
GRANT MAINTAIN ON public."genesis_fluxo" TO "authenticated";
GRANT INSERT ON public."genesis_fluxo" TO "service_role";
GRANT SELECT ON public."genesis_fluxo" TO "service_role";
GRANT UPDATE ON public."genesis_fluxo" TO "service_role";
GRANT DELETE ON public."genesis_fluxo" TO "service_role";
GRANT TRUNCATE ON public."genesis_fluxo" TO "service_role";
GRANT REFERENCES ON public."genesis_fluxo" TO "service_role";
GRANT TRIGGER ON public."genesis_fluxo" TO "service_role";
GRANT MAINTAIN ON public."genesis_fluxo" TO "service_role";
ALTER TABLE public."genesis_lentes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."genesis_lentes" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."genesis_lentes" TO "postgres";
GRANT SELECT ON public."genesis_lentes" TO "postgres";
GRANT UPDATE ON public."genesis_lentes" TO "postgres";
GRANT DELETE ON public."genesis_lentes" TO "postgres";
GRANT TRUNCATE ON public."genesis_lentes" TO "postgres";
GRANT REFERENCES ON public."genesis_lentes" TO "postgres";
GRANT TRIGGER ON public."genesis_lentes" TO "postgres";
GRANT MAINTAIN ON public."genesis_lentes" TO "postgres";
GRANT INSERT ON public."genesis_lentes" TO "anon";
GRANT SELECT ON public."genesis_lentes" TO "anon";
GRANT UPDATE ON public."genesis_lentes" TO "anon";
GRANT DELETE ON public."genesis_lentes" TO "anon";
GRANT TRUNCATE ON public."genesis_lentes" TO "anon";
GRANT REFERENCES ON public."genesis_lentes" TO "anon";
GRANT TRIGGER ON public."genesis_lentes" TO "anon";
GRANT MAINTAIN ON public."genesis_lentes" TO "anon";
GRANT INSERT ON public."genesis_lentes" TO "authenticated";
GRANT SELECT ON public."genesis_lentes" TO "authenticated";
GRANT UPDATE ON public."genesis_lentes" TO "authenticated";
GRANT DELETE ON public."genesis_lentes" TO "authenticated";
GRANT TRUNCATE ON public."genesis_lentes" TO "authenticated";
GRANT REFERENCES ON public."genesis_lentes" TO "authenticated";
GRANT TRIGGER ON public."genesis_lentes" TO "authenticated";
GRANT MAINTAIN ON public."genesis_lentes" TO "authenticated";
GRANT INSERT ON public."genesis_lentes" TO "service_role";
GRANT SELECT ON public."genesis_lentes" TO "service_role";
GRANT UPDATE ON public."genesis_lentes" TO "service_role";
GRANT DELETE ON public."genesis_lentes" TO "service_role";
GRANT TRUNCATE ON public."genesis_lentes" TO "service_role";
GRANT REFERENCES ON public."genesis_lentes" TO "service_role";
GRANT TRIGGER ON public."genesis_lentes" TO "service_role";
GRANT MAINTAIN ON public."genesis_lentes" TO "service_role";
ALTER TABLE public."genesis_principios" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."genesis_principios" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."genesis_principios" TO "postgres";
GRANT SELECT ON public."genesis_principios" TO "postgres";
GRANT UPDATE ON public."genesis_principios" TO "postgres";
GRANT DELETE ON public."genesis_principios" TO "postgres";
GRANT TRUNCATE ON public."genesis_principios" TO "postgres";
GRANT REFERENCES ON public."genesis_principios" TO "postgres";
GRANT TRIGGER ON public."genesis_principios" TO "postgres";
GRANT MAINTAIN ON public."genesis_principios" TO "postgres";
GRANT INSERT ON public."genesis_principios" TO "anon";
GRANT SELECT ON public."genesis_principios" TO "anon";
GRANT UPDATE ON public."genesis_principios" TO "anon";
GRANT DELETE ON public."genesis_principios" TO "anon";
GRANT TRUNCATE ON public."genesis_principios" TO "anon";
GRANT REFERENCES ON public."genesis_principios" TO "anon";
GRANT TRIGGER ON public."genesis_principios" TO "anon";
GRANT MAINTAIN ON public."genesis_principios" TO "anon";
GRANT INSERT ON public."genesis_principios" TO "authenticated";
GRANT SELECT ON public."genesis_principios" TO "authenticated";
GRANT UPDATE ON public."genesis_principios" TO "authenticated";
GRANT DELETE ON public."genesis_principios" TO "authenticated";
GRANT TRUNCATE ON public."genesis_principios" TO "authenticated";
GRANT REFERENCES ON public."genesis_principios" TO "authenticated";
GRANT TRIGGER ON public."genesis_principios" TO "authenticated";
GRANT MAINTAIN ON public."genesis_principios" TO "authenticated";
GRANT INSERT ON public."genesis_principios" TO "service_role";
GRANT SELECT ON public."genesis_principios" TO "service_role";
GRANT UPDATE ON public."genesis_principios" TO "service_role";
GRANT DELETE ON public."genesis_principios" TO "service_role";
GRANT TRUNCATE ON public."genesis_principios" TO "service_role";
GRANT REFERENCES ON public."genesis_principios" TO "service_role";
GRANT TRIGGER ON public."genesis_principios" TO "service_role";
GRANT MAINTAIN ON public."genesis_principios" TO "service_role";
ALTER TABLE public."genesis_tensoes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."genesis_tensoes" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."genesis_tensoes" TO "postgres";
GRANT SELECT ON public."genesis_tensoes" TO "postgres";
GRANT UPDATE ON public."genesis_tensoes" TO "postgres";
GRANT DELETE ON public."genesis_tensoes" TO "postgres";
GRANT TRUNCATE ON public."genesis_tensoes" TO "postgres";
GRANT REFERENCES ON public."genesis_tensoes" TO "postgres";
GRANT TRIGGER ON public."genesis_tensoes" TO "postgres";
GRANT MAINTAIN ON public."genesis_tensoes" TO "postgres";
GRANT INSERT ON public."genesis_tensoes" TO "anon";
GRANT SELECT ON public."genesis_tensoes" TO "anon";
GRANT UPDATE ON public."genesis_tensoes" TO "anon";
GRANT DELETE ON public."genesis_tensoes" TO "anon";
GRANT TRUNCATE ON public."genesis_tensoes" TO "anon";
GRANT REFERENCES ON public."genesis_tensoes" TO "anon";
GRANT TRIGGER ON public."genesis_tensoes" TO "anon";
GRANT MAINTAIN ON public."genesis_tensoes" TO "anon";
GRANT INSERT ON public."genesis_tensoes" TO "authenticated";
GRANT SELECT ON public."genesis_tensoes" TO "authenticated";
GRANT UPDATE ON public."genesis_tensoes" TO "authenticated";
GRANT DELETE ON public."genesis_tensoes" TO "authenticated";
GRANT TRUNCATE ON public."genesis_tensoes" TO "authenticated";
GRANT REFERENCES ON public."genesis_tensoes" TO "authenticated";
GRANT TRIGGER ON public."genesis_tensoes" TO "authenticated";
GRANT MAINTAIN ON public."genesis_tensoes" TO "authenticated";
GRANT INSERT ON public."genesis_tensoes" TO "service_role";
GRANT SELECT ON public."genesis_tensoes" TO "service_role";
GRANT UPDATE ON public."genesis_tensoes" TO "service_role";
GRANT DELETE ON public."genesis_tensoes" TO "service_role";
GRANT TRUNCATE ON public."genesis_tensoes" TO "service_role";
GRANT REFERENCES ON public."genesis_tensoes" TO "service_role";
GRANT TRIGGER ON public."genesis_tensoes" TO "service_role";
GRANT MAINTAIN ON public."genesis_tensoes" TO "service_role";
ALTER TABLE public."ideas" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."ideas" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."ideas" TO "postgres";
GRANT SELECT ON public."ideas" TO "postgres";
GRANT UPDATE ON public."ideas" TO "postgres";
GRANT DELETE ON public."ideas" TO "postgres";
GRANT TRUNCATE ON public."ideas" TO "postgres";
GRANT REFERENCES ON public."ideas" TO "postgres";
GRANT TRIGGER ON public."ideas" TO "postgres";
GRANT MAINTAIN ON public."ideas" TO "postgres";
GRANT INSERT ON public."ideas" TO "anon";
GRANT SELECT ON public."ideas" TO "anon";
GRANT UPDATE ON public."ideas" TO "anon";
GRANT DELETE ON public."ideas" TO "anon";
GRANT TRUNCATE ON public."ideas" TO "anon";
GRANT REFERENCES ON public."ideas" TO "anon";
GRANT TRIGGER ON public."ideas" TO "anon";
GRANT MAINTAIN ON public."ideas" TO "anon";
GRANT INSERT ON public."ideas" TO "authenticated";
GRANT SELECT ON public."ideas" TO "authenticated";
GRANT UPDATE ON public."ideas" TO "authenticated";
GRANT DELETE ON public."ideas" TO "authenticated";
GRANT TRUNCATE ON public."ideas" TO "authenticated";
GRANT REFERENCES ON public."ideas" TO "authenticated";
GRANT TRIGGER ON public."ideas" TO "authenticated";
GRANT MAINTAIN ON public."ideas" TO "authenticated";
GRANT INSERT ON public."ideas" TO "service_role";
GRANT SELECT ON public."ideas" TO "service_role";
GRANT UPDATE ON public."ideas" TO "service_role";
GRANT DELETE ON public."ideas" TO "service_role";
GRANT TRUNCATE ON public."ideas" TO "service_role";
GRANT REFERENCES ON public."ideas" TO "service_role";
GRANT TRIGGER ON public."ideas" TO "service_role";
GRANT MAINTAIN ON public."ideas" TO "service_role";
ALTER TABLE public."image_model_trials" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."image_model_trials" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."image_model_trials" TO "postgres";
GRANT SELECT ON public."image_model_trials" TO "postgres";
GRANT UPDATE ON public."image_model_trials" TO "postgres";
GRANT DELETE ON public."image_model_trials" TO "postgres";
GRANT TRUNCATE ON public."image_model_trials" TO "postgres";
GRANT REFERENCES ON public."image_model_trials" TO "postgres";
GRANT TRIGGER ON public."image_model_trials" TO "postgres";
GRANT MAINTAIN ON public."image_model_trials" TO "postgres";
GRANT INSERT ON public."image_model_trials" TO "anon";
GRANT SELECT ON public."image_model_trials" TO "anon";
GRANT UPDATE ON public."image_model_trials" TO "anon";
GRANT DELETE ON public."image_model_trials" TO "anon";
GRANT TRUNCATE ON public."image_model_trials" TO "anon";
GRANT REFERENCES ON public."image_model_trials" TO "anon";
GRANT TRIGGER ON public."image_model_trials" TO "anon";
GRANT MAINTAIN ON public."image_model_trials" TO "anon";
GRANT INSERT ON public."image_model_trials" TO "authenticated";
GRANT SELECT ON public."image_model_trials" TO "authenticated";
GRANT UPDATE ON public."image_model_trials" TO "authenticated";
GRANT DELETE ON public."image_model_trials" TO "authenticated";
GRANT TRUNCATE ON public."image_model_trials" TO "authenticated";
GRANT REFERENCES ON public."image_model_trials" TO "authenticated";
GRANT TRIGGER ON public."image_model_trials" TO "authenticated";
GRANT MAINTAIN ON public."image_model_trials" TO "authenticated";
GRANT INSERT ON public."image_model_trials" TO "service_role";
GRANT SELECT ON public."image_model_trials" TO "service_role";
GRANT UPDATE ON public."image_model_trials" TO "service_role";
GRANT DELETE ON public."image_model_trials" TO "service_role";
GRANT TRUNCATE ON public."image_model_trials" TO "service_role";
GRANT REFERENCES ON public."image_model_trials" TO "service_role";
GRANT TRIGGER ON public."image_model_trials" TO "service_role";
GRANT MAINTAIN ON public."image_model_trials" TO "service_role";
ALTER TABLE public."kanban_columns" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."kanban_columns" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."kanban_columns" TO "postgres";
GRANT SELECT ON public."kanban_columns" TO "postgres";
GRANT UPDATE ON public."kanban_columns" TO "postgres";
GRANT DELETE ON public."kanban_columns" TO "postgres";
GRANT TRUNCATE ON public."kanban_columns" TO "postgres";
GRANT REFERENCES ON public."kanban_columns" TO "postgres";
GRANT TRIGGER ON public."kanban_columns" TO "postgres";
GRANT MAINTAIN ON public."kanban_columns" TO "postgres";
GRANT INSERT ON public."kanban_columns" TO "anon";
GRANT SELECT ON public."kanban_columns" TO "anon";
GRANT UPDATE ON public."kanban_columns" TO "anon";
GRANT DELETE ON public."kanban_columns" TO "anon";
GRANT TRUNCATE ON public."kanban_columns" TO "anon";
GRANT REFERENCES ON public."kanban_columns" TO "anon";
GRANT TRIGGER ON public."kanban_columns" TO "anon";
GRANT MAINTAIN ON public."kanban_columns" TO "anon";
GRANT INSERT ON public."kanban_columns" TO "authenticated";
GRANT SELECT ON public."kanban_columns" TO "authenticated";
GRANT UPDATE ON public."kanban_columns" TO "authenticated";
GRANT DELETE ON public."kanban_columns" TO "authenticated";
GRANT TRUNCATE ON public."kanban_columns" TO "authenticated";
GRANT REFERENCES ON public."kanban_columns" TO "authenticated";
GRANT TRIGGER ON public."kanban_columns" TO "authenticated";
GRANT MAINTAIN ON public."kanban_columns" TO "authenticated";
GRANT INSERT ON public."kanban_columns" TO "service_role";
GRANT SELECT ON public."kanban_columns" TO "service_role";
GRANT UPDATE ON public."kanban_columns" TO "service_role";
GRANT DELETE ON public."kanban_columns" TO "service_role";
GRANT TRUNCATE ON public."kanban_columns" TO "service_role";
GRANT REFERENCES ON public."kanban_columns" TO "service_role";
GRANT TRIGGER ON public."kanban_columns" TO "service_role";
GRANT MAINTAIN ON public."kanban_columns" TO "service_role";
ALTER TABLE public."knowledge_analysis_runs" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."knowledge_analysis_runs" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."knowledge_analysis_runs" TO "postgres";
GRANT SELECT ON public."knowledge_analysis_runs" TO "postgres";
GRANT UPDATE ON public."knowledge_analysis_runs" TO "postgres";
GRANT DELETE ON public."knowledge_analysis_runs" TO "postgres";
GRANT TRUNCATE ON public."knowledge_analysis_runs" TO "postgres";
GRANT REFERENCES ON public."knowledge_analysis_runs" TO "postgres";
GRANT TRIGGER ON public."knowledge_analysis_runs" TO "postgres";
GRANT MAINTAIN ON public."knowledge_analysis_runs" TO "postgres";
GRANT INSERT ON public."knowledge_analysis_runs" TO "anon";
GRANT SELECT ON public."knowledge_analysis_runs" TO "anon";
GRANT UPDATE ON public."knowledge_analysis_runs" TO "anon";
GRANT DELETE ON public."knowledge_analysis_runs" TO "anon";
GRANT TRUNCATE ON public."knowledge_analysis_runs" TO "anon";
GRANT REFERENCES ON public."knowledge_analysis_runs" TO "anon";
GRANT TRIGGER ON public."knowledge_analysis_runs" TO "anon";
GRANT MAINTAIN ON public."knowledge_analysis_runs" TO "anon";
GRANT INSERT ON public."knowledge_analysis_runs" TO "authenticated";
GRANT SELECT ON public."knowledge_analysis_runs" TO "authenticated";
GRANT UPDATE ON public."knowledge_analysis_runs" TO "authenticated";
GRANT DELETE ON public."knowledge_analysis_runs" TO "authenticated";
GRANT TRUNCATE ON public."knowledge_analysis_runs" TO "authenticated";
GRANT REFERENCES ON public."knowledge_analysis_runs" TO "authenticated";
GRANT TRIGGER ON public."knowledge_analysis_runs" TO "authenticated";
GRANT MAINTAIN ON public."knowledge_analysis_runs" TO "authenticated";
GRANT INSERT ON public."knowledge_analysis_runs" TO "service_role";
GRANT SELECT ON public."knowledge_analysis_runs" TO "service_role";
GRANT UPDATE ON public."knowledge_analysis_runs" TO "service_role";
GRANT DELETE ON public."knowledge_analysis_runs" TO "service_role";
GRANT TRUNCATE ON public."knowledge_analysis_runs" TO "service_role";
GRANT REFERENCES ON public."knowledge_analysis_runs" TO "service_role";
GRANT TRIGGER ON public."knowledge_analysis_runs" TO "service_role";
GRANT MAINTAIN ON public."knowledge_analysis_runs" TO "service_role";
ALTER TABLE public."knowledge_chunks" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."knowledge_chunks" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."knowledge_chunks" TO "postgres";
GRANT SELECT ON public."knowledge_chunks" TO "postgres";
GRANT UPDATE ON public."knowledge_chunks" TO "postgres";
GRANT DELETE ON public."knowledge_chunks" TO "postgres";
GRANT TRUNCATE ON public."knowledge_chunks" TO "postgres";
GRANT REFERENCES ON public."knowledge_chunks" TO "postgres";
GRANT TRIGGER ON public."knowledge_chunks" TO "postgres";
GRANT MAINTAIN ON public."knowledge_chunks" TO "postgres";
GRANT INSERT ON public."knowledge_chunks" TO "anon";
GRANT SELECT ON public."knowledge_chunks" TO "anon";
GRANT UPDATE ON public."knowledge_chunks" TO "anon";
GRANT DELETE ON public."knowledge_chunks" TO "anon";
GRANT TRUNCATE ON public."knowledge_chunks" TO "anon";
GRANT REFERENCES ON public."knowledge_chunks" TO "anon";
GRANT TRIGGER ON public."knowledge_chunks" TO "anon";
GRANT MAINTAIN ON public."knowledge_chunks" TO "anon";
GRANT INSERT ON public."knowledge_chunks" TO "authenticated";
GRANT SELECT ON public."knowledge_chunks" TO "authenticated";
GRANT UPDATE ON public."knowledge_chunks" TO "authenticated";
GRANT DELETE ON public."knowledge_chunks" TO "authenticated";
GRANT TRUNCATE ON public."knowledge_chunks" TO "authenticated";
GRANT REFERENCES ON public."knowledge_chunks" TO "authenticated";
GRANT TRIGGER ON public."knowledge_chunks" TO "authenticated";
GRANT MAINTAIN ON public."knowledge_chunks" TO "authenticated";
GRANT INSERT ON public."knowledge_chunks" TO "service_role";
GRANT SELECT ON public."knowledge_chunks" TO "service_role";
GRANT UPDATE ON public."knowledge_chunks" TO "service_role";
GRANT DELETE ON public."knowledge_chunks" TO "service_role";
GRANT TRUNCATE ON public."knowledge_chunks" TO "service_role";
GRANT REFERENCES ON public."knowledge_chunks" TO "service_role";
GRANT TRIGGER ON public."knowledge_chunks" TO "service_role";
GRANT MAINTAIN ON public."knowledge_chunks" TO "service_role";
ALTER TABLE public."knowledge_discoveries" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."knowledge_discoveries" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."knowledge_discoveries" TO "postgres";
GRANT SELECT ON public."knowledge_discoveries" TO "postgres";
GRANT UPDATE ON public."knowledge_discoveries" TO "postgres";
GRANT DELETE ON public."knowledge_discoveries" TO "postgres";
GRANT TRUNCATE ON public."knowledge_discoveries" TO "postgres";
GRANT REFERENCES ON public."knowledge_discoveries" TO "postgres";
GRANT TRIGGER ON public."knowledge_discoveries" TO "postgres";
GRANT MAINTAIN ON public."knowledge_discoveries" TO "postgres";
GRANT INSERT ON public."knowledge_discoveries" TO "anon";
GRANT SELECT ON public."knowledge_discoveries" TO "anon";
GRANT UPDATE ON public."knowledge_discoveries" TO "anon";
GRANT DELETE ON public."knowledge_discoveries" TO "anon";
GRANT TRUNCATE ON public."knowledge_discoveries" TO "anon";
GRANT REFERENCES ON public."knowledge_discoveries" TO "anon";
GRANT TRIGGER ON public."knowledge_discoveries" TO "anon";
GRANT MAINTAIN ON public."knowledge_discoveries" TO "anon";
GRANT INSERT ON public."knowledge_discoveries" TO "authenticated";
GRANT SELECT ON public."knowledge_discoveries" TO "authenticated";
GRANT UPDATE ON public."knowledge_discoveries" TO "authenticated";
GRANT DELETE ON public."knowledge_discoveries" TO "authenticated";
GRANT TRUNCATE ON public."knowledge_discoveries" TO "authenticated";
GRANT REFERENCES ON public."knowledge_discoveries" TO "authenticated";
GRANT TRIGGER ON public."knowledge_discoveries" TO "authenticated";
GRANT MAINTAIN ON public."knowledge_discoveries" TO "authenticated";
GRANT INSERT ON public."knowledge_discoveries" TO "service_role";
GRANT SELECT ON public."knowledge_discoveries" TO "service_role";
GRANT UPDATE ON public."knowledge_discoveries" TO "service_role";
GRANT DELETE ON public."knowledge_discoveries" TO "service_role";
GRANT TRUNCATE ON public."knowledge_discoveries" TO "service_role";
GRANT REFERENCES ON public."knowledge_discoveries" TO "service_role";
GRANT TRIGGER ON public."knowledge_discoveries" TO "service_role";
GRANT MAINTAIN ON public."knowledge_discoveries" TO "service_role";
ALTER TABLE public."knowledge_documents" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."knowledge_documents" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."knowledge_documents" TO "postgres";
GRANT SELECT ON public."knowledge_documents" TO "postgres";
GRANT UPDATE ON public."knowledge_documents" TO "postgres";
GRANT DELETE ON public."knowledge_documents" TO "postgres";
GRANT TRUNCATE ON public."knowledge_documents" TO "postgres";
GRANT REFERENCES ON public."knowledge_documents" TO "postgres";
GRANT TRIGGER ON public."knowledge_documents" TO "postgres";
GRANT MAINTAIN ON public."knowledge_documents" TO "postgres";
GRANT INSERT ON public."knowledge_documents" TO "anon";
GRANT SELECT ON public."knowledge_documents" TO "anon";
GRANT UPDATE ON public."knowledge_documents" TO "anon";
GRANT DELETE ON public."knowledge_documents" TO "anon";
GRANT TRUNCATE ON public."knowledge_documents" TO "anon";
GRANT REFERENCES ON public."knowledge_documents" TO "anon";
GRANT TRIGGER ON public."knowledge_documents" TO "anon";
GRANT MAINTAIN ON public."knowledge_documents" TO "anon";
GRANT INSERT ON public."knowledge_documents" TO "authenticated";
GRANT SELECT ON public."knowledge_documents" TO "authenticated";
GRANT UPDATE ON public."knowledge_documents" TO "authenticated";
GRANT DELETE ON public."knowledge_documents" TO "authenticated";
GRANT TRUNCATE ON public."knowledge_documents" TO "authenticated";
GRANT REFERENCES ON public."knowledge_documents" TO "authenticated";
GRANT TRIGGER ON public."knowledge_documents" TO "authenticated";
GRANT MAINTAIN ON public."knowledge_documents" TO "authenticated";
GRANT INSERT ON public."knowledge_documents" TO "service_role";
GRANT SELECT ON public."knowledge_documents" TO "service_role";
GRANT UPDATE ON public."knowledge_documents" TO "service_role";
GRANT DELETE ON public."knowledge_documents" TO "service_role";
GRANT TRUNCATE ON public."knowledge_documents" TO "service_role";
GRANT REFERENCES ON public."knowledge_documents" TO "service_role";
GRANT TRIGGER ON public."knowledge_documents" TO "service_role";
GRANT MAINTAIN ON public."knowledge_documents" TO "service_role";
ALTER TABLE public."meta_ad_accounts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."meta_ad_accounts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."meta_ad_accounts" TO "postgres";
GRANT SELECT ON public."meta_ad_accounts" TO "postgres";
GRANT UPDATE ON public."meta_ad_accounts" TO "postgres";
GRANT DELETE ON public."meta_ad_accounts" TO "postgres";
GRANT TRUNCATE ON public."meta_ad_accounts" TO "postgres";
GRANT REFERENCES ON public."meta_ad_accounts" TO "postgres";
GRANT TRIGGER ON public."meta_ad_accounts" TO "postgres";
GRANT MAINTAIN ON public."meta_ad_accounts" TO "postgres";
GRANT INSERT ON public."meta_ad_accounts" TO "anon";
GRANT SELECT ON public."meta_ad_accounts" TO "anon";
GRANT UPDATE ON public."meta_ad_accounts" TO "anon";
GRANT DELETE ON public."meta_ad_accounts" TO "anon";
GRANT TRUNCATE ON public."meta_ad_accounts" TO "anon";
GRANT REFERENCES ON public."meta_ad_accounts" TO "anon";
GRANT TRIGGER ON public."meta_ad_accounts" TO "anon";
GRANT MAINTAIN ON public."meta_ad_accounts" TO "anon";
GRANT INSERT ON public."meta_ad_accounts" TO "authenticated";
GRANT SELECT ON public."meta_ad_accounts" TO "authenticated";
GRANT UPDATE ON public."meta_ad_accounts" TO "authenticated";
GRANT DELETE ON public."meta_ad_accounts" TO "authenticated";
GRANT TRUNCATE ON public."meta_ad_accounts" TO "authenticated";
GRANT REFERENCES ON public."meta_ad_accounts" TO "authenticated";
GRANT TRIGGER ON public."meta_ad_accounts" TO "authenticated";
GRANT MAINTAIN ON public."meta_ad_accounts" TO "authenticated";
GRANT INSERT ON public."meta_ad_accounts" TO "service_role";
GRANT SELECT ON public."meta_ad_accounts" TO "service_role";
GRANT UPDATE ON public."meta_ad_accounts" TO "service_role";
GRANT DELETE ON public."meta_ad_accounts" TO "service_role";
GRANT TRUNCATE ON public."meta_ad_accounts" TO "service_role";
GRANT REFERENCES ON public."meta_ad_accounts" TO "service_role";
GRANT TRIGGER ON public."meta_ad_accounts" TO "service_role";
GRANT MAINTAIN ON public."meta_ad_accounts" TO "service_role";
ALTER TABLE public."meta_ad_insights_daily" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."meta_ad_insights_daily" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."meta_ad_insights_daily" TO "postgres";
GRANT SELECT ON public."meta_ad_insights_daily" TO "postgres";
GRANT UPDATE ON public."meta_ad_insights_daily" TO "postgres";
GRANT DELETE ON public."meta_ad_insights_daily" TO "postgres";
GRANT TRUNCATE ON public."meta_ad_insights_daily" TO "postgres";
GRANT REFERENCES ON public."meta_ad_insights_daily" TO "postgres";
GRANT TRIGGER ON public."meta_ad_insights_daily" TO "postgres";
GRANT MAINTAIN ON public."meta_ad_insights_daily" TO "postgres";
GRANT INSERT ON public."meta_ad_insights_daily" TO "anon";
GRANT SELECT ON public."meta_ad_insights_daily" TO "anon";
GRANT UPDATE ON public."meta_ad_insights_daily" TO "anon";
GRANT DELETE ON public."meta_ad_insights_daily" TO "anon";
GRANT TRUNCATE ON public."meta_ad_insights_daily" TO "anon";
GRANT REFERENCES ON public."meta_ad_insights_daily" TO "anon";
GRANT TRIGGER ON public."meta_ad_insights_daily" TO "anon";
GRANT MAINTAIN ON public."meta_ad_insights_daily" TO "anon";
GRANT INSERT ON public."meta_ad_insights_daily" TO "authenticated";
GRANT SELECT ON public."meta_ad_insights_daily" TO "authenticated";
GRANT UPDATE ON public."meta_ad_insights_daily" TO "authenticated";
GRANT DELETE ON public."meta_ad_insights_daily" TO "authenticated";
GRANT TRUNCATE ON public."meta_ad_insights_daily" TO "authenticated";
GRANT REFERENCES ON public."meta_ad_insights_daily" TO "authenticated";
GRANT TRIGGER ON public."meta_ad_insights_daily" TO "authenticated";
GRANT MAINTAIN ON public."meta_ad_insights_daily" TO "authenticated";
GRANT INSERT ON public."meta_ad_insights_daily" TO "service_role";
GRANT SELECT ON public."meta_ad_insights_daily" TO "service_role";
GRANT UPDATE ON public."meta_ad_insights_daily" TO "service_role";
GRANT DELETE ON public."meta_ad_insights_daily" TO "service_role";
GRANT TRUNCATE ON public."meta_ad_insights_daily" TO "service_role";
GRANT REFERENCES ON public."meta_ad_insights_daily" TO "service_role";
GRANT TRIGGER ON public."meta_ad_insights_daily" TO "service_role";
GRANT MAINTAIN ON public."meta_ad_insights_daily" TO "service_role";
ALTER TABLE public."meta_ads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."meta_ads" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."meta_ads" TO "postgres";
GRANT SELECT ON public."meta_ads" TO "postgres";
GRANT UPDATE ON public."meta_ads" TO "postgres";
GRANT DELETE ON public."meta_ads" TO "postgres";
GRANT TRUNCATE ON public."meta_ads" TO "postgres";
GRANT REFERENCES ON public."meta_ads" TO "postgres";
GRANT TRIGGER ON public."meta_ads" TO "postgres";
GRANT MAINTAIN ON public."meta_ads" TO "postgres";
GRANT INSERT ON public."meta_ads" TO "anon";
GRANT SELECT ON public."meta_ads" TO "anon";
GRANT UPDATE ON public."meta_ads" TO "anon";
GRANT DELETE ON public."meta_ads" TO "anon";
GRANT TRUNCATE ON public."meta_ads" TO "anon";
GRANT REFERENCES ON public."meta_ads" TO "anon";
GRANT TRIGGER ON public."meta_ads" TO "anon";
GRANT MAINTAIN ON public."meta_ads" TO "anon";
GRANT INSERT ON public."meta_ads" TO "authenticated";
GRANT SELECT ON public."meta_ads" TO "authenticated";
GRANT UPDATE ON public."meta_ads" TO "authenticated";
GRANT DELETE ON public."meta_ads" TO "authenticated";
GRANT TRUNCATE ON public."meta_ads" TO "authenticated";
GRANT REFERENCES ON public."meta_ads" TO "authenticated";
GRANT TRIGGER ON public."meta_ads" TO "authenticated";
GRANT MAINTAIN ON public."meta_ads" TO "authenticated";
GRANT INSERT ON public."meta_ads" TO "service_role";
GRANT SELECT ON public."meta_ads" TO "service_role";
GRANT UPDATE ON public."meta_ads" TO "service_role";
GRANT DELETE ON public."meta_ads" TO "service_role";
GRANT TRUNCATE ON public."meta_ads" TO "service_role";
GRANT REFERENCES ON public."meta_ads" TO "service_role";
GRANT TRIGGER ON public."meta_ads" TO "service_role";
GRANT MAINTAIN ON public."meta_ads" TO "service_role";
ALTER TABLE public."meta_adsets" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."meta_adsets" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."meta_adsets" TO "postgres";
GRANT SELECT ON public."meta_adsets" TO "postgres";
GRANT UPDATE ON public."meta_adsets" TO "postgres";
GRANT DELETE ON public."meta_adsets" TO "postgres";
GRANT TRUNCATE ON public."meta_adsets" TO "postgres";
GRANT REFERENCES ON public."meta_adsets" TO "postgres";
GRANT TRIGGER ON public."meta_adsets" TO "postgres";
GRANT MAINTAIN ON public."meta_adsets" TO "postgres";
GRANT INSERT ON public."meta_adsets" TO "anon";
GRANT SELECT ON public."meta_adsets" TO "anon";
GRANT UPDATE ON public."meta_adsets" TO "anon";
GRANT DELETE ON public."meta_adsets" TO "anon";
GRANT TRUNCATE ON public."meta_adsets" TO "anon";
GRANT REFERENCES ON public."meta_adsets" TO "anon";
GRANT TRIGGER ON public."meta_adsets" TO "anon";
GRANT MAINTAIN ON public."meta_adsets" TO "anon";
GRANT INSERT ON public."meta_adsets" TO "authenticated";
GRANT SELECT ON public."meta_adsets" TO "authenticated";
GRANT UPDATE ON public."meta_adsets" TO "authenticated";
GRANT DELETE ON public."meta_adsets" TO "authenticated";
GRANT TRUNCATE ON public."meta_adsets" TO "authenticated";
GRANT REFERENCES ON public."meta_adsets" TO "authenticated";
GRANT TRIGGER ON public."meta_adsets" TO "authenticated";
GRANT MAINTAIN ON public."meta_adsets" TO "authenticated";
GRANT INSERT ON public."meta_adsets" TO "service_role";
GRANT SELECT ON public."meta_adsets" TO "service_role";
GRANT UPDATE ON public."meta_adsets" TO "service_role";
GRANT DELETE ON public."meta_adsets" TO "service_role";
GRANT TRUNCATE ON public."meta_adsets" TO "service_role";
GRANT REFERENCES ON public."meta_adsets" TO "service_role";
GRANT TRIGGER ON public."meta_adsets" TO "service_role";
GRANT MAINTAIN ON public."meta_adsets" TO "service_role";
ALTER TABLE public."meta_businesses" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."meta_businesses" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."meta_businesses" TO "postgres";
GRANT SELECT ON public."meta_businesses" TO "postgres";
GRANT UPDATE ON public."meta_businesses" TO "postgres";
GRANT DELETE ON public."meta_businesses" TO "postgres";
GRANT TRUNCATE ON public."meta_businesses" TO "postgres";
GRANT REFERENCES ON public."meta_businesses" TO "postgres";
GRANT TRIGGER ON public."meta_businesses" TO "postgres";
GRANT MAINTAIN ON public."meta_businesses" TO "postgres";
GRANT INSERT ON public."meta_businesses" TO "anon";
GRANT SELECT ON public."meta_businesses" TO "anon";
GRANT UPDATE ON public."meta_businesses" TO "anon";
GRANT DELETE ON public."meta_businesses" TO "anon";
GRANT TRUNCATE ON public."meta_businesses" TO "anon";
GRANT REFERENCES ON public."meta_businesses" TO "anon";
GRANT TRIGGER ON public."meta_businesses" TO "anon";
GRANT MAINTAIN ON public."meta_businesses" TO "anon";
GRANT INSERT ON public."meta_businesses" TO "authenticated";
GRANT SELECT ON public."meta_businesses" TO "authenticated";
GRANT UPDATE ON public."meta_businesses" TO "authenticated";
GRANT DELETE ON public."meta_businesses" TO "authenticated";
GRANT TRUNCATE ON public."meta_businesses" TO "authenticated";
GRANT REFERENCES ON public."meta_businesses" TO "authenticated";
GRANT TRIGGER ON public."meta_businesses" TO "authenticated";
GRANT MAINTAIN ON public."meta_businesses" TO "authenticated";
GRANT INSERT ON public."meta_businesses" TO "service_role";
GRANT SELECT ON public."meta_businesses" TO "service_role";
GRANT UPDATE ON public."meta_businesses" TO "service_role";
GRANT DELETE ON public."meta_businesses" TO "service_role";
GRANT TRUNCATE ON public."meta_businesses" TO "service_role";
GRANT REFERENCES ON public."meta_businesses" TO "service_role";
GRANT TRIGGER ON public."meta_businesses" TO "service_role";
GRANT MAINTAIN ON public."meta_businesses" TO "service_role";
ALTER TABLE public."meta_campaigns" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."meta_campaigns" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."meta_campaigns" TO "postgres";
GRANT SELECT ON public."meta_campaigns" TO "postgres";
GRANT UPDATE ON public."meta_campaigns" TO "postgres";
GRANT DELETE ON public."meta_campaigns" TO "postgres";
GRANT TRUNCATE ON public."meta_campaigns" TO "postgres";
GRANT REFERENCES ON public."meta_campaigns" TO "postgres";
GRANT TRIGGER ON public."meta_campaigns" TO "postgres";
GRANT MAINTAIN ON public."meta_campaigns" TO "postgres";
GRANT INSERT ON public."meta_campaigns" TO "anon";
GRANT SELECT ON public."meta_campaigns" TO "anon";
GRANT UPDATE ON public."meta_campaigns" TO "anon";
GRANT DELETE ON public."meta_campaigns" TO "anon";
GRANT TRUNCATE ON public."meta_campaigns" TO "anon";
GRANT REFERENCES ON public."meta_campaigns" TO "anon";
GRANT TRIGGER ON public."meta_campaigns" TO "anon";
GRANT MAINTAIN ON public."meta_campaigns" TO "anon";
GRANT INSERT ON public."meta_campaigns" TO "authenticated";
GRANT SELECT ON public."meta_campaigns" TO "authenticated";
GRANT UPDATE ON public."meta_campaigns" TO "authenticated";
GRANT DELETE ON public."meta_campaigns" TO "authenticated";
GRANT TRUNCATE ON public."meta_campaigns" TO "authenticated";
GRANT REFERENCES ON public."meta_campaigns" TO "authenticated";
GRANT TRIGGER ON public."meta_campaigns" TO "authenticated";
GRANT MAINTAIN ON public."meta_campaigns" TO "authenticated";
GRANT INSERT ON public."meta_campaigns" TO "service_role";
GRANT SELECT ON public."meta_campaigns" TO "service_role";
GRANT UPDATE ON public."meta_campaigns" TO "service_role";
GRANT DELETE ON public."meta_campaigns" TO "service_role";
GRANT TRUNCATE ON public."meta_campaigns" TO "service_role";
GRANT REFERENCES ON public."meta_campaigns" TO "service_role";
GRANT TRIGGER ON public."meta_campaigns" TO "service_role";
GRANT MAINTAIN ON public."meta_campaigns" TO "service_role";
ALTER TABLE public."meta_connections" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."meta_connections" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."meta_connections" TO "postgres";
GRANT SELECT ON public."meta_connections" TO "postgres";
GRANT UPDATE ON public."meta_connections" TO "postgres";
GRANT DELETE ON public."meta_connections" TO "postgres";
GRANT TRUNCATE ON public."meta_connections" TO "postgres";
GRANT REFERENCES ON public."meta_connections" TO "postgres";
GRANT TRIGGER ON public."meta_connections" TO "postgres";
GRANT MAINTAIN ON public."meta_connections" TO "postgres";
GRANT INSERT ON public."meta_connections" TO "anon";
GRANT SELECT ON public."meta_connections" TO "anon";
GRANT UPDATE ON public."meta_connections" TO "anon";
GRANT DELETE ON public."meta_connections" TO "anon";
GRANT TRUNCATE ON public."meta_connections" TO "anon";
GRANT REFERENCES ON public."meta_connections" TO "anon";
GRANT TRIGGER ON public."meta_connections" TO "anon";
GRANT MAINTAIN ON public."meta_connections" TO "anon";
GRANT INSERT ON public."meta_connections" TO "authenticated";
GRANT SELECT ON public."meta_connections" TO "authenticated";
GRANT UPDATE ON public."meta_connections" TO "authenticated";
GRANT DELETE ON public."meta_connections" TO "authenticated";
GRANT TRUNCATE ON public."meta_connections" TO "authenticated";
GRANT REFERENCES ON public."meta_connections" TO "authenticated";
GRANT TRIGGER ON public."meta_connections" TO "authenticated";
GRANT MAINTAIN ON public."meta_connections" TO "authenticated";
GRANT INSERT ON public."meta_connections" TO "service_role";
GRANT SELECT ON public."meta_connections" TO "service_role";
GRANT UPDATE ON public."meta_connections" TO "service_role";
GRANT DELETE ON public."meta_connections" TO "service_role";
GRANT TRUNCATE ON public."meta_connections" TO "service_role";
GRANT REFERENCES ON public."meta_connections" TO "service_role";
GRANT TRIGGER ON public."meta_connections" TO "service_role";
GRANT MAINTAIN ON public."meta_connections" TO "service_role";
ALTER TABLE public."olhar_base" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."olhar_base" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."olhar_base" TO "postgres";
GRANT SELECT ON public."olhar_base" TO "postgres";
GRANT UPDATE ON public."olhar_base" TO "postgres";
GRANT DELETE ON public."olhar_base" TO "postgres";
GRANT TRUNCATE ON public."olhar_base" TO "postgres";
GRANT REFERENCES ON public."olhar_base" TO "postgres";
GRANT TRIGGER ON public."olhar_base" TO "postgres";
GRANT MAINTAIN ON public."olhar_base" TO "postgres";
GRANT INSERT ON public."olhar_base" TO "authenticated";
GRANT SELECT ON public."olhar_base" TO "authenticated";
GRANT UPDATE ON public."olhar_base" TO "authenticated";
GRANT DELETE ON public."olhar_base" TO "authenticated";
GRANT TRUNCATE ON public."olhar_base" TO "authenticated";
GRANT REFERENCES ON public."olhar_base" TO "authenticated";
GRANT TRIGGER ON public."olhar_base" TO "authenticated";
GRANT MAINTAIN ON public."olhar_base" TO "authenticated";
GRANT INSERT ON public."olhar_base" TO "service_role";
GRANT SELECT ON public."olhar_base" TO "service_role";
GRANT UPDATE ON public."olhar_base" TO "service_role";
GRANT DELETE ON public."olhar_base" TO "service_role";
GRANT TRUNCATE ON public."olhar_base" TO "service_role";
GRANT REFERENCES ON public."olhar_base" TO "service_role";
GRANT TRIGGER ON public."olhar_base" TO "service_role";
GRANT MAINTAIN ON public."olhar_base" TO "service_role";
ALTER TABLE public."olhar_calibracao" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."olhar_calibracao" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."olhar_calibracao" TO "postgres";
GRANT SELECT ON public."olhar_calibracao" TO "postgres";
GRANT UPDATE ON public."olhar_calibracao" TO "postgres";
GRANT DELETE ON public."olhar_calibracao" TO "postgres";
GRANT TRUNCATE ON public."olhar_calibracao" TO "postgres";
GRANT REFERENCES ON public."olhar_calibracao" TO "postgres";
GRANT TRIGGER ON public."olhar_calibracao" TO "postgres";
GRANT MAINTAIN ON public."olhar_calibracao" TO "postgres";
GRANT INSERT ON public."olhar_calibracao" TO "authenticated";
GRANT SELECT ON public."olhar_calibracao" TO "authenticated";
GRANT UPDATE ON public."olhar_calibracao" TO "authenticated";
GRANT DELETE ON public."olhar_calibracao" TO "authenticated";
GRANT TRUNCATE ON public."olhar_calibracao" TO "authenticated";
GRANT REFERENCES ON public."olhar_calibracao" TO "authenticated";
GRANT TRIGGER ON public."olhar_calibracao" TO "authenticated";
GRANT MAINTAIN ON public."olhar_calibracao" TO "authenticated";
GRANT INSERT ON public."olhar_calibracao" TO "service_role";
GRANT SELECT ON public."olhar_calibracao" TO "service_role";
GRANT UPDATE ON public."olhar_calibracao" TO "service_role";
GRANT DELETE ON public."olhar_calibracao" TO "service_role";
GRANT TRUNCATE ON public."olhar_calibracao" TO "service_role";
GRANT REFERENCES ON public."olhar_calibracao" TO "service_role";
GRANT TRIGGER ON public."olhar_calibracao" TO "service_role";
GRANT MAINTAIN ON public."olhar_calibracao" TO "service_role";
ALTER TABLE public."olhar_nomes_proibidos" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."olhar_nomes_proibidos" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."olhar_nomes_proibidos" TO "postgres";
GRANT SELECT ON public."olhar_nomes_proibidos" TO "postgres";
GRANT UPDATE ON public."olhar_nomes_proibidos" TO "postgres";
GRANT DELETE ON public."olhar_nomes_proibidos" TO "postgres";
GRANT TRUNCATE ON public."olhar_nomes_proibidos" TO "postgres";
GRANT REFERENCES ON public."olhar_nomes_proibidos" TO "postgres";
GRANT TRIGGER ON public."olhar_nomes_proibidos" TO "postgres";
GRANT MAINTAIN ON public."olhar_nomes_proibidos" TO "postgres";
GRANT INSERT ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT SELECT ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT UPDATE ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT DELETE ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT TRUNCATE ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT REFERENCES ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT TRIGGER ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT MAINTAIN ON public."olhar_nomes_proibidos" TO "authenticated";
GRANT INSERT ON public."olhar_nomes_proibidos" TO "service_role";
GRANT SELECT ON public."olhar_nomes_proibidos" TO "service_role";
GRANT UPDATE ON public."olhar_nomes_proibidos" TO "service_role";
GRANT DELETE ON public."olhar_nomes_proibidos" TO "service_role";
GRANT TRUNCATE ON public."olhar_nomes_proibidos" TO "service_role";
GRANT REFERENCES ON public."olhar_nomes_proibidos" TO "service_role";
GRANT TRIGGER ON public."olhar_nomes_proibidos" TO "service_role";
GRANT MAINTAIN ON public."olhar_nomes_proibidos" TO "service_role";
ALTER TABLE public."olhar_sessions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."olhar_sessions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."olhar_sessions" TO "postgres";
GRANT SELECT ON public."olhar_sessions" TO "postgres";
GRANT UPDATE ON public."olhar_sessions" TO "postgres";
GRANT DELETE ON public."olhar_sessions" TO "postgres";
GRANT TRUNCATE ON public."olhar_sessions" TO "postgres";
GRANT REFERENCES ON public."olhar_sessions" TO "postgres";
GRANT TRIGGER ON public."olhar_sessions" TO "postgres";
GRANT MAINTAIN ON public."olhar_sessions" TO "postgres";
GRANT INSERT ON public."olhar_sessions" TO "authenticated";
GRANT SELECT ON public."olhar_sessions" TO "authenticated";
GRANT UPDATE ON public."olhar_sessions" TO "authenticated";
GRANT DELETE ON public."olhar_sessions" TO "authenticated";
GRANT TRUNCATE ON public."olhar_sessions" TO "authenticated";
GRANT REFERENCES ON public."olhar_sessions" TO "authenticated";
GRANT TRIGGER ON public."olhar_sessions" TO "authenticated";
GRANT MAINTAIN ON public."olhar_sessions" TO "authenticated";
GRANT INSERT ON public."olhar_sessions" TO "service_role";
GRANT SELECT ON public."olhar_sessions" TO "service_role";
GRANT UPDATE ON public."olhar_sessions" TO "service_role";
GRANT DELETE ON public."olhar_sessions" TO "service_role";
GRANT TRUNCATE ON public."olhar_sessions" TO "service_role";
GRANT REFERENCES ON public."olhar_sessions" TO "service_role";
GRANT TRIGGER ON public."olhar_sessions" TO "service_role";
GRANT MAINTAIN ON public."olhar_sessions" TO "service_role";
ALTER TABLE public."photo_generations" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."photo_generations" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."photo_generations" TO "postgres";
GRANT SELECT ON public."photo_generations" TO "postgres";
GRANT UPDATE ON public."photo_generations" TO "postgres";
GRANT DELETE ON public."photo_generations" TO "postgres";
GRANT TRUNCATE ON public."photo_generations" TO "postgres";
GRANT REFERENCES ON public."photo_generations" TO "postgres";
GRANT TRIGGER ON public."photo_generations" TO "postgres";
GRANT MAINTAIN ON public."photo_generations" TO "postgres";
GRANT INSERT ON public."photo_generations" TO "anon";
GRANT SELECT ON public."photo_generations" TO "anon";
GRANT UPDATE ON public."photo_generations" TO "anon";
GRANT DELETE ON public."photo_generations" TO "anon";
GRANT TRUNCATE ON public."photo_generations" TO "anon";
GRANT REFERENCES ON public."photo_generations" TO "anon";
GRANT TRIGGER ON public."photo_generations" TO "anon";
GRANT MAINTAIN ON public."photo_generations" TO "anon";
GRANT INSERT ON public."photo_generations" TO "authenticated";
GRANT SELECT ON public."photo_generations" TO "authenticated";
GRANT UPDATE ON public."photo_generations" TO "authenticated";
GRANT DELETE ON public."photo_generations" TO "authenticated";
GRANT TRUNCATE ON public."photo_generations" TO "authenticated";
GRANT REFERENCES ON public."photo_generations" TO "authenticated";
GRANT TRIGGER ON public."photo_generations" TO "authenticated";
GRANT MAINTAIN ON public."photo_generations" TO "authenticated";
GRANT INSERT ON public."photo_generations" TO "service_role";
GRANT SELECT ON public."photo_generations" TO "service_role";
GRANT UPDATE ON public."photo_generations" TO "service_role";
GRANT DELETE ON public."photo_generations" TO "service_role";
GRANT TRUNCATE ON public."photo_generations" TO "service_role";
GRANT REFERENCES ON public."photo_generations" TO "service_role";
GRANT TRIGGER ON public."photo_generations" TO "service_role";
GRANT MAINTAIN ON public."photo_generations" TO "service_role";
ALTER TABLE public."photo_references" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."photo_references" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."photo_references" TO "postgres";
GRANT SELECT ON public."photo_references" TO "postgres";
GRANT UPDATE ON public."photo_references" TO "postgres";
GRANT DELETE ON public."photo_references" TO "postgres";
GRANT TRUNCATE ON public."photo_references" TO "postgres";
GRANT REFERENCES ON public."photo_references" TO "postgres";
GRANT TRIGGER ON public."photo_references" TO "postgres";
GRANT MAINTAIN ON public."photo_references" TO "postgres";
GRANT INSERT ON public."photo_references" TO "anon";
GRANT SELECT ON public."photo_references" TO "anon";
GRANT UPDATE ON public."photo_references" TO "anon";
GRANT DELETE ON public."photo_references" TO "anon";
GRANT TRUNCATE ON public."photo_references" TO "anon";
GRANT REFERENCES ON public."photo_references" TO "anon";
GRANT TRIGGER ON public."photo_references" TO "anon";
GRANT MAINTAIN ON public."photo_references" TO "anon";
GRANT INSERT ON public."photo_references" TO "authenticated";
GRANT SELECT ON public."photo_references" TO "authenticated";
GRANT UPDATE ON public."photo_references" TO "authenticated";
GRANT DELETE ON public."photo_references" TO "authenticated";
GRANT TRUNCATE ON public."photo_references" TO "authenticated";
GRANT REFERENCES ON public."photo_references" TO "authenticated";
GRANT TRIGGER ON public."photo_references" TO "authenticated";
GRANT MAINTAIN ON public."photo_references" TO "authenticated";
GRANT INSERT ON public."photo_references" TO "service_role";
GRANT SELECT ON public."photo_references" TO "service_role";
GRANT UPDATE ON public."photo_references" TO "service_role";
GRANT DELETE ON public."photo_references" TO "service_role";
GRANT TRUNCATE ON public."photo_references" TO "service_role";
GRANT REFERENCES ON public."photo_references" TO "service_role";
GRANT TRIGGER ON public."photo_references" TO "service_role";
GRANT MAINTAIN ON public."photo_references" TO "service_role";
ALTER TABLE public."photo_style_approvals" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."photo_style_approvals" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."photo_style_approvals" TO "postgres";
GRANT SELECT ON public."photo_style_approvals" TO "postgres";
GRANT UPDATE ON public."photo_style_approvals" TO "postgres";
GRANT DELETE ON public."photo_style_approvals" TO "postgres";
GRANT TRUNCATE ON public."photo_style_approvals" TO "postgres";
GRANT REFERENCES ON public."photo_style_approvals" TO "postgres";
GRANT TRIGGER ON public."photo_style_approvals" TO "postgres";
GRANT MAINTAIN ON public."photo_style_approvals" TO "postgres";
GRANT INSERT ON public."photo_style_approvals" TO "anon";
GRANT SELECT ON public."photo_style_approvals" TO "anon";
GRANT UPDATE ON public."photo_style_approvals" TO "anon";
GRANT DELETE ON public."photo_style_approvals" TO "anon";
GRANT TRUNCATE ON public."photo_style_approvals" TO "anon";
GRANT REFERENCES ON public."photo_style_approvals" TO "anon";
GRANT TRIGGER ON public."photo_style_approvals" TO "anon";
GRANT MAINTAIN ON public."photo_style_approvals" TO "anon";
GRANT INSERT ON public."photo_style_approvals" TO "authenticated";
GRANT SELECT ON public."photo_style_approvals" TO "authenticated";
GRANT UPDATE ON public."photo_style_approvals" TO "authenticated";
GRANT DELETE ON public."photo_style_approvals" TO "authenticated";
GRANT TRUNCATE ON public."photo_style_approvals" TO "authenticated";
GRANT REFERENCES ON public."photo_style_approvals" TO "authenticated";
GRANT TRIGGER ON public."photo_style_approvals" TO "authenticated";
GRANT MAINTAIN ON public."photo_style_approvals" TO "authenticated";
GRANT INSERT ON public."photo_style_approvals" TO "service_role";
GRANT SELECT ON public."photo_style_approvals" TO "service_role";
GRANT UPDATE ON public."photo_style_approvals" TO "service_role";
GRANT DELETE ON public."photo_style_approvals" TO "service_role";
GRANT TRUNCATE ON public."photo_style_approvals" TO "service_role";
GRANT REFERENCES ON public."photo_style_approvals" TO "service_role";
GRANT TRIGGER ON public."photo_style_approvals" TO "service_role";
GRANT MAINTAIN ON public."photo_style_approvals" TO "service_role";
ALTER TABLE public."piece_candidates" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."piece_candidates" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."piece_candidates" TO "postgres";
GRANT SELECT ON public."piece_candidates" TO "postgres";
GRANT UPDATE ON public."piece_candidates" TO "postgres";
GRANT DELETE ON public."piece_candidates" TO "postgres";
GRANT TRUNCATE ON public."piece_candidates" TO "postgres";
GRANT REFERENCES ON public."piece_candidates" TO "postgres";
GRANT TRIGGER ON public."piece_candidates" TO "postgres";
GRANT MAINTAIN ON public."piece_candidates" TO "postgres";
GRANT INSERT ON public."piece_candidates" TO "anon";
GRANT SELECT ON public."piece_candidates" TO "anon";
GRANT UPDATE ON public."piece_candidates" TO "anon";
GRANT DELETE ON public."piece_candidates" TO "anon";
GRANT TRUNCATE ON public."piece_candidates" TO "anon";
GRANT REFERENCES ON public."piece_candidates" TO "anon";
GRANT TRIGGER ON public."piece_candidates" TO "anon";
GRANT MAINTAIN ON public."piece_candidates" TO "anon";
GRANT INSERT ON public."piece_candidates" TO "authenticated";
GRANT SELECT ON public."piece_candidates" TO "authenticated";
GRANT UPDATE ON public."piece_candidates" TO "authenticated";
GRANT DELETE ON public."piece_candidates" TO "authenticated";
GRANT TRUNCATE ON public."piece_candidates" TO "authenticated";
GRANT REFERENCES ON public."piece_candidates" TO "authenticated";
GRANT TRIGGER ON public."piece_candidates" TO "authenticated";
GRANT MAINTAIN ON public."piece_candidates" TO "authenticated";
GRANT INSERT ON public."piece_candidates" TO "service_role";
GRANT SELECT ON public."piece_candidates" TO "service_role";
GRANT UPDATE ON public."piece_candidates" TO "service_role";
GRANT DELETE ON public."piece_candidates" TO "service_role";
GRANT TRUNCATE ON public."piece_candidates" TO "service_role";
GRANT REFERENCES ON public."piece_candidates" TO "service_role";
GRANT TRIGGER ON public."piece_candidates" TO "service_role";
GRANT MAINTAIN ON public."piece_candidates" TO "service_role";
ALTER TABLE public."piece_versions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."piece_versions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."piece_versions" TO "postgres";
GRANT SELECT ON public."piece_versions" TO "postgres";
GRANT UPDATE ON public."piece_versions" TO "postgres";
GRANT DELETE ON public."piece_versions" TO "postgres";
GRANT TRUNCATE ON public."piece_versions" TO "postgres";
GRANT REFERENCES ON public."piece_versions" TO "postgres";
GRANT TRIGGER ON public."piece_versions" TO "postgres";
GRANT MAINTAIN ON public."piece_versions" TO "postgres";
GRANT INSERT ON public."piece_versions" TO "anon";
GRANT SELECT ON public."piece_versions" TO "anon";
GRANT UPDATE ON public."piece_versions" TO "anon";
GRANT DELETE ON public."piece_versions" TO "anon";
GRANT TRUNCATE ON public."piece_versions" TO "anon";
GRANT REFERENCES ON public."piece_versions" TO "anon";
GRANT TRIGGER ON public."piece_versions" TO "anon";
GRANT MAINTAIN ON public."piece_versions" TO "anon";
GRANT INSERT ON public."piece_versions" TO "authenticated";
GRANT SELECT ON public."piece_versions" TO "authenticated";
GRANT UPDATE ON public."piece_versions" TO "authenticated";
GRANT DELETE ON public."piece_versions" TO "authenticated";
GRANT TRUNCATE ON public."piece_versions" TO "authenticated";
GRANT REFERENCES ON public."piece_versions" TO "authenticated";
GRANT TRIGGER ON public."piece_versions" TO "authenticated";
GRANT MAINTAIN ON public."piece_versions" TO "authenticated";
GRANT INSERT ON public."piece_versions" TO "service_role";
GRANT SELECT ON public."piece_versions" TO "service_role";
GRANT UPDATE ON public."piece_versions" TO "service_role";
GRANT DELETE ON public."piece_versions" TO "service_role";
GRANT TRUNCATE ON public."piece_versions" TO "service_role";
GRANT REFERENCES ON public."piece_versions" TO "service_role";
GRANT TRIGGER ON public."piece_versions" TO "service_role";
GRANT MAINTAIN ON public."piece_versions" TO "service_role";
ALTER TABLE public."podcast_clips" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."podcast_clips" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."podcast_clips" TO "postgres";
GRANT SELECT ON public."podcast_clips" TO "postgres";
GRANT UPDATE ON public."podcast_clips" TO "postgres";
GRANT DELETE ON public."podcast_clips" TO "postgres";
GRANT TRUNCATE ON public."podcast_clips" TO "postgres";
GRANT REFERENCES ON public."podcast_clips" TO "postgres";
GRANT TRIGGER ON public."podcast_clips" TO "postgres";
GRANT MAINTAIN ON public."podcast_clips" TO "postgres";
GRANT INSERT ON public."podcast_clips" TO "anon";
GRANT SELECT ON public."podcast_clips" TO "anon";
GRANT UPDATE ON public."podcast_clips" TO "anon";
GRANT DELETE ON public."podcast_clips" TO "anon";
GRANT TRUNCATE ON public."podcast_clips" TO "anon";
GRANT REFERENCES ON public."podcast_clips" TO "anon";
GRANT TRIGGER ON public."podcast_clips" TO "anon";
GRANT MAINTAIN ON public."podcast_clips" TO "anon";
GRANT INSERT ON public."podcast_clips" TO "authenticated";
GRANT SELECT ON public."podcast_clips" TO "authenticated";
GRANT UPDATE ON public."podcast_clips" TO "authenticated";
GRANT DELETE ON public."podcast_clips" TO "authenticated";
GRANT TRUNCATE ON public."podcast_clips" TO "authenticated";
GRANT REFERENCES ON public."podcast_clips" TO "authenticated";
GRANT TRIGGER ON public."podcast_clips" TO "authenticated";
GRANT MAINTAIN ON public."podcast_clips" TO "authenticated";
GRANT INSERT ON public."podcast_clips" TO "service_role";
GRANT SELECT ON public."podcast_clips" TO "service_role";
GRANT UPDATE ON public."podcast_clips" TO "service_role";
GRANT DELETE ON public."podcast_clips" TO "service_role";
GRANT TRUNCATE ON public."podcast_clips" TO "service_role";
GRANT REFERENCES ON public."podcast_clips" TO "service_role";
GRANT TRIGGER ON public."podcast_clips" TO "service_role";
GRANT MAINTAIN ON public."podcast_clips" TO "service_role";
ALTER TABLE public."podcasts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."podcasts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."podcasts" TO "postgres";
GRANT SELECT ON public."podcasts" TO "postgres";
GRANT UPDATE ON public."podcasts" TO "postgres";
GRANT DELETE ON public."podcasts" TO "postgres";
GRANT TRUNCATE ON public."podcasts" TO "postgres";
GRANT REFERENCES ON public."podcasts" TO "postgres";
GRANT TRIGGER ON public."podcasts" TO "postgres";
GRANT MAINTAIN ON public."podcasts" TO "postgres";
GRANT INSERT ON public."podcasts" TO "anon";
GRANT SELECT ON public."podcasts" TO "anon";
GRANT UPDATE ON public."podcasts" TO "anon";
GRANT DELETE ON public."podcasts" TO "anon";
GRANT TRUNCATE ON public."podcasts" TO "anon";
GRANT REFERENCES ON public."podcasts" TO "anon";
GRANT TRIGGER ON public."podcasts" TO "anon";
GRANT MAINTAIN ON public."podcasts" TO "anon";
GRANT INSERT ON public."podcasts" TO "authenticated";
GRANT SELECT ON public."podcasts" TO "authenticated";
GRANT UPDATE ON public."podcasts" TO "authenticated";
GRANT DELETE ON public."podcasts" TO "authenticated";
GRANT TRUNCATE ON public."podcasts" TO "authenticated";
GRANT REFERENCES ON public."podcasts" TO "authenticated";
GRANT TRIGGER ON public."podcasts" TO "authenticated";
GRANT MAINTAIN ON public."podcasts" TO "authenticated";
GRANT INSERT ON public."podcasts" TO "service_role";
GRANT SELECT ON public."podcasts" TO "service_role";
GRANT UPDATE ON public."podcasts" TO "service_role";
GRANT DELETE ON public."podcasts" TO "service_role";
GRANT TRUNCATE ON public."podcasts" TO "service_role";
GRANT REFERENCES ON public."podcasts" TO "service_role";
GRANT TRIGGER ON public."podcasts" TO "service_role";
GRANT MAINTAIN ON public."podcasts" TO "service_role";
ALTER TABLE public."post_comments" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."post_comments" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."post_comments" TO "postgres";
GRANT SELECT ON public."post_comments" TO "postgres";
GRANT UPDATE ON public."post_comments" TO "postgres";
GRANT DELETE ON public."post_comments" TO "postgres";
GRANT TRUNCATE ON public."post_comments" TO "postgres";
GRANT REFERENCES ON public."post_comments" TO "postgres";
GRANT TRIGGER ON public."post_comments" TO "postgres";
GRANT MAINTAIN ON public."post_comments" TO "postgres";
GRANT INSERT ON public."post_comments" TO "anon";
GRANT SELECT ON public."post_comments" TO "anon";
GRANT UPDATE ON public."post_comments" TO "anon";
GRANT DELETE ON public."post_comments" TO "anon";
GRANT TRUNCATE ON public."post_comments" TO "anon";
GRANT REFERENCES ON public."post_comments" TO "anon";
GRANT TRIGGER ON public."post_comments" TO "anon";
GRANT MAINTAIN ON public."post_comments" TO "anon";
GRANT INSERT ON public."post_comments" TO "authenticated";
GRANT SELECT ON public."post_comments" TO "authenticated";
GRANT UPDATE ON public."post_comments" TO "authenticated";
GRANT DELETE ON public."post_comments" TO "authenticated";
GRANT TRUNCATE ON public."post_comments" TO "authenticated";
GRANT REFERENCES ON public."post_comments" TO "authenticated";
GRANT TRIGGER ON public."post_comments" TO "authenticated";
GRANT MAINTAIN ON public."post_comments" TO "authenticated";
GRANT INSERT ON public."post_comments" TO "service_role";
GRANT SELECT ON public."post_comments" TO "service_role";
GRANT UPDATE ON public."post_comments" TO "service_role";
GRANT DELETE ON public."post_comments" TO "service_role";
GRANT TRUNCATE ON public."post_comments" TO "service_role";
GRANT REFERENCES ON public."post_comments" TO "service_role";
GRANT TRIGGER ON public."post_comments" TO "service_role";
GRANT MAINTAIN ON public."post_comments" TO "service_role";
ALTER TABLE public."post_drafts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."post_drafts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."post_drafts" TO "postgres";
GRANT SELECT ON public."post_drafts" TO "postgres";
GRANT UPDATE ON public."post_drafts" TO "postgres";
GRANT DELETE ON public."post_drafts" TO "postgres";
GRANT TRUNCATE ON public."post_drafts" TO "postgres";
GRANT REFERENCES ON public."post_drafts" TO "postgres";
GRANT TRIGGER ON public."post_drafts" TO "postgres";
GRANT MAINTAIN ON public."post_drafts" TO "postgres";
GRANT INSERT ON public."post_drafts" TO "anon";
GRANT SELECT ON public."post_drafts" TO "anon";
GRANT UPDATE ON public."post_drafts" TO "anon";
GRANT DELETE ON public."post_drafts" TO "anon";
GRANT TRUNCATE ON public."post_drafts" TO "anon";
GRANT REFERENCES ON public."post_drafts" TO "anon";
GRANT TRIGGER ON public."post_drafts" TO "anon";
GRANT MAINTAIN ON public."post_drafts" TO "anon";
GRANT INSERT ON public."post_drafts" TO "authenticated";
GRANT SELECT ON public."post_drafts" TO "authenticated";
GRANT UPDATE ON public."post_drafts" TO "authenticated";
GRANT DELETE ON public."post_drafts" TO "authenticated";
GRANT TRUNCATE ON public."post_drafts" TO "authenticated";
GRANT REFERENCES ON public."post_drafts" TO "authenticated";
GRANT TRIGGER ON public."post_drafts" TO "authenticated";
GRANT MAINTAIN ON public."post_drafts" TO "authenticated";
GRANT INSERT ON public."post_drafts" TO "service_role";
GRANT SELECT ON public."post_drafts" TO "service_role";
GRANT UPDATE ON public."post_drafts" TO "service_role";
GRANT DELETE ON public."post_drafts" TO "service_role";
GRANT TRUNCATE ON public."post_drafts" TO "service_role";
GRANT REFERENCES ON public."post_drafts" TO "service_role";
GRANT TRIGGER ON public."post_drafts" TO "service_role";
GRANT MAINTAIN ON public."post_drafts" TO "service_role";
ALTER TABLE public."post_metrics" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."post_metrics" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."post_metrics" TO "postgres";
GRANT SELECT ON public."post_metrics" TO "postgres";
GRANT UPDATE ON public."post_metrics" TO "postgres";
GRANT DELETE ON public."post_metrics" TO "postgres";
GRANT TRUNCATE ON public."post_metrics" TO "postgres";
GRANT REFERENCES ON public."post_metrics" TO "postgres";
GRANT TRIGGER ON public."post_metrics" TO "postgres";
GRANT MAINTAIN ON public."post_metrics" TO "postgres";
GRANT INSERT ON public."post_metrics" TO "anon";
GRANT SELECT ON public."post_metrics" TO "anon";
GRANT UPDATE ON public."post_metrics" TO "anon";
GRANT DELETE ON public."post_metrics" TO "anon";
GRANT TRUNCATE ON public."post_metrics" TO "anon";
GRANT REFERENCES ON public."post_metrics" TO "anon";
GRANT TRIGGER ON public."post_metrics" TO "anon";
GRANT MAINTAIN ON public."post_metrics" TO "anon";
GRANT INSERT ON public."post_metrics" TO "authenticated";
GRANT SELECT ON public."post_metrics" TO "authenticated";
GRANT UPDATE ON public."post_metrics" TO "authenticated";
GRANT DELETE ON public."post_metrics" TO "authenticated";
GRANT TRUNCATE ON public."post_metrics" TO "authenticated";
GRANT REFERENCES ON public."post_metrics" TO "authenticated";
GRANT TRIGGER ON public."post_metrics" TO "authenticated";
GRANT MAINTAIN ON public."post_metrics" TO "authenticated";
GRANT INSERT ON public."post_metrics" TO "service_role";
GRANT SELECT ON public."post_metrics" TO "service_role";
GRANT UPDATE ON public."post_metrics" TO "service_role";
GRANT DELETE ON public."post_metrics" TO "service_role";
GRANT TRUNCATE ON public."post_metrics" TO "service_role";
GRANT REFERENCES ON public."post_metrics" TO "service_role";
GRANT TRIGGER ON public."post_metrics" TO "service_role";
GRANT MAINTAIN ON public."post_metrics" TO "service_role";
ALTER TABLE public."post_publications" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."post_publications" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."post_publications" TO "postgres";
GRANT SELECT ON public."post_publications" TO "postgres";
GRANT UPDATE ON public."post_publications" TO "postgres";
GRANT DELETE ON public."post_publications" TO "postgres";
GRANT TRUNCATE ON public."post_publications" TO "postgres";
GRANT REFERENCES ON public."post_publications" TO "postgres";
GRANT TRIGGER ON public."post_publications" TO "postgres";
GRANT MAINTAIN ON public."post_publications" TO "postgres";
GRANT INSERT ON public."post_publications" TO "anon";
GRANT SELECT ON public."post_publications" TO "anon";
GRANT UPDATE ON public."post_publications" TO "anon";
GRANT DELETE ON public."post_publications" TO "anon";
GRANT TRUNCATE ON public."post_publications" TO "anon";
GRANT REFERENCES ON public."post_publications" TO "anon";
GRANT TRIGGER ON public."post_publications" TO "anon";
GRANT MAINTAIN ON public."post_publications" TO "anon";
GRANT INSERT ON public."post_publications" TO "authenticated";
GRANT SELECT ON public."post_publications" TO "authenticated";
GRANT UPDATE ON public."post_publications" TO "authenticated";
GRANT DELETE ON public."post_publications" TO "authenticated";
GRANT TRUNCATE ON public."post_publications" TO "authenticated";
GRANT REFERENCES ON public."post_publications" TO "authenticated";
GRANT TRIGGER ON public."post_publications" TO "authenticated";
GRANT MAINTAIN ON public."post_publications" TO "authenticated";
GRANT INSERT ON public."post_publications" TO "service_role";
GRANT SELECT ON public."post_publications" TO "service_role";
GRANT UPDATE ON public."post_publications" TO "service_role";
GRANT DELETE ON public."post_publications" TO "service_role";
GRANT TRUNCATE ON public."post_publications" TO "service_role";
GRANT REFERENCES ON public."post_publications" TO "service_role";
GRANT TRIGGER ON public."post_publications" TO "service_role";
GRANT MAINTAIN ON public."post_publications" TO "service_role";
ALTER TABLE public."post_templates" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."post_templates" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."post_templates" TO "postgres";
GRANT SELECT ON public."post_templates" TO "postgres";
GRANT UPDATE ON public."post_templates" TO "postgres";
GRANT DELETE ON public."post_templates" TO "postgres";
GRANT TRUNCATE ON public."post_templates" TO "postgres";
GRANT REFERENCES ON public."post_templates" TO "postgres";
GRANT TRIGGER ON public."post_templates" TO "postgres";
GRANT MAINTAIN ON public."post_templates" TO "postgres";
GRANT INSERT ON public."post_templates" TO "anon";
GRANT SELECT ON public."post_templates" TO "anon";
GRANT UPDATE ON public."post_templates" TO "anon";
GRANT DELETE ON public."post_templates" TO "anon";
GRANT TRUNCATE ON public."post_templates" TO "anon";
GRANT REFERENCES ON public."post_templates" TO "anon";
GRANT TRIGGER ON public."post_templates" TO "anon";
GRANT MAINTAIN ON public."post_templates" TO "anon";
GRANT INSERT ON public."post_templates" TO "authenticated";
GRANT SELECT ON public."post_templates" TO "authenticated";
GRANT UPDATE ON public."post_templates" TO "authenticated";
GRANT DELETE ON public."post_templates" TO "authenticated";
GRANT TRUNCATE ON public."post_templates" TO "authenticated";
GRANT REFERENCES ON public."post_templates" TO "authenticated";
GRANT TRIGGER ON public."post_templates" TO "authenticated";
GRANT MAINTAIN ON public."post_templates" TO "authenticated";
GRANT INSERT ON public."post_templates" TO "service_role";
GRANT SELECT ON public."post_templates" TO "service_role";
GRANT UPDATE ON public."post_templates" TO "service_role";
GRANT DELETE ON public."post_templates" TO "service_role";
GRANT TRUNCATE ON public."post_templates" TO "service_role";
GRANT REFERENCES ON public."post_templates" TO "service_role";
GRANT TRIGGER ON public."post_templates" TO "service_role";
GRANT MAINTAIN ON public."post_templates" TO "service_role";
ALTER TABLE public."post_unit_publications" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."post_unit_publications" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."post_unit_publications" TO "postgres";
GRANT SELECT ON public."post_unit_publications" TO "postgres";
GRANT UPDATE ON public."post_unit_publications" TO "postgres";
GRANT DELETE ON public."post_unit_publications" TO "postgres";
GRANT TRUNCATE ON public."post_unit_publications" TO "postgres";
GRANT REFERENCES ON public."post_unit_publications" TO "postgres";
GRANT TRIGGER ON public."post_unit_publications" TO "postgres";
GRANT MAINTAIN ON public."post_unit_publications" TO "postgres";
GRANT INSERT ON public."post_unit_publications" TO "anon";
GRANT SELECT ON public."post_unit_publications" TO "anon";
GRANT UPDATE ON public."post_unit_publications" TO "anon";
GRANT DELETE ON public."post_unit_publications" TO "anon";
GRANT TRUNCATE ON public."post_unit_publications" TO "anon";
GRANT REFERENCES ON public."post_unit_publications" TO "anon";
GRANT TRIGGER ON public."post_unit_publications" TO "anon";
GRANT MAINTAIN ON public."post_unit_publications" TO "anon";
GRANT INSERT ON public."post_unit_publications" TO "authenticated";
GRANT SELECT ON public."post_unit_publications" TO "authenticated";
GRANT UPDATE ON public."post_unit_publications" TO "authenticated";
GRANT DELETE ON public."post_unit_publications" TO "authenticated";
GRANT TRUNCATE ON public."post_unit_publications" TO "authenticated";
GRANT REFERENCES ON public."post_unit_publications" TO "authenticated";
GRANT TRIGGER ON public."post_unit_publications" TO "authenticated";
GRANT MAINTAIN ON public."post_unit_publications" TO "authenticated";
GRANT INSERT ON public."post_unit_publications" TO "service_role";
GRANT SELECT ON public."post_unit_publications" TO "service_role";
GRANT UPDATE ON public."post_unit_publications" TO "service_role";
GRANT DELETE ON public."post_unit_publications" TO "service_role";
GRANT TRUNCATE ON public."post_unit_publications" TO "service_role";
GRANT REFERENCES ON public."post_unit_publications" TO "service_role";
GRANT TRIGGER ON public."post_unit_publications" TO "service_role";
GRANT MAINTAIN ON public."post_unit_publications" TO "service_role";
ALTER TABLE public."post_units" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."post_units" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."post_units" TO "postgres";
GRANT SELECT ON public."post_units" TO "postgres";
GRANT UPDATE ON public."post_units" TO "postgres";
GRANT DELETE ON public."post_units" TO "postgres";
GRANT TRUNCATE ON public."post_units" TO "postgres";
GRANT REFERENCES ON public."post_units" TO "postgres";
GRANT TRIGGER ON public."post_units" TO "postgres";
GRANT MAINTAIN ON public."post_units" TO "postgres";
GRANT INSERT ON public."post_units" TO "anon";
GRANT SELECT ON public."post_units" TO "anon";
GRANT UPDATE ON public."post_units" TO "anon";
GRANT DELETE ON public."post_units" TO "anon";
GRANT TRUNCATE ON public."post_units" TO "anon";
GRANT REFERENCES ON public."post_units" TO "anon";
GRANT TRIGGER ON public."post_units" TO "anon";
GRANT MAINTAIN ON public."post_units" TO "anon";
GRANT INSERT ON public."post_units" TO "authenticated";
GRANT SELECT ON public."post_units" TO "authenticated";
GRANT UPDATE ON public."post_units" TO "authenticated";
GRANT DELETE ON public."post_units" TO "authenticated";
GRANT TRUNCATE ON public."post_units" TO "authenticated";
GRANT REFERENCES ON public."post_units" TO "authenticated";
GRANT TRIGGER ON public."post_units" TO "authenticated";
GRANT MAINTAIN ON public."post_units" TO "authenticated";
GRANT INSERT ON public."post_units" TO "service_role";
GRANT SELECT ON public."post_units" TO "service_role";
GRANT UPDATE ON public."post_units" TO "service_role";
GRANT DELETE ON public."post_units" TO "service_role";
GRANT TRUNCATE ON public."post_units" TO "service_role";
GRANT REFERENCES ON public."post_units" TO "service_role";
GRANT TRIGGER ON public."post_units" TO "service_role";
GRANT MAINTAIN ON public."post_units" TO "service_role";
ALTER TABLE public."profiles" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."profiles" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."profiles" TO "postgres";
GRANT SELECT ON public."profiles" TO "postgres";
GRANT UPDATE ON public."profiles" TO "postgres";
GRANT DELETE ON public."profiles" TO "postgres";
GRANT TRUNCATE ON public."profiles" TO "postgres";
GRANT REFERENCES ON public."profiles" TO "postgres";
GRANT TRIGGER ON public."profiles" TO "postgres";
GRANT MAINTAIN ON public."profiles" TO "postgres";
GRANT INSERT ON public."profiles" TO "anon";
GRANT SELECT ON public."profiles" TO "anon";
GRANT UPDATE ON public."profiles" TO "anon";
GRANT DELETE ON public."profiles" TO "anon";
GRANT TRUNCATE ON public."profiles" TO "anon";
GRANT REFERENCES ON public."profiles" TO "anon";
GRANT TRIGGER ON public."profiles" TO "anon";
GRANT MAINTAIN ON public."profiles" TO "anon";
GRANT INSERT ON public."profiles" TO "authenticated";
GRANT SELECT ON public."profiles" TO "authenticated";
GRANT UPDATE ON public."profiles" TO "authenticated";
GRANT DELETE ON public."profiles" TO "authenticated";
GRANT TRUNCATE ON public."profiles" TO "authenticated";
GRANT REFERENCES ON public."profiles" TO "authenticated";
GRANT TRIGGER ON public."profiles" TO "authenticated";
GRANT MAINTAIN ON public."profiles" TO "authenticated";
GRANT INSERT ON public."profiles" TO "service_role";
GRANT SELECT ON public."profiles" TO "service_role";
GRANT UPDATE ON public."profiles" TO "service_role";
GRANT DELETE ON public."profiles" TO "service_role";
GRANT TRUNCATE ON public."profiles" TO "service_role";
GRANT REFERENCES ON public."profiles" TO "service_role";
GRANT TRIGGER ON public."profiles" TO "service_role";
GRANT MAINTAIN ON public."profiles" TO "service_role";
ALTER TABLE public."publication_packages" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."publication_packages" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."publication_packages" TO "postgres";
GRANT SELECT ON public."publication_packages" TO "postgres";
GRANT UPDATE ON public."publication_packages" TO "postgres";
GRANT DELETE ON public."publication_packages" TO "postgres";
GRANT TRUNCATE ON public."publication_packages" TO "postgres";
GRANT REFERENCES ON public."publication_packages" TO "postgres";
GRANT TRIGGER ON public."publication_packages" TO "postgres";
GRANT MAINTAIN ON public."publication_packages" TO "postgres";
GRANT INSERT ON public."publication_packages" TO "anon";
GRANT SELECT ON public."publication_packages" TO "anon";
GRANT UPDATE ON public."publication_packages" TO "anon";
GRANT DELETE ON public."publication_packages" TO "anon";
GRANT TRUNCATE ON public."publication_packages" TO "anon";
GRANT REFERENCES ON public."publication_packages" TO "anon";
GRANT TRIGGER ON public."publication_packages" TO "anon";
GRANT MAINTAIN ON public."publication_packages" TO "anon";
GRANT INSERT ON public."publication_packages" TO "authenticated";
GRANT SELECT ON public."publication_packages" TO "authenticated";
GRANT UPDATE ON public."publication_packages" TO "authenticated";
GRANT DELETE ON public."publication_packages" TO "authenticated";
GRANT TRUNCATE ON public."publication_packages" TO "authenticated";
GRANT REFERENCES ON public."publication_packages" TO "authenticated";
GRANT TRIGGER ON public."publication_packages" TO "authenticated";
GRANT MAINTAIN ON public."publication_packages" TO "authenticated";
GRANT INSERT ON public."publication_packages" TO "service_role";
GRANT SELECT ON public."publication_packages" TO "service_role";
GRANT UPDATE ON public."publication_packages" TO "service_role";
GRANT DELETE ON public."publication_packages" TO "service_role";
GRANT TRUNCATE ON public."publication_packages" TO "service_role";
GRANT REFERENCES ON public."publication_packages" TO "service_role";
GRANT TRIGGER ON public."publication_packages" TO "service_role";
GRANT MAINTAIN ON public."publication_packages" TO "service_role";
ALTER TABLE public."schedule_commands" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."schedule_commands" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."schedule_commands" TO "postgres";
GRANT SELECT ON public."schedule_commands" TO "postgres";
GRANT UPDATE ON public."schedule_commands" TO "postgres";
GRANT DELETE ON public."schedule_commands" TO "postgres";
GRANT TRUNCATE ON public."schedule_commands" TO "postgres";
GRANT REFERENCES ON public."schedule_commands" TO "postgres";
GRANT TRIGGER ON public."schedule_commands" TO "postgres";
GRANT MAINTAIN ON public."schedule_commands" TO "postgres";
GRANT INSERT ON public."schedule_commands" TO "anon";
GRANT SELECT ON public."schedule_commands" TO "anon";
GRANT UPDATE ON public."schedule_commands" TO "anon";
GRANT DELETE ON public."schedule_commands" TO "anon";
GRANT TRUNCATE ON public."schedule_commands" TO "anon";
GRANT REFERENCES ON public."schedule_commands" TO "anon";
GRANT TRIGGER ON public."schedule_commands" TO "anon";
GRANT MAINTAIN ON public."schedule_commands" TO "anon";
GRANT INSERT ON public."schedule_commands" TO "authenticated";
GRANT SELECT ON public."schedule_commands" TO "authenticated";
GRANT UPDATE ON public."schedule_commands" TO "authenticated";
GRANT DELETE ON public."schedule_commands" TO "authenticated";
GRANT TRUNCATE ON public."schedule_commands" TO "authenticated";
GRANT REFERENCES ON public."schedule_commands" TO "authenticated";
GRANT TRIGGER ON public."schedule_commands" TO "authenticated";
GRANT MAINTAIN ON public."schedule_commands" TO "authenticated";
GRANT INSERT ON public."schedule_commands" TO "service_role";
GRANT SELECT ON public."schedule_commands" TO "service_role";
GRANT UPDATE ON public."schedule_commands" TO "service_role";
GRANT DELETE ON public."schedule_commands" TO "service_role";
GRANT TRUNCATE ON public."schedule_commands" TO "service_role";
GRANT REFERENCES ON public."schedule_commands" TO "service_role";
GRANT TRIGGER ON public."schedule_commands" TO "service_role";
GRANT MAINTAIN ON public."schedule_commands" TO "service_role";
ALTER TABLE public."schedule_plans" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."schedule_plans" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."schedule_plans" TO "postgres";
GRANT SELECT ON public."schedule_plans" TO "postgres";
GRANT UPDATE ON public."schedule_plans" TO "postgres";
GRANT DELETE ON public."schedule_plans" TO "postgres";
GRANT TRUNCATE ON public."schedule_plans" TO "postgres";
GRANT REFERENCES ON public."schedule_plans" TO "postgres";
GRANT TRIGGER ON public."schedule_plans" TO "postgres";
GRANT MAINTAIN ON public."schedule_plans" TO "postgres";
GRANT INSERT ON public."schedule_plans" TO "anon";
GRANT SELECT ON public."schedule_plans" TO "anon";
GRANT UPDATE ON public."schedule_plans" TO "anon";
GRANT DELETE ON public."schedule_plans" TO "anon";
GRANT TRUNCATE ON public."schedule_plans" TO "anon";
GRANT REFERENCES ON public."schedule_plans" TO "anon";
GRANT TRIGGER ON public."schedule_plans" TO "anon";
GRANT MAINTAIN ON public."schedule_plans" TO "anon";
GRANT INSERT ON public."schedule_plans" TO "authenticated";
GRANT SELECT ON public."schedule_plans" TO "authenticated";
GRANT UPDATE ON public."schedule_plans" TO "authenticated";
GRANT DELETE ON public."schedule_plans" TO "authenticated";
GRANT TRUNCATE ON public."schedule_plans" TO "authenticated";
GRANT REFERENCES ON public."schedule_plans" TO "authenticated";
GRANT TRIGGER ON public."schedule_plans" TO "authenticated";
GRANT MAINTAIN ON public."schedule_plans" TO "authenticated";
GRANT INSERT ON public."schedule_plans" TO "service_role";
GRANT SELECT ON public."schedule_plans" TO "service_role";
GRANT UPDATE ON public."schedule_plans" TO "service_role";
GRANT DELETE ON public."schedule_plans" TO "service_role";
GRANT TRUNCATE ON public."schedule_plans" TO "service_role";
GRANT REFERENCES ON public."schedule_plans" TO "service_role";
GRANT TRIGGER ON public."schedule_plans" TO "service_role";
GRANT MAINTAIN ON public."schedule_plans" TO "service_role";
ALTER TABLE public."setup_sessions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."setup_sessions" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."setup_sessions" TO "postgres";
GRANT SELECT ON public."setup_sessions" TO "postgres";
GRANT UPDATE ON public."setup_sessions" TO "postgres";
GRANT DELETE ON public."setup_sessions" TO "postgres";
GRANT TRUNCATE ON public."setup_sessions" TO "postgres";
GRANT REFERENCES ON public."setup_sessions" TO "postgres";
GRANT TRIGGER ON public."setup_sessions" TO "postgres";
GRANT MAINTAIN ON public."setup_sessions" TO "postgres";
GRANT INSERT ON public."setup_sessions" TO "anon";
GRANT SELECT ON public."setup_sessions" TO "anon";
GRANT UPDATE ON public."setup_sessions" TO "anon";
GRANT DELETE ON public."setup_sessions" TO "anon";
GRANT TRUNCATE ON public."setup_sessions" TO "anon";
GRANT REFERENCES ON public."setup_sessions" TO "anon";
GRANT TRIGGER ON public."setup_sessions" TO "anon";
GRANT MAINTAIN ON public."setup_sessions" TO "anon";
GRANT INSERT ON public."setup_sessions" TO "authenticated";
GRANT SELECT ON public."setup_sessions" TO "authenticated";
GRANT UPDATE ON public."setup_sessions" TO "authenticated";
GRANT DELETE ON public."setup_sessions" TO "authenticated";
GRANT TRUNCATE ON public."setup_sessions" TO "authenticated";
GRANT REFERENCES ON public."setup_sessions" TO "authenticated";
GRANT TRIGGER ON public."setup_sessions" TO "authenticated";
GRANT MAINTAIN ON public."setup_sessions" TO "authenticated";
GRANT INSERT ON public."setup_sessions" TO "service_role";
GRANT SELECT ON public."setup_sessions" TO "service_role";
GRANT UPDATE ON public."setup_sessions" TO "service_role";
GRANT DELETE ON public."setup_sessions" TO "service_role";
GRANT TRUNCATE ON public."setup_sessions" TO "service_role";
GRANT REFERENCES ON public."setup_sessions" TO "service_role";
GRANT TRIGGER ON public."setup_sessions" TO "service_role";
GRANT MAINTAIN ON public."setup_sessions" TO "service_role";
ALTER TABLE public."social_accounts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."social_accounts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."social_accounts" TO "postgres";
GRANT SELECT ON public."social_accounts" TO "postgres";
GRANT UPDATE ON public."social_accounts" TO "postgres";
GRANT DELETE ON public."social_accounts" TO "postgres";
GRANT TRUNCATE ON public."social_accounts" TO "postgres";
GRANT REFERENCES ON public."social_accounts" TO "postgres";
GRANT TRIGGER ON public."social_accounts" TO "postgres";
GRANT MAINTAIN ON public."social_accounts" TO "postgres";
GRANT INSERT ON public."social_accounts" TO "anon";
GRANT SELECT ON public."social_accounts" TO "anon";
GRANT UPDATE ON public."social_accounts" TO "anon";
GRANT DELETE ON public."social_accounts" TO "anon";
GRANT TRUNCATE ON public."social_accounts" TO "anon";
GRANT REFERENCES ON public."social_accounts" TO "anon";
GRANT TRIGGER ON public."social_accounts" TO "anon";
GRANT MAINTAIN ON public."social_accounts" TO "anon";
GRANT INSERT ON public."social_accounts" TO "authenticated";
GRANT SELECT ON public."social_accounts" TO "authenticated";
GRANT UPDATE ON public."social_accounts" TO "authenticated";
GRANT DELETE ON public."social_accounts" TO "authenticated";
GRANT TRUNCATE ON public."social_accounts" TO "authenticated";
GRANT REFERENCES ON public."social_accounts" TO "authenticated";
GRANT TRIGGER ON public."social_accounts" TO "authenticated";
GRANT MAINTAIN ON public."social_accounts" TO "authenticated";
GRANT INSERT ON public."social_accounts" TO "service_role";
GRANT SELECT ON public."social_accounts" TO "service_role";
GRANT UPDATE ON public."social_accounts" TO "service_role";
GRANT DELETE ON public."social_accounts" TO "service_role";
GRANT TRUNCATE ON public."social_accounts" TO "service_role";
GRANT REFERENCES ON public."social_accounts" TO "service_role";
GRANT TRIGGER ON public."social_accounts" TO "service_role";
GRANT MAINTAIN ON public."social_accounts" TO "service_role";
ALTER TABLE public."traffic_ads" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."traffic_ads" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."traffic_ads" TO "postgres";
GRANT SELECT ON public."traffic_ads" TO "postgres";
GRANT UPDATE ON public."traffic_ads" TO "postgres";
GRANT DELETE ON public."traffic_ads" TO "postgres";
GRANT TRUNCATE ON public."traffic_ads" TO "postgres";
GRANT REFERENCES ON public."traffic_ads" TO "postgres";
GRANT TRIGGER ON public."traffic_ads" TO "postgres";
GRANT MAINTAIN ON public."traffic_ads" TO "postgres";
GRANT INSERT ON public."traffic_ads" TO "anon";
GRANT SELECT ON public."traffic_ads" TO "anon";
GRANT UPDATE ON public."traffic_ads" TO "anon";
GRANT DELETE ON public."traffic_ads" TO "anon";
GRANT TRUNCATE ON public."traffic_ads" TO "anon";
GRANT REFERENCES ON public."traffic_ads" TO "anon";
GRANT TRIGGER ON public."traffic_ads" TO "anon";
GRANT MAINTAIN ON public."traffic_ads" TO "anon";
GRANT INSERT ON public."traffic_ads" TO "authenticated";
GRANT SELECT ON public."traffic_ads" TO "authenticated";
GRANT UPDATE ON public."traffic_ads" TO "authenticated";
GRANT DELETE ON public."traffic_ads" TO "authenticated";
GRANT TRUNCATE ON public."traffic_ads" TO "authenticated";
GRANT REFERENCES ON public."traffic_ads" TO "authenticated";
GRANT TRIGGER ON public."traffic_ads" TO "authenticated";
GRANT MAINTAIN ON public."traffic_ads" TO "authenticated";
GRANT INSERT ON public."traffic_ads" TO "service_role";
GRANT SELECT ON public."traffic_ads" TO "service_role";
GRANT UPDATE ON public."traffic_ads" TO "service_role";
GRANT DELETE ON public."traffic_ads" TO "service_role";
GRANT TRUNCATE ON public."traffic_ads" TO "service_role";
GRANT REFERENCES ON public."traffic_ads" TO "service_role";
GRANT TRIGGER ON public."traffic_ads" TO "service_role";
GRANT MAINTAIN ON public."traffic_ads" TO "service_role";
ALTER TABLE public."traffic_campaigns" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."traffic_campaigns" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."traffic_campaigns" TO "postgres";
GRANT SELECT ON public."traffic_campaigns" TO "postgres";
GRANT UPDATE ON public."traffic_campaigns" TO "postgres";
GRANT DELETE ON public."traffic_campaigns" TO "postgres";
GRANT TRUNCATE ON public."traffic_campaigns" TO "postgres";
GRANT REFERENCES ON public."traffic_campaigns" TO "postgres";
GRANT TRIGGER ON public."traffic_campaigns" TO "postgres";
GRANT MAINTAIN ON public."traffic_campaigns" TO "postgres";
GRANT INSERT ON public."traffic_campaigns" TO "anon";
GRANT SELECT ON public."traffic_campaigns" TO "anon";
GRANT UPDATE ON public."traffic_campaigns" TO "anon";
GRANT DELETE ON public."traffic_campaigns" TO "anon";
GRANT TRUNCATE ON public."traffic_campaigns" TO "anon";
GRANT REFERENCES ON public."traffic_campaigns" TO "anon";
GRANT TRIGGER ON public."traffic_campaigns" TO "anon";
GRANT MAINTAIN ON public."traffic_campaigns" TO "anon";
GRANT INSERT ON public."traffic_campaigns" TO "authenticated";
GRANT SELECT ON public."traffic_campaigns" TO "authenticated";
GRANT UPDATE ON public."traffic_campaigns" TO "authenticated";
GRANT DELETE ON public."traffic_campaigns" TO "authenticated";
GRANT TRUNCATE ON public."traffic_campaigns" TO "authenticated";
GRANT REFERENCES ON public."traffic_campaigns" TO "authenticated";
GRANT TRIGGER ON public."traffic_campaigns" TO "authenticated";
GRANT MAINTAIN ON public."traffic_campaigns" TO "authenticated";
GRANT INSERT ON public."traffic_campaigns" TO "service_role";
GRANT SELECT ON public."traffic_campaigns" TO "service_role";
GRANT UPDATE ON public."traffic_campaigns" TO "service_role";
GRANT DELETE ON public."traffic_campaigns" TO "service_role";
GRANT TRUNCATE ON public."traffic_campaigns" TO "service_role";
GRANT REFERENCES ON public."traffic_campaigns" TO "service_role";
GRANT TRIGGER ON public."traffic_campaigns" TO "service_role";
GRANT MAINTAIN ON public."traffic_campaigns" TO "service_role";
REVOKE ALL ON public."traffic_eligible_posts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."traffic_eligible_posts" TO "postgres";
GRANT SELECT ON public."traffic_eligible_posts" TO "postgres";
GRANT UPDATE ON public."traffic_eligible_posts" TO "postgres";
GRANT DELETE ON public."traffic_eligible_posts" TO "postgres";
GRANT TRUNCATE ON public."traffic_eligible_posts" TO "postgres";
GRANT REFERENCES ON public."traffic_eligible_posts" TO "postgres";
GRANT TRIGGER ON public."traffic_eligible_posts" TO "postgres";
GRANT MAINTAIN ON public."traffic_eligible_posts" TO "postgres";
GRANT INSERT ON public."traffic_eligible_posts" TO "anon";
GRANT SELECT ON public."traffic_eligible_posts" TO "anon";
GRANT UPDATE ON public."traffic_eligible_posts" TO "anon";
GRANT DELETE ON public."traffic_eligible_posts" TO "anon";
GRANT TRUNCATE ON public."traffic_eligible_posts" TO "anon";
GRANT REFERENCES ON public."traffic_eligible_posts" TO "anon";
GRANT TRIGGER ON public."traffic_eligible_posts" TO "anon";
GRANT MAINTAIN ON public."traffic_eligible_posts" TO "anon";
GRANT INSERT ON public."traffic_eligible_posts" TO "authenticated";
GRANT SELECT ON public."traffic_eligible_posts" TO "authenticated";
GRANT UPDATE ON public."traffic_eligible_posts" TO "authenticated";
GRANT DELETE ON public."traffic_eligible_posts" TO "authenticated";
GRANT TRUNCATE ON public."traffic_eligible_posts" TO "authenticated";
GRANT REFERENCES ON public."traffic_eligible_posts" TO "authenticated";
GRANT TRIGGER ON public."traffic_eligible_posts" TO "authenticated";
GRANT MAINTAIN ON public."traffic_eligible_posts" TO "authenticated";
GRANT INSERT ON public."traffic_eligible_posts" TO "service_role";
GRANT SELECT ON public."traffic_eligible_posts" TO "service_role";
GRANT UPDATE ON public."traffic_eligible_posts" TO "service_role";
GRANT DELETE ON public."traffic_eligible_posts" TO "service_role";
GRANT TRUNCATE ON public."traffic_eligible_posts" TO "service_role";
GRANT REFERENCES ON public."traffic_eligible_posts" TO "service_role";
GRANT TRIGGER ON public."traffic_eligible_posts" TO "service_role";
GRANT MAINTAIN ON public."traffic_eligible_posts" TO "service_role";
ALTER TABLE public."usage_events" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."usage_events" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."usage_events" TO "postgres";
GRANT SELECT ON public."usage_events" TO "postgres";
GRANT UPDATE ON public."usage_events" TO "postgres";
GRANT DELETE ON public."usage_events" TO "postgres";
GRANT TRUNCATE ON public."usage_events" TO "postgres";
GRANT REFERENCES ON public."usage_events" TO "postgres";
GRANT TRIGGER ON public."usage_events" TO "postgres";
GRANT MAINTAIN ON public."usage_events" TO "postgres";
GRANT INSERT ON public."usage_events" TO "anon";
GRANT SELECT ON public."usage_events" TO "anon";
GRANT UPDATE ON public."usage_events" TO "anon";
GRANT DELETE ON public."usage_events" TO "anon";
GRANT TRUNCATE ON public."usage_events" TO "anon";
GRANT REFERENCES ON public."usage_events" TO "anon";
GRANT TRIGGER ON public."usage_events" TO "anon";
GRANT MAINTAIN ON public."usage_events" TO "anon";
GRANT INSERT ON public."usage_events" TO "authenticated";
GRANT SELECT ON public."usage_events" TO "authenticated";
GRANT UPDATE ON public."usage_events" TO "authenticated";
GRANT DELETE ON public."usage_events" TO "authenticated";
GRANT TRUNCATE ON public."usage_events" TO "authenticated";
GRANT REFERENCES ON public."usage_events" TO "authenticated";
GRANT TRIGGER ON public."usage_events" TO "authenticated";
GRANT MAINTAIN ON public."usage_events" TO "authenticated";
GRANT INSERT ON public."usage_events" TO "service_role";
GRANT SELECT ON public."usage_events" TO "service_role";
GRANT UPDATE ON public."usage_events" TO "service_role";
GRANT DELETE ON public."usage_events" TO "service_role";
GRANT TRUNCATE ON public."usage_events" TO "service_role";
GRANT REFERENCES ON public."usage_events" TO "service_role";
GRANT TRIGGER ON public."usage_events" TO "service_role";
GRANT MAINTAIN ON public."usage_events" TO "service_role";
ALTER TABLE public."user_feedback" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."user_feedback" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."user_feedback" TO "postgres";
GRANT SELECT ON public."user_feedback" TO "postgres";
GRANT UPDATE ON public."user_feedback" TO "postgres";
GRANT DELETE ON public."user_feedback" TO "postgres";
GRANT TRUNCATE ON public."user_feedback" TO "postgres";
GRANT REFERENCES ON public."user_feedback" TO "postgres";
GRANT TRIGGER ON public."user_feedback" TO "postgres";
GRANT MAINTAIN ON public."user_feedback" TO "postgres";
GRANT INSERT ON public."user_feedback" TO "anon";
GRANT SELECT ON public."user_feedback" TO "anon";
GRANT UPDATE ON public."user_feedback" TO "anon";
GRANT DELETE ON public."user_feedback" TO "anon";
GRANT TRUNCATE ON public."user_feedback" TO "anon";
GRANT REFERENCES ON public."user_feedback" TO "anon";
GRANT TRIGGER ON public."user_feedback" TO "anon";
GRANT MAINTAIN ON public."user_feedback" TO "anon";
GRANT INSERT ON public."user_feedback" TO "authenticated";
GRANT SELECT ON public."user_feedback" TO "authenticated";
GRANT UPDATE ON public."user_feedback" TO "authenticated";
GRANT DELETE ON public."user_feedback" TO "authenticated";
GRANT TRUNCATE ON public."user_feedback" TO "authenticated";
GRANT REFERENCES ON public."user_feedback" TO "authenticated";
GRANT TRIGGER ON public."user_feedback" TO "authenticated";
GRANT MAINTAIN ON public."user_feedback" TO "authenticated";
GRANT INSERT ON public."user_feedback" TO "service_role";
GRANT SELECT ON public."user_feedback" TO "service_role";
GRANT UPDATE ON public."user_feedback" TO "service_role";
GRANT DELETE ON public."user_feedback" TO "service_role";
GRANT TRUNCATE ON public."user_feedback" TO "service_role";
GRANT REFERENCES ON public."user_feedback" TO "service_role";
GRANT TRIGGER ON public."user_feedback" TO "service_role";
GRANT MAINTAIN ON public."user_feedback" TO "service_role";
ALTER TABLE public."user_posts" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."user_posts" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."user_posts" TO "postgres";
GRANT SELECT ON public."user_posts" TO "postgres";
GRANT UPDATE ON public."user_posts" TO "postgres";
GRANT DELETE ON public."user_posts" TO "postgres";
GRANT TRUNCATE ON public."user_posts" TO "postgres";
GRANT REFERENCES ON public."user_posts" TO "postgres";
GRANT TRIGGER ON public."user_posts" TO "postgres";
GRANT MAINTAIN ON public."user_posts" TO "postgres";
GRANT INSERT ON public."user_posts" TO "anon";
GRANT SELECT ON public."user_posts" TO "anon";
GRANT UPDATE ON public."user_posts" TO "anon";
GRANT DELETE ON public."user_posts" TO "anon";
GRANT TRUNCATE ON public."user_posts" TO "anon";
GRANT REFERENCES ON public."user_posts" TO "anon";
GRANT TRIGGER ON public."user_posts" TO "anon";
GRANT MAINTAIN ON public."user_posts" TO "anon";
GRANT INSERT ON public."user_posts" TO "authenticated";
GRANT SELECT ON public."user_posts" TO "authenticated";
GRANT UPDATE ON public."user_posts" TO "authenticated";
GRANT DELETE ON public."user_posts" TO "authenticated";
GRANT TRUNCATE ON public."user_posts" TO "authenticated";
GRANT REFERENCES ON public."user_posts" TO "authenticated";
GRANT TRIGGER ON public."user_posts" TO "authenticated";
GRANT MAINTAIN ON public."user_posts" TO "authenticated";
GRANT INSERT ON public."user_posts" TO "service_role";
GRANT SELECT ON public."user_posts" TO "service_role";
GRANT UPDATE ON public."user_posts" TO "service_role";
GRANT DELETE ON public."user_posts" TO "service_role";
GRANT TRUNCATE ON public."user_posts" TO "service_role";
GRANT REFERENCES ON public."user_posts" TO "service_role";
GRANT TRIGGER ON public."user_posts" TO "service_role";
GRANT MAINTAIN ON public."user_posts" TO "service_role";
ALTER TABLE public."user_settings" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."user_settings" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."user_settings" TO "postgres";
GRANT SELECT ON public."user_settings" TO "postgres";
GRANT UPDATE ON public."user_settings" TO "postgres";
GRANT DELETE ON public."user_settings" TO "postgres";
GRANT TRUNCATE ON public."user_settings" TO "postgres";
GRANT REFERENCES ON public."user_settings" TO "postgres";
GRANT TRIGGER ON public."user_settings" TO "postgres";
GRANT MAINTAIN ON public."user_settings" TO "postgres";
GRANT INSERT ON public."user_settings" TO "anon";
GRANT SELECT ON public."user_settings" TO "anon";
GRANT UPDATE ON public."user_settings" TO "anon";
GRANT DELETE ON public."user_settings" TO "anon";
GRANT TRUNCATE ON public."user_settings" TO "anon";
GRANT REFERENCES ON public."user_settings" TO "anon";
GRANT TRIGGER ON public."user_settings" TO "anon";
GRANT MAINTAIN ON public."user_settings" TO "anon";
GRANT INSERT ON public."user_settings" TO "authenticated";
GRANT SELECT ON public."user_settings" TO "authenticated";
GRANT UPDATE ON public."user_settings" TO "authenticated";
GRANT DELETE ON public."user_settings" TO "authenticated";
GRANT TRUNCATE ON public."user_settings" TO "authenticated";
GRANT REFERENCES ON public."user_settings" TO "authenticated";
GRANT TRIGGER ON public."user_settings" TO "authenticated";
GRANT MAINTAIN ON public."user_settings" TO "authenticated";
GRANT INSERT ON public."user_settings" TO "service_role";
GRANT SELECT ON public."user_settings" TO "service_role";
GRANT UPDATE ON public."user_settings" TO "service_role";
GRANT DELETE ON public."user_settings" TO "service_role";
GRANT TRUNCATE ON public."user_settings" TO "service_role";
GRANT REFERENCES ON public."user_settings" TO "service_role";
GRANT TRIGGER ON public."user_settings" TO "service_role";
GRANT MAINTAIN ON public."user_settings" TO "service_role";
ALTER TABLE public."workspace_members" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."workspace_members" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."workspace_members" TO "postgres";
GRANT SELECT ON public."workspace_members" TO "postgres";
GRANT UPDATE ON public."workspace_members" TO "postgres";
GRANT DELETE ON public."workspace_members" TO "postgres";
GRANT TRUNCATE ON public."workspace_members" TO "postgres";
GRANT REFERENCES ON public."workspace_members" TO "postgres";
GRANT TRIGGER ON public."workspace_members" TO "postgres";
GRANT MAINTAIN ON public."workspace_members" TO "postgres";
GRANT INSERT ON public."workspace_members" TO "anon";
GRANT SELECT ON public."workspace_members" TO "anon";
GRANT UPDATE ON public."workspace_members" TO "anon";
GRANT DELETE ON public."workspace_members" TO "anon";
GRANT TRUNCATE ON public."workspace_members" TO "anon";
GRANT REFERENCES ON public."workspace_members" TO "anon";
GRANT TRIGGER ON public."workspace_members" TO "anon";
GRANT MAINTAIN ON public."workspace_members" TO "anon";
GRANT INSERT ON public."workspace_members" TO "authenticated";
GRANT SELECT ON public."workspace_members" TO "authenticated";
GRANT UPDATE ON public."workspace_members" TO "authenticated";
GRANT DELETE ON public."workspace_members" TO "authenticated";
GRANT TRUNCATE ON public."workspace_members" TO "authenticated";
GRANT REFERENCES ON public."workspace_members" TO "authenticated";
GRANT TRIGGER ON public."workspace_members" TO "authenticated";
GRANT MAINTAIN ON public."workspace_members" TO "authenticated";
GRANT INSERT ON public."workspace_members" TO "service_role";
GRANT SELECT ON public."workspace_members" TO "service_role";
GRANT UPDATE ON public."workspace_members" TO "service_role";
GRANT DELETE ON public."workspace_members" TO "service_role";
GRANT TRUNCATE ON public."workspace_members" TO "service_role";
GRANT REFERENCES ON public."workspace_members" TO "service_role";
GRANT TRIGGER ON public."workspace_members" TO "service_role";
GRANT MAINTAIN ON public."workspace_members" TO "service_role";
ALTER TABLE public."workspaces" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public."workspaces" FROM PUBLIC,anon,authenticated,service_role;
GRANT INSERT ON public."workspaces" TO "postgres";
GRANT SELECT ON public."workspaces" TO "postgres";
GRANT UPDATE ON public."workspaces" TO "postgres";
GRANT DELETE ON public."workspaces" TO "postgres";
GRANT TRUNCATE ON public."workspaces" TO "postgres";
GRANT REFERENCES ON public."workspaces" TO "postgres";
GRANT TRIGGER ON public."workspaces" TO "postgres";
GRANT MAINTAIN ON public."workspaces" TO "postgres";
GRANT INSERT ON public."workspaces" TO "anon";
GRANT SELECT ON public."workspaces" TO "anon";
GRANT UPDATE ON public."workspaces" TO "anon";
GRANT DELETE ON public."workspaces" TO "anon";
GRANT TRUNCATE ON public."workspaces" TO "anon";
GRANT REFERENCES ON public."workspaces" TO "anon";
GRANT TRIGGER ON public."workspaces" TO "anon";
GRANT MAINTAIN ON public."workspaces" TO "anon";
GRANT INSERT ON public."workspaces" TO "authenticated";
GRANT SELECT ON public."workspaces" TO "authenticated";
GRANT UPDATE ON public."workspaces" TO "authenticated";
GRANT DELETE ON public."workspaces" TO "authenticated";
GRANT TRUNCATE ON public."workspaces" TO "authenticated";
GRANT REFERENCES ON public."workspaces" TO "authenticated";
GRANT TRIGGER ON public."workspaces" TO "authenticated";
GRANT MAINTAIN ON public."workspaces" TO "authenticated";
GRANT INSERT ON public."workspaces" TO "service_role";
GRANT SELECT ON public."workspaces" TO "service_role";
GRANT UPDATE ON public."workspaces" TO "service_role";
GRANT DELETE ON public."workspaces" TO "service_role";
GRANT TRUNCATE ON public."workspaces" TO "service_role";
GRANT REFERENCES ON public."workspaces" TO "service_role";
GRANT TRIGGER ON public."workspaces" TO "service_role";
GRANT MAINTAIN ON public."workspaces" TO "service_role";
CREATE POLICY "acj_campaign_plans_all_own" ON public."acj_campaign_plans" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "acj_content_contracts_all_own" ON public."acj_content_contracts" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "acj_cycle_plans_all_own" ON public."acj_cycle_plans" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "acj_definitions_brand_read" ON public."acj_definitions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "acj_definitions_brand_write" ON public."acj_definitions" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "acj_learning_decisions_all_own" ON public."acj_learning_decisions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "acj_learning_entries_all_own" ON public."acj_learning_entries" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "acj_learning_evidence_all_own" ON public."acj_learning_evidence" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "acj_signal_readings_all_own" ON public."acj_signal_readings" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "ai_chat_messages_own" ON public."ai_chat_messages" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "ai_generations_own" ON public."ai_generations" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "ai_learnings_own" ON public."ai_learnings" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "ai_measurement_events_all_own" ON public."ai_measurement_events" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "ai_reviews_own" ON public."ai_reviews" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "ai_segment_gate_own" ON public."ai_segment_gate" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "ai_variations_own" ON public."ai_variations" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "alma_crencas_brand_read" ON public."alma_crencas" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "alma_crencas_brand_write" ON public."alma_crencas" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "alma_dimensoes_brand_read" ON public."alma_dimensoes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "alma_dimensoes_brand_write" ON public."alma_dimensoes" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "alma_estado_brand_read" ON public."alma_estado" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "alma_estado_brand_write" ON public."alma_estado" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "alma_eventos_brand_read" ON public."alma_eventos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "alma_eventos_brand_write" ON public."alma_eventos" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "alma_objetivo_brand_read" ON public."alma_objetivo" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "alma_objetivo_brand_write" ON public."alma_objetivo" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "alma_pulsoes_brand_read" ON public."alma_pulsoes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "alma_pulsoes_brand_write" ON public."alma_pulsoes" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "alma_sombra_brand_read" ON public."alma_sombra" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "alma_sombra_brand_write" ON public."alma_sombra" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "audiences_brand" ON public."audiences" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));
CREATE POLICY "bee_analogies_brand_read" ON public."bee_analogies" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_analogies_brand_write" ON public."bee_analogies" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_arsenal_brand_read" ON public."bee_arsenal" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_arsenal_brand_write" ON public."bee_arsenal" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_avatars_brand_read" ON public."bee_avatars" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_avatars_brand_write" ON public."bee_avatars" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_directives_brand_read" ON public."bee_directives" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_directives_brand_write" ON public."bee_directives" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_editorials_brand_read" ON public."bee_editorials" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_editorials_brand_write" ON public."bee_editorials" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_editorials_no_delete_system" ON public."bee_editorials" AS RESTRICTIVE FOR DELETE TO "authenticated" USING ((is_system = false));
CREATE POLICY "bee_example_posts_brand_read" ON public."bee_example_posts" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_example_posts_brand_write" ON public."bee_example_posts" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_glossary_brand_read" ON public."bee_glossary" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_glossary_brand_write" ON public."bee_glossary" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_hashtags_brand_read" ON public."bee_hashtags" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_hashtags_brand_write" ON public."bee_hashtags" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_headline_types_brand_read" ON public."bee_headline_types" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_headline_types_brand_write" ON public."bee_headline_types" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_logics_brand_read" ON public."bee_logics" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_logics_brand_write" ON public."bee_logics" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_personas_own" ON public."bee_personas" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "products_delete_own" ON public."bee_products" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((user_id = auth.uid()));
CREATE POLICY "products_insert_own" ON public."bee_products" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "products_select" ON public."bee_products" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((user_id = auth.uid()) OR (((user_id IS NULL) OR (is_system = true)) AND brand_readable(brand_id))));
CREATE POLICY "products_update_own" ON public."bee_products" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((user_id = auth.uid()));
CREATE POLICY "bee_style_rules_brand_read" ON public."bee_style_rules" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_style_rules_brand_write" ON public."bee_style_rules" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_suggestions_brand_read" ON public."bee_suggestions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_suggestions_brand_write" ON public."bee_suggestions" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "bee_themes_brand_read" ON public."bee_themes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "bee_themes_brand_write" ON public."bee_themes" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "intelligence_history_add" ON public."brand_intelligence_history" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (((changed_by = auth.uid()) AND is_brand_member(brand_id)));
CREATE POLICY "intelligence_history_read" ON public."brand_intelligence_history" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_brand_member(brand_id));
CREATE POLICY "intelligence_read" ON public."brand_intelligence_settings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_brand_member(brand_id));
CREATE POLICY "intelligence_write" ON public."brand_intelligence_settings" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));
CREATE POLICY "brands_member" ON public."brands" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_workspace_member(workspace_id)) WITH CHECK (is_workspace_member(workspace_id));
CREATE POLICY "business_fronts_brand" ON public."business_fronts" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));
CREATE POLICY "campaign_cycles_all_own" ON public."campaign_cycles" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "campaigns_all_own" ON public."campaigns" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "profile_versions_brand" ON public."communication_profile_versions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM communication_profiles p
  WHERE ((p.id = communication_profile_versions.profile_id) AND is_brand_member(p.brand_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM communication_profiles p
  WHERE ((p.id = communication_profile_versions.profile_id) AND is_brand_member(p.brand_id)))));
CREATE POLICY "communication_profiles_brand" ON public."communication_profiles" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));
CREATE POLICY "base_uses_owner" ON public."content_base_uses" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "base_versions_owner" ON public."content_base_versions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "idea_fb_all_own" ON public."content_idea_feedback" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "ideas_all_own" ON public."content_ideas_cache" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "content_memory_all_own" ON public."content_memory" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "content_piece_plans_all_own" ON public."content_piece_plans" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "contents_all_own" ON public."contents" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "context_snapshots_all_own" ON public."context_snapshots" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "design_assets_brand_read" ON public."design_assets" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "design_assets_brand_write" ON public."design_assets" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "design_manifestacoes_brand_read" ON public."design_manifestacoes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "design_manifestacoes_brand_write" ON public."design_manifestacoes" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "design_selection_config_brand_read" ON public."design_selection_config" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "design_selection_config_brand_write" ON public."design_selection_config" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "design_tokens_brand_read" ON public."design_tokens" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "design_tokens_brand_write" ON public."design_tokens" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "design_variacoes_brand_read" ON public."design_variacoes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "design_variacoes_brand_write" ON public."design_variacoes" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "line_runs_all_own" ON public."editorial_line_runs" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "lines_all_own" ON public."editorial_lines" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "emitters_brand" ON public."emitters" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));
CREATE POLICY "format_capabilities_read" ON public."format_capabilities" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);
CREATE POLICY "genesis_avatares_brand_read" ON public."genesis_avatares" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "genesis_avatares_brand_write" ON public."genesis_avatares" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "genesis_core_brand_read" ON public."genesis_core" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "genesis_core_brand_write" ON public."genesis_core" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "genesis_fluxo_brand_read" ON public."genesis_fluxo" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "genesis_fluxo_brand_write" ON public."genesis_fluxo" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "genesis_lentes_brand_read" ON public."genesis_lentes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "genesis_lentes_brand_write" ON public."genesis_lentes" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "genesis_principios_brand_read" ON public."genesis_principios" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "genesis_principios_brand_write" ON public."genesis_principios" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "genesis_tensoes_brand_read" ON public."genesis_tensoes" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "genesis_tensoes_brand_write" ON public."genesis_tensoes" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "ideas_all_own" ON public."ideas" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "trials_all_own" ON public."image_model_trials" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "kanban_all_own" ON public."kanban_columns" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "kanban_insert_own" ON public."kanban_columns" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "analysis_own" ON public."knowledge_analysis_runs" AS PERMISSIVE FOR ALL TO "authenticated" USING (((user_id = auth.uid()) AND is_brand_member(brand_id))) WITH CHECK (((user_id = auth.uid()) AND is_brand_member(brand_id)));
CREATE POLICY "kb_chunks_delete_own" ON public."knowledge_chunks" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "kb_chunks_insert_own" ON public."knowledge_chunks" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "kb_chunks_select" ON public."knowledge_chunks" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "discoveries_own" ON public."knowledge_discoveries" AS PERMISSIVE FOR ALL TO "authenticated" USING (((user_id = auth.uid()) AND is_brand_member(brand_id))) WITH CHECK (((user_id = auth.uid()) AND is_brand_member(brand_id)));
CREATE POLICY "kb_docs_delete_own" ON public."knowledge_documents" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "kb_docs_insert_own" ON public."knowledge_documents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "kb_docs_select" ON public."knowledge_documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((auth.uid() = user_id) OR ((is_global = true) AND brand_readable(brand_id))));
CREATE POLICY "kb_docs_update_own" ON public."knowledge_documents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "meta_ad_accounts_owner" ON public."meta_ad_accounts" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "meta_ad_insights_daily_owner" ON public."meta_ad_insights_daily" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "meta_ads_owner" ON public."meta_ads" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "meta_adsets_owner" ON public."meta_adsets" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "meta_businesses_owner" ON public."meta_businesses" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "meta_campaigns_owner" ON public."meta_campaigns" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "meta_connections_owner" ON public."meta_connections" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "olhar_base_member_read" ON public."olhar_base" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_brand_member(brand_id));
CREATE POLICY "olhar_base_member_write" ON public."olhar_base" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));
CREATE POLICY "olhar_calibracao_member_read" ON public."olhar_calibracao" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_brand_member(brand_id));
CREATE POLICY "olhar_nomes_member_read" ON public."olhar_nomes_proibidos" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_brand_member(brand_id));
CREATE POLICY "olhar_nomes_member_write" ON public."olhar_nomes_proibidos" AS PERMISSIVE FOR ALL TO "authenticated" USING (is_brand_member(brand_id)) WITH CHECK (is_brand_member(brand_id));
CREATE POLICY "olhar_sessions_member_read" ON public."olhar_sessions" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_brand_member(brand_id));
CREATE POLICY "photo_generations_owner" ON public."photo_generations" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "photo_references_brand_read" ON public."photo_references" AS PERMISSIVE FOR SELECT TO "authenticated" USING (brand_readable(brand_id));
CREATE POLICY "photo_references_brand_write" ON public."photo_references" AS PERMISSIVE FOR ALL TO "authenticated" USING (((brand_id IS NOT NULL) AND is_brand_member(brand_id))) WITH CHECK (((brand_id IS NOT NULL) AND is_brand_member(brand_id)));
CREATE POLICY "photo_style_approvals_owner" ON public."photo_style_approvals" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "piece_candidates_all_own" ON public."piece_candidates" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "piece_versions_all_own" ON public."piece_versions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "podcast_clips_all_own" ON public."podcast_clips" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "podcasts_all_own" ON public."podcasts" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "post_comments_all_own" ON public."post_comments" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "drafts_all_own" ON public."post_drafts" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "post_metrics_all_own" ON public."post_metrics" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "post_publications_read_own" ON public."post_publications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "templates_modify_own" ON public."post_templates" AS PERMISSIVE FOR ALL TO "authenticated" USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "templates_select" ON public."post_templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING (((user_id IS NULL) OR (is_system = true) OR (user_id = auth.uid()) OR (is_public = true)));
CREATE POLICY "templates_update_system" ON public."post_templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((is_system = true)) WITH CHECK ((is_system = true));
CREATE POLICY "post_unit_publications_read_own" ON public."post_unit_publications" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "post_units_all_own" ON public."post_units" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "profiles_insert_own" ON public."profiles" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = id));
CREATE POLICY "profiles_select_own" ON public."profiles" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = id));
CREATE POLICY "profiles_update_own" ON public."profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = id));
CREATE POLICY "publication_packages_read_own" ON public."publication_packages" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "schedule_commands_read_own" ON public."schedule_commands" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((auth.uid() = user_id));
CREATE POLICY "schedule_plans_all_own" ON public."schedule_plans" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "setup_sessions_all_own" ON public."setup_sessions" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK (((auth.uid() = user_id) AND ((brand_id IS NULL) OR is_brand_member(brand_id))));
CREATE POLICY "social_accounts_all_own" ON public."social_accounts" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "traffic_ads_owner" ON public."traffic_ads" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "traffic_campaigns_owner" ON public."traffic_campaigns" AS PERMISSIVE FOR ALL TO PUBLIC USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "usage_select_own" ON public."usage_events" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((user_id = auth.uid()));
CREATE POLICY "feedback_insert_any" ON public."user_feedback" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (true);
CREATE POLICY "feedback_select_own" ON public."user_feedback" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((user_id = auth.uid()));
CREATE POLICY "posts_all_own" ON public."user_posts" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "settings_all_own" ON public."user_settings" AS PERMISSIVE FOR ALL TO "authenticated" USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "settings_insert_own" ON public."user_settings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "ws_members_self" ON public."workspace_members" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_workspace_member(workspace_id));
CREATE POLICY "workspaces_member" ON public."workspaces" AS PERMISSIVE FOR SELECT TO "authenticated" USING (is_workspace_member(id));
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER trg_acj_campaign_plans_updated BEFORE UPDATE ON acj_campaign_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_acj_cplan_after AFTER INSERT OR UPDATE OF status ON acj_campaign_plans FOR EACH ROW EXECUTE FUNCTION acj_campaign_plan_after();
CREATE TRIGGER trg_acj_cplan_guard BEFORE INSERT OR UPDATE ON acj_campaign_plans FOR EACH ROW EXECUTE FUNCTION acj_campaign_plan_guard();
CREATE TRIGGER trg_acj_content_contracts_updated BEFORE UPDATE ON acj_content_contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_acj_contract_guard BEFORE INSERT OR UPDATE ON acj_content_contracts FOR EACH ROW EXECUTE FUNCTION acj_contract_guard();
CREATE TRIGGER trg_acj_contract_propagate AFTER INSERT ON acj_content_contracts FOR EACH ROW EXECUTE FUNCTION acj_contract_propagate();
CREATE TRIGGER trg_acj_cyplan_before BEFORE INSERT ON acj_cycle_plans FOR EACH ROW EXECUTE FUNCTION acj_cycle_plan_before();
CREATE TRIGGER trg_acj_learning_audit AFTER INSERT OR UPDATE ON acj_learning_entries FOR EACH ROW EXECUTE FUNCTION acj_learning_audit();
CREATE TRIGGER trg_acj_learning_entries_updated BEFORE UPDATE ON acj_learning_entries FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_acj_learning_guard BEFORE INSERT OR UPDATE ON acj_learning_entries FOR EACH ROW EXECUTE FUNCTION acj_learning_guard();
CREATE TRIGGER trg_acj_learning_no_delete BEFORE DELETE ON acj_learning_entries FOR EACH ROW EXECUTE FUNCTION acj_learning_no_delete();
CREATE TRIGGER trg_ai_gate_recompute AFTER INSERT OR UPDATE ON ai_reviews FOR EACH ROW EXECUTE FUNCTION ai_gate_recompute();
CREATE TRIGGER trg_audiences_updated BEFORE UPDATE ON audiences FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_product_audiences BEFORE INSERT OR UPDATE OF audience_ids, brand_id ON bee_products FOR EACH ROW EXECUTE FUNCTION guard_product_audiences();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON bee_products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_business_fronts_updated BEFORE UPDATE ON business_fronts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_campaign_cycles_updated BEFORE UPDATE ON campaign_cycles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_campaigns_profile_brand BEFORE INSERT OR UPDATE OF profile_id ON campaigns FOR EACH ROW EXECUTE FUNCTION guard_profile_brand();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_communication_profiles_updated BEFORE UPDATE ON communication_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER guard_base_use BEFORE INSERT OR UPDATE ON content_base_uses FOR EACH ROW EXECUTE FUNCTION guard_base_reference();
CREATE TRIGGER guard_base_version BEFORE INSERT OR UPDATE ON content_base_versions FOR EACH ROW EXECUTE FUNCTION guard_base_reference();
CREATE TRIGGER guard_plan_base BEFORE INSERT OR UPDATE ON content_piece_plans FOR EACH ROW EXECUTE FUNCTION guard_base_reference();
CREATE TRIGGER trg_plan_intent_guard BEFORE INSERT OR UPDATE OF acj_primary, acj_secondary, acj_rationale ON content_piece_plans FOR EACH ROW EXECUTE FUNCTION guard_plan_intent();
CREATE TRIGGER trg_contents_flag_derived AFTER UPDATE OF body ON contents FOR EACH ROW EXECUTE FUNCTION flag_derived_pieces();
CREATE TRIGGER trg_contents_profile_brand BEFORE INSERT OR UPDATE OF profile_id ON contents FOR EACH ROW EXECUTE FUNCTION guard_profile_brand();
CREATE TRIGGER trg_contents_updated BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_design_assets_updated BEFORE UPDATE ON design_assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_design_manifestacoes_updated BEFORE UPDATE ON design_manifestacoes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_design_selection_updated BEFORE UPDATE ON design_selection_config FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_design_tokens_updated BEFORE UPDATE ON design_tokens FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_design_variacoes_updated BEFORE UPDATE ON design_variacoes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_editorial_lines_next_run BEFORE INSERT OR UPDATE ON editorial_lines FOR EACH ROW EXECUTE FUNCTION editorial_line_set_next_run();
CREATE TRIGGER trg_emitters_updated BEFORE UPDATE ON emitters FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER guard_idea_base BEFORE INSERT OR UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION guard_base_reference();
CREATE TRIGGER trg_ideas_profile_brand BEFORE INSERT OR UPDATE OF profile_id ON ideas FOR EACH ROW EXECUTE FUNCTION guard_profile_brand();
CREATE TRIGGER trg_ideas_updated BEFORE UPDATE ON ideas FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_knowledge_documents_updated BEFORE UPDATE ON knowledge_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_piece_candidates_updated BEFORE UPDATE ON piece_candidates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_piece_versions_append_only BEFORE UPDATE ON piece_versions FOR EACH ROW EXECUTE FUNCTION piece_versions_append_only();
CREATE TRIGGER trg_podcast_clips_touch BEFORE UPDATE ON podcast_clips FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_podcasts_touch BEFORE UPDATE ON podcasts FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_post_comments_updated BEFORE UPDATE ON post_comments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_post_drafts_updated BEFORE UPDATE ON post_drafts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_post_metrics_updated BEFORE UPDATE ON post_metrics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_post_templates_updated BEFORE UPDATE ON post_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_post_units_guard BEFORE UPDATE ON post_units FOR EACH ROW EXECUTE FUNCTION post_units_guard();
CREATE TRIGGER trg_post_units_touch_post AFTER INSERT OR DELETE OR UPDATE ON post_units FOR EACH ROW EXECUTE FUNCTION post_units_touch_post();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_publication_packages_immutable BEFORE DELETE OR UPDATE ON publication_packages FOR EACH ROW EXECUTE FUNCTION publication_packages_immutable();
CREATE TRIGGER trg_setup_sessions_updated BEFORE UPDATE ON setup_sessions FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER trg_social_accounts_updated BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER guard_production_v2 BEFORE INSERT ON user_posts FOR EACH ROW EXECUTE FUNCTION guard_production_v2();
CREATE TRIGGER trg_posts_acj_inherit BEFORE INSERT OR UPDATE ON user_posts FOR EACH ROW EXECUTE FUNCTION acj_piece_inherit();
CREATE TRIGGER trg_posts_inherit_context BEFORE INSERT OR UPDATE OF content_id, context_snapshot_id ON user_posts FOR EACH ROW EXECUTE FUNCTION piece_inherit_context();
CREATE TRIGGER trg_posts_invalidate_on_edit BEFORE UPDATE OF caption, carousel_text, rendered_slides, carousel_fabric_json, visual_decision ON user_posts FOR EACH ROW EXECUTE FUNCTION invalidate_on_edit();
CREATE TRIGGER trg_posts_pin_scheduled BEFORE INSERT OR UPDATE OF status ON user_posts FOR EACH ROW EXECUTE FUNCTION pin_scheduled_version();
CREATE TRIGGER trg_posts_protect_published BEFORE UPDATE OF status, scheduled_date ON user_posts FOR EACH ROW EXECUTE FUNCTION protect_published();
CREATE TRIGGER trg_user_posts_fill_codigo BEFORE INSERT ON user_posts FOR EACH ROW EXECUTE FUNCTION user_posts_fill_codigo();
CREATE TRIGGER trg_user_posts_profile_brand BEFORE INSERT OR UPDATE OF profile_id ON user_posts FOR EACH ROW EXECUTE FUNCTION guard_profile_brand();
CREATE TRIGGER trg_user_posts_updated BEFORE UPDATE ON user_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_posts_importado_historico BEFORE INSERT ON user_posts FOR EACH ROW EXECUTE FUNCTION user_posts_importado_historico();
CREATE TRIGGER trg_user_settings_updated BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
COMMIT;