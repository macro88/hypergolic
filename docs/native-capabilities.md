# Native identity and storage admission checkpoint

The process-owned identity/workspace authority, shared broker and both native
transports now connect genuine Kehto/SDK identity and storage operations to native
SQLite. Settings can open State Lab, a peer app, and the same app under another
reserved unsigned publisher namespace. These are embedded test artifacts, not
remote verified releases. No signer, relay access or published loader is enabled.

## Runtime and shell integration

The reviewed fixture catalogue pins exact HTML and NIP-5A aggregate hashes. Build
and runtime checks verify those bytes before creating the sandboxed guest. Only
the fixture's reviewed domains are exposed. Real Kehto source-window, session,
ACL and firewall checks precede the host-only operation adapter. Its native client
bounds pending requests, correlates the original operation/ID, and rejects late,
foreign or malformed responses. No browser storage or signer fallback is enabled.

One React component lifetime owns one immutable view binding; ordinary workspace
snapshot cloning or focus changes must not reset request history. The process
owner captures selected identity and epoch, checks the accepted inventory revision,
and checks exact live
workspace membership before broker work. New State Lab openings use native UUID
instance IDs, persisted across restarts and replaced on a later opening after close.
The read-only public identity result must match the selected shell identity.

State Lab's output values are exposed as text to native accessibility. Its SDK
buttons exercise missing/empty distinctions and literal saved strings through the
same real request path that a compatible napplet will use. See the Android
`tests/native/state_storage.py` and iOS `state-storage` scenario for native journeys;
these use isolated installed fixtures and never reset the normal app's data.

## Ownership and request lifetime

A trusted native configuration captures session, selected public identity/epoch,
publisher, stable app, version, persisted instance, bundled fixture and domains.
Each native view adds its own fresh generation. Configuration is immutable and
limited to the bundled UX Lab or State Lab variants; it accepts no URL or HTML.
This configuration path is not proof of a remote publisher or artifact signature.

The native host checks its actual WebView, main frame, origin, exact document URL,
generation, readiness and transport schema before admitting a request. The
original serialized NAP message remains a string inside a native-held snapshot;
JSON serialization must not normalize its payload before shared validation. React
Native receives only a random one-use token, session ID and generation. Synchronous
module methods claim the snapshot and check native lease liveness. Delayed React
events cannot recreate or extend authority.

The ordinary identity/storage transport allows 64 active generations, four pending
requests per generation and eight globally. Each lease expires after 25 seconds.
Android uses [elapsedRealtime](https://developer.android.com/reference/android/os/SystemClock.html)
and iOS uses [ContinuousClock](https://developer.apple.com/documentation/swift/continuousclock);
both include device sleep. Cleanup timers do not grant authority. Final lease
consumption and generation checks occur on the native UI thread immediately before
the original reply callback. The larger, individually approved publication queue
in the capability contract is separate and remains unimplemented.

Transport and snapshot limits are two MiB of UTF-8, including nested JSON escaping.
The broker accepts the existing one-KiB keys, 256-KiB values and 512-KiB namespace
quota. Maximum control-character strings fit the transport bound and round trip
through real SQLite. Correlation history is bounded at 1,024 distinct operation/ID
pairs per broker; exhaustion requires a fresh native session, rather than forgetting
old IDs and admitting a replay. A valid next transport sequence is consumed even
when admission is overloaded. Gaps and previous sequences cannot acquire leases.

Close, navigation failure and teardown synchronously revoke the native generation.
The broker additionally requires selected identity/epoch, the accepted inventory revision, and workspace
membership checks from its owning shell. The integrated owner also rejects a
failed workspace binding and an altered saved descriptor.
Every database operation rechecks authority around awaits and before commit. A
revoked pre-commit write rolls back. Revocation after commit cannot recall the write,
but cannot produce a stale success response. Each request binding is then released.

## Supported broker operations

The pinned [owning capability contract](capability-contract.md) governs exact fields.
At the original admission checkpoint, all nine identity reads returned the selected public key or specified empty defaults;
they never access a signer or the database. Storage get/set/remove/keys route to the
native-bound composite namespace. Missing values remain null, empty strings remain
empty, failures use the canonical result/error shape, and write success follows
commit. Caller-supplied user, publisher, app, version or instance fields are denied.
Malformed requests, absent domains and foreign registrations cannot reach storage.

## Earlier transport verification on 15 September 2026

- `pnpm typecheck` and `pnpm test:capabilities` pass: 22 broker tests use actual
  on-disk SQLite, including owner separation, reopen, quota rollback, mutation,
  replay, expiry/revocation, post-commit uncertainty and maximum encoded strings.
- The standalone Java and Swift lease proofs each pass 100 assertions, including
  expiry, bounded admission, sequence handling, revocation and concurrent claims.
  These exercise the native-language registry on the build host, not a WebView.
- `pnpm prebuild:android` and the owning module's Gradle Debug Kotlin/Java compilation
  pass. Android native transport execution and the full React Native binding remain
  open; a successful compilation is not an emulator proof.
- The source-linked UIKit/WKWebView harness passes all 17 tests in one iPhone17 /
  iOS26.5 Simulator run. Four new tests cover native snapshot/reply ownership,
  one-use claims, guest/synthetic/wrong-frame/wrong-generation denial, close and
  frame-navigation revocation. The prior 13 isolation tests pass in the same run.
  Capability stimulus is privileged native injection; this is not yet a genuine
  SDK storage journey or an Expo-wrapper integration test. All 18 sealed input
  hashes and 12 built product hashes still match after execution.
- Full aislop: 100/100, all five active engines completed, zero findings across 102
  supported files; 29 files are unsupported, predominantly Swift. Full local React
  Doctor: zero diagnostics across 105 files after fixing two lookup warnings.
  Numeric scoring remains unapproved/unverified. No findings are suppressed.

This earlier transport receipt describes the preceding runtime assets. The later
State Lab integration requires its own native journey and refreshed boundary
receipts; compilation alone does not carry these passes forward. Physical-iPhone
security and complete v1 acceptance remain open.

## State Lab integration verification on 15 September 2026

- Android prebuild and both production JavaScript exports pass.
- Root TypeScript, 27 broker/owner tests, 71 storage/transition tests and 25 shell
  tests pass. Owner tests use the actual identity transition and SQLite, including
  a close during a pending write and fresh native IDs when display numbers repeat.
- The complete browser runtime suite passes all 76 cases across Chromium and
  WebKit. Twelve exercise the genuine State Lab SDK and Kehto adapter with an
  explicitly simulated native transport; they are not native device evidence.
  State Lab's independent suite passes 30 tests; each conformance run reports
  five passes and five explicitly skipped manifest/wire/lifecycle checks.
- Android's isolated standalone Release app passes all six native State Lab journey
  checks in one run: selected identity, all storage operations and empty/missing
  distinctions, cold restart, shared/instance separation, app/publisher separation,
  and cancelled/confirmed identity switches with return to the original data.
  Native ADB input and accessibility observations are used; no debug JavaScript
  evaluation or database mutation supplies the results. Installed APK bytes are
  checked before and after; 108 source files and bundled source contents were
  compared with the owning checkout before installation. Three separate native
  close/reopen checks also pass: exact warning, shared retention and a fresh private
  instance namespace.
- The isolated iOS Release fixture passes the corresponding six native XCTest
  checks in one run, plus three separate close/reopen checks. Real shared UI,
  identity transitions, Kehto, WK transport and Expo SQLite are compiled together.
  The fixture's vault stores public keys only, carries a visible fixture label,
  and excludes protected identity/signing modules. The observed SDK public key
  independently decodes from the selected native npub. Installed app bytes and
  source snapshots are stable across each run. This is not physical-iPhone key
  storage or authentication evidence.
- The refreshed source-linked WK suite passes all 17 tests in one run with the new
  runtime assets. All 18 sealed inputs and 12 products match after execution.
  Its four capability cases deliberately use a theme-only fixture and privileged
  native injection to isolate transport/source/revocation mechanics; a transported
  storage message is not a storage permission grant. Broker/domain enforcement and
  actual SDK/SQLite integration have the separate checks above.
- Full aislop is 100/100 with zero findings across 109 supported files; 29 files,
  predominantly Swift, are unsupported. Full local React Doctor reports zero
  diagnostics across 115 files; external numeric scoring still needs explicit
  authorisation. No source suppressions or lowered gates were introduced.

Private evidence is retained under
`.tools/evidence/state-integration-checkpoint-20260915`, with complete original
runs preserved separately, including test-driver failures. Native output labels,
clipped controls, inset handles and platform-specific select controls were checked
through real UI rather than inferred from browser tests. Android and iOS restart
screenshots were inspected. The handle overlap found during this review is fixed
by the layout checkpoint below. Physical security, authenticated actions, signing,
remote loading/updates and complete v1 acceptance remain open.


## Handle spacing verification on 15 September 2026

The guest viewport reserves 12 points on each side for the visible grips, keeping
them beside napplet text. Touch targets remain 44 by 88 points. Gesture thresholds,
ordering and accessibility actions are unchanged. Rebuilt and attested isolated
Android and iOS apps each pass the existing three-check close/reopen journey, using
real native input and the same persisted data. Screenshots from both platforms
show the Result text unobscured. This covers the observed overlap, not full physical
device gesture or accessibility acceptance. TypeScript and all 25 shell tests pass;
full aislop remains 100/100 and the local React Doctor scan has zero findings.
External numeric scoring is still awaiting explicit authorisation.


An explicitly validated inactive-identity deletion may advance the accepted
inventory revision without changing the selected identity, workspace controller
or epoch. Existing storage bindings can remain usable afterward. Any unaccepted
revision change still fails, and a later identity switch permanently revokes the
earlier bindings. The shared deletion transition tests cover both boundaries;
its user-facing native action flow is not yet enabled.


The selected Phase2.4 upload profile passes SDK/native photo/file, revoked
recipient, transfer/queue/recovery and normal signed-admission journeys on both
selected hosts; see [upload evidence](upload-access.md). Normal Settings review,
persisted grant/cache, actual system picker, exact provider bytes and original SDK
receipt are exercised. The signed fixture is locally supplied and signs uploads
with a public disposable identity under compile-gated local TLS. Physical iOS
protection/signing, ordinary workspace identity-switch parity and public-provider
acceptance remain Phase2.11 gates. CAP-05 is accepted for this declared profile under the owner-approved exception
for the still-visible patched tooling advisory.

## Public profile tracer — 2 October 2026

Phase2.5 Plan01 connects genuine State Lab `identity.getProfile()` to a captured
native identity, verified signed kind0 projection and a dedicated durable SQLite
source cache. Five-minute recent cache avoids a query; older validated data can
be returned after a bounded refresh failure, without a freshness wire extension.
No-cache transport failure is an error. Native denial can no longer become a
successful missing profile. Metadata URLs stay literal data.

Both isolated native Release products pass nine source/product-linked SDK checks,
including actual public WSS, cold cache, controlled offline/empty/failure cases,
view closure, trusted identity-epoch revocation with the view open and tampered
native disk signatures. Identity19, capability55, State Lab34 and runtime162 browser
regressions pass. [Plan01](../.planning/phases/02.5-public-identity-data/02.5-01-SUMMARY.md)
records exact products, scope and retained failures. Lists/permissions/badges,
normal signed admission and final quality remain open; this is not CAP-06 or
physical/protected identity acceptance.


## Public identity selected acceptance — 2 October 2026

All three Phase2.5 plans are complete for the [selected public profile](public-identity-data.md).
The final list/permission/badge matrix passes22 actual SDK/native checks on each
host, including queued revoke/regrant denial and background with an observed
pending query. Normal signed State/Feed loading passes14 on each host through
IdentityShell/Settings, first-open domain review, separate remembered list consent,
cold native SQLite cache, Settings revoke and confirmed public-only transitions.
Each signed journey independently compares nine original SDK values. The new user
separately approves domain access; no original user's permission or source is reused.

Android build04 and iOS build05 share all application/runtime/HTML bytes. Only the
iOS XCTest selector/scroll helper changed between their seals. The list matrix's
production bytes also match; later QA driver-only changes are recorded explicitly.
Historical profile evidence includes actual WSS; signed admission/list matrices
use labelled local signed artifacts and diagnostic relay frames/clocks/destinations.
Normal protected identity switching, physical devices and full published MVP parity
remain Phase2.11 gates. Both ordinary exports/Release builds and regressions pass.
Full numeric quality is ReactDoctor100/aislop99 with only the approved locked Forge
exception: the normal root audit stays red and the other eight audits are clean.
See [verification](../.planning/phases/02.5-public-identity-data/02.5-VERIFICATION.md).


## Ordinary physical iPhone storage checkpoint — 7 October 2026

Bundled State Lab now exercises genuine SDK storage through the existing protected
Release app: missing/empty values, get/set/keys/remove, shared/instance separation,
process persistence and app/publisher/user namespace isolation subsets pass in
one combined 12-check storage/import run. The original identity and saved values
are restored after a public test fixture import. The [physical checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md#ordinary-storage-and-protected-identity-import)
retains exact evidence and limits. Published updates, full cross-product,
close/reopen, quota/type faults, native protection and Android parity remain open.


## Physical WK fault checkpoint — 8 October 2026

The separate source-linked iPhone boundary app passes all20 methods in one run.
The three added cases exercise actual WebKit process termination, synchronous
claimed/queued lease revocation and recovery with a different process/generation;
four-per-generation and eight-global request bounds across three real WK views
with overload replay rejection; and UTF-8 envelope/snapshot byte limits. A
2,097,153-byte envelope is rejected before sequence consumption; a 2,097,140-byte
envelope whose captured-registration snapshot exceeds two MiB consumes its
sequence and creates no lease. Fresh sequences still receive their exact replies.

The [boundary test scope](../tests/native/ios-boundary/README.md) pins the WebKit
test-only fault control. No private API or policy implementation is added to the
production host;49 actual native core sources compile unchanged, while Expo
wrappers and unused fixture-release transport remain outside this probe. Both
installed Hypergolic apps, their local products and primary process remain
unchanged. Shared security/bootstrap tests pass353+13 cases. This supplements
SEC-01/03; it does not close protected signing, external network receiver, full
resource/subscription/session limits, owning Expo or published cleanup acceptance.
All61 full Phase2 requirements remain intact, with five complete across both phones.
