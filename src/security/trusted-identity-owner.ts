import { finalizeEvent } from 'nostr-tools/pure';
import { ApprovalService } from './approval-service';
import { createApprovalOwner } from './approval-owner';
import { loadNativeApprovalPort } from '../runtime/native-approval-port';
import { publishEvent } from '../network/relay-service';
import { openNativeRelaySettings, type NativeRelaySettings } from '../network/relay-settings-native';
import { Platform } from 'react-native';
import { createRuntimeOwner, type RuntimeOwner } from '../runtime/runtime-owner';
import { loadNativeCapabilityPort } from '../runtime/native-capability-port';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import type { IdentityActions } from './identity-actions';
import { IdentityVault, VaultError } from './identity-vault';
import { openIdentityMetadata } from './identity-metadata';
import { createProtectedSecrets } from './android-encrypted-secrets';
import { loadIdentityActions } from './identity-actions-native';
import { loadIOSIdentitySecrets } from './identity-store-native';
import { identityCrypto, formatNpub, publicKeyFromNsec } from './identity-crypto';
import { openShellDatabase } from '../storage/database';
import { IdentityTransition } from './identity-transition';
import { assertBundledWorkspace, initialTestWorkspace } from '../shell/fixtures';

export interface TrustedIdentityOwner {
  readonly transition: IdentityTransition;
  readonly actions?: IdentityActions;
  readonly runtime?: RuntimeOwner;
  readonly approvals?: ApprovalService;
  readonly relaySettings: NativeRelaySettings | null;
  readonly formatNpub: typeof formatNpub;
}
export class WorkspaceStartupError extends Error {
  constructor() { super('Workspace could not be opened'); this.name = 'WorkspaceStartupError'; }
}
async function openOwnerWorkspace(vault: IdentityVault, platform: 'android' | 'ios'): Promise<{ transition: IdentityTransition; runtime: RuntimeOwner; approvals: ApprovalService; relaySettings: NativeRelaySettings | null }> {
  const database = await openShellDatabase(SQLite, platform).catch(() => { throw new WorkspaceStartupError(); });
  let relaySettings: NativeRelaySettings | null = null;
  try {
    try { relaySettings = await openNativeRelaySettings(SQLite, platform); } catch { relaySettings = null; }
    const transition = await IdentityTransition.open({ vault, database, publicKeyFromNsec, seed: initialTestWorkspace, assertAvailable: assertBundledWorkspace });
    const approvals = new ApprovalService(loadNativeApprovalPort(), createApprovalOwner(transition), {
      sign: (snapshot, execution) => vault.signApproved(snapshot, execution, (event, secret) => {
        const signed = finalizeEvent(event, secret);
        return { id: signed.id, pubkey: signed.pubkey, created_at: signed.created_at, kind: signed.kind,
          content: signed.content, tags: signed.tags, sig: signed.sig };
      }),
      publishEvent,
    });
    return { transition, approvals, relaySettings, runtime: createRuntimeOwner(database, transition, loadNativeCapabilityPort(),
      { service: approvals, destinations: () => relaySettings?.getSettings().networkRelays ?? [] }) };
  } catch {
    try { await relaySettings?.close(); } catch { /* Preserve the workspace failure. */ }
    try { await database.close(); } catch { /* Preserve the workspace failure. */ }
    throw new WorkspaceStartupError();
  }
}

/** Dynamically imported only after the native process claim succeeds. */
export async function openTrustedIdentityOwner(): Promise<TrustedIdentityOwner> {
  const platform = Platform.OS;
  if (platform !== 'android' && platform !== 'ios') throw new VaultError('STORAGE_FAILURE');
  const actions = loadIdentityActions(platform);
  const secrets = platform === 'ios'
    ? await loadIOSIdentitySecrets(platform, actions.tokens)
    : await createProtectedSecrets(SecureStore, platform, actions.androidDeletion);
  const database = await openIdentityMetadata(SQLite, platform);
  const vault = new IdentityVault({ ...identityCrypto, secrets, database, authorizeDeletion: async request => {
    await actions.beginSettings({ selectedPubkey: request.selectedPubkey, revision: request.revision });
    return actions.authorizeDeletion(request);
  } });
  try {
    await vault.open();
    return Object.freeze({ ...await openOwnerWorkspace(vault, platform), formatNpub, actions });
  } catch (error) {
    try { actions.dispose(); } catch { /* Native owner remains consumed. */ }
    try { await database.close(); } catch { /* Preserve the initialization failure. */ }
    throw error;
  }
}
