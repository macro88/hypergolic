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
owner captures selected identity, epoch and vault revision and checks exact live
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
The broker additionally requires selected identity/epoch/revision and workspace
membership checks from its owning shell. The integrated owner also rejects a
failed workspace binding and an altered saved descriptor.
Every database operation rechecks authority around awaits and before commit. A
revoked pre-commit write rolls back. Revocation after commit cannot recall the write,
but cannot produce a stale success response. Each request binding is then released.

## Supported broker operations

The pinned [owning capability contract](capability-contract.md) governs exact fields.
All nine identity reads return the selected public key or specified empty defaults;
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
