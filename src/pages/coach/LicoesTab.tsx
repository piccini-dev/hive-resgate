// Aba "Lições" do Coach: as regras que a IA destilou das correções e conversas. As ativas entram no prompt; o Marcos desliga a que não fizer sentido.

import { useEffect, useState } from 'react';
import type { AiLearning } from '@/types';
import { aiApi } from '@/lib/api';
import { toast } from 'sonner';

export function LicoesTab(): JSX.Element {
  const [learnings, setLearnings] = useState<AiLearning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const l = await aiApi.listLearnings();
        setLearnings(l);
      } catch (e) {
        console.error(e);
        toast.error('Falha ao carregar as lições');
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  async function toggle(l: AiLearning) {
    try {
      await aiApi.toggleLearning(l.id, !l.ativo);
      setLearnings((cur) => cur.map((x) => (x.id === l.id ? { ...x, ativo: !x.ativo } : x)));
      toast.success(!l.ativo ? 'Lição religada' : 'Lição desligada — sai do próximo prompt');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao alterar');
    }
  }

  return (
    <div>
      {loading && <span>Carregando...</span>}
      {learnings.map((l) => (
        <button key={l.id} onClick={() => void toggle(l)}>{l.texto}</button>
      ))}
    </div>
  );
}
