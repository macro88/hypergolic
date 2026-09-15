# Identity import and whole-shell switching

Trusted Settings now lists saved identities and accepts trimmed nsec input. Invalid
input leaves the current identity and live napplets unchanged. The input is masked,
excluded from autofill, cleared before review, and unmounted when Settings closes
or the app leaves the foreground. Mutable decoding buffers are cleared; this is
not a guarantee of erasing immutable strings or every runtime copy.

Importing the selected identity is a no-op. Importing another saved identity uses
the selector without duplicating storage. A new identity is written and read back
through the existing protected vault. One confirmation names the destination npub
and explains that every loaded napplet will restart and unsaved work will be lost.
Keep current identity cancels the exact pending request. Stale confirmations cannot
accept a later request. No private key appears in transition snapshots or errors.

## Commit and failure behavior

The process-owned transition controller serializes selection. Confirmation freezes
workspace edits and waits for the last descriptor write before asking the vault
to persist the new selected identity. Session authority rejects operations during
that transition. Once selection is confirmed, the old workspace binding is revoked;
a fresh controller saves the current opening order and focus in the selected user's
namespace. The shell remounts every loaded napplet under a new identity epoch.
Existing saved napplet strings remain partitioned by identity. Returning to an
identity carries the currently loaded descriptors, with that identity's own data;
it does not resurrect a different set of previously closed views.

A rejected precommit validation keeps the same live shell and permits edits again.
Uncertain vault writes, failed source saves or destination workspace failures
require restart; the app cannot keep exposing the previous identity after durable
selection may have changed. Selection and workspace use separate databases, so
this does not claim a cross-database atomic transaction. Corrupt destination rows
are preserved and stop entry. The vault's existing journal determines recovery
of interrupted imports/selections without generating a replacement identity.

The old authority's identity, vault revision and epoch are checked on every use.
This narrow authority still needs to be connected to native storage and approval
registrations. Native napplets currently expose readiness/theme only; no signing
queue or napplet storage request is claimed delivered by this checkpoint.

## Native UI correction

Full-screen Settings and workspace-recovery modals provide their own safe-area
context. The iOS trace found that the inherited provider left Settings under the
status bar, so Done could be reported hittable while its coordinates overlapped
system UI. The fix follows the library's
[modal-provider guidance](https://appandflow.github.io/react-native-safe-area-context/api/safe-area-provider/).
The iOS regression compares the Done button against the actual visible fixture
safe-area baseline, then exercises dismissal. Screenshots require visual inspection.

## Evidence and limits

The integrated storage suite has 71 cases, including nine transition cases using
actual SQLite: invalid/cancelled input, duplicate imports, single-flight selection,
late workspace callbacks, stale authority, identity-isolated saved strings, explicit
empty state, validation rejection, source-write failure, corrupt destination state
and lost destination commit acknowledgement. Strict TypeScript and the existing
278 security, 13 bootstrap and 25 shell cases pass.

A separate Android Release installation uses the unchanged production identity,
SQLite and native host code. Its namespace and local test-signing configuration
isolate it from the normal app. The native journey passed masked input, invalid and
cancelled import retaining all three drafts, confirmed import resetting every loaded
session, duplicate import, saved selection, and inventory/selection/focus after a
cold launch. The original generated identity was retained, and only a publicly known
disposable key was imported. The first harness attempt failed on a zero-sized
offscreen draft node; the visible-node selector was corrected without app changes.

The corresponding iOS fixture contains the actual transition, Settings, shell and
SQLite controller with a labelled public-key-only test inventory. It stores no
secret and does not instantiate protected vault adapters. Its initial native run
exposed the modal safe-area bug before any identity change committed. The corrected
journey passes five checks, including Done below the observed 62-point safe-area
baseline, cancellation retaining all three counter/draft states, fresh sessions
after import, duplicate handling, saved selection and restart persistence. Final
confirmation and inventory screenshots were visually inspected. Android was rebuilt
with the same two modal-provider changes and passed Settings dismissal plus
identity continuity across two further cold launches; the vault/transition source
from its full import journey is unchanged. Normal iOS Simulator entry still
requires a physical iPhone; no test backend is available in production.

The complete local aislop scan is 100/100 and React Doctor has zero findings;
its external numeric score remains pending permission. The Expo Doctor patch
mismatch remains separately open. Private receipts are in `.tools/evidence/identity-switch-checkpoint-20260915`.
Android source maps verify 41 owning source files against the release inputs;
iOS verifies the corresponding shared source in its 1,110-module bundle.
No source push or remote change is part of this checkpoint. Authenticated backup/deletion, native capabilities, signing, published
loading and full physical-device acceptance remain unfinished.


## Inactive identity deletion transition

The shared owner now accepts deletion only from the trusted confirmation's exact
current session. It freezes and flushes workspace changes before calling the
authenticated vault operation. Successful deletion must remove only the requested
inactive identity, retain the selected identity and vault, advance the inventory
revision exactly once, and match the vault's actual readback. The workspace
controller and identity epoch remain unchanged, preserving the mounted-view
identity and selected napplet data. A subsequent identity switch still revokes
that authority permanently.

A known authentication denial preserves the current session. If approval was lost
after writing the deletion journal, the exact pending identity is exposed for a
fresh authenticated retry; its key is not silently removed. Unknown outcomes or
unexpected inventory changes require recovery. Unaccepted inventory revisions
still fail workspace and capability checks.

The complete storage suite now passes 80 tests and the capability suite 27, with
real SQLite and explicit key/authentication doubles. Cancellation also covers the
initial flush and key verification before an OS prompt can open. The shared UI
shows the exact inactive key, separate confirmation and native authentication.
An actual Android system-PIN journey retains all three loaded napplet drafts after
deleting the inactive identity; its inventory and current workspace survive restart.
See [native authentication evidence](identity-storage.md#native-authentication-and-settings-integration)
for source/artifact boundaries and the remaining iOS physical-device acceptance.
