import { decodeNativeRequest } from './capability-protocol.ts';
import { text } from '../storage/codec.ts';
import type { NativeApprovalLease, NativeApprovalLeasePort } from '../security/approval-service.ts';

export interface ApprovalModule {
  takeApproval(token: string): string | null;
  isApprovalLive(token: string): boolean;
  mayReviewApproval(token: string): boolean;
  approveApproval(token: string): boolean;
  isApprovalApproved(token: string): boolean;
  dismissApproval(token: string): void;
  cancelApproval(token: string): void;
  finishApproval(token: string, response: string | null): void;
  resumeApprovals(): void;
}
/** Native tokens stay private to the adapter; a guest cannot manufacture a lease object. */
export function createNativeApprovalPort(module: ApprovalModule): NativeApprovalLeasePort {
  const tokens = new WeakMap<NativeApprovalLease, string>();
  const tokenFor = (lease: NativeApprovalLease): string => {
    const token = tokens.get(lease);
    if (!token) throw new Error('APPROVAL_DENIED');
    return token;
  };
  return Object.freeze<NativeApprovalLeasePort>({
    take(token: string) {
      const raw = module.takeApproval(token);
      if (raw === null) return null;
      try {
        const { registration, request } = decodeNativeRequest(raw);
        if (!registration.domains.includes('relay') || !request || typeof request !== 'object' || Array.isArray(request)) throw new Error('APPROVAL_DENIED');
        const fields = Object.keys(request);
        const value = request as Record<string, unknown>;
        if (fields.length !== 3 || !fields.includes('event') || value.type !== 'relay.publish') throw new Error('APPROVAL_DENIED');
        const requestId = text(value.id, 128);
        const lease = Object.freeze({});
        tokens.set(lease, token);
        return Object.freeze({ lease, origin: registration, requestId, event: value.event });
      } catch {
        try { module.cancelApproval(token); } finally { module.finishApproval(token, null); }
        return null;
      }
    },
    isLive: lease => module.isApprovalLive(tokenFor(lease)),
    mayReview: lease => module.mayReviewApproval(tokenFor(lease)),
    approveOnce: lease => module.approveApproval(tokenFor(lease)),
    isApproved: lease => module.isApprovalApproved(tokenFor(lease)),
    dismiss: lease => module.dismissApproval(tokenFor(lease)),
    cancel: lease => module.cancelApproval(tokenFor(lease)),
    resume: () => module.resumeApprovals(),
    finish(lease, response = null) {
      const token = tokenFor(lease);
      tokens.delete(lease);
      module.finishApproval(token, response);
    },
  });
}
