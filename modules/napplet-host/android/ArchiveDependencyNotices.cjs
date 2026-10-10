'use strict';
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function verify(directory, selectedArtifacts, packageNoticeDirectory = path.join(__dirname, 'src/main/assets/notices'),
    sourceRoot = path.resolve(__dirname, '../../..')) {
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
  let sourceCount = 0;
  for (const binding of manifest.prebuiltBindings) {
    const artifact = binding.owningArtifact;
    if (!expected.includes(`${artifact.component}\0${artifact.filename}\0${artifact.sha256}`)) {
      throw new Error('Android prebuilt owning artifact binding changed');
    }
    if (binding.entry !== 'jni/arm64-v8a/libexpo-sqlite.so' ||
        !/^[a-f0-9]{64}$/.test(binding.nativeSha256) ||
        !Number.isSafeInteger(binding.nativeBytes) || binding.nativeBytes < 1) {
      throw new Error('Android prebuilt native entry binding changed');
    }
    const wrapper = binding.wrapperOriginal;
    if (typeof wrapper.file !== 'string' || path.basename(wrapper.file) !== wrapper.file ||
        sha256(fs.readFileSync(path.join(packageNoticeDirectory, wrapper.file))) !== wrapper.sha256) {
      throw new Error('Android prebuilt wrapper original changed');
    }
    const sources = binding.originalSources;
    if (JSON.stringify(sources.map(source => source.path).sort()) !== JSON.stringify([
        'node_modules/expo-sqlite/vendor/sqlite3/sqlite3.c',
        'node_modules/expo-sqlite/vendor/sqlite3/sqlite3.h'])) {
      throw new Error('Android prebuilt source set changed');
    }
    for (const source of sources) {
      const bytes = fs.readFileSync(path.join(sourceRoot, source.path));
      const text = bytes.toString('utf8');
      if (sha256(bytes) !== source.sha256 ||
          text.split('exsqlite3').length - 1 !== source.prefixReplacementCount ||
          sha256(Buffer.from(text.replaceAll('exsqlite3', 'sqlite3'))) !== source.upstreamSha256 ||
          !text.includes(`#define SQLITE_VERSION        "${binding.version}"`) ||
          !text.includes(`#define SQLITE_SOURCE_ID      "${binding.sourceId}"`)) {
        throw new Error('Android prebuilt original source provenance changed');
      }
      const original = source.original;
      if (!names.includes(original.file) ||
          !Number.isSafeInteger(source.byteStart) || !Number.isSafeInteger(source.byteEndExclusive) ||
          source.byteStart < 0 || source.byteEndExclusive > bytes.length ||
          source.byteStart >= source.byteEndExclusive ||
          !bytes.subarray(source.byteStart, source.byteEndExclusive)
            .equals(fs.readFileSync(path.join(directory, original.file))) ||
          sha256(bytes.subarray(source.byteStart, source.byteEndExclusive)) !== original.sha256) {
        throw new Error('Android prebuilt original source range changed');
      }
      sourceCount++;
    }
  }
  if (manifest.prebuiltBindings.length !== manifest.prebuiltReview.componentCount ||
      sourceCount !== manifest.prebuiltReview.originalSourceCount) {
    throw new Error('Android prebuilt reviewed source set changed');
  }
  const headerEntries = [];
  for (const binding of manifest.prefabBindings) {
    const artifact = binding.owningArtifact;
    if (!expected.includes(`${artifact.component}\0${artifact.filename}\0${artifact.sha256}`)) {
      throw new Error('Android prefab owning artifact binding changed');
    }
    for (const original of [...binding.rootOriginals, ...binding.inlineHeaderNotices]) {
      const reference = original.original;
      if (typeof reference.file !== 'string' || path.basename(reference.file) !== reference.file ||
          !reference.file.endsWith('.txt') || !['archive', 'main-javascript'].includes(reference.location) ||
          (reference.location === 'archive' && !names.includes(reference.file))) {
        throw new Error('Android prefab original reference missing or unsafe');
      }
      const owner = reference.location === 'archive' ? directory : packageNoticeDirectory;
      if (sha256(fs.readFileSync(path.join(owner, reference.file))) !== reference.sha256) {
        throw new Error('Android prefab shared original changed');
      }
    }
    for (const header of binding.compiledHeaders) {
      if (typeof header.entry !== 'string' || !header.entry.startsWith('prefab/modules/') ||
          header.entry.includes('\\') || header.entry.split('/').some(part => !part || part === '..') ||
          !/^[a-f0-9]{64}$/.test(header.sha256) ||
          !['immutable-upstream-blob', 'exact-recorded-glog-token-generation',
            'exact-installed-sdk-schema-generation'].includes(header.provenance)) {
        throw new Error('Unsafe or incomplete Android prefab header binding');
      }
      headerEntries.push(header.entry);
    }
    for (const inline of binding.inlineHeaderNotices) {
      if (!binding.compiledHeaders.some(header => header.entry === inline.entry && header.sha256 === inline.headerSha256) ||
          !Number.isSafeInteger(inline.byteStart) || !Number.isSafeInteger(inline.byteEndExclusive) ||
          inline.byteStart < 0 || inline.byteStart >= inline.byteEndExclusive) {
        throw new Error('Android prefab inline notice header binding changed');
      }
    }
  }
  if (new Set(headerEntries).size !== headerEntries.length ||
      headerEntries.length !== manifest.prefabReview.compiledHeaderCount) {
    throw new Error('Android prefab reviewed header set changed');
  }
}

module.exports = { verify };
if (require.main === module) {
  if (process.argv.length !== 4) throw new Error('Expected archive notice directory and selected artifact inventory');
  verify(process.argv[2], JSON.parse(fs.readFileSync(process.argv[3], 'utf8')));
}
