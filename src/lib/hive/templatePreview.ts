import { imageDims } from './assetLib';
import { loadHiveDesign } from './loadDesign';
import { composeM01, pickM01BgUrl } from './composeM01';
import { composeM02, type M02Asset } from './composeM02';
import { composeM03 } from './composeM03';
import { analyzeTextZone } from './imageZone';
import { imageKind } from '@/lib/campaign/produce';
import { renderFabricToDataUrl } from '@/lib/templates/renderPost';

export interface VisualChoice { id: string; name: string; url: string | null; kind: ReturnType<typeof imageKind>; compatible: boolean; error?: string }
export async function visualChoices(text: string, decision: Record<string, unknown> | null, canvas: {w:number;h:number}, alive = () => true, onChoice?: (choice:VisualChoice)=>void): Promise<VisualChoice[]> {
  const d = await loadHiveDesign(), out: VisualChoice[] = [];
  const currentKind = imageKind(decision?.variant as string | null);
  for (const recipe of d.variacoes.filter(r => ['M01','M02','M03'].includes(r.manifestacao_id ?? ''))) {
    if (!alive()) break;
    const kind = imageKind(recipe.id), compatible = kind === currentKind;
    const choice: VisualChoice = { id: recipe.id, name: recipe.nome.replace(/^M\d+-[A-Z]\s*[·:-]?\s*/, ''), kind, compatible, url: null };
    let timer:ReturnType<typeof setTimeout>|undefined;
    try {
      await Promise.race([(async()=>{
      const base = { recipe, text, canvas, colors:d.colors, spiralUrl:d.spiralUrl, highlight:decision?.highlight as {target:string}|null };
      let assets = d.assets;
      const ref = decision?.image_ref as string | undefined;
      if (compatible && kind === 'bg' && ref) { const dims=await imageDims(ref),a={url:ref,width:dims.w,height:dims.h}; assets=recipe.id==='M01-D'?{...assets,photos:[a]}:{...assets,textures:[a]}; }
      const originalAsset = compatible && kind === 'photo' ? (decision?.asset ?? (ref ? {url:ref,espaco_texto:'esquerda'} : null)) as (M02Asset & {photo_generation_id?:string}) | null : null;
      const dims = originalAsset?.url && (!originalAsset.width || !originalAsset.height) ? await imageDims(originalAsset.url) : null;
      const asset = originalAsset ? {...originalAsset,width:originalAsset.width??dims?.w,height:originalAsset.height??dims?.h} : null;
      const slide = recipe.manifestacao_id === 'M03' ? composeM03({...base,diagram:decision?.diagram as {poleA?:string;poleB?:string}})
        : recipe.manifestacao_id === 'M02' ? composeM02({...base,subtitle:decision?.subtitle as string|null,asset:asset ? {...asset,preComposed:asset.origin==='generated'&&!!asset.photo_generation_id}:null})
        : composeM01({...base,assets,layout:kind==='bg'?await analyzeTextZone(pickM01BgUrl(recipe,assets,text)):null});
      const url = await renderFabricToDataUrl(slide,{width:canvas.w,height:canvas.h,multiplier:.2,format:'jpeg'});
      if (!url) throw new Error('Prévia indisponível.');
      if (!choice.error) choice.url = url;
      })(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('A prévia demorou para carregar. Tente abrir os formatos novamente.')),10000);})]);
    } catch(e) { choice.error = (e as Error).message; }
    finally { if(timer)clearTimeout(timer); }
    out.push(choice); if(alive())onChoice?.(choice);
  }
  return out;
}
