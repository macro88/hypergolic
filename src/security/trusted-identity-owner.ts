import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { IdentityVault, VaultError } from './identity-vault';
import { openIdentityMetadata } from './identity-metadata';
import { createProtectedSecrets } from './android-encrypted-secrets';
import { loadIOSIdentityActions } from './identity-actions-native';
import { loadIOSIdentitySecrets } from './identity-store-native';
import { identityCrypto, formatNpub, publicKeyFromNsec } from './identity-crypto';
import { openShellDatabase } from '../storage/database';
import { IdentityTransition } from './identity-transition';
import { assertBundledWorkspace, initialTestWorkspace } from '../shell/fixtures';

export interface TrustedIdentityOwner {
  readonly transition: IdentityTransition;
  readonly formatNpub: typeof formatNpub;
}
export class WorkspaceStartupError extends Error {
  constructor() { super('Workspace could not be opened'); this.name = 'WorkspaceStartupError'; }
}
async function openOwnerWorkspace(vault: IdentityVault, platform: 'android' | 'ios'): Promise<IdentityTransition> {
  const database = await openShellDatabase(SQLite, platform).catch(() => { throw new WorkspaceStartupError(); });
  try {
    return await IdentityTransition.open({ vault, database, publicKeyFromNsec, seed: initialTestWorkspace, assertAvailable: assertBundledWorkspace });
  } catch {
    try { await database.close(); } catch { /* Preserve the workspace failure. */ }
    throw new WorkspaceStartupError();
  }
}

/** Dynamically imported only after the native process claim succeeds. */
export async function openTrustedIdentityOwner(): Promise<TrustedIdentityOwner> {
  const platform = Platform.OS;
  if (platform !== 'android' && platform !== 'ios') throw new VaultError('STORAGE_FAILURE');
  const denyDeletion = (): never => { throw new VaultError('AUTHORIZATION_DENIED'); };
  const actions = platform === 'ios' ? loadIOSIdentityActions(platform) : null;
  const secrets = platform === 'ios'
    ? await loadIOSIdentitySecrets(platform, actions!.tokens)
    : await createProtectedSecrets(SecureStore, platform);
  const database = await openIdentityMetadata(SQLite, platform);
  const vault = new IdentityVault({ ...identityCrypto, secrets, database, authorizeDeletion: actions?.authorizeDeletion ?? (async () => denyDeletion()) });
  try {
    await vault.open();
    return Object.freeze({ transition: await openOwnerWorkspace(vault, platform), formatNpub });
  } catch (error) {
    try { await database.close(); } catch { /* Preserve the initialization failure. */ }
    throw error;
  }
}
