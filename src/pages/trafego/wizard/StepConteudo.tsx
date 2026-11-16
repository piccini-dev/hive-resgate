import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAX_ADS, type StepProps } from '@/lib/traffic-wizard';

export function StepConteudo({ state, posts, onChange }: StepProps) {
  const [q, setQ] = useState('');
  const [rede, setRede] = useState<'todas' | 'instagram' | 'linkedin'>('todas');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="traffic-post-search" className="sr-only">Buscar peça</Label>
        <Input
          id="traffic-post-search"
          data-testid="traffic-post-search"
          placeholder="Buscar pelo título"
          className="min-w-0 basis-full sm:basis-52 sm:flex-1"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
        <Button type="button" size="sm" variant={rede === 'todas' ? 'accent' : 'outline'} aria-pressed={rede === 'todas'} data-testid="traffic-filter-todas" onClick={() => setRede('todas')}>
          Todas
        </Button>
        <Button type="button" size="sm" variant={rede === 'instagram' ? 'accent' : 'outline'} aria-pressed={rede === 'instagram'} data-testid="traffic-filter-instagram" onClick={() => setRede('instagram')}>
          Instagram
        </Button>
        <Button type="button" size="sm" variant={rede === 'linkedin' ? 'accent' : 'outline'} aria-pressed={rede === 'linkedin'} data-testid="traffic-filter-linkedin" onClick={() => setRede('linkedin')}>
          LinkedIn
        </Button>
        <p data-testid="traffic-selected-count" className="text-sm text-muted-foreground">
          {state.ads.length} de {MAX_ADS} escolhidas
        </p>
      </div>
    </div>
  );
}
