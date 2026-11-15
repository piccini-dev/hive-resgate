// Configurações do Tráfego: conta de anúncio, Instagram e teto mensal.
// A Página do Facebook é encontrada pelo servidor no bloco 12.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadError, Loading } from '@/components/shared/LoadState';
import {
  getTrafficSettings,
  listAdAccounts,
  listInstagramAccounts,
  NO_CONNECTION_MSG,
  type TrafficSettings,
} from '@/lib/traffic';

export function ConfiguracoesTab({ onSaved }: { onSaved?: () => void }) {
  const [settings, setSettings] = useState<TrafficSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const recarregar = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [current] = await Promise.all([
        getTrafficSettings(),
        listAdAccounts(),
        listInstagramAccounts(),
      ]);
      setSettings(current);
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

  return <div className="mx-auto max-w-6xl p-6 lg:p-8" />;
}
