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

The integrated core also provides bounded string storage and atomic accepted-version
copy/selection/receipts. It retains the original version and checks exact copied
rows and bytes in one transaction. These ports are **not yet exposed to napplets**:
the [native admission broker](native-capabilities.md) and generation checks are
implemented, but the trusted owner, catalogue and runtime still need connection
before the capability is available. Identity switching must
revoke old bindings and rebuild the loaded sessions before these ports can be used
under another identity.

Workspace persistence stores descriptors, not live WebView state or approval
requests. Drafts still need a napplet's saved-data capability to survive termination.
Identity import and rebinding are covered in the subsequent
[identity-switching checkpoint](identity-switching.md). Lazy restoration, published
descriptors and full standalone application acceptance remain open.

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
