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
