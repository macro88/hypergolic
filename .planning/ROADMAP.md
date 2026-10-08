# Roadmap

## Phases

Scope corrected 30 September 2026: the MVP includes capabilities through Outbox.
Value transfers and zaps are deferred to post-MVP phase 4. Preserve phase-1/2 history; phase 2 is the native foundation. Decimal phases
2.1–2.9 expand the MVP; 2.11 accepts it before phase 3 external signing.
The retired 2.10 identifier is preserved as a gap to keep existing references stable. Phase cards below
are planning scope, dependencies and exit criteria; executable GSD PLAN files for
the later expansion phases require generation and verification. Select exact protocol revisions
and resolve each phase's material policy decisions before generating those files.

- [x] **Phase 1: Development baseline** — phase-zero tooling, scaffold and checks.
- [ ] **Phase 2: Independent Android and iOS proof** — native foundation and device evidence; full MVP acceptance is phase 2.11.
- [x] **Phase 2.1: Relay query and compatibility** — M; Feed Lab.
- [x] **Phase 2.2: Live relay subscriptions** — L; Feed Lab.
- [x] **Phase 2.3: Resource access** — L; Resource Lab.
- [x] **Phase 2.4: Uploads** — L; Upload Lab.
- [x] **Phase 2.5: Public identity data** — M; State Lab and Feed Lab.
- [x] **Phase 2.6: External links** — S–M; Resource Lab.
- [x] **Phase 2.7: Intents and inter-napplet communication** — M + L; Routing Lab pair.
- [x] **Phase 2.8: Notifications and configuration** — selected profile accepted; final physical/full MVP acceptance remains 2.11.
- [x] **Phase 2.9: Outbox routing** — implementation closed; remaining acceptance transferred to 2.11 on 5 October 2026.
- [ ] **Phase 2.11: Complete published MVP acceptance** — L; All MVP fixtures (excluding Value Lab) plus selected real napplets.
- [ ] **Phase 3: External signing** — post-MVP NIP-55 and NIP-46 integrations.
- [ ] **Phase 4: Value transfers and zaps** — post-MVP; L; Value Lab.

## Phase Details

### Phase 1: Development baseline

**Goal:** A reproducible native build path and an inspectable engineering baseline.
**Depends on:** Nothing
**Plans:** 1 plan

- [x] 01-01: Set up tools, scaffold, checks and native build evidence.

### Phase 2: Independent Android and iOS proof

**Goal:** Complete the existing native foundation journey on both Android and iOS with local standalone builds. The expanded MVP additionally requires phases 2.1–2.9 and 2.11.
**Depends on:** Phase 1 and decisions in `docs/architecture.md`
**Plans:** 7 plans. Order: 02-01 → 02-07 → 02-02 → 02-03 → 02-04 → 02-05 → 02-06.
The 15 September platform correction supersedes the earlier Android-only finish line.
The existing phase directory name remains unchanged to preserve references.

- [x] 02-01: Native host, real fixture trace and boundary checks.
- [ ] 02-07: Equivalent restricted iOS host, native trace and platform test driver.
- [ ] 02-02: Multi-napplet gestures, zoom overview and live state.
- [ ] 02-03: Protected identities, persistence and whole-shell switching.
- [ ] 02-04: Exact signing approval and controlled capability fixtures.
- [ ] 02-05: Verified published loading, explicit updates and editable relays.
- [ ] 02-06: Published fixture parity, security and standalone Android/iOS builds.

### Phase 2.1: Relay query and compatibility

**Mode:** mvp
**Effort:** M, including both native platforms, fixture and automation
**Depends on:** Working phase-2 runtime, grants and network boundary
**Requirements:** CAP-01, CAP-02
**Fixture:** Feed Lab
**Work and exit criteria:** Define the selected operation profile; implement bounded query/EOSE, validation, limits, cancellation and canonical errors. Verify known and empty results, invalid events and revoked ownership on both native hosts.
**Plans:** [02.1-01](phases/02.1-relay-query-and-compatibility/02.1-01-PLAN.md) implements the bounded query tracer. The selected query-profile exit passes on both native hosts, including the diagnostic SDK/lease fault matrix. Final published/physical/real-napplet integration remains phase 2.11. See [checkpoint](phases/02.1-relay-query-and-compatibility/02.1-01-SUMMARY.md).

### Phase 2.2: Live relay subscriptions

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** 2.1
**Requirements:** CAP-03
**Fixture:** Feed Lab
**Work and exit criteria:** Implement session-owned subscribe/close and bounded queues. Select background/reconnect behavior. Verify streams, duplicates, disconnects, flood, close, identity change and stale callback denial.
**Plans:** [02.2-01](phases/02.2-live-relay-subscriptions/02.2-01-PLAN.md) delivers the SDK/native live tracer and bounded fault proof; [02.2-02](phases/02.2-live-relay-subscriptions/02.2-02-PLAN.md) accepts the confirmed switching/background/reconnect lifecycle. Both plans pass the selected subscription-profile exit: eight real native WSS lifecycle checks and nine diagnostic SDK/native fault cases per platform, plus published read-view retention and full quality/audits. [Verification](phases/02.2-live-relay-subscriptions/02.2-VERIFICATION.md) preserves physical, older-WebView and full published MVP gates.

### Phase 2.3: Resource access

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** 2.2 sequence; HTTPS boundary and relay query for Nostr resources
**Requirements:** CAP-04
**Fixture:** Resource Lab
**Work and exit criteria:** Select resource schemes and cache policy; mediate bounded bytes/handles with DNS, redirect, MIME and integrity checks. Verify actual rendering, private-destination denial, oversize, cancellation and handle revocation.
**Selected scope:** HTTPS, SHA-256-verified Blossom, one-hop Nostr and embedded data, including bounded audio/video playback alongside images and attachments; memory-only caches while the napplet is loaded, with refetch after app restart. The resource grant permits any public HTTPS domain without per-file prompts; private/local destinations remain blocked. Blossom downloads use an editable default server list managed in trusted Settings; the [accepted resource profile](../docs/resource-access.md) records selected Primal/Satellite origins, validated redirects and exact engineering bounds. Playback pauses on switching/background, retains position while loaded and requires Play to resume. Streaming and large-file delivery remain separate unresolved work. Hashtree and SVG support are deferred gaps to revisit after Phase 4.
**Plans:** [02.3-01](phases/02.3-resource-access/02.3-01-PLAN.md) SDK/native HTTPS tracer; [02.3-02](phases/02.3-resource-access/02.3-02-PLAN.md) schemes, bulk, caches and settings; [02.3-03](phases/02.3-resource-access/02.3-03-PLAN.md) playback/lifetime and final quality. All three plans pass the selected bounded profile; [verification](phases/02.3-resource-access/02.3-VERIFICATION.md) records actual native bytes/playback and lifecycle evidence, quality gates and remaining final-integration limits.

### Phase 2.4: Uploads

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** 2.3; protected signing where required
**Requirements:** CAP-05
**Fixture:** Upload Lab
**Work and exit criteria:** Select upload contract/protocols/provider and consent. Bind exact bytes/hash/destination to approval; implement bounded upload and receipts. Verify cancellation, duplicate attempts, provider failures, identity changes and independently observed server bytes.
**Plans:** Four executable plans select the pinned draft/Blossom profile and confirmed product decisions. All four plans pass the selected native profile, including normal signed admission, picker/recovery and ordinary builds. CAP-05 is accepted under the owner-approved tested-patch exception for the sole visible tooling advisory; full MVP gates remain2.11. See [verification](phases/02.4-uploads/02.4-VERIFICATION.md).

- [x] 02.4-01-PLAN.md
- [x] 02.4-02-PLAN.md
- [x] 02.4-03-PLAN.md
- [x] 02.4-04-PLAN.md

### Phase 2.5: Public identity data

**Mode:** mvp
**Effort:** M, including both native platforms, fixture and automation
**Depends on:** 2.4 sequence; relay and resource services
**Requirements:** CAP-06
**Fixture:** State Lab and Feed Lab
**Work and exit criteria:** Inventory all recognized reads and backing kinds; implement selected public metadata/list behavior, cache and canonical missing/error semantics. Verify controlled data, stale cache, identity switching and no cross-user delivery.
**Plans:** Three sequential plans after the completed product interview; CAP-06 remains open.
**Wave 1**

- [x] 02.5-01-PLAN.md — Real profile/cache SDK/native tracer.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02.5-02-PLAN.md — Selected lists, separate permission and accepted badges.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02.5-03-PLAN.md — Signed admission, final native/quality acceptance and targeted commit.

**Selected acceptance:** All three plans pass. Final lists/permission/badges22 and
normal signed State/Feed14 pass per host, with both ordinary builds and full numeric
quality under only the approved Forge exception. See [verification](phases/02.5-public-identity-data/02.5-VERIFICATION.md).
CAP-06 is selected-profile complete; broad CAP-14 gates remain open.

**Cross-cutting constraints:**

- Selected behavior has genuine SDK/native evidence on both platforms before acceptance.

### Phase 2.6: External links

**Mode:** mvp
**Effort:** S–M, including both native platforms, fixture and automation
**Depends on:** 2.5 sequence; trusted native UI
**Requirements:** CAP-07
**Fixture:** Resource Lab
**Work and exit criteria:** Select schemes and confirmation rules; implement attributed user-controlled native opening. Verify malformed/forbidden URLs, cancellation, missing handler, floods and returning to the live napplet.
**Selected decisions:** HTTPS only; trusted approval for each opening; device normal handler. NAP-LINK proposal53 e251433 is the declared draft profile.
**Plans:** Three tracer-first waves complete; CAP-07 accepted for the selected native profile under the two approved locked dependency exceptions.
- [x] 02.6-01-PLAN.md — SDK/native HTTPS review/handoff/return tracer.
- [x] 02.6-02-PLAN.md — Validation, limits, lifecycle and failure boundaries.
- [x] 02.6-03-PLAN.md — Signed admission and final native/quality acceptance.

### Phase 2.7: Intents and inter-napplet communication

**Mode:** mvp
**Effort:** M + L, including both native platforms, fixture and automation
**Depends on:** 2.6 sequence; verified loading, workspace and grants
**Requirements:** CAP-08, CAP-09
**Fixture:** Routing Lab pair
**Work and exit criteria:** Select handler/default and permission policy. Prove role dispatch and exact payload delivery, then correlated messaging. Verify absent/ambiguous handlers, consent, forged sender, target closure, replay and revocation.
**Plans:** Four waves accepted; A1–G1 selected profile and CAP-08/CAP-09 accepted under the existing exact dependency exceptions; broader CAP-14 remains open.
- [x] 02.7-01-PLAN.md — Native-attested intent/review/ready-target tracer.
- [x] 02.7-02-PLAN.md — Cross-view topics and symmetric channels tracer.
- [x] 02.7-03-PLAN.md — Lifecycle, revocation, replay and fault boundaries.
- [x] 02.7-04-PLAN.md — Signed admission, persistence and final acceptance.

### Phase 2.8: Notifications and configuration

**Mode:** mvp
**Effort:** M + M, including both native platforms, fixture and automation
**Depends on:** 2.7 sequence; trusted UI and scoped storage
**Requirements:** CAP-10, CAP-11
**Fixture:** Routing Lab
**Work and exit criteria:** Select shell notification UX and supported config schema features. Implement attributed bounded notifications and scoped validated configuration. Verify flood/dismissal, defaults, restart, identity isolation and incompatible schema updates.
**Plans:** Four waves accepted for the A1-G1 draft profile under the exact existing dependency exceptions; CAP-10/CAP-11 accepted. Broader CAP-14 remains open.
- [x] 02.8-01-PLAN.md — Original SDK/native notification tracer.
- [x] 02.8-02-PLAN.md — Native encrypted configuration/editor/restart tracer.
- [x] 02.8-03-PLAN.md — Lifecycle, revocation and fault boundaries.
- [x] 02.8-04-PLAN.md — Final native, ordinary packaging and source-bound quality acceptance.

### Phase 2.9: Outbox routing

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** 2.8 sequence; relay and identity services
**Requirements:** CAP-12
**Fixture:** Feed Lab
**Work and exit criteria:** Pin NIP-65/outbox behavior, cache, fallback and fan-out. Verify authors on disjoint relays, role flags, missing/stale lists, destination policy and receipts. Freeze actual write destinations before approval.
**Closeout:** Plans 01–02 have scoped native acceptance; Plan 03 implementation is closed and its remaining tests plus Plan 04 acceptance are transferred by owner decision to Phase 2.11. CAP-12 final acceptance remains open. See [closeout](phases/02.9-outbox-routing/02.9-VERIFICATION.md) and [transferred acceptance](phases/02.11-published-mvp-acceptance/02.11-OUTBOX-HANDOFF.md).

### Phase 2.11: Complete published MVP acceptance

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** Implemented Phase 2 and 2.1–2.9; outstanding foundation and Outbox acceptance are included here.
**Requirements:** CAP-14
**Fixture:** All MVP fixtures (excluding Value Lab) plus selected real napplets
**Work and exit criteria:** Run the full published journey on standalone Android/iOS, close foundation/device gaps, verify update/restart/identity isolation, and satisfy both quality scores at 100/100. Record source/build/fixture/spec hashes and independent results.
**Plans:** Four sequential plans: [01 readiness/builds](phases/02.11-published-mvp-acceptance/02.11-01-PLAN.md), [02 verified published fixtures](phases/02.11-published-mvp-acceptance/02.11-02-PLAN.md), [03 full physical journeys](phases/02.11-published-mvp-acceptance/02.11-03-PLAN.md), [04 faults/final sign-off](phases/02.11-published-mvp-acceptance/02.11-04-PLAN.md). [Plan01 summary](phases/02.11-published-mvp-acceptance/02.11-01-SUMMARY.md) records passing ordinary signed physical Android/iPhone builds and first input/public-identity cold-process tracers. Plan02 has ten unsigned verified release candidates; owner publisher/signing access and public destinations/samples are still needed. The current physical matrix records UX-01, UX-03 and UX-06 passed on both phones. iPhone saved-data/last-empty UX-08 also passes in separate ordinary entry with primary live state retained; Android last-empty parity remains open: the separate signed Release is prepared, but installation is denied and the native journey has not run. Production profile-avatar wiring is repaired. iPhone UX-02 now passes its complete controlled profile/switch/restart journey; Android avatar parity remains open. Full restart/published-lazy, keyboard/Back, other physical/published/fault rows and final quality remain open. Historical first-tracer counts are superseded by the [current checkpoint](phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md). The [Outbox register](phases/02.11-published-mvp-acceptance/02.11-OUTBOX-HANDOFF.md) owns all unrun device, native fault, lifecycle, admission and packaging checks alongside CAP-14.

### Phase 3: External signing

**Goal:** Add Android signer-app and relay-based remote signing without changing napplet authority.
**Depends on:** Phase 2.11
**Plans:** TBD

Shell notifications and outbox are required MVP capability work.
Value/zaps and Value Lab are deferred to phase 4 and do not block MVP acceptance. Encrypted
DMs, OS push, additional payment rails and bundled product applications are not
implied. External Nostr signers remain post-MVP; wallet connectivity is a separate
Value architecture decision. iOS remains required throughout.

### Phase 4: Value transfers and zaps

**Scope:** Post-MVP; deferred on 30 September 2026
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** Phase 3 (delivery order), accepted MVP/outbox; selected wallet/rail model and protected native authority
**Requirements:** CAP-13
**Fixture:** Value Lab
**Work and exit criteria:** Choose provider/model/rails and pin contracts; implement quote, trusted review, send, status and restart reconciliation. Test fee/recipient changes, expiry, denial, lost replies, duplicate prevention, recovery, and distinct payment/zap-receipt evidence on both platforms.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

## Gaps to revisit after Phase 4

- **Hashtree resource support:** verified root/tree/chunk retrieval and decryption where applicable, fragment-key protection and native Android/iOS acceptance.
- **SVG resource support:** bounded rasterization without network access before delivery, with native Android/iOS rendering and denial tests. The selected Phase-2.3 profile rejects raw SVG.

These deferred resource extensions are outside the selected Phase-2.3 baseline and Phase-4 value scope. Recheck owning contracts and target napplet compatibility before implementing them. No new phase number or completion is implied.

## Planning and verification discipline

The accepted capability order is query → subscriptions → resources → upload →
identity data → links → intent/inc → notify/config → outbox → final MVP acceptance. Phase 3 external signing and phase 4 Value follow.
Admission accuracy and operation compatibility accompany every phase. Required
domain names alone do not prove complete operation support. Preserve specified
defaults/error shapes; do not invent protocol fields to signal unsupported features.

Each phase must resolve its spec/profile, limits and relevant product policy,
deliver one real SDK/native journey, expand selected operations, and pass success,
denial, lifecycle and fault tests on Android and iOS. Existing phase-2 evidence can
support implementation dependencies; outstanding physical-device acceptance stays
open until verified and blocks final MVP acceptance. Phase sizes are relative,
not calendar estimates. Later provider choices can change them.


8 October avatar checkpoint: ordinary trusted selected-profile wiring is repaired
in local27a3e4d, with29 new shared regressions, full current quality scope and both
signed Release builds. Physical valid/missing/broken/switch/restart UX-02 remains
unrun on both phones. Android's separate install restriction remains. This advances
implementation evidence only: still three of61 cross-platform rows complete,58 open;
Phase2.11 and Phase2 remain active under the about98% usage ceiling. See the Plan03
checkpoint and header-profile-avatar debug record. No source push.


8 October physical avatar checkpoint: all ten ordinary iPhone protected-import,
valid/missing/broken image, switch/cancel, foreground and real cold-process checks
pass. Twelve original screenshots and independent key/pixel comparisons confirm
the rendered result. iPhone UX-02 passes; Android remains unrun behind its separate
installer restriction. Other statuses and all61 requirements are preserved: three
cross-platform rows complete,58 open. Full Phase2.11/Phase2 and final quality remain
active. See Plan03 checkpoint. Local commit only; no source push.


8 October physical gesture checkpoint:17 ordinary iPhone native-input checks and
independent original video/frame review pass the full iPhone UX-04 drag requirement.
All six normal handle/card zoom pairs have actual two-column geometry evidence;
UX-05 stays partial until actual reduced-motion testing. Android parity and UX-10
remain open. All61 requirements and other statuses survive: three cross-platform
rows complete,58 open. Phase2/2.11 and final quality remain active. See Plan03
checkpoint. Local commit only; no source push.


8 October physical reduced-motion checkpoint: all9 ordinary iPhone native checks
pass with the actual OS switch enabled for six overview/card pairs and original
false restored. Independent original video/Settings review completes iPhone UX-05
with prior normal zoom/geometry proof. UX-10 keyboard/Back/VoiceOver and Android
parity stay open. All61 requirements and other statuses persist: three complete
cross-platform rows,58 open. Phase2/2.11 and final quality active. See Plan03
checkpoint. Local source commit only; no source push.
