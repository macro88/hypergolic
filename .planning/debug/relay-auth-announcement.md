---
status: resolved
trigger: Phase 2 relay authentication requirement audit
created: 2026-10-12
updated: 2026-10-12
---

# Optional relay AUTH announcements rejected as malformed

Inline GSD debug execution; no delegated or independent-agent audit claim.

## Symptoms and hypothesis

Both native read classifiers and the shared parser reject a valid NIP-42 string
AUTH announcement. Optional challenges can precede public history/EOSE, so this
rejection unnecessarily breaks discovery, queries and live subscriptions.

## Evidence

- Exact pinned NIP-42 a2494f4f81d46684e5814a9bf35e2b1df978f955 permits optional
  relay announcements and distinguishes authentication-required CLOSED/OK.
- Three shared regressions reproduce parser/query/stream failures before repair.
- Repair accepts only the exact string announcement inside existing bounds;
  shared adapters discard the challenge. No AUTH signing/reply path is added.
-46 affected shared cases,235 broader integration cases, TypeScript and both
  exports pass; Android native140/30/23/41 and Swift owning/arm64/TLS checks pass.
- Ordinary signed Android candidate builds with stable ID/certificate/permissions
  and original notices, without device installation. Full physical and quality
  acceptance remain open. See docs/relay-subscriptions.md for precise limits.

## Resolution

Root cause: optional NIP-42 announcements were classified as invalid NIP-01 frames.
Fix: accept their bounded exact shape as non-event input through all read adapters.
Verified: original regressions pass and malformed/frame-budget cases remain denied.
Open: actual full authentication-required/error UI journeys on both phones; no
full RELAY-02 completion is inferred from this resolved parser defect.
