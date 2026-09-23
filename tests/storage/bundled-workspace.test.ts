import test from 'node:test';
import assert from 'node:assert/strict';
import { assertBundledWorkspace, assertWorkspaceAvailability, initialTestWorkspace } from '../../src/shell/fixtures.ts';
import { emptyWorkspace, type NappletDescriptor } from '../../src/shell/workspace.ts';

test('bundled admission accepts the exact shipped fixture and explicit empty workspace', () => {
  assert.doesNotThrow(() => assertBundledWorkspace(initialTestWorkspace()));
  assert.doesNotThrow(() => assertBundledWorkspace(emptyWorkspace()));
});
test('stored descriptor cannot substitute its source, publisher, content version or identity', () => {
  const state = initialTestWorkspace();
  for (const patch of [{source:'published' as const}, {publisher:'ff'.repeat(32)}, {version:'ff'.repeat(32)}, {appId:'other'}, {id:'ux-lab-0'}, {id:'ux-lab-9007199254740992'}, {title:'Other name'}]) {
    assert.throws(() => assertBundledWorkspace({...state,sessions:[{...state.sessions[0]!,...patch}]}), /Unavailable saved napplet/);
  }
});

test('source-aware availability accepts a strict published pin without resolving it as bundled', () => {
  const published: NappletDescriptor = { id: '58274370-ec8f-4058-a4cc-b63e7e75ca4b',
    title: 'Test Napplet', publisher: 'a'.repeat(64), appId: 'test-napplet', version: 'b'.repeat(64),
    source: 'published', eventId: 'c'.repeat(64) };
  assert.doesNotThrow(() => assertWorkspaceAvailability({ ...emptyWorkspace(), sessions: [published] }));
  assert.throws(() => assertBundledWorkspace({ ...emptyWorkspace(), sessions: [published] }), /Unavailable saved napplet/);
});

test('published workspace descriptors reject changed pins, identity fields and unbounded metadata', () => {
  const published: NappletDescriptor = { id: '58274370-ec8f-4058-a4cc-b63e7e75ca4b',
    title: 'Test Napplet', publisher: 'a'.repeat(64), appId: 'test-napplet', version: 'b'.repeat(64),
    source: 'published', eventId: 'c'.repeat(64) };
  for (const patch of [
    { id: '58274370-ec8f-4058-04cc-b63e7e75ca4b' },
    { id: '58274370-ec8f-1058-a4cc-b63e7e75ca4b' },
    { publisher: 'A'.repeat(64) }, { publisher: 'a'.repeat(63) },
    { version: 'v'.repeat(64) }, { version: 'b'.repeat(63) },
    { eventId: 'C'.repeat(64) }, { eventId: undefined },
    { appId: '' }, { appId: ' test-napplet' }, { appId: `bad\u0000id` }, { appId: 'a'.repeat(256) },
    { title: '' }, { title: 'n'.repeat(129) }, { title: '💫'.repeat(33) },
  ]) assert.throws(() => assertWorkspaceAvailability({ ...emptyWorkspace(), sessions: [{ ...published, ...patch }] }), /Unavailable saved napplet/);
});
