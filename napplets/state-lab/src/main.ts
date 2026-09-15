import { identity, storage } from '@napplet/sdk';
import { element } from './view';
import { connectTheme } from './theme';
import './style.css';

const controls = element<HTMLFieldSetElement>('controls');
const keyInput = element<HTMLInputElement>('key');
const valueInput = element<HTMLTextAreaElement>('value');
const scopeInput = element<HTMLSelectElement>('scope');
let publicKey = '';
let identityEpoch = 0;
let pending = false;
let disposed = false;
let requests = 0;

function acceptIdentity(value: string): void {
  identityEpoch++;
  publicKey = /^[0-9a-f]{64}$/.test(value) ? value : '';
  pending = false;
  controls.disabled = !publicKey;
  element('identity').textContent = publicKey;
  element('identity-status').textContent = publicKey ? 'Identity connected' : 'No identity selected';
  element('result').textContent = '';
  element('result').dataset.state = 'idle';
  element('key-list').replaceChildren();
  element('status').textContent = 'No request yet.';
}
async function connectIdentity(): Promise<void> {
  let changed = false;
  try {
    const sub = identity.onChanged(value => {
      if (disposed) return;
      changed = true;
      acceptIdentity(value);
    });
    window.addEventListener('pagehide', () => { disposed = true; identityEpoch++; controls.disabled = true; sub.close(); });
    const initial = await identity.getPublicKey();
    if (!changed && !disposed) acceptIdentity(initial);
  } catch {
    if (!changed && !disposed) {
      controls.disabled = true;
      element('identity-status').textContent = 'Open in a shell with identity and storage access';
    }
  }
}

type Action = 'read' | 'write' | 'remove' | 'keys';
async function run(action: Action): Promise<void> {
  if (pending || !publicKey || disposed) return;
  const epoch = identityEpoch;
  const api = scopeInput.value === 'instance' ? storage.instance : storage;
  const key = keyInput.value;
  const value = valueInput.value;
  pending = true;
  controls.disabled = true;
  element('status').textContent = 'Waiting for the shell…';
  element('requests').textContent = String(++requests);
  const current = (): boolean => !disposed && epoch === identityEpoch;
  try {
    if (action === 'read') {
      const saved = await api.getItem(key);
      if (!current()) return;
      element('result').dataset.state = saved === null ? 'missing' : 'present';
      element('result').textContent = saved ?? '';
      element('status').textContent = saved === null ? 'No value saved.' : saved === '' ? 'Read an empty string.' : 'Read complete.';
    } else if (action === 'keys') {
      const keys = await api.keys();
      if (!current()) return;
      element('key-list').replaceChildren(...keys.map(key => {
        const row = document.createElement('li'); row.textContent = key; return row;
      }));
      element('status').textContent = `${keys.length} saved keys.`;
    } else {
      if (action === 'write') await api.setItem(key, value);
      else await api.removeItem(key);
      if (!current()) return;
      element('status').textContent = action === 'write' ? 'Write confirmed.' : 'Remove confirmed.';
      element('result').dataset.state = 'idle';
      element('result').textContent = '';
    }
  } catch (error) {
    if (!current()) return;
    element('result').dataset.state = 'error';
    element('status').textContent = 'Request failed: ' + (error instanceof Error ? error.message.slice(0, 240) : 'storage unavailable');
  } finally {
    if (current()) { pending = false; controls.disabled = !publicKey; }
  }
}
for (const action of ['read', 'write', 'remove', 'keys'] as const) {
  element(action).addEventListener('click', () => { void run(action); });
}
element('title').textContent = __LAB_TITLE__;
document.title = __LAB_TITLE__;
element('lab').dataset.ready = 'true';
void connectIdentity();
void connectTheme();
