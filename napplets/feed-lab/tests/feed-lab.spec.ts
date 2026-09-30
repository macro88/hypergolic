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
