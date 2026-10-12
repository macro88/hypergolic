---
status: fixed-core-and-ordinary-android-ios-subsets-verified
trigger: Default Lookup discovery is incomplete; Damus WebSocket upgrade fails
updated: 2026-10-12
---

# Repeated upgrade response metadata

Inline GSD debugging; no separate-agent audit.

Observed Android source-bound public-DNS WSS queries at shell UID finish EOSE on
Purple Pages and nos.lol twice, but Damus fails upgrade validation twice. An explicit
one-print diagnostic before unchanged validation captures HTTP/1.1 101 with valid
upgrade fields and two Server-Timing fields. No app installation, settings write,
key access, signing or publication. The complete default discovery therefore
reports incomplete; the publication resolver correctly denies incomplete routing.
This reproduces one transport cause, not every historical ordinary-app failure.

Both Java and Swift validators reject all repeated names, including unconsumed
metadata. A new shared valid Server-Timing vector fails on both original validators.
RFC9110 section5.2 permits repeated list-valued fields; Server-Timing defines a list.
RFC6455 section11.3.3 requires a singleton Sec-WebSocket-Accept. The repair validates
syntax/limits for every line, permits repeated ignored metadata and retains the
existing singleton policy for Upgrade, Connection and Sec-WebSocket-Accept. It
retains nonce matching, forbidden extensions/protocol/redirect/body headers,
control/folding checks, TLS/DNS policy and all frame/session/authority checks.

Verified follow-up:31 shared native vectors per platform, owning WSS regressions,
TypeScript, Query20/20, Outbox102/102, required prebuild, both production exports
and signed Android Release. All3 physical source-bound default queries reach EOSE
twice. Same-ID ordinary Android SDK default read/write role plans and trusted own
publication review pass; Reject restores original context and helpers are removed.
The original SDK omits a completeness field; do not infer one from its projection.

Ordinary iPhone follow-up: signed same-ID update installs; original SDK default
read/write role plans pass. Separate final native tests pass exact default trusted
review, explicit Resume, Reject and full identity/UX Lab 7 restoration. Three
original failed observers stay failed; later corrections affect the observer only.
Runner absent and selected inventory/source/prepared product inputs preserve.
Installed iOS executable bytes were not read back.

Remaining: all original CAP-12 routing/cache/lifecycle/fault/published requirements.
Shell-UID EOSE alone cannot prove ordinary app/Expo/guest or protected publication.
Both physical ordinary routing/review subsets are now verified; do not close CAP-12
or Phase 2 from this repair. Original failed observers and successful proof remain
private in relay-upgrade-metadata01 and iphone-relay-upgrade01.
