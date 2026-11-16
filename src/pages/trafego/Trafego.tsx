// Tráfego — /trafego. Módulo separado do conteúdo: anuncia na Meta as peças
// aprovadas, agendadas ou publicadas (docs/plano/PLANO.md). A aba vem de ?aba=.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadError, Loading } from '@/components/shared/LoadState';
import { getTrafficSettings, isTrafficConfigured, type TrafficSettings } from '@/lib/traffic';
import { ConfiguracoesTab } from './ConfiguracoesTab';
import { ResultadosTab } from './ResultadosTab';
import { NovaCampanha } from './wizard/NovaCampanha';

type Aba = 'campanhas' | 'nova' | 'resultados' | 'configuracoes';
const ABAS: readonly Aba[] = ['campanhas', 'nova', 'resultados', 'configuracoes'];

export function Trafego() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('aba');
  const aba: Aba = ABAS.includes(raw as Aba) ? (raw as Aba) : 'campanhas';
  const setAba = (v: string) => setParams(v === 'campanhas' ? {} : { aba: v }, { replace: true });

  // undefined = carregando; null = Facebook não conectado.
  const [settings, setSettings] = useState<TrafficSettings | null | undefined>(undefined);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setError(false);
    try { setSettings(await getTrafficSettings()); } catch { setError(true); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // Campanhas e Nova campanha só abrem com a configuração completa.
  function gated(content: ReactNode) {
    if (error) return <div className="mx-auto max-w-6xl p-6 lg:p-8"><LoadError what="a configuração do tráfego" onRetry={() => void load()} /></div>;
    if (settings === undefined) return <div className="mx-auto max-w-6xl p-6 lg:p-8"><Loading what="a configuração do tráfego" /></div>;
    if (!isTrafficConfigured(settings)) {
      return (
        <div className="mx-auto max-w-6xl p-6 lg:p-8">
          <div className="rounded-2xl border border-dashed p-8 text-center" data-testid="traffic-gate">
            <p className="font-display text-lg font-semibold">Falta configurar o tráfego</p>
            <p className="mt-1 text-sm text-muted-foreground">Escolha a conta de anúncio, o Instagram que anuncia e o teto mensal.</p>
            <Button variant="accent" className="mt-4" onClick={() => setAba('configuracoes')}>Configurar</Button>
          </div>
        </div>
      );
    }
    return content;
  }

  const soon = (texto: string, testid: string) => (
    <div className="mx-auto max-w-6xl p-6 lg:p-8">
      <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground" data-testid={testid}>{texto}</p>
    </div>
  );

  return (
    <Tabs value={aba} onValueChange={setAba} data-testid="trafego">
      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-8 lg:pt-8">
        <div className="flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-accent" />
          <h1 className="font-display text-3xl font-bold">Tráfego</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Anuncie no Facebook e no Instagram os conteúdos já aprovados da Hive.
        </p>
        <TabsList className="mt-4 h-auto flex-wrap">
          <TabsTrigger value="campanhas">Campanhas</TabsTrigger>
          <TabsTrigger value="nova">Nova campanha</TabsTrigger>
          <TabsTrigger value="resultados">Resultados</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="campanhas" className="mt-0">{gated(soon('As campanhas criadas pela Hive vão aparecer aqui.', 'traffic-campaigns-soon'))}</TabsContent>
      <TabsContent value="nova" className="mt-0">{gated(<NovaCampanha />)}</TabsContent>
      <TabsContent value="resultados" className="mt-0"><ResultadosTab /></TabsContent>
      <TabsContent value="configuracoes" className="mt-0"><ConfiguracoesTab onSaved={() => void load()} /></TabsContent>
    </Tabs>
  );
}
