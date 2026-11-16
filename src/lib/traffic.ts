// Módulo de Tráfego (docs/plano/PLANO.md): configuração da conta que anuncia.
// Mora em meta_connections (uma linha por usuário, criada ao conectar o Facebook).
// O token NUNCA é lido aqui: só as colunas do tráfego.
import { db, getCurrentUserId } from '@/lib/db';
import type { SocialAccount } from '@/types/campaign';
import { TOTAL_STEPS, withDefaults, type CampaignDraft, type Cta, type EligiblePost, type Objective, type WizardAd, type WizardState } from '@/lib/traffic-wizard';

export interface TrafficSettings {
  ad_account_id: string | null;
  page_id: string | null;
  ig_user_id: string | null;
  monthly_cap: number | null;
}

export interface TrafficSettingsInput {
  ad_account_id: string;
  ig_user_id: string;
  monthly_cap: number;
}

export interface AdAccountOption { fb_account_id: string; name: string | null; account_status: number | null; currency: string | null }
export interface InstagramOption { id: string; label: string }

export const NO_CONNECTION_MSG = 'Conecte o Facebook em Configurações › Contas antes de configurar o tráfego.';

// Configurado = conta de anúncio + Instagram + teto. A Página é achada pelo servidor (bloco 12).
export function isTrafficConfigured(s: TrafficSettings | null): boolean {
  return !!s && !!s.ad_account_id && !!s.ig_user_id && (s.monthly_cap ?? 0) > 0;
}

// null = o Facebook ainda não foi conectado (não existe linha em meta_connections).
export async function getTrafficSettings(): Promise<TrafficSettings | null> {
  const row = await db.selectOne<Omit<TrafficSettings, 'monthly_cap'> & { monthly_cap: number | string | null }>(
    'meta_connections', { select: 'ad_account_id,page_id,ig_user_id,monthly_cap' },
  );
  if (!row) return null;
  return { ...row, monthly_cap: row.monthly_cap == null ? null : Number(row.monthly_cap) };
}

export async function saveTrafficSettings(input: TrafficSettingsInput, current: TrafficSettings | null): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Sessão expirada. Entre de novo.');
  if (!input.ad_account_id) throw new Error('Escolha a conta de anúncio.');
  if (!input.ig_user_id) throw new Error('Escolha o Instagram que anuncia.');
  if (!Number.isFinite(input.monthly_cap) || input.monthly_cap <= 0) throw new Error('O teto mensal precisa ser maior que zero.');
  const patch: Record<string, unknown> = {
    ad_account_id: input.ad_account_id,
    ig_user_id: input.ig_user_id,
    monthly_cap: input.monthly_cap,
    updated_at: new Date().toISOString(),
  };
  // A Página depende do Instagram: trocou o Instagram, o servidor acha a Página de novo.
  if (current?.ig_user_id !== input.ig_user_id) patch.page_id = null;
  const rows = await db.update<{ user_id: string }>('meta_connections', { user_id: `eq.${userId}` }, patch);
  if (rows.length === 0) throw new Error(NO_CONNECTION_MSG);
}

export async function listAdAccounts(): Promise<AdAccountOption[]> {
  return db.select<AdAccountOption>('meta_ad_accounts', { select: 'fb_account_id,name,account_status,currency', order: 'name.asc' });
}

export async function listInstagramAccounts(): Promise<InstagramOption[]> {
  const rows = await db.select<Pick<SocialAccount, 'label' | 'instagram_business_account_id'>>('social_accounts', {
    select: 'label,instagram_business_account_id', platform: 'eq.instagram', order: 'created_at.asc',
  });
  return rows.filter((r) => !!r.instagram_business_account_id).map((r) => ({ id: r.instagram_business_account_id as string, label: r.label }));
}

// ── Wizard de Nova campanha (bloco 13): rascunho em traffic_campaigns/traffic_ads e peças elegíveis.
// Só escreve enquanto a campanha é rascunho (draft/failed); depois disso quem mexe é a traffic-meta.
const CAMPAIGN_COLS = 'id,name,objective,status,step,draft,error,updated_at';
const EDITABLE = 'in.(draft,failed)';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface TrafficCampaignRow {
  id: string;
  name: string;
  objective: Objective | null;
  status: 'draft' | 'creating' | 'paused' | 'active' | 'ended' | 'failed';
  step: number;
  draft: Partial<CampaignDraft>;
  error: string | null;
  updated_at: string;
}

type AdDbRow = { post_id: string; mode: WizardAd['mode']; primary_text: string | null; headline: string | null; cta: Cta | null; link_url: string | null };

// A view já filtra aprovada/agendada/publicada com arte; a RLS de user_posts deixa só as do usuário.
export async function listEligiblePosts(): Promise<EligiblePost[]> {
  return db.select<EligiblePost>('traffic_eligible_posts', {
    select: 'id,title,platform,format,status,rendered_slides,published_url,published_at,ig_media_id',
    order: 'published_at.desc.nullslast,title.asc',
  });
}

export async function listDraftCampaigns(): Promise<TrafficCampaignRow[]> {
  return db.select<TrafficCampaignRow>('traffic_campaigns', { select: CAMPAIGN_COLS, status: EDITABLE, order: 'updated_at.desc' });
}

export async function createDraftCampaign(): Promise<string> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Sessão expirada. Entre de novo.');
  const [row] = await db.insert<{ id: string }>('traffic_campaigns', { user_id: userId, name: '' });
  return row.id;
}

// null = id inválido ou campanha que não existe (ou não é do usuário).
export async function loadWizardCampaign(id: string): Promise<{ campaign: TrafficCampaignRow; ads: WizardAd[] } | null> {
  if (!UUID.test(id)) return null;
  const campaign = await db.selectOne<TrafficCampaignRow>('traffic_campaigns', { select: CAMPAIGN_COLS, id: `eq.${id}` });
  if (!campaign) return null;
  const rows = await db.select<AdDbRow>('traffic_ads', {
    select: 'post_id,mode,primary_text,headline,cta,link_url', campaign_id: `eq.${id}`, order: 'created_at.asc',
  });
  const ads = rows.map((r) => ({
    post_id: r.post_id, mode: r.mode, primary_text: r.primary_text ?? '', headline: r.headline ?? '', cta: r.cta ?? 'LEARN_MORE', link_url: r.link_url ?? '',
  }));
  return { campaign, ads };
}

export function toWizardState(campaign: TrafficCampaignRow, ads: WizardAd[]): WizardState {
  return {
    id: campaign.id,
    name: campaign.name,
    objective: campaign.objective,
    step: Math.min(Math.max(campaign.step || 1, 1), TOTAL_STEPS),
    draft: withDefaults(campaign.draft),
    ads,
  };
}

// Grava o passo inteiro: campanha e a lista de anúncios (troca a lista toda, na ordem escolhida).
export async function saveWizard(s: WizardState): Promise<void> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Sessão expirada. Entre de novo.');
  const rows = await db.update<{ id: string }>('traffic_campaigns', { id: `eq.${s.id}`, status: EDITABLE }, {
    name: s.name.trim(), objective: s.objective, step: s.step, draft: s.draft, updated_at: new Date().toISOString(),
  });
  if (rows.length === 0) throw new Error('Esta campanha já foi enviada para a Meta e não pode mais ser editada aqui.');
  await db.delete('traffic_ads', { campaign_id: `eq.${s.id}` });
  if (s.ads.length === 0) return;
  // created_at crescente guarda a ordem das peças (a traffic-meta numera os anúncios por ela).
  const base = Date.now();
  await db.insert('traffic_ads', s.ads.map((a, i) => ({
    user_id: userId, campaign_id: s.id, post_id: a.post_id, mode: a.mode,
    primary_text: a.primary_text.trim() || null, headline: a.headline.trim() || null, cta: a.cta, link_url: a.link_url.trim() || null,
    created_at: new Date(base + i).toISOString(),
  })), { returning: false });
}

export async function deleteDraftCampaign(id: string): Promise<void> {
  await db.delete('traffic_campaigns', { id: `eq.${id}`, status: EDITABLE });
}
