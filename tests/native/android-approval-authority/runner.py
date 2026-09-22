#!/usr/bin/env python3
"""Compile the owning native approval core directly and retain a sealed JVM receipt."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
SOURCE = 'modules/napplet-host/android/src/main/java/org/nostrocket/hypergolic/host/NativeApprovalAuthority.java'
PROOF = 'tests/native/android-approval-authority/AuthorityProof.java'


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
    sources = [SOURCE, PROOF, str(Path(__file__).resolve().relative_to(ROOT))]
    before = {path: digest(ROOT / path) for path in sources}
    receipt = {'status': 'failed', 'sourceSha256': before,
               'scope': 'Owning native JVM approval lifetime with explicit clock double; no bridge, signer, network or device proof.'}
    try:
        commands = [
            ['javac', '-Xlint:all', '-Werror', '-d', str(output / 'classes'), str(ROOT / SOURCE), str(ROOT / PROOF)],
            ['java', '-cp', str(output / 'classes'), 'org.nostrocket.hypergolic.host.AuthorityProof'],
        ]
        for name, command in zip(['compile', 'run'], commands):
            result = subprocess.run(command, text=True, capture_output=True, timeout=60)
            (output / (name + '.log')).write_text(result.stdout + result.stderr)
            if result.returncode:
                raise RuntimeError(name + ' failed; inspect retained log')
        proof = json.loads(result.stdout)
        if proof.get('status') != 'passed' or not isinstance(proof.get('assertions'), int) or proof['assertions'] < 1:
            raise RuntimeError('Incomplete owning proof')
        if before != {path: digest(ROOT / path) for path in sources}:
            raise RuntimeError('Owning source changed during execution')
        receipt.update(status='passed', assertions=proof['assertions'])
    finally:
        (output / 'result.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
