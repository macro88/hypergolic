# Signing approval implementation checkpoint

As of 23 September 2026, the native approval transport, trusted review UI,
protected signing and publication route are connected in source. Android has an actual approval-to-local-relay journey; both platforms have native
review/lifecycle evidence. The full milestone is **not accepted** on either platform. The selected policy remains one explicit approval per v1
event; future silent-signing policies are deferred.

## Implemented and tested

- Native Android and iOS lifetime cores own opaque session/request/approval handles,
  a fixed 600-second monotonic lifetime, four requests per session, sixteen overall,
  FIFO focused review and one approved operation globally. Focus loss revokes an
  approved operation. Backgrounding preserves pending work, revokes approved work
  and pauses review until explicit resume. Handle reuse and stale view deactivation
  cannot grant authority to another session. Cores are not exposed through Expo.
- The shared presentation queue consumes a native admission token once and uses
  separate process-unique UI IDs. It freezes the event and write destinations,
  isolates observers, and revokes before effect cleanup. Native liveness and
  selected-owner checks surround asynchronous signing and publication. Port doubles
  exercise pending queues, replay, limits, expiry, cancellation and failure cleanup.
- Unsigned templates accept exactly kind, content, tags and created_at. The selected
  pubkey, canonical NIP-01 hash and normalized destinations are immutable. Signed
  results must match every reviewed field and pass fresh hash/signature checks;
  cached library verification flags cannot establish validity.
- The relay adapter guards the actual WebSocket send, emits at most one exact EVENT
  per destination and never retries or emits AUTH. Only a matching explicit OK
  determines accepted/rejected. Failure before dispatch is cancelled-before-send;
  a missing receipt after dispatch is unknown. Revocation cannot recall sent bytes.
  Kind 22242 is denied through ordinary publication.

The transport captures the exact original request and native registration after
source, generation and shared sequence checks. Opaque authority handles stay
native; the shared adapter can claim only a random native token. It compares the
captured identity, publisher, app, version, instance and generation with the
receiving trusted view. The frozen event then reaches the shared review queue.

Only `relay.publish` uses the 600-second native lifetime and 660-second SDK/client
deadline. Ordinary native capability leases remain 25 seconds, with 27-second
client and 30-second SDK deadlines. Publication uses Kehto's whole-operation
override; the legacy browser relay pool and generic signer remain unavailable.
Approval Lab is now bundled from the exact standalone SDK artifact, with its
unsigned manifest and hashes checked by the runtime build.

The vault captures its selected identity/revision before serial queue admission,
rechecks protected inventory and metadata around secret reads, and checks native
approval authority before and after synchronous signing. Temporary byte buffers
are cleared on success and failure. No secret is passed to the napplet. Rejection
continues review; dismissal rejects one request and pauses the queue. Pending
requests appear in overview and resume explicitly in the focused trusted shell.

## iOS inactive-state presentation repair — 8 October 2026

Native iOS already pauses review on `willResignActive`. The shared listener now
also suspends presentation on React Native `inactive`, as well as background and
other non-active startup states. Returning to active preserves the pause and
requires explicit Resume. Pending requests retain their exact event; approved
in-flight work is revoked before a late completion can publish. This aligns the
trusted UI with native authority and does not automatically resume or approve.

The [React Native 0.86 AppState contract](https://reactnative.dev/docs/0.86/appstate)
describes inactive interruptions. Two regressions exercise actual ApprovalService
pending retention, explicit resume and late-sign cancellation. The repaired normal signed physical iPhone build passes four controlled
Control Center interruption checks and nine warm two-session queue checks. Return
shows explicit Resume for the same request; both queues remain origin-bound and
all six cross-session requests are individually denied. Actual overview badge
geometry avoids duplicate accessibility nodes. Full Back/swipe, delayed emission,
native signer counters and other physical acceptance cases remain open.

## Protocol and dependency evidence

The owning [capability contract](capability-contract.md) selects the unsigned
NAP-RELAY draft at `0be8abce18beb46ca37bd4ddd042f58d30b4eedc`, NIP-01 at
`01e707bacdc87cf262db80545aecaa8f17ac2a4f`, and the separate NIP-42 authority rule.
The adapter uses exact `applesauce-relay` 6.2.1, `applesauce-core` 6.2.0 and `rxjs`
7.8.2. The inspected relay package reports source revision
`faf30d2b5fd785acaf5b72c3095867348528583f`. Its `event()` observable still queues
until connection readiness, so a subscription-time check alone cannot revoke a
later send. Its higher-level retrying publication helper is not used.
Root `nostr-tools` remains 2.24.0; Applesauce's own compatible nested dependency
is retained by pnpm rather than overridden. Local wire tests use pinned `ws` 8.21.3.

## Reproducible checks and limits

From the repository root with pinned tools enabled:

```sh
source .tools/use-local-tools.sh
pnpm run typecheck
pnpm run test:security
pnpm run test:relay
python3 tests/native/android-approval-authority/runner.py \
  --output /private/tmp/hypergolic-android-approval-proof
source .tools/use-ios-tools.sh
python3 tests/native/approval-unit/runner.py \
  --build-root /private/tmp/hypergolic-ios-approval-proof
```

Use fresh output directories. The foundation Android authority has 90 assertions;
the transport registry adds 56. The foundation Swift authority has nine tests,
with a separate source-linked transport suite. Actual Android Kotlin and iOS
CocoaPods compilation pass. Neither native build is proof of signing.
The foundation checkpoint passed 335 security and 13 bootstrap tests. Integration
adds native-token ownership, final response delivery and protected signing races;
current validation is recorded in the plan progress note. Six local WebSocket tests independently inspect
actual frames, signatures and receipts, including partial acceptance and denied
AUTH. A test-only socket mapping connects approved metadata destinations to an
ephemeral loopback server; production destination validation is not relaxed.
The initial close-after-upgrade fixture raced dispatch; rejecting the upgrade now
makes the before-send case deterministic. The corrected suite passed three repeat
runs, with the failed run retained in local evidence.

The foundation checkpoint reported aislop 100/100 with zero errors or warnings. Its embedded dependency audit
timed out; a separate root dependency audit passed with no known vulnerabilities.
That checkpoint
also reported local React Doctor zero findings but no numeric score; the integrated
UI is being rechecked. External scoring
still needs the separately requested permission; it is not claimed as 100/100.
The existing Expo 57.0.20 patch-version Doctor mismatch remains documented.

## Native integration checkpoint — 23 September 2026

The Android API 36 isolated Release fixture passes visible rejection with zero
relay frames, explicit approval with three independently verified identical EVENTs,
relay rejection, auth-required rejection without AUTH, and unknown post-send
closure. SDK replies and native outcome text agree with the received frames.
A separate run holds three WebSocket upgrades, backgrounds an approved operation,
then releases them: native revocation leaves zero EVENT or AUTH frames.

Both Android and iOS pass exact event/identity/publisher/destination review,
individual rejection, dismissal followed by explicit queue resume, and backgrounded
pending requests without an automatic prompt. The iOS test is an unsigned Release
Simulator app with a labelled public-identity fixture; protected storage and signing
are deliberately unavailable. It is not iOS signing or physical-device proof.

Native testing exposed a persisted-descriptor versus canonical-publisher mismatch.
The owner now uses the same reviewed catalogue resolver as native registration,
including instance binding. A real workspace regression covers the fix and stale
ownership. iOS final response delivery also rechecks and consumes native approval
on the main actor before emitting success.

Current checks pass: 344 security, 13 bootstrap, 31 capability, 80 storage and
25 shell tests; 146 Android owning assertions; 11 Swift transport tests; 82 runtime
checks; and 32 standalone Approval Lab browser tests. Its conformance report still
has five passes and five explicit skips. Failed native attempts remain recorded;
selector/input harness failures are distinguished from the corrected owner bug.

See the [Android publication driver](../tests/native/approval-publication.md),
[review driver](../tests/native/android-approval-review/README.md), and
[loopback relay](../tests/relay/native-review-server.md). Native proof uses a test-only
socket mapping and isolated generated network override, never public publication.
Normal application entry and network policy remain unchanged. The restored normal
Android entry passes the same review/queue/background journey. Both normal
application entries also compile as Release builds, including the actual iOS
JavaScript bundle; the iOS build alone is not protected-storage runtime proof.

## Remaining acceptance

Complete the SDK → Kehto → native transport → review → protected signing → relay
journey on iOS and the remaining cross-platform fault matrix, including focus
changes, expiry and final reply ownership. Android local-relay evidence does not
prove production TLS/DNS policy or physical-device behavior. Simulator public-identity UI fixtures cannot establish
iOS protected storage or physical-device authentication.

Destination checks currently validate metadata only; they do not verify resolved
DNS addresses or native network policy. That policy and native WebSocket behavior
need integration evidence. NIP-42 authentication stays denied until a separate
relay/challenge/socket/identity-bound approval exists. Finish physical-device
security and the complete v1 acceptance audit separately.

## Independent physical relay observation

The ordinary signed iPhone note path has source-bound physical evidence for
individual Reject and individually approved accept, all-relay reject, delayed ACK,
no-ACK timeout, disconnect and mixed results. An external TLS-fronted local relay
captures exactly one EVENT per reviewed destination, verifies the actual signed
fields/public key/NIP-01 ID/Schnorr signature and compares matching ACKs with the
native banner and genuine SDK outcome. Denied notes have zero observed oracle EVENT
frames. This proves bounded network behavior; it does not supply a native signer
counter. Delayed-before-emission review, badge and exact focused hash also have
scoped physical evidence. Full SIGN rows remain partial pending all named native
effect, interruption, other-kind, adversarial and cross-platform cases.


## Approval Lab note/profile fixture

The standalone fixture now selects a kind-1 note or kind-0 profile update, following
the selected NIP-01 revision above. Profile content is JSON with the captured `about`
text; the visible warning calls for a development identity because accepting relays
replace that identity's profile. The immutable request retains its selected kind,
content, tags and timestamp even if later editor controls change. Native trusted
review, approval, signing and publication remain the existing authority owners.

Previously saved Approval Lab views keep their exact previous bundled version via
the internal `approval-lab-v1` artifact. This retained copy is unavailable for new
openings or fixture releases; new views use the extended artifact. Old pins are not
rewritten and published artifact verification is unchanged. Both native parsers
require the same identity/relay/theme domains. Browser/model checks are not physical
kind-0 signing, protected-read counters or retained-view upgrade acceptance.


Signed ordinary Android and iPhone Release builds and platform exports pass with
the current and retained artifacts. The iPhone update installs into its existing
disposable QA identifier and normally launches. Direct read-only workspace copies
before/after verify the exact revision70, six descriptors, opening order, selection
and version pins. The current shared resolver accepts those actual saved pins,
including both previous Approval Lab artifacts. This is storage continuity plus
host resolution; guest rendering and protected identity/signing are not inferred.
The primary installed metadata and both local product seals remain unchanged.
The Android product is built/signed but not installed in this checkpoint. No blind
retry of the previously rejected USB installation is made.


## Current physical iOS approval cores — 8 October 2026

A separate signed native test app compiles 49 current production Swift sources.
All 21 methods pass on the physical iPhone in one run: nine current authority tests,
eleven current transport tests and the original plan/ACK proof with 50 assertions.
Both current unit files change only their testable module import. The original
public fixture and plan assertions remain exact; no baseline is updated in this
checkpoint. The transport baseline was intentionally changed in the preceding
artifact-retention implementation; current and historical copies remain distinct.
The initial preparation stopped before build/device action because it expected 22
methods; the actual complete set is 21, and no selection was reduced.

This executes the actual native cores and parser, including retained-archive domain
admission and revocation before asynchronous delivery. Clocks, schedulers, replies
and the grant callback are controlled doubles. It does not exercise owning Expo,
protected key reads/signing, real WSS emission, guest input or gestures. Full SIGN,
security, Outbox and published/physical rows therefore remain open.

After that successful native run, one existing signed UI readiness runner still
fails before test initialization. Device logs confirm test-service connection,
runner authorization and daemon-session initialization, followed by a 60-second
automation-enable timeout. This establishes the failing stage, not its root cause
or the device's UI Automation setting. No new guest request executes. Both app
metadata and local product seals are unchanged; the primary process is retained.
The QA app returns normally using its existing process. Saved guest rendering is
still not visually reverified.

The six-patch Expo proposal is prepared outside the checkout. Lock-only resolution
fails under the existing seven-day release-age rule: SQLite 57.0.4 is too recent;
Expo 57.0.27 is also too recent. Registry timestamps put both at eligibility on
13 October 2026 after 12:11:24 UTC. No audit, compatibility test or actual lockfile
update follows that failure. Existing pins, age policy and approved exceptions stay
unchanged. The ordinary Expo check and normal quality gate remain red.

All 61 full requirements/platform statuses remain unchanged: three cross-platform
complete, 58 open. Only documentation changes in this checkpoint; application code
is unchanged and the preceding quality reports are historical whole-repository
reports after these edits. No new packaging or quality scan is claimed. Phase 2
remains active; weekly usage is 65%, with an authorized ceiling near 98%. No source
push or source remote change.


## Physical iPhone note/profile approval — 9 October 2026

The unchanged signed normal QA app completes individual note and profile review,
rejection and approval with the known disposable development identity. Seven
checks combine three retained predecessor checks and four passing continuation
checks. Failed observers remain retained: paused queue needed explicit Resume;
React Native exposed the same exact-event text in parent/leaf nodes; SDK success
uses `Event ID <hash>`. The previously approved note was independently reconciled
before continuing and was never republished. Production code is unchanged.

Independent read-only NIP-01 checks verify both approved hashes, Schnorr signatures,
kind, content, tags, time and selected public key from damus and nos.lol. The app
reports three relay acknowledgements, while bucket.coracle returns EOSE without
either exact event; acknowledgement does not establish independent persistence.
Both rejected hashes are absent in bounded relay reads, which does not prove zero
native signing effects. Trusted profile review pixels show the exact content,
origin, publisher, identity, destinations and individual actions. Expanded JSON
is present in native accessibility and independently hashes correctly, but its
original PNG is black and it is below the decoded video viewport. Visual proof
of that expanded JSON remains open.

Only the owned current Approval view closes; the original six-view order and UX
focus return. All1,221 current source inputs, both local product seals/installed
metadata and the primary process remain unchanged. Original-build differences
are documentation/tests only; installed executable bytes were not retrieved.
No app reset/rebuild, private-key access, uncertain replay or source push.

Private evidence group `iphone-two-kind-approval04` retains all four runs, original
attachments and independent readers. SIGN-01/05/06 stay partial. All61 original
requirements and statuses remain: six complete across both phones,55 open. Next
protected backup needs real device authentication after test recording stops;
all-route signing, native counters/faults, Android parity and final quality remain
open. This documentation checkpoint does not rerun or change historical quality
results or their explicitly accepted dependency exceptions.
