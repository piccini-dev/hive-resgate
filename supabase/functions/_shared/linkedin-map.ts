// Mapeamento puro de um post do LinkedIn (scraper Apify apimaestro/linkedin-profile-posts)
// para a base de posts (o que foi DITO, para não repetir) e as métricas PÚBLICAS do post
// (reações, comentários, compartilhamentos). Impressões/alcance só o autor vê: não vêm daqui.
import { quoteFromCaption } from './instagram-map.ts';

export interface LiScraped {
  // O scraper devolve o URN como objeto ({ activity_urn, share_urn, ugcPost_urn }); versões antigas, como texto.
  urn?: string | { activity_urn?: string | null; share_urn?: string | null; ugcPost_urn?: string | null } | null; url?: string; text?: string; post_type?: string;
  posted_at?: { date?: string; timestamp?: number } | string | null;
  reshared_post?: unknown; media?: unknown;
  // Números públicos. O formato muda entre versões do scraper: liStats aceita os conhecidos.
  stats?: Record<string, unknown> | null;
  [k: string]: unknown;
}

// Perfil: aceita URL completa ou só o usuário.
export function liUsername(profile: string): string | null {
  const s = profile.trim();
  const m = s.match(/linkedin\.com\/in\/([^/?#]+)/i);
  const u = decodeURIComponent((m ? m[1] : s).replace(/^@/, '')).trim();
  return /^[\p{L}\d\-_.%]{2,100}$/u.test(u) ? u : null;
}

export function liPostedAt(p: LiScraped): string | null {
  const v = p.posted_at;
  if (!v) return null;
  if (typeof v === 'string') { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d.toISOString(); }
  if (typeof v.timestamp === 'number') return new Date(v.timestamp < 1e12 ? v.timestamp * 1000 : v.timestamp).toISOString();
  if (v.date) { const d = new Date(v.date.replace(' ', 'T')); return Number.isNaN(d.getTime()) ? null : d.toISOString(); }
  return null;
}

export function liKey(p: LiScraped): string | null {
  const u = p.urn;
  if (typeof u === 'string' && u) return u;
  if (u && typeof u === 'object') {
    const id = u.activity_urn ?? u.ugcPost_urn ?? u.share_urn;
    if (id) return String(id).startsWith('urn:') ? String(id) : `urn:li:activity:${id}`;
  }
  return p.url?.split('?')[0] ?? null;
}

// Só o que o autor ESCREVEU: repost sem comentário próprio não entra.
export function liMapPost(p: LiScraped): { key: string; quote: string; text: string; posted_at: string | null; url: string | null; post_type: string } | null {
  const text = String(p.text ?? '').trim();
  const key = liKey(p);
  if (!key || text.length < 15) return null;
  return { key, quote: quoteFromCaption(text) || text.slice(0, 120), text, posted_at: liPostedAt(p), url: p.url?.split('?')[0] ?? null, post_type: p.post_type ?? (p.reshared_post ? 'quote' : 'regular') };
}

// Texto normalizado para reconhecer o MESMO post: o publicado pela plataforma guarda
// frase+legenda e o LinkedIn mostra só a legenda; hashtags/links/espaços variam.
export function liNormText(t: string | null | undefined): string {
  return String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/https?:\/\/\S+/g, '').replace(/#[\p{L}\d_]+/gu, '').replace(/[^\p{L}\d]+/gu, ' ').trim().slice(0, 160);
}

// Este post importado é um post que a PLATAFORMA já publicou? (mesmo dia ±1 e o texto
// de um contém o começo do outro). Devolve o id do post da plataforma.
export function liMatchPlatform(p: { text: string; posted_at: string | null }, platform: Array<{ id: string; caption: string | null; published_at: string | null }>): string | null {
  if (!p.posted_at) return null;
  const t = liNormText(p.text).slice(0, 100);
  if (t.length < 30) return null;
  const at = new Date(p.posted_at).getTime();
  for (const x of platform) {
    if (!x.published_at || Math.abs(new Date(x.published_at).getTime() - at) > 1.5 * 86_400_000) continue;
    const c = liNormText(x.caption);
    if (c.includes(t.slice(0, 80)) || t.includes(c.slice(0, 80))) return x.id;
  }
  return null;
}

// Métricas públicas do post (post_metrics, source 'linkedin_apify'). null = o scraper não trouxe números.
//   likes    = total de reações (curtir, parabenizar, amei…);
//   comments = comentários; shares = compartilhamentos (reposts).
export function liStats(p: LiScraped): { likes: number | null; comments: number | null; shares: number | null; raw: Record<string, unknown> } | null {
  const st = (p.stats && typeof p.stats === 'object' ? p.stats : {}) as Record<string, unknown>;
  const num = (...vs: unknown[]): number | null => {
    for (const v of vs) { const n = typeof v === 'string' ? Number(v.replace(/\D/g, '')) : v; if (typeof n === 'number' && Number.isFinite(n) && n >= 0) return Math.round(n); }
    return null;
  };
  const likes = num(st.total_reactions, st.reactions, st.totalReactionCount, st.likes, p.numLikes, p.totalReactionCount, p.likes_count);
  const comments = num(st.comments, st.comment_count, st.numComments, p.numComments, p.comments_count);
  const shares = num(st.reposts, st.shares, st.repost_count, st.numShares, p.numShares, p.reposts_count);
  if (likes === null && comments === null && shares === null) return null;
  return { likes, comments, shares, raw: Object.keys(st).length ? st : { numLikes: p.numLikes, numComments: p.numComments, numShares: p.numShares } };
}
