import { captureEventSnapshot, type EventSnapshot } from './event-snapshot.ts';
import { validateSignedEvent, type VerifiedSignedEvent } from './signed-event.ts';
import type { RelayOutcome } from '../network/relay-service.ts';

export type ApprovalOrigin = Readonly<{ sessionId: string; generation: string; epoch: number; user: string; publisher: string; appId: string; version: string; instanceId: string }>;
export type NativeApprovalLease = object;
export type NativeTakenApproval = Readonly<{ lease: NativeApprovalLease; origin: ApprovalOrigin; requestId: string; event: unknown }>;
export interface NativeApprovalLeasePort {
  take(token: string): NativeTakenApproval | null;
  isLive(lease: NativeApprovalLease): boolean;
  mayReview(lease: NativeApprovalLease): boolean;
  approveOnce(lease: NativeApprovalLease): boolean;
  isApproved(lease: NativeApprovalLease): boolean;
  cancel(lease: NativeApprovalLease): void;
  dismiss(lease: NativeApprovalLease): void;
  resume(): void;
  finish(lease: NativeApprovalLease, response?: string | null): void;
}
export type EffectAuthority = Readonly<{ assertActive(): void; signal: AbortSignal }>;
export interface ApprovalEffects {
  sign(snapshot: EventSnapshot, execution: EffectAuthority): Promise<unknown>;
  publishEvent(event: VerifiedSignedEvent, destinations: readonly string[], execution: EffectAuthority): Promise<readonly RelayOutcome[]>;
}
export interface TrustedApprovalOwner { assertActive(origin: ApprovalOrigin): void }
export type ApprovalItem = Readonly<{ id: string; origin: ApprovalOrigin; event: EventSnapshot }>;
export type ApprovalSnapshot = Readonly<{ focusedSessionId: string | null; reviewPaused: boolean; current: ApprovalItem | null; pending: number; pendingSessionIds: readonly string[] }>;
type Entry = ApprovalItem & { requestId: string; lease: NativeApprovalLease; controller: AbortController | null };
const PER_SESSION = 4, GLOBAL = 16;
let nextPresentationId = 0;
const OUTCOME_STATUSES = new Set<RelayOutcome['status']>(['accepted', 'rejected', 'unknown', 'cancelled-before-send']);

function denied(): never { throw new Error('APPROVAL_DENIED'); }
function captureOrigin(origin: ApprovalOrigin): ApprovalOrigin {
  return Object.freeze({ sessionId: origin.sessionId, generation: origin.generation, epoch: origin.epoch, user: origin.user,
    publisher: origin.publisher, appId: origin.appId, version: origin.version, instanceId: origin.instanceId });
}
function current(entries: readonly Entry[], focus: string | null, paused: boolean, native: NativeApprovalLeasePort): ApprovalItem | null {
  if (paused || focus === null) return null;
  const entry = entries.find(item => item.origin.sessionId === focus && item.controller === null && native.mayReview(item.lease));
  return entry ? Object.freeze({ id: entry.id, origin: entry.origin, event: entry.event }) : null;
}
function captureOutcomes(value: unknown, destinations: readonly string[], eventId: string): readonly RelayOutcome[] {
  if (!Array.isArray(value) || value.length !== destinations.length) denied();
  const rows: RelayOutcome[] = [];
  for (let index = 0; index < value.length; index++) {
    const indexed = Object.getOwnPropertyDescriptor(value, String(index));
    if (!indexed || !('value' in indexed)) denied();
    const row = indexed.value;
    if (row === null || typeof row !== 'object') denied();
    const relay = Object.getOwnPropertyDescriptor(row, 'relay');
    const id = Object.getOwnPropertyDescriptor(row, 'eventId');
    const status = Object.getOwnPropertyDescriptor(row, 'status');
    const reason = Object.getOwnPropertyDescriptor(row, 'reason');
    if (!relay || !id || !status || !reason || !('value' in relay) || !('value' in id) || !('value' in status) || !('value' in reason) ||
      relay.value !== destinations[index] || id.value !== eventId || typeof status.value !== 'string' || !OUTCOME_STATUSES.has(status.value as RelayOutcome['status']) ||
      typeof reason.value !== 'string' || reason.value.length > 4096) denied();
    rows.push(Object.freeze({ relay: relay.value, eventId: id.value, status: status.value as RelayOutcome['status'], reason: reason.value }));
  }
  return Object.freeze(rows);
}

/** Presentation-only approval queue. Native code owns admission, expiry, keys, and lifecycle authority. */
export class ApprovalService {
  private readonly native: NativeApprovalLeasePort;
  private readonly owner: TrustedApprovalOwner;
  private readonly effects: ApprovalEffects;
  private entries: Entry[] = [];
  private listeners = new Set<() => void>();
  private focusedSessionId: string | null = null;
  private reviewPaused = false;
  private foregrounded = true;
  private snapshot: ApprovalSnapshot;
  constructor(native: NativeApprovalLeasePort, owner: TrustedApprovalOwner, effects: ApprovalEffects) {
    this.native = native; this.owner = owner; this.effects = effects;
    this.snapshot = Object.freeze({ focusedSessionId: null, reviewPaused: false, current: null, pending: 0, pendingSessionIds: Object.freeze([]) });
  }
  subscribe(listener: () => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
  getSnapshot = (): ApprovalSnapshot => this.snapshot;
  private publish() {
    let shown: ApprovalItem | null = null;
    try { shown = current(this.entries, this.focusedSessionId, this.reviewPaused || !this.foregrounded, this.native); } catch { shown = null; }
    const next = Object.freeze({ focusedSessionId: this.focusedSessionId, reviewPaused: this.reviewPaused, current: shown, pending: this.entries.length, pendingSessionIds: Object.freeze([...new Set(this.entries.map(entry => entry.origin.sessionId))]) });
    if (next.focusedSessionId === this.snapshot.focusedSessionId && next.reviewPaused === this.snapshot.reviewPaused && next.pending === this.snapshot.pending && next.current?.id === this.snapshot.current?.id && next.pendingSessionIds.join() === this.snapshot.pendingSessionIds.join()) return;
    this.snapshot = next;
    for (const listener of this.listeners) try { listener(); } catch { /* UI observers never hold approval authority. */ }
  }
  private end(entry: Entry, cancel: boolean, response: string | null = null) {
    if (!this.entries.includes(entry)) return;
    this.entries = this.entries.filter(item => item !== entry);
    try { if (cancel) this.native.cancel(entry.lease); } catch { /* Native lease remains authoritative. */ }
    try { entry.controller?.abort(); } catch { /* Effect cleanup cannot skip native terminal cleanup. */ }
    try { this.native.finish(entry.lease, response); } catch { /* Terminal native cleanup. */ }
  }
  refresh() {
    for (const entry of this.entries) { try { if (!this.native.isLive(entry.lease)) this.end(entry, false); } catch { this.end(entry, true); } }
    this.publish();
  }
  enqueue(token: string, destinationsFromTrustedConfig: unknown, expectedOrigin?: ApprovalOrigin): boolean {
    this.refresh();
    let taken: NativeTakenApproval | null;
    try { taken = this.native.take(token); } catch { return false; }
    if (!taken) return false;
    try {
      if (expectedOrigin && Object.keys(captureOrigin(expectedOrigin)).some(key => taken.origin[key as keyof ApprovalOrigin] !== expectedOrigin[key as keyof ApprovalOrigin])) denied();
      this.owner.assertActive(taken.origin);
      const event = captureEventSnapshot(taken.event, taken.origin.user, destinationsFromTrustedConfig);
      if (event.event.kind === 22242 || this.entries.length >= GLOBAL || this.entries.filter(entry => entry.origin.sessionId === taken!.origin.sessionId).length >= PER_SESSION) denied();
      if (nextPresentationId >= Number.MAX_SAFE_INTEGER) denied();
      this.entries.push({ requestId: taken.requestId, id: `approval_${++nextPresentationId}`, origin: captureOrigin(taken.origin), event, lease: taken.lease, controller: null });
      this.publish(); return true;
    } catch {
      try { this.native.cancel(taken.lease); } catch { /* Rejecting admission must still finish the lease. */ }
      try { this.native.finish(taken.lease); } catch { /* Native cleanup failures cannot grant presentation. */ }
      return false;
    }
  }
  focus(sessionId: string | null) { for (const entry of this.entries) if (entry.controller && entry.origin.sessionId === this.focusedSessionId && sessionId !== this.focusedSessionId) this.end(entry, true); this.focusedSessionId = sessionId; this.publish(); }
  foreground() { this.foregrounded = true; this.publish(); }
  resume() {
    if (this.foregrounded && this.focusedSessionId !== null) {
      try { this.native.resume(); this.reviewPaused = false; } catch { /* Native review stays unavailable. */ }
    }
    this.publish();
  }
  reject(id: string) {
    this.refresh();
    if (this.snapshot.current?.id !== id) return;
    const entry = this.entries.find(candidate => candidate.id === id)!;
    this.end(entry, true); this.publish();
  }
  dismiss(id: string) {
    this.refresh();
    const item = this.snapshot.current;
    if (!item || item.id !== id) return;
    const entry = this.entries.find(candidate => candidate.id === id)!;
    try { this.native.dismiss(entry.lease); } catch { /* Cancel below still revokes the request. */ }
    this.end(entry, true); this.reviewPaused = true; this.publish();
  }
  background() {
    this.foregrounded = false;
    this.reviewPaused = true;
    for (const entry of this.entries) if (entry.controller !== null) this.end(entry, true);
    this.publish();
  }
  close(sessionId: string) { for (const entry of this.entries) if (entry.origin.sessionId === sessionId) this.end(entry, true); this.publish(); }
  revisionChanged(epoch: number) { for (const entry of this.entries) if (entry.origin.epoch !== epoch) this.end(entry, true); this.publish(); }
  private authority(entry: Entry): EffectAuthority {
    const assertActive = () => {
      if (!this.foregrounded || this.reviewPaused || this.focusedSessionId !== entry.origin.sessionId || entry.controller?.signal.aborted || !this.entries.includes(entry)) denied();
      try { if (!this.native.isLive(entry.lease) || !this.native.isApproved(entry.lease)) denied(); } catch { denied(); }
      this.owner.assertActive(entry.origin);
    };
    return Object.freeze({ assertActive, signal: entry.controller!.signal });
  }
  async approve(id: string): Promise<readonly RelayOutcome[]> {
    this.refresh();
    const item = this.snapshot.current;
    if (!item || item.id !== id) denied();
    const entry = this.entries.find(candidate => candidate.id === id)!;
    let response: string | null = null;
    try {
      this.owner.assertActive(entry.origin);
      if (!this.native.mayReview(entry.lease) || !this.native.approveOnce(entry.lease)) denied();
      entry.controller = new AbortController(); this.publish();
      const execution = this.authority(entry);
      execution.assertActive();
      const signed = await this.effects.sign(entry.event, execution);
      execution.assertActive();
      const verified = validateSignedEvent(entry.event, signed);
      execution.assertActive();
      const outcomes = await this.effects.publishEvent(verified, entry.event.destinations, execution);
      execution.assertActive();
      const captured = captureOutcomes(outcomes, entry.event.destinations, verified.id);
      const accepted = captured.some(row => row.status === 'accepted');
      const completedResponse = JSON.stringify({ type: 'relay.publish.result', id: entry.requestId, ok: accepted,
        ...(accepted ? { event: verified, eventId: verified.id } : { error: captured.some(row => row.status === 'unknown') ? 'publication result unknown' : 'no relay accepted the event' }) });
      execution.assertActive();
      response = completedResponse;
      return captured;
    } finally { this.end(entry, response === null, response); this.publish(); }
  }
}
