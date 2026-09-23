import test from 'node:test';
import assert from 'node:assert/strict';
import { naddrEncode } from 'nostr-tools/nip19';
import { finalizeEvent } from 'nostr-tools/pure';
import { createHash } from 'node:crypto';
import { EMBEDDED_TEST_COORDINATE, EMBEDDED_TEST_EVENT, EMBEDDED_TEST_PUBLISHER,
  getEmbeddedTestHtmlBytes } from '../../src/napplets/embedded-test-fixture.ts';
import { createPublishedSessionCoordinator, type PublishedSessionDependencies } from '../../src/napplets/published-session.ts';
import type { NativePublishedTransferPort } from '../../src/napplets/native-transfer.ts';
import { setup } from '../storage/harness.ts';
import { createRuntimeOwner } from '../../src/runtime/runtime-owner.ts';
import { emptyWorkspace, openNapplet, closeNapplet } from '../../src/shell/workspace.ts';
import { NativeLeases } from '../runtime/native-leases.ts';
import type { IdentityTransition } from '../../src/security/identity-transition.ts';
import { createApprovalOwner } from '../../src/security/approval-owner.ts';
import type { ApprovalOrigin, ApprovalService } from '../../src/security/approval-service.ts';

const USER = '31'.repeat(32);
const SESSION = '58274370-ec8f-4058-a4cc-b63e7e75ca4b';
const LINK = naddrEncode(EMBEDDED_TEST_COORDINATE);

function native(calls: string[]): NativePublishedTransferPort {
  return {
    registerPublishedSession: id => { calls.push(`register:${id}`); return true; },
    beginPublishedArtifact: () => { calls.push('begin'); return 'upload'; },
    appendPublishedArtifact: () => { calls.push('append'); return true; },
    finishPublishedArtifact: () => { calls.push('finish'); return 'a'.repeat(64); },
    cancelPublishedArtifact: () => { calls.push('cancel'); },
    revokePublishedSession: id => { calls.push(`revoke:${id}`); },
    revokeAllPublishedArtifacts: () => { calls.push('revoke-all'); },
  };
}

test('first open verifies, reviews, caches and stages; pinned restart uses cache without a new review', async t => {
  const { database, sqlite } = await setup(t);
  let epoch = 3, queries = 0, reads = 0, reviews = 0;
  const calls: string[] = [];
  const ports: PublishedSessionDependencies = {
    database, sqlite, native: native(calls), newInstanceId: () => SESSION,
    identity: { sessionAuthority: () => ({ user: USER, epoch, assertActive: () => {
      if (epoch !== 3) throw new Error('stale identity');
    } }), getSnapshot: () => ({ session: { epoch } }) } as PublishedSessionDependencies['identity'],
    lookupRelays: () => ['wss://relay.example.org'],
    source: {
      query: async (coordinate, relays, pinned) => {
        queries++;
        assert.deepEqual(coordinate, { kind: 35129, pubkey: EMBEDDED_TEST_PUBLISHER,
          identifier: EMBEDDED_TEST_COORDINATE.identifier });
        assert.deepEqual(relays, ['wss://relay.example.org']);
        if (queries > 1) assert.equal(pinned, EMBEDDED_TEST_EVENT.id);
        return [EMBEDDED_TEST_EVENT];
      },
      readHtml: async () => { reads++; return getEmbeddedTestHtmlBytes(); },
    },
  };
  const service = createPublishedSessionCoordinator(ports);
  const opened = await service.openLink(LINK, new AbortController().signal, async request => {
    reviews++; assert.deepEqual(request.domains, ['theme']); return true;
  });
  assert.equal(opened.descriptor.eventId, EMBEDDED_TEST_EVENT.id);
  assert.equal(JSON.parse(JSON.parse(opened.hostInput).configuration).fixture, 'published');
  assert.deepEqual(calls.slice(0, 4), [`register:${SESSION}`, 'begin', 'append', 'finish']);
  opened.revoke();
  const reopened = await service.reopenPinned(opened.descriptor, new AbortController().signal,
    async () => { assert.fail('saved exact grant must reopen silently'); });
  assert.equal(JSON.parse(reopened.hostInput).eventId, opened.descriptor.eventId);
  assert.equal(queries, 1);
  assert.equal(reads, 1);
  assert.equal(reviews, 1);
  reopened.revoke();
  epoch++;
  assert.throws(() => reopened.assertActive());
});

test('denial and identity change during review never register a native published session', async t => {
  const { database, sqlite } = await setup(t);
  let epoch = 1;
  const calls: string[] = [];
  const service = createPublishedSessionCoordinator({ database, sqlite, native: native(calls),
    newInstanceId: () => SESSION, lookupRelays: () => ['wss://relay.example.org'],
    identity: { sessionAuthority: () => ({ user: USER, epoch, assertActive: () => {
      if (epoch !== 1) throw new Error('stale identity');
    } }), getSnapshot: () => ({ session: { epoch } }) } as PublishedSessionDependencies['identity'],
    source: { query: async () => [EMBEDDED_TEST_EVENT], readHtml: async () => getEmbeddedTestHtmlBytes() },
  });
  await assert.rejects(service.openLink(LINK, new AbortController().signal, async () => false));
  assert.deepEqual(calls, []);
  await assert.rejects(service.openLink(LINK, new AbortController().signal, async () => {
    epoch++; return true;
  }));
  assert.deepEqual(calls, []);
});

test('workspace runtime consumes the reviewed artifact once and revokes it on close', async t => {
  const { database, sqlite } = await setup(t);
  let epoch = 5, workspace = emptyWorkspace();
  const calls: string[] = [];
  const leases = Object.assign(new NativeLeases(), native(calls));
  const identity = {
    sessionAuthority: () => ({ user: USER, epoch, assertActive: () => { if (epoch !== 5) throw new Error('stale'); } }),
    getSnapshot: () => ({ session: { epoch, workspace: { getSnapshot: () => ({ workspace, error: null }) } } }),
  } as unknown as Pick<IdentityTransition, 'sessionAuthority' | 'getSnapshot'>;
  const owner = createRuntimeOwner(database, identity, leases, undefined, {
    sqlite, native: leases, lookupRelays: () => ['wss://relay.example.org'],
    source: { query: async () => [EMBEDDED_TEST_EVENT], readHtml: async () => getEmbeddedTestHtmlBytes() },
  });
  const descriptor = await owner.openPublishedLink(LINK, new AbortController().signal, async () => true);
  workspace = openNapplet(workspace, descriptor);
  const binding = await owner.openPublished(descriptor, new AbortController().signal, async () => {
    assert.fail('saved grant does not need a second review');
  });
  assert.equal(JSON.parse(binding.publishedArtifact).sessionId, descriptor.id);
  await assert.rejects(owner.openPublished(descriptor, new AbortController().signal, async () => true), { code: 'CONFLICT' });
  workspace = closeNapplet(workspace, descriptor.id);
  binding.revoke();
  assert(calls.includes(`revoke:${descriptor.id}`));
  binding.receive({ type: 'capability', sessionId: descriptor.id, generation: 'native-generation', token: 'token' });
  assert.equal(leases.finishCalls, 0);
  epoch++;
});

test('published relay approval needs the live verified session and its native generation', async t => {
  const { database, sqlite } = await setup(t);
  const html = getEmbeddedTestHtmlBytes();
  const htmlHash = createHash('sha256').update(html).digest('hex');
  const aggregate = createHash('sha256').update(`${htmlHash} /index.html\n`).digest('hex');
  const appId = 'published-approval-test';
  const event = finalizeEvent({ kind: 35129, created_at: 1_800_000_001, content: '', tags: [
    ['d', appId], ['path', '/index.html', htmlHash], ['x', aggregate, 'aggregate'],
    ['requires', 'relay'], ['requires', 'theme'],
  ] }, new Uint8Array(32).fill(7));
  const link = naddrEncode({ kind: 35129, pubkey: event.pubkey, identifier: appId });
  let workspace = emptyWorkspace();
  const identity = {
    sessionAuthority: () => ({ user: USER, epoch: 2, assertActive: () => undefined }),
    getSnapshot: () => ({ session: { epoch: 2, workspace: { getSnapshot: () => ({ workspace, error: null }) } } }),
  } as unknown as Pick<IdentityTransition, 'sessionAuthority' | 'getSnapshot'>;
  const leases = Object.assign(new NativeLeases(), native([]));
  let offered: ApprovalOrigin | null = null;
  const approvals = { enqueue: (_token: string, _destinations: readonly string[], origin: ApprovalOrigin) => {
    offered = origin; return true;
  }, close: () => undefined } as unknown as ApprovalService;
  const owner = createRuntimeOwner(database, identity, leases,
    { service: approvals, destinations: () => ['wss://relay.example.org'] },
    { sqlite, native: leases, lookupRelays: () => ['wss://relay.example.org'],
      source: { query: async () => [event], readHtml: async () => new Uint8Array(html) } });
  const descriptor = await owner.openPublishedLink(link, new AbortController().signal, async request => {
    assert.deepEqual(request.domains, ['relay', 'theme']); return true;
  });
  workspace = openNapplet(workspace, descriptor);
  const binding = await owner.openPublished(descriptor, new AbortController().signal, async () => {
    assert.fail('saved exact grant must not ask again');
  });
  const generation = 'native-generation';
  binding.receive({ type: 'capability', sessionId: descriptor.id, generation, token: 'native-token', lane: 'approval' });
  assert(offered);
  const origin = offered as ApprovalOrigin;
  const approvalOwner = createApprovalOwner(identity, candidate => owner.assertPublishedApproval(candidate));
  assert.doesNotThrow(() => approvalOwner.assertActive(origin));
  assert.throws(() => approvalOwner.assertActive({ ...origin, generation: 'other-generation' }));
  assert.throws(() => approvalOwner.assertActive({ ...origin, appId: 'other-app' }));
  binding.revoke();
  assert.throws(() => approvalOwner.assertActive(origin));
});
