import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const result = spawnSync('pnpm', ['--dir', 'runtime', 'build'], { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
const manifest = JSON.parse(await readFile(new URL('runtime/assets-manifest.json', root), 'utf8'));
assert.deepEqual(Object.keys(manifest.assets).sort(), ['host.js', 'index.html']);
const destination = new URL('modules/napplet-host/android/src/main/assets/runtime/', root);
await mkdir(destination, { recursive: true });
for (const name of ['index.html', 'host.js']) {
  const bytes = await readFile(new URL(`runtime/dist/${name}`, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), manifest.assets[name].sha256);
  assert.equal(bytes.byteLength, manifest.assets[name].bytes);
  await writeFile(new URL(name, destination), bytes);
}
console.log('Verified trusted runtime assets copied to native module.');
