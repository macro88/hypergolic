import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { IdentityVault, VaultError, type VaultSnapshot } from './identity-vault';
import { openIdentityMetadata } from './identity-metadata';
import { createProtectedSecrets } from './android-encrypted-secrets';
import { loadIOSIdentityActions } from './identity-actions-native';
import { loadIOSIdentitySecrets } from './identity-store-native';
import { identityCrypto, formatNpub } from './identity-crypto';
import { openShellDatabase } from '../storage/database';
import { openWorkspaceController, type WorkspaceController } from '../storage/workspace-controller';
import { assertBundledWorkspace, initialTestWorkspace } from '../shell/fixtures';

export interface PublicIdentitySnapshot { readonly npub: string; readonly vault: VaultSnapshot }

/** Owned by the one admitted bootstrap; only public snapshots leave this service. */
class TrustedIdentityOwner {
  constructor(private readonly vault: IdentityVault, readonly workspace: WorkspaceController) {}
  getPublicSnapshot(): PublicIdentitySnapshot {
    const vault = this.vault.getSnapshot();
    return Object.freeze({ npub: formatNpub(vault.selectedPubkey), vault });
  }
}

export class WorkspaceStartupError extends Error {
  constructor() { super('Workspace could not be opened'); this.name = 'WorkspaceStartupError'; }
}
async function openOwnerWorkspace(vault: IdentityVault, platform: 'android' | 'ios'): Promise<WorkspaceController> {
  const selected = vault.getSnapshot();
  const database = await openShellDatabase(SQLite, platform).catch(() => { throw new WorkspaceStartupError(); });
  try {
    const binding = database.bindWorkspace({ user: selected.selectedPubkey, assertActive: () => {
      const current = vault.getSnapshot();
      if (current.selectedPubkey !== selected.selectedPubkey || current.revision !== selected.revision) throw new Error('Identity changed');
    } });
    return await openWorkspaceController(binding, initialTestWorkspace, assertBundledWorkspace);
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
    return new TrustedIdentityOwner(vault, await openOwnerWorkspace(vault, platform));
  } catch (error) {
    try { await database.close(); } catch { /* Preserve the initialization failure. */ }
    throw error;
  }
}
