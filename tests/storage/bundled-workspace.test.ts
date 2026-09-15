import test from 'node:test';
import assert from 'node:assert/strict';
import { assertBundledWorkspace, initialTestWorkspace } from '../../src/shell/fixtures.ts';
import { emptyWorkspace } from '../../src/shell/workspace.ts';

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
