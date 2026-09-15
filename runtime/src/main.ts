import {
  createShellBridge, injectNappletNamespacePrelude, originRegistry,
  resolveShellEnvironment, type ShellAdapter,
} from '@kehto/shell';
import { createThemeService } from '@kehto/services';

type FailureCode = 'invalid-session' | 'bridge-unavailable' | 'fixture-integrity'
  | 'runtime-bootstrap' | 'runtime-timeout' | 'frame-navigation';
type HostDiagnostic = { type: 'ready'; sessionId: string }
  | { type: 'error'; sessionId: string; code: FailureCode };
interface NativeHost { postMessage(message: string): void }
const hostWindow = window as Window & { HypergolicHost?: NativeHost };
const sessionId = new URL(window.location.href).searchParams.get('sessionId') ?? '';
let stopped = false;
let cleanup: (() => void) | undefined;

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

function makeHooks(): ShellAdapter {
  const unavailable = (): never => { throw new Error('Capability unavailable'); };
  const theme = createThemeService({ initialTheme: {
    colors: { background: '#140f0b', text: '#f3efeb', primary: '#e8805d' },
  } });
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
    services: { theme: theme.handler },
    capabilities: {
      disabledDomains: ['relay', 'identity', 'storage', 'inc', 'keys', 'media', 'notify'],
      resolveEnvironment: () => ({ domains: ['theme'], services: ['theme'] }),
    },
  };
}

function validEnvelope(value: unknown): value is { type: 'shell.ready' } | { type: 'theme.get'; id: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const message = value as Record<string, unknown>;
  const keys = Object.keys(message);
  if (message.type === 'shell.ready') return keys.length === 1;
  return message.type === 'theme.get' && keys.length === 2
    && typeof message.id === 'string' && message.id.length > 0 && message.id.length <= 128
    && keys.every(key => key === 'type' || key === 'id');
}

function mount(): void {
  const hooks = makeHooks();
  const bridge = createShellBridge(hooks);
  const identity = Object.freeze({ dTag: 'ux-lab', aggregateHash: __UX_AGGREGATE__ });
  const environment = resolveShellEnvironment(hooks, identity);
  const frame = document.createElement('iframe');
  frame.id = 'napplet';
  frame.title = 'UX Lab';
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
    bridge.destroy();
    frame.remove();
  };
  window.addEventListener('message', receive);
  frame.addEventListener('load', loaded);
  window.addEventListener('pagehide', () => { stopped = true; cleanup?.(); }, { once: true });
  frame.srcdoc = injectNappletNamespacePrelude(injectCsp(__UX_HTML__), environment.capabilities);
}

async function start(): Promise<void> {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(sessionId)) { fail('invalid-session'); return; }
  if (window.parent !== window || typeof hostWindow.HypergolicHost?.postMessage !== 'function') {
    fail('bridge-unavailable'); return;
  }
  try {
    const actual = await digest(__UX_HTML__);
    if (actual !== __UX_SHA256__ || await digest(`${actual} /index.html\n`) !== __UX_AGGREGATE__) {
      fail('fixture-integrity'); return;
    }
    if (stopped) return;
    mount();
  } catch { fail('runtime-bootstrap'); }
}
void start();
