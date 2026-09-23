# Published napplet network boundary

The published loader already verifies a signed kind-35129 manifest, its exact
publisher and `d` coordinate, the `/index.html` hash and the NIP-5A aggregate.
Network replies remain untrusted input. This checkpoint adds native transport
cores and an app-only HTTPS bridge; it does **not** connect a remote napplet to
the ordinary workspace.

## Destination policy

Android and iOS classify every resolved address before connection. An empty or
mixed public/private DNS answer set is rejected. The conservative policy rejects
private, loopback, link-local, documentation, multicast, reserved and transition
blocks, including IPv4-mapped IPv6. It intentionally rejects some special-purpose
addresses that could be globally reachable. Its range basis is the IANA
[IPv4](https://www.iana.org/assignments/iana-ipv4-special-registry) and
[IPv6](https://www.iana.org/assignments/iana-ipv6-special-registry) special-purpose
registries, both last updated 9 October 2025, and the
[IPv6 address-space registry](https://www.iana.org/assignments/ipv6-address-space).
Recheck these mutable registries before release.

The HTTPS owners accept only credential-free `https` URLs with public DNS names.
They connect to a numeric address from that vetted answer set, while retaining
the original hostname for TLS SNI and certificate verification. They never
follow HTTP redirects. The iOS owner uses Apple's
[Network framework](https://developer.apple.com/documentation/network/nwconnection)
and an explicit original-hostname
[TLS policy](https://developer.apple.com/documentation/security/secpolicycreatessl%28_%3A_%3A%29);
the Android owner uses a vetted TCP socket wrapped in the platform TLS socket.
The application does not allow a host-supplied override of certificate trust.

Response framing and original bytes are bounded to 2 MiB. Encoded bodies are
rejected. Cancellation and a deadline must close the connection. The iOS owner
accepts strict content-length or chunked framing and limits each native receive
to 8 KiB. Android applies its own header and body ceilings. Neither owner
confers signing, publisher trust or execution authority; the signed-artifact
verifier remains mandatory after fetching bytes.

## Current integration boundary

Both Expo modules expose an app-only `fetchPublishedHttps(operationId, url)`
method that returns Base64 of the bounded original body, plus operation cancel
and revoke methods. The trusted JavaScript adapter checks canonical Base64 and
reconstructs a bounded `Response` for the existing published source. This port
is not yet injected into the normal app loader. Android and iOS now also have
single-relay native WSS query cores. Each checks every resolved address before
numeric-address connection, retains the original hostname for TLS, validates a
strict WebSocket upgrade, masks its outbound `REQ` and bounds inbound frames,
reads, messages, events, bytes, cancellation and deadline. Both query cores are
exposed only through app-owned Expo methods with cancel and lifecycle revocation.
A trusted request builder and relay adapter select only configured Lookup relays,
limit fan-out to four native queries, parse responses through matching `EOSE`,
and prepare still-unverified events for the signed-artifact loader. This source
is not yet wired to ordinary entry and is not a live phone-tested loading path.

SQLite schema v3 can persist a revisioned first-open capability grant by user,
publisher and stable napplet ID. A trusted coordinator now binds a verifier-
branded artifact to an exact publisher, signed `d` identifier and capability set.
It requires explicit review for a new or changed grant and denies stale decisions.
The production staging wrapper rechecks that branded admission through every
native upload step. The review UI and normal `naddr` entry do not call these
pieces yet. The trusted cache and update confirmation are also open.
If Settings later revokes an already-admitted grant while an identity remains
active, it must also revoke that admission's live session before another stage;
the current coordinator checks the identity/session epoch, not a new database
read for every upload chunk.

The existing Settings signed-host QA route uses a locally embedded signed
fixture and does not test remote network behavior. Native compile and isolated
parsing/address tests do not establish live TLS behavior on a phone or a
complete Android/iOS published loading journey.

Run the address proof with `python3 tests/native/public-ip-classifier/run.py`.
The Android HTTPS proof is `python3 tests/native/android-published-https/runner.py`.
The Android Expo owner proof is
`python3 tests/native/android-published-https-bridge/runner.py`.
The iOS response and request proof is `python3 tests/native/published-https/run.py`;
it compiles the actual native sources with `swiftc -warnings-as-errors`. The
iOS Simulator Release build checks the actual Expo module target. The shared
frame proof is `python3 tests/native/websocket-frames/run.py`. WSS handshake,
client-frame and native query proofs are in `tests/native/websocket-handshake`,
`tests/native/websocket-client-frames`, `tests/native/android-published-wss`
and `tests/native/ios-published-wss`. Exact current counts and build evidence
are recorded in the phase progress note.

## Relay integration contract

A published lookup must use only the trusted Lookup relay list, never relay
hints in an `naddr` link. Each `wss` destination needs the same all-address
public classification and numeric-address pinning as HTTPS, while preserving
the original hostname for SNI and certificate validation. The opening
handshake must check the selected WebSocket accept value and refuse redirects,
extensions and compression. The native frame parser then runs before any JSON
decode or JavaScript delivery. This follows [RFC 6455](https://www.rfc-editor.org/info/rfc6455/).

The prepared trusted request builder creates one bounded `REQ` for the exact
publisher, kind-35129 and `d` coordinate, with an optional exact event ID on
restart. The native query bridge must use this request and only the trusted
Lookup relay list; the app must structurally classify native response envelopes
before accepting an `EOSE` completion.
Collect only the initial `EVENT` messages up to `EOSE`; `CLOSED`, malformed
messages, size overflow, timeout, cancellation or lifecycle revocation must
end the affected connection. A `NOTICE` does not grant permission or alter
the lookup. The shared parser checks these NIP-01 reply envelopes and the
active subscription ID, but does not treat an event as verified.
[NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) defines the
wire envelopes. Event signatures and original artifact hashes must still be
checked in the trusted loader. No relay publishes or signer requests belong to
this lookup transport.

Before enabling ordinary published entry, exercise the native Android and iOS
paths against controlled TLS endpoints: a valid relay and Blossom server,
mixed private/public DNS answers, hostname or certificate mismatch, redirects,
bad upgrade responses, oversized frames, cancellation, background revocation,
and restart with the exact pinned event. The successful path must reach the
normal workspace and show a verified guest on both platforms.
