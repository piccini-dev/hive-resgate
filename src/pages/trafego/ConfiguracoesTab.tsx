// Configurações do Tráfego: conta de anúncio, Instagram e teto mensal.
// A Página do Facebook é encontrada pelo servidor no bloco 12.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadError, Loading } from '@/components/shared/LoadState';
import {
  getTrafficSettings,
  listAdAccounts,
  listInstagramAccounts,
  NO_CONNECTION_MSG,
  type TrafficSettings,
  type AdAccountOption,
  type InstagramOption,
} from '@/lib/traffic';

export function ConfiguracoesTab({ onSaved }: { onSaved?: () => void }) {
  const [settings, setSettings] = useState<TrafficSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [adAccounts, setAdAccounts] = useState<AdAccountOption[]>([]);
  const [instagramAccounts, setInstagramAccounts] = useState<InstagramOption[]>([]);
  const [adAccountId, setAdAccountId] = useState('');
  const [igUserId, setIgUserId] = useState('');
  const [cap, setCap] = useState('');

  const recarregar = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [current, accounts, instagrams] = await Promise.all([
        getTrafficSettings(),
        listAdAccounts(),
        listInstagramAccounts(),
      ]);
      setSettings(current);
      setAdAccounts(accounts);
      setInstagramAccounts(instagrams);
      setAdAccountId(current?.ad_account_id ?? '');
      setIgUserId(current?.ig_user_id ?? '');
      setCap(current?.monthly_cap == null ? '' : String(current.monthly_cap));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  void onSaved;

  if (loading) return <Loading what="a configuração do tráfego" />;
  if (error) return <LoadError what="a configuração do tráfego" onRetry={recarregar} />;

  if (settings === null) {
    return (
      <div className="mx-auto max-w-6xl p-6 lg:p-8">
        <div data-testid="traffic-no-connection" className="space-y-4">
          <p className="text-sm text-muted-foreground">{NO_CONNECTION_MSG}</p>
          <Button asChild variant="accent">
            <Link to="/configuracoes">Ir para Contas</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <form
        data-testid="traffic-settings"
        className="max-w-xl space-y-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="space-y-2">
          <Label htmlFor="traffic-ad-account">Conta de anúncio</Label>
          <Select
            value={adAccountId || undefined}
            onValueChange={setAdAccountId}
            disabled={adAccounts.length === 0}
          >
            <SelectTrigger id="traffic-ad-account" data-testid="traffic-ad-account" aria-label="Conta de anúncio">
              <SelectValue placeholder="Escolha a conta de anúncio" />
            </SelectTrigger>
            <SelectContent>
              {adAccounts.map((account) => (
                <SelectItem key={account.fb_account_id} value={account.fb_account_id}>
                  {account.name ?? account.fb_account_id}{account.account_status !== 1 ? ' · inativa' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {adAccounts.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhuma conta de anúncio sincronizada. Sincronize em Configurações › Contas.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="traffic-ig">Instagram que anuncia</Label>
          <Select
            value={igUserId || undefined}
            onValueChange={setIgUserId}
            disabled={instagramAccounts.length === 0}
          >
            <SelectTrigger id="traffic-ig" data-testid="traffic-ig" aria-label="Instagram que anuncia">
              <SelectValue placeholder="Escolha o Instagram" />
            </SelectTrigger>
            <SelectContent>
              {instagramAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>{account.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {instagramAccounts.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhum Instagram conectado. Conecte em Configurações › Contas.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="traffic-cap">Teto mensal (R$)</Label>
          <Input
            id="traffic-cap"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            data-testid="traffic-cap"
            value={cap}
            onChange={(event) => setCap(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            A Hive não cria nem ativa campanhas que passem desse valor no mês.
          </p>
        </div>

        <Button
          type="submit"
          variant="accent"
          data-testid="traffic-save"
          disabled={!adAccountId || !igUserId || !cap || !Number.isFinite(Number(cap)) || Number(cap) <= 0}
        >
          Salvar
        </Button>
      </form>
    </div>
  );
}
