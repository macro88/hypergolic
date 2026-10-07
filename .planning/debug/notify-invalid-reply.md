---
status: resolved
trigger: Physical iPhone oversized notification remains awaiting a result
updated: 2026-10-07
---

# Invalid notification reply

Observed: the first ordinary physical SDK run passes eight checks, then its
25-second oversized-result assertion fails. The actual guest still displays
Awaiting oversized SDK result. This is not an indefinitely observed wait.
The earlier Simulator driver allowed35 seconds; its false accepted result alone
does not prove a timely native denial or classify the timeout source.

Hypothesis confirmed: the captured-frame validEnvelope gate rejects the payload
before the notification adapter. Both browser engines reproduce the missing
prompt result. Moving validation handling into the adapter alone does not repair
that upstream gate; that second failed reproduction is retained.

Fix under verification: return a bounded correlated denial only to the current
trusted registered frame with notify access. Capture the header using existing
plain-data, byte/depth/node, exact-field and ID validation. Foreign authority,
accessors, unknown operations and unbounded messages get no reply. Invalid data
acquires no native operation. Count all incoming messages under the existing
64-per-second limit. Adapter validation uses the same denial helper defensively;
normal native send and lifecycle revocation checks remain.

Chromium and WebKit pass the unchanged prompt-denial regression after the gate
fix, followed by a positive SDK send. Shared rejection-header tests pass. Fresh
normal signed iPhone build and the original physical13-check rerun remain needed.
The failed run's bundled test grant is cleaned only through trusted Settings.
No retained key read/export, data clear or source push is authorized by this work.


Resolution: both browser engines pass and physical attempts02/03 plus final05
observe the correlated denial. Final05 is a single green13-check notification
run. Follow-up background/Settings observer failures are independent and retained;
they are repaired with explicit OS states and padding-based public input. Full
CAP-14 remains open. No typed/generic subagent or independent critic is claimed.
