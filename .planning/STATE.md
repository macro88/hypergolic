---
gsd_state_version: '1.0'
status: executing
progress:
  total_phases: 3
  completed_phases: 1
  total_plans: 8
  completed_plans: 2
  percent: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-14)

**Core value:** Shell control of identity and privileged operations.
**Current focus:** Complete v1 native acceptance on Android and iOS. Public relay/Blossom first-open passes on Android API 36, Android API 29/WebView 91 and iOS 26.5 Simulator; the normal Android API 29 app opens and restores the remote guest under its process-owned identity. Embedded signed update and changed-access journeys pass on Android API 36/API 29 and iOS Simulator. API 26/WebView 58 safely refuses guests with an actionable update message. Next prove live published updates, protected identity/signing on a physical iPhone and compatibility with an updated API 26 WebView. Android system PIN/fingerprint deletion and both-platform workspace restoration have scoped native evidence.

## Current Position

Phase: 2 of 3 (Independent Android and iOS proof / seed phase 1)
Plan: 02-04 individual signing approval; remaining 02-03 device security and 02-07 acceptance
Status: Identity/workspace/import/switch and manual backup are implemented; State Lab and lazy restoration work on both platforms. Signing has Android protected-signing/local-wire proof and iOS public-fixture review proof. Public remote first-open works on both platforms, and the normal Android API 29 path restores a connected remote guest. Live remote updates, physical iPhone protected identity/signing and full release acceptance remain open.
Previous integration: 2026-09-15 — Connected the reviewed State Lab catalogue, genuine Kehto/SDK, native transports and process-owned SQLite/identity authority. Both isolated native platforms pass all six storage/identity/restart/isolation checks in a single run each; each also passes three close/reopen checks. New openings use persisted native UUIDs, with regression coverage for display-number reuse. All 27 broker/owner, 71 storage/transition, 25 shell and 76 browser-runtime tests pass. The refreshed WK boundary suite passes all 17 methods; sealed inputs/products remain identical. Full aislop is 100/100 and local React Doctor has zero findings; numeric scoring awaits explicit approval. The observed handle/text overlap is fixed with a reserved 12-point guest margin; both rebuilt isolated apps pass the three-check close/reopen journey and their screenshots show unobscured text. Authenticated actions, signing, published loading and physical security remain open. See docs/native-capabilities.md. Progress metadata counts plans, not product completion.

Previous native action checkpoint: 2026-09-15 — Added the Android native deletion authority with 95 owning JVM assertions and the protected-record/erase reader with 89 actual Android assertions. Existing SDK records are unchanged; disposable data alone was erased. The actual Release app and separate instrumentation APK build and their installed bytes match. The production deletion path remains denied pending native context/lifecycle and system-prompt integration; authentication in the record probe is a double. See docs/identity-storage.md.

Previous system-auth checkpoint: 2026-09-15 — Connected Android native main-context ownership, lifecycle, system authentication and guarded erasure with shared Settings. All eight actual PIN/cancel/background/timeout/draft/restart checks pass on the isolated API 36 auth emulator. Native record probe remains 89/89 with existing records unchanged; native authority is 126/126. Shared security 291, bootstrap 13, storage 80, capability 27 and shell 25 tests pass. TypeScript, both exports, Android Release and actual iOS Debug Simulator compilation pass; iOS owning unit suite is 52/52. Aislop 100/100; local React Doctor zero findings/no numeric score. Remaining limits and source/artifact evidence are in docs/identity-storage.md. No source push or remote change.

Previous environment checkpoint: 2026-09-12 — local iOS development setup completed: native Simulator Debug build, input/navigation, Hermes/logging, reload, Fast Refresh and cold launch verified. Original scaffold and Android artifacts preserved. This environment checkpoint does not advance the product/security phase; see docs/development.md.

## Accumulated Context

### Decisions

See `docs/architecture.md` for confirmed requirements and unresolved policy.

### Blockers/Concerns

First theme-only native contract is selected. Validate privileged adapters and delivery contracts before their dependent work. Preserve Expo 57.0.20 despite the existing Doctor patch-version mismatch. Source remote/push remains owner-only.
Current budget (2026-09-28): the user authorized continuation until 60% weekly usage remains (40% consumed), then pause for approval. Check account usage after each small batch. Keep source remote configuration and push owner-only.
Android emulator and iPhone Simulator scaffold checks are verified. Physical-iPhone signing and execution remain untested; native security acceptance is still open.
See `docs/phase-zero.md` for actual checks and artifacts.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
| --- | --- | --- | --- | --- |
| 260914-s6w | UX Lab fixture and browser regression suite | 2026-09-14 | 88f2c1a | [260914-s6w-build-the-approved-ux-lab-napplet-fixtur](./quick/260914-s6w-build-the-approved-ux-lab-napplet-fixtur/) |
| 260914-szf | Project logo and stable navigation decisions | 2026-09-14 | 97f31e0 | [260914-szf-record-opening-order-and-preserve-the-su](./quick/260914-szf-record-opening-order-and-preserve-the-su/) |
| 260914-ujk | Accepted v1 defaults and RocketShell relay configuration | 2026-09-14 | a304450 | [260914-ujk-adopt-accepted-v1-defaults-and-rocketshe](./quick/260914-ujk-adopt-accepted-v1-defaults-and-rocketshe/) |
| 260916-dwb | Logo-led README with verified scope, setup and trust limits | 2026-09-16 | See task summary | [260916-dwb-rewrite-the-hypergolic-readme-with-the-s](./quick/260916-dwb-rewrite-the-hypergolic-readme-with-the-s/) |
| 260917-dg2 | Signed tester APK command and sharing instructions | 2026-09-17 | See task summary | [260917-dg2-add-a-signed-tester-apk-build-command-an](./quick/260917-dg2-add-a-signed-tester-apk-build-command-an/) |

Targeted follow-up: iOS native erase/transport failures remain READBACK_FAILED even when subsequent reads return absence. Four new regressions pass; security is 295/295, bootstrap 13/13, storage 80/80, TypeScript and iOS export pass. Aislop remains 100/100 and local React Doctor has no findings.

Last activity: 2026-09-15 — Android fingerprint deletion passes four OS-callback checks on the current isolated APK. Three consecutive clean iOS launches pass exact review, explicit unavailable-auth denial and cancelled-review live-state retention. Both rebuilt platforms pass three State Lab close/reopen checks. Eager startup sometimes left iOS without identity; lazy restoration now starts only the focused napplet and retains visited views. Failed startup/ADB-offline runs remain recorded. TypeScript, 25 shell tests and 50 native-driver tests pass; aislop 100/100, local React Doctor zero findings/no external numeric score. See docs/identity-storage.md and docs/workspace-storage.md. Pausing this budgeted continuation at the final checkpoint; latest weekly usage 43%, below the 45% stopping margin. No source push or remote change. Next: authenticated manual backup, older Android action compatibility, physical iPhone security proof, signing approvals and verified remote loading.

Current continuation (2026-09-22): authenticated manual backup is in progress. User approved native iOS reveal with an explicit screenshot warning: public APIs cannot prevent screenshots; hide on recording/mirroring, inactivity/background and app-switcher snapshots. Fresh device authentication remains mandatory. Android uses a native FLAG_SECURE panel. No secret is returned to the shared backup UI. Native execution evidence is pending; no v1 completion claim.

Backup checkpoint (2026-09-22): manual backup is implemented on both platforms.
Android's isolated Release app passes all six real-system fingerprint/reveal/
cancellation/background checks with matching installed APK and source seals; the
protected-record probe passes 99 assertions with existing records unchanged. iOS
passes 60 native tests and three source-linked UIKit panel tests, and its unsigned
Simulator Release app includes the actual JavaScript bundle. Physical iPhone
authentication/storage/capture, older Android and backup-specific PIN/timeout proof
remain open. Shared regressions pass; aislop 100/100 and local React Doctor zero
findings/no external numeric score. Next: individual signing approval authority,
immutable event verification and revocable publication. Current weekly usage at
this checkpoint: 14% consumed; continue only below the requested 25% pause point.
No source push or remote change. See docs/identity-storage.md.


Signing foundation checkpoint (2026-09-22): added separate Android/iOS native
approval lifetime cores, a shared presentation queue, immutable NIP-01 event
capture, independent signature verification and a revocable Applesauce relay
adapter. Owning core tests and actual local WebSocket checks pass; no native
signer, review sheet, relay capability or publication route is enabled yet.
Plan 02-04 remains in progress. See docs/signing-approval.md and
.planning/phases/02-independent-android-proof/02-04-PROGRESS.md for exact scope,
commands and missing integration. No source push or remote change.


Budget pause (2026-09-22): latest weekly usage 24% consumed / 76% remaining.
Stopping before the 25% limit; no further implementation until approval. Backup
is committed as 43a65c3; signing foundations and Approval Lab as 6aabaed. The new
Android PIN/timeout driver is recorded as unverified: emulator lock/sleep prevented
the native journey and temporary power settings were restored. Signing integration,
remote loading and physical/older-platform acceptance remain open. Full aislop is
100/100; local React Doctor has zero findings but no externally verified numeric
score. No source push or remote change.

Continuation (2026-09-23): native publication transport, shared approval UI, protected signing and SDK fixture integration are in progress on the existing branch. Latest usage check: 31% weekly consumed. New unit tests pass; full native signing journeys remain pending. Earlier budget pause is superseded by the user's explicit continuation.

Signing integration checkpoint (2026-09-23): Android now passes visible rejection,
approved exact publication, relay rejection/auth-required/unknown outcomes, queue
pause/resume, and pending/approved background revocation against isolated native
fixtures. iOS passes all four native review/queue/background checks using the
explicit public-identity Simulator fixture, without signing. Native runs exposed
and fixed the catalogue publisher mismatch; the real-workspace regression passes.
344 security, 13 bootstrap and 31 capability tests pass; aislop 100/100, local React
Doctor zero findings with numeric scoring still pending permission. No physical
iPhone is currently connected. Full v1 acceptance remains open; source push and
remote changes remain owner-only. Latest weekly usage check: 44% consumed.

Additional acceptance (2026-09-23): the normal Android entry is restored and passes
review/queue/background checks; its temporary loopback mapping/server are removed.
The normal iOS Release entry builds with its actual JavaScript bundle. Android PIN
backup now passes protected reveal, approximately 64-second expiry, and mandatory
fresh authentication, with two saved identities retained. The only fix was the
scoped System UI test observation; production backup code is unchanged. See
`docs/identity-storage.md`. Latest weekly usage check: 46% consumed.


Continuation checkpoint (2026-09-23): stopping at 47% weekly consumed, leaving
headroom below the requested 50% limit instead of starting another implementation
batch. Signing integration and the normal-entry/PIN acceptance above are complete
within their stated fixture limits. Next independent build slice is verified
remote napplet resolution and artifact validation (02-05); physical iPhone
protected signing/capture and older Android acceptance remain open. External
React Doctor scoring still awaits permission; its local scan has zero findings.
No source push or remote change. Continue only after the user authorizes it.


Published verification and relay-settings continuation (2026-09-23): kind-35129
coordinate resolution, signed manifest/HTML verification, exact event pinning,
bounded transport interfaces and first-run/editable native relay settings were
saved locally as commit `73ac78c`. Android and iOS JavaScript exports, 40 focused
tests, TypeScript, React Doctor 100 and aislop 100 pass. Standalone Android/iOS
native artifact registries then passed 70/36 owning checks and compiled in normal
Release builds, but are not wired to the app or hosts. Safe native HTTPS/relay
ports, first-open consent, host byte handoff, update flow, both-platform
published execution and native relay-settings UI journeys remain open. Latest
usage check: 52% consumed / 48% remaining; the user-requested pause is at 70%
consumed. No source push or remote change.

Published staging checkpoint (2026-09-23): Android and iOS Expo modules now
provide app-only, bounded 48 KiB chunk uploads into the one-use native artifact
registries, with session/claim validation, 2 MiB limit, expiry and background
revocation. A verifier-branded JavaScript adapter checks ownership throughout
transfer. Published workspace rows now persist the exact signed event ID; schema
v2 migrates older receipts with an unknown pin so changed-event replay cannot
claim success. Android registry/transfer proofs pass 175 assertions and native
module Release compilation; iOS transfer/registry proofs pass 88/36 checks and
the normal unsigned Simulator Release build compiles with a JavaScript bundle.
TypeScript, 31 napplet, 82 storage, 25 shell, 32 capability, 344 security and 13
bootstrap tests pass; both exports pass. React Doctor scores 100/100 with the
authorized anonymous score request; aislop scores 100/100 with zero diagnostics;
all three dependency audits pass. Expo Doctor remains 20/21 because the project
pins earlier SDK 57 patch versions. Native hosts still run bundled fixtures only:
no app entry/consent, host claim/read path, safe network ports, published
execution or native published journey exists yet. No source push or remote
change.

Published host QA checkpoint (2026-09-23): both native hosts now claim the
one-use staged handle internally and serve exact verified chunks only to their
packaged top document. The trusted runtime rechecks original bytes and aggregate,
inserts CSP before publisher markup and mounts an opaque theme-only guest. A
fixed signed, locally embedded QA napplet uses a discarded disposable key and
has no relay hint. The normal Android Release app reaches its review in Settings;
an isolated public-only iOS Simulator entry tests the same host without weakening
the production identity store. Source/APK-bound Android and source/bundle-bound
iOS XCTest journeys pass exact review, native connection, visible guest marker
and close. Backgrounding the Android lab also removes its session. Android
native registry/read proofs pass 189 assertions; normal Android and iOS Release
builds compile. TypeScript, 33 napplet tests, 14 driver unit tests, React Doctor
100 and aislop 100 with zero diagnostics pass. Remote network ports, first-open
consent, trusted cache, persisted published restart/update flow and normal
workspace entry remain open. Latest usage check: 58% consumed / 42% remaining;
the requested pause remains 70% consumed. No source push or remote change.

Native network checkpoint (2026-09-23): Android/iOS now have shared public-IP
classification, pinned-address HTTPS cores, app-only fetch/cancel/revoke bridges,
and bounded WebSocket frame parsers. A trusted JavaScript adapter decodes bounded
HTTPS bytes, but ordinary published entry does not call it. SQLite schema v3
stores revisioned access grants by user/publisher/napplet; first-open UI and the
authority gate are still open. Native address, HTTPS, bridge and frame proofs,
89 storage tests and 37 napplet tests pass. Normal Android ARM64 and iOS Simulator
Release apps compile with the new code. React Doctor and aislop both score
100/100. Safe native relay connection, remote live journeys, trusted cache,
update/restart and both-platform v1 acceptance remain open. No source push.

Ordinary published workspace continuation (2026-09-23): the app now wires
configured Lookup relays and native HTTPS to a trusted `naddr` coordinator,
explicit first-open publisher/access review, a reverified bounded cache and an
exact pinned workspace session on both Android and iOS. Native hosts bind
capability domains to the one-use staged artifact. Focused integration tests,
the Android parser proof and the source-linked iOS Swift host proof pass;
TypeScript passes, and React Doctor and aislop both score 100/100. Final
Android and iOS Simulator Release builds pass; Android Settings visibly shows
the new naddr form while production iOS Simulator stops at its expected device
identity requirement. Live remote Android/iOS journeys, explicit update UX,
physical iPhone and older-device acceptance remain open. Source remote/push
remains owner-only; user requested continuation until 70% weekly usage consumed.
Explicit published-update checkpoint (2026-09-23): Settings now checks each
loaded published napplet for a newer verified kind-35129 event. The old exact
pin is reverified, rollback is rejected, and the event change needs explicit
confirmation; changed access needs its own review. Acceptance replaces the
workspace card in place with a fresh one-use native session and closes the old
session and pending approvals. Denial preserves the current session. Focused
tests and the shell/storage/capability/napplet suites pass, as do TypeScript and
normal Android ARM64 and iOS Simulator Release builds. React Doctor scores
100/100 and aislop scores 100/100; aislop reports two non-scoring function-length
warnings and a timed-out dependency audit. The native update journey and live
public relay/Blossom path still need phone evidence. The separate app, runtime
and quality-tool dependency audits completed with no known vulnerabilities.
The user handles the new
source remote and push; no source push was made.

Embedded signed-update native checkpoint (2026-09-25): separate public-only
Release fixtures now exercise the real first-open consent and process-owned
published update path. Android API 36 and iPhone 17 Pro iOS 26.5 Simulator
drivers both pass exact signed review, decline retaining the v1 native guest,
approval replacing it with v2, cold restart retaining v2, rejection of an
older signed revision, and background revocation with explicit retry. The
Android run is bound to its installed
APK and frozen source digest; the iOS XCTest report and final screenshots show
the accepted guest. The first Android attempt was blocked by the auth emulator's
PIN keyguard, so the passing run used the separate unlocked test emulator.
Focused fixture tests, TypeScript, React Doctor 100/100 and aislop 100/100 pass.
These embedded runs do not prove public relay/Blossom transport,
changed-access review, fixture guest-signing denial, physical iPhone key
protection, or older Android.
No source remote or push change.

Changed-access native checkpoint (2026-09-25): a second public-only signed
kind-35129 coordinate requests `theme` in v1 and `theme, relay` in v2. Its
independent release control runs through the ordinary process-owned coordinator,
exact event update review, and separate changed-access consent. Android API 36
passes nine APK/source-bound checks: first-open v1, exact update/access reviews,
access denial retaining the connected v1 guest, then both approvals replacing
it with v2. iPhone 17 Pro iOS 26.5 Simulator passes five bundle/source-bound
XCTest checks for the same path. Both final screenshots show a legible v2 guest;
the source, signed bytes, and native app remain public-only test fixtures. The
combined fixture's original unchanged-access update journey also passes
12 Android checks and seven iOS checks against the final artifacts, including
rollback and background recovery. TypeScript, 91 napplet tests, 18 Android
driver tests and 14 iOS driver tests pass. React Doctor and aislop score 100/100;
the three-workspace dependency audit reports no known vulnerabilities. The full
`pnpm run check` is temporarily stopped by Expo Doctor: six SDK 57 patch
releases are newer than this repository's seven-day `minimumReleaseAge`, and
pnpm correctly refuses an early install. No version checks were suppressed or
dependencies changed. Live relay/Blossom loading, physical iPhone identity
security and older Android remain open. No source remote or push change.

Live public-artifact checkpoint (2026-09-25): an externally published, theme-only
`file-browser` event and 56,974-byte HTML passed an independent pinned relay/Blossom
probe. Separate public-only Android API 36 and iPhone 17 Pro iOS 26.5 Simulator
Release fixtures then passed native WSS lookup, signed manifest verification,
native HTTPS retrieval, exact publisher/event/access first-open review, and visible
connected guest after consent. The guest's filesystem UI remains unavailable
because its signed manifest requests only `theme`. The live run revealed two
fixture/adapter gaps: public-only startup had omitted production's native random
bootstrap for relay subscription IDs; React Native's constructed Response lacks
a streamed body, so the shared reader now uses a private, native-bounded byte
branch. TypeScript, 92 napplet tests, React Doctor 100/100 and aislop 100/100 pass.
This does not prove protected production identity, functional filesystem, live
update retrieval, physical iPhone security or older Android. Source remote/push
remains owner-only.


Older-WebView checkpoint (2026-09-25): Android API 29/WebView 91 now passes the
public-only live relay/Blossom first-open path (three source/APK-bound driver
checks) and the normal Release app retains the same public npub and connected
bundled UX Lab across restart. The trusted runtime uses secure compatibility
shims for missing `crypto.randomUUID`/`Object.hasOwn` and a strict legacy query
count. The final iOS 26.5 Simulator fixture again passes native source probe
and 3/3 first-open checks with the same trusted host asset. API 26/WebView 58
verifies the public source and shows consent, but safely refuses guest execution
with `webview-update-required` because the native message-listener feature is
missing. The normal API 26 app retains its public npub across restart but cannot
connect UX Lab with that bundled WebView. Browser runtime 104/104, capability/
napplet 125/125, React Doctor 100/100 and aislop 100/100 pass. Live published
updates, protected remote path, physical iPhone and API 26 guest compatibility
remain open. Source remote/push remains owner-only; requested usage pause is 90%
weekly consumed.


Normal remote-open checkpoint (2026-09-25): the final normal Android API 29
Release APK opened the external public `file-browser` naddr under its
process-owned identity after exact publisher/event/`theme` consent. The native
guest showed Runtime connected. Force-stop and cold launch retained the same
selected npub and remote guest, still connected. This emulator journey does not
exercise secret readback or signing and does not prove physical-device identity
security. Live published updates, iPhone protected path, and API 26 modern
WebView support remain open. No source push or remote change.


Normal API 29 State Lab checkpoint (2026-09-25): the same Release APK and
WebView 91 connected bundled State Lab to the selected public identity. The
actual native storage broker confirmed a disposable Write and Read; after a
force-stop and cold launch, Read returned the saved value again. This manual
emulator observation exercises Kehto's older-WebView operation path, but does
not establish remote storage grants, signing, or physical-device security.
Source remote/push remains owner-only.


Android API 29 signed-update compatibility (2026-09-25): the final Release
fixture on WebView 91 passes the embedded unchanged-access and changed-access
journeys, including exact publisher/event review, separate new `relay` access
consent, declines retaining v1, accepts replacing v1, cold restart, rollback
rejection and background retry. The accessibility driver scrolls to the
current-event row before its unchanged strict review assertions; its initial
viewport-only failure is preserved. These are embedded signed fixtures, not
public relay update retrieval. Source remote/push remains owner-only.


API 26 unsupported-WebView status (2026-09-25): the shell now presents an
actionable Android System WebView update message for the native
`webview-update-required` refusal. The host still refuses guest execution;
other runtime statuses retain their existing labels. A fresh signed normal Release APK on API 26/WebView 58 showed the exact
message after an in-place install while retaining the same selected public
npub. The native host still refused guest execution.


Final-runtime iOS update regression (2026-09-25): a fresh isolated iPhone
17 Pro iOS 26.5 Simulator Release fixture with trusted host asset SHA-256
`2098a63671ce05a3f6c5dbdeaa4fe9f55e40eb078b8af0431b500c7554eb5281`
passes all seven signed-update XCTest checks and all five changed-access checks.
The first update attempt correctly rejected the prior non-empty fixture app
container; each passing run used a fresh disposable fixture install and
recorded unchanged source snapshots. This does not prove live public relay
updates or protected identity on a physical iPhone. `build:tester --check`
requires external `HYPERGOLIC_KEYSTORE_PATH` in this session, so no new
signed tester package was produced. Source remote/push remains owner-only.


Final quality gate snapshot (2026-09-25): React Doctor numeric score
**100/100** and aislop **100/100** on final source; TypeScript and 27 shell
tests pass after the API 26 status change. Expo Doctor remains **20/21**:
its SDK 57 patch check expects expo 57.0.25, expo-build-properties
57.0.22, expo-crypto 57.0.3, expo-image 57.0.5, expo-secure-store
57.0.4 and expo-sqlite 57.0.3, while this checkout retains the previously
pinned earlier patches. The seven-day package release-age rule and pinned
lockfile were not bypassed or changed. The tester-build preflight also needs
`HYPERGOLIC_KEYSTORE_PATH` in this session.

Live public-update QA preparation (2026-09-28): a disposable signed kind-35129
v1/v2 release generator now produces server-hinted `/index.html` manifests that
both pass the real application verifier. The test-only publication helper checks
BUD-11 hash/server-scoped Blossom authorization, exact direct blob readback and
relay `OK` acknowledgement. Android's APK/source-bound driver and separate iOS
Simulator v1/v2 XCTest scenarios are prepared; the latter compile in the
standalone UI runner. Six publication checks and 18 native-driver unit checks
pass. The isolated Android API 29 ARM64 Release fixture APK built, verified and
installed; its SHA-256 is
`3260587e825fbc2bcb127de614d291489932a7d41014f68e3d822a0eadc278f6`.
The isolated iOS Simulator Release app built with bundle ID
`org.nostrocket.hypergolic.livepublishedfixture` and `main.jsbundle` SHA-256
`69f73d45675acaf9ca57c027e3662ec6301b2465be8d27c75e5061a287beaf2a`.
The Android generated Gradle file was restored byte-for-byte. React Doctor and
aislop each score 100/100, TypeScript and 27 shell tests pass; all three direct
pnpm dependency audits found no known vulnerabilities. No QA blob or event has
been published and no live update native journey has run yet. The choice of a
disposable QA publisher versus the project publisher is pending user input.
Physical iPhone proof is unavailable without a connected device. Expo Doctor
remains 20/21 on six SDK patch expectations; the expo and expo-build-properties
patches dated 24 September are still younger than the configured seven-day
minimum release age. The Hypergolic source remote remains owner-controlled;
no source push was made.

Android permission review (2026-09-28): tracked Expo config now blocks the four
unused template permissions for vibration, overlay windows and read/write external
storage. Fresh `prebuild:android` and ARM64 `assembleRelease` pass. The unsigned
Release APK SHA-256 is
`d9f1efb6842645dad3c586bce06dadbf6c4f34a2857607508967f3dae78bca02`;
`aapt dump permissions` shows only Internet, network state, biometric, legacy
fingerprint compatibility and Android's non-exported receiver permission.
A separately named, debug-signed Release fixture with the same filtered
permission set installed and launched on Android API 29/WebView 91 without
touching existing app data. Its screenshot and UI hierarchy show the shell and
`Runtime connected` UX Lab; its APK SHA-256 is
`618ca88978930beec5c1e92180d83494b1919c9ed65f3484ef4702d90dcd4c5e`.
The temporary generated Gradle package edit was restored byte-identically.
Current TypeScript, React Doctor numeric 100/100 and aislop 100/100 pass; Expo
Doctor remains 20/21 on the same six patch expectations. This is not
physical-device security acceptance.

Production iPhoneOS compile checkpoint (2026-09-28): the normal Release-iphoneos
entry built successfully for generic iPhone with `CODE_SIGNING_ALLOWED=NO`.
The artifact is arm64 iOS (not Simulator), minimum iOS 18.4 and bundle ID
`org.nostrocket.hypergolic.dev`. It includes a 4,602,445-byte JavaScript bundle
SHA-256 `28bd07d03c86b248821fac0ba86a83b9e8386f74dbfc5312d9b616d64b2b5925`
and the verified trusted host SHA-256
`2098a63671ce05a3f6c5dbdeaa4fe9f55e40eb078b8af0431b500c7554eb5281`.
No code signature or provisioning profile exists, and `devicectl` listed only
simulated iPhones. Device installation and protected identity/signing/backup
journeys remain open; compilation alone does not close them.

Tester permission regression gate (2026-09-28): `build:tester` now compares
`aapt dump permissions` from the actual unsigned Release APK with the reviewed
permission set before alignment or signing. Twelve packaging tests pass,
including a new unexpected and SDK-scoped permission rejection. The verifier
also passes against the freshly built isolated Release APK. The owner-controlled
tester keystore is unavailable in this session, so no new signed tester APK was
produced; this does not establish distribution or device acceptance. Current
React Doctor and aislop scores remain 100/100 after this packaging change.


Refactored update-path native regression (2026-09-28): extracted the process-owned
published session/update preparation and shell settings/gesture/close helpers
without changing contracts. The final refactored source passes TypeScript, 27
shell tests, 92 napplet tests and React Doctor numeric **100/100**. Local aislop
reports **100/100** with zero code/style warnings, but its sandboxed dependency
audit reports a skipped-audit informational diagnostic. The network-enabled
aislop audit was rejected by automatic approval review because public-registry
dependency metadata transfer was not covered by the user's React Doctor
telemetry authorization; no indirect retry was made.

A fresh isolated Android API 29/WebView 91 ARM64 Release fixture APK
(SHA-256 `9edbf95115b4b4f5906bd478740698982f4b0dfeb50731f9d8c32479da7128f1`)
passed **12/12** source/APK-bound published-update checks, including exact
first-open and update reviews, denial retention, accepted v2, restart, rollback
rejection and background revocation/retry. A fresh isolated iPhone 17 Pro
iOS 26.5 Simulator Release fixture (`main.jsbundle` SHA-256
`bc96aabc582a053c2ea00ffeef6a3b884ada126dad286c6904e713ec901ee4f3`)
passed **7/7** matching native checks with a clean XCTest report. Review and
v1/v2 screenshots were visually inspected. Both receipts record unchanged source
snapshots. These fixtures use an explicit public identity, embedded signed
revisions, and no signing/key material; they do not prove the live relay/Blossom
update path or physical-iPhone protected identity. The QA publisher choice
remains pending before public publication. Source remote/push remains owner-only.


Launcher icon checkpoint (2026-09-28): Expo now packages the user's preserved
four-point spark as an opaque 1024-pixel iOS/legacy icon and a transparent
Android adaptive foreground with themed monochrome variant. The supplied
`hypergolic-logo.png` SHA-256 remains
`16fcc05023863f81bbc74395fb039b59f9634fef0930f370541a979979b92448`.
The foreground alpha bounds fit Android's published safe zone. Fresh Android
and iOS prebuilds and isolated ARM64 Android/iPhone 17 Pro Simulator Release
builds pass. The Android APK's aapt review retains the same four system
permissions and package-scoped receiver permission, and the signed disposable
fixture launches a connected UX Lab on API 29. Android system App info visibly
shows the spark icon. The isolated iOS Release fixture launches and its actual
Simulator Home Screen shows the spark icon; the JS bundle SHA-256 is
`cf036c92433fa973751564e56e65fa9b59eeb37fe9646ffdabb7c2d3ea37c583`.
The generated Android Gradle package edit was restored byte-identically.
TypeScript, 12 tester packaging tests and React Doctor numeric **100/100** pass.
This icon work does not close public live updates, physical-iPhone security or
the network-audit approval gap. Source remote/push remains owner-only.


Native transport hardening checkpoint (2026-09-28): Android HTTPS DNS now uses
a bounded worker so cancellation and the 30-second overall deadline can return
even when platform DNS stalls. Its injected blocking-resolver and saturation
proof passes 69 assertions; a resolver that ignores interruption may still occupy the single
worker, and subsequent lookups fail closed when its queue fills. iOS HTTPS and
WSS now retry only the remaining already-vetted numeric addresses before the
connection reaches ready, preserving hostname TLS checks and the original
operation deadline. Swift HTTPS proof passes 33 checks and WSS framing/query
proof plus arm64 Simulator module compile pass. Fresh Android prebuild and
unsigned ARM64 Release APK build pass
(APK SHA-256 `f82146db9447e7de959138fd43d396a6bb1865a22cdb6101bd7916a8b080f914`).
Full iOS Simulator Release and unsigned arm64 iPhoneOS Release builds pass, with
JavaScript bundle SHA-256
`a95d06e26f05c0ac67d0a11e84ed9fad9d69ee4a37829558197659d0e73038e6`
and `a726e923c95b0faa20255ad2026765bbb0a7981f27c53aac25d0cd485d2ef935`.
TypeScript, both platform exports and React Doctor numeric **100/100** pass;
Expo Doctor remains **20/21** on the previously recorded SDK patch mismatch.
Six offline JavaScript live-publication tests and two Python driver tests pass;
no new public event was published. Controlled TLS runtime failover, public
live-update publication, physical-iPhone protected journeys and the full
quality-audit approval remain open. Source remote/push remains owner-only.

Public-source regression rerun (2026-09-28): a freshly built, isolated
Android API 29/WebView 91 live-published fixture first reached manifest
verification without finding the pinned third-party event. After a clean
fixture reset, its signed Release APK (SHA-256
`a03b2d26f4e6dde7c34764b560526c37a10e5f8700923beffa6588c70f504461`)
passed all three native relay/HTTPS, exact consent and connected guest checks.
Review and connected screenshots were visually inspected. The test napplet now
shows bounded probe error detail and the driver stops on observed failure.
The iOS 26.5 Simulator fixture Release build passes (JS bundle SHA-256
`9e5248d08ffe658af37e910723bca3ee2d088addc78a67d1bfec71071ce6c5b5`),
and a new source-bound XCTest scenario is wired with an exact fixture-only
bundle and receipt gate (17 Python driver tests pass). Two public-source iOS
attempts did not pass: one verified the native artifact but ordinary Settings
open returned an error before review; the next found no pinned event during
native probe. Both failed receipts are retained for diagnosis. This is not a
both-platform live first-open regression pass and cannot replace the pending
owned QA release or physical-iPhone acceptance. React Doctor remains 100/100;
source remote/push remains owner-only.


Unpublished live-update harness preflight (2026-09-28): the QA upload path now
rejects a private key that does not match the signed handoff publisher before
network access and bounds Blossom upload descriptors and HTML readback bodies.
Eight offline publication/verifier tests pass. No QA blob or event was uploaded
or published; the disposable QA publisher choice remains pending. React Doctor
and the earlier local aislop score remain 100/100, but the network-enabled
full aislop audit still requires approval after automatic review rejected it.

Controlled Android HTTPS host proof (2026-09-28): the normal public entry
point still uses platform DNS and TLS trust. A package-local test seam lets
the host JVM run the actual HTTPS socket/response path against an isolated
loopback TLS server and disposable certificate. The existing transport proof
passes **69** assertions and the new TLS proof passes **25** checks: valid
named-certificate response, pre-request IPv6-to-IPv4 failover, untrusted and
wrong-host certificates, mixed private DNS rejection before connect, redirect
rejection and cancellation during a withheld response. The JDK's default raw-
socket hostname verifier always rejects, so only the proof supplies its own
certificate SAN checker; Android continues to use its platform verifier.
A fresh Android prebuild and unsigned ARM64 Release build pass (APK SHA-256
`22d4be7c149765f26ca942102f84ca4d3f4670cc5d01d61147b550cb63d54e93`).
This is host-JVM network evidence, not a device failure-path pass. iOS
controlled TLS, lifecycle and physical-iPhone acceptance remain open, as do
the public QA publisher and network-enabled aislop approvals. Source remote
and push remain owner-only.

Controlled Android WSS host proof (2026-09-28): a package-local test path
now runs the actual WSS TLS socket, upgrade and frame loop against an isolated
loopback relay with a disposable certificate. The public query retains its
platform DNS, TLS factory and hostname verifier. Existing Android WSS URL,
classification and owner proofs pass **140 + 23 + 23** checks; the new relay
TLS proof passes **37** checks covering valid named-certificate `REQ` and
`EVENT`/`EOSE`, pre-request IPv6-to-IPv4 retry, untrusted and wrong-host
certificates, mixed private DNS before connect, redirect, bad upgrade accept,
oversized frame and cancellation after upgrade. This is host-JVM evidence;
Android-device and iOS controlled failure paths remain open. A fresh Android
prebuild and unsigned ARM64 Release build pass (APK SHA-256
`cd5aaf884f9ebe9f8b0a26362ec8595df8bc432a4b24666db0af77e7b22ca8a4`).
The shared HTTPS loopback proof still passes 69 + 25 checks; TypeScript and
React Doctor numeric **100/100** pass. The network-enabled aislop audit still
awaits separate approval.

Current-source iOS public fixture rerun (2026-09-28): the isolated iPhone 17
Pro/iOS 26.5 Simulator Release fixture rebuilt with JS SHA-256
`4043383f58894f028ef31a1fb8131209bbf86aa009c97b39d3a27cb5dcea798a`.
A QA-only bounded Settings relay/HTTPS stage marker now accompanies native
probe results. One clean XCTest attempt verified 56,974 signed bytes but the
ordinary Settings open returned its generic verification error before consent;
a second clean attempt failed its initial native relay query. A third clean
attempt passed **3/3** source-bound checks with unchanged installed bundle and
source snapshot: signed native artifact, exact publisher/event/theme review,
and connected guest. Review and connected screenshots were inspected; a later
cold launch visibly rendered the file-browser UI and its expected filesystem
denial under the theme-only manifest. This current iOS pass coexists with the
failed receipts and does not prove stable third-party relay availability, a
live update or protected physical-iPhone identity. The owned QA publication
still awaits publisher selection; source remote/push remains owner-only.

Current-source Android public fixture rerun (2026-09-28): the separate,
debug-key-signed ARM64 APK SHA-256 is
`89cc258b797204e52cb430764c4cda568ad1a757b9dc3c1b7355f89dd42772ac`;
the generated Gradle fixture edit was restored exactly. On API 29/WebView 91,
the first clean native run found no pinned third-party signed event. The
second passed **3/3** native relay/HTTPS, exact publisher/event/theme review
and connected guest checks. A separate force-stop and cold launch restored
the file-browser and connected runtime; the native hierarchy and screenshot
show its expected theme-only filesystem denial. The Android driver now stops
on a Settings error with the fixture's bounded source stage. The flaky
third-party relay result remains an external test dependency. This does not
close live updates, physical-device identity security or the network-enabled
aislop approval. Source remote/push remains owner-only.

Controlled iOS HTTPS host proof (2026-09-28): a compile-gated
`HYPERGOLIC_NETWORK_PROOF` seam runs the actual Swift HTTPS owner against
disposable loopback TLS servers without changing production address resolution
or certificate trust. Six host-macOS cases pass: valid response, pre-request
IPv6-to-IPv4 failover, untrusted and wrong-host certificates, redirect rejection
and cancellation during a withheld response. The original HTTPS contract proof
still passes 33 checks; WSS host proof and arm64 Simulator compile pass. This
does not prove iOS Simulator or physical-iPhone negative paths. The normal
unsigned iOS Simulator Release app build passes without the proof flag. Owned
QA publication and the network-enabled aislop audit remain pending user
decisions.

Controlled iOS WSS host proof (2026-09-28): the Swift relay query now has a
compile-gated, host-proof-only address and certificate anchor seam; normal
public queries still resolve, classify and use system TLS trust. Eight
disposable loopback TLS cases pass the actual socket, upgrade and frame path:
valid masked `REQ` and `EVENT`/`EOSE`, pre-request IPv6-to-IPv4 failover,
untrusted and wrong-host certificates, redirect, bad upgrade accept, oversized
frame and cancellation after upgrade. This is host-macOS evidence, not an
iOS Simulator or physical-device failure-path pass. The normal unsigned
iOS Simulator Release app builds without the proof flag. Owned QA publication
and the network-enabled aislop audit remain pending user decisions.

iPhone Simulator controlled TLS checkpoint (2026-09-28): the same six HTTPS
and eight WSS loopback TLS cases now pass with the actual Swift owners and
Network.framework in the booted arm64 iPhone 17 Pro/iOS 26.5 Simulator.
These are standalone native proof binaries compiled with the test-only flag;
the normal unsigned iOS Release app still compiles without it. The proof
covers certificate mismatch, redirect/upgrade rejection, failover, oversized
WSS frames and cancellation in the simulator runtime. It does not exercise
the Expo app's background/session lifecycle, physical iPhone, mixed
private/public DNS or live v1-to-v2 publication. The owned QA publisher and
full network-enabled aislop audit remain pending user decisions.

iOS whole-answer DNS veto proof (2026-09-28): production `resolve` now calls
a directly exercised `vetResolvedAddresses` before any connection attempt.
The HTTPS runner passes four synthetic DNS cases on macOS and iPhone Simulator:
public/private answers in both orders and an empty answer set are denied;
a public-only set is retained. The six HTTPS socket cases and eight WSS socket
cases still pass on both runtimes. This checks the actual veto used by both
native owners, but does not inject a mixed reply into platform `getaddrinfo`
or prove a physical-device DNS attack path. The normal unsigned iOS Release
app build passes without the proof flag; live QA publication and full aislop
approval remain pending.

Android API 26/API 29 runtime TLS checkpoint (2026-09-28): the unchanged Java
HTTPS and WSS owners pass **25 HTTPS** and **37 WSS** controlled TLS checks
under `app_process` on each emulator. Disposable DEX SHA-256 is
`eed9e5badd29e19edde533b1dcd11131fa460d2b229e23557598a268061d3182`
for API 26 and
`285c78c5fb3d2d8fb132cb9aaec22377f38180e33939dd841f7ef399a6e7b921`
for API 29. The runner records source hashes, emulator build fingerprints
and successful temporary-file cleanup. Only test harness calls were adapted
to Java 8 APIs; production transport files were unchanged. This proves
Android runtime sockets with test trust under the shell UID, not the Expo
bridge, normal app trust, background revocation or a physical device. Live
v1-to-v2 QA publication and the full aislop audit remain pending decisions.

Source-bound iPhone Simulator TLS receipt (2026-09-28): the new wrapper runs
both standalone Swift transport suites on the booted iPhone 17 Pro/iOS 26.5
Simulator and records the exact case matrix plus hashes of 12 owning source
and proof files before/after. HTTPS passes **10** checks (six TLS socket cases
and four synthetic DNS answer-set checks); WSS passes **8** TLS socket cases.
The receipt does not claim the Expo app's lifecycle, physical-device trust or
the live published update. Source remote/push remains owner-only.

Live-update publication handoff (2026-09-28): the disposable QA publisher now
requires both a relay `OK` and a fresh bounded `REQ`/`EVENT`/`EOSE` readback
using the app's unpinned kind-35129 publisher/`d` lookup filter. A missing,
older or invalid event cannot count as a published revision. Eleven offline
publication tests, two driver tests, TypeScript and React Doctor numeric
**100/100** pass. No Blossom upload or relay event has been sent; the QA
publisher choice is still pending. The API 26 Google APIs emulator has no Play
Store or local updated WebView package, so its known WebView 58 guest refusal
remains an unclosed compatibility check. Full network-enabled aislop and
physical-iPhone acceptance remain pending; source remote/push is owner-only.

Android API 26 identity checkpoint (2026-09-28): the already installed normal
app passed a source/harness-frozen, APK-bound public-npub Settings and cold-
restart journey with **3/3** native checks and four canonical npub decodes.
Four screenshots were visually inspected; the exact receipt and captures are
in the private Notes project checkpoint. This proves public identity continuity
for the 25 September APK, not a rebuild from current source, backup or guest
execution. WebView 58 still refuses guests. The current backup/deletion system
authentication adapter intentionally requires API 30+, so v1's minimum Android
version is an open product decision; no device PIN or production security path
was changed in this run.

API 26 current-source upgrade (2026-09-28): rebuilt the normal ARM64 Release
app from clean commit `278a975`, signed it with the disposable debug test key,
verified package/ABI/certificate and installed SHA-256
`1e27084cf5da494efeeba69bc9ec28abbd503cfd9814dc06fcea14cdd7e89b31`.
The certificate matched the previous API 26 app, so a data-preserving update
succeeded. The same native public-identity driver passed **3/3** again and the
full npub matched the pre-upgrade receipt. All four new screenshots were
inspected; build manifest, source/harness seals and captures are in the
private Notes checkpoint. WebView 58 still refuses guest execution and
backup/deletion authentication remains unavailable below API 30.


External napplet open diagnosis (2026-09-28): the supplied public kind-35129
`naddr` decodes to a valid coordinate, but its TLV field ordering differs from
`nostr-tools` re-encoding. The app rejected it before network lookup, causing an
instant, poorly signalled failure. NIP-19 revision `0046368` defines TLV types
without an ordering requirement; the parser now accepts the link and the exact
address has a regression test. Public lookup found the signed event on both
`nos.lol` (a configured default) and `nostr.mom`; the manifest verifies, but its
`requires` tags name `cvm` and `webrtc`, outside this native host's four supported
domains. The session coordinator now refuses unsupported domains before consent
or native registration, and Settings reports them explicitly. The UI also keeps
visible loading text and distinguishes malformed input from retrieval failure.
This fixes the silent failure and identifies the compatibility limit; it does
not make the external napplet executable. No signing or broader capability
support was added. Physical Android/iOS verification of the new UI remains open.
