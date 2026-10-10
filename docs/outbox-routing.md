# Outbox routing

Phase 2.9 implementation is complete. On 5 October 2026 the owner moved its remaining physical-device, fault, lifecycle, published-admission and build acceptance into [Phase 2.11](../.planning/phases/02.11-published-mvp-acceptance/02.11-OUTBOX-HANDOFF.md). CAP-12 final acceptance and full MVP acceptance remain open.

## Selected contract and policy

NAP-OUTBOX PR32 is pinned to `4589a8f9a16d8aa29b3740e2b3b0cdca11e0976e`; NIP-65/NIP-01 to `0046368a747c5c25ae2bec28bae0e537744c8f10`. This is a selected draft profile, not full stable-domain conformance. [Context](../.planning/phases/02.9-outbox-routing/02.9-CONTEXT.md) records D-01–D-09 and their rationale; [research](../.planning/phases/02.9-outbox-routing/02.9-RESEARCH.md) records the source comparison.

Original SDK getEvent/query/resolveRelays/subscribe/close/publish use the trusted native host. Outbox requires both outbox and relay grants. Lookup relays discover verified signed kind10002 lists; data reads use author write relays and required recipient publication uses inbox read relays. Replacement winners follow NIP-01, including lowest lexical ID for equal timestamps. Signature/filter checks apply to stored and network data. Private/local/insecure destinations remain denied by the existing native DNS/TLS/public-WSS policy.

The identity-specific persistent list cache is fresh for 24 hours after a successful verified lookup. Reads may retain verified stale data for up to seven days while refreshing. Missing/failed discovery or authorless reads use bounded Network fallback and validated hints, reporting incomplete results truthfully. Publication refreshes expired metadata before review and refuses stale required routing. Missing own usable metadata permits labelled Network fallback; missing required inbox metadata blocks before review/signing.

## Review, publication and receipts

Before trusted review, freeze the exact unsigned primary template and the full unique union of own write, explicitly requested inbox read and explicit relay destinations. Bounds are 64 authors and 16 unique relay destinations; required fanout is never silently truncated. No automatic p-tag recipient inference is selected. toOutbox:false skips own discovery and own-list redistribution while explicit and required inbox destinations still apply.

Each new primary event needs exact approval. The native owner binds reviewed event/hash/identity/source/targets, freezes the signed primary bytes once, consumes each approved group/relay pair once and checks revocation at final emission. Fanout uses at most four concurrent connections and a shared 15-second deadline. The complete signed EVENT frame must fit 8192 bytes, including UTF-8, escaping and signature overhead; an oversized existing ancillary list denies review rather than disappearing.

The exact existing verified signed own kind10002 may be a separately reviewed ancillary item, sent only to approved destinations. No new list signature, automatic list creation or unrelated indexer broadcast occurs. This selected redistribution policy extends the pinned draft's at-most-one-signed-event rule, even though only one new event is signed. It must not be described as strict draft conformance.

Primary success requires every required inbox relay to accept; without required inboxes, at least one primary ACK is needed. An unrelated ACK cannot compensate for a rejected, unknown or cancelled required inbox. The existing-list receipt group has independent outcomes and cannot reverse primary acceptance. Native trusted UI distinguishes accepted, rejected, unknown and cancelled-before-send. ACK means relay acceptance, not recipient consumption. Original SDK failures retain their selected canonical error shape. No automatic retry occurs; a retry requires a new review.

Read/stream connections stay live across loaded foreground switches. Background closes them and foreground refreshes routing before reconnecting. Close, update and identity changes revoke old authority. Publication uses the focused approval lifecycle; switching invalidates approved publication. Upload's separate permission to continue across switches does not extend to publication. Pending reviews are distinct: background pauses them until explicit native resume, retaining the unchanged reviewed event within the bounded pending lifetime. The physical [pending lifecycle subset](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md#pending-outbox-review-lifecycle) observes this pause/resume, loaded-view attribution, rejection/dismissal, process death and separate requester close. It does not establish complete approved/in-flight revocation or zero native signer/emission counters.

## Existing proof and remaining acceptance

[Plans 01–02](../.planning/phases/02.9-outbox-routing/02.9-02-SUMMARY.md) record actual Android/iOS native read/stream journeys. [Plan 03](../.planning/phases/02.9-outbox-routing/02.9-03-SUMMARY.md) records actual native core/TLS/presentation evidence and production Android emulator protected signing, cold recovery, separate ancillary receipts, required-inbox failure, overflow and background subsets. Independent clients verified exact signed primary events; source and installed product hashes are sealed. Retained failed or inconclusive attempts remain explicitly separate.

Those earlier proofs do not establish complete physical published/fault acceptance. The current [Phase2.11 checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-02-CHECKPOINT.md#physical-iphone-protected-publication--7-october-2026) adds ordinary bundled protected explicit-only publication on both physical hosts, with exact native review and independently verified live/stored signed events. Final published Outbox admission and the remaining fanout/lifecycle/fault rows stay open. The production iOS identity store excludes Simulator; never substitute a fixture signer. Phase 2.11 owns every open row, including ordinary exports/prebuilds/packages and physical input/accessibility. Complete source quality keeps only the two existing explicitly approved locked-patch exceptions visible; gates and findings are not suppressed.

Checks already used for implementation include `pnpm run test:outbox`, `pnpm run typecheck`, original SDK Chromium/WebKit suites and the native runners documented in [tests/native/outbox](../tests/native/outbox/README.md) and [publication proofs](../tests/native/outbox/publication/README.md). Packaging alone cannot establish device acceptance.


The [physical owning transport checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-04-CHECKPOINT.md#physical-owning-publication-transport)
adds eight actual owner/approval/WSS cases in a separate iPhone QA app, with an
independent exact EVENT observer and zero frames after final native revocation.
Only HYPERGOLIC_NETWORK_PROOF builds can redirect that proof to a controlled
address/certificate anchor. Ordinary public relay policy remains compiled by
default. These already signed fixtures do not prove protected signing, owning
Expo composition or complete lifecycle/fault acceptance.


The current physical Android bundled subset verifies disjoint role discovery,
separate primary/existing-list receipts and a required-target failure despite
unrelated acknowledgements. Exact stored event signatures are independently
verified. Feed Lab's JSON editors now preserve typed routing keys on that device;
previous saved bytes retain their original pin. See the [current checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md#feed-lab-json-input-and-physical-outbox-routing--10-october-2026).
Full all-required success, controlled transport/effect counters, lifecycle/cache,
iPhone and signed published acceptance remain open.
