import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { finalizeEvent, getPublicKey } from 'nostr-tools/pure';
import type { ApprovalOrigin } from '../../src/security/approval-service.ts';
import { UploadService, type UploadNativePort, type UploadLease, type TakenUpload, type UploadResult, type UploadEffects } from '../../src/uploads/upload-service.ts';
import { UploadError, UPLOAD_LIMITS } from '../../src/uploads/upload-contract.ts';

const secret = new Uint8Array(32); secret[31] = 2;
const hash = async (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const owner = (sessionId: string, epoch = 1): ApprovalOrigin => Object.freeze({sessionId, generation: 'generation-' + sessionId, epoch,
  user: getPublicKey(secret), publisher: '11'.repeat(32), appId: 'upload-lab', version: '22'.repeat(32), instanceId: 'instance-' + sessionId});
const deferred = <T>() => {let resolve!: (value: T) => void; const promise = new Promise<T>(done => {resolve = done;}); return {promise, resolve};};
type State = {taken: TakenUpload; bytes: Uint8Array<ArrayBuffer>; live: boolean; approved: boolean; signing: boolean; dispatched: boolean};
/** Controlled port isolates presentation races; owning native authority/TLS proofs are separate commands. */
class Native implements UploadNativePort {
  states = new Map<UploadLease, State>(); tokens = new Map<string, TakenUpload>(); results: UploadResult[] = [];
  focused: string | null = null; puts = 0; reads = 0; cancels = 0;
  putOverride: ((state: State) => Promise<unknown>) | null = null;
  async issue(token: string, identity = owner(token), bytes = new Uint8Array([1, 2, 3])) {
    const lease = {}, taken: TakenUpload = Object.freeze({lease, origin: identity, uploadId: 'public-' + token,
      filename: 'file.bin', caption: 'selected attachment', request: Object.freeze({rail: 'blossom', filename: 'file.bin', caption: 'selected attachment'}), review: Object.freeze({purpose: 'blossom-upload', identity: identity.user,
        destination: 'https://files.example.org', sha256: await hash(bytes), size: bytes.length,
        mimeType: 'application/octet-stream', metadataPolicy: 'attachment-unchanged'})});
    this.tokens.set(token, taken); this.states.set(lease, {taken, bytes: new Uint8Array(bytes), live: true, approved: false, signing: false, dispatched: false});
    return taken;
  }
  state(lease: UploadLease) {const value = this.states.get(lease); if (!value) throw new Error('foreign lease'); return value;}
  take(token: string) {const value = this.tokens.get(token) ?? null; this.tokens.delete(token); return value;}
  isLive(lease: UploadLease) {return this.state(lease).live;}
  mayReview(lease: UploadLease) {const value = this.state(lease); return value.live && !value.approved && value.taken.origin.sessionId === this.focused;}
  readPreview(lease: UploadLease, offset: number) {assert(this.mayReview(lease)); this.reads++; return this.state(lease).bytes.slice(offset, offset + UPLOAD_LIMITS.chunkBytes);}
  approveOnce(lease: UploadLease) {if (!this.mayReview(lease)) return false; this.state(lease).approved = true; return true;}
  isApproved(lease: UploadLease) {const value = this.state(lease); return value.live && value.approved;}
  claimSigning(lease: UploadLease) {const value = this.state(lease); if (!this.isApproved(lease) || value.signing) return false; value.signing = true; return true;}
  async put(lease: UploadLease, credential: string) {
    const value = this.state(lease); assert(value.signing && this.isApproved(lease)); assert(credential.length > 0);
    this.puts++; value.dispatched = true;
    if (this.putOverride) return this.putOverride(value);
    return {url: 'https://files.example.org/' + value.taken.review.sha256 + '.bin', sha256: value.taken.review.sha256,
      size: value.bytes.length, type: value.taken.review.mimeType, uploaded: 1};
  }
  wasDispatched(lease: UploadLease) {return this.state(lease).dispatched;}
  cancel(lease: UploadLease) {this.cancels++; this.state(lease).live = false;}
  finish(lease: UploadLease, result: UploadResult) {this.results.push(result); this.state(lease).live = false;}
}
function make(native: Native, override: Partial<UploadEffects> = {}, assertActive: (origin: ApprovalOrigin) => void = () => {}) {
  return new UploadService(native, {assertActive}, {sha256: hash, nowSeconds: () => 100,
    sign: async (snapshot, execution) => {execution.assertActive(); return JSON.parse(JSON.stringify(finalizeEvent({...snapshot.authorization,
      tags: snapshot.authorization.tags.map(tag => [...tag])}, secret)));}, ...override});
}
async function ready(service: UploadService, native: Native, token = 'one') {
  native.focused = token; service.focus(token); assert(service.enqueue(token, owner(token)));
  await new Promise<void>(resolve => setImmediate(resolve));
  assert(service.getSnapshot().current?.previewReady); return service.getSnapshot().current!.id;
}

test('review snapshots exact native bytes and signing scope before one dispatch', async () => {
  const native = new Native(); const taken = await native.issue('one'); let signed = 0;
  const service = make(native, {sign: async (snapshot, execution) => {signed++; execution.assertActive();
    assert.equal(snapshot.destination, taken.review.destination); assert.equal(snapshot.sha256, taken.review.sha256);
    return JSON.parse(JSON.stringify(finalizeEvent({...snapshot.authorization, tags: snapshot.authorization.tags.map(tag => [...tag])}, secret)));}});
  const id = await ready(service, native); const displayed = service.getSnapshot().current!;
  const copy = displayed.copyPreview()!; copy.fill(8); assert.deepEqual([...displayed.copyPreview()!], [1,2,3]);
  const result = await service.approve(id);
  assert.equal(result.ok, true); assert.equal(result.sha256, taken.review.sha256); assert.equal(signed, 1); assert.equal(native.puts, 1);
  assert.equal(displayed.copyPreview(), null); await assert.rejects(service.approve(id));
});

test('foreground switching during delayed signing and transport preserves only the approved upload', async () => {
  const native = new Native(); await native.issue('one'); const signing = deferred<unknown>(), transfer = deferred<unknown>();
  let captured: Parameters<UploadEffects['sign']>[0] | null = null;
  const service = make(native, {sign: async snapshot => {captured = snapshot; return signing.promise;}});
  native.putOverride = async () => transfer.promise;
  const id = await ready(service, native), pending = service.approve(id);
  await new Promise<void>(resolve => setImmediate(resolve));
  native.focused = 'two'; service.focus('two'); assert.equal(service.getSnapshot().active.length, 1); assert.equal(native.cancels, 0);
  const snapshot = captured!; signing.resolve(JSON.parse(JSON.stringify(finalizeEvent({...snapshot.authorization,
    tags: snapshot.authorization.tags.map(tag => [...tag])}, secret))));
  await new Promise<void>(resolve => setImmediate(resolve)); assert.equal(native.puts, 1);
  transfer.resolve({url: 'https://files.example.org/' + snapshot.sha256 + '.bin', sha256: snapshot.sha256,
    size: snapshot.size, type: snapshot.mimeType, uploaded: 1});
  assert.equal((await pending).status, 'complete');
});

test('background during signing cancels without dispatch and never resumes on foreground', async () => {
  const native = new Native(); await native.issue('one'); const signer = deferred<unknown>();
  const service = make(native, {sign: async () => signer.promise});
  const id = await ready(service, native), pending = service.approve(id);
  await new Promise<void>(resolve => setImmediate(resolve)); service.background(); signer.resolve(null);
  assert.equal((await pending).status, 'cancelled'); assert.equal(native.puts, 0);
  service.foreground(); assert.equal(service.getSnapshot().active.length, 0); assert.equal(service.getSnapshot().pending, 0);
});

test('background, close and identity change after dispatch report uncertainty without retry', async () => {
  for (const action of ['background', 'close', 'identity'] as const) {
    const native = new Native(); await native.issue('one'); const transfer = deferred<unknown>(); native.putOverride = async () => transfer.promise;
    const service = make(native), id = await ready(service, native), pending = service.approve(id);
    await new Promise<void>(resolve => setImmediate(resolve)); assert.equal(native.puts, 1);
    if (action === 'background') service.background(); else if (action === 'close') service.close('one'); else service.revisionChanged(2);
    assert.equal(native.results.at(-1)?.error, 'outcome unknown'); transfer.resolve({});
    assert.equal((await pending).ok, false); assert.equal(native.puts, 1); assert.equal(service.getSnapshot().active.length, 0);
    if (action !== 'background') assert.equal(service.getSnapshot().outcomes.length, 0);
  }
});

test('native-only revocation during an awaited transport suppresses receipt success', async () => {
  const native = new Native(); const taken = await native.issue('one'); const transfer = deferred<unknown>(); native.putOverride = async () => transfer.promise;
  const service = make(native), id = await ready(service, native), pending = service.approve(id);
  await new Promise<void>(resolve => setImmediate(resolve)); native.state(taken.lease).live = false;
  transfer.resolve({url: 'https://files.example.org/' + taken.review.sha256 + '.bin', sha256: taken.review.sha256, size: 3, type: 'application/octet-stream', uploaded: 1});
  assert.equal((await pending).error, 'outcome unknown'); assert.equal(native.results.at(-1)?.ok, false);
});

test('mutated signed credentials never reach the PUT owner', async () => {
  const native = new Native(); await native.issue('one');
  const service = make(native, {sign: async snapshot => JSON.parse(JSON.stringify(finalizeEvent({...snapshot.authorization,
    tags: snapshot.authorization.tags.map(tag => [...tag]), content: 'different destination'}, secret)))});
  assert.equal((await service.approve(await ready(service, native))).ok, false); assert.equal(native.puts, 0);
});

test('malformed, changed or missing provider receipts remain unknown after dispatch', async () => {
  for (const value of [null, {}, {url: 'https://files.example.org/a.bin', sha256: '00'.repeat(32), size: 3, type: 'application/octet-stream', uploaded: 1}]) {
    const native = new Native(); await native.issue('one'); native.putOverride = async () => value;
    const service = make(native); assert.equal((await service.approve(await ready(service, native))).error, 'outcome unknown'); assert.equal(native.puts, 1);
  }
});

test('definitive provider rejections retain their reason and do not retry', async () => {
  for (const error of ['server rejected', 'file too large', 'quota exceeded'] as const) {
    const native = new Native(); await native.issue('one'); native.putOverride = async () => {throw new UploadError(error);};
    const service = make(native); assert.equal((await service.approve(await ready(service, native))).error, error); assert.equal(native.puts, 1);
  }
});

test('mismatched native origin, identity, review hash and unsanitized image never receive approval', async () => {
  const native = new Native(); const a = await native.issue('a'), b = await native.issue('b'), c = await native.issue('c');
  const service = make(native); assert.equal(service.enqueue('a', {...a.origin, publisher: 'ff'.repeat(32)}), false);
  native.tokens.set('b', {...b, review: {...b.review, identity: 'ff'.repeat(32)}}); assert.equal(service.enqueue('b', b.origin), false);
  native.tokens.set('c', {...c, review: {...c.review, mimeType: 'image/png'}}); assert.equal(service.enqueue('c', c.origin), false);
  const taken = await native.issue('one'); native.tokens.set('one', {...taken, review: {...taken.review, sha256: 'ff'.repeat(32)}});
  native.focused = 'one'; service.focus('one'); assert(service.enqueue('one', taken.origin));
  await new Promise<void>(resolve => setImmediate(resolve)); assert.equal(service.getSnapshot().current, null); assert.equal(native.puts, 0);
});

test('unfocused queued bytes are not inspected and duplicate realms remain denied', async () => {
  const native = new Native(); const a = await native.issue('a'), b = await native.issue('b'), c = await native.issue('c');
  const service = make(native); assert(service.enqueue('a', a.origin)); assert(service.enqueue('b', b.origin)); assert(service.enqueue('c', c.origin));
  assert.equal(native.reads, 0); native.focused = 'a'; service.focus('a'); await new Promise<void>(resolve => setImmediate(resolve));
  assert.equal(native.reads, 1); service.reject(service.getSnapshot().current!.id); assert.equal(native.puts, 0);
  const duplicate = await native.issue('d', b.origin); assert.equal(service.enqueue('d', duplicate.origin), false);
});

test('preview chunks are bounded and native approval refusal prevents all signing', async () => {
  const native = new Native(); await native.issue('one', owner('one'), new Uint8Array(UPLOAD_LIMITS.chunkBytes + 1));
  let signs = 0; const service = make(native, {sign: async () => {signs++; return null;}});
  const id = await ready(service, native); assert.equal(native.reads, 2); native.approveOnce = () => false;
  assert.equal((await service.approve(id)).error, 'policy denied'); assert.equal(signs, 0); assert.equal(native.puts, 0);
});

test('terminal finish revokes authority before observers without a competing cancel receipt', async () => {
  const native = new Native(); await native.issue('one');
  const service = make(native), id = await ready(service, native);
  service.reject(id);
  assert.equal(native.cancels, 0); assert.equal(native.results.length, 1);
  assert.equal(native.results[0]!.status, 'cancelled'); assert.equal(service.getSnapshot().pending, 0);
});

test('failed progress registration does not retain a hidden pending review', async () => {
  const native = new Native(); await native.issue('one');
  Object.assign(native, {observeProgress() {throw Error('Listener unavailable');}});
  const service = make(native); service.focus('one');
  assert.equal(service.enqueue('one', owner('one')), false);
  assert.equal(service.getSnapshot().pending, 0); assert.equal(service.getSnapshot().current, null);
  assert.equal(native.puts, 0); assert.equal(native.cancels, 1);
});

test('two active transfers coexist with eight waiting reviews and focus cannot mint a third active grant', async () => {
  const native = new Native(), held = deferred<unknown>(); native.putOverride = () => held.promise;
  const service = make(native);
  await native.issue('first'); const first = service.approve(await ready(service, native, 'first'));
  await new Promise<void>(resolve => setImmediate(resolve));
  await native.issue('second'); const second = service.approve(await ready(service, native, 'second'));
  await new Promise<void>(resolve => setImmediate(resolve)); assert.equal(service.getSnapshot().active.length, 2);
  for (let index = 0; index < 8; index++) {const taken = await native.issue('waiting' + index); assert(service.enqueue('waiting' + index, taken.origin));}
  const overflow = await native.issue('overflow'); assert.equal(service.enqueue('overflow', overflow.origin), false);
  native.focused = 'waiting0'; service.focus('waiting0'); assert.equal(service.getSnapshot().pending, 8); assert.equal(service.getSnapshot().current, null);
  assert.equal(native.puts, 2); service.cancel(service.getSnapshot().active[0]!.id);
  await new Promise<void>(resolve => setImmediate(resolve)); assert.equal(service.getSnapshot().active.length, 1); assert(service.getSnapshot().current?.previewReady);
  service.background(); held.resolve(null); await Promise.all([first,second]); assert.equal(service.getSnapshot().pending, 0); assert.equal(service.getSnapshot().active.length, 0);
});


test('unchanged review and active polling retain snapshots without hiding cancellation', async () => {
  const native = new Native(), taken = await native.issue('stable'), held = deferred<unknown>();
  native.putOverride = () => held.promise; const service = make(native); const id = await ready(service, native, 'stable');
  let updates = 0; service.subscribe(() => {updates++;}); const review = service.getSnapshot();
  for (let count = 0; count < 12; count++) service.refresh();
  assert.equal(service.getSnapshot(), review); assert.equal(updates, 0);
  const completion = service.approve(id); await new Promise<void>(resolve => setImmediate(resolve));
  const active = service.getSnapshot(), before = updates; assert.equal(active.active.length, 1);
  for (let count = 0; count < 12; count++) service.refresh();
  assert.equal(service.getSnapshot(), active); assert.equal(updates, before);
  service.cancel(id); assert.equal(service.getSnapshot().active.length, 0); assert(updates > before);
  held.resolve(null); await completion; assert.equal(service.getSnapshot().outcomes.at(-1)?.result.error, 'outcome unknown');
});
