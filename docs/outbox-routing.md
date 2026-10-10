# Outbox routing

Phase 2.9 implementation is complete. On 5 October 2026 the owner moved its remaining physical-device, fault, lifecycle, published-admission and build acceptance into [Phase 2.11](../.planning/phases/02.11-published-mvp-acceptance/02.11-OUTBOX-HANDOFF.md). CAP-12 final acceptance and full MVP acceptance remain open.

## Selected contract and policy

NAP-OUTBOX PR32 is pinned to `4589a8f9a16d8aa29b3740e2b3b0cdca11e0976e`; NIP-65/NIP-01 to `0046368a747c5c25ae2bec28bae0e537744c8f10`. This is a selected draft profile, not full stable-domain conformance. [Context](../.planning/phases/02.9-outbox-routing/02.9-CONTEXT.md) records D-01–D-09 and their rationale; [research](../.planning/phases/02.9-outbox-routing/02.9-RESEARCH.md) records the source comparison.

Original SDK getEvent/query/resolveRelays/subscribe/close/publish use the trusted native host. Outbox requires both outbox and relay grants. Lookup relays discover verified signed kind10002 lists; data reads use author write relays and required recipient publication uses inbox read relays. Replacement winners follow NIP-01, including lowest lexical ID for equal timestamps. Signature/filter checks apply to stored and network data. Private/local/insecure destinations remain denied by the existing native DNS/TLS/public-WSS policy.

The identity-specific persistent list cache is fresh for 24 hours after a successful verified lookup. Reads may retain verified stale data for up to seven days while refreshing. Missing/failed discovery or authorless reads use bounded Network fallback and validated hints, reporting incomplete results truthfully. Publication refreshes expired metadata before review and refuses stale required routing. Missing own usable metadata permits labelled Network fallback; missing required inbox metadata blocks before review/signing.

## Review, publication and receipts

Before trusted review, freeze the exact unsigned primary template and the full unique union of own write, explicitly requested inbox read and explicit relay destinations. Bounds are 64 authors and 16 unique relay destinations; required fanout is never silently truncated. No automatic p-tag recipient inference is selected. toOutbox:false skips own discovery and own-list redistribution while explicit and required inbox destinations still apply.

Each new primary event needs exact approval. The native owner binds reviewed event/hash/identity/source/targets, freezes the signed primary bytes once, consumes each approved group/relay pair once and checks revocation at final emission. Fanout uses at most four concurrent connections and a shared 15-second deadline. The complete signed EVENT frame must fit 8192 bytes, including UTF-8, escaping and signature overhead; an oversized existing ancillary list denies review rather than disappearing.

The exact existing verified signed own kind10002 may be a separately reviewed ancillary item, sent only to approved destinations. No new list signature, automatic list creation or unrelated indexer broadcast occurs. This selected redistribution policy extends the pinned draft's at-most-one-signed-event rule, even though only one new event is signed. It must not be described as strict draft conformance.

Primary success requires every required inbox relay to accept; without required inboxes, at least one primary ACK is needed. An unrelated ACK cannot compensate for a rejected, unknown or cancelled required inbox. The existing-list receipt group has independent outcomes and cannot reverse primary acceptance. Native trusted UI distinguishes accepted, rejected, unknown and cancelled-before-send. ACK means relay acceptance, not recipient consumption. Original SDK failures retain their selected canonical error shape. No automatic retry occurs; a retry requires a new review.

Read/stream connections stay live across loaded foreground switches. Background closes them and foreground refreshes routing before reconnecting. Close, update and identity changes revoke old authority. Publication uses the focused approval lifecycle; switching invalidates approved publication. Upload's separate permission to continue across switches does not extend to publication. Pending reviews are distinct: background pauses them until explicit native resume, retaining the unchanged reviewed event within the bounded pending lifetime. The physical [pending lifecycle subset](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md#pending-outbox-review-lifecycle) observes this pause/resume, loaded-view attribution, rejection/dismissal, process death and separate requester close. It does not establish complete approved/in-flight revocation or zero native signer/emission counters.

## Existing proof and remaining acceptance

[Plans 01–02](../.planning/phases/02.9-outbox-routing/02.9-02-SUMMARY.md) record actual Android/iOS native read/stream journeys. [Plan 03](../.planning/phases/02.9-outbox-routing/02.9-03-SUMMARY.md) records actual native core/TLS/presentation evidence and production Android emulator protected signing, cold recovery, separate ancillary receipts, required-inbox failure, overflow and background subsets. Independent clients verified exact signed primary events; source and installed product hashes are sealed. Retained failed or inconclusive attempts remain explicitly separate.

Those earlier proofs do not establish complete physical published/fault acceptance. The current [Phase2.11 checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-02-CHECKPOINT.md#physical-iphone-protected-publication--7-october-2026) adds ordinary bundled protected explicit-only publication on both physical hosts, with exact native review and independently verified live/stored signed events. Final published Outbox admission and the remaining fanout/lifecycle/fault rows stay open. The production iOS identity store excludes Simulator; never substitute a fixture signer. Phase 2.11 owns every open row, including ordinary exports/prebuilds/packages and physical input/accessibility. Complete source quality keeps only the two existing explicitly approved locked-patch exceptions visible; gates and findings are not suppressed.

Checks already used for implementation include `pnpm run test:outbox`, `pnpm run typecheck`, original SDK Chromium/WebKit suites and the native runners documented in [tests/native/outbox](../tests/native/outbox/README.md) and [publication proofs](../tests/native/outbox/publication/README.md). Packaging alone cannot establish device acceptance.


The [physical owning transport checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-04-CHECKPOINT.md#physical-owning-publication-transport)
adds eight actual owner/approval/WSS cases in a separate iPhone QA app, with an
independent exact EVENT observer and zero frames after final native revocation.
Only HYPERGOLIC_NETWORK_PROOF builds can redirect that proof to a controlled
address/certificate anchor. Ordinary public relay policy remains compiled by
default. These already signed fixtures do not prove protected signing, owning
Expo composition or complete lifecycle/fault acceptance.


The current physical Android bundled subset verifies disjoint role discovery,
separate primary/existing-list receipts and a required-target failure despite
unrelated acknowledgements. Exact stored event signatures are independently
verified. Feed Lab's JSON editors now preserve typed routing keys on that device;
previous saved bytes retain their original pin. See the [current checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-03-CHECKPOINT.md#feed-lab-json-input-and-physical-outbox-routing--10-october-2026).
Full all-required success, controlled transport/effect counters, lifecycle/cache,
iPhone and signed published acceptance remain open.


## Native acknowledgement frame boundary — 11 October 2026

The selected [NIP-01 revision](https://github.com/nostr-protocol/nips/blob/0046368a747c5c25ae2bec28bae0e537744c8f10/01.md)
requires a relay acknowledgement to be one JSON array with event ID, Boolean and
reason. The new host regression reproduces an Android defect: JSONArray(text)
accepts the first array and ignores trailing text. The Android classifier now
uses the same JSONTokener through array parsing and checks for end of input before
capturing a receipt; raw NUL cannot masquerade as the tokenizer's end sentinel.
No fields, routing policy, permissions or approval rules change.

Actual compiled native core checks pass: 69 Android assertions and 83 Swift
assertions. New cases cover exact 4,096-byte ASCII/multibyte reasons and overflow,
empty reason, malformed field counts/types, excessive depth, exact 2 MiB and one
byte over, trailing data/NUL and concatenated replies. Existing checks retain the
first exact ACK even after a later contradictory or invalid response. Android
runs on the host JVM with the documented org.json dependency; Swift runs with
Foundation on macOS. Platform parser and physical-device parity remain required.

All 24 controlled host TLS writer/classifier cases pass. All 13 actual Swift
publication-owner cases pass through its existing proof-only route: malformed
post-send ACKs return unknown, exact valid ACKs retain accepted/rejected, and
revocation before emission returns cancelled-before-send with zero EVENT frames
at the independent receiver. Every other receiver observes exactly the public
signed fixture EVENT. Disposable TLS keys are deleted. These proofs do not cover
protected signing, guest/Expo admission, public DNS or physical input. This is
selected fault coverage, not exhaustive JSON grammar or complete OB-05/06.

Shared Outbox102, security353 and bootstrap13 tests, TypeScript, Expo Android
prebuild and signed ordinary ARM64 assembly pass. Only classes4.dex changes;
all 20,565 packaged class definition names/order, 21 native libraries, the three
other DEX files, 96 assets, 85 original notices, JavaScript and trusted host remain
verified. Stable Hypergolic ID/label/certificate/permissions remain unchanged.
All 1,448 source inputs stay stable during build and generated packaging restores.
APK SHA-256 is 7f0227c9b948d5c9b72e3947c2aeb29131f16860c696e926f60f96d1a1127db7.
The retained iPhone132-file product stays unchanged; no iOS rebuild or installation.

Local Doctor has zero findings across442 files/no skips, with remote scoring off.
Source-only aislop has zero findings across435 supported/97 unsupported files with
online audit off. Full numeric quality, complete faults, physical/published/native
signing and final matrix acceptance remain open:7/61 complete and54 open. Original
Android pre-fix failure and the first new Swift-test compile error are retained.


## Android host publication owner faults — 11 October 2026

The unchanged compiled Release owner now passes twenty single-publication fault
cases against an independent loopback TLS receiver. Accepted/rejected replies
retain their exact reasons; missing, foreign, malformed, AUTH, trailing, overflow,
flood and oversized-frame replies remain unknown after send. Approval/job
cancellation immediately before the final send gate yields zero EVENT frames.
The corresponding cancellations immediately after emission yield one exact EVENT
and unknown receipts. Silent timeout takes 3,090 ms; keepalive notices still stop
at 10,008 ms. These measurements belong to this controlled host run.

Four simultaneous approved plan pairs remain in flight while a fifth is denied
before transport. That fifth pair is consumed and cannot replay. Releasing the
first four restores capacity; a sixth fresh pair succeeds. The relay sees five
exact EVENT frames across this case. Every single case and the final concurrent
case leave all four semaphore slots free and the native deadline queue empty.

The runner executes the original compiled owner, plan, approval and ACK classes.
A host monotonic clock replaces Android SystemClock; Handler/Looper permit only
initialization and fail any fabricated UI queue use. The isolated WSS source copy
changes only its publish-entry route to the controlled endpoint. The complete
patch is retained, while the downstream transport code and ordinary production
source stay unchanged. Source/configuration, compiled classes, dependency JARs,
route/proof outputs and original logs are hash-bound. The first harness compile
failure remains recorded; disposable TLS private material is removed.

This does not prove Android platform JSON parity, device sleep, UI delivery,
protected signing, guest/Expo composition, public DNS policy, slow-write
backpressure or complete physical/published fault acceptance. No new app build,
installation, external publication or source push occurs. Both retained native
products stay byte-identical. Local Doctor checks 442 files without diagnostics
or skips and leaves its external score off; source-only aislop checks 435 supported
files with zero issues and online audit off, with 97 unsupported files. These
local reports do not satisfy the pending full external quality gates. The
physical matrix remains seven of 61 complete, with 54 open.


## Physical Android framework parser and plan — 11 October 2026

The physical API36 phone executes the current compiled module's plan, approval
and ACK primitives under a disposable shell-UID process. All69 existing assertions
pass, including trailing/raw-NUL/concatenated ACK faults, empty/4,096-byte/over-limit
ASCII and Unicode reasons, depth/2MiB boundaries, immutable event/identity/hash/
destination checks, one-use pair replay and approval revocation. The process proves
actual boot-framework JSONObject/JSONArray/JSONTokener use; its DEX inventory has
no packaged org.json class definitions.

The first successful run exposed an over-escaped inventory regex during review.
After correction, the guard matches actual owning DEX definitions and rejects an
injected org.json class-definition line. The second full device run also passes;
both original source/results remain retained.65 selected source/configuration/
Android API/Kotlin inputs and388 compiled module class inputs stay exact. Both
staged remote files match their product/fixture hashes and are absent after cleanup.
The installed app's path/hash and package inventory remain unchanged. The old
notification observer is separately removed only after its recorded hash matches;
its absence and the unchanged retained app/inventory are verified.

This updates Android OB-05 to partial. Shell-UID standalone execution does not
establish current ordinary installed app code, app-UID/Expo/guest routing, protected
signing/authentication, view lifecycle or controlled/public TLS publication. The
approval clock is supplied by the existing proof, so device suspend semantics
remain open. No native publication-owner receipt or zero protected-sign count is
claimed. OB-06 and complete cross-platform fault/quality/sign-off remain open;
the full matrix stays seven of61 complete,54 open. No app install/rebuild, external
publication, source push or fresh numeric quality claim follows.


## Swift host owner cancellation and capacity — 11 October 2026

The actual Swift owner now passes twenty single-publication cases and a concurrent
four-send capacity/replay/recovery case. The original thirteen cases remain covered.
Task cancellation at the final before-send hook emits zero EVENTs. Post-send tests
first observe the exact EVENT independently, then signal approval revocation or
real Task cancellation while holding the connection open without an ACK. Receipts
stay unknown and the peer closes; observed latencies are23ms and6ms respectively.
Pre-send task cancellation takes5ms. These are controlled host measurements.

Silent and keepalive-only responses stop at10,010ms and10,009ms. Flooded notices,
oversized declared frames and existing ACK faults yield bounded unknown receipts.
Four ACKs are withheld while a fifth pair receives capacity denial; the consumed
pair's replay is denied. A fresh sixth target succeeds after release. The relay
observes five exact EVENTs in that case and no extra TCP connection. The owner's
actual active counter returns to zero after every settled case. This is capacity
restoration evidence, not complete scheduling/connection-lifetime or leak proof.

The existing proof-only route/anchor/hook is unchanged; production sources and
clock remain actual. Swift6 warnings-as-errors compilation,26 source fingerprints,
both proof binaries and original receiver/log outputs bind the result. TLS private
material is removed. No app build/install, protected signing, ordinary guest/Expo,
public DNS, physical iPhone or OS-lifecycle acceptance follows. Both retained native
products stay unchanged. No new numeric quality claim, source push, complete
physical row or phase closure; matrix seven of61 complete,54 open.


## Signed ordinary iPhone build verification — 11 October 2026

The current ordinary ARM64 iPhoneOS Release build succeeds under the retained app
ID, display name, team and certificate. All 1,459 source inputs and locked native
inputs stay unchanged during the build. The actual `HypergolicNappletHost` target
lists 52 owning Swift inputs, which match the preceding verified iPhone product;
the acknowledgement repair changed Android only. Its target configurations omit
the host proof flag. This is an incremental build and source binding, not a claim
that every owning Swift file was freshly compiled.

Strict signature, provisioning, architecture and packaged-original checks pass.
The ready copy seals 132 files and 68 byte-preserved notices. The JavaScript,
trusted host and 131 prior product files stay exact; only the signed executable
changes. No whole-executable byte-identity claim follows. The preceding retained
ready product remains unchanged.

The first observer used `NappletHost` instead of the actual target name and stopped
after a successful build and signature check. A subsequent sandboxed signature
observer reported a certificate-trust error; the same check with the authorized
build trust-store access passes. Both failures remain in private evidence. The
completed build was not restarted, and no certificate trust setting was changed.

This is local packaging evidence. Neither phone receives an install, input,
identity operation or publication. Android remains locked and the paired iPhone
reports that it has not been unlocked recently. Physical ordinary-app, guest,
protected-signer, lifecycle, published and complete fault/security checks remain
open, as do full external quality, dependency-age and clean-close decisions.
The physical matrix remains seven of 61 complete, with 54 open.


## Android ACK JSON syntax — 11 October 2026

The compiled Android ACK handler could capture non-JSON replies because its
object parser accepts extra syntax. The host baseline captures single-quoted and
bare strings, uppercase booleans and unescaped string controls. The physical
API 36 boot-framework parser independently reproduces single-quoted acceptance.
The exact disposable probe's crash log records the expected-denial assertion;
Android Runtime's uncaught-exception handler terminates that shell process.
Earlier exit-137 observations alone did not establish this cause. A test-wrapper
checked-exception compile failure is retained separately.

`OutboxResponseJson` now validates one complete relay-array JSON text before the
existing platform parser allocates its graph. The existing 2 MiB and depth-12
bounds remain. Strings/escapes, lowercase literals, number syntax, array/object
separators and JSON whitespace are checked without building a second object graph.
The platform parser still supplies the decoded values; exact event correlation,
Boolean/reason limits and first-ACK retention remain unchanged. Invalid post-send
syntax leaves the result unknown. The selected [NIP-01 revision](https://github.com/nostr-protocol/nips/blob/0046368a747c5c25ae2bec28bae0e537744c8f10/01.md)
uses JSON relay arrays; [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259)
provides their syntax. No new wire field or caller authority is introduced.

All 106 Android and 97 Swift host core assertions pass. The actual physical
Android repeats all 106 using boot-framework JSON under shell UID 2000, with
no packaged org.json definitions. Fifteen malformed grammar cases are denied;
valid escaped rejection text, JSON whitespace and nested other-message data
remain usable without capturing a foreign ACK. The driver also offers
`--ack-grammar` for the focused 37-assertion subset and retains failure logs only
for its exact disposable PID. All staged files are hash-checked, removed and
verified absent; the installed keeper and package inventory remain unchanged.

The native TLS writer/classifier suite passes 38 cases. Each Android and Swift
owner suite passes 27 cases plus capacity/replay/recovery. Independent receivers
observe the exact signed public fixture and malformed reply bytes; the seven
new reply forms produce unknown receipts. These controlled host transports do
not exercise a protected signer or ordinary app guest.

Outbox 102, security 353, bootstrap 13, TypeScript, ordinary Android prebuild and
signed ARM64 assembly pass. The new signed candidate preserves ID/name/certificate,
permissions, all 85 originals, JavaScript, 21 native images, three prior DEX files
and 96 assets; only classes4.dex changes. Generated packaging restores without
conflicts. No install occurs, and both retained iPhone ready copies stay exact.
The local Doctor scan has 442 files, no findings/skips and no numeric score;
source-only aislop has 436 supported files, no findings and 97 unsupported files.
The initial maintainability warning and final unsuppressed scan remain retained;
external audit and numeric scoring are still deferred pending approval.

This is a protocol-parser repair and physical primitive subset, not full JSON
conformance, protected signing, ordinary app/guest composition, physical lifecycle
or complete published/fault/security acceptance. OB-05 stays partial and the full
matrix remains seven of 61 complete, with 54 open. Both phones still need recent
unlock for interactive journeys. No public write, source push or Phase 3 advance.
