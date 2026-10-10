'use strict';
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function verify(directory, selectedArtifacts) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.platform !== 'android' ||
      manifest.scope !== 'selected-runtime-archive-originals') {
    throw new Error('Unexpected Android archive notice manifest');
  }
  const names = manifest.originals.map(original => original.file);
  if (new Set(names).size !== names.length || names.some(name =>
      typeof name !== 'string' || path.basename(name) !== name || !name.endsWith('.txt'))) {
    throw new Error('Duplicate or unsafe Android archive notice filename');
  }
  if (JSON.stringify(fs.readdirSync(directory).sort()) !== JSON.stringify([...names, 'manifest.json'].sort())) {
    throw new Error('Android archive notice file set changed');
  }
  const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
  for (const original of manifest.originals) {
    const bytes = fs.readFileSync(path.join(directory, original.file));
    if (bytes.length !== original.bytes || sha256(bytes) !== original.sha256) {
      throw new Error(`Android archive notice bytes changed: ${original.file}`);
    }
  }
  if (manifest.noticeBindings.some(binding => !names.includes(binding.file))) {
    throw new Error('Android archive original mapping missing');
  }
  const expected = manifest.selectedArtifacts.map(artifact =>
    `${artifact.component}\0${artifact.filename}\0${artifact.sha256}`).sort();
  const actual = selectedArtifacts.map(artifact =>
    `${artifact.component}\0${path.basename(artifact.file)}\0${sha256(fs.readFileSync(artifact.file))}`).sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Android selected archive inputs changed; refresh the notice review');
  }
}

module.exports = { verify };
if (require.main === module) {
  if (process.argv.length !== 4) throw new Error('Expected archive notice directory and selected artifact inventory');
  verify(process.argv[2], JSON.parse(fs.readFileSync(process.argv[3], 'utf8')));
}
