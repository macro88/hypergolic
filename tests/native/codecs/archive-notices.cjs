'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { verify } = require('../../../modules/napplet-host/android/ArchiveDependencyNotices.cjs');
const source = path.resolve(__dirname, '../../../modules/napplet-host/android/src/main/assets/archive-notices');

function fixture(run) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'hypergolic-archive-notices-'));
  const directory = path.join(temporary, 'notices');
  fs.cpSync(source, directory, { recursive: true });
  try {
    const manifestFile = path.join(directory, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    // A disposable resolver result exercises graph drift without network or native builds.
    const artifact = path.join(temporary, 'licensed.jar');
    fs.writeFileSync(artifact, 'reviewed archive fixture');
    manifest.selectedArtifacts = [{ component: 'example:licensed:1', filename: 'licensed.jar',
      sha256: createHash('sha256').update(fs.readFileSync(artifact)).digest('hex') }];
    fs.writeFileSync(manifestFile, JSON.stringify(manifest));
    run(directory, [{ component: 'example:licensed:1', file: artifact }], manifest);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

test('original archive notices and unchanged selected artifact pass', () => fixture((directory, artifacts) => verify(directory, artifacts)));
test('altered Apache copyright notice rejects', () => fixture((directory, artifacts, manifest) => {
  const notice = manifest.originals.find(original => original.file.includes('commons-io') && original.file.includes('NOTICE'));
  const file = path.join(directory, notice.file); const bytes = fs.readFileSync(file);
  bytes[0] ^= 1; fs.writeFileSync(file, bytes);
  assert.throws(() => verify(directory, artifacts), /notice bytes changed/);
}));
test('missing Apache license original rejects', () => fixture((directory, artifacts, manifest) => {
  fs.unlinkSync(path.join(directory, manifest.originals[0].file));
  assert.throws(() => verify(directory, artifacts), /file set changed/);
}));
test('same coordinate with changed archive bytes rejects', () => fixture((directory, artifacts) => {
  fs.appendFileSync(artifacts[0].file, '!');
  assert.throws(() => verify(directory, artifacts), /selected archive inputs changed/);
}));
test('new unreviewed runtime dependency rejects', () => fixture((directory, artifacts) => {
  artifacts.push({ component: 'example:additional:1', file: artifacts[0].file });
  assert.throws(() => verify(directory, artifacts), /selected archive inputs changed/);
}));
test('removed runtime dependency rejects', () => fixture(directory => {
  assert.throws(() => verify(directory, []), /selected archive inputs changed/);
}));
