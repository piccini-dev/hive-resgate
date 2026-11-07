// Como escrevo — /genesis. Junta a filosofia (Genesis, aba Princípios) e o ofício
// (Diretrizes, aba Ofício) num lugar só. A aba vem de ?aba=.
import { useSearchParams } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Directives } from '@/pages/directives/Directives';
import { Genesis } from './Genesis';

type Aba = 'principios' | 'oficio';
const ABAS: readonly Aba[] = ['principios', 'oficio'];

export function ComoEscrevo() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('aba');
  const aba: Aba = ABAS.includes(raw as Aba) ? (raw as Aba) : 'principios';
  const setAba = (v: string) => setParams(v === 'principios' ? {} : { aba: v }, { replace: true });

  return (
    <Tabs value={aba} onValueChange={setAba} data-testid="como-escrevo">
      <div className="mx-auto max-w-[1080px] px-6 pt-8">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-accent" />
          <h1 className="font-display text-3xl font-bold">Como escrevo</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Os princípios de como a Hive pensa e o ofício de como ela escreve. O que você editar aqui muda a voz de todo conteúdo.
        </p>
        <TabsList className="mt-4">
          <TabsTrigger value="principios">Princípios</TabsTrigger>
          <TabsTrigger value="oficio">Ofício</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="principios" className="mt-0"><Genesis /></TabsContent>
      <TabsContent value="oficio" className="mt-0"><Directives /></TabsContent>
    </Tabs>
  );
}
