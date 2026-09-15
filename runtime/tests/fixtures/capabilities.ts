import { createShellBridge, injectNappletNamespacePrelude, originRegistry,
  resolveShellEnvironment, renderNappletNamespacePrelude, type ShellAdapter } from '@kehto/shell';
import type { HostOperationContext, HostOperation, HostOperationEnvelope } from '@kehto/runtime';
import { createThemeService } from '@kehto/services';

// Test-only trusted host. No device bridge, key, signer or network transport is installed.
const selected = new URLSearchParams(location.search);
const state = { calls: [] as { windowId: string; message: HostOperationEnvelope }[],
  audit: [] as string[], signerReads: 0, legacyRelayCalls: 0, deniedAdapters: [] as string[],
  incoming: [] as unknown[], holdReady: selected.has('holdReady') };
const pending: HostOperationContext[] = [];
const store = new Map<string, string>();
const record = (label: string): void => { state.deniedAdapters.push(label); };
const fail = (label: string): never => { record(label); throw new Error('Test-only unavailable adapter'); };
const noSubscription = (): void => record('subscription-cleanup');
const operations: HostOperation[] = ['storage.get', 'storage.set', 'storage.remove', 'storage.keys',
  'relay.publish', 'relay.publishEncrypted', 'relay.query', 'relay.subscribe', 'relay.close'];
const testOperation = (context: HostOperationContext): void | Promise<void> => {
  const { windowId, message, send } = context;
  state.calls.push({ windowId, message });
  state.audit.push(`operation:${message.type}`);
  const msg = message as unknown as Record<string, unknown>;
  if (msg.key === 'reject') return Promise.reject(new Error('Do not expose rejection'));
  if (msg.key === 'throw') throw new Error('Do not expose this exception');
  if (selected.has('defer')) { pending.push(context); return; }
  if (message.type === 'storage.set') {
    store.set(String(msg.key), String(msg.value));
    send({ type: 'storage.set.result', id: String(msg.id) });
  } else if (message.type === 'storage.get') {
    send({ type: 'storage.get.result', id: String(msg.id), value: store.get(String(msg.key)) ?? null });
  } else if (message.type === 'storage.remove') {
    store.delete(String(msg.key));
    send({ type: 'storage.remove.result', id: String(msg.id) });
  } else if (message.type === 'storage.keys') {
    send({ type: 'storage.keys.result', id: String(msg.id), keys: [...store.keys()] });
  } else if (message.type === 'relay.query') {
    send({ type: 'relay.query.result', id: String(msg.id), events: [] });
  } else if (message.type === 'relay.subscribe' || message.type === 'relay.close') {
    send({ type: 'relay.closed', subId: String(msg.subId), reason: 'test-only closed' });
  } else {
    send({ type: `${message.type}.result`, id: String(msg.id), ok: false, error: 'test-only declined' } as HostOperationEnvelope);
  }
};
const theme = createThemeService({ initialTheme: { colors: { background: '#140f0b', text: '#f3efeb', primary: '#e8805d' } } });
const domains = selected.has('noRelay') ? ['theme', 'storage'] : ['theme', 'storage', 'relay'];
const hooks: ShellAdapter = {
  relayPool: { getRelayPool: () => null, trackSubscription: () => fail('track'),
    untrackSubscription: noSubscription, openScopedRelay: () => fail('open'),
    closeScopedRelay: noSubscription, publishToScopedRelay: () => { record('publish'); return false; },
    selectRelayTier: () => [] },
  relayConfig: { addRelay: () => fail('addRelay'), removeRelay: () => fail('removeRelay'),
    getRelayConfig: () => ({ discovery: [], super: [], outbox: [] }), getNip66Suggestions: () => null },
  windowManager: { createWindow: () => null },
  auth: { getUserPubkey: () => null, getSigner: () => { state.signerReads++; return null; } },
  config: { getNappUpdateBehavior: () => 'banner' }, hotkeys: { executeHotkeyFromForward: () => fail('hotkey') },
  workerRelay: { getWorkerRelay: () => null }, crypto: { verifyEvent: async () => false },
  services: { theme: theme.handler, relay: { descriptor: { name: 'relay', version: 'test-only' }, handleMessage: () => { state.legacyRelayCalls++; throw new Error('Existing relay service called'); } } },
  onAclCheck: event => state.audit.push(`acl:${event.capability}:${event.decision}`),
  capabilities: { disabledDomains: ['identity', 'inc', 'keys', 'media', 'notify'],
    resolveEnvironment: () => ({ domains, services: ['theme'] }) },
  ...(selected.has('noHook') ? {} : { operationOverrides: Object.fromEntries(operations.map(type => [type, testOperation])) }),
};
const bridge = createShellBridge(hooks);
const identity = { dTag: 'test-only-capability-lab', aggregateHash: 'a'.repeat(64) };
const environment = resolveShellEnvironment(hooks, identity);
const frame = document.createElement('iframe');
frame.id = 'napplet'; frame.sandbox.add('allow-scripts'); frame.title = 'Test-only capability fixture';
document.body.append(frame);
const source = frame.contentWindow;
if (!source) throw new Error('No frame window');
originRegistry.register(source, 'native-owned-test-session', identity);
originRegistry.setEnvironment(source, environment);
const evaluateFirewall = bridge.runtime.firewallState.evaluate;
bridge.runtime.firewallState.evaluate = observation => {
  const result = evaluateFirewall(observation);
  state.audit.push(`firewall:${result.decision}`);
  return result;
};
const receive = (event: MessageEvent): void => {
  state.incoming.push(event.data);
  if (!event.isTrusted || event.source !== source) return;
  if (state.holdReady && event.data?.type === 'shell.ready') return;
  bridge.handleMessage(event);
};
window.addEventListener('message', receive);
const fixture = '<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; connect-src \'none\'; frame-src \'none\'; base-uri \'none\'; form-action \'none\'"></head><body><script>window.received=[];addEventListener("message",e=>received.push(e.data));window.napplet.shell.ready().then(()=>document.body.dataset.ready="true");</script></body></html>';
frame.srcdoc = injectNappletNamespacePrelude(fixture, { domains: environment.capabilities.domains,
  ...(selected.has('longTimeout') ? { requestTimeoutsMs: { 'relay.publish': 660_000 } } : {}) });
const lab = {
  state, hooks,
  block: () => bridge.runtime.aclState.block('', identity.dTag, identity.aggregateHash),
  firewall: (policy: 'deny' | 'ask' | 'allow') => bridge.runtime.firewallState.setPolicy(identity.dTag, policy),
  release: () => { for (const { message, send } of pending.splice(0)) {
    if (message.type === 'relay.publish') send({ type: 'relay.publish.result', id: String(message.id), ok: false, error: 'test-only declined' });
    else send({ type: 'storage.get.result', id: String(message.id), value: 'late test-only value' });
  } },
  unregister: () => { bridge.runtime.destroyWindow('native-owned-test-session'); bridge.runtime.sessionRegistry.unregister('native-owned-test-session'); originRegistry.unregister('native-owned-test-session'); },
  destroy: () => { bridge.destroy(); },
  replaceEntry: () => {
    const entry = bridge.runtime.sessionRegistry.getEntryByWindowId('native-owned-test-session');
    if (!entry) throw new Error('Session missing');
    bridge.runtime.sessionRegistry.register('native-owned-test-session', { ...entry });
  },
  render: renderNappletNamespacePrelude,
};
Object.assign(window, { lab });
