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
  readonly formatNpub: typeof formatNpub;
}
export class WorkspaceStartupError extends Error {
  constructor() { super('Workspace could not be opened'); this.name = 'WorkspaceStartupError'; }
}
async function openOwnerWorkspace(vault: IdentityVault, platform: 'android' | 'ios'): Promise<{ transition: IdentityTransition; runtime: RuntimeOwner }> {
  const database = await openShellDatabase(SQLite, platform).catch(() => { throw new WorkspaceStartupError(); });
  try {
    const transition = await IdentityTransition.open({ vault, database, publicKeyFromNsec, seed: initialTestWorkspace, assertAvailable: assertBundledWorkspace });
    return { transition, runtime: createRuntimeOwner(database, transition, loadNativeCapabilityPort()) };
  } catch {
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
