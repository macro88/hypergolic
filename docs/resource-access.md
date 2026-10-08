# Bounded resource access

Phase 2.3 implements a selected profile of [NAP-RESOURCE PR13 head 8c0645d](https://github.com/napplet/naps/blob/8c0645d32ceb159bc3e8bcec1107a92862b7e86a/naps/NAP-RESOURCE.md). Native acceptance is recorded separately in the phase verification. Domain admission does not promise every resource scheme, codec or delivery model.

## Public contract and authority

The genuine guest SDK 0.27.2 calls the Kehto injected resource facade. The packaged NAP resource shim is not the active resolver. The pinned Kehto shell/runtime patches route only `resource.info`, `resource.bytes`, `resource.bytesMany` and `resource.cancel` through ACL/firewall admission to the original native recipient.

Requests contain `type`, bounded opaque `id`, and `url` or ordered `urls` where applicable. The SDK receives actual complete `Blob` objects and a required `mime` field matching each successful Blob type. Success is the request type plus `.result` and matching ID; failure is the request type plus `.error`, matching ID and canonical error string. Cancel uses the original ID, has no ACK, is idempotent, and the SDK suppresses late results. Individual bulk failures preserve input order and successful siblings. A cancelled root cancels the whole bulk request.

Caller scope, fetch options, cookies, authorization headers, response headers/status, byte ranges, streams and progress are absent. Correlation IDs confer no authority. The native registry captures identity epoch, publisher, app/version, instance, renderer generation and granted domains. The production broker checks that immutable registration, owner lifetime and claimed native lease before work and delivery. Close, identity transition, replacement and renderer loss revoke the old broker, memory cache and pending/private byte handles. Background revokes native in-flight leases before the React Native lifecycle mirror.

A resource grant permits any validated public HTTPS hostname. Each connection resolves and checks all addresses, rejects private/mixed results, pins a permitted address, and verifies TLS against the hostname. HTTPS URLs reject credentials, IP literals, local/private aliases, fragments and malformed controls. The WebView itself has no network authority. Its inner CSP admits Blob image/media previews only when resource is granted; the trusted CSP remains the leading head policy before all preludes.

## Selected schemes

| Scheme | Behavior |
| --- | --- |
| `https:` | Native bounded HTTPS GET, at most two public HTTPS redirects under the original deadline. Every hop repeats URL, DNS/address and TLS checks. Loop, private destination, mixed DNS, downgrade, credentials and hop overflow fail closed. |
| `blossom:sha256:<lowercase hex>` | Try the trusted ordered download-server origins and verify complete SHA-256 bytes before admission. Resource hints cannot select servers. |
| `nostr:note…`, `nostr:nevent…`, `nostr:naddr…` | One query through the configured shell relays; strictly verify the signed event/filter and return UTF-8 JSON. Do not follow content URLs, relay hints, decrypt or recursively resolve. Kinds 4 and 1059 are denied. This is a selected public-event representation, not generic encrypted-resource support. |
| `data:` | Decode through the trusted broker, then apply the same byte/MIME limits. MIME labels are untrusted. |
| `htree:` | Explicit `unsupported-scheme`; revisit after Phase 4. |

Default Blossom download origins are `https://blossom.primal.net` and `https://cdn.satellite.earth`, editable in trusted Settings. Up to four distinct public HTTPS origins are saved in the dedicated native SQLite settings database; an empty list disables Blossom. These public device settings apply across identities and persist after restart. They do not select an upload provider. Unavailable settings disable Blossom without blocking identity startup or other resource schemes.

The defaults follow the [BUD-01 examples pinned at b5bd280](https://github.com/hzrd149/blossom/blob/b5bd2801d1763aa635fc8fea7a76597e0eb18990/buds/01.md). Actual default-server availability must be checked with native receipts. The bounded redirect profile was selected after a canonical Primal hash URL returned HTTP 302 to public object storage. The original zero-redirect candidate could not complete that real download. Published HTML retrieval retains its existing separate policy and 2 MiB bound.

Resource response headers never reach guests. Repeated informational headers, such as the two `x-goog-hash` values observed on the audio sample, are ignored; repeated framing, encoding, redirect or connection fields remain denied. Header/body framing bounds remain independent. Compression is not supported. This follows the need to avoid ambiguous message framing while allowing irrelevant repeated metadata; see [HTTP field semantics](https://www.rfc-editor.org/rfc/rfc9110.html#section-5.2).

## Engineering bounds

| Bound | Selected value |
| --- | --- |
| Complete file / successful bulk aggregate | 10 MiB |
| URLs per bulk call | 8 |
| URL / data-URL bytes | 8 KiB / 64 KiB |
| Concurrent retrievals per realm / process | 2 / 4 |
| URL attempts per realm per minute, including cache hits | 60 |
| Memory cache per realm / process | 30 MiB / 50 MiB |
| Cached entries per realm | 64, exact URL keys, LRU eviction |
| Cumulative delivered bytes per loaded realm | 50 MiB, monotonic until revocation |
| Root / individual native URL deadline | 20 seconds / 15 seconds |
| Private carrier chunk / transfer lifetime | 256 KiB / 15 seconds |
| Private staged handles per realm | 8 |
| PNG, GIF, JPEG, WebP header dimensions | nonzero, at most 4096 per axis |

These are bounded implementation candidates tested for this profile, not a user-approved universal prohibition on larger resources. Streaming and large-file delivery remain unresolved separate work. Cancelled resolvers that ignore abort retain their concurrency reservation until they actually settle.

Native retrieval uses small metadata and app-only chunks. A separate host transfer pool binds opaque one-use cursors to the captured realm. The adapter reconstructs and checks the complete bytes/MIME before giving the SDK a Blob. No public resource message can access the private `resource.__chunk` transport. The ordinary 2 MiB JSON message ceiling remains intact.

MIME comes from bytes. The profile admits bounded PNG/GIF/JPEG/WebP headers, WAV/MPEG audio, selected MP4/M4A brands, PDF, fatal UTF-8 text and valid JSON. Active HTML/XML/raw SVG and unknown/malformed bytes fail. Header parsing is not full codec validation. JPEG dimensions follow [T.81 frame headers](https://www.w3.org/Graphics/JPEG/itu-t81.pdf); WebP canvas dimensions follow [RFC 9649](https://www.rfc-editor.org/rfc/rfc9649.html). Codec support and malformed-media behavior require target-platform evidence. SVG needs bounded network-free rasterization and remains a recorded post-Phase-4 gap.

## Cache and playback lifetime

Cache and Object URLs live only while that napplet realm is loaded. Switching preserves its cache and place; cold launch refetches. Revocation clears the cache and private transfers. SDK URL helpers revoke on release, including revocation before asynchronous readiness; late completion cannot allocate a fresh URL.

Audio/video uses complete grant-scoped Blob bytes. Trusted native focus/background handling pauses playback; the guest prelude rejects inactive/autoplay attempts and requires a fresh trusted gesture to Play. Returning retains position while loaded and waits for manual Play. iOS enables inline playback and disables AirPlay/Picture in Picture. Closing/replacement destroys the player. No background player, direct network media, stream or OS attachment-save workflow is claimed.

## Verification

Use `pnpm run test:resources`, `pnpm run typecheck`, `pnpm run test:capabilities`, `pnpm run runtime:test`, and the owning native proofs/journeys in [the resource test guide](../tests/native/resource/README.md). Preserve exact reference bytes, expected digest, source/runtime/fixture/product seals, native input, accessibility, screenshots and playback position evidence. Simulator fixtures and controlled faults are distinct from real DNS/TLS and physical-device acceptance.

CAP-04 is accepted for this selected bounded profile. The [phase verification](../.planning/phases/02.3-resource-access/02.3-VERIFICATION.md) records all three plans, current-source native journeys, normal exports/prebuilds/Release builds and required sealed numeric React Doctor/aislop 100/100 plus all lockfile audits. Full published fixture parity, protected-identity device journeys and older/physical target coverage remain final CAP-14 gates. Hashtree/SVG and streaming/large-file gaps are not silently counted as completed.


## Physical iPhone original-SDK resources — 8 October 2026

Three separate ordinary signed iPhone suites pass: fifteen resource checks,
thirteen media checks and a five-check background supplement. They use retained
identity and normal Settings/guest inputs; no main reinstall, key access/export,
signing or public write. Only run-created views are closed, restoring prior focus.
All410 source inputs and the existing local normal product seal agree through
all three runs; installed executable bytes are not retrieved.

Resource info reports the exact selected schemes and10MiB/eight-URL bounds. Live
HTTPS PNG bytes/MIME/hash match an independent download and visibly decode; image/
receipt survive foreground navigation and release removes both. Host-mediated data
PNG/UTF-8 JSON preserve exact bytes/MIME/hash. Active HTML with a text hint, private
IP literal and unselected Hashtree yield canonical errors. Three bulk rows preserve
exact input order, successful image/text siblings and unsupported error. Cold
identity/view and fresh data reload pass after explicit release; this does not
prove cache eviction or in-flight cancellation on process death.

The complete4,372,373-byte MP4 exceeds the normal JSON ceiling and reaches the
original SDK with exact independently verified hash/MIME. Video starts paused;
trusted Play advances time. Switching pauses at retained position, requiring fresh
Play. The thirteen-check background case observes state3/3 and stable paused
position on return. It alone does not bound all time spent away. The five-check
supplement holds confirmed state3 for8.002s: position0.908→1.159 (advance0.251s),
stays paused on return, then fresh Play advances to1.826. This bounds continuity
across that interval, not indefinite background silence or native zero effects.
Exact39,868-byte MP3 requires Play and advances time. Release removes both players;
after release, cold launch restores identity/view with no player. Live-player
process-death destruction, all codecs and hostile media remain unproved.

Private `iphone-resources01` retains original SDK/AX receipts, inspected PNGs,
independent exact PNG/JSON/MP4/MP3 reference bytes, pinned NAP-RESOURCE revision
`8c0645d32ceb159bc3e8bcec1107a92862b7e86a`, external observers and source seals.
Image and data PNG screenshots visibly show previews and exact receipt text;
bulk screenshot shows inputs/status with rows below the viewport, so exact AX/SDK
validates those rows. Media PNGs show native controls/time, paused video and playing
audio; some MP4 hash receipts are below the viewport and are verified by AX/SDK.

Focused shared23, native Java48 and Swift18 resource checks pass. Main production
code/packaging/quality remains unchanged, with no new full-build/quality claim.
CAP04 is partial on iOS: full Blossom/Nostr/settings/cache, cancellation/private
handles, DNS/TLS/redirect/size/MIME/flood/quota/native stale effects, identity/
replacement, live-player close/death, verified published parity and Android physical
remain required. No final row, plan or Phase2 is closed. Pending Expo/numeric Doctor
choices and exact approved dependency exceptions remain. Weekly43%, ceiling about98%;
source push stays owner-only.

## Physical Android overview/media regression — 8 October 2026

Separating foreground WebView rendering from selected media focus fixes blank
inactive overview previews. The existing trusted media prelude and native focus
owners remain in place. The ordinary installed Release passes five physical
checks: exact SDK public MP4 receipt versus independently read full bytes, switch
pause at a stable position, fresh Play after switch, an eight-second actual
background hold returning paused without autoplay, and fresh Play after return.
The background observation records 1.984 seconds of advance between the last
foreground read and pause; instant suspension is not claimed. Keep open retains
the exact resource receipt, then only the disposable test resource is closed.
Full CAP-04, all codec/fault cases, published parity and Phase2 remain open.
