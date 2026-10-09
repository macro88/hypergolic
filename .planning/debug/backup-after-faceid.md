---
status: resolved-owner-confirmed
trigger: Face ID succeeds but backup reports it was not completed
created: 2026-10-09
updated: 2026-10-09
---

## Symptoms

Owner reports successful Face ID followed by the trusted generic backup failure.
Physical public screenshot confirms the error and unchanged development npub;
no key was shown. Expected native backup panel after fresh authentication.

## Current Focus

resolution: The owner confirms the updated backup retry worked after Face ID.
The observed failure is resolved on the physical iPhone. Controlled tests support
the inactive-UIKit rejection mechanism; callback timing was not recorded on the
phone. Keep broader ID-05 acceptance partial.
next_action: Close the owner-only backup panel before any automation; complete
authentication cancellation/unavailable, capture/background, exact manual
public-identity comparison and Android parity without collecting the private key.

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


## Owner verification — 9 October 2026

After the same QA app update and five rebuilt public review/cancel checks, recording
stops. The owner replies "yep worked" to the manual authenticated retry. Record
physical Face ID/reveal success as owner observation, without key collection or
an independently verified export/reimport. No device UI is accessed after the
reply because the backup panel may still be open. No other acceptance status
changes; six of 61 full requirements remain complete across both phones.
