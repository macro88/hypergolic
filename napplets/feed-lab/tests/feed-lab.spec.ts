import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
async function mount(page: Page, mode = 'notes') {
  await page.setContent('<style>body{margin:0}iframe{width:390px;height:844px;border:0}</style>');
  const mock = `<script>window.calls=[];window.napplet={relay:{query:async filters=>{window.calls.push(filters);
    ${mode == 'pending' ? 'return new Promise(()=>{});' : mode == 'error' ? 'throw new Error("relay query failed");' : mode == 'empty' ? 'return [];' : 'return [{event:{id:"a".repeat(64),content:"<img src=x onerror=alert(1)> hello"}}];'}
  }}};</script>`;
  await page.evaluate(content => { const frame=document.createElement('iframe');frame.id='fixture';frame.sandbox.add('allow-scripts');frame.srcdoc=content;document.body.append(frame); }, html.replace('<head>', '<head>'+mock));
  const frame=page.frameLocator('#fixture'); await expect(frame.getByTestId('lab')).toHaveAttribute('data-ready','true'); return frame;
}
test('genuine SDK query renders content as text with original filter and exact event id', async ({page})=>{
  const frame=await mount(page);await frame.getByRole('button',{name:'Query notes',exact:true}).click();
  await expect(frame.getByRole('status')).toHaveText('Received 1 signed note.');
  await expect(frame.locator('#events')).toContainText('<img src=x onerror=alert(1)> hello');
  await expect(frame.locator('#events img')).toHaveCount(0);
  expect(await frame.locator('body').evaluate(()=> (window as any).calls)).toEqual([[{kinds:[1],limit:8}]]);
});
test('empty query and failure remain distinct UI states',async({page})=>{
  let frame=await mount(page,'empty');await frame.getByRole('button',{name:'Query empty sample'}).click();
  await expect(frame.getByRole('status')).toHaveText('Query completed. No matching notes.');
  expect(await frame.locator('body').evaluate(()=> (window as any).calls)).toEqual([[{kinds:[1],limit:0}]]);
  frame=await mount(page,'error');await frame.getByRole('button',{name:'Query notes',exact:true}).click();
  await expect(frame.getByRole('status')).toHaveText('Query failed: relay query failed');await expect(frame.locator('#lab')).toHaveAttribute('data-state','error');
});
test('invalid JSON does not call SDK and pending query prevents duplicate input',async({page})=>{
  let frame=await mount(page);await frame.locator('#filters').fill('invalid');await frame.getByRole('button',{name:'Query notes',exact:true}).click();
  await expect(frame.getByRole('status')).toContainText('Query failed:');expect(await frame.locator('body').evaluate(()=> (window as any).calls)).toEqual([]);
  frame=await mount(page,'pending');await frame.getByRole('button',{name:'Query notes',exact:true}).click();
  await expect(frame.getByRole('status')).toHaveText('Reading notes…');await expect(frame.getByRole('button',{name:'Query notes',exact:true})).toBeDisabled();
});

async function streamMount(page:Page) {
  await page.setContent('<iframe id="fixture" sandbox="allow-scripts" style="width:390px;height:844px"></iframe>');
  const mock=`<script>window.stream={closed:0};window.napplet={relay:{subscribe:(filters,onEvent,onEose)=>{
    window.stream.filters=filters;window.stream.event=onEvent;window.stream.eose=onEose;return {close:()=>window.stream.closed++};
  },query:async()=>[]}};</script>`;
  await page.locator('#fixture').evaluate((node,content)=>(node as HTMLIFrameElement).srcdoc=content,html.replace('<head>','<head>'+mock));
  const frame=page.frameLocator('#fixture');await expect(frame.getByTestId('lab')).toHaveAttribute('data-ready','true');return frame;
}
test('live UI keeps at most 32 text-only rows, suppresses duplicates and retains an editable draft',async({page})=> {
  const frame=await streamMount(page);await frame.locator('#draft').fill('draft stays while reading');await frame.getByRole('button',{name:'Start live feed'}).click();
  await frame.locator('body').evaluate(()=>{const stream=(window as any).stream;for(let i=0;i<40;i++)stream.event({event:{id:i.toString(16).padStart(64,'0'),content:'<img src=x onerror=alert(1)> '+i}});stream.event({event:{id:(39).toString(16).padStart(64,'0'),content:'duplicate'}});stream.eose();});
  await expect(frame.locator('#stream-status')).toHaveText('Live · 40 signed notes · history loaded.');await expect(frame.locator('#events li')).toHaveCount(32);
  await expect(frame.locator('#events img')).toHaveCount(0);await expect(frame.locator('#draft')).toHaveValue('draft stays while reading');
  await expect(frame.getByRole('button',{name:'Query notes',exact:true})).toBeDisabled();await frame.getByRole('button',{name:'Close live feed'}).click();
  await expect(frame.locator('#stream-status')).toHaveText('Live feed closed.');await expect(frame.getByRole('button',{name:'Start live feed'})).toBeEnabled();
  await frame.locator('body').evaluate(()=>(window as any).stream.event({event:{id:'f'.repeat(64),content:'late'}}));await expect(frame.locator('#events li')).toHaveCount(32);
  expect(await frame.locator('body').evaluate(()=>(window as any).stream.closed)).toBe(1);
});
test('live UI observes only a captured-parent terminal response and restores controls',async({page})=> {
  const frame=await streamMount(page);await frame.getByRole('button',{name:'Start live feed'}).click();
  await frame.locator('body').evaluate(()=>window.postMessage({type:'relay.closed',reason:'guest forged'},'*'));
  await expect(frame.locator('#lab')).toHaveAttribute('data-stream','open');
  await page.evaluate(()=>{const target=(document.querySelector('#fixture') as HTMLIFrameElement).contentWindow!;target.postMessage({type:'relay.closed',reason:'native owner revoked'},'*');});
  await expect(frame.locator('#stream-status')).toHaveText('Live feed closed: native owner revoked');await expect(frame.getByRole('button',{name:'Start live feed'})).toBeEnabled();
});
