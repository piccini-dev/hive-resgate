// Tradução PURA do rascunho do módulo de Tráfego (traffic_campaigns/traffic_ads)
// para os payloads da Marketing API v26, e validação das combinações.
// Sem rede e sem Deno: roda no traffic-meta e nos unitários (e2e/unit-traffic-spec.spec.ts).
// Regras da Meta conferidas no Context7 em 15/11/2026 (docs/plano/PLANO.md §5).

export type Objective = 'OUTCOME_AWARENESS' | 'OUTCOME_TRAFFIC' | 'OUTCOME_ENGAGEMENT';
export type FacebookPosition = 'feed' | 'story' | 'facebook_reels';
export type InstagramPosition = 'stream' | 'story' | 'reels';
export type Cta = 'LEARN_MORE' | 'SIGN_UP' | 'SUBSCRIBE' | 'CONTACT_US' | 'APPLY_NOW' | 'DOWNLOAD';

export interface TargetingDraft {
  advantage_audience: boolean;
  countries: string[];                                         // ISO, ex.: ['BR']
  regions: Array<{ key: string; name: string }>;               // key da busca adgeolocation
  cities: Array<{ key: string; name: string; radius_km?: number }>;
  age_min: number;                                             // 18..65
  age_max: number;                                             // 18..65
  genders: 'all' | 'male' | 'female';
  interests: Array<{ id: string; name: string }>;              // id da busca adinterest
}
export interface PlacementsDraft { mode: 'auto' | 'manual'; facebook: FacebookPosition[]; instagram: InstagramPosition[] }
export interface CampaignDraft {
  budget_type: 'daily' | 'lifetime';
  amount: number;                 // R$
  starts_at: string;              // ISO
  ends_at: string | null;         // obrigatório no orçamento total
  optimization_goal?: string;     // vazio = padrão do objetivo
  targeting: TargetingDraft;
  placements: PlacementsDraft;
}
export interface CampaignRow { id: string; name: string; objective: Objective | null; draft: CampaignDraft }
export interface AdRow { id: string; post_id: string; mode: 'ig_post' | 'new_creative'; primary_text: string | null; headline: string | null; cta: Cta | null; link_url: string | null }
export interface PostRow { id: string; format: string; ig_media_id: string | null; rendered_slides: Record<string, string> | null }
export interface AccountIds { ad_account_id: string; page_id: string; ig_user_id: string }

export const OBJECTIVES: readonly Objective[] = ['OUTCOME_AWARENESS', 'OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT'];
export const MAX_ADS = 5;
// A primeira de cada lista é o padrão.
export const GOALS: Record<Objective, readonly string[]> = {
  OUTCOME_AWARENESS: ['REACH', 'IMPRESSIONS', 'AD_RECALL_LIFT'],
  OUTCOME_TRAFFIC: ['LINK_CLICKS', 'LANDING_PAGE_VIEWS', 'REACH', 'IMPRESSIONS'],
  OUTCOME_ENGAGEMENT: ['POST_ENGAGEMENT', 'REACH', 'IMPRESSIONS'],
};
export const CTAS: readonly Cta[] = ['LEARN_MORE', 'SIGN_UP', 'SUBSCRIBE', 'CONTACT_US', 'APPLY_NOW', 'DOWNLOAD'];
const VIDEO_FORMATS = ['reel', 'video', 'story'];

export function optimizationGoal(objective: Objective, override?: string): string {
  return override && GOALS[objective].includes(override) ? override : GOALS[objective][0];
}

// rendered_slides = { slide1: url, slide2: url, … } → URLs em ordem numérica (slide10 depois de slide9).
export function slideUrls(rendered: Record<string, string> | null): string[] {
  if (!rendered) return [];
  return Object.entries(rendered)
    .filter(([k, v]) => /^slide\d+$/.test(k) && !!v)
    .sort(([a], [b]) => Number(a.slice(5)) - Number(b.slice(5)))
    .map(([, v]) => v);
}

function isHttps(u: string | null | undefined): boolean {
  try { return !!u && new URL(u).protocol === 'https:'; } catch { return false; }
}

// Lista de erros em português (vazia = pode criar). `posts` só traz peças elegíveis.
export function validateDraft(c: CampaignRow, ads: AdRow[], posts: PostRow[], now: Date = new Date()): string[] {
  const e: string[] = [];
  const d = c.draft;
  if (!c.name.trim()) e.push('Dê um nome à campanha.');
  if (!c.objective || !OBJECTIVES.includes(c.objective)) e.push('Escolha o objetivo da campanha.');
  else if (d.optimization_goal && !GOALS[c.objective].includes(d.optimization_goal)) e.push('A meta de otimização não combina com o objetivo.');
  if (!(d.amount > 0)) e.push('O orçamento precisa ser maior que zero.');
  const start = Date.parse(d.starts_at);
  const end = d.ends_at ? Date.parse(d.ends_at) : NaN;
  if (Number.isNaN(start)) e.push('Informe o início da campanha.');
  if (d.budget_type === 'lifetime' && !d.ends_at) e.push('Orçamento total precisa de data de término.');
  if (d.ends_at && (Number.isNaN(end) || end <= start)) e.push('O término precisa ser depois do início.');
  else if (d.ends_at && end <= now.getTime()) e.push('O término já passou.');
  const t = d.targeting;
  if (t.countries.length + t.regions.length + t.cities.length === 0) e.push('Escolha ao menos um local.');
  if (t.age_min < 18 || t.age_max > 65 || t.age_min > t.age_max) e.push('A idade vai de 18 a 65, e a mínima não pode passar da máxima.');
  if (d.placements.mode === 'manual' && d.placements.facebook.length + d.placements.instagram.length === 0) e.push('Escolha ao menos um posicionamento.');
  if (ads.length === 0) e.push('Escolha ao menos uma peça.');
  if (ads.length > MAX_ADS) e.push(`No máximo ${MAX_ADS} peças por campanha.`);
  ads.forEach((a, i) => {
    const n = i + 1;
    const p = posts.find((x) => x.id === a.post_id);
    if (!p) { e.push(`Peça ${n}: não encontrada ou não aprovada.`); return; }
    if (a.cta && !CTAS.includes(a.cta)) e.push(`Peça ${n}: botão inválido.`);
    if (a.mode === 'ig_post') {
      if (!p.ig_media_id) e.push(`Peça ${n}: só pode ser impulsionada depois de publicada no Instagram.`);
      if (c.objective === 'OUTCOME_TRAFFIC' && !isHttps(a.link_url)) e.push(`Peça ${n}: informe o link (https) para onde o anúncio leva.`);
    } else {
      if (VIDEO_FORMATS.includes(p.format)) e.push(`Peça ${n}: vídeo só pode ser anunciado depois de publicado no Instagram.`);
      else if (slideUrls(p.rendered_slides).length === 0) e.push(`Peça ${n}: não tem arte pronta.`);
      if (!a.primary_text?.trim()) e.push(`Peça ${n}: escreva o texto principal.`);
      // O anúncio fora do feed exige link (object_story_spec.link_data.link), em qualquer objetivo.
      if (!isHttps(a.link_url)) e.push(`Peça ${n}: informe o link (https) para onde o anúncio leva.`);
    }
  });
  return e;
}

export function withUtm(url: string, campaignId: string): string {
  const u = new URL(url);
  if (!u.searchParams.has('utm_source')) u.searchParams.set('utm_source', 'hive');
  if (!u.searchParams.has('utm_medium')) u.searchParams.set('utm_medium', 'paid');
  u.searchParams.set('utm_campaign', campaignId);
  return u.toString();
}

export function buildTargeting(d: CampaignDraft): Record<string, unknown> {
  const t = d.targeting;
  const geo: Record<string, unknown> = {};
  if (t.countries.length) geo.countries = t.countries;
  if (t.regions.length) geo.regions = t.regions.map((r) => ({ key: r.key }));
  if (t.cities.length) geo.cities = t.cities.map((c) => ({ key: c.key, radius: c.radius_km ?? 10, distance_unit: 'kilometer' }));
  const out: Record<string, unknown> = { geo_locations: geo, targeting_automation: { advantage_audience: t.advantage_audience ? 1 : 0 } };
  if (t.advantage_audience) {
    // Advantage+: age_min só de 18 a 25 e age_max fixo em 65; a faixa escolhida vira sugestão (age_range).
    out.age_min = Math.min(Math.max(t.age_min, 18), 25);
    out.age_range = [t.age_min, t.age_max];
  } else {
    out.age_min = t.age_min;
    out.age_max = t.age_max;
  }
  if (t.genders !== 'all') out.genders = [t.genders === 'male' ? 1 : 2];
  if (t.interests.length) out.flexible_spec = [{ interests: t.interests.map((i) => ({ id: i.id, name: i.name })) }];
  if (d.placements.mode === 'manual') {
    const pubs: string[] = [];
    if (d.placements.facebook.length) { pubs.push('facebook'); out.facebook_positions = d.placements.facebook; }
    if (d.placements.instagram.length) { pubs.push('instagram'); out.instagram_positions = d.placements.instagram; }
    out.publisher_platforms = pubs;
    // Stories do Facebook só existem no celular.
    if (d.placements.facebook.includes('story')) out.device_platforms = ['mobile'];
  }
  return out;
}

export function campaignPayload(c: CampaignRow): Record<string, unknown> {
  // Orçamento fica no conjunto; desde a v24 a campanha precisa dizer se compartilha verba entre conjuntos.
  return { name: c.name.trim(), objective: c.objective, status: 'PAUSED', special_ad_categories: [], is_adset_budget_sharing_enabled: false };
}

export function adsetPayload(c: CampaignRow, ids: AccountIds, fbCampaignId: string): Record<string, unknown> {
  const d = c.draft;
  const objective = c.objective as Objective;
  const p: Record<string, unknown> = {
    name: `${c.name.trim()} · conjunto`,
    campaign_id: fbCampaignId,
    status: 'PAUSED',
    billing_event: 'IMPRESSIONS',
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    optimization_goal: optimizationGoal(objective, d.optimization_goal),
    start_time: new Date(d.starts_at).toISOString(),
    targeting: buildTargeting(d),
  };
  // Valores na menor unidade da moeda da conta (centavos de real).
  p[d.budget_type === 'daily' ? 'daily_budget' : 'lifetime_budget'] = Math.round(d.amount * 100);
  if (d.ends_at) p.end_time = new Date(d.ends_at).toISOString();
  if (objective === 'OUTCOME_TRAFFIC') p.destination_type = 'WEBSITE';
  if (objective === 'OUTCOME_ENGAGEMENT') p.destination_type = 'ON_POST';
  if (objective === 'OUTCOME_AWARENESS') p.promoted_object = { page_id: ids.page_id };
  return p;
}

// n = posição da peça na campanha (1..5), só para o nome.
export function creativePayload(c: CampaignRow, a: AdRow, p: PostRow, ids: AccountIds, n: number): Record<string, unknown> {
  const name = `${c.name.trim()} · peça ${n}`;
  const cta = a.cta ?? 'LEARN_MORE';
  const link = a.link_url ? withUtm(a.link_url, c.id) : null;
  if (a.mode === 'ig_post') {
    const out: Record<string, unknown> = { name, object_id: ids.page_id, instagram_user_id: ids.ig_user_id, source_instagram_media_id: p.ig_media_id };
    if (link) out.call_to_action = { type: cta, value: { link } };
    return out;
  }
  const slides = slideUrls(p.rendered_slides).slice(0, 10);
  const linkData: Record<string, unknown> = { link, message: a.primary_text ?? '', call_to_action: { type: cta, value: { link } } };
  if (slides.length > 1) {
    linkData.child_attachments = slides.map((picture, i) => ({ link, picture, name: a.headline ? `${a.headline} (${i + 1})` : `Parte ${i + 1}` }));
  } else {
    linkData.picture = slides[0];
    if (a.headline) linkData.name = a.headline;
  }
  return { name, object_story_spec: { page_id: ids.page_id, instagram_user_id: ids.ig_user_id, link_data: linkData } };
}

export function adPayload(c: CampaignRow, n: number, fbAdsetId: string, fbCreativeId: string): Record<string, unknown> {
  return { name: `${c.name.trim()} · peça ${n}`, adset_id: fbAdsetId, creative: { creative_id: fbCreativeId }, status: 'PAUSED' };
}
