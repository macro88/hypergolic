#!/usr/bin/env python3
"""Compile the production Android artifact registry directly and retain a JVM receipt."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
SOURCE = 'modules/napplet-host/android/src/main/java/org/nostrocket/hypergolic/host/PublishedArtifactRegistry.java'
PROOF = 'tests/native/android-published-artifact-registry/PublishedArtifactRegistryProof.java'
RUNNER = 'tests/native/android-published-artifact-registry/runner.py'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    output = args.output.resolve()
    if output.is_relative_to(ROOT) and not output.is_relative_to(ROOT / '.tools'):
        raise RuntimeError('Evidence must be outside source or under ignored .tools')
    output.mkdir(parents=True, exist_ok=False)
    sources = [SOURCE, PROOF, RUNNER]
    before = {path: digest(ROOT / path) for path in sources}
    receipt = {'status': 'failed', 'sourceSha256': before,
               'scope': 'Owning Android JVM registry proof; no host bridge, WebView, shell-verifier or device proof.'}
    try:
        result = subprocess.run(
            ['javac', '-Xlint:all', '-Werror', '-d', str(output / 'classes'),
             str(ROOT / SOURCE), str(ROOT / PROOF)],
            text=True, capture_output=True, timeout=60)
        (output / 'compile.log').write_text(result.stdout + result.stderr)
        if result.returncode:
            raise RuntimeError('javac failed; inspect retained compile log')
        result = subprocess.run(
            ['java', '-cp', str(output / 'classes'), 'org.nostrocket.hypergolic.host.PublishedArtifactRegistryProof'],
            text=True, capture_output=True, timeout=60)
        (output / 'run.log').write_text(result.stdout + result.stderr)
        if result.returncode:
            raise RuntimeError('Proof failed; inspect retained run log')
        proofs = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
        if len(proofs) != 1 or proofs[0].get('status') != 'passed' or not isinstance(proofs[0].get('assertions'), int):
            raise RuntimeError('Incomplete owning proof receipt')
        if before != {path: digest(ROOT / path) for path in sources}:
            raise RuntimeError('Owning source changed during execution')
        receipt.update(status='passed', assertions=proofs[0]['assertions'], proof=proofs[0])
    finally:
        (output / 'result.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
