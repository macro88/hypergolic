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
is not yet injected into the normal app loader. Native WebSocket *frame parsers*
exist on both platforms, but no relay socket transport feeds them yet. They
limit each raw frame, including its header, to 66,560 bytes and each read to
8 KiB. A parser alone does not provide public-address pinning, TLS, query
selection or lifecycle ownership for a relay connection.

SQLite schema v3 can persist a revisioned first-open capability grant by user,
publisher and stable napplet ID. The consent review and authorization gate are
not wired to it. The trusted cache, update confirmation and normal `naddr`
workspace entry are still open.
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
frame proof is `python3 tests/native/websocket-frames/run.py`. Exact current
counts and build evidence are recorded in the phase progress note.
