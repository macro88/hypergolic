# Live relay subscriptions

Phase 2.2 implements the selected NAP-RELAY draft profile at PR #2 revision
`0be8abce18beb46ca37bd4ddd042f58d30b4eedc`. NIP-01 comparison uses
`0046368a747c5c25ae2bec28bae0e537744c8f10`. This is a selected draft contract,
not an interoperability claim across every SDK release or future draft.

The genuine SDK sends `relay.subscribe` with original `id`, caller `subId`,
filters and optional relay. Replies are canonical `relay.event` with
`result: {event}`, `relay.eose`, and terminal `relay.closed`; `relay.close`
preserves its original caller ID. There is no public subscribe/close result ACK.
EOSE completes stored history while later matching events continue. Fresh
seven-field hash/signature/filter checks run before app delivery and again at the
captured runtime recipient. Encrypted kinds 4 and 1059 are explicitly unsupported.

## Authority and bounds

Stream admission captures the native generation, public identity/epoch,
publisher, app, version, instance, grants, shared native sequence and actual
native recipient. Its one-use opaque lookup token stays app-only. Accepted stream
lifetime is independent of the ordinary 25-second pending native lease. Native
foreground/generation checks remain authoritative at the final renderer push;
JavaScript ownership checks add the runtime identity and workspace binding.
A close or revocation invalidates intent and delivery revisions before cancelling.

The process allows eight subscriptions, two per session, two trusted relays per
subscription and 64 session coordinators. Filters retain the bounded core query
profile. Connections use fresh native UUIDs and host-created relay subscription
IDs; caller IDs cannot reopen closed intent. Trusted Network destinations are
snapshotted at admission; a scoped guest relay must already be trusted.

Event size is bounded to 64 KiB, raw text to 66 KiB, native frame delivery to one
unacknowledged frame per connection and renderer delivery to four messages/256
KiB per token. Native rolling wire bounds are 64 frames and 2 MiB per second.
The coordinator retains 1,024 recent event IDs and at most five consecutive failed
reconnect attempts with delays 1/2/4/8/16 seconds. Renderer acknowledgements use
the shared native sequence and exact monotonic per-stream delivery number.
Feed Lab retains 32 displayed rows and an editable draft. It renders text safely.

## Confirmed lifecycle

Loaded feeds stay live across napplet focus changes. Native background/inactivity
revokes socket delivery and cancels connections before React Native callbacks;
loaded verified read views and logical intent remain while the process survives.
Foreground creates fresh connection IDs, refreshes the original bounded recent
filter and deduplicates recent IDs. It does not promise gap-free history while
suspended. Native lifecycle revisions also handle a whole missed background/return
interval. Background alone does not send terminal `relay.closed`.

Explicit close, identity change, view removal/replacement, navigation, renderer
loss and termination revoke the old generation/intent. Revoked or closed reads do
not reconnect. Approval and pending transfer/background protections remain
independent. Android cancellation closes raw TCP synchronously; TLS close-notify
and cleanup remain on the worker, avoiding network writes on the UI thread.

## Validation status

The [native fixture](../tests/native/feed-subscription/README.md) separates real
SDK/native WSS lifecycle, diagnostic frame faults, registry proofs and protected
identity integration. Final isolated Android API 36/WebView 133 and iOS 26.5
Simulator Release products each pass eight actual WSS lifecycle checks and nine
diagnostic SDK/native fault cases. Installed products and source snapshots match.
An independent, read-only public relay observer verifies every rendered live ID
in the final captures: 17 Android and 16 iOS, including 11 and 10 new events after
both native and observer EOSE respectively. Switching retains drafts/connections;
background stops both sockets; return creates two fresh connections; close, view
removal, public-owner revocation and cold restart reject old intent. Inspected
final screenshots show the corresponding UI and native counters.

The ordinary public-only published-update shell journey also passes on both
platforms, retaining the accepted verified revision and connected runtime across
background/return. This proves loaded published read-view retention, not published
Feed Lab subscription parity. Java/Swift retained-authority proofs each pass 82
assertions; the existing Java WSS proof passes 223 checks. Diagnostic frame faults
are not native WSS fault-server or protected-identity UI evidence.

Full React Doctor and aislop pass 100/100 with zero findings, and all seven
lockfile audits are clean. Strict TypeScript, both exports/prebuilds, normal
Android ARM64 Release and unsigned iOS Simulator/device Release compilation pass.
`pnpm run check` still stops at the existing Expo Doctor patch-pin mismatch;
Expo/application pins and quality gates are preserved. CAP-03 is accepted for
this selected profile. See the [phase verification](../.planning/phases/02.2-live-relay-subscriptions/02.2-VERIFICATION.md).

A real runtime-owner regression proves focus retention and confirmed identity
revocation during suspension. Browser tests cover captured recipients, invalid
signatures/subscription IDs, private-channel forgery, background deadlines and
explicit encrypted-kind denial. These tests do not replace native evidence.
Physical iPhone protected identity/signing, complete published MVP capability
parity and older WebView acceptance remain CAP-14/phase-2.11 gates.
