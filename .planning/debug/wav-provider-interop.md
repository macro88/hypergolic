---
status: investigating
trigger: Physical iPhone approved WAV becomes unknown although exact public bytes are present
updated: 2026-10-08
---

# WAV provider interoperability

The ordinary protected-identity iPhone suite passes four checks, including native
transfer progress while a peer is focused, then fails its confirmation assertion.
The native HUD says outcome unknown. The attempted suite remains incomplete.
Independent public retrieval confirms the exact 4 MiB synthetic WAV after a 307
from the saved provider/hash to a public HTTPS audio host, served as audio/x-wav.
An unauthenticated list request gets 401. Raw PUT descriptor is not captured.

Hypothesis: the strict exact-MIME receipt check rejects a conventional WAV alias.
UploadWire.swift requires descriptor type equal to reviewed MIME; shared receipt
handling also requires equality. The served alias supports investigating this,
but does not establish what the upload response said. Loss, timeout, URL shape or
other descriptor rejection are not eliminated. No replacement upload is approved.

Established recovery incompatibility: both selected native recovery transports
refuse redirects. This observed GET307 cannot settle through that profile. A200
recovery settlement validates full body/hash/size and does not require exact MIME.
The MIME alias is therefore not a reason for rejecting recovery byte settlement.

Two recovery observers and one picker observer fail enabling XCTest automation
before test setup. Correcting the final process's Xcode directory/PATH does not
remove the timeout. No recovery persistence, duplicate block or picker result is
observed. Cold controllers clear ephemeral guest receipts; they must not be used
as if a pre-death SDK receipt were still available. Final owned runner check empty.

Next: obtain the owner choices for narrow WAV alias equivalence and guarded
read-only recovery redirects before changing selected protocol policy. Confirm
device UI automation readiness. Then test the durable record through ordinary UI,
implement accepted changes with both-platform owning regressions and repeat the
normal physical journey. Preserve the unknown record until native reconciliation;
do not change identity/server or clear data to bypass it.

No fix or quality/build rerun is claimed. NAP-UPLOAD a7cc174 and Blossom b5bd280
remain selected; source and local product seals unchanged. Full CAP-05, Android,
verified published parity and Phase2 acceptance remain open. Private originals:
iphone-upload-interruption01. GSD debugging used inline; no subagent proof claimed.


## Proposed decisions, awaiting selection

A. Accept audio/x-wav as equivalent to reviewed audio/wav only for a native-validated
WAV body with exact reviewed hash/size. Preserve the reviewed MIME in the SDK
result, record the provider descriptor type separately, and keep every other MIME,
metadata and URL check. Alternative: keep exact MIME string equality. Basis: the
exact provider WAV bytes are served with this conventional alias; MDN lists both
labels. The uncaptured PUT response still needs investigation after selection.

B. Permit at most two read-only public HTTPS recovery redirects, starting at the
saved provider/hash. Each destination must retain the same hash path (optional
bounded extension), have no credentials or query, and pass fresh public DNS/TLS
validation. Forward no authorization, signature or upload body. Keep the original
record identity/provider/hash, deadlines, byte limits, foreground/lifecycle leases
and exact full-size/hash settlement. Redirects must not authorize a retry. A404 at
an alternate host must leave the original unknown, because it cannot establish
absence at the saved provider. Alternative: keep recovery redirects denied. Basis:
the observed saved-provider GET307 prevents current recovery even though exact
bytes are public at its target. Approved PUT transfers still follow no redirects.

Required checks after selection: known WAV alias acceptance with unrelated MIME,
wrong bytes/hash/size/URL and stale authority denied on both hosts; redirect loops,
third hop, private/DNS-rebound hosts, credential/query/hash changes, alternate404,
truncation, expired/background/identity/replacement reads stay unknown. Verify the
existing physical unknown record through ordinary UI, then confirm a complete
native/SDK provider receipt without silently retrying the uncertain attempt.
