# Roadmap

## Phases

GSD numbers start at 1: GSD phase 1 is phase zero; GSD phase 2 is the seed's phase 1;
GSD phase 3 is the seed's phase 2. Product sequencing is unchanged.

- [x] **Phase 1: Development baseline** — phase-zero tooling, scaffold and checks.
- [ ] **Phase 2: Independent Android and iOS proof** — seed phase 1 acceptance and device evidence.
- [ ] **Phase 3: External signing** — seed phase 2 NIP-55 and NIP-46 integrations.

## Phase Details

### Phase 1: Development baseline
**Goal:** A reproducible native build path and an inspectable engineering baseline.
**Depends on:** Nothing
**Plans:** 1 plan

- [x] 01-01: Set up tools, scaffold, checks and native build evidence.

### Phase 2: Independent Android and iOS proof
**Goal:** Complete the v1 acceptance journey on both Android and iOS with local standalone builds.
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

### Phase 3: External signing
**Goal:** Add Android signer-app and relay-based remote signing without changing napplet authority.
**Depends on:** Phase 2
**Plans:** TBD

Later social/DM/zap/notification ordering remains open. iOS is part of v1.
