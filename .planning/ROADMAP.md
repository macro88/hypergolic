# Roadmap

## Phases

GSD numbers start at 1: GSD phase 1 is phase zero; GSD phase 2 is the seed's phase 1;
GSD phase 3 is the seed's phase 2. Product sequencing is unchanged.

- [x] **Phase 1: Development baseline** — phase-zero tooling, scaffold and checks.
- [ ] **Phase 2: Independent Android proof** — seed phase 1 acceptance and device evidence.
- [ ] **Phase 3: External signing** — seed phase 2 NIP-55 and NIP-46 integrations.

## Phase Details

### Phase 1: Development baseline
**Goal:** A reproducible native build path and an inspectable engineering baseline.
**Depends on:** Nothing
**Plans:** 1 plan

- [x] 01-01: Set up tools, scaffold, checks and native build evidence.

### Phase 2: Independent Android proof
**Goal:** Complete the seed's phase 1 acceptance checklist on a device.
**Depends on:** Phase 1 and decisions in `docs/architecture.md`
**Plans:** TBD after security and delivery decisions

### Phase 3: External signing
**Goal:** Add Android signer-app and relay-based remote signing without changing napplet authority.
**Depends on:** Phase 2
**Plans:** TBD

Later relay/social/DM/zap/notification/iOS ordering remains open as recorded in the seed.
