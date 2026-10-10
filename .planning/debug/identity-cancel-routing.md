---
status: verifying
trigger: Physical configuration acceptance found no-schema after cancelled identity selection
created: 2026-10-10
updated: 2026-10-10
---

# Identity cancellation revokes routing state

## Symptoms

Expected: cancelling saved identity selection keeps the same session, configuration
schema, saved values and subscriptions. Actual: the genuine physical Android SDK
read times out and receives config.schemaError with code no-schema. The run passed
three checks before failing; cleanup restored exact defaults and the original empty
workspace. Only public development markers were used.

## Current Focus

hypothesis: bindRoutingOwner withdraws owner availability during confirming even
though IdentityTransition.sessionAuthority explicitly permits that phase.
next_action: Run the corrected all-instance identity oracle, then obtain ordinary physical iPhone parity.

## Evidence

- Android ordinary SDK failure and original XML/PNG show the no-schema event after
  Keep current identity. A cancelled selection alone was sent.
- ConfigBroker.refresh closes schemas/subscriptions when ownerAvailable becomes false.
- Both native registries increment revision only when user, epoch or availability changes.
- Native Settings removes review focus separately; trusted reviews remain blocked
  during identity confirmation. Preserving endpoints does not authorize a hidden commit.
- Source/helper/capture hashes and cleanup readbacks were independently verified
  before source edits. No confirmed switch was reached by the failed physical run.

## Resolution

Pending regression, fix, native packaging and physical rerun. This inline GSD
workflow does not claim specialized subagent execution or completed MVP acceptance.

Both pre-fix regressions fail. The configuration composition returns no values
after cancellation; the import binding withdraws availability during confirming.
The binding now retains the same owner in ready/confirming, matching existing
session authority. Actual switching/deleting/recovery still withdraw ownership.


Shared regressions pass, including actual deletion/recovery routing denial. Both
native registry cores pass120 assertions. Both signed products pass; Android is
updated with its existing ID/certificate/data. Four ordinary SDK device cases prove
cancellation preserves values/schema/subscriptions. The fifth-case observer fails
parsing the original fresh empty event output, independently confirmed alongside
reads0. All original artifacts are retained; exact defaults, identity, empty state,
keeper inventory and bytes are restored. The corrected observer reads the declared
initial empty display directly; it does not re-register after cancellation or relax
any saved-value, event-order, native identity or fresh-counter expectation.
