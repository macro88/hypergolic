import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizeEvent, getPublicKey } from 'nostr-tools/pure';
import { loadEmbeddedTestArtifact } from '../../src/napplets/embedded-test-fixture.ts';
import { requestFirstOpenConsent } from '../../src/napplets/first-open-consent.ts';
import { descriptorForPublishedArtifact, publishedHostInput } from '../../src/napplets/published-host-input.ts';
import { verifyArtifact, verifyManifest } from '../../src/napplets/verified-artifact.ts';
import { registration, setup } from '../storage/harness.ts';

const USER = '21'.repeat(32);
const SESSION = '58274370-ec8f-4058-a4cc-b63e7e75ca4b';

test('a signed artifact and current consent bind the exact publisher, version and capabilities to the native claim', async t => {
  const { database } = await setup(t);
  const artifact = await loadEmbeddedTestArtifact();
  const descriptor = descriptorForPublishedArtifact(artifact, SESSION);
  assert.equal(descriptor.source, 'published');
  assert.equal(descriptor.eventId, artifact.manifest.eventId);
  const owner = registration({ user: USER, publisher: descriptor.publisher, appId: descriptor.appId });
  const admission = await requestFirstOpenConsent(artifact, owner, database.bindApp(owner).port,
    new AbortController().signal, owner.assertActive, async () => true);
  const authority = { user: USER, epoch: 7, assertActive: () => undefined };
  const input = JSON.parse(publishedHostInput(artifact, admission, descriptor, authority, 'a'.repeat(64)));
  assert.deepEqual(Object.keys(input).sort(), ['sessionId', 'publisher', 'appId', 'eventId', 'version', 'htmlHash', 'handle', 'configuration'].sort());
  assert.deepEqual(JSON.parse(input.configuration), {
    sessionId: SESSION, epoch: 7, user: USER, publisher: descriptor.publisher,
    appId: descriptor.appId, version: descriptor.version, instanceId: SESSION,
    fixture: 'published', domains: ['theme'],
  });
});

test('stale identity, denied or forged consent and substituted descriptor cannot prepare a native host', async t => {
  const { database } = await setup(t);
  const artifact = await loadEmbeddedTestArtifact();
  const descriptor = descriptorForPublishedArtifact(artifact, SESSION);
  const live = { value: true };
  const owner = registration({ user: USER, publisher: descriptor.publisher, appId: descriptor.appId,
    assertActive: () => { if (!live.value) throw new Error('revoked'); } });
  const storage = database.bindApp(owner).port;
  await assert.rejects(requestFirstOpenConsent(artifact, owner, storage, new AbortController().signal,
    owner.assertActive, async () => false));
  const admission = await requestFirstOpenConsent(artifact, owner, storage, new AbortController().signal,
    owner.assertActive, async () => true);
  const authority = { user: USER, epoch: 0, assertActive: owner.assertActive };
  const prepare = (changed = descriptor, token: unknown = admission) => publishedHostInput(artifact, token, changed,
    authority, 'a'.repeat(64));
  assert.throws(() => prepare({ ...descriptor, eventId: 'f'.repeat(64) }));
  assert.throws(() => prepare({ ...descriptor, publisher: 'f'.repeat(64) }));
  assert.throws(() => prepare({ ...descriptor, version: 'f'.repeat(64) }));
  assert.throws(() => prepare(descriptor, { ...admission }));
  assert.throws(() => publishedHostInput(artifact, admission, descriptor, authority, '../path'));
  live.value = false;
  assert.throws(() => prepare());
});

test('unknown required NAP domains are rejected before a published session is created', async () => {
  const secret = new Uint8Array(32); secret[31] = 34;
  const publisher = getPublicKey(secret);
  const bytes = new TextEncoder().encode('<!doctype html><html><head><title>Unknown</title></head><body>ok</body></html>');
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), byte => byte.toString(16).padStart(2, '0')).join('');
  const aggregate = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${hash} /index.html\n`))),
    byte => byte.toString(16).padStart(2, '0')).join('');
  const event = finalizeEvent({ kind: 35129, created_at: 1_800_000_000, content: '', tags: [
    ['d', 'future-domain'], ['path', '/index.html', hash], ['x', aggregate, 'aggregate'], ['requires', 'future-domain'],
  ] }, secret);
  const coordinate = { kind: 35129 as const, pubkey: publisher, identifier: 'future-domain', relayHints: [] };
  const artifact = await verifyArtifact(await verifyManifest(coordinate, JSON.parse(JSON.stringify(event))), bytes);
  assert.throws(() => descriptorForPublishedArtifact(artifact, SESSION));
});
