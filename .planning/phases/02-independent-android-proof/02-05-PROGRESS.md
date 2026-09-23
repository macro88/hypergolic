# Plan 02-05 progress — published loading and relays

## Implemented boundary

The trusted shell now has a pure gate for canonical named-napplet `naddr`
coordinates, fresh kind-35129 NIP-01 event and publisher/`d` checks, NIP-5A
`/index.html` hashes, immutable verified bytes, exact signed event pinning,
revocation and no fallback after a chosen version's blob fails. The pinned
protocol revisions and local size/profile limits are in
[`docs/native-contract.md`](../../../docs/native-contract.md). A transport
adapter queries only configured lookup relays and retrieves content-addressed
Blossom paths from signed HTTPS hints. App-only native HTTPS bridge methods and a
trusted JavaScript adapter now exist with public-IP pinning. Normal Settings
entry now calls these ports through the process-owned session coordinator.

The trusted Network and Lookup relay lists seed the selected RocketShell defaults
once, persist edits in a dedicated SQLite database and expose add/remove/restore
controls in Settings. Approved publications use the current Network list at
request admission. A relay storage startup failure leaves identity entry usable,
shows an unavailable state and denies new signing requests before key use.

## Verified so far

- Focused napplet, relay and runtime-owner suite: 40 passing tests.
- Pinned TypeScript checks pass.
- Android and iOS JavaScript exports pass; they do not prove native behavior.
- React Doctor numeric score 100/100 and aislop 100/100 with zero diagnostics
  at the last integrated run. Recheck after any further edits.

## Remaining for 02-05 and v1

The Settings entry, first-open publisher/access consent, connected native
network retrieval route, trusted cache, pinned restart recovery and explicit
verified-update review are now implemented with focused integration tests. An
update revalidates the old pin, requires a newer signed event for the same
publisher and app ID, then shows the exact event change and any changed access
before a new one-use native session replaces the old card. Declining review
keeps the old session. The Settings-only local signed QA route remains a separate
known-artifact proof. A live remote endpoint and ordinary Android/iOS native
journeys, including the update, have not yet been verified.
The native handoff must transfer at most 2 MiB
without putting HTML, paths or URLs in React view props, then check the original
bytes again before host CSP and namespace injection. Android and iOS remote
published journeys and update/recovery drivers remain open. Do not mark LOAD-01 through
LOAD-03 or RELAY-02 complete from these unit tests or bundle exports.

The Android/iOS native registry cores check byte/hash/session claims and one-use
replay. Both Expo modules now expose an app-only, bounded chunked staging bridge
with no claim method; see `docs/published-artifact-registry.md`. The Android
registry/transfer proof passes 175 assertions and its generated native module
compiles in Release. The iOS transfer/registry proofs pass 88/36 checks and the
normal unsigned Simulator Release app compiles after Pods refresh. The trusted
shell has a verifier-branded staging adapter and both hosts claim one-use
handles. A Settings-only Android QA route and direct public-only iOS Simulator
fixture both pass signed-review, native host, visible guest-marker and close
checks against the same embedded signed artifact. The Android driver binds the
installed APK hash and source; iOS XCTest binds the isolated bundle and source.
These prove the native delivery path, not remote loading or production iOS
identity. A published workspace
descriptor now stores the exact signed event pin. Schema v2 migration preserves
older receipts with an unknown pin, so they cannot replay as accepted updates.
Remote native journeys and full LOAD acceptance remain open.

## Native network and grant-storage checkpoint — 23 September 2026

Both platforms now reject mixed or non-public DNS answers before an HTTPS
connection, bind the selected numeric address to the original TLS hostname,
refuse redirects and bound responses to 2 MiB. Expo exposes app-only HTTPS
fetch/cancel/revoke operations; the trusted JavaScript adapter checks canonical
Base64 before offering the bytes to the published-source contract. These pieces
are not yet wired to the ordinary `naddr` open path or live-tested against a
remote server. Bounded RFC 6455 frame parsers also exist on both platforms, but
there is no native relay socket owner or published relay query adapter yet.

The SQLite schema is v3. It stores revisioned, exact capability grants under
user/publisher/napplet identity and migrates v1/v2 data. First-open review and
the authorization gate remain open. The isolated native proofs pass 71 shared
address vectors on each platform, 59 Android HTTPS transport assertions, 28
Android bridge assertions, 31 iOS HTTPS response/request assertions and 25 shared
WebSocket frame vectors on each platform. The 89-test storage and 37-test
napplet suites pass. Normal Android ARM64 and iOS Simulator Release builds pass
with the new Expo modules and parsers; neither build is a live HTTPS or WSS
journey. React Doctor scores 100/100 and aislop scores 100/100. The native
bridge still requires on-device network, cancellation and background evidence.

## Ordinary workspace integration checkpoint — 23 September 2026

The app-owned coordinator selects a signed kind-35129 event from configured
Lookup relays, checks its exact HTML bytes, shows first-open publisher/app/domain
review, caches the verified artifact in a separate bounded SQLite BLOB database,
stages only verifier-branded bytes into a one-use native session and persists
the exact event pin in the normal workspace. A cold reopen can use the cache;
every hit is reverified before staging. Source-aware startup admits only strict
published descriptor shape and reopens its pinned event. Closing, identity
epoch change and native failure revoke the session. Android and iOS host parsers
compare session/publisher/app/version claims before claiming the staged artifact,
then bind precisely the granted domains to the capability transport. The guest
runtime validates these domains from native artifact chunks rather than applying
the former theme-only default. A published relay request reaches the signing
queue only while its verified runtime binding, workspace claims and native
generation remain exact; signing still requires the v1 review sheet.

Focused napplet/runtime/storage tests pass, including first open, denied review,
cache restart and normal runtime close. The Android published binding parser
passes 13 assertions; the source-linked iOS Swift host proof compiles with
warnings as errors and passes its 285 checks. The browser runtime suite passed
94 Chromium/WebKit tests after the domain change. TypeScript passes, and React
Doctor and aislop both score 100/100. The first sandboxed scoring request could
not reach the API; the authorized follow-up scoring request succeeded.
The iOS WK boundary source hashes were explicitly reviewed and rebaselined;
asset preparation passes, while a fresh boundary Xcode execution remains open.
Final Android ARM64 and iOS Simulator Release builds pass. The installed Android
app visibly shows Open a napplet, its naddr field and Verify and open in trusted
Settings. The production iOS app launches to its expected physical-iPhone
identity requirement, so Simulator does not prove its Settings path.
The normal Android/iOS remote UX, live public TLS/WSS behavior, native update
journey, physical iPhone and older Android acceptance are not proved by these checks.

## Explicit update checkpoint — 23 September 2026

The update check is available in Settings for each loaded published napplet. A
coordinator rechecks its exact existing artifact from the verified cache or
pinned network query, discovers and verifies a newer candidate, and requires a
separate confirmation before staging it. A changed grant needs its own access
review. The workspace swaps in the same position only after preparation succeeds;
the old native session and pending signing approvals are then closed. Focused
tests cover refusal, cancellation or identity expiry during update review,
unchanged event, rollback rejection, changed-access denial without staging,
and accepted runtime handoff. TypeScript passes. Complete native update
journeys remain open.

The Android ARM64 Release APK at the update-flow checkpoint was signed with the repository's disposable
debug key and installed over the existing API 36 emulator app without clearing
data. Its normal shell and trusted Settings rendered. Entering `naddr1invalid`
and pressing **Verify and open** showed the trusted verification error, with no
guest opened. The normal iOS Simulator Release app at that checkpoint was installed and
launched on iPhone 17 Pro; it reached the expected physical-iPhone requirement
for protected identity storage. This checks production entry behavior on both
builds, but cannot exercise the update with a real published session. The Android
test used only its documented public test PIN. The installed debug-signed APK
has SHA-256 `fe55acc33c85ee4daceb453c63dacebd595eb0b4c76ee98c1da6f4e808f395da`;
the iOS app's bundled JavaScript has SHA-256
`895d15d94118b8919f28e36afbb95228f078c8f1983063eb80623ff86c4218a6`.

The first-open form now also blocks a second tap immediately, before React
renders its busy state. After that change, all 84 napplet tests, TypeScript,
React Doctor 100/100, aislop 100/100, and fresh normal Android ARM64 and iOS
Simulator Release builds pass. The rebuilt Android app was installed over the
same emulator and its shell avatar and trusted naddr form rendered; the
debug-signed APK hash is
`4d4882b4e439a761806566d24acbd7a24f3d289cebef91ebf79da7eef0384977`.
The rebuilt iOS app was installed and again showed its physical-device identity
requirement; its installed JavaScript hash matches the build at
`5926e2136073df42b90c7ca35234b4404c5b48a9ba060a88d3e0d08a71fa0142`.
The invalid-naddr denial was observed on the preceding build, not repeated on
this final artifact. No successful remote open or update was observed.
Standalone dependency audits for the app, runtime and quality-tool lockfiles
all completed with no known vulnerabilities. Aislop's embedded audit timeout
does not change its 100/100 score.

## Next automated native update fixture

The current Settings **Signed test napplet** stages one embedded artifact
directly in `PublishedHostLab`; it does not traverse the production coordinator,
grant store or workspace update action. An update test must use those owners.
Prepare two immutable, independently verified kind-35129 artifacts signed by
one disposable test publisher for the same `d` identifier. Keep the test secret
out of the app and ship only signed public fixtures. Feed them through a
test-only published source while keeping the normal Settings update review and
one-use native handoff. Android and the isolated public-identity iOS QA entry
should assert initial guest readiness, refusal keeping the old guest, acceptance
replacing it, changed-access refusal, exact pinned restart, downgrade rejection
and background revocation. Bind screenshots and driver results to source and
installed-artifact hashes. This fixture will test native update UX and
lifecycle; it cannot establish public WSS/HTTPS behavior or production iOS
identity security. A known working public `naddr` and endpoints are still
needed for the separate live transport journey.
