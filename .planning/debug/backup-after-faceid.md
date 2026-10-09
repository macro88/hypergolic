---
status: awaiting-device-verification
trigger: Face ID succeeds but backup reports it was not completed
created: 2026-10-09
updated: 2026-10-09
---

## Symptoms

Owner reports successful Face ID followed by the trusted generic backup failure.
Physical public screenshot confirms the error and unchanged development npub;
no key was shown. Expected native backup panel after fresh authentication.

## Current Focus

hypothesis: LAContext can complete before UIKit returns active; the existing
presenter immediately rejects inactive state. This is not yet confirmed as the
specific device failure. Stored development key signed exact events previously.
next_action: Reproduce the strict-state rejection in source-linked tests, then
wait boundedly for active state before any backup-secret read, preserving native
liveness/cancellation/background/protected-data checks. Rebuild the same QA app
and require owner device retry without recording the key.

## Evidence

- Existing auth completion resumes immediately after invalidating LAContext.
- Native presenter requires UIApplication.active at entry and presentation end.
- Inactive intentionally does not revoke an outstanding native auth attempt.
- Apple documents asynchronous policy completion, not active UIKit readiness.
- Separate public-review/cancel checks passed; authenticated reveal did not.

## Execution

Inline GSD fallback; no subagent dispatch. Full Phase2 acceptance remains open.
Preserve main app, QA data/views and private key. No source push.

Controlled red: the strict immediate active-state check fails the delayed-active success and bounded-wait cases; four other cases pass. This demonstrates the rejection path, not the specific physical cause. Implemented live/cancellable five-second native wait before backup-secret read; six owning-source regressions cover active, delayed activation, revocation, background/protection loss, cancellation and timeout. No presenter guard is removed.

Green: all66 owning-source tests and shared353+13 pass. Signed normal Release compiles the real UIKit adapter; original QA/main products remain unchanged. Physical root cause is provisional until owner retry. Next: install same QA bundle, recheck public review/cancel, stop recording, then owner manually authenticates and reports whether the panel appears. No key returned to tools. Standard check retains six existing Expo mismatches.
