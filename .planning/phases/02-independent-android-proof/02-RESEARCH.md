# Phase 02 research synthesis

Checked 15 September 2026. Research candidates require native verification; no implementation success is claimed. Selected source contracts are recorded below so executors can reproduce decisions.

## R-01: Bundled native host and real Kehto line

Use an isolated `runtime/` web build with @kehto/shell 0.20.0, @kehto/runtime 0.22.0, @kehto/services 0.20.0, @napplet/core and @napplet/nap 0.31.1, nostr-tools 2.24.0 and a committed separate lock. RocketShell reference 0b46d9cf8369576f11d87b92aa5436920fdfcd87; Kehto release source f031d5d2264d047cd40e2524bf12b7f68c74caa6. Do not mix newer shell0.21/runtime0.24/NAP0.32 line or import Kehto into Hermes. UX artifact SDK0.27.2/core0.31.1/NAP0.31.2 compatibility must be proven, not inferred. Preserve immutable artifact bytes/hash separately from injected transport HTML.

## R-02: Selected initial wire contract

NIP-5D 24711d9c47bbdd07908bf1d52bf677d9cbc530f0 and NIP-5A a2494f4f81d46684e5814a9bf35e2b1df978f955. Pin NAP-SHELL and NAP-THEME merged5ac0490461ca6fec2f0d2e45b4835cf9bc08de24, compatible with earlier fixture theme acac69d90811d1891db5faa33d64716be97d0a76. `shell.ready` is bare; real Kehto replies once `shell.init` with domains/services theme. Shell namespace mandatory; no shell.supports wire operation. Theme get ID <=128, theme.get.result same ID, optional theme.changed. Match event.source to bound iframe Window before bridge handling; registry origin null is insufficient. No fake fixture handshake or dirty-state field. Before additional capabilities pin owning identity/storage/outbox/relay documents and record request/response/errors/revocation semantics in docs/native-contract.md; source examples are not authority.

## R-03: Native confinement

Android local Expo module, androidx.webkit:webkit:1.17.0. One restricted WebView per session, trusted WebViewAssetLoader host at https://appassets.androidplatform.net/assets/runtime/index.html and one opaque srcdoc iframe with allow-scripts only. Unknown resources return blocked responses, privileged host document main-frame only. addWebMessageListener exact trusted origin + isMainFrame + generation/token/type/size checks, feature-check fail closed. No generic native bridge/fallback, remote navigation, popup, file/content, downloads, permission grants, cookies or DOM storage. CSP denies connect/worker/child/frame/form/default; local data/blob images as needed; inline artifact scripts/styles only. shouldInterceptRequest alone cannot block all WebSockets. Listener/nav/renderer teardown revokes outstanding work. Native session binds user epoch, publisher, stable app, version and generation; Kehto dTag/hash alone cannot key saved data.

## R-04: Native crypto and key storage

Exact Expo-compatible baseline: secure-store57.0.3, crypto57.0.2, local-authentication57.0.2, sqlite57.0.2, screen-capture57.0.2, clipboard57.0.1 (npub copy only). Nostr/Applesauce native tree: applesauce-core6.2.0, applesauce-relay6.2.1, nostr-tools2.19.4, rxjs7.8.2. Keep web-host/native dependency trees isolated. Bootstrap only missing native crypto.getRandomValues with Expo SecureRandom-backed getRandomValues; never use getRandomBytes development fallback. Verify Hermes encoders/Unicode/URL. SecureStore envelopes bind pubkey/schema/secret; Android AES256GCM/Keystore, iOS device-only Keychain; not nonextractable Schnorr hardware keys. Secret lifetime only in trusted service; minimize copies, best-effort byte clearing, no claim JS string zeroization.

## R-05: Failure-safe inventory and state

SQLite nonsecret durable receipt, identities, operation journal, workspace and scoped napplet_kv; secrets exclusively SecureStore. Initialization staging/readback before first selected identity is displayed. Protected receipt detects surviving key inventory; corrupt/missing/read-failed established identity is a recovery error. SecureStore may return null after crypto failure and may ignore commit boolean; verify every write and deletion by readback. Recover interrupted import/delete without dropping or recreating identities. Switching lock validates destination/persists first, then increments epoch, cancels all privileged work and replaces every session; failed persistence/cancel retains old sessions. The original no-version physical namespace proposal is superseded by selected NAP-STORAGE PR3 f71e84ebca7474db260346cbfc2d88f41b4e421e: identity+publisher+stable-app owner with isolated aggregate/version+scope+instance keys. Accepted verified same-owner updates atomically copy saved data into a new empty version namespace while retaining the old version; prepared statements, quota and rollback checks. See docs/capability-contract.md.

## R-06: Authenticated export/deletion

LocalAuthentication strong biometrics or device credential, no hardware-only check that excludes PIN-only devices. One-use auth grants tied to operation/identity/epoch/settings ownership; stale callback has no effect. Explanation then protected native reveal with capture prevention, background/dismiss clearing; do not auto-copy/share secret or claim Expo clipboard prevents cross-device sync. Clear secret text from logs/accessibility/app switcher. Another usable identity before deletion; delete inactive selected replacement only. Configure/inspect backup and device-transfer exclusions. Native PIN-only/no-lock/strong biometric/cancel/late/background tests and physical phone validation are required.

## R-07: Approval and publication authority

Trusted service owns immutable deep-cloned event snapshot/canonical hash, timestamp finalized before review, type/tag/byte limits, selected identity and session generation. Bounds selected for implementation: 4 requests/session,16 global,10 minutes; lifecycle errors mapped to owning protocol. Review one/focus eligible, dismissal rejects current+pauses; resume explicit. Before/after key await and before publishing recheck epoch/generation/focus/expiry/ownership. Sign mutable copy because finalizeEvent mutates; reparse/re-hash/reverify fresh output, avoid cached verifiedSymbol. Destinations frozen for sign-and-publish. Success only relay acceptance, per-relay accepted/rejected/unknown/cancelled-before-send; timeout after send is unknown. No silent re-sign or retry after restart. Applesauce publication Promise lacks AbortSignal; use revocable event observable/unsubscription and prove no late emission. NIP-42 auth signs kind22242 and also requires approval or clear auth-required denial; bind relay/challenge/socket epoch.

## R-08: Protocol delivery and consent

Selected named napplet kind35129, distinct from nsite35128. Exact supported NIP-19 coordinates/event references must be chosen and documented before loader coding. Native trusted resolver verifies manifest event signature, publisher/coordinate, aggregate and all required blob hashes before executing; parser/CSP insertion needs adversarial tests. Keep selected version pinned, explicit verified update and access expansion consent; fail without unrelated fallback. Same built artifacts serve embedded and published tests; unsigned bundled fixture is never shown as author-verified. First-open trust separate from cryptographic verification and every-update approval. Relay configuration follows existing exact arrays, first-seed only. Auto NIP-65 remains deferred.

## R-09: Driver and evidence

ADB37.0.1, build-tools36.0.0, Hypergolic_API_36 ARM64 AVD and .tools/device.py exist; latest device list empty and no emulator/Metro running. Start/reuse one runtime with retained process handle. Existing ADB screenshot/hierarchy/observed-input controls are first trace driver. Add native UI Automator2.4.0 stable instrumentation for release black-box tests and native boundary tests; official generic docs stale alpha example must not set pin. Keep standalone Chromium/WebKit fixture evidence separate. Save scenario/app/fixture hashes, public identity, device/OS/WebView version, screenshots and independent event/relay observations. No privileged fixture test API.

## R-10: Completion and preserved limits

Full native product and security requirements are unimplemented. Current scaffold APK and 24 standalone UX browser tests only support baseline. Keep Expo57.0.20: aggregate Expo Doctor has existing expected~57.0.22 mismatch; run remaining quality gates separately and document, never downgrade gates. Rebuild/export/prebuild/native Gradle/signature/permission/no-Metro/device proof on final state. Production app ID/owner key is separate from test-signed independent APK. Project fixture publisher setup remains a real prerequisite to final real publication, not embedding. Source remote and source push remain owner-only.

## Primary sources

- https://github.com/kehto/web/tree/f031d5d2264d047cd40e2524bf12b7f68c74caa6
- https://github.com/nostrocket/rocketshell/tree/0b46d9cf8369576f11d87b92aa5436920fdfcd87
- https://github.com/dskvr/nips/blob/24711d9c47bbdd07908bf1d52bf677d9cbc530f0/5D.md
- https://github.com/nostr-protocol/nips/blob/a2494f4f81d46684e5814a9bf35e2b1df978f955/5A.md
- https://github.com/napplet/naps/tree/5ac0490461ca6fec2f0d2e45b4835cf9bc08de24
- https://developer.android.com/reference/androidx/webkit/WebViewCompat
- https://developer.android.com/jetpack/androidx/releases/webkit
- https://developer.android.com/jetpack/androidx/releases/test-uiautomator
- https://developer.android.com/training/testing/other-components/ui-automator
- https://docs.expo.dev/modules/native-view-tutorial/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/versions/latest/sdk/local-authentication/
- https://applesauce.build/typedoc/classes/applesauce-relay.RelayPool.html

Research archive refs: SecureStore b76ecf192c5325793bcea31dd9bb8efd91f9ad7f; Crypto52fc013ec8c75e89ba8f83c167e4b6b0416e6bf7; LocalAuthenticationa4789f1e53353f4929b0baddcfe5a7c622b99c71; ApplesauceCoree5a93dc9e8d621137590845e139926638e954312; ApplesauceRelayfaf30d2b5fd785acaf5b72c3095867348528583f; NostrTools6ebe59f1239176598140ceae6b3277edca77ecc4. Library archive review is implementation evidence, not device proof.


## R-09: Android and iOS parity correction

D-18 requires real native hosts, local standalone builds and complete platform-specific
journeys on Android and iOS in v1.02-07 owns the first WKWebView path;02-02 through
02-05 explicitly exercise both drivers;02-06 owns physical iPhone signing, Keychain/
auth/gesture proof and no-Metro Release evidence alongside Android. iOS18.4 is the
selected initial minimum because its public WKUIDelegate file-picker denial callback
is unavailable on older iOS. Verify the actual iOS26.5 Simulator first, then the
owner's supported phone. Public app-store publication is separate.

## R-10: Maximum source quality

D-19 requires React Doctor100/100 and aislop100/100 on final current source, complete
scans and no new suppressions. The React Doctor no-telemetry flag also disables its
score API; a clean no-score report is useful but is not a measured100. Final proof
must request and retain an actual score, with no missing-score-to-success fallback.
Expo Doctor's existing patch recommendation remains a separately disclosed exception.
