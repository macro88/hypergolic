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
trusted JavaScript adapter now exist with public-IP pinning, but normal app entry
does not inject or call them.

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

There is no app-entry link flow, first-open publisher/access consent, connected
safe native network retrieval route, trusted cache, pinned restart recovery or explicit
update UI yet. The Settings-only local signed QA route exercises the verified
native handoff, but does not grant ordinary published app entry. The
transport still needs a bounded, pinned relay WebSocket connection on each
platform. Native HTTPS ports and WebSocket frame parsers now exist separately.
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
