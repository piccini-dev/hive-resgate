import type {EditorApi} from './useEditor';
import {Button} from '@/components/ui/button';
export function SelectionToolbar({api}:{api:EditorApi}){
  if(!api.selectedCount)return <p className="border-b px-3 py-1 text-xs text-muted-foreground">Selecione um elemento. Shift + clique adiciona elementos à seleção.</p>;
  return <div className="flex flex-wrap items-center gap-2 border-b px-3 py-1" data-testid="selection-toolbar">
    <span className="text-xs text-muted-foreground">{api.selectedCount>1?`${api.selectedCount} elementos selecionados`:'Elemento selecionado'}</span>
    <select aria-label="Alinhar seleção" className="rounded border bg-background p-1 text-xs" value="" onChange={e=>{api.editSelection(e.target.value as Parameters<typeof api.editSelection>[0]);}}>
      <option value="" disabled>Alinhar…</option>{([['left','À esquerda'],['center','Ao centro'],['right','À direita'],['top','No topo'],['middle','No meio'],['bottom','Na base']] as const).map(([v,l])=><option key={v} value={v}>{l}</option>)}
    </select>
    {api.selectedCount>=3&&<><Button size="sm" variant="ghost" className="h-7 text-xs" onClick={()=>api.editSelection('horizontal')}>Espaçar na horizontal</Button><Button size="sm" variant="ghost" className="h-7 text-xs" onClick={()=>api.editSelection('vertical')}>Espaçar na vertical</Button></>}
    {api.selectedCount>1&&<Button size="sm" variant="ghost" className="h-7 text-xs" onClick={()=>api.editSelection('group')}>Agrupar</Button>}
    {api.activeIsGroup&&<Button size="sm" variant="ghost" className="h-7 text-xs" onClick={()=>api.editSelection('ungroup')}>Desagrupar</Button>}
    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={api.deleteActive}>Excluir seleção</Button>
  </div>;
}
