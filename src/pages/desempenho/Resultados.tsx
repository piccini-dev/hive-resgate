// Resultados — /desempenho. Junta o desempenho das peças (aba Desempenho) e a
// jornada relacional ACJ (aba Jornada ACJ). A aba vem de ?aba=.
import { useSearchParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegistroVivo } from '@/pages/aprendizado/RegistroVivo';
import { Performance } from './Performance';

type Aba = 'desempenho' | 'acj';
const ABAS: readonly Aba[] = ['desempenho', 'acj'];

export function Resultados() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('aba');
  const aba: Aba = ABAS.includes(raw as Aba) ? (raw as Aba) : 'desempenho';
  const setAba = (v: string) => setParams(v === 'desempenho' ? {} : { aba: v }, { replace: true });

  return (
    <Tabs value={aba} onValueChange={setAba} data-testid="resultados">
      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-8 lg:pt-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-accent" />
          <h1 className="font-display text-3xl font-bold">Resultados</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Como as peças foram recebidas e o que cada movimento da jornada produziu.
        </p>
        <TabsList className="mt-4">
          <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
          <TabsTrigger value="acj">Jornada ACJ</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="desempenho" className="mt-0"><Performance /></TabsContent>
      <TabsContent value="acj" className="mt-0"><RegistroVivo /></TabsContent>
    </Tabs>
  );
}
