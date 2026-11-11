import type * as fabric from 'fabric';

/** Alt + clique percorre as camadas sob o ponteiro sem mudar a ordem da arte. */
export function attachLayerPicking(canvas: fabric.Canvas): void {
  const findTarget = canvas.findTarget;
  // Fabric pode consultar o mesmo evento mais de uma vez; um clique avança uma vez.
  const picked = new WeakMap<Event, fabric.FabricObject | undefined>();
  canvas.findTarget = function(e) {
    if(!e.altKey || e.type !== 'mousedown')return findTarget.call(this,e);
    if(picked.has(e))return picked.get(e);
    const point=this.getViewportPoint(e);
    const hits=this.getObjects().slice().reverse().flatMap(object=>{
      this.targets=[];
      const hit=this.searchPossibleTargets([object],point);
      return hit&&hit.selectable?[hit]:[];
    });
    const active=this.getActiveObject();
    const index=active?hits.indexOf(active):-1;
    const next=hits[(index+1)%hits.length];
    this.targets=[];
    picked.set(e,next);
    return next;
  };
}
