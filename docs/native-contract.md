# Native runtime contract

V1 requires both Android and iOS. Android and iOS native hosts, workspace interactions and scoped boundary checks
are implemented; final native security and device checks
are being added in 02-07.
The shared shell must not present an iOS placeholder as v1 support. Final React
Doctor and aislop targets are both 100/100.

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

## iOS native host

The same local Expo view now mounts a real WKWebView on iOS. The dedicated
`HypergolicNappletHostAssets.bundle` contains only the generated trusted HTML,
JavaScript and their asset manifest. Swift independently checks SHA-256 and byte
length before loading the exact file URL with a native UUID query. Read access
is limited to that bundle directory. The shared build copies byte-identical host
assets to both native packages.

The WKWebView uses a nonpersistent data store, a default-deny content rule list,
and exact exceptions for the bootstrap documents, packaged script and embedded
images. The common strict iframe sandbox/CSP and Kehto source-window checks remain
in effect. The named native message handler exists only in an isolated
WKContentWorld. A main-frame-only page adapter forwards diagnostic strings through
a browser-trusted, source-checked message listener in that world. Native receipt
checks the world, view, main frame, exact URL/file origin, native generation,
schema and 2 KiB UTF-8 limit. This diagnostic-only route grants no privileged
capabilities. File-origin WebCrypto availability is checked at runtime and fails
closed; the installed iPhone Simulator successfully reaches genuine Kehto Ready.

Navigation/action/response delegates deny replacement documents and popups;
public delegates deny dialogs, file choosing, media/motion permission and
credential challenges. The minimum deployment target is iOS 18.4 because the
public WK file-chooser denial callback starts there. The current execution target
is iPhone 17 / iOS 26.5 Simulator; the minimum OS and physical iPhone remain separate
acceptance targets. Swift 6 callbacks use the installed WebKit protocol's explicit
MainActor/Sendable closure annotations, so denial handlers actually conform.

Unmount, recycle, failure and renderer loss revoke the generation, unregister the
handler and remove the WKWebView. Content rules stay attached until release.
Unfocusing ends editing only inside that view, preserving its JavaScript state.
Independent native tests must establish these denials and lifecycle claims;
Android or desktop WebKit results cannot satisfy the iOS evidence gate.

The production `RestrictedNappletHost.swift` owns the WK policy; the Expo view is
its lifecycle wrapper. The independent harness compiles that same source directly.
Thirteen scenarios have observed passes across two preserved Simulator runs;
the first run had a recorder failure, corrected without weakening its assertion.
They exercise actual frame/world metadata, source and native-message rejection,
CSP denials, replacement navigation, and unmount revocation. CSP observations are
not packet-level zero-egress proof. A retained WK reference can still evaluate
JavaScript after unmount; the evidence establishes revoked authority and refused
reuse, not immediate renderer destruction. Real renderer termination, remaining
permission delegate paths, minimum-OS and physical-device proof remain open.
See [the portable probe](../tests/native/ios-boundary/README.md).

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

## Published napplet verification gate (in progress)

The selected v1 link profile accepts a canonical lowercase `naddr1…` or
`nostr:naddr1…` for named kind 35129. Kind 35128 is an nsite, not a napplet.
The coordinate binds the publisher public key and `d` identifier. Encoded relay
hints are validated but do not select the lookup relays; the trusted shell uses
its separate configured lookup list. Ordinary web URLs and `nevent` are not
napplet entry points in this profile.

The trusted loader checks a fresh NIP-01 event ID and Schnorr signature, exact
kind/publisher/`d` match, one `/index.html` SHA-256 `path` tag, and the original
UTF-8 artifact bytes before returning a candidate. It computes the NIP-5A
aggregate from the path hash. The `x` aggregate tag is optional under the pinned
NIP-5A/5D revisions; when present it must match. This profile accepts a single
self-contained HTML document up to 2 MiB and a signed manifest up to 64 KiB.
HTTPS Blossom server tags are retrieval hints only. An event ID pins a selected
version; an unavailable or mismatched pinned artifact must not fall back to a
different version. First-open publisher and access consent remains distinct
from cryptographic validity.

Schema v3 stores an exact first-open capability grant under user, verified
publisher and stable napplet ID. A trusted coordinator can ask for explicit
review and reject a stale identity or grant revision. A prepared production
staging wrapper rechecks its branded admission, but the review UI and normal
`naddr` entry do not call it yet.

The transport adapter can query selected lookup relays and fetch a signed
content-addressed Blossom path through an injected HTTPS port. That port must
enforce public-IP policy at connection time; ordinary React Native `fetch` does
not provide that guarantee. [Native HTTPS and address-policy cores](published-network.md)
now exist for both platforms, with an app-only Expo HTTPS bridge and trusted
JavaScript adapter; the adapter is not injected into app entry. Bounded native
relay queries and app-only Expo methods now exist on both platforms, with a
trusted request/response adapter; these are not yet used by ordinary entry. Both
native hosts now have a separate published-artifact route with a one-use claim
and trusted-document byte stream. Android Settings and an isolated iOS Simulator
entry exercise a fixed locally signed QA artifact; the ordinary workspace
cannot open remote published releases yet. Full LOAD-01 through LOAD-03 proof
remains open until the native HTTPS and relay ports are integrated and live-tested,
trusted cache, first-open consent, update flow, and Android
and iOS device journeys are complete.

### Required native handoff

After first-open consent, the trusted loader must register the original verified
HTML bytes with an app-only native registry. The Android and iOS registries must
independently check size, UTF-8, SHA-256, the NIP-5A aggregate and the exact
session/publisher/app/version claims. A host view may consume an opaque handle
once, bound to its native generation; React props must not carry the HTML, a
file path or an arbitrary URL. The trusted runtime must retrieve bounded bytes
for that generation, recheck the hash, inject the host CSP and namespace prelude,
then mount the isolated frame. Nostr signature and first-open consent checks stay
with the trusted shell; native byte checks do not replace either one.

Restart requires a fresh handle. Persist the coordinate, content version and
exact signed event ID in each published workspace descriptor. Reverify cached
bytes or fetch only that pinned event, and show recovery if
the bytes are unavailable or differ. The current workspace descriptor stores a
content version and exact event ID; older published descriptors without a valid
pin fail closed as corrupt saved state. Accepted version changes update the
descriptor's version and event pin together. Bounded staging, native host
claiming, generation-bound byte delivery, and browser HTML/CSP tests are now
implemented. A published artifact remains unreachable from the app until the
consent-gated ordinary workspace route is connected and tested natively on both
platforms.

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

The first Android checkpoint passed typecheck, prebuild/Gradle and Android export.
The runtime suite passes 26 browser tests after the cleanup adjustment. Shared UI
changes require fresh whole-repository quality reports; earlier checkpoint scans
cannot establish the final scores. The aggregate `check` still stops at the
existing Expo Doctor 57.0.20 versus ~57.0.22 mismatch; the pin is preserved and no
check suppression is added. CI was updated for the isolated runtime and inspected
locally; it has not run remotely because source publication remains owner-controlled.

## Remaining full-v1 work

See `.planning/REQUIREMENTS.md` and the seven phase-2 plans. Multiple loaded views and
gestures, real identity display and encrypted persistence, exact per-event consent,
verified published loading/updates, relay settings, complete fixtures and native
security/standalone Android and iOS evidence remain separate deliverables. No silent signing,
new dirty-state wire protocol or fixture approval bypass is introduced here.
