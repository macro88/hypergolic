# Public identity data

This selected read-only profile binds every request to the native-captured selected
identity. The guest cannot choose a user, relay, cache, signer or decryption key.
Phase 2.5 is accepted for this selected profile, with the single approved dependency
exception below. Broader native MVP acceptance remains Phase 2.11.

## Owning contracts

NAP-IDENTITY is selected at [napplet/naps 5ac0490](https://github.com/napplet/naps/blob/5ac0490461ca6fec2f0d2e45b4835cf9bc08de24/naps/NAP-IDENTITY.md).
Nostr source events follow [NIPs 0046368](https://github.com/nostr-protocol/nips/tree/0046368a747c5c25ae2bec28bae0e537744c8f10):
NIP-01 signatures and replaceable ordering, NIP-02 follows, NIP-24 profile fields,
NIP-51 public lists, NIP-58 accepted profile badges and NIP-65 relay metadata.
The selected installed SDK uses these canonical result fields:

| Read | Source | Result |
| --- | --- | --- |
| Public key | Native selected identity | `pubkey` string; unavailable is empty, without `error` |
| Profile | Latest signed kind 0 by selected user | `profile` object or null; `display_name` maps to `displayName` |
| Relay preferences | Latest signed kind 10002 | `relays` map with read/write directions |
| Follows | Latest signed kind 3, public p tags | `pubkeys` array |
| Mutes | Latest signed kind 10000, public p tags | `pubkeys` array; separate remembered permission |
| Bookmarks | Latest signed kind 10003, e/a tags | `entries` array; separate remembered permission |
| Pins | Latest signed kind 10001, e tags | `entries` array; separate remembered permission |
| Interests | Latest signed kind 10015, t/a tags | `entries` array; separate remembered permission |
| Accepted badges | User kind 10008 or legacy 30008 `profile_badges`, exact signed award/definition joins | `badges` array |
| Blocks | No selected source mapping | Empty `pubkeys` plus explicit unsupported error |
| Zaps | Deferred to Phase 4 | Empty `zaps` plus explicit deferred error |

Unknown list categories return empty entries plus an explicit unsupported error.
Other failed reads carry their canonical empty/null field and `error`, preserving
request type plus `.result` and correlation id. A verified empty EOSE with no
previous source returns the canonical empty/null result. An empty EOSE cannot erase
a previously observed signed replaceable event. A newer signed empty list can.
Newest creation time wins; timestamp ties use the lowest lexical event id.

Profile fields are allowlisted strings: name, displayName, about, picture, banner,
nip05, lud16 and website. Relay hints, URLs, badge images and metadata are returned
as literal data: they do not change routing, open sockets, load images, verify
NIP-05 or initiate payments. List order is retained with duplicate values removed.
Encrypted list content is never decrypted or exposed. Address references are
returned without expanding named collections.

## Permission and lifetime

Ordinary identity domain consent covers profile, relay preferences, follows and
accepted badges. Public mutes and the three supported list categories require a
separate trusted Allow/Decline review showing the selected identity, verified
publisher and stable app. Bundled fixtures explicitly show their reserved publisher
namespace. Allow persists the exact user/publisher/app tuple across verified app
versions. Existing identity grants never imply this permission. These lists are
already public on relays; this control governs the shell identity API.

Settings lists the selected user's remembered permissions and can revoke them.
Revocation immediately blocks cached reads and cancels pending reviews/reads,
then removes the native allowance before the durable SQL deletion. Native queued
replies capture a revocation epoch; reapproval cannot revive an older ticket.
A failed durable revocation stays denied in the current process and reports that
restart may restore the prior saved permission, with an explicit retry control.
Close, replacement, identity change and background revoke pending delivery.
Switching among loaded napplets retains their foreground lifetimes.

## Cache and bounds

The dedicated app-only `hypergolic-public-identity-v1.db` stores original signed
source bundles by selected user and data category, separate from guest storage.
Every disk read reconstructs and verifies signed event fields and exact filters.
The dedicated `hypergolic-identity-list-access-v1.db` stores remembered permissions;
prepared transactions, readback and strict schemas guard both stores.

Cache is fresh for five minutes. Older data attempts a bounded refresh, then may
return the older validated cache on relay availability failure. Invalid signatures,
malformed new data or invalid badge joins fail explicitly rather than returning an
older cache. No cache plus unavailable relays fails explicitly. Authority and list
permission are checked before cache access and again before delivery. The chosen
NAP result has no freshness field, so consumers cannot infer whether a result was
refreshed. A freshness extension is a recorded future gap.

| Bound | Selected limit |
| --- | --- |
| Identity reads | Two concurrent, one per user/category, 20 seconds each |
| Cache | 64 rows, 4 MiB total, 256 KiB per source bundle |
| Query | Four filters, 32 events, 64 KiB per event, 512 KiB result, 64 frames, 15 seconds |
| Event tags | 256 tags; 1024 UTF-8 bytes per tag field |
| Public list | 256 public tags before deduplication |
| Badges | 12 accepted pairs, four public sets, one expansion level, eight thumbnails |
| Remembered permission | 64 exact tuples; no automatic permission eviction |

Shared query/tag bounds apply before projection, including the effective 1024-byte
limit for badge metadata carried in tag fields. Oversized or incomplete selected
sources fail; results are never silently truncated.

Accepted badges preserve the user's selection order. Every award must match its
exact definition, issuer and selected recipient. Unsolicited awards are excluded.
Only public profile acceptance and one-level public set expansion are supported;
nested sets, missing evidence and invalid/partial pairs fail. This strict selected
profile differs from NIP-58's permissive guidance to ignore incomplete pairs.
Returning all awarded badges remains an explicit future gap.

## Selected native acceptance

The [native tracer](../tests/native/identity-data/README.md) exercises genuine SDK
calls through Android WebView and iOS WKWebView, native leases and SQLite.
Plan01 passes nine profile/cache/lifetime cases per host, including an independently
verified live public WSS profile. Plan02's expanded list/badge matrix and Plan03
normal signed admission/final quality are recorded in the phase summaries.
Controlled frames, clocks, owner revocation and offline destinations are labelled
separately from public transport. Simulator/emulator evidence does not establish
physical protected storage, protected identity switching or full MVP acceptance.

The final expanded matrix passes 22 SDK/native checks per host. Normal signed
State/Feed admission passes 14 per host and independently checks nine original SDK
results. It covers first-open decline, separate list consent, remembered access,
cold older-cache fallback, refresh, Settings revoke and confirmed public-only user
switching. The new user must approve the napplet domains separately before reads;
returning to the original user restores only that user's own grants and cache.

Identity54, capabilities55, query16, storage92, security349 plus bootstrap13,
shell27, subscriptions12, resources23, uploads51 and quality-verifier58 regressions
pass. Chromium/WebKit runtime162, State Lab56 and Feed Lab12 pass. Conformance CLI
boot checks pass with its five declared lifecycle/wire omissions per fixture;
those omissions are not counted as native proof. Both ordinary exports, Android
prebuild/ARM64 Release and unsigned generic iPhoneOS Release compile pass.

React Doctor is 100/100 and aislop is 99/100 with zero warnings and the sole
visible Forge finding. The root audit remains red for that exact advisory; eight
other audits are clean. The only authorized quality exception is the exact
[locked node-forge patch](dependency-patches.md). The strict ordinary gate remains
red; the separate exception review verifies complete fresh reports, source/tool
hashes, coverage and installed patch closure. See [phase verification](../.planning/phases/02.5-public-identity-data/02.5-VERIFICATION.md).
No source push or public fixture publication is implied by these checks.

## Trusted shell avatar

The ordinary identity owner shares this verified profile resolver with the header
through an app-only `readProfile` method. The guest wire and native registration,
list approval, cache signature checks and replacement ordering are unchanged;
the shell does not manufacture a napplet registration to read its own profile.

A process-owned store captures the selected public key and session epoch, starts
without blocking the workspace, and cancels pending work immediately on identity
transition or recovery. Background and unmount clear the in-memory image and abort
the request; foreground return reads the profile again under the existing five-minute
verified-cache policy. Only one selected image is retained, with a forty-second
outer lifetime limit in addition to the existing profile and native request limits.

Picture URLs must pass public HTTPS preflight and the existing app-only native
public-address, DNS pinning, TLS, foreground and deadline checks. That transport
requires a successful direct response; a redirect or denied destination produces
the local fallback. Its two-MiB body bound and canonical Base64 checks precede
existing PNG/JPEG/WebP/GIF admission, which caps canvas dimensions at4096 on each
axis. Raster admission checks headers; the platform codec still owns full decode
and its error also selects the fallback. SVG and other document/media types are
not avatar sources. A signed profile authenticates its picture URL, not the image
content served at that URL.

Expo Image receives a local data URI with disk/memory caching disabled and animation
autoplay disabled. The two-character npub fallback is deterministic. Image failure
tracks the failed source. The native operation UUID also keys the avatar component,
so a replacement remounts for the same identity and late codec errors from its
predecessor cannot hide it. This key never grants a guest native authority.
No profile URL or app-only native transport is granted to a WebView.

Shared contract regressions cover verified cache sharing/cold reopening, missing,
malformed and forged profiles, URL/body/type/dimension admission, native cancellation,
late identity/background replies and same-identity source replacement. Physical
available-image, codec-failure, identity-switch and restart evidence remains UX-02
in Phase2.11; shared tests and packaging alone cannot pass that row.
