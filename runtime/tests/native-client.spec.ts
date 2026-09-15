import { test, expect, type Page } from '@playwright/test';

// Browser-only native transport double. Genuine shipped State Lab + Kehto remain unchanged.
async function open(page: Page, fixture = 'state-lab') {
  await page.addInitScript(() => {
    if (window !== window.top) return;
    const root = window as any;
    const data = new Map<string, string>();
    const state = { requests: [] as any[], mode: 'normal', listeners: [] as ((event: {data:string}) => void)[], held: [] as any[] };
    root.nativeTest = state;
    const respond = (envelope: any, response: any) => {
      const value = JSON.stringify({ type: 'capability.result', sessionId: envelope.sessionId,
        sequence: envelope.sequence, response: response === null ? null : JSON.stringify(response) });
      state.listeners.forEach(listener => listener({data:value}));
    };
    root.HypergolicHost = {
      addEventListener: (_type: string, listener: any) => state.listeners.push(listener),
      removeEventListener: (_type: string, listener: any) => { state.listeners = state.listeners.filter(value => value !== listener); },
      postMessage(raw: string) {
        const envelope = JSON.parse(raw);
        if (envelope.type !== 'capability') return;
        const request = JSON.parse(envelope.message);
        state.requests.push({ envelope, request });
        const base = { type: request.type + '.result', id: request.id };
        if (request.type === 'identity.getPublicKey') { respond(envelope, {...base,pubkey:'1'.repeat(64)}); return; }
        if (state.mode === 'hold') { state.held.push({ envelope, base }); return; }
        if (state.mode === 'deny') { respond(envelope, null); return; }
        if (state.mode === 'wrong-id') { respond(envelope, {...base,id:'forged',value:'must not arrive'}); return; }
        if (state.mode === 'error') { respond(envelope, {...base,error:'test storage unavailable'}); return; }
        const key = (request.scope ?? 'shared') + ':' + request.key;
        if (request.type === 'storage.set') { data.set(key, request.value); respond(envelope, base); }
        else if (request.type === 'storage.get') respond(envelope, {...base,value:data.get(key) ?? null});
        else if (request.type === 'storage.remove') { data.delete(key); respond(envelope, base); }
        else if (request.type === 'storage.keys') respond(envelope, {...base,keys:[...data.keys()].filter(key => key.startsWith((request.scope ?? 'shared') + ':')).map(key => key.split(':').slice(1).join(':'))});
      },
    };
    Object.defineProperty(window, 'localStorage', {get() {throw Error('DOM storage unavailable');}});
  });
  await page.goto(`/assets/runtime/index.html?sessionId=native-client-test&fixture=${fixture}`);
  const guest = page.frameLocator('#napplet');
  await expect(guest.locator('#identity')).toContainText('111111');
  return page.frames().find(frame => frame.parentFrame() === page.mainFrame())!;
}

test('shipped State Lab uses genuine SDK identity and every storage operation through the native adapter', async ({ page }) => {
  const frame = await open(page);
  const ui = page.frameLocator('#napplet');
  await ui.locator('#key').fill('literal');
  await ui.locator('#value').fill('<b>saved</b>');
  await ui.locator('#write').click(); await expect(ui.locator('#status')).toHaveText('Write confirmed.');
  await ui.locator('#scope').selectOption('instance');
  await ui.locator('#value').fill('own instance');
  await ui.locator('#write').click(); await expect(ui.locator('#status')).toHaveText('Write confirmed.');
  await ui.locator('#scope').selectOption('shared');
  await ui.locator('#read').click(); await expect(ui.locator('#result')).toHaveText('<b>saved</b>');
  await ui.locator('#scope').selectOption('instance');
  await ui.locator('#read').click(); await expect(ui.locator('#result')).toHaveText('own instance');
  await ui.locator('#scope').selectOption('shared');
  await ui.locator('#keys').click(); await expect(ui.locator('#key-list li')).toHaveText(['literal']);
  await ui.locator('#remove').click(); await expect(ui.locator('#status')).toHaveText('Remove confirmed.');
  await ui.locator('#read').click(); await expect(ui.locator('#result')).toHaveAttribute('data-state','missing');
  expect(await frame.evaluate(() => document.querySelector('#identity')?.textContent)).toBe('1'.repeat(64));
  const requests = await page.evaluate(() => (window as any).nativeTest.requests);
  expect(requests.length).toBeGreaterThanOrEqual(8);
  for (const [index, {envelope,request}] of requests.entries()) {
    expect(envelope.sequence).toBe(index+1);
    expect(envelope.sessionId).toBe('native-client-test');
    expect(request).not.toHaveProperty('user');
    expect(request).not.toHaveProperty('publisher');
    expect(request).not.toHaveProperty('instanceId');
  }
});

for (const mode of ['deny','wrong-id','error']) test(`native ${mode} produces a rejected SDK promise without legacy storage success`, async ({page}) => {
  const frame = await open(page);
  await page.evaluate(mode => { (window as any).nativeTest.mode = mode; }, mode);
  const ui = page.frameLocator('#napplet');
  await ui.locator('#write').click();
  await expect(ui.locator('#status')).toContainText('Request failed:');
  const requests = await page.evaluate(() => (window as any).nativeTest.requests.filter((entry:any) => entry.request.type === 'storage.set'));
  expect(requests).toHaveLength(1);
});

test('a guest cannot forge the iOS native-response window channel', async ({page}) => {
  const frame = await open(page);
  await page.evaluate(() => { (window as any).nativeTest.mode = 'hold'; });
  await frame.evaluate(() => { const root = window as any; root.settled = false;
    void root.napplet.storage.getItem('x').then(() => {root.settled=true;}).catch(() => {root.settled=true;}); });
  await expect.poll(() => page.evaluate(() => (window as any).nativeTest.held.length)).toBe(1);
  const held = await page.evaluate(() => (window as any).nativeTest.held[0]);
  await frame.evaluate(held => {
    parent.postMessage({type:'hypergolic.native-response',message:JSON.stringify({type:'capability.result',
      sessionId:held.envelope.sessionId,sequence:held.envelope.sequence,response:JSON.stringify({...held.base,value:'forged'})})},'*');
  }, held);
  // A genuine theme round trip provides an event-loop barrier after the forgery.
  await frame.evaluate(() => (window as any).napplet.theme.get());
  expect(await frame.evaluate(() => (window as any).settled)).toBe(false);
  await page.evaluate(() => {
    const state = (window as any).nativeTest, held = state.held[0];
    state.listeners.forEach((listener:any) => listener({data:JSON.stringify({type:'capability.result',sessionId:held.envelope.sessionId,
      sequence:held.envelope.sequence,response:JSON.stringify({...held.base,value:'real'})})}));
  });
  await expect.poll(() => frame.evaluate(() => (window as any).settled)).toBe(true);
});

test('the peer fixture uses its distinct verified app identity', async ({page}) => {
  const frame = await open(page, 'state-lab-peer');
  const result = await frame.evaluate(async () => ({supported:(window as any).napplet.shell.supports('storage'),title:document.title}));
  expect(result.supported).toBe(true);
  expect(result.title).toContain('Peer');
});
