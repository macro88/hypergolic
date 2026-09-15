import { IdentityVault, VaultError, type VaultSnapshot } from './identity-vault.ts';
import type { ShellDatabase } from '../storage/database.ts';
import { openWorkspaceController, type WorkspaceController } from '../storage/workspace-controller.ts';
import type { Workspace } from '../shell/workspace.ts';
import { isExpectedDeletion } from './identity-deletion.ts';

export interface IdentityChange { readonly pubkey: string; readonly kind: 'import' | 'select' }
export interface IdentitySession {
  readonly vault: VaultSnapshot;
  readonly workspace: WorkspaceController;
  readonly epoch: number;
}
export interface TransitionSnapshot {
  readonly phase: 'ready' | 'confirming' | 'switching' | 'deleting' | 'recovery';
  readonly session: IdentitySession;
  readonly pending: IdentityChange | null;
  readonly failure: 'CHANGE_REJECTED' | 'LIMIT_REACHED' | 'DELETION_REJECTED' | 'DELETION_PENDING' | null;
}
export interface TransitionPorts {
  readonly vault: Pick<IdentityVault, 'getSnapshot' | 'select' | 'importNsec'> & Partial<Pick<IdentityVault, 'deleteIdentity'>>;
  readonly database: ShellDatabase;
  readonly publicKeyFromNsec: (input: string) => string;
  readonly seed: () => Workspace;
  readonly assertAvailable: (workspace: Workspace) => void;
}
export class IdentityChangeError extends Error {
  readonly code: 'BUSY' | 'STALE' | 'RECOVERY_REQUIRED';
  constructor(code: IdentityChangeError['code']) { super(code); this.code = code; this.name = 'IdentityChangeError'; }
}

/** Trusted UI only. Pending secrets never appear in snapshots or error messages. */
export class IdentityTransition {
  private state!: TransitionSnapshot;
  private input: string | null = null;
  private readonly listeners = new Set<() => void>();
  private readonly ports: TransitionPorts;
  private constructor(ports: TransitionPorts) { this.ports = ports; }
  static async open(ports: TransitionPorts): Promise<IdentityTransition> {
    const owner = new IdentityTransition(ports);
    const vault = ports.vault.getSnapshot();
    const workspace = await owner.openWorkspace(vault, 0, ports.seed);
    owner.state = Object.freeze({ phase: 'ready', session: Object.freeze({ vault, workspace, epoch: 0 }), pending: null, failure: null });
    return owner;
  }
  getSnapshot = (): TransitionSnapshot => this.state;
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(phase: TransitionSnapshot['phase'], session = this.state.session, pending: IdentityChange | null = null, failure: TransitionSnapshot['failure'] = null): void {
    this.state = Object.freeze({ phase, session, pending, failure });
    for (const listener of this.listeners) listener();
  }
  private async openWorkspace(vault: VaultSnapshot, epoch: number, seed: () => Workspace): Promise<WorkspaceController> {
    const binding = this.ports.database.bindWorkspace({ user: vault.selectedPubkey, assertActive: () => {
      const actual = this.ports.vault.getSnapshot();
      const accepted = this.state?.session;
      const revision = accepted?.epoch === epoch ? accepted.vault.revision : vault.revision;
      if (actual.vaultId !== vault.vaultId || actual.selectedPubkey !== vault.selectedPubkey || actual.revision !== revision ||
          (this.state && this.state.session.epoch > epoch)) throw new IdentityChangeError('STALE');
    } });
    return openWorkspaceController(binding, seed, this.ports.assertAvailable);
  }
  private requireReady(): void { if (this.state.phase !== 'ready') throw new IdentityChangeError('BUSY'); }
  private prepare(pubkey: string, kind: IdentityChange['kind'], input: string | null): IdentityChange | null {
    if (pubkey === this.state.session.vault.selectedPubkey) return null;
    const pending = Object.freeze({ pubkey, kind });
    this.input = input;
    this.publish('confirming', this.state.session, pending);
    return pending;
  }
  prepareSelect(pubkey: string): IdentityChange | null {
    this.requireReady();
    if (!this.state.session.vault.identities.some(identity => identity.pubkey === pubkey && identity.status === 'active')) throw new VaultError('NOT_FOUND');
    return this.prepare(pubkey, 'select', null);
  }
  prepareImport(input: string): IdentityChange | null {
    this.requireReady();
    const pubkey = this.ports.publicKeyFromNsec(input);
    const known = this.state.session.vault.identities.some(identity => identity.pubkey === pubkey);
    return this.prepare(pubkey, known ? 'select' : 'import', known ? null : input.trim());
  }
  cancel(pending: IdentityChange): void {
    if (this.state.phase !== 'confirming' || this.state.pending !== pending) return;
    this.input = null;
    this.publish('ready');
  }
  /** Call from the trusted confirmation button with its exact current snapshot. */
  async confirm(pending: IdentityChange): Promise<void> {
    if (this.state.phase !== 'confirming' || this.state.pending !== pending) throw new IdentityChangeError('STALE');
    const previous = this.state.session;
    let input = this.input;
    this.input = null;
    previous.workspace.freeze();
    this.publish('switching');
    try {
      await previous.workspace.flush();
      if (previous.workspace.getSnapshot().error !== null) throw new IdentityChangeError('RECOVERY_REQUIRED');
      const carried = previous.workspace.getSnapshot().workspace;
      const vault = pending.kind === 'import' && input !== null
        ? await this.ports.vault.importNsec(input) : await this.ports.vault.select(pending.pubkey);
      if (vault.selectedPubkey !== pending.pubkey) throw new IdentityChangeError('RECOVERY_REQUIRED');
      previous.workspace.revoke();
      const epoch = previous.epoch + 1;
      const workspace = await this.openWorkspace(vault, epoch, () => carried);
      workspace.change(carried);
      await workspace.flush();
      if (workspace.getSnapshot().error !== null) throw new IdentityChangeError('RECOVERY_REQUIRED');
      this.publish('ready', Object.freeze({ vault, workspace, epoch }));
    } catch (error) {
      this.failedChange(previous, error);
      throw error instanceof VaultError ? error : new IdentityChangeError('RECOVERY_REQUIRED');
    } finally { input = null; }
  }
  /** Call only from the trusted deletion confirmation with its exact captured session. */
  async deleteInactive(pubkey: string, expected: IdentitySession): Promise<void> {
    this.requireReady();
    if (this.state.session !== expected) throw new IdentityChangeError('STALE');
    const base = expected.vault;
    if (!base.identities.some(identity => identity.pubkey === pubkey)) throw new VaultError('NOT_FOUND');
    if (pubkey === base.selectedPubkey || base.identities.length < 2) throw new VaultError('DELETE_SELECTED');
    if (base.pendingDeletion !== null && base.pendingDeletion !== pubkey) throw new VaultError('PENDING_DELETION');
    if (!this.ports.vault.deleteIdentity) throw new VaultError('AUTHORIZATION_DENIED');
    expected.workspace.freeze();
    this.publish('deleting');
    try {
      await expected.workspace.flush();
      if (expected.workspace.getSnapshot().error !== null || JSON.stringify(this.ports.vault.getSnapshot()) !== JSON.stringify(base)) {
        throw new IdentityChangeError('RECOVERY_REQUIRED');
      }
      const vault = await this.ports.vault.deleteIdentity(pubkey);
      if (!isExpectedDeletion(base, vault, pubkey, true) || JSON.stringify(vault) !== JSON.stringify(this.ports.vault.getSnapshot())) {
        throw new IdentityChangeError('RECOVERY_REQUIRED');
      }
      this.publish('ready', Object.freeze({ ...expected, vault }));
      expected.workspace.resume();
    } catch (error) {
      this.failedDeletion(expected, pubkey, error);
      throw error instanceof VaultError ? error : new IdentityChangeError('RECOVERY_REQUIRED');
    }
  }
  private failedDeletion(previous: IdentitySession, target: string, error: unknown): void {
    if (error instanceof VaultError && error.code === 'AUTHORIZATION_DENIED' && previous.workspace.getSnapshot().error === null) {
      try {
        const vault = this.ports.vault.getSnapshot();
        if (isExpectedDeletion(previous.vault, vault, target, false)) {
          const session = JSON.stringify(vault) === JSON.stringify(previous.vault) ? previous : Object.freeze({ ...previous, vault });
          this.publish('ready', session, null, vault.pendingDeletion === null ? 'DELETION_REJECTED' : 'DELETION_PENDING');
          previous.workspace.resume();
          return;
        }
      } catch { /* Unknown deletion outcomes require reopening the durable journal. */ }
    }
    previous.workspace.revoke();
    this.publish('recovery');
  }
  private failedChange(previous: IdentitySession, error: unknown): void {
    let unchanged = false;
    try {
      const current = this.ports.vault.getSnapshot();
      unchanged = current.selectedPubkey === previous.vault.selectedPubkey && current.revision === previous.vault.revision;
    } catch { /* An uncertain vault must stay unavailable until restart. */ }
    if (unchanged && previous.workspace.getSnapshot().error === null && error instanceof VaultError &&
        ['INVALID_NSEC', 'NOT_FOUND', 'LIMIT_REACHED', 'PENDING_DELETION'].includes(error.code)) {
      previous.workspace.resume();
      this.publish('ready', previous, null, error.code === 'LIMIT_REACHED' ? 'LIMIT_REACHED' : 'CHANGE_REJECTED');
    } else {
      previous.workspace.revoke();
      this.publish('recovery');
    }
  }
  /** Capture once when registering native capabilities; never accept a caller's identity. */
  sessionAuthority(): { readonly user: string; readonly epoch: number; assertActive(): void } {
    const session = this.state.session;
    return Object.freeze({ user: session.vault.selectedPubkey, epoch: session.epoch, assertActive: () => {
      const current = this.state;
      if ((current.phase !== 'ready' && current.phase !== 'confirming') || current.session.workspace !== session.workspace || current.session.epoch !== session.epoch) throw new IdentityChangeError('STALE');
      const actual = this.ports.vault.getSnapshot();
      if (actual.vaultId !== session.vault.vaultId || actual.selectedPubkey !== session.vault.selectedPubkey || actual.revision !== current.session.vault.revision) throw new IdentityChangeError('STALE');
    } });
  }
}
