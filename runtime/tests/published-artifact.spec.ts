import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const generation = '12345678-1234-1234-1234-123456789abc';
const html = readFileSync('fixtures/ux-lab.html');
const digest = (bytes: Uint8Array | string) => createHash('sha256').update(bytes).digest('hex');
const htmlHash = digest(html);
const version = digest(`${htmlHash} /index.html\n`);
const identity = {
  publisher: '1'.repeat(64), appId: 'published-test', eventId: '2'.repeat(64), version, htmlHash,
};

type Mode = 'normal' | 'bad-hash' | 'malformed-base64' | 'replayed-sequence';

async function openPublished(page: Page, mode: Mode = 'normal') {
  await page.addInitScript(({ generation, htmlBase64, htmlLength, identity, badHashVersion, mode }) => {
    if (window !== window.top) return;
    const state = { requests: [] as unknown[], diagnostics: [] as unknown[] };
    (window as any).__publishedTest = state;
    const bytes = Uint8Array.from(atob(htmlBase64), char => char.charCodeAt(0));
    const listenerSet = new Set<(event: { data: string }) => void>();
    const badHash = 'f'.repeat(64);
    const claims = mode === 'bad-hash'
      ? { ...identity, htmlHash: badHash, version: badHashVersion }
      : identity;
    // The bad-hash case keeps the NIP-5A version internally consistent with
    // its false file claim, so it reaches and exercises byte verification.
    const emit = (sequence: number) => {
      const payload = bytes.slice(sequence * 48 * 1024, (sequence + 1) * 48 * 1024);
      const base64 = mode === 'malformed-base64' ? '!!!!' : btoa(String.fromCharCode(...payload));
      const envelope = {
        type: 'artifact.chunk', sessionId: generation,
        sequence: mode === 'replayed-sequence' ? sequence + 1 : sequence,
        base64, byteLength: payload.length, totalBytes: htmlLength,
        ...claims, done: (sequence + 1) * 48 * 1024 >= htmlLength,
      };
      for (const listener of listenerSet) listener({ data: JSON.stringify(envelope) });
    };
    Object.defineProperty(window, 'HypergolicHost', { value: {
      addEventListener: (_type: string, listener: (event: { data: string }) => void) => listenerSet.add(listener),
      removeEventListener: (_type: string, listener: (event: { data: string }) => void) => listenerSet.delete(listener),
      postMessage(raw: string) {
        const request = JSON.parse(raw);
        state.requests.push(request);
        if (request.type === 'artifact.read') { emit(request.sequence); return; }
        if (request.type === 'ready' || request.type === 'error') state.diagnostics.push(request);
      },
    } });
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage disabled', 'SecurityError'); } });
    Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Storage disabled', 'SecurityError'); } });
  }, { generation, htmlBase64: html.toString('base64'), htmlLength: html.length, identity,
    badHashVersion: awaitHashVersionPlaceholder, mode });
  await page.goto(`/assets/runtime/index.html?sessionId=${generation}&source=published`);
}

// Calculated in Node to keep browser fixture setup simple and deterministic.
const awaitHashVersionPlaceholder = digest(`${'f'.repeat(64)} /index.html\n`);

test('published napplet streams verified bytes, gets theme only, and runs in an isolated frame', async ({ page }) => {
  await openPublished(page);
  await expect(page.locator('#napplet')).toHaveCount(1);
  await expect(page.frameLocator('#napplet').getByTestId('lab')).toHaveAttribute('data-ready', 'true');
  await expect(page.frameLocator('#napplet').getByTestId('theme-status')).toHaveText('Host colors');
  await expect.poll(() => page.evaluate(() => (window as any).__publishedTest.diagnostics)).toEqual([
    { type: 'ready', sessionId: generation },
  ]);
  const result = await page.locator('#napplet').evaluate((frame: HTMLIFrameElement) => ({
    sandbox: frame.getAttribute('sandbox'), src: frame.getAttribute('src'),
  }));
  expect(result).toEqual({ sandbox: 'allow-scripts', src: null });
  const guest = page.frames().find(frame => frame.parentFrame() === page.mainFrame());
  if (!guest) throw new Error('Missing published napplet frame');
  const domains = await guest.evaluate(() => ({
    theme: (window as any).napplet.shell.supports('theme'),
    relay: (window as any).napplet.shell.supports('relay'),
  }));
  expect(domains).toEqual({ theme: true, relay: false });
  const csp = await guest.locator('head > meta[http-equiv="Content-Security-Policy"]').evaluate(node => ({
    first: node === document.head.firstElementChild,
    content: node.getAttribute('content'),
  }));
  expect(csp.first).toBe(true);
  expect(csp.content).toContain("connect-src 'none'");
  const reads = await page.evaluate(() => (window as any).__publishedTest.requests.filter((item: any) => item.type === 'artifact.read'));
  expect(reads.length).toBeGreaterThan(0);
  expect(reads.map((item: any) => item.sequence)).toEqual(reads.map((_item: any, index: number) => index));
});

for (const mode of ['bad-hash', 'malformed-base64', 'replayed-sequence'] as const) {
  test(`published ${mode} fails closed before creating the napplet frame`, async ({ page }) => {
    await openPublished(page, mode);
    await expect(page.getByRole('alert')).toHaveText('The napplet could not be loaded.');
    await expect.poll(() => page.evaluate(() => (window as any).__publishedTest.diagnostics)).toEqual([
      { type: 'error', sessionId: generation, code: 'artifact-integrity' },
    ]);
    await expect(page.locator('iframe')).toHaveCount(0);
  });
}
