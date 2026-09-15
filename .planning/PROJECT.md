# Hypergolic

## What This Is

A minimal Android shell for focused Nostr napplets. The first local Expo/React Native
trace runs bundled UX Lab through a restricted native Kehto host. Identity, signing,
multi-napplet UX and published delivery are planned in phase 2; the complete product
has not passed acceptance. Test fixtures are tracked in `docs/test-napplets.md`.

## Core Value

Run a napplet while the shell retains control of identity and privileged operations.

## Requirements

### Validated

None yet. Phase-zero build evidence is in `docs/phase-zero.md`.

### Active

- [ ] Independently build, sign, install, and run the Android proof APK without Expo hosted services.
- [ ] Complete the seed's identity, verified napplet, import, publication, restart, and denial acceptance checks.

### Out of Scope

External signers are phase 2. Feeds, DMs, payments, marketplace, and iOS proof do not
block the first Android milestone. Zaps remain wanted later.

## Context

`docs/architecture.md` records confirmed requirements, implemented architecture and
open implementation decisions. Do not duplicate its checklists here.

## Key Decisions

| Decision | Rationale | Outcome |
| --- | --- | --- |
| Expo/React Native, Kehto, Applesauce | Confirmed seed direction | First native theme trace; full shell pending |
| Native Gradle APK first | Preserve independently controlled build and signing | Native proof pending |
| No security implementation in setup | Key protection and capability policy unresolved | Enforced by scope |
