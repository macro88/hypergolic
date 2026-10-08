---
status: investigating
phase: "2.11"
---
# Approval review does not resume visibly after an iOS interruption

Expected: native interruption pauses pending review; foreground presents an
explicit Resume control. Observed: original SDK requests remain pending without
review or Resume in warm runs. Cold process restart clears old requests and a
fresh request reviews successfully. Five scoped process-death checks pass.

Source finding: ApprovalTransport observes willResignActive and pauses native
review. ApprovalWorkspace observes active/background but ignores inactive.
This mismatch is confirmed in source; the cause of every warm stall is not yet
proven. Preserve native pause and explicit user resume; align shared state.

External observer failures: initial text-selection assumption, page-specific
Control Center Flashlight assumption, and retained-overlay assumption after
app activation. Those incomplete attempts are not passed acceptance tests.

Next: cover inactive/active with the real ApprovalService, rebuild the owned QA
app, run a controlled interruption and exact original SDK review, then repeat
cross-session queues with pending badges deduplicated by actual view origin.
Full SIGN-02/03/04 and published UX-09 remain open. No independent native signer
or frame counter proof is inferred from individual Reject or absent approvals.
