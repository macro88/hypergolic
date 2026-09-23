import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import { IdentityTransition } from '../../src/security/identity-transition.ts';
import { Integrated, pubkey } from '../security/harness.ts';
import { setup, deferred } from '../storage/harness.ts';
import { bundledDescriptor, assertBundledWorkspace, resolveBundledSession } from '../../src/shell/fixtures.ts';
import { emptyWorkspace, openNapplet, closeNapplet, focusNapplet } from '../../src/shell/workspace.ts';
import { createRuntimeOwner, type RuntimeBinding } from '../../src/runtime/runtime-owner.ts';
import { createApprovalOwner } from '../../src/security/approval-owner.ts';
import type { NativeRegistration } from '../../src/runtime/capability-protocol.ts';
import { NativeLeases } from './native-leases.ts';

async function start(t: TestContext) {
  const protectedStore = new Integrated(); t.after(() => protectedStore.sqlite.cleanup());
  const vaultOwner = await protectedStore.owner(); await vaultOwner.vault.open();
  const storage = await setup(t);
  const primary = bundledDescriptor('state-lab', 1), instance = bundledDescriptor('state-lab', 2),
    peer = bundledDescriptor('state-lab-peer', 1), publisher = bundledDescriptor('state-lab-other-publisher', 1);
  const seed = () => [primary, instance, peer, publisher].reduce(openNapplet, emptyWorkspace());
  const transition = await IdentityTransition.open({ vault: vaultOwner.vault, database: storage.database,
    publicKeyFromNsec: () => pubkey(2), seed, assertAvailable: assertBundledWorkspace });
  const native = new NativeLeases(), owner = createRuntimeOwner(storage.database, transition, native);
  let requests = 0;
  function admit(binding: RuntimeBinding, request: unknown, generation = 'native-generation-1') {
    const config = { ...JSON.parse(binding.configuration), generation } as NativeRegistration;
    const token = native.add(config, request);
    return { token, event: { type: 'capability' as const, sessionId: config.sessionId, generation, token } };
  }
  async function invoke(binding: RuntimeBinding, request: Record<string, unknown>) {
    const { token, event } = admit(binding, { id: String(++requests), ...request });
    const completed = new Promise<unknown>(resolve => { native.onFinish = finished => { if (finished === token) resolve(native.results.get(token)); }; });
    binding.receive(event); return completed;
  }
  return { ...storage, transition, owner, native, primary, instance, peer, publisher, invoke, admit };
}

test('trusted catalogue preserves existing UX descriptors and denies altered State Lab artifacts', () => {
  for (const variant of ['state-lab','state-lab-peer','state-lab-other-publisher'] as const) {
    const descriptor = bundledDescriptor(variant,1);
    const registration = resolveBundledSession(descriptor);
    assert.equal(registration.instanceId,descriptor.id);
    for (const patch of [{source:'published' as const},{publisher:'forged'},{version:'f'.repeat(64)},
      {appId:'other'},{id:'state-lab-0'},{title:'Other'}]) assert.throws(() => resolveBundledSession({...descriptor,...patch}));
  }
  const ux = bundledDescriptor('ux-lab',1);
  assert.equal(ux.version,'01ab63dbcdadab0b44fd6f3b9a6bcfbd98d8c1de1510f96c821d3efe1876909c');
  assert.notEqual(resolveBundledSession(ux).version,ux.version);
});

test('actual identity/workspace owner binds shared, instance, app and publisher storage independently', {timeout:5000}, async t => {
  const h = await start(t), first = h.owner.open(h.primary), instance = h.owner.open(h.instance);
  const write = await h.invoke(first,{type:'storage.set',key:'sample',value:'primary'});
  assert.deepEqual(write,{type:'storage.set.result',id:'1'});
  assert.deepEqual(await h.invoke(instance,{type:'storage.get',key:'sample'}),{type:'storage.get.result',id:'2',value:'primary'});
  for (const descriptor of [h.peer,h.publisher]) {
    const reply = await h.invoke(h.owner.open(descriptor),{type:'storage.get',key:'sample'}) as {value:unknown};
    assert.equal(reply.value,null);
  }
  await h.invoke(first,{type:'storage.set',key:'sample',value:'instance one',scope:'instance'});
  assert.equal((await h.invoke(instance,{type:'storage.get',key:'sample',scope:'instance'}) as {value:unknown}).value,null);
  // Workspace snapshots are replaced on focus; the original live binding and its correlation history remain valid.
  const workspace = h.transition.getSnapshot().session.workspace;
  workspace.change(focusNapplet(workspace.getSnapshot().workspace,h.instance.id)); await workspace.flush();
  assert.equal((await h.invoke(first,{type:'storage.get',key:'sample'}) as {value:unknown}).value,'primary');
});

test('confirmed identity changes deny old views and returning identities retain their own strings', {timeout:5000}, async t => {
  const h = await start(t), old = h.owner.open(h.primary);
  await h.invoke(old,{type:'storage.set',key:'sample',value:'identity one'});
  const pending = h.transition.prepareImport('nsec1fixture-2'); assert(pending);
  h.transition.cancel(pending);
  assert.equal((await h.invoke(old,{type:'storage.get',key:'sample'}) as {value:unknown}).value,'identity one');
  const change = h.transition.prepareImport('nsec1fixture-2'); assert(change); await h.transition.confirm(change);
  const before = h.native.finishCalls;
  const stale = h.admit(old,{type:'storage.set',id:'stale',key:'sample',value:'must not write'});
  old.receive(stale.event); await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.native.finishCalls,before);
  const current = h.owner.open(h.primary);
  assert.equal((await h.invoke(current,{type:'storage.get',key:'sample'}) as {value:unknown}).value,null);
  const back = h.transition.prepareSelect(pubkey(1)); assert(back); await h.transition.confirm(back);
  assert.equal((await h.invoke(h.owner.open(h.primary),{type:'storage.get',key:'sample'}) as {value:unknown}).value,'identity one');
});

test('closing during a real SQL write revokes workspace membership before commit', {timeout:5000}, async t => {
  const h = await start(t), binding = h.owner.open(h.primary), entered = deferred(), release = deferred();
  let held = false;
  h.sqlite.onStep = async sql => { if (sql.startsWith('INSERT INTO saved_strings') && !held) {held=true;entered.resolve();await release.promise;} };
  const write = h.invoke(binding,{type:'storage.set',key:'sample',value:'must roll back'});
  await entered.promise;
  const workspace = h.transition.getSnapshot().session.workspace;
  workspace.change(closeNapplet(workspace.getSnapshot().workspace,h.primary.id));
  release.resolve(); assert.equal(await write,null); await workspace.flush();
  assert.equal(h.sqlite.raw().prepare('SELECT count(*) AS count FROM saved_strings').get()!.count,0);
  assert.throws(() => h.owner.open(h.primary),{code:'REVOKED'});
});


test('new openings get distinct native instance IDs even when display numbers are reused after restart', async t => {
  const h = await start(t);
  const first = h.owner.descriptor('state-lab',4);
  const reopenedOwner = createRuntimeOwner(h.database,h.transition,h.native);
  const second = reopenedOwner.descriptor('state-lab',4);
  assert.equal(first.title,second.title);
  assert.notEqual(first.id,second.id);
  assert.notEqual(resolveBundledSession(first).instanceId,resolveBundledSession(second).instanceId);
  const workspace = h.transition.getSnapshot().session.workspace;
  workspace.change(openNapplet(workspace.getSnapshot().workspace,first)); await workspace.flush();
  const original = h.owner.open(first);
  await h.invoke(original,{type:'storage.set',key:'sample',value:'old instance',scope:'instance'});
  workspace.change(closeNapplet(workspace.getSnapshot().workspace,first.id)); await workspace.flush();
  workspace.change(openNapplet(workspace.getSnapshot().workspace,second)); await workspace.flush();
  assert.equal((await h.invoke(reopenedOwner.open(second),{type:'storage.get',key:'sample',scope:'instance'}) as {value:unknown}).value,null);
});


test('approval owner accepts the resolved native catalogue tuple and revokes changed ownership', async t => {
  const h = await start(t), approval = h.owner.descriptor('approval-lab', 5);
  const workspace = h.transition.getSnapshot().session.workspace;
  workspace.change(openNapplet(workspace.getSnapshot().workspace, approval)); await workspace.flush();
  const origin = { ...JSON.parse(h.owner.open(approval).configuration), generation: 'native-approval-generation' };
  const owner = createApprovalOwner(h.transition);
  assert.notEqual(approval.publisher, origin.publisher);
  assert.doesNotThrow(() => owner.assertActive(origin));
  for (const patch of [{ publisher: approval.publisher }, { instanceId: 'different-instance' },
    { sessionId: 'missing-session' }, { version: '00'.repeat(32) }, { user: pubkey(2) }, { epoch: origin.epoch + 1 }]) {
    assert.throws(() => owner.assertActive({ ...origin, ...patch }));
  }
  const readOnly = { ...JSON.parse(h.owner.open(h.primary).configuration), generation: 'native-state-generation' };
  assert.throws(() => owner.assertActive(readOnly));
  workspace.change(closeNapplet(workspace.getSnapshot().workspace, approval.id));
  assert.throws(() => owner.assertActive(origin)); await workspace.flush();
});
