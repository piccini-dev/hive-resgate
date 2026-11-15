// Módulo de Tráfego (docs/plano/PLANO.md): configuração da conta que anuncia.
// Mora em meta_connections (uma linha por usuário, criada ao conectar o Facebook).
// O token NUNCA é lido aqui: só as colunas do tráfego.
import { db, getCurrentUserId } from '@/lib/db';
import type { SocialAccount } from '@/types/campaign';

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
