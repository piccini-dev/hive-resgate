import { useEffect, useState } from 'react';
import { identityApi } from '@/lib/identityApi';

// Mostra o contexto registrado na origem do conhecimento, não o perfil atual
// nem o destino futuro dos posts. Reutilizar a base não troca esse registro.
export function BaseContextSummary({ snapshotId }: { snapshotId?: string | null }) {
  const [loaded, setLoaded] = useState<{ id: string; summary: string | null } | null>(null);
  useEffect(() => {
    let alive = true;
    if (snapshotId) void identityApi.snapshot(snapshotId)
      .then(s => { if (alive) setLoaded({ id: snapshotId, summary: s?.summary ?? null }); })
      .catch(() => { if (alive) setLoaded({ id: snapshotId, summary: null }); });
    return () => { alive = false; };
  }, [snapshotId]);
  const summary = !snapshotId ? 'Contexto de origem não registrado nesta base.'
    : loaded?.id !== snapshotId ? 'Consultando o contexto de origem…'
      : loaded.summary || 'Não foi possível recuperar o contexto de origem.';
  return <p className="text-xs text-muted-foreground" data-testid="content-context"><span className="font-medium">Contexto de origem: </span>{summary}</p>;
}
