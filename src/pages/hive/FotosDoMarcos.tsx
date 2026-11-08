// Fotos do Marcos — /hive/fotografia. Junta o motor fotográfico (referências, estilos e
// fotos geradas) e a biblioteca de fotos reais (aba Fotos reais). A aba vem de ?aba=.
import { useSearchParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HiveMarcos } from './HiveMarcos';
import { PhotoEngine } from './PhotoEngine';

type Aba = 'motor' | 'reais';
const ABAS: readonly Aba[] = ['motor', 'reais'];

export function FotosDoMarcos() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('aba');
  const aba: Aba = ABAS.includes(raw as Aba) ? (raw as Aba) : 'motor';
  const setAba = (v: string) => setParams(v === 'motor' ? {} : { aba: v }, { replace: true });

  return (
    <Tabs value={aba} onValueChange={setAba} data-testid="fotos-do-marcos">
      <div className="mx-auto max-w-6xl px-6 pt-6 lg:px-8 lg:pt-8">
        <div className="flex items-center gap-2">
          <Camera className="h-6 w-6 text-accent" />
          <h1 className="font-display text-3xl font-bold">Fotos do Marcos</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          As fotos reais vêm primeiro. O motor só gera uma cena quando não há foto real adequada, e só com estilos que você aprovou.
        </p>
        <TabsList className="mt-4">
          <TabsTrigger value="motor">Motor fotográfico</TabsTrigger>
          <TabsTrigger value="reais">Fotos reais</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="motor" className="mt-0"><PhotoEngine /></TabsContent>
      <TabsContent value="reais" className="mt-0"><HiveMarcos /></TabsContent>
    </Tabs>
  );
}
