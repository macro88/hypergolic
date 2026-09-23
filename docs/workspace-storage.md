# Workspace persistence checkpoint

The app now saves opening order, the last selected napplet and explicit empty state
under the selected public identity. It restores these descriptors before entering
the shell. A missing workspace starts with the approved embedded fixtures; an
existing empty row stays empty. Corrupt or unavailable saved descriptors stop
startup without replacing them. Only exact bundled fixture descriptors are
currently admitted; published loading and verification remain separate work.

The process-owned identity service opens one dedicated `hypergolic-shell-v1.db`
connection after the identity vault is ready. It is separate from identity metadata
and secret storage. Each binding captures the selected public key and checks the
vault selection/revision before and after asynchronous database work. The native
one-shot bootstrap still prevents a competing React Native runtime from reopening
these services in the same process.

The controller publishes cached, immutable snapshots through React's
[external-store subscription API](https://react.dev/reference/react/useSyncExternalStore).
The existing shell receives controlled workspace state. One save may run at a
time, with only the latest subsequent snapshot retained. Revision checks prevent
stale writes from overwriting newer data. A write failure revokes the binding,
keeps the loaded shell mounted and shows a recovery screen. A lost commit
acknowledgement remains uncertain until restart reads persisted state; it is not
retried as a fresh write or converted to an empty workspace.

SQLite uses the same dedicated connection for transactions, with WAL, FULL
synchronization, verified foreign keys and the requested iOS full-fsync settings.
These configuration checks are not physical power-loss or backup-security proof.
No private key enters this database. Saved napplet strings are ordinary text,
partitioned by user, publisher, stable app, version and shared/instance scope.

## Prepared storage capabilities

The integrated core provides bounded string storage and atomic accepted-version
copy/selection/receipts. Storage get/set/remove/keys are now available to reviewed
State Lab fixtures through the [native broker](native-capabilities.md). The trusted
owner binds every request to the current identity epoch, immutable descriptor and
live workspace membership. Confirmed identity changes rebuild all views; late old
callbacks cannot acquire another identity's storage binding.

New State Lab openings receive native UUID v4 instance IDs, which persist with the
workspace across process restarts. Closing and reopening obtains another ID even
when a display number is reused. Shared storage remains keyed by identity,
publisher, app and version; instance storage additionally uses that persisted ID.
Already-saved numeric UX Lab descriptors remain compatible. Accepted-version copy
transactions are prepared core operations; published update UX is still pending.

Workspace persistence stores descriptors, not live WebView state or approval
requests. A published descriptor includes its exact signed manifest event ID as
well as its coordinate owner and content version. Restore and storage decoding
reject a missing or malformed event pin, so recovery can only reverify the selected
manifest or show an error. An accepted version change updates the content version
and exact event ID atomically in the saved descriptor. Older published rows without
an event ID now fail closed and require recovery or explicit removal.
Schema migration preserves older accepted-update receipts with an unknown event pin;
replaying one cannot report success because its selected manifest cannot be verified.
Drafts still need a napplet's saved-data capability to survive termination.
Identity import and rebinding are covered in the subsequent
[identity-switching checkpoint](identity-switching.md). Published descriptors and
full standalone application acceptance remain open.

## Verification

- `pnpm run test:storage`: 62 real-SQLite and controller tests pass, covering
  namespace isolation, quota bounds, prepared SQL parameters, corruption, cancellation,
  version continuity, lost acknowledgements, actual Node process restarts, rapid
  UI changes, explicit-empty restoration and rejection of unavailable descriptors.
- Android: `tests/native/workspace_restart.py` passed against the normal debug app
  without clearing data. A fourth fixture reopened after cold launch; all four
  retained opening order; each closed through the normal warning; empty state
  survived another cold launch. The public identity and installed APK were unchanged.
- iOS: `tests/native/ios-driver.py workspace-restart` passed the corresponding
  journey in a separate standalone Release fixture with real Expo SQLite and the
  actual shared controller/shell. Two public XCTest terminate/launch cycles were
  observed. The fixture contains a labelled public identity and no key/signing
  modules; this does not establish production iOS identity storage or authentication.

Both final empty-state screenshots were inspected. Private receipts are in
`.tools/evidence/workspace-checkpoint-20260915`; full raw native artifacts remain
separately preserved. After native execution, one trailing space in the SQL schema
source and the Android harness's inherited limitation wording were corrected;
these edits change no operation or assertion. Physical-device checks and the
React Doctor external numeric score remain open. Full local aislop is 100/100 and
React Doctor has zero findings, without suppressing source or lowering gates.

## Lazy restoration checkpoint

The restored workspace now starts only its last focused napplet. Other saved
entries show “Open to load” in overview until selected. A visited napplet stays
mounted while focus/settings/overview change; only closing or an identity epoch
change discards that live view. This follows UX-09 without changing saved order,
instance IDs, the explicit-empty model or the native capability limits.

The previous eager startup intermittently left the focused iOS State Lab with
“No identity selected”. A clean launch passed once and then reproduced the failure;
those failed runs remain preserved. Startup request contention is a plausible
cause (native admission is globally bounded), not a directly instrumented finding.
After lazy restoration, three consecutive XCTest process-restart runs each passed
identity connection, exact deletion review, unavailable-authentication denial and
live-draft retention after cancellation. Both rebuilt platforms also pass the
three-check State Lab close/reopen shared/instance-storage journey.

Current Android APK: `cec0ebf35cad2c4db95e371712710d8b3c4b5456a6b81c539f741d0620120c4b`.
The iOS public-only fixture input seal is
`9193c7d41f56eff98194c375a7285f9ae3f8d7d55a1d42d99ad6f4a659a68c5a`.
Its native identity/secret modules remain absent. This is Simulator UI/runtime
proof; protected iOS keys and authentication still require physical-device proof.
Raw receipts: `/private/tmp/hypergolic-ios-delete-unavailable-06` through `-08`,
`/private/tmp/hypergolic-lazy-ios-close-01` and
`/private/tmp/hypergolic-lazy-android-close-01`. TypeScript and 25 shell tests pass;
full aislop remains 100/100 and local React Doctor has zero findings/no numeric score.

## First-open grant storage checkpoint

Schema v3 adds one revisioned capability grant per selected user, verified
publisher and stable napplet ID. The trusted shell binding can read, replace or
revoke the exact reviewed capability set with revision compare-and-swap. It
canonicalizes NAP capability identifiers (for example `theme` and `storage`),
snapshots caller input before asynchronous work, and rejects malformed persisted
sets. Existing v1/v2 databases migrate without replacing workspace or app data.
The 89-test storage suite covers isolation, conflicts, migration and corruption.
The first-open review UI and decision gate remain to be connected; a stored grant
alone does not authorize a napplet.
