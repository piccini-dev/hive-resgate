import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { visualChoices, type VisualChoice } from '@/lib/hive/templatePreview';

export function VisualTemplateGallery({text,decision,canvas={w:1080,h:1350},disabled,onSelect}:{text:string;decision:Record<string,unknown>|null;canvas?:{w:number;h:number};disabled:boolean;onSelect:(id:string)=>void}) {
  const [choices,setChoices]=useState<VisualChoice[]>([]),[loading,setLoading]=useState(true),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
  useEffect(()=>{let alive=true;setLoading(true);setChoices([]);setFailed(false);void visualChoices(text,decision,canvas,()=>alive,c=>{if(alive)setChoices(old=>[...old,c]);}).then(c=>{if(alive)setChoices(c);}).catch(()=>{if(alive)setFailed(true);}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};
  // O componente representa uma peça; atualiza quando o texto, modelo ou imagem mudam.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[text,decision?.variant,decision?.image_ref,canvas.w,canvas.h,retry]);
  return <div className="space-y-3" data-testid="template-gallery">
    <p className="text-xs text-muted-foreground">Escolha pelo formato. As miniaturas usam o seu texto. Quando for necessária uma nova imagem, a comparação mostrará o resultado antes de aplicar.</p>
    {loading&&<p role="status" className="flex gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin"/>Preparando formatos…</p>}
    {failed&&<Button variant="outline" onClick={()=>setRetry(n=>n+1)}>Tentar carregar formatos</Button>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{choices.map(c=><button key={c.id} disabled={disabled||!c.url||c.id===decision?.variant} onClick={()=>onSelect(c.id)} className="space-y-2 rounded-lg border bg-background p-2 text-left text-xs hover:border-accent disabled:opacity-60" data-testid="template-option" data-template={c.id}>
      {c.url?<img src={c.url} alt={`Formato ${c.name}`} className="w-full rounded object-contain"/>:<p className="p-3">{c.error}</p>}
      <span className="block font-semibold">{c.name}</span><span className="block text-muted-foreground">{c.kind==='photo'?'Com foto':c.kind==='bg'?'Com fundo':'Sem foto'} · {c.compatible?'mantém a imagem':'nova composição de imagem'}</span>
      <span className="block text-[10px] text-muted-foreground">{c.id}{c.id===decision?.variant?' · modelo atual':''}</span>
    </button>)}</div>
  </div>;
}
