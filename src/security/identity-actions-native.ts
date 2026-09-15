import { requireNativeModule } from 'expo';
import { createIOSIdentityActions, type IdentityActionsModule } from './ios-identity-actions.ts';
import { VaultError } from './identity-vault.ts';

/** Native process admission must already have succeeded in the one trusted bootstrap. */
export function loadIOSIdentityActions(platform: string) {
  if (platform !== 'ios') throw new VaultError('STORAGE_FAILURE');
  let module: IdentityActionsModule;
  try { module = requireNativeModule<IdentityActionsModule>('HypergolicIdentityActions'); }
  catch { throw new VaultError('STORAGE_FAILURE'); }
  return createIOSIdentityActions(module, platform);
}
