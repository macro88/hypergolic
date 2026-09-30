# Roadmap

## Phases

Scope corrected 30 September 2026: the MVP includes capabilities through Outbox.
Value transfers and zaps are deferred to post-MVP phase 4. Preserve phase-1/2 history; phase 2 is the native foundation. Decimal phases
2.1–2.9 expand the MVP; 2.11 accepts it before phase 3 external signing.
The retired 2.10 identifier is preserved as a gap to keep existing references stable. Phase cards below
are planning scope, dependencies and exit criteria; executable GSD PLAN files for
the expansion have not been generated or verified. Select exact protocol revisions
and resolve each phase's material policy decisions before generating those files.

- [x] **Phase 1: Development baseline** — phase-zero tooling, scaffold and checks.
- [ ] **Phase 2: Independent Android and iOS proof** — native foundation and device evidence; full MVP acceptance is phase 2.11.
- [x] **Phase 2.1: Relay query and compatibility** — M; Feed Lab.
- [x] **Phase 2.2: Live relay subscriptions** — L; Feed Lab.
- [ ] **Phase 2.3: Resource access** — L; Resource Lab.
- [ ] **Phase 2.4: Uploads** — L; Upload Lab.
- [ ] **Phase 2.5: Public identity data** — M; State Lab and Feed Lab.
- [ ] **Phase 2.6: External links** — S–M; Resource Lab.
- [ ] **Phase 2.7: Intents and inter-napplet communication** — M + L; Routing Lab pair.
- [ ] **Phase 2.8: Notifications and configuration** — M + M; Routing Lab.
- [ ] **Phase 2.9: Outbox routing** — L; Feed Lab.
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
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

### Phase 2.4: Uploads

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** 2.3; protected signing where required
**Requirements:** CAP-05
**Fixture:** Upload Lab
**Work and exit criteria:** Select upload contract/protocols/provider and consent. Bind exact bytes/hash/destination to approval; implement bounded upload and receipts. Verify cancellation, duplicate attempts, provider failures, identity changes and independently observed server bytes.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

### Phase 2.5: Public identity data

**Mode:** mvp
**Effort:** M, including both native platforms, fixture and automation
**Depends on:** 2.4 sequence; relay and resource services
**Requirements:** CAP-06
**Fixture:** State Lab and Feed Lab
**Work and exit criteria:** Inventory all recognized reads and backing kinds; implement selected public metadata/list behavior, cache and canonical missing/error semantics. Verify controlled data, stale cache, identity switching and no cross-user delivery.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

### Phase 2.6: External links

**Mode:** mvp
**Effort:** S–M, including both native platforms, fixture and automation
**Depends on:** 2.5 sequence; trusted native UI
**Requirements:** CAP-07
**Fixture:** Resource Lab
**Work and exit criteria:** Select schemes and confirmation rules; implement attributed user-controlled native opening. Verify malformed/forbidden URLs, cancellation, missing handler, floods and returning to the live napplet.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

### Phase 2.7: Intents and inter-napplet communication

**Mode:** mvp
**Effort:** M + L, including both native platforms, fixture and automation
**Depends on:** 2.6 sequence; verified loading, workspace and grants
**Requirements:** CAP-08, CAP-09
**Fixture:** Routing Lab pair
**Work and exit criteria:** Select handler/default and permission policy. Prove role dispatch and exact payload delivery, then correlated messaging. Verify absent/ambiguous handlers, consent, forged sender, target closure, replay and revocation.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

### Phase 2.8: Notifications and configuration

**Mode:** mvp
**Effort:** M + M, including both native platforms, fixture and automation
**Depends on:** 2.7 sequence; trusted UI and scoped storage
**Requirements:** CAP-10, CAP-11
**Fixture:** Routing Lab
**Work and exit criteria:** Select shell notification UX and supported config schema features. Implement attributed bounded notifications and scoped validated configuration. Verify flood/dismissal, defaults, restart, identity isolation and incompatible schema updates.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

### Phase 2.9: Outbox routing

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** 2.8 sequence; relay and identity services
**Requirements:** CAP-12
**Fixture:** Feed Lab
**Work and exit criteria:** Pin NIP-65/outbox behavior, cache, fallback and fan-out. Verify authors on disjoint relays, role flags, missing/stale lists, destination policy and receipts. Freeze actual write destinations before approval.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

### Phase 2.11: Complete published MVP acceptance

**Mode:** mvp
**Effort:** L, including both native platforms, fixture and automation
**Depends on:** Phase 2 and 2.1–2.9 accepted
**Requirements:** CAP-14
**Fixture:** All MVP fixtures (excluding Value Lab) plus selected real napplets
**Work and exit criteria:** Run the full published journey on standalone Android/iOS, close foundation/device gaps, verify update/restart/identity isolation, and satisfy both quality scores at 100/100. Record source/build/fixture/spec hashes and independent results.
**Plans:** Pending owning-contract research and phase-local decisions; no completion claimed.

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
