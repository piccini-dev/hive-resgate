import * as fabric from 'fabric';
import {connectionPoints,pathForPoints,type Connection,type DiagramNode} from '@/lib/hive/diagramConnections';
type Named=fabric.FabricObject&{name?:string;beeConnector?:Connection};

/** Line legado vira Path visualmente equivalente, com pontas independentes. */
export function normalizeEditorLines(value:object):object{
  const copy=JSON.parse(JSON.stringify(value));
  const visit=(node:Record<string,unknown>)=>{
    if(String(node.type).toLowerCase()==='line'){
      const w=Math.abs(Number(node.x2)-Number(node.x1)),h=Math.abs(Number(node.y2)-Number(node.y1));
      const x=Number(node.x1)<=Number(node.x2)?-w/2:w/2,y=Number(node.y1)<=Number(node.y2)?-h/2:h/2;
      node.type='Path';node.path=[['M',x,y],['L',-x,-y]];node.fill='';
      for(const key of ['x1','x2','y1','y2'])delete node[key];
    }
    (node.objects as Record<string,unknown>[]|undefined)?.forEach(visit);
  };visit(copy);return copy;
}
const openPath=(o:fabric.FabricObject):o is fabric.Path=>o instanceof fabric.Path&&(!o.fill||o.fill==='transparent')&&o.path.length>=2&&!o.path.some(c=>c[0]==='Z');
const shapeNode=(o:Named):DiagramNode=>{const b=o.getBoundingRect();return {name:o.name,type:o.type,...b,fontSize:(o as fabric.Textbox).fontSize};};

/** A caixa genérica é substituída por alças nas pontas (e curvas, quando houver). */
export function installConnectorControls(object:fabric.FabricObject,zoom:()=>number):void{
  if(object instanceof fabric.Group)object.getObjects().forEach(o=>installConnectorControls(o,zoom));
  if(!openPath(object))return;
  const path=object as fabric.Path&Named,all=fabric.controlsUtils.createPathControls(path);
  const endpointKeys=[`c_0_${path.path[0][0]}`,`c_${path.path.length-1}_${path.path.at(-1)![0]}`];
  path.controls=Object.fromEntries(Object.entries(all).filter(([key])=>endpointKeys.includes(key)||key.includes('_CP_')));
  path.hasBorders=false;path.cornerStyle='circle';path.transparentCorners=false;path.cornerColor='#ffffff';path.cornerStrokeColor='#e8a04c';
  for(const [key,control] of Object.entries(path.controls)){
    control.cursorStyle='crosshair';control.render=fabric.controlsUtils.renderCircleControl;
    const original=control.actionHandler!;
    control.actionHandler=(event,transform,x,y)=>{
      let point=new fabric.Point(x,y);const end=key===endpointKeys[0]?'from':key===endpointKeys[1]?'to':null;
      if(end&&path.canvas){
        const candidates=(path.canvas.getObjects() as Named[]).filter(o=>o!==path&&o.visible&&o.evented&&o.name&&!openPath(o)&&!(o instanceof fabric.Group));
        let best:{object:Named;point:fabric.Point;distance:number;angle:number}|undefined;
        for(const o of candidates){
          const b=o.getBoundingRect(),cx=b.left+b.width/2,cy=b.top+b.height/2;
          let p:fabric.Point;const angle=Math.atan2(y-cy,x-cx)*180/Math.PI;
          if(o instanceof fabric.Circle||o instanceof fabric.Ellipse){const a=angle*Math.PI/180;p=new fabric.Point(cx+Math.cos(a)*b.width/2,cy+Math.sin(a)*b.height/2);}
          else p=new fabric.Point(b.left-14,b.top+((o as fabric.Textbox).fontSize??24)*.56);
          const distance=p.distanceFrom(point);
          if(distance<=14/Math.max(zoom(),.1)&&(!best||distance<best.distance))best={object:o,point:p,distance,angle};
        }
        const meta=path.beeConnector;
        if(best){
          point=best.point;
          if(meta){path.beeConnector={...meta,[end]:best.object.name!,...(end==='from'?{angle:best.angle}:{}),manual:false};}
        }else if(meta)path.beeConnector={...meta,manual:true};
      }
      return original.call(control,event,transform,point.x,point.y);
    };
  }
}

/** Conectores acompanham seus círculos/rótulos quando eles são movidos. */
export function syncCanvasConnections(canvas:fabric.Canvas,changed?:fabric.FabricObject):void{
  const objects=canvas.getObjects() as Named[];
  const changedName=(changed as Named|undefined)?.name;
  const named=new Map(objects.filter(o=>o.name).map(o=>[o.name!,o]));
  const rings=objects.filter(o=>o.name?.startsWith('diagram-ring-')||o.name==='diagram-core');
  const right=Math.max(0,...rings.map(o=>{const b=o.getBoundingRect();return b.left+b.width;}));
  for(const line of objects){
    const meta=line.beeConnector;
    if(!openPath(line)||!meta||meta.manual||line===changed||(changedName&&meta.from!==changedName&&meta.to!==changedName))continue;
    const from=named.get(meta.from),to=named.get(meta.to);if(!from||!to)continue;
    const target=to.getBoundingRect(),bend=right+(target.left-14-right)*(1-((meta.lane??0)+1)/5);
    const points=connectionPoints(shapeNode(from),shapeNode(to),meta,bend);
    const tmp=new fabric.Path(pathForPoints(points) as fabric.TSimplePathData,{strokeWidth:line.strokeWidth,fill:''});
    line.set({path:tmp.path,left:tmp.left,top:tmp.top,width:tmp.width,height:tmp.height,pathOffset:tmp.pathOffset,scaleX:1,scaleY:1,angle:0,dirty:true});line.setCoords();
  }
}

export function resizeConnectorHandles(canvas:fabric.Canvas,zoom:number):void{
  canvas.targetFindTolerance=6/Math.max(zoom,.1);
  const visit=(o:fabric.FabricObject)=>{
    if(openPath(o))for(const c of Object.values(o.controls)){c.sizeX=14/zoom;c.sizeY=14/zoom;c.touchSizeX=24/zoom;c.touchSizeY=24/zoom;}
    if(o instanceof fabric.Group)o.getObjects().forEach(visit);o.setCoords();
  };canvas.getObjects().forEach(visit);canvas.requestRenderAll();
}
