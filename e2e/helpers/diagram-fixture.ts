/** Arte sintética, sem casos/pessoas: reproduz o M03-B anterior às ligações semânticas. */
export function legacyDiagram(title='Título do diagrama'){
  const objects:Record<string,unknown>[]=[{type:'Textbox',name:'headline',text:title,left:120,top:130,width:840,fontSize:46,fontFamily:'Arial',fill:'#ffffff'}];
  [290,209,136,72,20].forEach((radius,i)=>objects.push({type:'Circle',left:400-radius,top:780-radius,radius,fill:i===4?'#e8a04c':'#607083',opacity:i===4?1:.6,strokeWidth:0}));
  ['Visível','Padrões','Estruturas','Essência'].forEach((text,i)=>{
    objects.push({type:'Path',path:`M ${690-i*60} ${650+i*70} L 630 ${600+i*160}`,fill:'',stroke:'#ffffff',strokeWidth:3});
    objects.push({type:'Textbox',text,left:650,top:580+i*160,width:330,fontSize:28,fontFamily:'Arial',fill:'#ffffff'});
    objects.push({type:'Textbox',text:`Descrição sintética ${i+1}.`,left:650,top:614+i*160,width:330,fontSize:20,fontFamily:'Arial',fill:'#dddddd'});
  });
  objects.push({type:'Textbox',name:'signature',text:'AUTOR DE TESTE',left:320,top:1230,width:440,fontSize:16,fontFamily:'Arial',fill:'#ffffff'});
  return {version:'6.0.0',background:'#1c2e4a',objects};
}
