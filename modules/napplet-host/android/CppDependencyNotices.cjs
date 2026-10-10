'use strict';
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
function safeRelative(name) {
  if (typeof name !== 'string' || !name || path.isAbsolute(name) ||
      name.includes('\\') || name.split('/').some(part => part === '..' || !part)) {
    throw new Error('Unsafe Android C++ notice input');
  }
  return name;
}
function verify(directory, ndkDirectory, rootNoticeDirectory) {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || manifest.platform !== 'android' ||
      manifest.scope !== 'reviewed-arm64-ndk-cpp-originals') {
    throw new Error('Unexpected Android C++ notice manifest');
  }
  const names = manifest.originals.map(original => safeRelative(original.file));
  if (new Set(names).size !== names.length || names.some(name => path.basename(name) !== name || !name.endsWith('.txt'))) {
    throw new Error('Duplicate or unsafe Android C++ original filename');
  }
  if (JSON.stringify(fs.readdirSync(directory).sort()) !== JSON.stringify([...names, 'manifest.json'].sort())) {
    throw new Error('Android C++ notice file set changed');
  }
  for (const original of manifest.originals) {
    const bytes = fs.readFileSync(path.join(directory, original.file));
    if (bytes.length !== original.bytes || sha256(bytes) !== original.sha256) {
      throw new Error(`Android C++ original bytes changed: ${original.file}`);
    }
  }
  const profile = manifest.ndkProfile;
  const properties = fs.readFileSync(path.join(ndkDirectory, 'source.properties'), 'utf8');
  if (!properties.split(/\r?\n/).some(line => line.trim() === `Pkg.Revision = ${profile.version}`)) {
    throw new Error('Android C++ NDK version changed; refresh the notice review');
  }
  for (const [name, expected] of Object.entries({ ...profile.inputs, ...profile.compilerHeaders })) {
    safeRelative(name);
    if (sha256(fs.readFileSync(path.join(ndkDirectory, name))) !== expected) {
      throw new Error(`Android C++ reviewed NDK input changed: ${name}`);
    }
  }
  const aggregate = fs.readFileSync(path.join(ndkDirectory, 'NOTICE.toolchain'));
  if (sha256(aggregate) !== profile.aggregateSha256) throw new Error('Android C++ aggregate notice changed');
  for (const binding of manifest.noticeBindings) {
    if (!names.includes(binding.file) || !names.includes(binding.creditsFile) ||
        !Number.isSafeInteger(binding.aggregateByteStart) || !Number.isSafeInteger(binding.aggregateByteEndExclusive) ||
        binding.aggregateByteStart < 0 || binding.aggregateByteEndExclusive > aggregate.length ||
        binding.aggregateByteStart >= binding.aggregateByteEndExclusive ||
        !aggregate.subarray(binding.aggregateByteStart, binding.aggregateByteEndExclusive)
          .equals(fs.readFileSync(path.join(directory, binding.file)))) {
      throw new Error('Android C++ original aggregate binding changed');
    }
  }
  for (const binding of manifest.rootNoticeBindings) {
    for (const name of binding.files) {
      safeRelative(name);
      if (path.basename(name) !== name || sha256(fs.readFileSync(path.join(rootNoticeDirectory, name))) !== binding.sha256) {
        throw new Error('Android local C++ package original changed');
      }
    }
  }
}
module.exports = { verify };
if (require.main === module) {
  if (process.argv.length !== 5) throw new Error('Expected C++ notice, NDK and package notice directories');
  verify(...process.argv.slice(2));
}
