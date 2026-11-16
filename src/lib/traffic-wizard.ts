// Wizard de Nova campanha do Tráfego (docs/plano/PLANO.md §3 F2): estado, padrões e regras
// PURAS (sem rede, sem React). As regras de validação são as MESMAS do servidor
// (supabase/functions/_shared/traffic-spec.ts → validateDraft): aqui só se distribuem por passo.
import {
  CTAS, MAX_ADS, slideUrls, validateDraft,
  type AdRow, type CampaignDraft, type Cta, type Objective, type PostRow, type TargetingDraft,
} from '../../supabase/functions/_shared/traffic-spec';

export type { CampaignDraft, Cta, Objective } from '../../supabase/functions/_shared/traffic-spec';
export { CTAS, MAX_ADS, slideUrls } from '../../supabase/functions/_shared/traffic-spec';

// Uma linha da view traffic_eligible_posts (peça aprovada, agendada ou publicada, com arte).
export interface EligiblePost {
  id: string;
  title: string | null;
  platform: string;
  format: string;
  status: 'approved' | 'scheduled' | 'published';
  rendered_slides: Record<string, string> | null;
  published_url: string | null;
  published_at: string | null;
  ig_media_id: string | null;
}

export interface WizardAd {
  post_id: string;
  mode: 'ig_post' | 'new_creative';
  primary_text: string;
  headline: string;
  cta: Cta;
  link_url: string;
}

export interface WizardState {
  id: string;
  name: string;
  objective: Objective | null;
  step: number;          // 1..7
  draft: CampaignDraft;
  ads: WizardAd[];
}

// Resultado das buscas da traffic-meta (mesma forma de TrafficLocation/TrafficInterest em src/lib/edge.ts).
export interface LocationOption { key: string; name: string; type: string; country_code?: string; region?: string }
export interface InterestOption { id: string; name: string }

// Props comuns de cada passo (src/pages/trafego/wizard/Step*.tsx).
export interface StepProps {
  state: WizardState;
  posts: EligiblePost[];
  problems: string[];                   // o que falta neste passo (vazio = pode continuar)
  onChange: (next: WizardState) => void;
  onGoTo: (step: number) => void;       // usado pela Revisão ("Editar")
  onCreated: () => void;                // usado pela Revisão depois de criar na Meta
}

export const TOTAL_STEPS = 7;
export const WIZARD_STEPS: ReadonlyArray<{ n: number; title: string; subtitle: string }> = [
  { n: 1, title: 'Conteúdo', subtitle: 'Escolha de 1 a 5 peças aprovadas, agendadas ou publicadas para anunciar.' },
  { n: 2, title: 'Campanha', subtitle: 'O que você quer que aconteça com quem vir o anúncio.' },
  { n: 3, title: 'Orçamento e programação', subtitle: 'Quanto investir e por quanto tempo. Nada é gasto até você ativar.' },
  { n: 4, title: 'Público', subtitle: 'Onde estão e quem são as pessoas que devem ver o anúncio.' },
  { n: 5, title: 'Posicionamentos', subtitle: 'Em que lugares do Facebook e do Instagram o anúncio aparece.' },
  { n: 6, title: 'Anúncio', subtitle: 'O texto, o título e o botão de cada peça.' },
  { n: 7, title: 'Revisão', subtitle: 'Confira tudo. A campanha é criada na Meta pausada.' },
];

export const OBJECTIVE_LABELS: Record<Objective, { title: string; description: string }> = {
  OUTCOME_AWARENESS: { title: 'Reconhecimento', description: 'Mostrar o conteúdo para o maior número de pessoas do público.' },
  OUTCOME_TRAFFIC: { title: 'Tráfego', description: 'Levar as pessoas para um link: site, inscrição ou página de vendas.' },
  OUTCOME_ENGAGEMENT: { title: 'Engajamento', description: 'Mais curtidas, comentários e compartilhamentos no post.' },
};

export const CTA_LABELS: Record<Cta, string> = {
  LEARN_MORE: 'Saiba mais', SIGN_UP: 'Cadastre-se', SUBSCRIBE: 'Assine', CONTACT_US: 'Fale conosco', APPLY_NOW: 'Candidate-se', DOWNLOAD: 'Baixar',
};

export const STATUS_LABELS: Record<EligiblePost['status'], string> = { approved: 'Aprovada', scheduled: 'Agendada', published: 'Publicada' };

// ── Datas: o Marcos escolhe dias; a campanha roda no fuso de São Paulo (sem horário de verão desde 2019).
export function spDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
}
export function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T12:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}
export const dayToStartIso = (day: string) => `${day}T00:00:00-03:00`;
export const dayToEndIso = (day: string) => `${day}T23:59:00-03:00`;
export function isoToDay(iso: string | null | undefined): string {
  if (!iso || Number.isNaN(Date.parse(iso))) return '';
  return spDay(new Date(iso));
}

// Rascunho completo a partir do que estiver salvo (o banco cria a linha com draft = '{}').
export function withDefaults(saved: Partial<CampaignDraft> | null | undefined, today: string = spDay()): CampaignDraft {
  const s = saved ?? {};
  const start = addDays(today, 1);
  return {
    budget_type: s.budget_type ?? 'daily',
    amount: s.amount ?? 20,
    starts_at: s.starts_at ?? dayToStartIso(start),
    ends_at: s.ends_at === undefined ? dayToEndIso(addDays(start, 6)) : s.ends_at,
    optimization_goal: s.optimization_goal,
    targeting: {
      advantage_audience: true, countries: ['BR'], regions: [], cities: [], age_min: 18, age_max: 65, genders: 'all', interests: [],
      ...(s.targeting ?? {}),
    },
    placements: { mode: 'auto', facebook: [], instagram: [], ...(s.placements ?? {}) },
  };
}

// Post já publicado no Instagram é impulsionado como está; o resto vira anúncio com a arte.
export function adModeFor(post: Pick<EligiblePost, 'ig_media_id'>): WizardAd['mode'] {
  return post.ig_media_id ? 'ig_post' : 'new_creative';
}

// Marca ou desmarca a peça (no máximo MAX_ADS); peça nova entra com os padrões.
export function toggleAd(ads: WizardAd[], post: EligiblePost): WizardAd[] {
  if (ads.some((a) => a.post_id === post.id)) return ads.filter((a) => a.post_id !== post.id);
  if (ads.length >= MAX_ADS) return ads;
  return [...ads, { post_id: post.id, mode: adModeFor(post), primary_text: '', headline: '', cta: 'LEARN_MORE', link_url: '' }];
}

export function thumbnailOf(post: Pick<EligiblePost, 'rendered_slides'>): string | null {
  return slideUrls(post.rendered_slides)[0] ?? null;
}

// ── Público
export function addLocation(t: TargetingDraft, loc: LocationOption): TargetingDraft {
  if (loc.type === 'country') {
    const code = loc.country_code ?? loc.key;
    return t.countries.includes(code) ? t : { ...t, countries: [...t.countries, code] };
  }
  if (loc.type === 'region') {
    return t.regions.some((r) => r.key === loc.key) ? t : { ...t, regions: [...t.regions, { key: loc.key, name: loc.name }] };
  }
  if (loc.type === 'city') {
    return t.cities.some((c) => c.key === loc.key) ? t : { ...t, cities: [...t.cities, { key: loc.key, name: loc.name, radius_km: 10 }] };
  }
  return t;
}
export function removeLocation(t: TargetingDraft, kind: 'country' | 'region' | 'city', key: string): TargetingDraft {
  if (kind === 'country') return { ...t, countries: t.countries.filter((c) => c !== key) };
  if (kind === 'region') return { ...t, regions: t.regions.filter((r) => r.key !== key) };
  return { ...t, cities: t.cities.filter((c) => c.key !== key) };
}
export function addInterest(t: TargetingDraft, i: InterestOption): TargetingDraft {
  return t.interests.some((x) => x.id === i.id) ? t : { ...t, interests: [...t.interests, { id: i.id, name: i.name }] };
}
export function removeInterest(t: TargetingDraft, id: string): TargetingDraft {
  return { ...t, interests: t.interests.filter((x) => x.id !== id) };
}
export const COUNTRY_NAMES: Record<string, string> = { BR: 'Brasil', PT: 'Portugal', US: 'Estados Unidos' };

// ── Orçamento: quanto pode gastar no total (null = diário sem término).
export function budgetTotal(d: Pick<CampaignDraft, 'budget_type' | 'amount' | 'starts_at' | 'ends_at'>): { total: number | null; days: number | null } {
  if (d.budget_type === 'lifetime') return { total: d.amount, days: null };
  const start = isoToDay(d.starts_at);
  const end = isoToDay(d.ends_at);
  if (!start || !end || end < start) return { total: null, days: null };
  const days = Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${start}T12:00:00Z`)) / 86_400_000) + 1;
  return { total: Math.round(d.amount * days * 100) / 100, days };
}

// ── Validação: a do servidor, distribuída pelos passos.
export function draftErrors(state: WizardState, posts: EligiblePost[], now: Date = new Date()): string[] {
  const ads: AdRow[] = state.ads.map((a, i) => ({
    id: String(i), post_id: a.post_id, mode: a.mode, primary_text: a.primary_text || null, headline: a.headline || null, cta: a.cta, link_url: a.link_url || null,
  }));
  const rows: PostRow[] = posts.map((p) => ({ id: p.id, format: p.format, ig_media_id: p.ig_media_id, rendered_slides: p.rendered_slides }));
  return validateDraft({ id: state.id, name: state.name, objective: state.objective, draft: state.draft }, ads, rows, now);
}

const STEP_OF: Array<[RegExp, number]> = [
  [/^Escolha ao menos uma peça|^No máximo|não encontrada ou não aprovada/, 1],
  [/^Peça \d+:/, 6],
  [/^Dê um nome|^Escolha o objetivo|meta de otimização/, 2],
  [/orçamento|Orçamento|início|término/, 3],
  [/local|idade|Complete o público/, 4],
  [/posicionamento/, 5],
];
export function stepOfError(msg: string): number {
  return STEP_OF.find(([re]) => re.test(msg))?.[1] ?? 7;
}
export function problemsByStep(errors: string[]): Record<number, string[]> {
  const out: Record<number, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
  for (const e of errors) out[stepOfError(e)].push(e);
  return out;
}
// Pode sair do passo `step` se nada falta nele nem nos anteriores.
export function canAdvance(step: number, errors: string[]): boolean {
  const by = problemsByStep(errors);
  for (let s = 1; s <= step; s++) if (by[s].length) return false;
  return true;
}

// Lista de CTAs em ordem de exibição (o primeiro é o padrão).
export const CTA_OPTIONS: ReadonlyArray<{ value: Cta; label: string }> = CTAS.map((c) => ({ value: c, label: CTA_LABELS[c] }));
