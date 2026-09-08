# Hypergolic

## What This Is

A minimal Android shell for focused Nostr napplets. This rebuild starts with a local
Expo/React Native development scaffold; no product behavior has been validated.

## Core Value

Run a napplet while the shell retains control of identity and privileged operations.

## Requirements

### Validated

None yet. Phase-zero build evidence is in `docs/phase-zero.md`.

### Active

- [ ] Independently build, sign, install, and run the Android proof APK without Expo hosted services.
- [ ] Complete the seed's identity, verified profile napplet, import, publication, restart, and denial acceptance checks.

### Out of Scope

External signers are phase 2. Feeds, DMs, payments, marketplace, and iOS proof do not
block the first Android milestone. Zaps remain wanted later.

## Context

`docs/architecture.md` records confirmed requirements, implemented architecture and
open implementation decisions. Do not duplicate its checklists here.

## Key Decisions

| Decision | Rationale | Outcome |
| --- | --- | --- |
| Expo/React Native, Kehto, Applesauce | Confirmed seed direction | Scaffold only; runtime integration pending |
| Native Gradle APK first | Preserve independently controlled build and signing | Native proof pending |
| No security implementation in setup | Key protection and capability policy unresolved | Enforced by scope |
