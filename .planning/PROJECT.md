# Hypergolic

## What This Is

A minimal Android and iOS shell for focused Nostr napplets. The first local Expo/React Native
foundation runs napplets through a restricted native Kehto host. The MVP now includes
relay reads, resources, uploads, identity data, links, cooperating napplets, shell
notifications/configuration and outbox. Implementation and platform evidence
are partial; the complete product has not passed acceptance. The execution sequence
is in `.planning/ROADMAP.md`; fixtures are tracked in `docs/test-napplets.md`.

## Core Value

Run a napplet while the shell retains control of identity and privileged operations.

## Requirements

### Validated

Full MVP acceptance remains open. Existing scoped evidence is recorded in `docs/architecture.md` and the linked checkpoints.

### Active

- [ ] Build, install and run the complete v1 journey on Android and iOS without Metro or Expo hosted services. Preserve local build/signing routes for both.
- [ ] Complete the existing identity, verified napplet, import, publication, restart, and denial acceptance checks.
- [ ] Deliver CAP-01–CAP-12 and CAP-14, with automated fixtures and native Android/iOS evidence.

### Out of Scope

External Nostr signers remain post-MVP phase 3. Dedicated bundled feeds/profile/wallet
applications, encrypted DMs, catalogue/marketplace, OS push, and capabilities beyond
Value remain outside the accepted baseline. Payment rails/provider and recovery
model must be selected in post-MVP phase 4; payments, zaps and Value Lab are excluded from MVP.
Android and iOS are both required. App-store publication remains separate.

## Context

`docs/architecture.md` records confirmed requirements, implemented architecture and
open implementation decisions. Do not duplicate its checklists here.

## Key Decisions

| Decision | Rationale | Outcome |
| --- | --- | --- |
| Expo/React Native, Kehto, Applesauce | Confirmed seed direction | First native theme trace; full shell pending |
| Android and iOS in v1 | Explicit platform correction, 15 September 2026 | Android first trace measured; iOS host and full parity pending |
| Maximum code-quality scores | Explicit user requirement, 15 September 2026 | React Doctor 100/100 and aislop 100/100 required on final code |
| Capability scope through Outbox | Scope corrected 30 September 2026 | MVP: 2.1–2.9 and 2.11; Value moved to post-MVP phase 4 |
| No security implementation in setup | Key protection and capability policy unresolved | Enforced by scope |
