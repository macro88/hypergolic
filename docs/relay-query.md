# Relay query

The selected historical-read profile now runs through genuine SDK → Kehto → native
capability lease → app-owned native WSS → validated reply. The normal application
uses the current trusted Network settings. Feed Lab is an unsigned, reviewed
embedded fixture; it requests `relay` and has optional theme access.

## Selected contracts and limits

The owning [NAP-RELAY draft](https://github.com/napplet/naps/blob/0be8abce18beb46ca37bd4ddd042f58d30b4eedc/naps/NAP-RELAY.md)
remains selected at PR 2 revision `0be8abce18beb46ca37bd4ddd042f58d30b4eedc`.
[NIP-01](https://github.com/nostr-protocol/nips/blob/0046368a747c5c25ae2bec28bae0e537744c8f10/01.md)
was checked at `0046368a747c5c25ae2bec28bae0e537744c8f10` on 30 September 2026.
Successful replies contain `{type:"relay.query.result",id,events:[{event}]}`;
failures contain the same type/id and `error`, with `events` absent. A complete,
valid EOSE response with no events is successful empty retrieval. Connection or
validation failure is never represented as an empty successful result.

| Boundary | Selected limit/behavior |
| --- | --- |
| Filters | 1–4; ids/authors/kinds/since/until/limit and single-letter tag filters |
| Lists | 1–64 entries; exact lowercase hex64 for ids/authors/#e/#p |
| Request | 16 KiB; limit defaults to 32; explicit 0–32 accepted |
| Events | 32 raw events/relay and 32 unique aggregate events; 64 KiB/event; 512 KiB aggregate event bytes |
| Transport | Up to 16 selected public WSS Network relays, sequentially; 64 frames/relay |
| Lifetime | One 15-second total deadline; two concurrent queries per service and per broker |
| Selection | Filter conditions AND; filters OR; newest timestamp first, then ascending id; per-filter limits |
| Validation | Fresh NIP-01 fields, independent event hash and signature, filter match; no verification-cache trust |

Unknown extensions, empty lists, partial hex prefixes, invalid timestamps and
caller-selected relay/identity fields are denied. The selected bounded profile
can therefore reject requests that a broader implementation accepts. Result
limits fail explicitly instead of silently truncating the aggregate.

A query snapshots trusted destinations at admission. At least one complete valid
relay response is required. An individual relay failure is tolerated when another
completes; results are best effort, and neither EOSE nor success proves complete
history across unavailable relays. A total timeout fails the query even if an
earlier relay succeeded. There is no cache, sidecar augmentation or NIP-65 routing.

## Ownership and compatibility

The existing native request registry binds the caller to its immutable session,
generation, identity epoch, publisher, app, version, instance and granted domains.
The broker rechecks native lease and owner validity before dispatch and delivery.
Revocation aborts in-flight reads; native background/expiry is checked while work
is pending, before React Native lifecycle callbacks necessarily arrive. Final
native delivery independently checks the same generation. Reads never acquire a
signing approval or a scoped storage binding.

Required-domain admission remains a separate check. `relay` admission currently
supports this query profile and existing individually approved publication; it
does not promise subscriptions, close, encrypted publication or automatic AUTH.
Subscriptions are phase 2.2. Resource sidecars and outbox routing are later work.
Unsupported required `cvm`/`webrtc` and other domains still block execution.

## Verified checkpoint — 30 September 2026

Both standalone isolated fixtures pass exact public-event retrieval, empty EOSE,
invalid-filter denial, close/reopen and cold restart. Android API 36 uses actual
compressed accessibility and ADB input, compares the returned ID/content against
an independently hash/signature-verified sample from `wss://nos.lol`, and checks
installed APK equality and query-source stability. iPhone 17 Pro/iOS 26.5 Simulator
uses XCTest with exact native input replacement; installed executable, JavaScript
and runtime assets match the recorded Release build. Five screenshots per
platform were captured. Early harness failures are retained separately.

The deterministic query/service suite passes 10 tests and the broker suite adds
6 owner/grant/revocation cases. All 40 capability, 344 security plus 13 preflight,
80 storage, 25 shell and 110 Chromium/WebKit runtime tests pass. Feed Lab has 6
browser tests. Conformance CLI passes 5 and skips 5 checks, including unresolved
manifest and lifecycle measurements; its label does not establish full protocol
conformance. Full numeric React Doctor and aislop are 100/100 with no findings,
and dependency audits pass for all seven lockfile roots.

TypeScript, both production exports, Android Release and iOS Simulator Release
builds pass. `pnpm run check` stops at the existing Expo Doctor patch-pin mismatch
(20/21 checks). The intentionally pinned Expo 57.0.20 family remains unchanged;
the later quality/audit gates were run independently, without suppression.

The ten-case controlled matrix also passes on each native host: known signed
result, empty EOSE, bad signature, signed filter mismatch, missing EOSE, event and
frame floods, shortened timeout, explicit close and owner-epoch revocation. SDK,
Kehto, native leases, broker and validation are real; its frame port is a diagnostic
double, distinct from the live WSS proof. Late frames are supplied after actual
cancellation and never become a successful reply to revoked owners. Owner-epoch
revocation exercises the authority assertion, not the protected-identity UI.
The production Java/Swift lease registries each pass 100 assertions, and a normal
runtime-owner regression verifies a real confirmed identity transition aborts a
pending query. Early harness layout/expectation failures remain separate.

Phase 2.1's selected query-profile exit is accepted (CAP-02). CAP-01 remains an
ongoing compatibility requirement across capability phases. Full normal-app and
verified-published Feed Lab parity, selected real napplets, older WebView query
behavior, physical-iPhone protected identity/signing and live published updates
remain open for final phase-2.11 integration acceptance. No full relay conformance
or MVP completion is claimed. The [native fixture guide](../tests/native/feed-query/README.md)
records reproduction and evidence limits.

The final scans surfaced development-tool transitive advisories after the earlier
clean scan. Exact overrides now select `fast-uri` 3.1.8, `ip-address` 10.7.1 and
`brace-expansion` 5.0.12 where affected, retaining the existing `xcode>uuid` pin.
Application/Expo versions are unchanged. Both required quality scores and all
seven complete audits must pass again before the targeted commit.
