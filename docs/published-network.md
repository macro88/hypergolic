# Published napplet network boundary

The published loader already verifies a signed kind-35129 manifest, its exact
publisher and `d` coordinate, the `/index.html` hash and the NIP-5A aggregate.
Network replies remain untrusted input. The native WSS and HTTPS bridges now
feed ordinary `naddr` entry and its published workspace. Public-only Android
and iOS Simulator first-open journeys have exercised that path; a live network
update and physical-iPhone protected identity remain open.

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

Android HTTPS runs DNS in one bounded daemon worker and polls it against the
operation deadline and cancellation. A blocked platform resolver can outlive a
cancelled request if it ignores interruption; the four-slot queue then rejects
further lookups when full rather than accumulating unbounded work. The iOS
HTTPS and WSS owners try the next address from the same fully vetted DNS answer
set if a connection fails or waits before it reaches ready. Once ready, an HTTP
request or WebSocket session cannot fail over, and all attempts share the
original deadline. Offline owner proofs cover cancellation, timeout and address
selection. A host-JVM loopback TLS proof now drives the actual Android HTTPS
socket and response path with a disposable certificate. Package-local test
inputs replace DNS answers and trust only in that proof; the public entry point
still uses platform DNS and trust. The proof covers a valid named certificate,
retry from an unavailable vetted IPv6 address to IPv4, an untrusted certificate,
hostname mismatch, mixed private DNS answers before connect, a redirect and
cancellation while a response is withheld. The host JDK's default
`HttpsURLConnection` verifier rejects raw socket sessions, so the proof uses
an explicit certificate SAN checker for its isolated socket; Android keeps its
platform verifier. Controlled failures on Android devices, the iOS Network
framework path and background/restart lifecycle acceptance remain open.

The host-JVM loopback WSS proof drives the actual Android relay TLS socket,
upgrade and frame path using the same package-local test inputs. It verifies a
named-certificate upgrade, masked outbound `REQ`, a complete `EVENT`/`EOSE`
read, and pre-request retry to a vetted IPv4 address. It rejects an untrusted
certificate, wrong hostname, mixed private DNS answer, redirect, bad upgrade
accept value, oversized server frame and a query cancelled after upgrade.
These are controlled host-JVM checks; Android-device and iOS controlled relay
failure paths remain separate acceptance work.

## Current integration boundary

Both Expo modules expose an app-only `fetchPublishedHttps(operationId, url)`
method that returns Base64 of the bounded original body, plus operation cancel
and revoke methods. The trusted JavaScript adapter checks canonical Base64 and
reconstructs a bounded `Response` for the existing published source. This port
is injected into the normal Settings loader. Android and iOS now also have
single-relay native WSS query cores. Each checks every resolved address before
numeric-address connection, retains the original hostname for TLS, validates a
strict WebSocket upgrade, masks its outbound `REQ` and bounds inbound frames,
reads, messages, events, bytes, cancellation and deadline. Both query cores are
exposed only through app-owned Expo methods with cancel and lifecycle revocation.
A trusted request builder and relay adapter select only configured Lookup relays,
limit fan-out to four native queries, parse responses through matching `EOSE`,
and prepare still-unverified events for the signed-artifact loader. This source
feeds ordinary `naddr` entry and pinned reopening, but a live phone-tested
remote path remains open.

SQLite schema v3 can persist a revisioned first-open capability grant by user,
publisher and stable napplet ID. A trusted coordinator now binds a verifier-
branded artifact to an exact publisher, signed `d` identifier and capability set.
It requires explicit review for a new or changed grant and denies stale decisions.
The production staging wrapper rechecks that branded admission through every
native upload step. Settings now shows the verified publisher, signed event and
requested domains before first open, and a normal workspace card claims the
staged one-use artifact. Both native hosts bind the granted domains to the exact
published session before claiming the artifact. A separate SQLite BLOB cache is
scoped to user, publisher, napplet ID and exact event; every hit repeats event
signature and HTML hash verification. A saved workspace row remains an untrusted
claim until the pinned artifact and grant are verified. Settings can explicitly
check a loaded published napplet for an update. It rechecks the old pin, accepts
only a newer verified event for the same publisher and stable napplet ID, and
shows the old/new signed event IDs before replacing the workspace card. Changed
access gets a separate review. Declining either review leaves the running pin
untouched. Acceptance closes pending signing requests, revokes the old native
session and stages the new bytes under a fresh one-use session ID. The update
flow has focused coordinator/runtime tests and embedded signed native journeys
on Android and iOS Simulator. Its live relay/Blossom update journey remains open.
For a published napplet granted `relay`, the signing approval owner additionally
requires the live verified workspace binding and exact native generation before
showing a request; every event still needs the v1 approval sheet.
If Settings later revokes an already-admitted grant while an identity remains
active, it must also revoke that admission's live session before another stage;
the current coordinator checks the identity/session epoch, not a new database
read for every upload chunk.

The Settings signed-host QA route still uses a locally embedded signed fixture.
A separate public-only fixture has now opened a real remote napplet through
native WSS and HTTPS on Android API 36/API 29 and iOS 26.5 Simulator; the normal
Android API 29 app also opens and restores that remote guest. The new
[live-update QA harness](../tests/native/live-update-publication/README.md)
prepares a v1/v2 release on public transports but has not yet published it or
passed a native update run. None of these fixtures proves physical-device
identity security or guest signing.

Run the address proof with `python3 tests/native/public-ip-classifier/run.py`.
The Android HTTPS proof is `python3 tests/native/android-published-https/runner.py`;
its loopback TLS cases need local socket permission and OpenSSL.
The Android runtime proof is
`python3 tests/native/android-published-transport-device/runner.py --serial <emulator> --output <new-dir>`.
It compiles the unchanged owning Java sources into a disposable DEX and runs
25 HTTPS plus 37 WSS TLS checks on the named emulator. API 26 and API 29
both pass, bound respectively to DEX SHA-256
`eed9e5badd29e19edde533b1dcd11131fa460d2b229e23557598a268061d3182`
and `285c78c5fb3d2d8fb132cb9aaec22377f38180e33939dd841f7ef399a6e7b921`.
This uses Android's runtime and socket stack under the shell UID with temporary
test trust inputs; it does not exercise the Expo app, its system trust store or
background lifecycle. The runner removes its temporary emulator files and
writes a source-hashed JSON receipt.

The Android Expo owner proof is
`python3 tests/native/android-published-https-bridge/runner.py`.
The iOS response and request proof is `python3 tests/native/published-https/run.py`;
it compiles the actual native sources with `swiftc -warnings-as-errors`. The
iOS HTTPS transport proof is `python3 tests/native/published-https/tls_runner.py`.
It runs the actual Swift HTTPS owner against disposable loopback TLS servers
with a proof-only address and certificate anchor seam compiled under
`HYPERGOLIC_NETWORK_PROOF`. Its six host-macOS cases cover valid HTTPS,
IPv6-to-IPv4 pre-request failover, untrusted and wrong-host certificates,
redirect rejection and cancellation during a withheld response. The normal
native build does not define the proof flag, resolve override or custom trust
anchor. Set `HYPERGOLIC_TLS_SIMULATOR_UDID` to a booted arm64 iPhone Simulator
ID to compile and run the same six cases inside that simulator. This executes
the owning Swift transport and Network.framework in iOS Simulator as a
standalone proof binary; it does not exercise the Expo app's lifecycle or a
physical iPhone. The iOS Simulator Release build checks the actual Expo module
target. The production resolver calls `vetResolvedAddresses` before connecting.
The HTTPS runner checks both orderings of a synthetic public/private answer
pair, an empty set and a public-only set through that same production veto on
macOS and Simulator.
These checks do not inject a mixed reply into the platform `getaddrinfo` call.
The shared frame proof is `python3 tests/native/websocket-frames/run.py`. WSS handshake,
client-frame and native query proofs are in `tests/native/websocket-handshake`,
`tests/native/websocket-client-frames`, `tests/native/android-published-wss`
and `tests/native/ios-published-wss`. The Android WSS runner includes loopback
TLS cases and needs local socket permission and OpenSSL. The iOS WSS transport
proof is `python3 tests/native/ios-published-wss/tls_runner.py`; it runs the
actual Swift WSS owner against disposable loopback TLS relays with the same
compile-gated proof seam. Its eight host-macOS cases cover valid masked `REQ`
and `EVENT`/`EOSE`, pre-request IPv6-to-IPv4 failover, untrusted and wrong-host
certificates, redirect and bad-upgrade rejection, oversized frames and
cancellation after upgrade. The same eight cases also pass inside a booted
arm64 iPhone Simulator with
`HYPERGOLIC_TLS_SIMULATOR_UDID` set. That proof runs a standalone native binary,
not the Expo app or a physical iPhone. Exact counts and build evidence are
recorded in the phase progress note.

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

Before v1 release, finish the native Android and iOS negative-path audit
against controlled TLS endpoints: a valid relay and Blossom server,
mixed private/public DNS answers, hostname or certificate mismatch, redirects,
bad upgrade responses, oversized frames, cancellation, background revocation,
and restart with the exact pinned event. The successful path must reach the
normal workspace and show a verified guest on both platforms.
