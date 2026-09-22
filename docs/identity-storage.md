# Identity storage implementation checkpoint

The application now enters through one process-owned identity vault. Android has
shown the same valid public identity in its header and trusted Settings after a
real process restart. iOS native storage builds, but its protected-file behavior
still requires a physical iPhone. [Identity import and whole-shell switching](identity-switching.md)
are integrated with shared trusted Settings. Inactive deletion now has the Android
system-authentication evidence below. Manual backup is implemented on both native
platforms with the scoped evidence below. iOS physical authentication, older Android
compatibility, signing and full device acceptance remain open.

## Ownership and first entry

The native owner admits one React Native identity bootstrap per OS process.
A second bootstrap requires a process restart, preventing replacement runtimes
from opening a competing vault while earlier asynchronous work may still finish.
Secure native randomness is installed before Nostr code is imported. The Expo
`getRandomValues` path is used; no development `Math.random` fallback is accepted.
The shell receives public snapshots and narrow trusted identity-change controls;
no secret accessor or vault storage object reaches a napplet.

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
validated. Android deletion uses the native authenticated effect described below;
the SecureStore adapter refuses deletion when that effect is absent.

iOS keeps Nostr secret payloads in authenticated encrypted files. Only the wrapping
key and nonsecret inventory receipt enter Keychain. The file adapter requires
complete file protection, backup exclusion, restricted permissions, regular files
and its fixed native-owned directory. Atomic replacement and durability checks
remain mandatory. The native action owner binds authentication and one-use deletion
grants to the live process/session and exact target. The shared action UI and native
availability method now compile, but real-device authentication and the complete
iOS action journey are not yet accepted.

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


## Android deletion authority checkpoint

The native-only `DeletionAuthority` now provides the approval state machine needed
for the Android action adapter. Settings ownership captures a validated immutable
inventory; an authentication attempt is bound to that owner, session, identity and
revision. Attempts expire after 60 seconds and successful grants after 15 seconds,
using the injected native monotonic clock. Every deletion validates the inventory
again at its effect, consumes the exact token once, and serializes revocation with
the synchronous erase. A failed erase cannot reuse its token. Background, settings
dismissal, inventory mutation and runtime retirement invalidate earlier authority.

The owning JVM suite now passes 126 assertions, including changed native inventory, late
authentication, expiry during the final read, replacement sessions, failed effects
and concurrent revocation. Android prebuild and the actual module's Release Java
and Kotlin compilation pass. These tests use explicit native port doubles; they
do not establish Android OS authentication or protected storage behavior.
The native fixed-service reader and erase effect now pass the separate runtime
probe below. The subsequent Expo/system-prompt integration has the independent
evidence recorded in the next section. Manual backup remains unfinished.


`SecureStoreIdentityRecords` reads the actual protected inventory and every identity
envelope using the existing Android Keystore key. It creates no key, writes no
secret and accepts only the pinned SDK's canonical format. It rejects legacy or
unknown formats, invalid payloads and incomplete staging without changing them.
The native erase effect removes one exact inactive identity after the authority's
final validation and checks the synchronous preference commit and absence.

The isolated Android runtime probe passes 89 assertions. It reads both existing
SDK-written identities, then tests invalid records and actual erase on disposable
preferences. Existing protected records remain byte-identical. The installed app
and test APK bytes and owning sources are checked before and after execution.
The probe's authentication result is still a double; no system-authentication or
physical-device acceptance is implied. See the [native authority and record proof](../tests/native/android-identity-actions/README.md)
for repeatable commands and exact boundaries. Full local aislop remains 100/100;
React Doctor numeric scoring still requires explicit external-request approval.


## Native authentication and Settings integration

Android identity admission now binds the exact native-created main AppContext and
React Native JavaScript thread. Replacement claims retire the earlier authority;
module destruction, activity background and user departure revoke it. The action
module obtains protected records, entropy and monotonic time natively. No Expo
method accepts an authentication outcome, inventory, runtime identity or file path.
Late cancellation cleans up only its own attempt, including after a newer attempt
has started. Authentication expiry is checked again after native inventory/entropy
work, before issuing a grant.

The shared Settings review displays the exact inactive identity and explains loss
of local key access. No-lock/unavailable authentication cannot enable confirmation.
The Android API 30+ system prompt accepts a strong biometric or device credential;
a PIN-only device works. API 26–29 remains unsupported by this new action adapter
and is an open v1 compatibility item, not a silently changed application minimum.
Cancellation is effective during workspace flush, protected-key verification,
native Settings opening, authentication and journaling. Native erasure checks and
consumes the exact target/token synchronously. An unconfirmed Android erase cannot
become success through an in-memory absence readback. Known native denial with the
key still present leaves the exact journal retryable; inconsistent outcomes require
recovery. The iOS erase adapter now applies the same conservative failure rule: a
native unlink/flush or transport failure requires recovery even if a later file read
returns absence. Only a known native authorization denial remains retryable when
the core confirms the key is still present. Its physical action journey remains open.

The actual isolated Android Release app passes eight checks in one run: no lock,
exact review cancellation, system cancellation, background revocation, wrong PIN,
the native 60-second timeout, successful PIN deletion with all three loaded napplet
drafts retained, and deletion/current-workspace persistence across restart. It uses
only a public disposable test key and a named disposable auth emulator. APK bytes,
owning source snapshots and harness hashes match before/after. APK SHA256:
`0e98e9b517e671e4b04c89f828a69c4ad1244072fb7c534be64c03aa257052d8`.
The UI review, removed identity and retained live draft screenshots were inspected.
Android protects the system credential dialog from screenshots; its captures are
blank. Native hierarchy, foreground ownership and callback/effect behavior supply
that portion of the evidence; no screenshot protection was bypassed.

The protected-record probe again passes 89 assertions on the prior isolated
installation, with all pre-existing protected records unchanged. The current
native authority passes 126 JVM assertions. Shared checks pass 291 security tests,
13 bootstrap tests, 80 storage tests, 27 capability tests, 25 shell tests and
TypeScript. Both production JS exports, Android Release and the actual iOS Debug
Simulator native build pass. Local React Doctor has zero findings but no numeric
score; full aislop is 100/100. External scoring approval is still pending.
The iOS owning suite passes all 52 tests. A previously intermittent macOS exclusion
test now establishes actual effective metadata removal before checking refusal;
protection verification clears cached URL resource values before reading. This
neither supplies Simulator Data Protection nor establishes physical-device proof.
The normal iOS app remains unavailable on Simulator. See the [repeatable Android
action journey](../tests/native/android-identity-actions/README.md).

The refreshed actual file-policy probe passes its one Simulator unsupported-protection
test with no skips; its unsigned iPhoneOS branch also compiles. Exact current source
hashes are recorded by the [file-policy harness](../tests/native/ios-file-policy/README.md).

The targeted iOS erase-boundary follow-up adds four regressions for failures before
and after file removal, sanitized errors and consumed-token replay. All 295 security,
13 bootstrap and 80 storage tests, TypeScript and the iOS export pass. Full aislop
remains 100/100; local React Doctor has zero findings and no numeric score. This is
shared adapter/core verification; it does not add physical iOS execution evidence.

## Fingerprint and iOS review checkpoint

The isolated API 36 Release fixture now passes four real-system fingerprint checks:
unrecognised/cancelled authentication preserves inventory, leaving the app revokes
the request, matching authentication deletes only the inactive public test identity
while retaining all three live drafts, and deletion/current workspace survive a
process restart. Enrollment was performed through Android Settings on the named
`Hypergolic_Auth_API_36` emulator, using only its public test PIN and virtual sensor.
No production test credential or authentication-result setter was added.

Both the initial fingerprint run and the final lazy-restoration build pass. One
intermediate attempt stopped when ADB reported that the emulator was offline; its
failed receipt is retained, and the subsequent full run passed. Current APK:
`cec0ebf35cad2c4db95e371712710d8b3c4b5456a6b81c539f741d0620120c4b`.
The final receipt is `/private/tmp/hypergolic-android-biometric-deletion-03/result.json`.
The PIN journey remains independently recorded against its earlier attested APK.
This does not establish physical biometric hardware or Android API 26–29 acceptance.

The shared iOS deletion review also passes three checks on each of three consecutive
clean launches: the exact inactive npub, no confirmation when authentication is
unavailable, and cancelled review retaining identity/inventory/live draft. The
public-only fixture uses an explicit unavailable-authentication double; all native
identity/secret modules remain absent. All 90 installed product files match the
attested app before and after these runs. The earlier intermittent eager-startup
failure and lazy-restoration fix are recorded in [workspace storage](workspace-storage.md).
Physical iPhone key protection, system authentication and actual deletion remain open.

Private receipts and inspected screenshots are retained in
`.tools/evidence/identity-actions-lazy-20260915` and the canonical Notes checkpoint.
TypeScript, 25 shell tests and all 50 native-driver tests pass. Full aislop remains
100/100 and local React Doctor has zero findings. Its external numeric score still
awaits explicit approval; zero findings are not recorded as a verified 100 score.


## Manual backup implementation (22 September 2026)

The shared Settings review requests backup only for the selected identity and
shows its exact public npub before an explicit authentication tap. Its narrow
native interface returns only completion. Secrets, nsec rendering and reveal
controls stay in native code; the shared component cannot read a private key.
Backup and deletion share the same pending-action lock and exact Settings session.
Each cancellation, replacement session or background transition invalidates earlier
work. Missing native backup methods leave the feature unavailable.

On Android, the native authority binds fresh device authentication to backup of
the exact selected identity and protected inventory. A backup attempt cannot issue
a deletion grant. After authentication, one native read checks the encrypted record
digest and inventory again, and returns a mutable character buffer only to the
native panel. The panel draws directly to a Canvas in a `FLAG_SECURE` window,
excludes secret content from accessibility/autofill/content capture, and clears
its owned buffer on hide, focus loss, background, cancellation or expiry. There is
no clipboard/share action or secret bridge return. Authentication and reveal each
expire within 60 seconds. Java/JSON String and platform rendering-buffer erasure
are not claimed.

Nsec encoding follows [NIP-19 at the reviewed revision](https://github.com/nostr-protocol/nips/blob/01e707bacdc87cf262db80545aecaa8f17ac2a4f/19.md):
ordinary Bech32, `nsec` prefix, 32-byte nonzero secp256k1 scalar. Owning JVM checks
include reference vectors, action confusion, late authentication, stale inventory,
cancellation, expiry, failed reads and wiping denied output. The current suite
passes 126 deletion/ownership assertions, 88 backup assertions and 13 encoding
assertions. These are native authority tests with explicit OS-auth/storage doubles;
they do not substitute for the separate device journey.

The user approved an iOS limitation on 22 September: show a screenshot warning and
use supported native protection while permitting authenticated manual reveal.
Apple provides [recording/mirroring detection](https://developer.apple.com/documentation/uikit/uiscreen/iscaptured)
and [background snapshot guidance](https://developer.apple.com/documentation/uikit/preparing-your-ui-to-run-in-the-background),
but arbitrary screenshots cannot reliably be prevented. The reveal must start
hidden and remain hidden during recording/mirroring, clear before app-switcher
snapshots and require fresh authentication after dismissal. No secure-text-field
layer workaround is part of this design. Physical iPhone validation remains required;
the production Simulator storage policy remains unchanged.

The isolated Android Release app passes all six actual backup checks: exact review
and cancellation, system cancellation, unrecognised fingerprint, background
revocation during authentication, native reveal/hide with screenshot redaction and
private-key accessibility exclusion, then background clearing and fresh
authentication on return. The installed APK is
`ead0b781e4e625da5079e83ccc1c323d9be348d0a218d0aa59bbe878af33e44d`
before and after execution; source and driver seals are unchanged. The review and
redacted panel captures were visually inspected. Earlier harness-label and ADB
timeout failures remain recorded; the complete sixth run is the accepted receipt.
The separate protected-record probe passes 99 assertions and preserves both SDK
identity records byte-for-byte. These are disposable emulator identities.

iOS passes 60 owning native tests (95 parameterized cases) and three actual UIKit
panel tests. The latter source-links the production presenter/encoder and uses
public scalar 2 with an authentication double. It covers initial concealment,
accessibility exclusion, large-text Done reachability, cancellation during
presentation, synchronous resign-active hiding and completion after dismissal.
See the [repeatable Simulator panel harness](../tests/native/identity-unit/ios-backup-panel/README.md).
The unsigned production Simulator Release app builds with a nonempty bundled
JavaScript payload; app-owned source hashes remain unchanged during the build.
This is packaging and panel evidence, not protected storage or LocalAuthentication
evidence. No physical iPhone was connected for this checkpoint.

Shared TypeScript, 309 security, 13 bootstrap, 80 storage, 27 capability and 25 shell
tests pass; Android Release and the iOS export also pass. Full aislop is 100/100,
with no findings. Local React Doctor has no findings and no numeric score; its
external scoring approval is still pending. Private evidence is retained under
`.tools/evidence/identity-backup-20260922`. Physical capture/authentication, the
backup-specific PIN/timeout journey, and Android API 26–29 support remain open.
This checkpoint does not complete v1.


### Backup PIN/timeout driver checkpoint

The tracked Android backup driver now has a separate `--pin-timeout` mode and
`identity-backup-pin-timeout` scenario. It requires the isolated API 36 authentication
fixture, exact installed APK hash and the fixed public scalar-2 selected identity.
It checks system PIN fallback, protected reveal, accessibility exclusion, automatic
expiry and fresh authentication afterward, without extracting the private key.

This new journey has **not passed**. Attempts stopped before authentication while
the emulator was asleep and keyguard was showing; one retained attempt also caught
a source change during the run and is invalid evidence. The final retry could not
start after attempted wake/unlock. Temporary power settings were restored. Existing
six-check fingerprint evidence remains valid; PIN/reveal-timeout acceptance stays
open. The two PNG-helper tests and standalone CLI help check pass.

Example with an already awake/unlocked disposable fixture and its verified APK:

```sh
python3 tests/native/identity_backup.py --pin-timeout \
  --source "$PWD" --serial emulator-5556 \
  --package org.nostrocket.hypergolic.identityfixture \
  --activity org.nostrocket.hypergolic.dev.MainActivity \
  --expected-apk-sha256 "$HYPERGOLIC_FIXTURE_APK_SHA256" \
  --output /private/tmp/hypergolic-backup-pin-timeout-proof \
  identity-backup-pin-timeout
```
