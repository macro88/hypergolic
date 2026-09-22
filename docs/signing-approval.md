# Signing approval implementation checkpoint

As of 22 September 2026, signing has tested foundations but is **not available in
the app**. Android and iOS must each complete the native journey before this
milestone is accepted. The selected policy remains one explicit approval per v1
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

The native cores receive already validated serialized snapshots. They do not
parse Nostr events or bind transport owners themselves. The shared native port
and protected signer remain unimplemented. No current WebView can call these
new modules; existing identity/storage/theme behavior and deadlines are unchanged.

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

Use fresh output directories. Android's owning JVM suite passes 90 assertions;
iOS's owning Swift suite passes nine tests. The actual Android module Java compile
and iOS Simulator pod compile pass. Neither native build is proof of signing.
The complete shared suite passes 335 security and 13 bootstrap tests. The approval
queue contributes 14 focused tests, event capture five, independent signatures four
and relay adapter twelve. Six local WebSocket tests independently inspect
actual frames, signatures and receipts, including partial acceptance and denied
AUTH. A test-only socket mapping connects approved metadata destinations to an
ephemeral loopback server; production destination validation is not relaxed.
The initial close-after-upgrade fixture raced dispatch; rejecting the upgrade now
makes the before-send case deterministic. The corrected suite passed three repeat
runs, with the failed run retained in local evidence.

Aislop reports 100/100 with zero errors or warnings. Its embedded dependency audit
timed out; a separate root dependency audit passed with no known vulnerabilities.
Local React Doctor reports zero findings but no numeric score. External scoring
still needs the separately requested permission; it is not claimed as 100/100.
The existing Expo 57.0.20 patch-version Doctor mismatch remains documented.

## Remaining integration

Connect native source/generation admission, immutable owner binding and reply
ownership to the lifetime cores on both platforms. Adapt only publication replies
to 660 seconds, with 600-second native expiry sweeps and explicit terminal replies
for requests pruned during other authority calls. Keep ordinary reads short.

Add the trusted review sheet and overview pending indicators, explicit rejection
and resume controls, and protected selected-identity signing with checks before
and after every asynchronous boundary. Bind signature bytes to the exact native
grant before effect delivery. Then connect Approval Lab through the genuine SDK,
Kehto whole-operation override, native transport and relay adapter, proving denial
and lifecycle races on Android and iOS. Do not expose a general WebView signer.

Destination checks currently validate metadata only; they do not verify resolved
DNS addresses or native network policy. That policy and native WebSocket behavior
need integration evidence. NIP-42 authentication stays denied until a separate
relay/challenge/socket/identity-bound approval exists. Finish physical-device
security and the complete v1 acceptance audit separately.
