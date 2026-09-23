import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adjacentNapplet, closeNapplet, emptyWorkspace, focusNapplet, openNapplet, restoreWorkspace, showOverview, snapshotWorkspace } from './workspace.ts';
import type { NappletDescriptor } from './workspace.ts';
const descriptor = (id: string): NappletDescriptor => ({ id, title: id, publisher: 'bundled', appId: 'ux-lab', version: 'hash', source: 'bundled' });
const three = () => ['a', 'b', 'c'].reduce((state, id) => openNapplet(state, descriptor(id)), emptyWorkspace());

test('focusing and reopening a session preserve opening order and descriptor identity', () => {
  const initial = three();
  const state = openNapplet(focusNapplet(initial, 'a'), descriptor('b'));
  assert.deepEqual(state.sessions.map(item => item.id), ['a', 'b', 'c']);
  assert.strictEqual(state.sessions[1], initial.sessions[1]);
  assert.equal(state.focusedId, 'b');
});
test('navigation stops at each end and invalid focus cannot change workspace', () => {
  const state = three();
  assert.equal(adjacentNapplet(state, 1), null);
  assert.equal(adjacentNapplet(state, -1), 'b');
  assert.equal(adjacentNapplet(focusNapplet(state, 'a'), -1), null);
  assert.strictEqual(focusNapplet(state, 'missing'), state);
});
test('closing active or inactive sessions leaves overview without selecting another', () => {
  const active = closeNapplet(three(), 'c');
  assert.equal(active.focusedId, null); assert.equal(active.overview, true);
  const inactive = closeNapplet(three(), 'a');
  assert.equal(inactive.focusedId, 'c'); assert.equal(inactive.overview, true);
});
test('snapshot preserves opening order and last active but never ephemeral properties', () => {
  const state = showOverview(focusNapplet(three(), 'b'));
  const snapshot = snapshotWorkspace(state);
  assert.deepEqual(Object.keys(snapshot), ['schema', 'sessions', 'lastActiveId']);
  const serialized = JSON.stringify(snapshot);
  const restored = restoreWorkspace(JSON.parse(serialized));
  assert.equal(restored.focusedId, 'b'); assert.equal(restored.overview, false);
  assert.deepEqual(restored.sessions.map(item => item.id), ['a', 'b', 'c']);
});
test('explicitly empty workspace survives restart', () => {
  let state = three();
  for (const id of ['a', 'b', 'c']) state = closeNapplet(state, id);
  assert.deepEqual(restoreWorkspace(snapshotWorkspace(state)), emptyWorkspace());
});
test('corrupt saved state fails instead of silently choosing or generating a session', () => {
  for (const value of [null, [], {}, { schema: 2, sessions: [], lastActiveId: null }, { schema: 1, sessions: [], lastActiveId: 'missing' },
    { schema: 1, sessions: [descriptor('a'), descriptor('a')], lastActiveId: 'a' },
    { schema: 1, sessions: [{ ...descriptor('a'), id: '../../arbitrary' }], lastActiveId: null },
    { schema: 1, sessions: [{ ...descriptor('a'), source: 'published' }], lastActiveId: 'a' },
    { schema: 1, sessions: [{ ...descriptor('a'), source: 'published', eventId: 'bad-pin' }], lastActiveId: 'a' }]) {
    assert.throws(() => restoreWorkspace(value));
  }
});
