import { createRoutingSettings, type RoutingSettingsService } from '../routing/routing-settings';
import {openRoutingCatalog, type RoutingCatalog} from '../routing/routing-catalog';
import {RoutingBroker} from '../routing/routing-broker';
import {RoutingReviewService} from '../routing/routing-review';
import {createRoutingTargets} from '../routing/routing-targets';
import {loadRoutingNativePort} from '../routing/routing-native';
import {bindRoutingOwner, type NativeRoutingOwner} from '../routing/routing-owner';
import {bindLinkOwner, type NativeLinkOwner} from '../links/link-owner';
import {openIdentityListAccess, type IdentityListAccess} from '../identity/identity-permissions';
import {loadIdentityListNativePolicy} from '../identity/identity-permissions-native';
import { openIdentityCache } from '../identity/identity-cache';
import { createIdentityDataService } from '../identity/identity-service';
import { requireNativeModule } from 'expo';
import { digest, CryptoDigestAlgorithm } from 'expo-crypto';
import { UploadService } from '../uploads/upload-service';
import { loadNativeUploadPort } from '../uploads/native-upload-port';
import { openNativeUploadSettings, type NativeUploadSettings, type UploadConfigurationModule } from '../uploads/upload-settings-native';
import { loadNativeResourceHost } from '../resources/native-resource-port';
import { openNativeResourceSettings, type NativeResourceSettings } from '../resources/resource-settings-native';
import {loadNativeRelaySubscriptions} from '../network/native-relay-subscription-port';
import { finalizeEvent } from 'nostr-tools/pure';
import { ApprovalService } from './approval-service';
import { createApprovalOwner, createUploadOwner } from './approval-owner';
import { loadNativeApprovalPort } from '../runtime/native-approval-port';
import { loadNativeRelayQuery } from '../network/native-relay-query-port';
import { publishEvent } from '../network/relay-service';
import { openNativeRelaySettings, type NativeRelaySettings } from '../network/relay-settings-native';
import { Platform } from 'react-native';
import { createRuntimeOwner, type RuntimeOwner } from '../runtime/runtime-owner';
import { loadNativeCapabilityPort } from '../runtime/native-capability-port';
import { loadNativePublishedArtifactSource } from '../napplets/native-published-source-port';
import { loadNativePublishedTransferPort } from '../napplets/native-transfer-port';
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
import { assertWorkspaceAvailability, initialTestWorkspace } from '../shell/fixtures';

export interface TrustedIdentityOwner {
  readonly routing?: Readonly<{broker: RoutingBroker; catalog: RoutingCatalog; reviews: RoutingReviewService; settings: RoutingSettingsService}>;
  readonly listAccess?: IdentityListAccess | null;
  readonly transition: IdentityTransition;
  readonly actions?: IdentityActions;
  readonly runtime?: RuntimeOwner;
  readonly approvals?: ApprovalService;
  readonly uploads?: UploadService;
  readonly uploadSettings?: NativeUploadSettings | null;
  readonly relaySettings: NativeRelaySettings | null;
  readonly resourceSettings: NativeResourceSettings | null;
  readonly formatNpub: typeof formatNpub;
}
export class WorkspaceStartupError extends Error {
  constructor() { super('Workspace could not be opened'); this.name = 'WorkspaceStartupError'; }
}
async function openOwnerWorkspace(vault: IdentityVault, platform: 'android' | 'ios'): Promise<{ routing: Readonly<{broker: RoutingBroker; catalog: RoutingCatalog; reviews: RoutingReviewService; settings: RoutingSettingsService}>; listAccess: IdentityListAccess | null; transition: IdentityTransition; runtime: RuntimeOwner; approvals: ApprovalService; relaySettings: NativeRelaySettings | null; resourceSettings: NativeResourceSettings | null; uploadSettings: NativeUploadSettings | null; uploads: UploadService }> {
  const database = await openShellDatabase(SQLite, platform).catch(() => { throw new WorkspaceStartupError(); });
  let relaySettings: NativeRelaySettings | null = null;
  let resourceSettings: NativeResourceSettings | null = null;
  let uploadSettings: NativeUploadSettings | null = null;
  let listAccess: IdentityListAccess | null = null;
  let releaseLinks: (() => void) | null = null;
  let releaseRouting: (() => void) | null = null;
  let routingCatalog: RoutingCatalog | null = null;
  let routingBroker: RoutingBroker | null = null;
  let identityCache: Awaited<ReturnType<typeof openIdentityCache>> | null = null;
  try {
    try { relaySettings = await openNativeRelaySettings(SQLite, platform); } catch { relaySettings = null; }
    try { resourceSettings = await openNativeResourceSettings(SQLite); } catch { resourceSettings = null; }
    try { uploadSettings = await openNativeUploadSettings(SQLite, requireNativeModule<UploadConfigurationModule>('HypergolicNappletHost')); } catch { uploadSettings = null; }
    routingCatalog = await openRoutingCatalog(SQLite, platform);
    identityCache = await openIdentityCache(SQLite, platform);
    const queries = loadNativeRelayQuery(() => relaySettings?.getSettings().networkRelays ?? []);
    const transition = await IdentityTransition.open({ vault, database, publicKeyFromNsec, seed: initialTestWorkspace, assertAvailable: assertWorkspaceAvailability });
    releaseRouting = bindRoutingOwner(transition, requireNativeModule<NativeRoutingOwner>('HypergolicNappletHost'));
    releaseLinks = bindLinkOwner(transition, requireNativeModule<NativeLinkOwner>('HypergolicNappletHost'));
    try {listAccess = await openIdentityListAccess(SQLite, platform, loadIdentityListNativePolicy(), () => {const state = transition.getSnapshot(); return state.phase === 'ready' ? state.session.vault.selectedPubkey : '';});} catch {listAccess = null;}
    let runtime: RuntimeOwner | null = null;
    const approvals = new ApprovalService(loadNativeApprovalPort(), createApprovalOwner(transition, origin => {
      if (!runtime) throw new Error('APPROVAL_DENIED');
      runtime.assertPublishedApproval(origin);
    }), {
      sign: (snapshot, execution) => vault.signApproved(snapshot, execution, (event, secret) => {
        const signed = finalizeEvent(event, secret);
        return { id: signed.id, pubkey: signed.pubkey, created_at: signed.created_at, kind: signed.kind,
          content: signed.content, tags: signed.tags, sig: signed.sig };
      }),
      publishEvent,
    });
    const uploads = new UploadService(loadNativeUploadPort(), createUploadOwner(transition, origin => {
      if (!runtime) throw new Error('APPROVAL_DENIED');
      runtime.assertPublishedUpload(origin);
    }), {
      currentIdentity: () => transition.getSnapshot().phase === 'ready' ? transition.getSnapshot().session.vault.selectedPubkey : null,
      sha256: async bytes => Array.from(new Uint8Array(await digest(CryptoDigestAlgorithm.SHA256, bytes)), byte => byte.toString(16).padStart(2, '0')).join(''),
      nowSeconds: () => Math.floor(Date.now() / 1000),
      sign: (snapshot, execution) => vault.signApprovedUpload(snapshot, execution, (event, secret) => {
        const signed = finalizeEvent(event, secret);
        return {id: signed.id, pubkey: signed.pubkey, created_at: signed.created_at, kind: signed.kind, content: signed.content, tags: signed.tags, sig: signed.sig};
      }),
    });
    const capability = loadNativeCapabilityPort(), routingNative = loadRoutingNativePort();
    const reviews = new RoutingReviewService();
    routingBroker = new RoutingBroker(capability, routingNative, routingCatalog, reviews, createRoutingTargets(transition, () => runtime, reviews, routingNative));
    const routing = Object.freeze({broker: routingBroker, catalog: routingCatalog, reviews, settings: createRoutingSettings(transition, routingNative, routingCatalog, routingBroker)});
    runtime = createRuntimeOwner(database, transition, capability,
      { service: approvals, destinations: () => relaySettings?.getSettings().networkRelays ?? [] },
      { sqlite: SQLite, source: loadNativePublishedArtifactSource(), native: loadNativePublishedTransferPort(),
        lookupRelays: () => relaySettings?.getSettings().lookupRelays ?? [] },
      queries,
      loadNativeRelaySubscriptions(() => relaySettings?.getSettings().networkRelays ?? []),
      loadNativeResourceHost(() => resourceSettings?.servers() ?? [], queries), uploads, createIdentityDataService(identityCache, queries, Date.now, listAccess ?? undefined), routing);
    return { routing, listAccess, transition, approvals, relaySettings, resourceSettings, uploadSettings, uploads, runtime };
  } catch {
    releaseLinks?.(); releaseRouting?.(); routingBroker?.stop();
    try { await routingCatalog?.close(); } catch { /* Preserve the workspace failure. */ }
    try { await listAccess?.close(); } catch { /* Preserve the workspace failure. */ }
    try { await identityCache?.close(); } catch { /* Preserve the workspace failure. */ }
    try { await uploadSettings?.close(); } catch { /* Preserve the workspace failure. */ }
    try { await resourceSettings?.close(); } catch { /* Preserve the workspace failure. */ }
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
