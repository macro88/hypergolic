# Plan 02-04 progress — 23 September 2026

Status: integrated, with bounded native evidence. Full milestone remains open.

The [signing checkpoint](../../../docs/signing-approval.md) records the connected
native admission/reply lane, immutable event review, protected selected-identity
signing, catalogue-bound owner and revocable Applesauce publication. Approval Lab
uses its exact standalone SDK artifact in the native catalogue.

Android API 36 passes visible approval to three loopback relay paths with identical
independently verified EVENTs; rejection sends no frames. Relay rejection,
auth-required without AUTH and post-send unknown outcomes match SDK/native UI.
Held connections released after background revocation send no frames. Both Android
and iOS pass review, rejection, dismissal/resume and pending-background checks.
iOS uses a labelled public-identity Release Simulator fixture with signing and
protected storage unavailable; physical iOS signing remains unproven.

The native journey exposed a catalogue publisher mismatch, now fixed using the
same resolver for native registration and approval ownership. Its actual workspace
regression passes. Earlier harness input/title/accessibility failures are retained
separately; they are not acceptance evidence.

Checks: 344 security, 13 bootstrap, 31 capability, 80 storage, 25 shell, 6 local-wire,
146 Android owning assertions, 11 Swift transport tests, 82 runtime and 32 standalone
browser checks pass. Standalone conformance: five pass, five explicit skips. Final
isolated native builds compile. Aislop is 100/100 with no findings; local React
Doctor has no findings and no approved external numeric score. Dependency audits
are clear; the retained Expo 57.0.20 patch-version Doctor mismatch remains.

Next: finish iOS protected signing and the native fault/network policy matrix,
older Android and physical security acceptance, then verified remote loading and
updates. No source push or remote change. User's pause threshold is 50% weekly
consumed; latest check 46%. Normal Android and iOS Release entries also build; the restored
Android entry passes review/lifecycle. The separate Android backup PIN/expiry
acceptance now passes, recorded in the identity checkpoint.
