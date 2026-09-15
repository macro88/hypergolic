# Identity storage implementation checkpoint

The application now enters through one process-owned identity vault. Android has
shown the same valid public identity in its header and trusted Settings after a
real process restart. iOS native storage builds, but its protected-file behavior
still requires a physical iPhone. This is partial v1 implementation; import,
identity switching, authenticated backup/deletion, signing and full device
acceptance remain open.

## Ownership and first entry

The native owner admits one React Native identity bootstrap per OS process.
A second bootstrap requires a process restart, preventing replacement runtimes
from opening a competing vault while earlier asynchronous work may still finish.
Secure native randomness is installed before Nostr code is imported. The Expo
`getRandomValues` path is used; no development `Math.random` fallback is accepted.
Only a public snapshot reaches the current shell header and Settings.

The vault keeps public inventory and operation journals in the dedicated
`hypergolic-identity-v1.db` SQLite database. Protected inventory receipts, staged
operations and secret readback determine whether a mutation committed. Unknown
storage outcomes fail without generating a replacement identity. All admitted
secret verification reads finish and clear their mutable buffers before the vault
releases its operation lock. This is not a claim that JavaScript strings or every
runtime copy can be erased.

## Platform adapters

Android uses Expo SecureStore's Android Keystore-backed encrypted storage with a
fixed service and verified readback. Its adapter accepts the actual Android API;
iOS-only Keychain accessibility constants are not required. Expo's generated
backup and device-transfer rules exclude the SecureStore preferences. Actual
backup transport, device lock behavior and physical-device security remain to be
validated. The current Android deletion authorization path denies requests.

iOS keeps Nostr secret payloads in authenticated encrypted files. Only the wrapping
key and nonsecret inventory receipt enter Keychain. The file adapter requires
complete file protection, backup exclusion, restricted permissions, regular files
and its fixed native-owned directory. Atomic replacement and durability checks
remain mandatory. The native action owner binds authentication and one-use deletion
grants to the live process/session and exact target; the user-facing action flow
and real-device authentication are not yet accepted.

## Simulator limitation

Foundation omits file-protection attribute reads and writes on iOS Simulator.
The [owning Foundation source at a pinned revision](https://github.com/swiftlang/swift-foundation/blob/f379cf17df0d897af980a981ce4a60dc94ee6356/Sources/FoundationEssentials/FileManager/FileManager%2BFiles.swift#L658-L667)
and the actual native probe agree: backup exclusion, permissions and non-symlink
checks pass, but the protection attribute is absent. The production policy rejects
this environment. Changing a String cast would not supply the missing protection.

iOS availability now reports that unsupported environment before SQLite is opened
or an identity journal is created. The entry screen says “Use a physical iPhone.”
A supported-device result is only an environment check; real storage operations
must still pass every protection guard. Native errors and malformed availability
responses remain failures. There is no alternate production secret backend or
runtime flag that bypasses protection.

An earlier development attempt left an initialization journal before a protected
receipt or staged identity could be confirmed. The current build preserves it.
A phase-less initialization journal with no durable staged key deliberately
requires recovery; logs are not permission to clear it or generate another key.
No reset or automatic repair has been added.

Shared Simulator UX testing uses a separate test-entry workstream with labelled
public fixture identities. Those tests must not be reported as iOS identity
creation, key persistence, authentication or signing proof. Full v1 still requires
those workflows on both Android and iOS.

## Validation and remaining work

`pnpm run test:security` runs the vault, codecs, SQLite/adapter, native-owner and
randomness regressions, then builds a fresh isolated test bundle for the actual
entry/bootstrap composition. The latter uses explicit test-only native ports;
its React element assertions are not native rendering evidence.

`python3 scripts/test-identity-native.py` compiles the owning native identity
sources for the Swift unit suites. Their fake file-policy, Keychain and device-auth
ports do not establish physical-device behavior. The [separate real file-policy
XCTest probe](../tests/native/ios-file-policy/README.md) verifies Simulator rejection and provides physical-device cases for
protected replacement/readback and downgrade rejection.

The normal iOS Simulator build was installed byte-for-byte and cold-launched.
Its visible device-required screen and unchanged existing nonsecret database/
protected-directory contents were checked. No secret content was inspected.
Android public-identity continuity and the absence of an iOS storage fallback are
separate findings. Completing import/switching, device-authenticated actions,
napplet saved-data access, approval/publish, verified loading and final standalone
Android/iOS acceptance remains necessary.

## Recorded checkpoint

The diagnostics-free [Android identity driver](../tests/native/android-identity.md)
passed two cold launches with distinct app processes and four equal, independently
checksum-validated public values. Its shutdown check requires the real pidof exit
status and empty stdout/stderr, so a disconnected device cannot count as a retired
process. The initial resumed run found a stopped emulator and failed before input;
the recorded pass uses the existing emulator data after normal startup.

The separate standalone Release Simulator fixture uses byte-identical production
shell and napplet-host sources, a labelled public identity, and a different bundle
identifier. Its seven switching/state checks pass, including the two-column grid,
restoring independent input/counters and stopping at each end. It contains no
identity storage or signing modules. Its preparation remains a private test
artifact, not an alternate production entry or an iOS identity proof.

The resumed local checks pass 278 security cases, 13 actual-bootstrap cases,
25 workspace cases, 12 Android harness cases, three owning-decoder cases and five
file-policy runner cases. Earlier unchanged native source passed 52 Swift test
functions (82 parameterized cases); the real Simulator file-policy test passed
once with zero skips. Source paths and execution scopes are distinct in their
receipts. No import, backup, deletion, signing or physical-device success is implied.

Private receipts and inspected screenshots are preserved in
`.tools/evidence/identity-checkpoint-20260915`. Full local aislop scoring is 100/100;
complete React Doctor reports zero findings with numeric scoring disabled pending
permission for its external request. Neither gate has been weakened. The reviewed
adm-zip 0.6.1 security update is confined to quality-tool dependencies.

The separate fixture also passes four native content-gesture checks: vertical and
horizontal scrolling, marker selection, and retained scroll/selection after
switching away and back. Root, runtime and quality-tool dependency audits report
no known vulnerabilities. Expo Doctor passes 20 of 21 checks; the remaining check
requests newer patches for Expo, Crypto, Image, SecureStore and SQLite. The
explicit Expo 57.0.20 pin is preserved; no compatibility exclusion or suppression
has been added. The aggregate `pnpm run check` is therefore not green.

Workspace descriptor persistence is now integrated; see [workspace storage](workspace-storage.md)
for the subsequent Android and isolated iOS native restart evidence.
