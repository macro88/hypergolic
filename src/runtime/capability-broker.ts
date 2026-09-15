import type { ShellDatabase } from '../storage/database.ts';
import { ShellStorageError, type StringStorage } from '../storage/ports.ts';
import { utf8Bytes } from '../storage/codec.ts';
import { CAPABILITY_LIMITS, decodeNativeRegistration, decodeNativeRequest, identityResult,
  parseCapabilityRequest, storageFailure, type CapabilityReply, type CapabilityRequest,
  type NativeRegistration } from './capability-protocol.ts';

/** Native module only. take is single-use and returns a native-held immutable snapshot.
 * isActive is synchronous and checks native revocation and monotonic expiry, not an RN event mirror.
 * finish independently rechecks native view/generation before delivering the original reply. */
export interface NativeCapabilityPort {
  take(token: string): string | null;
  isActive(token: string): boolean;
  finish(token: string, response: string | null): void;
}
export interface CapabilityOwner {
  readonly registration: NativeRegistration;
  /** Must also check the selected identity epoch/revision and workspace session membership. */
  assertActive(): void;
}
function storageError(error: unknown): string {
  if (error instanceof ShellStorageError) {
    if (error.code === 'QUOTA_EXCEEDED') return 'storage quota exceeded';
    if (error.code === 'BUSY') return 'storage busy';
    if (error.code === 'STORAGE_INDETERMINATE') return 'storage result uncertain';
    if (error.code === 'INVALID_INPUT') return 'invalid storage request';
  }
  return 'storage unavailable';
}
async function operate(storage: StringStorage, request: CapabilityRequest): Promise<CapabilityReply> {
  const base = { type: `${request.type}.result`, id: request.id };
  if (!('scope' in request)) throw new Error('Storage operation required');
  switch (request.type) {
    case 'storage.get': return { ...base, value: await storage.get(request.key!, request.scope) };
    case 'storage.keys': return { ...base, keys: await storage.keys(request.scope) };
    case 'storage.set': await storage.set(request.key!, request.value!, request.scope); return base;
    case 'storage.remove': await storage.remove(request.key!, request.scope); return base;
  }
}
/** One broker per registered native view. It is never passed into the WebView. */
export function createCapabilityBroker(database: ShellDatabase, native: NativeCapabilityPort, owner: CapabilityOwner) {
  const registration = decodeNativeRegistration(owner.registration);
  const expected = JSON.stringify(registration);
  const seen = new Set<string>();
  let disposed = false;
  const assertActive = (token: string): void => {
    if (disposed || !native.isActive(token)) throw new ShellStorageError('REVOKED');
    owner.assertActive();
  };
  return Object.freeze({
    revoke: () => { disposed = true; seen.clear(); },
    async dispatch(token: string): Promise<void> {
      let response: string | null = null;
      let claimed = false;
      let release: (() => void) | undefined;
      try {
        const raw = native.take(token);
        if (raw === null) return;
        claimed = true;
        const captured = decodeNativeRequest(raw);
        if (JSON.stringify(captured.registration) !== expected) return;
        assertActive(token);
        let request: CapabilityRequest;
        try { request = parseCapabilityRequest(captured.request); }
        catch {
          const failure = storageFailure(captured.request, 'invalid storage request');
          if (failure && registration.domains.includes('storage')) response = JSON.stringify(failure);
          return;
        }
        const domain = request.type.split('.')[0]!;
        if (!registration.domains.includes(domain)) return;
        const correlation = JSON.stringify([request.type, request.id]);
        if (seen.has(correlation) || seen.size >= CAPABILITY_LIMITS.sessionRequests) {
          const failure = storageFailure(request, 'request already used or session limit reached');
          if (failure) response = JSON.stringify(failure);
          return;
        }
        seen.add(correlation);
        let result: CapabilityReply;
        if (domain === 'identity') result = identityResult(request, registration.user);
        else {
          const binding = database.bindStorage({ user: registration.user, publisher: registration.publisher,
            appId: registration.appId, version: registration.version, instanceId: registration.instanceId,
            assertActive: () => assertActive(token) });
          release = binding.revoke;
          try { result = await operate(binding.port, request); }
          catch (error) { result = storageFailure(request, storageError(error))!; }
        }
        assertActive(token);
        response = JSON.stringify(result);
        if (utf8Bytes(response) > CAPABILITY_LIMITS.messageBytes) response = null;
      } catch { response = null; }
      finally {
        release?.();
        // A revoked owner never receives a stale successful result, even if COMMIT already finished.
        if (claimed) {
          try { assertActive(token); } catch { response = null; }
          try { native.finish(token, response); } catch { /* Native expiry retains the final denial boundary. */ }
        }
      }
    },
  });
}
