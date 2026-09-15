# Hypergolic web runtime

This isolated package builds the trusted Kehto outer document for the Android
Expo native view. It embeds the reviewed UX Lab bytes as an opaque `srcdoc` iframe.
It is the first runtime slice; it implements no identity, signing, saved state,
relay transport or published napplet installation.

## Build and check

Use the project-pinned Node24.20.0 and pnpm10.34.5:

```
pnpm install --frozen-lockfile
pnpm verify
pnpm audit --audit-level=high
```

`dist/index.html` and `dist/host.js` are the only native runtime assets. Copy them
to the local native module's assets/runtime directory before Android builds.
`assets-manifest.json` records their SHA256/byte lengths and the fixture provenance
for the native build verifier. It is a build-time sidecar, not a WebView resource.
No source map, remote script, CSS file, fixture fetch or native HTML prop is used.
The fixture originals and unsigned manifest remain under `fixtures/`; the build
refuses a changed HTML hash, aggregate or manifest declaration. Runtime SHA256
verification completes before iframe creation. Injection is outside the original
artifact bytes. These checks establish bundled-artifact integrity, not publisher
signature verification: the bundled fixture is unsigned.

## Native adapter contract

Load `https://appassets.androidplatform.net/assets/runtime/index.html?sessionId=GENERATION`
where GENERATION is a native-issued identifier matching `[A-Za-z0-9_-]{1,80}`.
The native module must expose `window.HypergolicHost.postMessage(string)` only to
the exact trusted main-frame origin. This package sends only:

```
{"type":"ready","sessionId":"GENERATION"}
{"type":"error","sessionId":"GENERATION","code":"runtime-bootstrap"}
```

Diagnostic serialization is bounded to2048 characters; native independently checks
UTF8 byte length, schema, exact generation, origin and main-frame ownership. Codes:
`invalid-session`, `bridge-unavailable`, `fixture-integrity`, `runtime-bootstrap`,
`runtime-timeout`, `frame-navigation`. No raw exception, event content, identity or
HTML is sent. Ready means the genuine Kehto `shell.ready` established its session;
it does not mean user content has finished rendering. The actual theme round trip
is independently checked by the fixture's Host colors observation.

The browser tests install a **top-document diagnostic sink only**. This is not an
Android bridge emulator or proof of native origin/frame isolation. In native,
never install a wildcard WebMessageListener or addJavascriptInterface fallback.
Keep DOM storage/cookies/file/content/network/navigation/popups/permissions denied.
Kehto's best-effort localStorage persistence tolerates disabled storage: both browser
engines are tested with top localStorage/sessionStorage getters throwing. The host
never enables those capabilities.

## Exact runtime contracts

- Kehto shell0.20.0, runtime0.22.0, services0.20.0, acl0.18.0, firewall0.5.0.
- Outer host core/NAP0.31.1 and nostr-tools2.24.0; fixture SDK0.27.2 separately built.
- Release source: https://github.com/kehto/web/tree/f031d5d2264d047cd40e2524bf12b7f68c74caa6
- NIP-5D draft: https://github.com/dskvr/nips/blob/24711d9c47bbdd07908bf1d52bf677d9cbc530f0/5D.md
- NIP-5A: https://github.com/nostr-protocol/nips/blob/a2494f4f81d46684e5814a9bf35e2b1df978f955/5A.md
- NAP-SHELL/THEME: https://github.com/napplet/naps/tree/5ac0490461ca6fec2f0d2e45b4835cf9bc08de24/naps

Mandatory shell is injected by Kehto before fixture scripts. Bare `shell.ready`
receives one `shell.init` with optional domains/services `["theme"]`. The parent
checks the exact bound Window, trusted browser event, envelope shape and operation
rate before calling Kehto. `theme.get` accepts only a nonempty ID of at most128
characters and returns the real reference service result. Duplicate readiness is
idempotent; unknown, malformed and ungranted messages are silently ignored. Shell
queries are local. No fake dirty-state protocol or direct signing namespace exists.

The outer CSP permits its one local host.js and the child's inline bootstrap;
the child's first head element has an additional stricter policy denying network,
workers, nested frames, forms, base overrides and external scripts. Opaque sandbox
is only `allow-scripts`. Hiding the view leaves the same Window and live fixture
state; close/pagehide/subsequent frame load tears down listener/registry/runtime.
Native must separately revoke its callback generation on renderer loss and close.

## Validation limits

Browser tests exercise genuine bootstrap/theme, pre-ready denial, duplicate and
forged readiness, malformed/privileged messages, sibling and synthetic source,
opaque DOM/storage separation, absent child bridge, attempted direct fetch/WS/
worker/image/script/top navigation, live state continuity/reload, native-adapter
absence, runtime hash mismatch and self-navigation teardown. They cannot prove
Android renderer/native-boundary isolation, OS gestures, native process death,
publisher trust, signing or encrypted persistence. Native attack fixtures and
current-device evidence are still required. Kehto's permissive default ACL and
browser persistence are not Hypergolic's eventual privilege or saved-state policy.

The build enumerates packages contributing code to the actual bundle. Their
metadata and exact versions are included in assets-manifest.json; license texts
are preserved in THIRD_PARTY_NOTICES.txt and appended to host.js so native delivery
retains the notices without another WebView request. Packages declaring MIT but
omitting a separate license/copyright file are identified explicitly rather than
attributed to an invented author. Publication-specific license review remains
part of the complete release audit.


## Pinned secure-randomness patch

`patches/@kehto__shell@0.20.0.patch` replaces Kehto's namespace-prelude request-ID
fallback with 16 bytes from Web Crypto `getRandomValues`, formatted as hex. The
normal `randomUUID` path is retained. If neither secure API exists, request creation
throws before posting. These are correlation IDs; native session generations remain
native-issued UUIDs. This changes no NAP message fields or capabilities.

The reviewed upstream is `@kehto/shell` 0.20.0 from the Kehto revision recorded above.
Its original fallback used a timestamp and `Math.random`. React Doctor's line-based
security-context rule found it in the minified delivery bundle. The patch removes
that weak primitive itself; no scanner exclusions or generated-code substitutions
are used. pnpm records the exact patch hash in the runtime lockfile. The build
rejects any `Math.random` call in the final bundle, and Chromium/WebKit tests exercise
both the no-`randomUUID` fallback and failure when secure randomness is unavailable.

Web Crypto API reference:
[getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues).
