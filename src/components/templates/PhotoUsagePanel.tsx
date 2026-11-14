import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { listMarcosPhotos, setPhotoUsage, type MarcosPhotoRow } from '@/lib/hive/assetLib';
import { photoUsage, type PhotoUsage } from '@/lib/hive/imagePolicy';

export function PhotoUsagePanel() {
  const [photos, setPhotos] = useState<MarcosPhotoRow[]>([]), [failed, setFailed] = useState(false), [busy, setBusy] = useState<string | null>(null);
  async function load() { setFailed(false); try { setPhotos(await listMarcosPhotos()); } catch { setFailed(true); } }
  useEffect(() => { void load(); }, []);
  return <details className="rounded-xl border bg-card p-4" data-testid="photo-usage-panel">
    <summary className="cursor-pointer font-semibold">Fotos e geração</summary>
    <div className="mt-4 space-y-4 text-sm">
      <p>Defina quais fotos servem apenas para ensinar a identidade e quais podem aparecer novamente nas peças. Novas fotos de referência entram como referência apenas. Uma peça já aprovada mantém sua imagem.</p>
      <Button variant="outline" asChild><Link to="/hive/fotografia">Referências e aprovação dos estilos de geração</Link></Button>
      {failed ? <Button variant="outline" onClick={() => void load()}>Tentar carregar fotos novamente</Button> : !photos.length ? <p className="text-muted-foreground">Nenhuma foto de referência disponível nesta marca.</p> :
        <div className="grid max-h-[28rem] gap-3 overflow-y-auto sm:grid-cols-2">{photos.map(photo => <div key={photo.id} className="flex items-center gap-3 rounded-lg border p-3" data-testid="photo-usage-row">
          <img src={photo.url} alt={photo.title} className="h-24 w-20 rounded object-cover"/>
          <div className="min-w-0 flex-1"><p className="font-medium">{photo.title}</p><label className="mt-2 block text-xs">Uso permitido<select aria-label={`Uso da foto ${photo.title}`} value={photoUsage(photo.semantic)} disabled={!!busy || photo.brand_id === null} className="mt-1 w-full rounded border bg-background p-2" onChange={async event => {
            const usage = event.target.value as PhotoUsage; setBusy(photo.id);
            try { await setPhotoUsage(photo, usage); await load(); toast.success('Regra da foto atualizada para novas peças.'); }
            catch(e) { toast.error((e as Error).message); await load(); } finally { setBusy(null); }
          }}><option value="reference_only">Somente referência para gerar novas fotos</option><option value="reusable">Pode ser reutilizada nas peças</option></select></label>
          </div>
        </div>)}</div>}
    </div>
  </details>;
}
