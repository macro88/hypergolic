---
status: fixed-android-physical-ios-pending
trigger: original Routing Lab schema rejection returns negative ACK but no SDK error callback
updated: 2026-10-09
---

# Configuration schema-error callback

Expected: selected NAP-CONFIG at448013e6 requires config.schemaError after rejected
registerSchema, alongside its negative ACK. Observed: secret-default and pattern
registrations failed through the actual Android SDK, while config-errors stayed
empty. The valid stored values remained unchanged.

Root cause: ConfigBroker registration catch returned its negative ACK only. The
runtime native-reply fallback likewise lacked the error push. The external broker
regression failed against the original source and passes with the repair.

Repair: push the canonical bounded error to the captured live endpoint/generation
and return the correlated negative ACK. Preserve revision/sender/revocation checks.
The runtime fallback reports both on malformed/failed native replies; ordinary
broker negatives do not traverse this fallback and do not duplicate the push.

Verification: presentation35/35, Outbox100/100, Chromium/WebKit12/12, typecheck,
signed ordinary Android Release and both production exports pass. Six original-SDK
physical Android checks prove exact callback codes/counts, preserved values/live
subscription, no peer error and forged-control refusal. Same-ID update preserves
public identity/empty workspace; both temporary views close. No injected SDK UI.
Physical iOS callback parity and complete configuration secret/update/fault/
published acceptance remain open. The separate cold Settings first-press defect
is neither attributed to this defect nor claimed repaired.
