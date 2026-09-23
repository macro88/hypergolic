import { naddrEncode } from 'nostr-tools/nip19';
import type { IdentityTransition } from '../security/identity-transition.ts';
import type { ShellDatabase } from '../storage/database.ts';
import type { SQLiteModule, TrustedApp } from '../storage/ports.ts';
import type { NappletDescriptor } from '../shell/workspace.ts';
import { requestFirstOpenConsent, type NappletConsentReview } from './first-open-consent.ts';
import { loadPublishedArtifact, type PublishedArtifactSource } from './loader.ts';
import { openPublishedArtifactCache } from './published-artifact-cache.ts';
import { descriptorForPublishedArtifact, publishedHostInput } from './published-host-input.ts';
import { stageAdmittedPublishedArtifact } from './admitted-transfer.ts';
import type { NativePublishedTransferPort } from './native-transfer.ts';
import type { VerifiedNappletArtifact } from './verified-artifact.ts';

export class PublishedSessionError extends Error {
  readonly code = 'PUBLISHED_SESSION_FAILED';
  constructor() { super('The published napplet could not be opened'); this.name = 'PublishedSessionError'; }
}
const fail = (): never => { throw new PublishedSessionError(); };
const HEX64 = /^[0-9a-f]{64}$/;
const SESSION = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export interface PreparedPublishedSession {
  readonly descriptor: NappletDescriptor;
  readonly hostInput: string;
  /** Check the identity, accepted grant, and retained native-session lifetime. */
  assertActive(): void;
  revoke(): void;
}

export interface PublishedSessionDependencies {
  readonly identity: Pick<IdentityTransition, 'sessionAuthority' | 'getSnapshot'>;
  readonly database: ShellDatabase;
  readonly sqlite: SQLiteModule;
  readonly source: PublishedArtifactSource;
  readonly lookupRelays: () => readonly string[];
  readonly native: NativePublishedTransferPort;
  readonly newInstanceId: () => string;
}

function identifier(artifact: VerifiedNappletArtifact): string {
  return artifact.manifest.tags.find(tag => tag[0] === 'd')?.[1] ?? fail();
}

/** This coordinator is process-owned; no reference to it is passed into guest content. */
export function createPublishedSessionCoordinator(ports: PublishedSessionDependencies) {
  const prepare = async (request: Readonly<{ link?: string; pinned?: NappletDescriptor }>,
    externalSignal: AbortSignal, review: (request: NappletConsentReview) => Promise<boolean>): Promise<PreparedPublishedSession> => {
    const authority = ports.identity.sessionAuthority();
    const controller = new AbortController();
    const cancel = () => controller.abort();
    if (externalSignal.aborted) cancel();
    else externalSignal.addEventListener('abort', cancel, { once: true });
    const active = () => {
      if (controller.signal.aborted) fail();
      try { authority.assertActive(); } catch { fail(); }
      if (controller.signal.aborted) fail();
    };
    let registered: string | null = null;
    let success = false;
    try {
      active();
      const selected = request.pinned;
      if ((selected === undefined) === (request.link === undefined)) fail();
      if (selected && (selected.source !== 'published' || !HEX64.test(selected.publisher) ||
          !HEX64.test(selected.version) || !HEX64.test(selected.eventId ?? '') || !selected.appId)) fail();
      const link = request.link ?? naddrEncode({ kind: 35129, pubkey: selected!.publisher, identifier: selected!.appId });
      let artifact: VerifiedNappletArtifact | null = null;
      if (selected) {
        const owner: TrustedApp = Object.freeze({ user: authority.user, publisher: selected.publisher,
          appId: selected.appId, assertActive: active });
        const cache = await openPublishedArtifactCache(ports.sqlite, {
          owner, epoch: authority.epoch, currentEpoch: () => ports.identity.getSnapshot().session.epoch,
        });
        try { artifact = await cache.get(selected.appId, selected.eventId!, { signal: controller.signal }); }
        finally { await cache.close(); }
        active();
      }
      if (!artifact) artifact = await loadPublishedArtifact(link, { source: ports.source,
        lookupRelays: ports.lookupRelays(), signal: controller.signal, assertActive: active,
        ...(selected ? { pinnedEventId: selected.eventId! } : {}) });
      active();
      const id = selected?.id ?? ports.newInstanceId();
      if (!SESSION.test(id)) fail();
      const descriptor = descriptorForPublishedArtifact(artifact, id);
      if (selected && (selected.publisher !== descriptor.publisher || selected.appId !== descriptor.appId ||
          selected.version !== descriptor.version || selected.eventId !== descriptor.eventId ||
          selected.title !== descriptor.title)) fail();
      const owner: TrustedApp = Object.freeze({ user: authority.user, publisher: descriptor.publisher,
        appId: identifier(artifact), assertActive: active });
      const grant = ports.database.bindApp(owner);
      let admission;
      try {
        admission = await requestFirstOpenConsent(artifact, owner, grant.port, controller.signal, active, review);
      } finally { grant.revoke(); }
      active();
      const cache = await openPublishedArtifactCache(ports.sqlite, {
        owner, epoch: authority.epoch, currentEpoch: () => ports.identity.getSnapshot().session.epoch,
      });
      try { await cache.put(artifact, { signal: controller.signal }); }
      finally { await cache.close(); }
      active();
      if (!ports.native.registerPublishedSession(id)) fail();
      registered = id;
      const handle = await stageAdmittedPublishedArtifact(admission, artifact, id, ports.native,
        controller.signal, active);
      active();
      const hostInput = publishedHostInput(artifact, admission, descriptor, authority, handle);
      success = true;
      return Object.freeze({ descriptor, hostInput,
        assertActive: () => { active(); admission.assertActive(); },
        revoke: () => { controller.abort(); ports.native.revokePublishedSession(id); },
      });
    } catch { return fail(); }
    finally {
      externalSignal.removeEventListener('abort', cancel);
      if (!success) {
        controller.abort();
        if (registered) try { ports.native.revokePublishedSession(registered); } catch { /* Native owner also expires. */ }
      }
    }
  };
  return Object.freeze({
    openLink: (link: string, signal: AbortSignal, review: (request: NappletConsentReview) => Promise<boolean>) =>
      prepare({ link }, signal, review),
    reopenPinned: (descriptor: NappletDescriptor, signal: AbortSignal, review: (request: NappletConsentReview) => Promise<boolean>) =>
      prepare({ pinned: descriptor }, signal, review),
  });
}
