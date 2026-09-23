import {
  createShellBridge, injectNappletNamespacePrelude, originRegistry,
  resolveShellEnvironment, type ShellAdapter,
} from '@kehto/shell';
import { createThemeService } from '@kehto/services';
import type { HostOperationContext, NappletMessage } from '@kehto/runtime';
import { identityResult, parseCapabilityRequest } from '../../src/runtime/capability-protocol';
import { createNativeClient, type NativeHost } from './native-client';
import { injectPublishedCsp, readPublishedArtifact } from './published-artifact';

type FailureCode = 'invalid-session' | 'bridge-unavailable' | 'fixture-integrity'
  | 'artifact-integrity' | 'runtime-bootstrap' | 'runtime-timeout' | 'frame-navigation';
type HostDiagnostic = { type: 'ready'; sessionId: string }
  | { type: 'error'; sessionId: string; code: FailureCode };
const hostWindow = window as Window & { HypergolicHost?: NativeHost };
const parameters = new URL(window.location.href).searchParams;
const sessionId = parameters.get('sessionId') ?? '';
const source = parameters.get('source');
const fixtureName = parameters.get('fixture') ?? 'ux-lab';
const fixture = source === null && Object.hasOwn(__BUNDLED_FIXTURES__, fixtureName) ? __BUNDLED_FIXTURES__[fixtureName] : undefined;
type RuntimeArtifact = Readonly<{
  html: string; sha256: string; aggregateHash: string; appId: string; title: string;
  domains: readonly string[]; publishTimeoutMs?: number; published: boolean;
}>;
let stopped = false;
let cleanup: (() => void) | undefined;
window.addEventListener('pagehide', () => { stopped = true; cleanup?.(); }, { once: true });

function diagnostic(value: HostDiagnostic): void {
  const encoded = JSON.stringify(value);
  if (encoded.length > 2048) return;
  try { hostWindow.HypergolicHost?.postMessage(encoded); } catch { /* native teardown */ }
}
function fail(code: FailureCode): void {
  if (stopped) return;
  stopped = true;
  cleanup?.();
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = 'The napplet could not be loaded.';
  document.body.replaceChildren(message);
  diagnostic({ type: 'error', sessionId, code });
}

const csp = [
  "default-src 'none'", "script-src 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'unsafe-inline'", 'img-src data: blob:', 'font-src data:',
  "connect-src 'none'", "worker-src 'none'", "child-src 'none'", "frame-src 'none'",
  "media-src 'none'", "object-src 'none'", "manifest-src 'none'", "base-uri 'none'",
  "form-action 'none'",
].join('; ');

/** Only fixed generated HTML whose bytes were independently verified is admitted. */
function injectCsp(html: string): string {
  if (!/^<!doctype html>\s*<html lang="en">\s*<head>/i.test(html)) {
    throw new Error('Unexpected fixture structure');
  }
  return html.replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}">`);
}
async function digest(value: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function makeHooks(native: ReturnType<typeof createNativeClient>, captureRecipient: () => () => boolean,
  artifact: RuntimeArtifact): ShellAdapter {
  const unavailable = (): never => { throw new Error('Capability unavailable'); };
  const theme = createThemeService({ initialTheme: {
    colors: { background: '#140f0b', text: '#f3efeb', primary: '#e8805d' },
  } });
  const supported = new Set(artifact.domains);
  const storage = async ({ message, send }: HostOperationContext): Promise<void> => { send({ ...await native.request(message) }); };
  const relayPublish = async ({ message, send }: HostOperationContext): Promise<void> => { send({ ...await native.request(message) }); };
  const identity = { descriptor: { name: 'identity', version: '1.0.0' },
    handleMessage(_windowId: string, message: NappletMessage, send: (message: NappletMessage) => void): void {
      const live = captureRecipient();
      void native.request(message).then(response => { if (live()) send(response); }).catch(() => {
        if (!live()) return;
        try { send(identityResult(parseCapabilityRequest(message), '') as NappletMessage); } catch { /* Unknown operation. */ }
      });
    } };
  return {
    relayPool: {
      getRelayPool: () => null, trackSubscription: unavailable,
      untrackSubscription: () => {}, openScopedRelay: unavailable,
      closeScopedRelay: () => {}, publishToScopedRelay: () => false,
      selectRelayTier: () => [],
    },
    relayConfig: { addRelay: unavailable, removeRelay: unavailable,
      getRelayConfig: () => ({ discovery: [], super: [], outbox: [] }),
      getNip66Suggestions: () => null },
    windowManager: { createWindow: () => null },
    auth: { getUserPubkey: () => null, getSigner: () => null },
    config: { getNappUpdateBehavior: () => 'banner' },
    hotkeys: { executeHotkeyFromForward: unavailable },
    workerRelay: { getWorkerRelay: () => null },
    crypto: { verifyEvent: async () => false },
    services: { theme: theme.handler, ...(supported.has('identity') ? { identity } : {}),
      ...(supported.has('relay') ? { relay: { descriptor: { name: 'relay', version: '1.0.0' }, handleMessage: unavailable } } : {}) },
    ...((supported.has('storage') || supported.has('relay')) ? { operationOverrides: {
      ...(supported.has('storage') ? { 'storage.get': storage, 'storage.set': storage, 'storage.remove': storage, 'storage.keys': storage } : {}),
      ...(supported.has('relay') ? { 'relay.publish': relayPublish } : {}),
    } } : {}),
    capabilities: {
      disabledDomains: ['relay', 'identity', 'storage', 'inc', 'keys', 'media', 'notify'].filter(domain => !supported.has(domain)),
      resolveEnvironment: () => ({ domains: [...supported], services: ['theme', ...(supported.has('identity') ? ['identity'] : [])] }),
    },
  };
}

const privilegedRequests = new Set(['identity.getPublicKey', 'identity.getRelays', 'identity.getProfile',
  'identity.getFollows', 'identity.getMutes', 'identity.getBlocked', 'identity.getList',
  'identity.getZaps', 'identity.getBadges', 'storage.get', 'storage.set', 'storage.remove', 'storage.keys']);
function validEnvelope(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const message = value as Record<string, unknown>;
  const keys = Object.keys(message);
  if (message.type === 'shell.ready') return keys.length === 1;
  if (typeof message.type === 'string' && privilegedRequests.has(message.type)) {
    try { return typeof message.id === 'string' && message.id.length > 0 && message.id.length <= 128
      && new TextEncoder().encode(JSON.stringify(value)).length <= 2 * 1024 * 1024; }
    catch { return false; }
  }
  if (message.type === 'relay.publish') {
    if (keys.length !== 3 || !keys.includes('id') || !keys.includes('event') ||
        typeof message.id !== 'string' || message.id.length === 0 || message.id.length > 128) return false;
    const event = message.event;
    if (!event || typeof event !== 'object' || Array.isArray(event)) return false;
    const eventKeys = Object.keys(event);
    if (eventKeys.length !== 4 || !['kind', 'content', 'tags', 'created_at'].every(key => eventKeys.includes(key))) return false;
    const template = event as Record<string, unknown>;
    if (typeof template.kind !== 'number' || !Number.isSafeInteger(template.kind) || template.kind < 0 || template.kind > 65535 ||
        typeof template.created_at !== 'number' || !Number.isSafeInteger(template.created_at) || template.created_at < 0 ||
        typeof template.content !== 'string' || !Array.isArray(template.tags)) return false;
    try { return new TextEncoder().encode(JSON.stringify(value)).length <= 2 * 1024 * 1024; }
    catch { return false; }
  }
  return message.type === 'theme.get' && keys.length === 2
    && typeof message.id === 'string' && message.id.length > 0 && message.id.length <= 128
    && keys.every(key => key === 'type' || key === 'id');
}

function mount(artifact: RuntimeArtifact): void {
  const native = createNativeClient(hostWindow.HypergolicHost!, sessionId,
    artifact.publishTimeoutMs === undefined ? {} : { requestTimeoutsMs: { 'relay.publish': artifact.publishTimeoutMs } });
  const hooks = makeHooks(native, () => {
    const entry = bridge.runtime.sessionRegistry.getEntryByWindowId(sessionId);
    return () => !stopped && entry !== undefined && bridge.runtime.sessionRegistry.getEntryByWindowId(sessionId) === entry;
  }, artifact);
  const bridge = createShellBridge(hooks);
  const identity = Object.freeze({ dTag: artifact.appId, aggregateHash: artifact.aggregateHash });
  const environment = resolveShellEnvironment(hooks, identity);
  const frame = document.createElement('iframe');
  frame.id = 'napplet';
  frame.title = artifact.title;
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.setAttribute('referrerpolicy', 'no-referrer');
  frame.setAttribute('allow', "camera 'none'; microphone 'none'; geolocation 'none'; payment 'none'; clipboard-read 'none'; clipboard-write 'none'");
  const style = document.createElement('style');
  style.textContent = 'html,body{margin:0;height:100%;overflow:hidden;background:#140f0b;color:#f3efeb}iframe{display:block;width:100%;height:100%;border:0}body>p{font:16px system-ui;padding:24px}';
  document.head.append(style);
  document.body.replaceChildren(frame);
  const source = frame.contentWindow;
  if (!source) { bridge.destroy(); throw new Error('Frame unavailable'); }
  originRegistry.register(source, sessionId, identity);
  originRegistry.setEnvironment(source, environment);
  let ready = false;
  let frameLoaded = false;
  let operations = 0;
  let windowStart = performance.now();
  const deadline = window.setTimeout(() => fail('runtime-timeout'), 10_000);

  const receive = (event: MessageEvent): void => {
    if (stopped || !event.isTrusted || event.source !== source || frame.contentWindow !== source) return;
    if (!validEnvelope(event.data)) return;
    if (performance.now() - windowStart > 1000) { operations = 0; windowStart = performance.now(); }
    if (++operations > 64) return;
    // Kehto performs session gating, frozen capability enforcement and theme dispatch.
    bridge.handleMessage(event);
    if (!ready && bridge.runtime.sessionRegistry.getEntryByWindowId(sessionId)) {
      ready = true;
      window.clearTimeout(deadline);
      diagnostic({ type: 'ready', sessionId });
    }
  };
  const loaded = (): void => {
    // Registered WindowProxy references can survive self-navigation. End the
    // generation on any subsequent document load; never bless new source bytes.
    if (frameLoaded) { fail('frame-navigation'); return; }
    frameLoaded = true;
    if (frame.contentWindow !== source) fail('frame-navigation');
  };
  cleanup = (): void => {
    window.clearTimeout(deadline);
    window.removeEventListener('message', receive);
    frame.removeEventListener('load', loaded);
    bridge.runtime.destroyWindow(sessionId);
    originRegistry.unregister(sessionId);
    native.destroy();
    bridge.destroy();
    frame.remove();
  };
  window.addEventListener('message', receive);
  frame.addEventListener('load', loaded);
  frame.srcdoc = injectNappletNamespacePrelude(artifact.published
    ? injectPublishedCsp(artifact.html, csp) : injectCsp(artifact.html), {
    ...environment.capabilities,
    ...(artifact.publishTimeoutMs === undefined ? {} : { requestTimeoutsMs: { 'relay.publish': artifact.publishTimeoutMs } }),
  });
}

async function start(): Promise<void> {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(sessionId)) { fail('invalid-session'); return; }
  if (window.parent !== window || typeof hostWindow.HypergolicHost?.postMessage !== 'function') {
    fail('bridge-unavailable'); return;
  }
  try {
    let artifact: RuntimeArtifact;
    if (source === 'published') {
      if (parameters.size !== 2 || parameters.get('fixture') !== null) { fail('artifact-integrity'); return; }
      const document = await readPublishedArtifact(hostWindow.HypergolicHost!, sessionId);
      artifact = Object.freeze({ html: document.html, sha256: document.metadata.htmlHash,
        aggregateHash: document.metadata.version, appId: document.metadata.appId,
        title: document.metadata.appId, domains: document.metadata.domains, published: true });
    } else {
      if (source !== null || !fixture) { fail('fixture-integrity'); return; }
      const actual = await digest(fixture.html);
      if (actual !== fixture.sha256 || await digest(`${actual} /index.html\n`) !== fixture.aggregateHash) {
        fail('fixture-integrity'); return;
      }
      artifact = Object.freeze({ ...fixture, published: false });
    }
    if (stopped) return;
    mount(artifact);
  } catch { fail(source === 'published' ? 'artifact-integrity' : 'runtime-bootstrap'); }
}
void start();
