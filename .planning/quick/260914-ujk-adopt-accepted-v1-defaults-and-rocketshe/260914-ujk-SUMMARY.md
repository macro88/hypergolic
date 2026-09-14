---
quick_id: 260914-ujk
status: complete
mode: quick
execution: inline
code_commit: a3044503d831bb05895bad85ed8646a12ad8bc6a
---

# Accepted v1 defaults and RocketShell relay configuration

Recorded the accepted product rules for approval recovery, workspace restoration,
first-open publisher/access confirmation, explicit version updates, authenticated
key export/deletion, and editable local relays with automatic NIP-65 routing deferred.
The remaining source architecture gates identify engineering and device validation.

A fresh RocketShell checkout resolved main to
`0b46d9cf8369576f11d87b92aa5436920fdfcd87`. Its production platform constants and
first-run settings use three network relays and three lookup relays. The lists
are preserved by role and order in `src/config/default-relays.json`; source evidence
and seeding/integration semantics are in `docs/relays.md`.

Validation completed:

- Both JSON arrays match the inspected upstream constants exactly, including order.
- All six entries use secure WebSocket URLs without credentials, queries or fragments;
  each list has no duplicates, with four unique endpoints across both lists.
- `pnpm run typecheck` passed.
- Source documentation links and source/vault diff checks passed; staged source
  additions were reviewed for private paths, private-repository references and secrets.
- Config SHA-256: `810207ffb1be898000443a9fcd0b931837f99d2597c2deaabd304adbe7b5089d`.

This task adds configuration data and guidance. The static app does not yet consume
these lists or provide editable relay settings; no relay-health, authentication,
publishing or native security result is claimed. No app UI, dependency, protocol wire
surface or native configuration changed. No native build or full regression suite
was rerun for this data/documentation change. Existing iOS/ignore edits and Expo
57.0.20 were preserved. Source commits remain local.
