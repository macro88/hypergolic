---
status: resolved
trigger: "complete phase 2 entirely"
created: 2026-10-12
updated: 2026-10-12
---

## Current Focus

hypothesis: A nested cleanup command or inventory exception escapes the observer's finally block before receipt persistence.
next_action: Use the portable repaired observer in the next fresh device batch after pending owner action; this precise host receipt defect is resolved.
execution: Inline Codex fallback; no typed debugger or independent-agent audit.

## Symptoms

expected: An initialized physical test batch leaves its primary result, each owned cleanup result, inventory/source verification and a final receipt even when cleanup fails.
actual: The identity-deletion retry's uninstall times out and exits the finally block before writing receipt.json.
errors: subprocess.TimeoutExpired during exact temporary-app cleanup.
timeline: Observed in the 12 October physical retry, after installation timed out while the old Face ID permission dialog remained visible.
reproduction: Execute the actual original observer finalization with a real child-command timeout, or with an unavailable inventory read; both suppress the receipt.

## Evidence

- timestamp: 2026-10-12
  finding: Original failed observer and exact source hash are preserved privately. The original two host reproductions fail their receipt-presence assertions.
- timestamp: 2026-10-12
  finding: Existing Android relay observer already catches cleanup errors before final persistence; the temporary iPhone observer lacks equivalent protection.
- timestamp: 2026-10-12
  finding: Prepared repair catches each cleanup error separately, attempts later owned steps, records command timeout/launch errors, and persists an atomic final receipt. Unknown inventory/source results remain null rather than successful.
- timestamp: 2026-10-12
  finding: Separate runner ownership starts only immediately before the XCTest command; an install failure cannot claim a runner it never attempted to install.
- timestamp: 2026-10-12
  finding: Fifteen host regressions execute the actual prepared command function and finalization AST. Real timed-out child termination is verified. They cover cleanup/metadata/source failures, malformed inventory, ownership, primary-failure preservation and guarded model success.

## Eliminated

- hypothesis: The receipt disappeared because its output directory was absent or unwritable.
  evidence: Both controlled original failures have writable owned temporary output directories; only nested failure flow suppresses persistence. Disk-full/power-loss/forced-host-kill durability is outside the repair's proof.

## Resolution

root_cause: Nested cleanup exceptions escape finally; commands are recorded only after subprocess success, and a shared ownership flag incorrectly includes an unattempted runner.
fix: Protect each owned cleanup and follow-up check; retain original journey/error fields; record unavailable verification as unknown; atomically persist regardless of caught cleanup failures; claim the runner only before actual XCTest dispatch.
verification: Host red/green runs pass for the named observer flow. Actual Face ID permission/authentication, installer settlement and physical device cleanup remain separate pending phase work.
files_changed: Private prepared observer only; application/native product code, dependencies, capability contracts and acceptance statuses are unchanged.

Independent follow-up confirms original hashes, all 15 green results, two original receipt-loss failures, and identical tested command/finalization AST after adding explicit CLI parameters. All 648 preexisting product inputs and all 132 local ready-product files remain unchanged. Originals, prepared driver and proof are byte-readback preserved privately. No device run occurs and no full native/physical requirement is promoted.
