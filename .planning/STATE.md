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
**Current focus:** Individual signing is connected; Android local-relay publication and both-platform review/lifecycle checks pass. Embedded signed public-only native update journeys pass on Android API 36 and iOS Simulator, including changed-access approval. A separate public-only live relay/Blossom first-open journey now passes on both platforms. Next prove live published updates, protected production identity, older Android compatibility and physical iPhone security. Android system PIN and fingerprint deletion pass on the isolated API 36 emulator; iOS review/denial/cancel UI passes on Simulator. Lazy restoration loads only the selected napplet, with repeated iOS cold-launch and both-platform saved-state proof.

## Current Position

Phase: 2 of 3 (Independent Android and iOS proof / seed phase 1)
Plan: 02-04 individual signing approval; remaining 02-03 device security and 02-07 acceptance
Status: Identity/workspace/import/switch and manual backup implemented; State Lab and lazy restoration work on both platforms. Signing is connected with Android protected-signing/local-wire proof and iOS public-fixture review proof. iOS protected signing, remote loading and complete physical security acceptance remain open
Previous integration: 2026-09-15 — Connected the reviewed State Lab catalogue, genuine Kehto/SDK, native transports and process-owned SQLite/identity authority. Both isolated native platforms pass all six storage/identity/restart/isolation checks in a single run each; each also passes three close/reopen checks. New openings use persisted native UUIDs, with regression coverage for display-number reuse. All 27 broker/owner, 71 storage/transition, 25 shell and 76 browser-runtime tests pass. The refreshed WK boundary suite passes all 17 methods; sealed inputs/products remain identical. Full aislop is 100/100 and local React Doctor has zero findings; numeric scoring awaits explicit approval. The observed handle/text overlap is fixed with a reserved 12-point guest margin; both rebuilt isolated apps pass the three-check close/reopen journey and their screenshots show unobscured text. Authenticated actions, signing, published loading and physical security remain open. See docs/native-capabilities.md. Progress metadata counts plans, not product completion.

Previous native action checkpoint: 2026-09-15 — Added the Android native deletion authority with 95 owning JVM assertions and the protected-record/erase reader with 89 actual Android assertions. Existing SDK records are unchanged; disposable data alone was erased. The actual Release app and separate instrumentation APK build and their installed bytes match. The production deletion path remains denied pending native context/lifecycle and system-prompt integration; authentication in the record probe is a double. See docs/identity-storage.md.

Previous system-auth checkpoint: 2026-09-15 — Connected Android native main-context ownership, lifecycle, system authentication and guarded erasure with shared Settings. All eight actual PIN/cancel/background/timeout/draft/restart checks pass on the isolated API 36 auth emulator. Native record probe remains 89/89 with existing records unchanged; native authority is 126/126. Shared security 291, bootstrap 13, storage 80, capability 27 and shell 25 tests pass. TypeScript, both exports, Android Release and actual iOS Debug Simulator compilation pass; iOS owning unit suite is 52/52. Aislop 100/100; local React Doctor zero findings/no numeric score. Remaining limits and source/artifact evidence are in docs/identity-storage.md. No source push or remote change.

Previous environment checkpoint: 2026-09-12 — local iOS development setup completed: native Simulator Debug build, input/navigation, Hermes/logging, reload, Fast Refresh and cold launch verified. Original scaffold and Android artifacts preserved. This environment checkpoint does not advance the product/security phase; see docs/development.md.

## Accumulated Context

### Decisions

See `docs/architecture.md` for confirmed requirements and unresolved policy.

### Blockers/Concerns

First theme-only native contract is selected. Validate privileged adapters and delivery contracts before their dependent work. Preserve Expo 57.0.20 despite the existing Doctor patch-version mismatch. Source remote/push remains owner-only.
Current budget (2026-09-25): the user authorized continuation until about 90% weekly usage consumed, then pause for approval. Check account usage after each small batch. Use smaller agents for bounded independent work while root owns integration and review.
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
