import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { IdentityVault, VaultError, type VaultSnapshot } from './identity-vault';
import { openIdentityMetadata } from './identity-metadata';
import { createProtectedSecrets } from './android-encrypted-secrets';
import { loadIOSIdentityActions } from './identity-actions-native';
import { loadIOSIdentitySecrets } from './identity-store-native';
import { identityCrypto, formatNpub } from './identity-crypto';

export interface PublicIdentitySnapshot { readonly npub: string; readonly vault: VaultSnapshot }

/** Owned by the one admitted bootstrap; only public snapshots leave this service. */
class TrustedIdentityOwner {
  constructor(private readonly vault: IdentityVault) {}
  getPublicSnapshot(): PublicIdentitySnapshot {
    const vault = this.vault.getSnapshot();
    return Object.freeze({ npub: formatNpub(vault.selectedPubkey), vault });
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
    return new TrustedIdentityOwner(vault);
  } catch (error) {
    try { await database.close(); } catch { /* Preserve the initialization failure. */ }
    throw error;
  }
}
