// Inspeção de Marcas: somente dados sintéticos, sem artefatos pagos ou credenciais nas imagens.
import { spawn } from 'node:child_process';
import { chromium, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export async function visualReview({db,userId,env,stopChild}){
  if(env.HIVE_E2E_LOCAL!=='1'||env.VITE_SUPABASE_URL!=='http://127.0.0.1:54521')throw Error('Revisão visual exige serviços locais.');
  const [ws]=(await db.query("INSERT INTO workspaces(name,slug) VALUES('Estúdio de teste visual','e2e-visual-local') RETURNING id")).rows;
  await db.query("INSERT INTO workspace_members(workspace_id,user_id,role) VALUES($1,$2,'owner')",[ws.id,userId]);
  const [brand]=(await db.query("INSERT INTO brands(workspace_id,name,slug,essence) VALUES($1,'Marca de teste visual','teste-visual-local','Ajudar pessoas a decidir com clareza.') RETURNING id",[ws.id])).rows;
  const vite=spawn(process.execPath,[path.join(ROOT,'node_modules/vite/bin/vite.js'),'--host','127.0.0.1','--port','5199','--strictPort'],{cwd:ROOT,env,detached:true,stdio:'ignore'});
  let browser;
  try{
    let ready=false;
    for(let i=0;i<60;i++){
      try{if((await fetch('http://127.0.0.1:5199/login')).ok){ready=true;break;}}catch{}
      await new Promise(r=>setTimeout(r,500));
    }
    if(!ready)throw Error('Front da revisão visual não ficou pronto.');
    browser=await chromium.launch({args:['--host-resolver-rules=MAP *.supabase.co ~NOTFOUND, MAP api.supabase.com ~NOTFOUND']});
    const context=await browser.newContext({storageState:path.join(ROOT,'e2e/.auth/user.json'),locale:'pt-BR',timezoneId:'America/Sao_Paulo'});
    const page=await context.newPage();
    for(const [label,viewport] of [['desktop',{width:1440,height:900}],['celular',{width:375,height:812}]]){
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:5199/identidade/marcas?marca='+brand.id);
      await expect(page.getByTestId('identity-brand-select')).toHaveValue(brand.id);
      const card=page.getByTestId('brand-card').filter({hasText:'Marca de teste visual'});
      await expect(card).toBeVisible();
      await capture(page,label+'-lista');
      await card.getByRole('button',{name:'Editar',exact:true}).click();
      await expect(page.getByTestId('brand-form').getByLabel('Nome da marca')).toHaveValue('Marca de teste visual');
      await capture(page,label+'-edicao');
    }
    await context.close();
    console.log('Revisão visual: lista e edição capturadas em desktop e 375px; somente dados sintéticos.');
  }finally{await browser?.close();await stopChild(vite);}
}
async function capture(page,name){
  const encoded=(await page.screenshot({fullPage:true})).toString('base64');
  const size=12000,total=Math.ceil(encoded.length/size);
  for(let i=0;i<total;i++)console.log(`HIVE_VISUAL|${name}|${i}|${total}|${encoded.slice(i*size,(i+1)*size)}`);
}
