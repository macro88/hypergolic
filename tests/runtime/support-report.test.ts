import test from 'node:test';
import assert from 'node:assert/strict';
import { capabilityCompatibility, supportForDomain } from '../../src/runtime/support-report.ts';
import { NAP_CATALOGUE } from '../../src/runtime/nap-catalogue.ts';

test('published admission filters capabilities independently of catalogue status', () => {
  assert.deepEqual(capabilityCompatibility(['media', 'theme', 'fs', 'outbox']).domains, ['theme']);
  assert.deepEqual(capabilityCompatibility(['media', 'theme', 'fs', 'outbox']).unsupportedDomains, ['fs', 'media', 'outbox']);
  assert.equal(supportForDomain('fs').status, 'unsupported');
  assert.equal(supportForDomain('resource').status, 'partial');
  assert.equal(supportForDomain('outbox').available, false);
  assert.equal(new Set(NAP_CATALOGUE.map(row => row.domain)).size, NAP_CATALOGUE.length);
  assert(NAP_CATALOGUE.every(row => /^[a-f0-9]{40}$/.test(row.revision)));
});

test('support and request changes require a different remembered review', () => {
  const first = capabilityCompatibility(['fs', 'theme']);
  assert.equal(first.review, capabilityCompatibility(['theme', 'fs']).review);
  assert.notEqual(first.review, capabilityCompatibility(['theme', 'media']).review);
  assert.notEqual(first.review, capabilityCompatibility(['fs', 'theme'], ['theme', 'fs']).review);
});
