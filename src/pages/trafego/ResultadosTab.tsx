// Tráfego › Resultados: a análise do tráfego pago (Meta Ads) por conta do
// Instagram, que antes ficava no fim do comparativo de contas.
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useOps } from '@/lib/campaign/useOps';
import { accountStats } from '@/lib/campaign/accountCompare';
import { PaidTrafficSection } from '@/components/performance/PaidTrafficSection';

export function ResultadosTab() {
  const { ops, posts } = useOps();
  const igAccounts = useMemo(() => (ops?.accounts ?? []).filter((a) => a.platform === 'instagram').sort((a, b) => a.created_at.localeCompare(b.created_at)), [ops]);
  const stats = useMemo(() => igAccounts.map((a) => accountStats(a, posts, ops?.metrics ?? [])), [igAccounts, posts, ops]);
  // Contas pelo id do Instagram (a atribuição dos anúncios usa esse id) + orgânico pra cruzar.
  const paidAccounts = useMemo(() => igAccounts.map((a, i) => ({ id: a.instagram_business_account_id ?? '', username: stats[i]?.username ?? a.label, series: i })).filter((x) => x.id), [igAccounts, stats]);
  const organicRefs = useMemo(() => stats.map((s) => ({ username: s.username, followers: s.followers, posts: s.posts, avgInteractions: s.avgInteractions })), [stats]);

  if (!ops) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>;
  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8" data-testid="trafego-resultados">
      <PaidTrafficSection accounts={paidAccounts} organic={organicRefs} />
    </div>
  );
}
