import type { IdentityTransition } from '../security/identity-transition.ts';
import type { ShellDatabase } from '../storage/database.ts';
import { ShellStorageError } from '../storage/ports.ts';
import type { NappletDescriptor } from '../shell/workspace.ts';
import { bundledDescriptor, resolveBundledSession, type BundledVariant } from '../shell/fixtures.ts';
import { createCapabilityBroker, type NativeCapabilityPort } from './capability-broker.ts';
import { identifier } from '../storage/codec.ts';

export interface NativeCapabilityEvent { type: 'capability'; sessionId: string; generation: string; token: string }
export interface RuntimeBinding { readonly configuration: string; receive(event: NativeCapabilityEvent): void; revoke(): void }
export interface RuntimeNativePort extends NativeCapabilityPort { newInstanceId(): string }
export interface RuntimeOwner {
  open(session: NappletDescriptor): RuntimeBinding;
  descriptor(variant: Exclude<BundledVariant, 'ux-lab'>, number: number): NappletDescriptor;
}
/** The process-owned database and identity authority remain outside React/WebView props. */
export function createRuntimeOwner(database: ShellDatabase,
  identity: Pick<IdentityTransition, 'getSnapshot' | 'sessionAuthority'>, native: RuntimeNativePort): RuntimeOwner {
  return Object.freeze({
    descriptor(variant: Exclude<BundledVariant, 'ux-lab'>, number: number): NappletDescriptor {
      const instance = native.newInstanceId();
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(instance)) throw new ShellStorageError('INVALID_INPUT');
      const descriptor = bundledDescriptor(variant, number, instance);
      resolveBundledSession(descriptor);
      return descriptor;
    },
    open(session: NappletDescriptor): RuntimeBinding {
    const descriptor = Object.freeze({ ...session });
    const catalog = resolveBundledSession(descriptor);
    const authority = identity.sessionAuthority();
    const configuration = Object.freeze({ sessionId: identifier(session.id), epoch: authority.epoch, user: authority.user, ...catalog });
    let revoked = false;
    let generation: string | null = null;
    let broker: ReturnType<typeof createCapabilityBroker> | null = null;
    const assertActive = (): void => {
      authority.assertActive();
      const state = identity.getSnapshot().session.workspace.getSnapshot();
      const current = state.workspace.sessions.find(value => value.id === descriptor.id);
      if (revoked || state.error !== null || !current || current.publisher !== descriptor.publisher || current.appId !== descriptor.appId ||
          current.version !== descriptor.version || current.source !== descriptor.source || current.title !== descriptor.title) throw new ShellStorageError('REVOKED');
    };
    assertActive();
    return Object.freeze({ configuration: JSON.stringify(configuration),
      revoke(): void { revoked = true; broker?.revoke(); },
      receive(event: NativeCapabilityEvent): void {
        try {
          assertActive();
          if (event.type !== 'capability' || event.sessionId !== descriptor.id) return;
          identifier(event.token); identifier(event.generation);
          if (generation === null) {
            generation = event.generation;
            broker = createCapabilityBroker(database, native, { registration: { ...configuration, generation }, assertActive });
          }
          if (event.generation !== generation) return;
          void broker!.dispatch(event.token);
        } catch { /* Native expiry or teardown ends unclaimed requests; no new owner is chosen. */ }
      },
    });
  } });
}
