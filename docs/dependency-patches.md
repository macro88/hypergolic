# Dependency patches and approved exceptions

## node-forge1.4.0 — GHSA-86w9-cpqp-85rv

Expo57.0.20 → @expo/cli57.0.22 and @expo/code-signing-certificates0.0.6
resolve one node-forge1.4.0 dependency. The [reviewed advisory](https://github.com/advisories/GHSA-86w9-cpqp-85rv),
updated1October2026, affects all published versions through1.4.0 and lists no
patched release. The registry still reports1.4.0 as latest; @expo/cli57.0.27 and
@expo/code-signing-certificates0.0.7 still require node-forge.

The local pnpm patch copies only the RSA source change from proposed upstream
[PR1152, commit ceba34402e329f0365134f23fe19898756527d65](https://github.com/digitalbazaar/forge/commit/ceba34402e329f0365134f23fe19898756527d65).
It checks nested DigestAlgorithm element counts as well as the outer DigestInfo,
rejecting extra unconsumed ASN.1 children. The upstream PR is open and unmerged;
this is a local remediation, not an official release or an upstream security
review. Package name/version remain truthful. The patch and pnpm lockfile pin
its content; `pnpm install --frozen-lockfile` succeeds.

Independent locally generated e=3 RSA cases reproduce acceptance of malformed
nested children before the patch. After the patch, valid NULL/absent-parameter
forms still pass Forge and extra children fail. Node/OpenSSL independently
accepts the NULL form and rejects all malformed forms; it also rejects absent
SHA256 parameters, so that optional-parameter check is Forge compatibility only.
The upstream RSA suite run against the installed patched library passes101 tests
with four upstream pending cases. Actual Expo certificate generation, PEM
round-trip, CSR, issued certificate, manifest signing, altered-message denial
and mismatched-key denial pass. Repository quality-verifier regressions pass58
tests. `pnpm run test:quality` includes the installed dependency checks.

The registry audit still reports this advisory for version1.4.0. It is retained
without an allowlist, version relabelling or suppressed scan. React Doctor scored
100/100; the last complete aislop run scored98/100, and the root audit failed
while the other eight lockfile audits passed. The owner explicitly approved a narrow acceptance exception for this patched
advisory on 2 October 2026; it also covers the resulting98/100 score and root
audit failure. All other findings, coverage, scan completion and audits must
still satisfy the normal quality requirements. The normal requirement remains two100/100 scores and complete clean audits;
Phase2.4 is accepted under this exception after final-source validation. The
normal verifier and audit continue to fail honestly; they are not reported as
100/100 or clean. A separate retained review checks exact fresh source/tool/raw
report hashes, complete scan coverage, the sole matching advisory/diagnostic,
eight clean audits and the exact installed patch in both Expo consumers. Any
additional finding fails acceptance.

If a patched official release becomes available, replace this local patch, verify
the installed dependency closure, rerun these cases and complete unsuppressed
quality/audits. The file will be updated with the actual disposition.


The owner authorized continuing subsequent phases under this one exception.
Recheck the actual visible finding and patch closure at each phase boundary;
it does not authorize any other advisory, lower score or skipped check. Patch
SHA256: `0169a20d1e125a82cafab56e53fa41e0c6caf2148dca29511c251d6411dc632a`.
Installed patched `lib/rsa.js` SHA256:
`acc22e5d36e27832c34e02dd3933aad7977d45b047eead5016520735efedc9c5`.
Both rebuilt signed-upload products are byte-identical to their earlier products;
Android nine/iOS eleven actual native checks and both ordinary exports/Release
compilations pass after the locked patch.


The generated unified patch's blank context marker was normalized into an
equivalent empty-line remove/add hunk for the repository whitespace check. It
changes patch encoding/hash only; the installed RSA source hash remains exactly
unchanged. Frozen installation and all58 quality/API regressions pass afterward.
Final build29 repeats packaging with the normalized lockfile; its exact products
are compared to the already tested build27 products.


Phase2.5 recheck on2October2026: registry latest remains1.4.0, the advisory has no
patched official release, and PR1152 remains open/unmerged at the same selected
commit. The complete new report scores ReactDoctor100/aislop99, with zero warnings
and only the same Forge diagnostic. The better score reflects the current clean
source inventory; it is not suppression or a new exception. All58 verifier/installed
patch regressions pass. Eight audits are clean; the root audit still reports only
GHSA-86w9-cpqp-85rv. The fresh separate review requires the actual99 score, complete
coverage and exact unchanged patch/consumer hashes, and rejects any extra finding.


## braces3.0.3 — GHSA-vfj7-8cjw-p6xm — approved exception

The 3 October 2026 complete audit identifies a second high advisory in both
Expo CLI → Expo Metro file map → micromatch → braces and the isolated quality
scanner → micromatch → braces. The [reviewed advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
affects versions through3.0.3 and lists no patched release. The owning
[report](https://github.com/micromatch/braces/issues/70) describes uncontrolled
recursive AST traversal. The existing Forge exception does not cover this finding.

The approved local patch is `tools/quality/patches/braces@3.0.3.patch`, shared by
the root and quality lockfiles. Package names and versions remain3.0.3. A fixed
256-level guard bounds parse stacks, compile/expand/stringify walkers, expansion
parent traversal and array flattening. Excessive nesting raises an explicit
RangeError before stack exhaustion. This is a locally authored mitigation with
no upstream security review or released-fix claim. It intentionally rejects
unusually deep patterns; normal expansion, compile/stringify and micromatch
results are covered by positive cases. Callers must still handle invalid-pattern
errors, just as they must handle existing syntax and length errors.

Unmodified3.0.3 reproduces stack exhaustion for an8003-character nested expansion
and direct6000-level ASTs. Installed patched copies in both actual consumers
reject those inputs with the guard. All16 new consumer cases and all74 combined
quality regressions pass; installed library files match between both consumers.
PatchSHA256: `161bd9d790cc0ff2e1cbcd08818d8eece91c27c00575678613ca697b780876a6`.
Frozen installation is verified. A pnpm cached installation initially retained
unpatched files despite the hash-labelled path; forced frozen reinstall resolved
it. The installed tests detect that failure rather than trusting the path.

The complete scanner still reports Forge and braces with zero other findings;
ReactDoctor100 and aislop97 are the actual scores. Root audit has both advisories,
quality audit has braces, and the other seven lockfile audits are clean. Scoring,
versions, audit data and standard gates are unchanged and still fail visibly.
The owner explicitly approved this additional exception on 3 October 2026,
limited to the tested locked patch, this advisory in the two identified consumers,
the resulting97/100 score and the root/quality audit failures. All other quality
requirements remain. Any other finding, new dependency consumer, incomplete scan
or changed patch requires fresh review. Phase2.6 acceptance requires a fresh full
report and separate exact-scope review; the ordinary verifier stays unchanged.
