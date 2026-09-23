import type { IdentityTransition } from './identity-transition.ts';
import type { ApprovalOrigin, TrustedApprovalOwner } from './approval-service.ts';
import { resolveBundledSession } from '../shell/fixtures.ts';

/** Resolve persisted descriptors through the same trusted catalogue as native registration. */
export function createApprovalOwner(identity: Pick<IdentityTransition, 'getSnapshot' | 'sessionAuthority'>): TrustedApprovalOwner {
  return Object.freeze({ assertActive(origin: ApprovalOrigin) {
    const authority = identity.sessionAuthority();
    authority.assertActive();
    const state = identity.getSnapshot().session.workspace.getSnapshot();
    const session = state.workspace.sessions.find(value => value.id === origin.sessionId);
    if (authority.epoch !== origin.epoch || authority.user !== origin.user || state.error !== null || !session) throw new Error('APPROVAL_DENIED');
    const catalog = resolveBundledSession(session);
    if (!catalog.domains.includes('relay') || catalog.publisher !== origin.publisher || catalog.appId !== origin.appId ||
        catalog.version !== origin.version || catalog.instanceId !== origin.instanceId) throw new Error('APPROVAL_DENIED');
  } });
}
