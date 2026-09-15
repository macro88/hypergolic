import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { IdentityTransition, IdentityChangeError } from '../../src/security/identity-transition.ts';
import { VaultError } from '../../src/security/identity-vault.ts';
import { Integrated, pubkey } from '../security/harness.ts';
import { initialTestWorkspace, bundledUXDescriptor, assertBundledWorkspace } from '../../src/shell/fixtures.ts';
import { emptyWorkspace, openNapplet } from '../../src/shell/workspace.ts';
import { setup, deferred, registration } from './harness.ts';

async function start(t: TestContext) {
  const protectedStore = new Integrated();
  t.after(() => protectedStore.sqlite.cleanup());
  const native = await protectedStore.owner();
  await native.vault.open();
  const storage = await setup(t);
  const ports = { vault: native.vault, database: storage.database, seed: initialTestWorkspace, assertAvailable: assertBundledWorkspace,
    publicKeyFromNsec: (input: string) => { const n = /^nsec1fixture-(\d+)$/.exec(input.trim())?.[1]; if (!n) throw new VaultError('INVALID_NSEC'); return pubkey(Number(n)); } };
  return { ...storage, protectedStore, native, ports, transition: await IdentityTransition.open(ports) };
}
function request(owner: IdentityTransition, input = 'nsec1fixture-2') {
  const pending = owner.prepareImport(input); assert(pending); return pending;
}

test('invalid input, cancelling import and stale confirmation preserve the live workspace and vault', async t => {
  const { transition, native, protectedStore } = await start(t);
  const before = transition.getSnapshot().session;
  const calls = protectedStore.secure.calls.length;
  assert.throws(() => transition.prepareImport('not-a-key'), { code: 'INVALID_NSEC' });
  assert.equal(transition.getSnapshot().session, before);
  const pending = request(transition);
  assert.equal(JSON.stringify(transition.getSnapshot()).includes('nsec1fixture'), false);
  assert.equal(native.vault.getSnapshot().identities.length, 1);
  transition.cancel(pending);
  assert.equal(transition.getSnapshot().session, before);
  await assert.rejects(transition.confirm(pending), { code: 'STALE' });
  assert.equal(protectedStore.secure.calls.length, calls);
});

test('import persists selection, retains loaded order/focus and revokes every old authority', async t => {
  const { transition, native, database } = await start(t);
  const previous = transition.getSnapshot().session;
  const oldAuthority = transition.sessionAuthority();
  const oldStrings = database.bindStorage(registration({ user: oldAuthority.user, assertActive: oldAuthority.assertActive }));
  await oldStrings.port.set('state', 'first identity');
  await transition.confirm(request(transition));
  const current = transition.getSnapshot();
  assert.equal(current.phase, 'ready');
  assert.equal(current.session.vault.selectedPubkey, pubkey(2));
  assert.equal(current.session.vault.identities.length, 2);
  assert.equal(native.vault.getSnapshot().selectedPubkey, pubkey(2));
  assert.equal(current.session.epoch, previous.epoch + 1);
  assert.notEqual(current.session.workspace, previous.workspace);
  assert.deepEqual(current.session.workspace.getSnapshot().workspace, previous.workspace.getSnapshot().workspace);
  assert.equal(previous.workspace.getSnapshot().error, 'REVOKED');
  assert.throws(oldAuthority.assertActive, { code: 'STALE' });
  await assert.rejects(oldStrings.port.get('state'), { code: 'REVOKED' });
  const authority = transition.sessionAuthority();
  assert.equal(await database.bindStorage(registration({ user: authority.user, assertActive: authority.assertActive })).port.get('state'), null);
  const back = transition.prepareSelect(pubkey(1)); assert(back);
  await transition.confirm(back);
  const restored = transition.sessionAuthority();
  assert.equal(await database.bindStorage(registration({ user: restored.user, assertActive: restored.assertActive })).port.get('state'), 'first identity');
});

test('duplicate/current import is a no-op; duplicate saved import selects without adding another identity', async t => {
  const { transition } = await start(t);
  assert.equal(transition.prepareImport('nsec1fixture-1'), null);
  assert.equal(transition.getSnapshot().session.epoch, 0);
  await transition.confirm(request(transition));
  const back = request(transition, ' nsec1fixture-1 ');
  assert.equal(back.kind, 'select');
  await transition.confirm(back);
  assert.equal(transition.getSnapshot().session.vault.identities.length, 2);
  assert.equal(transition.getSnapshot().session.vault.selectedPubkey, pubkey(1));
});

test('selection/import are single-flight, frozen workspace ignores late callbacks, and capabilities pause during commit', async t => {
  const { transition, sqlite } = await start(t);
  const pending = request(transition);
  const previous = transition.getSnapshot().session;
  const authority = transition.sessionAuthority();
  const gate = deferred(), entered = deferred();
  sqlite.onStep = async sql => { if (sql.startsWith('UPDATE workspaces')) { entered.resolve(); await gate.promise; } };
  previous.workspace.change(openNapplet(initialTestWorkspace(), bundledUXDescriptor(4)));
  const switching = transition.confirm(pending);
  await entered.promise;
  assert.equal(transition.getSnapshot().phase, 'switching');
  assert.throws(authority.assertActive, { code: 'STALE' });
  assert.throws(() => transition.prepareSelect(pubkey(1)), { code: 'BUSY' });
  await assert.rejects(transition.confirm(pending), { code: 'STALE' });
  transition.cancel(pending);
  previous.workspace.change(emptyWorkspace());
  assert.equal(previous.workspace.getSnapshot().workspace.sessions.length, 4);
  gate.resolve(); await switching;
  assert.equal(transition.getSnapshot().session.workspace.getSnapshot().workspace.sessions.length, 4);
});

test('explicit empty workspace carries through selection and ordinary restart without fixture reseeding', async t => {
  const { transition, ports } = await start(t);
  transition.getSnapshot().session.workspace.change(emptyWorkspace());
  await transition.confirm(request(transition));
  assert.equal(transition.getSnapshot().session.workspace.getSnapshot().workspace.sessions.length, 0);
  const restarted = await IdentityTransition.open(ports);
  assert.equal(restarted.getSnapshot().session.vault.selectedPubkey, pubkey(2));
  assert.equal(restarted.getSnapshot().session.workspace.getSnapshot().workspace.sessions.length, 0);
});

test('known precommit validation failure keeps the same mounted session and permits later workspace changes', async t => {
  const { ports, transition } = await start(t);
  const before = transition.getSnapshot().session;
  ports.vault.importNsec = async () => { throw new VaultError('LIMIT_REACHED'); };
  await assert.rejects(transition.confirm(request(transition)), { code: 'LIMIT_REACHED' });
  assert.equal(transition.getSnapshot().phase, 'ready');
  assert.equal(transition.getSnapshot().session, before);
  assert.equal(transition.getSnapshot().failure, 'LIMIT_REACHED');
  before.workspace.change(emptyWorkspace()); await before.workspace.flush();
  assert.equal(before.workspace.getSnapshot().workspace.sessions.length, 0);
  transition.sessionAuthority().assertActive();
});

test('source persistence failure stops before identity mutation and preserves saved data', async t => {
  const { transition, sqlite, native } = await start(t);
  sqlite.faults.push({ prefix: 'UPDATE workspaces', mode: 'before' });
  transition.getSnapshot().session.workspace.change(emptyWorkspace());
  await assert.rejects(transition.confirm(request(transition)), { code: 'RECOVERY_REQUIRED' });
  assert.equal(native.vault.getSnapshot().selectedPubkey, pubkey(1));
  assert.equal(transition.getSnapshot().phase, 'recovery');
  assert.throws(transition.sessionAuthority().assertActive, IdentityChangeError);
});

test('lost destination commit acknowledgement requires restart; no old identity is exposed under the new selection', async t => {
  const { transition, sqlite, native, ports } = await start(t);
  sqlite.faults.push({ prefix: 'COMMIT', mode: 'after' });
  await assert.rejects(transition.confirm(request(transition)), { code: 'RECOVERY_REQUIRED' });
  assert.equal(transition.getSnapshot().phase, 'recovery');
  assert.equal(native.vault.getSnapshot().selectedPubkey, pubkey(2));
  assert.throws(transition.sessionAuthority().assertActive, { code: 'STALE' });
  const restarted = await IdentityTransition.open(ports);
  assert.equal(restarted.getSnapshot().session.vault.selectedPubkey, pubkey(2));
  assert.equal(restarted.getSnapshot().session.workspace.getSnapshot().workspace.sessions.length, 3);
});

test('corrupt destination workspace is preserved and blocks entry after durable selection', async t => {
  const { transition, sqlite } = await start(t);
  sqlite.raw().prepare('INSERT INTO workspaces (user, revision, payload) VALUES (?, ?, ?)').run(pubkey(2), 0, 'invalid fixture data');
  await assert.rejects(transition.confirm(request(transition)), { code: 'RECOVERY_REQUIRED' });
  assert.equal(transition.getSnapshot().phase, 'recovery');
  assert.equal(sqlite.raw().prepare('SELECT payload FROM workspaces WHERE user = ?').get(pubkey(2))?.payload, 'invalid fixture data');
});

test('deleting an inactive identity preserves the live workspace, capability authority and selected saved data', async t => {
  const { transition, database, native } = await start(t);
  await transition.confirm(request(transition));
  const before = transition.getSnapshot().session, authority = transition.sessionAuthority();
  const strings = database.bindStorage(registration({ user: authority.user, assertActive: authority.assertActive }));
  await strings.port.set('draft', 'retained current identity');
  before.workspace.change(openNapplet(before.workspace.getSnapshot().workspace, bundledUXDescriptor(4)));
  await transition.deleteInactive(pubkey(1), before);
  const after = transition.getSnapshot();
  assert.equal(after.phase, 'ready'); assert.equal(after.session.workspace, before.workspace);
  assert.equal(after.session.epoch, before.epoch); assert.equal(after.session.vault.selectedPubkey, pubkey(2));
  assert.equal(after.session.vault.revision, before.vault.revision + 1);
  assert.deepEqual(after.session.vault.identities.map(item => item.pubkey), [pubkey(2)]);
  authority.assertActive(); assert.equal(await strings.port.get('draft'), 'retained current identity');
  assert.equal(before.workspace.getSnapshot().workspace.sessions.length, 4);
  before.workspace.change(emptyWorkspace()); await before.workspace.flush();
  assert.equal(before.workspace.getSnapshot().error, null);
  assert.equal((await native.vault.open()).identities.length, 1);
});

test('rejected deletion keeps the mounted session, while selected, absent and stale targets never authenticate', async t => {
  const { transition, protectedStore } = await start(t);
  const original = transition.getSnapshot().session;
  await assert.rejects(transition.deleteInactive(pubkey(1), original), { code: 'DELETE_SELECTED' });
  await assert.rejects(transition.deleteInactive(pubkey(7), original), { code: 'NOT_FOUND' });
  assert.equal(protectedStore.authCalls, 0);
  await transition.confirm(request(transition)); const selected = transition.getSnapshot().session;
  await assert.rejects(transition.deleteInactive(pubkey(1), original), { code: 'STALE' });
  protectedStore.authActive = false;
  await assert.rejects(transition.deleteInactive(pubkey(1), selected), { code: 'AUTHORIZATION_DENIED' });
  assert.equal(transition.getSnapshot().session, selected);
  assert.equal(transition.getSnapshot().failure, 'DELETION_REJECTED');
  transition.sessionAuthority().assertActive();
  selected.workspace.change(emptyWorkspace()); await selected.workspace.flush();
  assert.equal(selected.workspace.getSnapshot().error, null);
});

test('deletion freezes and flushes workspace before authenticating, and prevents concurrent identity changes', async t => {
  const { transition, sqlite, protectedStore } = await start(t);
  await transition.confirm(request(transition)); const before = transition.getSnapshot().session;
  const gate = deferred(), entered = deferred();
  sqlite.onStep = async sql => { if (sql.startsWith('UPDATE workspaces')) { entered.resolve(); await gate.promise; } };
  before.workspace.change(openNapplet(before.workspace.getSnapshot().workspace, bundledUXDescriptor(4)));
  const deletion = transition.deleteInactive(pubkey(1), before); await entered.promise;
  assert.equal(transition.getSnapshot().phase, 'deleting'); assert.equal(protectedStore.authCalls, 0);
  assert.throws(transition.sessionAuthority().assertActive, { code: 'STALE' });
  assert.throws(() => transition.prepareSelect(pubkey(1)), { code: 'BUSY' });
  await assert.rejects(transition.deleteInactive(pubkey(1), before), { code: 'BUSY' });
  before.workspace.change(emptyWorkspace()); assert.equal(before.workspace.getSnapshot().workspace.sessions.length, 4);
  gate.resolve(); await deletion; assert.equal(protectedStore.authCalls, 1);
});

test('failed workspace persistence stops deletion before authentication or key removal', async t => {
  const { transition, sqlite, protectedStore, native } = await start(t);
  await transition.confirm(request(transition)); const before = transition.getSnapshot().session;
  sqlite.faults.push({ prefix: 'UPDATE workspaces', mode: 'before' }); before.workspace.change(emptyWorkspace());
  await assert.rejects(transition.deleteInactive(pubkey(1), before), { code: 'RECOVERY_REQUIRED' });
  assert.equal(protectedStore.authCalls, 0); assert.equal(native.vault.getSnapshot().identities.length, 2);
  assert.equal(transition.getSnapshot().phase, 'recovery');
});

test('unexpected inventory changes and uncertain delete outcomes revoke the live session', async t => {
  for (const mode of ['changed', 'uncertain'] as const) {
    const { transition, ports } = await start(t);
    await transition.confirm(request(transition)); const before = transition.getSnapshot().session;
    const authority = transition.sessionAuthority();
    ports.vault.deleteIdentity = async () => {
      if (mode === 'uncertain') throw new VaultError('READBACK_FAILED');
      return { ...before.vault, selectedPubkey: pubkey(1), revision: before.vault.revision + 1 };
    };
    await assert.rejects(transition.deleteInactive(pubkey(1), before));
    assert.equal(transition.getSnapshot().phase, 'recovery'); assert.throws(authority.assertActive, { code: 'STALE' });
  }
});

test('approval lost after journal commit preserves the workspace and exposes the exact deletion to retry', async t => {
  const { transition, protectedStore, native } = await start(t);
  await transition.confirm(request(transition)); const before = transition.getSnapshot().session;
  const authority = transition.sessionAuthority();
  protectedStore.sqlite.onStep = name => { if (name === 'exec:COMMIT') protectedStore.authActive = false; };
  await assert.rejects(transition.deleteInactive(pubkey(1), before), { code: 'AUTHORIZATION_DENIED' });
  const pending = transition.getSnapshot();
  assert.equal(pending.phase, 'ready'); assert.equal(pending.failure, 'DELETION_PENDING');
  assert.equal(pending.session.workspace, before.workspace); assert.equal(pending.session.epoch, before.epoch);
  assert.equal(pending.session.vault.pendingDeletion, pubkey(1));
  assert.equal(pending.session.vault.identities.find(value => value.pubkey === pubkey(1))?.status, 'deleting');
  authority.assertActive(); assert.equal(native.vault.getSnapshot().identities.length, 2);
  protectedStore.sqlite.onStep = null; protectedStore.authActive = true;
  await assert.rejects(transition.deleteInactive(pubkey(1), before), { code: 'STALE' });
  await transition.deleteInactive(pubkey(1), pending.session);
  assert.equal(transition.getSnapshot().session.workspace, before.workspace); authority.assertActive();
  assert.equal(transition.getSnapshot().session.vault.pendingDeletion, null);
  assert.equal(protectedStore.authCalls, 2);
});

test('retained authority after deletion still rejects a later identity switch and an unaccepted inventory revision', async t => {
  const { transition, ports } = await start(t);
  await transition.confirm(request(transition)); const before = transition.getSnapshot().session;
  const authority = transition.sessionAuthority();
  await transition.deleteInactive(pubkey(1), before); authority.assertActive();
  await transition.confirm(request(transition, 'nsec1fixture-3'));
  assert.throws(authority.assertActive, { code: 'STALE' });
  const back = transition.prepareSelect(pubkey(2)); assert(back); await transition.confirm(back);
  assert.throws(authority.assertActive, { code: 'STALE' });
  const currentAuthority = transition.sessionAuthority(), accepted = transition.getSnapshot().session.vault;
  ports.vault.getSnapshot = () => ({ ...accepted, revision: accepted.revision + 1 });
  assert.throws(currentAuthority.assertActive, { code: 'STALE' });
  transition.getSnapshot().session.workspace.change(emptyWorkspace()); await transition.getSnapshot().session.workspace.flush();
  assert.equal(transition.getSnapshot().session.workspace.getSnapshot().error, 'REVOKED');
});
