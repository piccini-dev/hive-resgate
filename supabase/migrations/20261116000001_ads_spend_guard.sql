-- Tráfego · bloco 12 — trava do teto mensal (docs/plano/PLANO.md §6.5 e §9). Idempotente.
--   * ads_spend_guard(p_user, p_campaign): a campanha cabe no teto do mês corrente (America/Sao_Paulo)?
--   * spent = gasto do mês no espelho meta_ad_insights_daily; committed = o que as campanhas
--     ativas/em criação (e a pedida) ainda podem gastar até o fim do mês (orçamento total conta inteiro).
--   * Só o servidor (service_role) chama: o traffic-meta recusa com PT402 quando ok = false.
BEGIN;

CREATE OR REPLACE FUNCTION public.ads_spend_guard(p_user uuid, p_campaign uuid) RETURNS jsonb
LANGUAGE sql STABLE SET search_path = public AS $$
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
$$;

REVOKE ALL ON FUNCTION public.ads_spend_guard(uuid, uuid) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ads_spend_guard(uuid, uuid) TO service_role;

COMMIT;
