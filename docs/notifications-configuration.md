# Notifications and configuration

Hypergolic implements the selected NAP-NOTIFY and NAP-CONFIG drafts through the
published napplet capability boundary. They remain drafts, not released standards.
Phase 2.8 accepts the selected profile under the existing exact dependency
exceptions. Complete published and physical-device acceptance remains CAP-14.

## Selected contracts

| Contract | Pinned revision | Document SHA256 |
| --- | --- | --- |
| NAP-NOTIFY | `e14f5c9d6a6dd2a69ccf79668c4a3c1e955e1ac9` | `892d338587627f71899a4594096cf08795faa5e9fa230af72c31083f12abc5a2` |
| NAP-CONFIG | `448013e6d8cb8c75dce49576b3e7c0d46d960eac` | `2d34af51d84edd4353ec142002d9ffe0a7a5477ce9b0fd71835273fd4034931b` |

The genuine pinned SDK produces the public messages. A captured native registration
supplies identity, publisher, application, artifact version and generation. Guests
cannot select those fields or send trusted shell review decisions. Private request
IDs, native sequence leases, revision checks and captured recipients fence replies
and pushes. The opt-in locked runtime patch exposes the selected domains while
preserving runtime source, session, domain and ACL checks.

## Foreground notifications

The trusted shell attributes each card and badge to its verified application and
publisher. The notification centre supports body clicks, dismissal and up to three
actions. Low-priority notifications appear only in the centre; other priorities
can also show a short foreground toast. The centre entry and compact toast reserve
shell layout space so they do not intercept napplet controls. Guest strings remain plain text. There is
no OS notification or background push service in this profile.

Permission is remembered for one identity, publisher, application and exact
channel. General permission does not authorize named channels. Channels must be
registered before use. The permission review states the requesting source and
channel; Settings lists saved permissions with explicit revocation controls.
Revocation removes that channel's current alerts and badges and prevents pending
work from completing under the old permission. A new request requires fresh
approval.

Loaded foreground napplet switches keep cards and callbacks live. Background,
close, replacement and identity changes clear transient alerts and badges and
revoke old delivery. There is no replay backlog on return. Saved permissions are
separate from transient presentation and remain scoped to their identity.

## Shell-owned configuration

A napplet registers a bounded Core Subset schema and can get or subscribe to
validated values and request its trusted shell editor. The shell is the sole
writer. The editor displays verified source and artifact version, ordered groups,
plain descriptions, enum and boolean controls and validated JSON controls for
primitive arrays or otherwise supported values. Cancel does not save. Save reports
validation errors and preserves the draft; duplicate Save cannot create a second
concurrent write.

Supported schema objects are bounded to depth four. Primitive arrays are
homogeneous. Defaults, required fields, numeric/string/array limits and enum
choices are checked before delivery. References, patterns, unsupported drafts and
secret defaults are rejected. Property defaults take precedence over inherited ancestor defaults under the
selected resolution rules. Invalid values are withheld; an invalid registration
keeps the previous valid schema. A rejected registration returns a negative ACK
and pushes one `config.schemaError` to its captured live requester. The native
reply fallback likewise reports both outcomes, without delivery after revocation.
Schema changes purge removed or invalid secrets.

Configuration persistence is scoped to identity, publisher, application and the
verified aggregate artifact hash. Instance IDs do not alter persistence. A
same-version restart keeps saved values. A newly accepted artifact hash starts a
fresh scope; this profile does not silently migrate values. Declining an update
keeps the currently loaded version and its configuration.

A pending identity confirmation keeps the current configuration endpoint and
subscription. Cancelling does not require another schema registration or subscribe
call. Native review focus is withheld by Settings; an actual confirmed switch
revokes the old endpoint before the selected identity changes.

Secret inputs are masked and never populated with persisted secret text. Explicit
set and clear changes take effect only on Save. A separate native encrypted
configuration namespace holds the whole configuration record, avoiding a split
SQLite/secret transaction. It is separate from identity inventory and nsec slots.
An explicitly supplied secret is delivered in clear text to the authorized napplet
and its same-scope subscribers. It is not safe to supply a secret that the napplet
should never read. A native write already entered may finish in its original scope
after revocation, but no revoked completion or delivery is reported.

The native carrier has a separate maximum structural nesting of forty for routing
messages: schema `properties` and enclosing wire objects add levels beyond schema
object depth. Uploads and other ordinary messages retain the existing depth-twelve
limit. Native byte caps and the stricter schema/value/node limits remain enforced.
The identity-list permission interception also recognizes this routing boundary.

## Interoperability gaps

The selected draft mentions a preferred manifest schema without defining its
encoding. Hypergolic uses public runtime `config.registerSchema`; it does not
invent a manifest encoding. The installed SDK's `config.onSchemaError` returns a
teardown function, while the selected draft describes a subscription close
operation. The fixture calls the installed teardown function. Negative schema
registration ACKs preserve the draft error code on the wire; the SDK displays its
error string without inventing a code prefix.

## Verification boundaries

The signed local Routing Lab fixture calls genuine SDK operations through normal
published admission, native domain checks and trusted Android/iOS controls. Its
identities and explicitly supplied token are disposable public test material, and
its signed events are supplied locally without external publication.

The first notification tracer passes seven checks per host. The configuration
tracer passes eight on Android and seven on iOS, including masked input, live SDK
values and same-version cold restart. Android evidence inspects an actual native
AES-GCM SecureStore record and absence of the supplied marker from its XML. iOS
uses actual Keychain APIs, restart and application-container marker scans; these
Simulator checks do not establish physical Keychain protection or protected-key
acceptance. iOS may display its system password-save suggestion despite autofill
being disabled; the observer explicitly declines it.

Notification lifecycle matrices pass twelve native checks per host; configuration
matrices pass thirteen per host. They cover trusted revocation, foreground retention,
background cleanup, forged controls, flood/oversize, app isolation, depth-four
schemas, orphan secret purge and declined/accepted version updates. The eight final
native runs total seventy-nine checks with identical 408 input fingerprints.
Identity/publisher configuration namespace isolation and subscription ordering also
have owning shared/native-core tests; full protected-identity journeys remain CAP-14.
Both ordinary Release packages and production exports pass. A browser check or a
successful build is not native acceptance. Cross-capability modal integration is
part of final CAP-14 acceptance.
Complete published, physical-device and protected-identity acceptance remains
CAP-14. Existing exact Forge/braces quality exceptions remain visible; the ordinary
quality gates are unchanged.


## Physical configuration checkpoint — 7 October 2026

The ordinary physical iPhone Release app passes ten bundled original-SDK checks
covering schema registration/defaults, initial and live subscription ordering,
trusted editor cancel/save, Home/return readback, invalid/forged requests,
unsubscribe and cold restart with the retained protected public identity.
A separate native-editor visual check passes. These are scoped physical results;
full secret lifecycle, namespace/update isolation, published parity, faults and
Android physical acceptance remain open.

The injected runtime facade previously forwarded correlated config.get replies
to config subscribers, producing an extra callback despite no saved change.
The locked Kehto shell patch now forwards only no-id config.values pushes to
subscribers, matching the selected draft and existing native broker/SDK shim.
The original physical assertions pass unchanged after the fix. Chromium and
WebKit reproduce the defect before the patch and pass the new regression after it.
See the [physical checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md)
for installation, retained evidence and remaining limits.


## Physical notification checkpoint — 7 October 2026

The ordinary signed iPhone app passes one13-check bundled original-SDK run for
trusted permission, exact attributed cards and action/body/dismiss callbacks,
remembered permission, oversized/forged controls, loaded foreground retention,
confirmed OS background cleanup, cold permission continuity and Settings revoke.
The scoped general test grant is revoked afterward. Named-channel and complete
identity/publisher/app/version isolation, hostile/flood/expiry and lifecycle races,
published parity, modal integration and physical Android remain CAP-14 work.

Bounded invalid notification sends previously failed the outer runtime envelope
gate without a correlated SDK denial. The captured registered notify frame now
receives a bounded generic rejection; malformed authority/unknown or unbounded
headers acquire neither a reply path nor a native operation. The existing64-per-
second incoming-message limit includes rejected messages. Both browser engines
reproduce the defect before the fix and pass the regression plus a positive send
afterward. This is a local runtime denial, not a native permission grant.

The external iPhone observer now confirms both background and suspended states
through explicit OS launcher activation. A focused probe demonstrates that Home
input alone stays foreground in that run. The earlier ten-check configuration
run's Home/return observation therefore does not prove background; a separate
state-confirmed configuration run now passes exact saved-value readback.
See the [physical checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md)
for failed attempts, repaired observers and remaining limits.


## Physical Android configuration repair — 9 October 2026

Ordinary bundled Routing Lab checks prove native Cancel, exact Save and one live
value push, invalid-value refusal, distinct application isolation and persisted
values after actual process death. The older run's background oracle also matches
unrelated stopped activities: independent review proves the keeper was PAUSED and
the launcher RESUMED. This supports launcher/return readback, not a proved keeper
STOPPED state or complete lifecycle fault acceptance. Failed runs remain retained.

The SDK correctly reported rejected secret-default and pattern registrations,
but its schema-error callback stayed empty. The selected NAP-CONFIG requires both
the negative ACK and the error push. The broker and native-reply fallback now send
both while retaining captured recipient and generation checks. The regression
fails against the original broker and passes with the repair.

The corrected ordinary signed Android app passes six original-SDK checks after an
in-place update: selected public identity and empty workspace retained, valid
schema and initial subscription, one exact callback for each rejection, no peer
error delivery, and forged-control refusal. Previous valid values/subscriptions
remain unchanged. Both owned views close; the original empty workspace and selected
identity return. Only the retained app remains installed. Thirteen new PNGs and
48 preceding originals are inspected; exact callback/value arrays are accessibility
XML evidence because their complete text can be clipped/offscreen in PNG.

Typechecking, 35 presentation, 100 Outbox and 12 Chromium/WebKit configuration
checks pass, as do the signed Android Release and both production exports. Full
Doctor is 100 and aislop is 98 with only the two existing exact dependency
exceptions; the unchanged normal gate remains red. Android CAP-11 becomes partial.
Physical iOS callback parity, secret set/clear/purge, full identity/publisher/version
isolation, verified updates, faults/races and published parity remain required.
The first cold Settings press still misses before a separately observed warm
continuation; UX-05 remains open. No source push or Phase 2 completion claim.


### Physical Android secret editor subset — 10 October2026

The current ordinary same-ID/certificate app passes five original-SDK/native checks:
unset secret absence, masked draft cancellation without writes/pushes, one exact
save/push, masked and unpopulated persisted editor, and peer-app token absence.
Only a disposable public marker is entered. Original XML also confirms exact
saved-value readback after actual process death and one correct initial subscription
object. The actor stops because its JSON string comparison assumes object field
order; structural comparison independently matches every field and event count.
The failed actor remains recorded. This requires an observer correction rather
than an application change.

Cleanup first stops on its viewport observer. Central scrolling inside the observed
native editor completes Save, exact original default/no-token SDK readback, and
both exact owned view closes. The premature second actor is terminal with zero
inputs/views. Keeper-only inventory, current identity and installed bytes are
preserved. The complete corrected run, depth-four/removal-restoration purge,
identity/publisher/version and incompatible-update isolation, faults/published
execution and iOS parity remain required. CAP11 stays partial.


## Corrected physical Android configuration run — 10 October 2026

The corrected ordinary original-SDK/native-editor run passes all nine checks:
unset-secret absence, masked draft Cancel without write/push, exact Save with one
push, empty masked persisted editor, peer-app isolation, saved public-token
persistence and one initial subscription after real process death, explicit clear,
depth-four arrays/enums, and schema-removal/restoration orphan purge. Only a public
disposable marker is entered. Structural JSON comparison preserves exact fields,
values, array order and event counts. Earlier failed actors remain unchanged.

Independent review verifies all27 original XML/PNG pair hashes, exact SDK reads,
subscription arrays, unchanged source inputs and installed APK bytes. Eight original
PNGs are inspected: native fields are masked/unpopulated and the final workspace
is empty. Complete JSON is clipped/offscreen; its exact values derive from XML.
Some editor captures clip Save; later observed scrolling precedes native input.
This is not complete modal/accessibility acceptance.

The terminal actor restores exact defaults without token/deep fields, closes only
its two owned views and retains the current identity. Post-terminal inventory is
keeper-only, with unchanged APK bytes. No new package, app build, identity import,
signing or publication occurs. Private evidence: android-configuration-secret01/
corrected-physical03. CAP11 remains partial: full identity/publisher/version and
verified incompatible-update isolation, faults/races, published loading and iOS
parity remain. UX05 first cold Settings press remains open. Phase2 remains seven
of61 complete/54 open. Outbox100/100 passes; no source push or Phase3 advance.


## Routing cancellation repair: signed builds and physical subset

The same-ID/certificate Android Release update passes packaging and installed-byte
verification, preserving retained data. Its next original-SDK run passes four cases:
two same-app instances with defaults, one exact shared Save push per instance,
distinct-app isolation and cancellation retaining both saved values/subscriptions.
Original XML independently verifies reads3, exact saved values, unchanged two-event
arrays and no schema-error callback output. No re-registration follows cancellation.

The run then stops in the external observer after a confirmed A-to-B switch: the
fresh original Routing Lab has reads0 and empty get/event/error outputs, but the
observer tries to parse the empty pre-subscription text as JSON. This is a distinct
observer failure, not another no-schema timeout. Its original trace/UI are retained.
Cleanup switches back, restores exact defaults, closes all three owned views and
retains the original identity/empty workspace. All23 capture pairs,1257 source inputs,
helpers and keeper bytes verify. Three original PNGs were inspected; full SDK JSON
and reset counters are clipped/offscreen, so exact values rely on original XML.

The signed ordinary ARM64 iPhone product also passes, with63 sealed files, unchanged
native codec inputs, the same certificate and a byte-identical verified ready copy.
It is not installed and does not establish physical iPhone parity.

TypeScript, both exports, Android prebuild,584 shared tests, final19 transition tests
and120 routing-core assertions per native platform pass. Complete React Doctor is
100/432 files. Aislop remains98 with only the exact two prior approved locked-patch
advisories, all applicable engines and ten audits complete; the ordinary gate remains
red. The corrected next driver requires exact reads0 and all three original empty
outputs before registering a freshly remounted session, and captures each reset.
The broader eight-case run remains pending. CAP-11/CAP-14 and the full phase stay
open; publisher/version/update/fault/published/iOS scope remains required.


## Physical Android configuration identity isolation — 10 October 2026

The corrected run passes eight original-SDK/native-control checks: shared defaults,
exact single Save pushes to both instances, peer-app isolation, cancellation
preserving values/subscriptions, three confirmed remounts, separate shared values
under the second identity, and both return switches restoring their own saved
values with fresh subscriptions. Cancellation requires no re-registration.

Independent review verifies 50 original XML/PNG pairs and 1,257 unchanged source
inputs. Nine remount originals have reads0 and blank outputs before registration.
Four PNGs are inspected; exact full JSON/counters come from original XML. Cleanup
restores both modified scopes, the original identity/empty workspace and keeper-only
unchanged APK bytes. Earlier application and observer failures remain recorded.

Publisher/version isolation, incompatible updates, faults/races, published journeys,
physical iOS parity and complete usability remain open. CAP-11 stays partial.
Application/native inputs are unchanged; this documentation checkpoint claims no
new build or quality run. See [the full checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md).

## Physical Android configuration publisher and version isolation — 10 October 2026

Five checks verify that two signed publishers with the same app ID and exact HTML/
aggregate hash keep separate saved values. Native editors identify each publisher
and version; fresh original SDK reads verify both values after switching between
their instances. Run04 retains an overall failure at its later update-control
observer, before update dispatch. Its five passing publisher checks are reviewed
separately; the original failed result remains unchanged.

A separate four-check update run passes: declining the verified incompatible
update preserves the original instance and values; accepting it starts a new
instance with a string enum default and no old token; saving the new string schema
succeeds; actual process death restores the exact new pinned version and values.
The ordinary protected identity owner, real vault and native editor/store are used.
Only the signed sample source is supplied locally, so this proves neither external
relay/HTTPS publication nor physical iOS parity.

All five data-preserving signed test updates keep the retained application ID,
label and certificate. Each terminal batch or its bounded reconciliation restores
the exact normal APK, original identity/empty workspace and unchanged package
inventory. The three exact initially empty sample scopes are erased after testing.
No key import, vault replacement, data reset, device-policy change or new test app
is used. Production source composition is restored after packaging; the builder
preserves unknown concurrent edits and its two failure/restoration paths pass.

Seven original PNGs are inspected. Native publisher/version metadata and the new
enum choices are visible. Full guest JSON is clipped/offscreen and verified from
original XML plus fresh SDK read counts. The scrolled update capture omits its
header; exact native review/decision IDs and old/new event IDs remain attributable.
Earlier observer failures and their cleanup receipts stay preserved. Observed
120ms presses do not establish instant-press or complete accessibility acceptance.

TypeScript and all40 presentation tests pass, including four signed-source cases.
Complete local React Doctor scans437 files with zero diagnostics; its external
numeric score remains unrequested pending specific approval. Aislop remains98
with only the two previously approved locked-patch advisories and an ordinary red
gate. No new quality exception or source push is claimed.

Private evidence identifier: android-configuration-namespace01. CAP-11 stays
partial; full fault/race cases, external published journeys, physical iOS parity
and complete usability remain required. The full matrix stays seven of61 complete
and54 open. Phase2 and all unfinished plans remain open; no Phase3 advance.

The protected-source packaging command is:

```sh
source .tools/use-local-tools.sh
python3 -B tests/native/presentation/build-protected.py --output /tmp/hypergolic-config-build
```

The output directory must be new. This Android-only test entry is separate from
`index.ts`; it is packaged with the retained test ID/certificate and restores the
ordinary source composition after building. The observer supports `--section
publishers`, `--section updates`, or the default combined run, plus the sealed
`--build`, `--apk`, `--output`, `--serial` and exact `--package` arguments. Protected
runs require the designated disposable development identity, an empty workspace
and initially absent exact sample records. Match the installed package/certificate
and product hash before testing; afterward restore the normal package and verify
its identity, workspace and inventory. The separate `published.tsx` fixture uses
public-only fake identities and must never replace the retained protected-owner app.


## Physical Android notifications — 10 October 2026

Two separate ordinary physical Android runs pass 15 lifecycle/callback checks
and 10 channel checks. They use the installed normal app, real protected identity
owner and genuine bundled Routing Lab/Peer SDK. The bundled publisher is the
reserved unsigned fixture, so these results do not prove signed publication or
external relay/HTTPS transport parity. No OS push is assumed.

The lifecycle run verifies native denial and exact attributed approval; original
SDK action, click and user-dismiss callbacks; remembered general permission;
oversized rejection; a forged-control subset retaining the legitimate card;
source badge; retention across loaded foreground switches without peer delivery;
confirmed OS background clearing; actual process death without replay; exact
Settings revocation; and a fresh review followed by a positive send. Background
is the exact keeper PAUSED with launcher RESUMED, not STOPPED. The process ID
changes on the actual force-stop/restart.

The channel run verifies that general permission does not authorize messages;
exact named-channel review/send; action delivery to the original caller while a
peer is focused; separate app denial; channel revocation clearing cards while
preserving general permission; fresh channel review; bounded sequential flooding;
and owned caller close clearing its source without peer callbacks. Twenty
sequential original SDK sends yield six unique successes and fourteen rate-limit
denials, with two earlier active cards. This proves the observed eight-card source
bound, not arbitrary concurrent flood, expiry or native queue safety.

The native observer now handles childless XML elements explicitly, attributes
flattened accessibility nodes within the exact native card bounds, and waits
briefly for unique WebView geometry. Seven observer regressions pass, with original
failures retained. The helper runs at shell UID and only reads native accessibility;
no observer APK, privilege change or replacement identity/vault is installed.
Eight predecessor failed runs remain preserved, including the deliberately stopped
run whose original final result is missing. Bounded independent reconciliation
closes only attributable owned views after those incomplete runs. A dump exit137
and empty guest accessibility are observer failures with no asserted app root cause.

Both successful runs restore zero selected-owner notification permissions and the
original selected identity/empty workspace. All 468 source fingerprints, installed
APK bytes and package inventories match before/after. Counters legitimately
advance; this is not whole-database byte preservation. The exact temporary helper
jar is removed with a hash guard after both actors terminate. Six original PNGs
are inspected; full SDK JSON/callback ownership is independently verified from
original XML where clipped or obscured. Observed 120ms stationary presses do not
prove instant-press or complete accessibility usability.

All 40 presentation tests and TypeScript pass. Complete local React Doctor reports
zero diagnostics; the external numeric score remains pending specific approval.
The last completed aislop audit is 98 with only the two previously approved
locked dependency advisories. Automatic approval review rejected the fresh audit
before execution because external dependency-metadata transfer lacks specific
payload/destination authorization. No indirect retry occurs. Neither the ordinary
red gate nor the pending numeric score is hidden.
No production app source changes, rebuild, installation or source push occurs in
this observer checkpoint.

Private evidence identifier: android-notifications01. CAP-10 remains partial.
Real signed publisher and identity/version isolation, hostile/action/priority
variants, actual five-minute expiry, stale/replacement/background/in-flight races
with native zero-effect counters, published parity, full modal/keyboard/Back,
accessibility/reduced-motion/minimum-platform and physical iOS parity remain open.
The full matrix stays seven of 61 complete / 54 open. Phase 2 remains incomplete.


Run the ordinary Android notification observer with the exact installed normal
package receipt, APK and designated development identity. Both workspace and
notification permission baseline must be empty; existing permissions are preserved
by refusing the run. Output directories must be new.

```sh
source .tools/use-local-tools.sh
python3 -B tests/native/presentation/test-physical-navigation.py
python3 -B tests/native/presentation/build-notify-observer.py \
  --serial "$ANDROID_SERIAL" --output /tmp/hypergolic-notify-observer
python3 -B tests/native/presentation/notify-physical-android.py \
  --serial "$ANDROID_SERIAL" --npub "$SELECTED_DEVELOPMENT_NPUB" \
  --build "$NORMAL_RECEIPT" --apk "$NORMAL_APK" --section callbacks \
  --ui-jar /tmp/hypergolic-notify-observer/ui-dump.jar \
  --output /tmp/hypergolic-notify-callbacks
python3 -B tests/native/presentation/notify-physical-android.py \
  --serial "$ANDROID_SERIAL" --npub "$SELECTED_DEVELOPMENT_NPUB" \
  --build "$NORMAL_RECEIPT" --apk "$NORMAL_APK" --section channels \
  --ui-jar /tmp/hypergolic-notify-observer/ui-dump.jar \
  --output /tmp/hypergolic-notify-channels
```

The helper stages only `/data/local/tmp/hg-notify-uia.jar`; it refuses to replace
unknown bytes. After each terminal batch verify the receipt's owned cleanup and
reconcile uncertain failures before restarting. After all actors terminate, remove
only the helper whose device hash matches the build receipt, verify its absence
and retain the original app inventory. An observation timeout is not evidence
that an actor terminated. Never use the public-only fake-vault fixture over the
retained ordinary protected-owner app.


## Physical Android real-time notification expiry — 10 October 2026

A separate four-check ordinary protected-owner run verifies original SDK dismissal
with the exact user callback, toast disappearance while the card remains without
a dismissal event, card retention before five minutes, and the exact timeout
callback after real five-minute expiry. The same attributed card is visible at
60, 120, 180, 240 and 285 seconds after its SDK receipt. Hypergolic is the observed
foreground activity at every sample. No fake clock, shortened timeout, app rebuild
or installation is used.

The native empty centre and original SDK timeout ID/reason are independently
verified. Input-to-SDK acknowledgement is 3.005 seconds; disappearance is observed
302.535 seconds after the send input, 299.529 after acknowledgement. These bracket
the actual send; no exact millisecond transition claim follows. The toast is
observed absent 12 seconds after acknowledgement, not timed at the exact 8-second
transition. Three original PNGs are inspected; callback JSON is below the guest
viewport and verified from original XML, not those pixels.

All 469 input hashes, installed APK bytes and package inventories match before/
after. The original selected identity, empty workspace and zero notify permissions
return. Only the owned view/new grant and hash-matching observer JAR are removed;
its absence is verified after the actor exits 0. No temporary app is installed.
Private evidence identifier: android-notification-expiry01. The earlier 15/10-check
runs remain separate; this adds four checks, not a merged 29-case execution.

CAP-10 stays partial. Real publisher/identity/version isolation, hostile/action/
priority variants, native race/zero-effect proof, published and physical iOS parity,
full modal/keyboard/Back/accessibility/minimum-platform coverage remain open.
The full matrix remains seven of 61 complete/54 open. Local React Doctor has zero
findings across 437 files with no numeric score; the last complete aislop is 98 with
the exact two approved locked findings. Fresh registry audit and external scoring
remain pending specific authorization; no indirect retry or new exception occurs.
No source push or Phase 3 advance.


The separate real-time observer uses the same normal APK/receipt, development
identity and staged helper as the callbacks/channels observer:

```sh
python3 -B tests/native/presentation/notify-expiry-physical-android.py --serial "$ANDROID_SERIAL" --npub "$SELECTED_DEVELOPMENT_NPUB" --build "$NORMAL_RECEIPT" --apk "$NORMAL_APK" --ui-jar /tmp/hypergolic-notify-observer/ui-dump.jar --output /tmp/hypergolic-notify-expiry
```

It requires a new output directory and the empty workspace/permission baseline.
Keep the device foreground for the actual five-minute run; do not change clock or
power/security settings. Reconcile its terminal cleanup and hash-check/remove the
owned helper as described above before starting another actor.


## Protected Android notification publisher preparation — 11 October 2026

The test-only signed source now includes two notification samples with identical
app ID, HTML/hash, manifest tags and timestamp, but distinct publishers and event
IDs. Ordinary verified loading and the real protected identity owner are retained.
Exact coordinate/pin selection, cancellation, byte bounds and fresh HTML carriers
pass four new tests; all 44 presentation tests pass. The default configuration
packager remains available; `--suite notifications` selects the new signed source
and entry. Three packaging-driver tests execute both modes with a host fake Gradle
process: success/failure restore known composition, and concurrent unknown edits
are preserved and rejected. Three observer tests prevent the same-app permission
row from borrowing a neighbouring publisher's revoke button.

The actual signed ARM64 notification test APK builds with the retained application
ID, Hypergolic label and certificate. Production composition is restored and the
real identity owner hash remains unchanged. The package's input maps are retained;
two later host-only observer/test files differ from that build, with no packaged
app-source changes. Packaging proves neither device execution nor publisher
isolation. A native shell-UID accessibility helper probe passes while Android is
connected. The subsequent read-only pre-install preflight terminates at its first
helper read after the device disconnects: zero napplet inputs, zero checks and no
APK installation attempt. Its original partial running journal is retained with
an independent terminal-failure receipt; no live actor remains. The owned helper
JAR has not been verified removed and requires hash-checked cleanup on reconnect.

Six physical checks are prepared, not run: exact signed publisher review/send;
same-app/HTML publisher grant separation; positive independent approval; exact
publisher revocation preserving its peer; unfocused callback recipient isolation;
and actual cold-restored publisher permission without old-event replay. Require
the designated development identity, initially empty workspace/notify grants,
exact signed APK and source receipt, unlocked device and helper ownership before
running. Preserve existing identity/data and permissions. After the terminal batch,
restore exact normal APK bytes with the same ID/certificate, independently verify
identity/empty workspace/inventory, then remove only the hash-matching owned helper.
The observer itself does not perform the outer normal-APK restoration.

Complete local React Doctor scans 440 files with zero diagnostics/skipped checks,
score null. Main and explicit test-entry TypeScript checks pass. The last complete
external dependency audit remains aislop98 with the two approved locked advisories;
fresh registry audit and external scoring requests still await specific payload/
destination authorization. No indirect retry, gate waiver, source push or Phase3
advance. CAP-10 remains partial and the full matrix seven of61 complete/54 open.
Signed physical, identity/version, races/zero effects, hostile/priority variants,
external published and iOS/minimum-platform/usability acceptance remain open.
Private evidence identifier: android-notification-publishers01. Usage25% remains
below the owner's latest about98% ceiling.


Preparation and eventual physical execution use new output directories:

```sh
source .tools/use-local-tools.sh
pnpm run test:presentation
python3 -B tests/native/presentation/test-notify-publisher-selection.py
python3 -B tests/native/presentation/test-protected-builder-restoration.py
python3 -B tests/native/presentation/build-protected.py --suite notifications --output /tmp/hypergolic-protected-notifications
# After independently verified, data-preserving installation and device preflight:
python3 -B tests/native/presentation/notify-publisher-physical-android.py --serial "$ANDROID_SERIAL" --npub "$SELECTED_DEVELOPMENT_NPUB" --build /tmp/hypergolic-protected-notifications/build.json --apk /tmp/hypergolic-protected-notifications/hypergolic-protected-notify.apk --ui-jar /tmp/hypergolic-notify-observer/ui-dump.jar --output /tmp/hypergolic-notification-publishers
```

The fixture scalars are deliberately public test values and must never publish.
The local source delegates unrelated coordinates/HTML to ordinary transport;
these controlled samples do not establish external relay or HTTPS acceptance.


## Notification concurrent-capacity repair — 11 October 2026

Two new regressions using the actual shared broker and disk SQLite permission
store reproduce a capacity race:20 concurrent sends admit12 cards for one source
(limit8), and40 sends across five independently permitted sources admit40 cards
(global limit32). The early capacity check runs before an asynchronous permission
read, so multiple callers can observe the same free capacity. The broker now
rechecks both bounds after that read and the active-authority check, before ID
allocation or card publication. No asynchronous operation separates the final
capacity check from insertion. Existing limits, rate policy and wire replies are
unchanged; excess calls receive the original `rate limited` error without an ID.

Both regressions pass after the change; all46 presentation tests and TypeScript
pass. They additionally verify unique admitted IDs, no ID allocation for excess
calls, exact host timeout callbacks and positive sends after expiry/slot release.
These are shared host tests with a native-port double; their counters are not
physical native zero-effect evidence. Both ordinary Expo exports pass. Complete
local React Doctor scans441 files with zero diagnostics/skipped checks; score null.
The final full external audit/score remain pending specific authorization. The
last complete aislop98 reflects its earlier source, with only the two approved
locked advisories; it is not a new full-source quality result for this repair.

The current signed Android notification test APK is rebuilt after the fix with
unchanged ID/label/certificate and restored composition/real owner. The preceding
prepared APK remains historical evidence and must not be used for current-code
acceptance. Both ordinary ARM64 Android and iPhoneOS Release products also build
and verify with their retained Hypergolic IDs, labels and certificates. The iPhone
build uses its cached signing profile with provisioning updates disabled. Source/
native input maps and prior signed products are preserved and compared. No APK/
iPhone installation, device input, test identity change or physical concurrency
acceptance occurs. Use the newly sealed ordinary product when restoring after the
future publisher batch, not the superseded normal APK from before this repair.

Android remains disconnected at the last USB observation. The six signed publisher
checks and physical concurrent/fault/iOS parity remain open. Removal of the earlier
owned shell-UID helper still requires reconnection and an exact hash check. CAP-10
stays partial; the full matrix remains seven of61 complete/54 open. Clean-close
policy and external quality authorization remain unanswered. No source push,
quality waiver or Phase3 advance. Private evidence: notification-concurrency01.
