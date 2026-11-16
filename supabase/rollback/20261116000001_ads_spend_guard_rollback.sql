-- Desfaz a trava do teto mensal (20261116000001_ads_spend_guard.sql).
-- Sem ela o traffic-meta falha no create e no ACTIVE (a chamada à função dá erro), então nada é criado nem ligado.
BEGIN;
DROP FUNCTION IF EXISTS public.ads_spend_guard(uuid, uuid);
COMMIT;
