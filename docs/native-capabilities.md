# Native identity and storage admission checkpoint

The shared broker and both native request transports are implemented. The running
shell still uses the original UX Lab/theme configuration. Its React Native owner,
fixture catalogue and bundled Kehto runtime must be connected before State Lab can
use real saved data. No signer, relay access or published loader is enabled here.

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
membership checks from its owning shell. That owner integration is still pending.
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

## Verification on 15 September 2026

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

The physical-iPhone security gate, genuine SDK storage on both native platforms,
identity-switch/close behavior through the connected owner, and complete v1
acceptance remain open. Runtime assets are unchanged by this transport checkpoint.
