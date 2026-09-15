# Hypergolic

## What This Is

A minimal Android and iOS shell for focused Nostr napplets. The first local Expo/React Native
trace runs bundled UX Lab through a restricted native Kehto host. Identity, signing,
multi-napplet UX and published delivery are planned in phase 2; the complete product
has not passed acceptance. Test fixtures are tracked in `docs/test-napplets.md`.

## Core Value

Run a napplet while the shell retains control of identity and privileged operations.

## Requirements

### Validated

None yet. Phase-zero build evidence is in `docs/phase-zero.md`.

### Active

- [ ] Build, install and run the complete v1 journey on Android and iOS without Metro or Expo hosted services. Preserve local build/signing routes for both.
- [ ] Complete the seed's identity, verified napplet, import, publication, restart, and denial acceptance checks.

### Out of Scope

External signers are phase 2. Feeds, DMs, payments and marketplace remain later work.
Android and iOS are both required for v1. App-store publication is separate from
working local device builds. Zaps remain wanted later.

## Context

`docs/architecture.md` records confirmed requirements, implemented architecture and
open implementation decisions. Do not duplicate its checklists here.

## Key Decisions

| Decision | Rationale | Outcome |
| --- | --- | --- |
| Expo/React Native, Kehto, Applesauce | Confirmed seed direction | First native theme trace; full shell pending |
| Android and iOS in v1 | Explicit platform correction, 15 September 2026 | Android first trace measured; iOS host and full parity pending |
| Maximum code-quality scores | Explicit user requirement, 15 September 2026 | React Doctor 100/100 and aislop 100/100 required on final code |
| No security implementation in setup | Key protection and capability policy unresolved | Enforced by scope |
