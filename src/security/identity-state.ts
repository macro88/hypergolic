import { IdentityDeviceRequired } from './identity-device-required';
import { createOwnerBootstrap, IdentityRestartRequired } from './owner-bootstrap';
import { claimIdentityOwner } from './native-identity-owner';
import type { PublicIdentitySnapshot } from './trusted-identity-owner';

type IdentityState = Readonly<
  | { status: 'opening' }
  | { status: 'ready'; identity: PublicIdentitySnapshot }
  | { status: 'restart-required' | 'recovery-required' | 'device-required' }
>;
const listeners = new Set<() => void>();
let state: IdentityState = Object.freeze({ status: 'opening' });
const startOwner = createOwnerBootstrap(claimIdentityOwner, async () => {
  const { initializeNativeRandom } = await import('./crypto-bootstrap');
  initializeNativeRandom();
  const { openTrustedIdentityOwner } = await import('./trusted-identity-owner');
  return openTrustedIdentityOwner();
});
let observed = false;

function publish(next: IdentityState) {
  state = Object.freeze(next);
  for (const listener of listeners) listener();
}
export const getIdentityState = (): IdentityState => state;
export function subscribeIdentity(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function startIdentity(): void {
  if (observed) return;
  observed = true;
  void startOwner().then(owner => {
    publish({ status: 'ready', identity: owner.getPublicSnapshot() });
  }).catch(error => {
    if (error instanceof IdentityDeviceRequired) publish({ status: 'device-required' });
    else publish({ status: error instanceof IdentityRestartRequired ? 'restart-required' : 'recovery-required' });
  });
}
