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

## Physical Android live overview regression — 8 October 2026

The ordinary physical Android Release reproduced blank inactive overview cards:
three loaded UX instances retained distinct counters and drafts, but only the
last selected card rendered. Selecting another instance changed which card was
visible; settling did not restore the inactive previews.

The native host now resumes loaded WebViews while the activity is foreground.
Selected focus still controls the trusted media prelude, accessibility, picker,
approval and privileged transport authority. Background still pauses WebViews;
close destroys the original view. This separates renderer lifetime from selected
media authority, consistent with the documented [WebView lifecycle](https://developer.android.com/reference/android/webkit/WebView#onPause()).

The same-name, same-certificate in-place ordinary Release update has matching
installed APK bytes. The physical repeat renders all three previews with their
exact distinct state. Sixteen focused state assertions, nine independent PNG
inspections, five physical video checks and exact-target Keep open/close checks
are retained privately. The video receipt matches an independent full public byte
read. Foreground switching pauses at a retained position; an eight-second actual
background hold returns paused, with a measured 1.984-second advance between the
last foreground observation and pause. Both returns require fresh manual Play.
Only the newly created resource test view is closed; existing sessions remain.

Regression recipe: open three disposable UX instances, seed distinct counters
and public drafts through native input, switch both ways, enter overview and
inspect every visible loaded preview. Tap a card and verify its original state.
Then load a bounded public video through Resource Lab, independently compare its
MIME/size/hash, test switch and background pause, require fresh Play after each,
and close only the test resource after checking Keep open. Preserve screenshots,
AX trees, input geometry, installed-byte proof and source hashes separately.
Uncompressed AX trees are observation data; they do not prove screen-reader scope.

TypeScript, 28 shell tests, 23 resource tests, 18 real browser resource checks and 74
installed-patch quality tests pass. Android prebuild and ordinary arm64 Release
pass. Full React Doctor scans 425 files with numeric 100/100 and zero findings. Aislop 98/100 across 417 files retains only the two approved dependency exceptions;
root/tool audits still report them, runtime audit is clean, and Expo Doctor20/21
retains the six held patches. Full order, all-three scroll, deliberate empty,
continuous transition/reduced-motion/accessibility and final MVP acceptance remain
open. iOS is unaffected by this Android lifecycle change and needs its own evidence.


## Physical Android handle parity — 8 October 2026

UX-04 now passes the complete named handle journey on physical Android as well as
iPhone: inset thumb-height targets, both inward previous/next directions, live
translation, both early cancellations, both end resistance/no-wrap and actual
near-edge guest buttons without a false switch. Native state assertions agree
with independent review of the original physical recordings.

The continuation completes thirty checks: ten genuine checks precede an observer
scrolling failure, then twenty checks finish the journey. An earlier controller's
incorrect four-view assumption and both failed receipts remain preserved. This
is not one uninterrupted green run. Original sixteen-view order, the original
public draft/counter, APK/process and motion settings are retained/restored; only
three newly owned views close. Twelve owning gesture/UX inputs and parent style
blocks match current source. Seventeen other recorded inputs differ, so retained
app evidence does not establish current full-app/build/signing/published acceptance.

All twelve handle/card returns at first/middle/last under normal and zero Android
transition scale pass. Normal sparse frames include zoom intermediates; reduced
sequences settle directly but some frames contain mixed layouts. No exact pacing
or zero-intermediate-frame guarantee follows. UX-05 stays partial: the earlier
ignored first tap is unexplained and successful repetitions do not prove a fix.
TalkBack and full UX-10 remain open. Canonical private `android-gesture04` receipts,
inspected derivatives and ten byte-preserved original videos retain the scope.

One regular nonstreamed installation of the separately signed Hypergolic QA app
now succeeds with installed bytes matching the tested APK. The original app's
APK/process stay unchanged and device security settings are not altered. This
proves that this transport works; the prior streamed rejection's cause remains
unconfirmed. First launch and the prepared nine-check saved-data/empty journey
are next. No fresh application build or quality scan is claimed.


## Physical Android saved data and deliberate empty — 8 October 2026

All nine original SDK/native-input checks pass in one ordinary signed separate QA
run: missing/empty/exact shared and distinct instance values, Keep open and complete
order, exact target close staying in overview, quiet last empty with accessible
identity/Open napplet/existing Settings, two real process restarts preserving empty,
and reopening with a new native UUID/exact shared recovery/missing instance value.
Seven complete native inventories and eight original PNGs agree with the assertions.
All closed views belong to the fresh disposable profile; the original app APK/PID
remain unchanged. Current observer inputs and installed bytes are sealed; only five
documentation inputs differ from the original tested build. No private key export,
main reset/update or uncertain-upload retry occurs. Canonical private `android-empty02`
preserves the exact original evidence and current source/build binding.

UX-08 is now complete on both phones: five of61 full final requirements complete,
56 open. UX-09 gains deliberate-empty persistence but still needs verified-published
version-pin/lazy reload. ID-01 gains normal first entry, independent public npub
verification and two process restarts; device reboot and failed-read/no-replacement
remain required. No fresh app packaging or quality scan; Phase2 stays active.
