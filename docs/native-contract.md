# Native runtime contract

## Implemented first trace

The Android shell mounts a local Expo `HypergolicNappletHost` view. Each instance
owns one restricted WebView, a fresh native UUID generation, a bundled trusted
outer document and one opaque `sandbox="allow-scripts"` napplet iframe. The current
fixture is UX Lab, bundled and unsigned. No identity, signing, relay, saved-state
or published-installation capability is exposed by this trace.

`src/runtime/NappletHost.tsx` accepts a shell-owned descriptor ID and a diagnostic
callback. It accepts neither HTML nor arbitrary URLs. Kotlin creates a separate
UUID per view. It loads exactly
`https://appassets.androidplatform.net/assets/runtime/index.html?sessionId=GENERATION`.
The host may load only its packaged `host.js`; unknown resources receive a blocked
response. The native module never installs `addJavascriptInterface` or a wildcard
bridge. Unsupported WebMessageListener support fails closed.

The `HypergolicHost` WebMessageListener is restricted to the exact trusted HTTPS
origin. Its callback independently checks main-frame ownership, WebView identity,
current URL, generation, string type, 2 KiB UTF-8 bound and the diagnostic schema.
The only accepted messages are `{type: "ready", sessionId}` and
`{type: "error", sessionId, code}`. These confer no privileged authority. Native
failure and destruction revoke the generation and remove the WebView. A new view
is required to retry. No failed renderer or prior callback is reused.

The trusted host uses genuine Kehto `createShellBridge`, namespace injection and
`originRegistry` source-window registration. It admits bare `shell.ready` and
bounded `theme.get` only, with optional domains/services `["theme"]`. All other
native domains are explicitly disabled. A diagnostic Ready follows an actual
Kehto session registration. The fixture's Host colors text independently confirms
the theme response. Neither diagnostic proves complete product security.

## Artifact and browser boundary

The separately locked `runtime/` package checks the original UTF-8 fixture bytes,
SHA-256, aggregate hash and unsigned manifest at build time. The trusted document
rechecks the embedded content hash and aggregate before creating its iframe.
Namespace and CSP injection do not alter the original bytes used for verification.
Only the already-reviewed generated fixture document shape is admitted. General
published HTML parsing and signature verification belong to the later loader.

The outer CSP admits its local script and controlled inline iframe bootstrap. An
additional CSP precedes the child scripts and denies network, external scripts,
workers, nested frames, forms, base overrides, media and objects. The sandbox has
no same-origin, popup, download, form or top-navigation grant. Source-window,
trusted browser event, strict schema, readiness and operation-rate checks precede
Kehto dispatch. A later iframe document load destroys its host session.

Native settings deny DOM storage, file/content access, cookies, mixed content,
chooser/download/popups, geolocation/media permission and JavaScript dialogs.
Arbitrary navigation is denied. Kehto's browser defaults are not security policy:
its permissive ACL and best-effort browser persistence cannot authorize future
native effects or provide authoritative saved data.

## Selected versions and authorities

| Component | Exact selection |
| --- | --- |
| Expo / React Native | 57.0.20 / 0.86.3 |
| Safe-area layout | 5.7.0, from the installed Expo compatibility list |
| AndroidX WebKit | 1.17.0; runtime feature detection remains required |
| Kehto shell / runtime / services | 0.20.0 / 0.22.0 / 0.20.0 |
| Kehto ACL / firewall | 0.18.0 / 0.5.0 |
| Outer NAP core / NAP | 0.31.1 / 0.31.1 |
| Outer nostr-tools | 2.24.0; kept out of Hermes |
| Fixture SDK | 0.27.2, separately built artifact |

Released Kehto source:
[f031d5d](https://github.com/kehto/web/tree/f031d5d2264d047cd40e2524bf12b7f68c74caa6).
The coherent package set follows the inspected RocketShell release lock; it is
separate from the newer Kehto main snapshot previously listed as research context.

Wire authority is [NAP-SHELL and NAP-THEME at 5ac0490](https://github.com/napplet/naps/tree/5ac0490461ca6fec2f0d2e45b4835cf9bc08de24/naps).
SHELL is byte-identical to the fixture's earlier selected registry revision;
THEME changes formatting without changing the selected operations or trust model.
Delivery research remains pinned to [NIP-5A](https://github.com/nostr-protocol/nips/blob/a2494f4f81d46684e5814a9bf35e2b1df978f955/5A.md)
and the [NIP-5D draft](https://github.com/dskvr/nips/blob/24711d9c47bbdd07908bf1d52bf677d9cbc530f0/5D.md).
The named napplet draft uses kind 35129; nsite kind 35128 is not interchangeable.

## Reproduction and evidence

From the source root with its pinned tools enabled:

```sh
pnpm run runtime:install
pnpm run runtime:test
pnpm run prebuild:android
NODE_ENV=development CI=true ./android/gradlew -p android assembleDebug --no-daemon -PreactNativeArchitectures=arm64-v8a --console=plain
```

`runtime:build` checks the generated asset manifest before copying exactly two
assets into the local module. Gradle refuses a missing bundle. Generated files
stay out of source control; original fixture bytes, package locks, build code and
required third-party notices remain reproducible. See `runtime/README.md` for the
browser suite and notice handling.

The current Debug APK was built, installed and exercised on the API 36 ARM64
emulator with WebView 133. The native driver verified readiness/theme, ADB counter
and draft input, keyboard dismissal and the listed boundary denials. A targeted
renderer crash left the shell alive, removed the WebView and its executable target,
and showed the native renderer-stopped error. Independent network receiver,
self-navigation and trusted diagnostic fault-injection probes also passed at their
stated scope. Exact hashes and remaining probes are
recorded in `.planning/phases/02-independent-android-proof/02-01-PROGRESS.md`;
the completed first checkpoint is described in `02-01-SUMMARY.md`.

Typecheck, prebuild/Gradle and Android export pass. The runtime suite passes 26
browser tests; React Doctor is clean after the recorded secure-request-ID patch.
Aislop and configured audit gates pass. The aggregate `check` still stops at the
existing Expo Doctor 57.0.20 versus ~57.0.22 mismatch; the pin is preserved and no
check suppression is added. CI was updated for the isolated runtime and inspected
locally; it has not run remotely because source publication remains owner-controlled.

## Remaining full-v1 work

See `.planning/REQUIREMENTS.md` and the six phase-2 plans. Multiple loaded views and
gestures, real identity display and encrypted persistence, exact per-event consent,
verified published loading/updates, relay settings, complete fixtures and native
security/standalone APK evidence remain separate deliverables. No silent signing,
new dirty-state wire protocol or fixture approval bypass is introduced here.
