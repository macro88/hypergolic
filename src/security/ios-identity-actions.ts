import { VaultError, type DeletionGrant, type VaultDependencies } from './identity-vault.ts';
import type { NativeDeletionTokens } from './ios-encrypted-secrets.ts';

/** Exact trusted-shell Expo contract. No caller-selected runtime, epoch, service or path. */
export interface IdentityActionsModule {
  activateIdentityActions(): void;
  beginSettingsAsync(selectedPubkey: string, revision: number): Promise<string>;
  endSettings(session: string): void;
  cancelDeletion(session: string): void;
  authorizeDeletionAsync(session: string, targetPubkey: string, selectedPubkey: string, revision: number): Promise<string>;
  assertDeletionGrantActive(session: string, targetPubkey: string, token: string): void;
}
type Context = Readonly<{ selectedPubkey: string; revision: number }>;
type GrantRecord = { session: string; target: string; token: string; epoch: number };
const pubkey = /^[0-9a-f]{64}$/;
const opaque = /^[A-Za-z0-9_-]{16,128}$/;
function validContext(value: Context): boolean {
  return typeof value.selectedPubkey === 'string' && pubkey.test(value.selectedPubkey)
    && Number.isSafeInteger(value.revision) && value.revision > 0;
}
function denied(): never { throw new VaultError('AUTHORIZATION_DENIED'); }

/** Call only after the native one-shot process claim. Retain one instance with the trusted vault. */
export function createIOSIdentityActions(module: IdentityActionsModule, platform: string) {
  if (platform !== 'ios') throw new VaultError('STORAGE_FAILURE');
  try { module.activateIdentityActions(); } catch { throw new VaultError('STORAGE_FAILURE'); }
  const grants = new WeakMap<DeletionGrant, GrantRecord>();
  let current: (Context & { session: string }) | null = null;
  let epoch = 0, closed = false, opening = false, pending = false;
  function invalidate() {
    if (epoch === Number.MAX_SAFE_INTEGER) { closed = true; denied(); }
    epoch += 1;
  }
  function validate(record: GrantRecord) {
    if (closed || record.epoch !== epoch || current?.session !== record.session) denied();
    try { module.assertDeletionGrantActive(record.session, record.target, record.token); } catch { denied(); }
  }
  function endSettings() {
    const previous = current;
    current = null;
    invalidate();
    if (previous) { try { module.endSettings(previous.session); } catch { denied(); } }
  }
  async function beginSettings(context: Context): Promise<void> {
    if (closed || opening || pending || !validContext(context)) denied();
    endSettings();
    const captured = Object.freeze({ selectedPubkey: context.selectedPubkey, revision: context.revision });
    const requestEpoch = epoch;
    opening = true;
    try {
      const session = await module.beginSettingsAsync(captured.selectedPubkey, captured.revision);
      if (typeof session !== 'string' || !opaque.test(session)) denied();
      if (closed || requestEpoch !== epoch) {
        // A late opening owns this exact returned session, so cannot close a newer one.
        try { module.endSettings(session); } catch { denied(); }
        denied();
      }
      current = { ...captured, session };
    } catch { denied(); }
    finally { opening = false; }
  }
  function cancelDeletion() {
    const session = current?.session;
    invalidate();
    if (session) { try { module.cancelDeletion(session); } catch { denied(); } }
  }
  const authorizeDeletion: VaultDependencies['authorizeDeletion'] = async request => {
    if (closed || opening || pending || !current || !validContext(request)
      || !pubkey.test(request.pubkey) || request.pubkey === current.selectedPubkey
      || request.selectedPubkey !== current.selectedPubkey || request.revision !== current.revision) denied();
    const session = current.session, target = request.pubkey, requestEpoch = epoch;
    pending = true;
    try {
      const token = await module.authorizeDeletionAsync(session, target, current.selectedPubkey, current.revision);
      if (typeof token !== 'string' || !opaque.test(token) || requestEpoch !== epoch || current?.session !== session || closed) denied();
      const record = { session, target, token, epoch: requestEpoch };
      validate(record);
      const grant: DeletionGrant = Object.freeze({ assertActive() {
        const owned = grants.get(grant);
        if (!owned) denied();
        validate(owned);
      } });
      grants.set(grant, record);
      return grant;
    } catch { denied(); }
    finally { pending = false; }
  };
  const tokens: NativeDeletionTokens = Object.freeze({ consume(grant: DeletionGrant, target: string): string {
    const record = grants.get(grant);
    if (!record || record.target !== target) denied();
    validate(record);
    grants.delete(grant);
    return record.token;
  } });
  function dispose() { try { endSettings(); } finally { closed = true; } }
  return Object.freeze({ beginSettings, endSettings, cancelDeletion, authorizeDeletion, tokens, dispose });
}
