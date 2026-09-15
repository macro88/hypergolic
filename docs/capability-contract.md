# Selected native capability contract

This is the engineering contract for the next identity/storage/approval milestones.
The current first host trace exposes shell/theme only. The same contract must be
implemented and tested through Android and iOS native adapters; this selection is
not a claim that privileged capabilities already work.

## Owning specifications and supported profile

Checked on 15 September 2026. Pin these exact bytes; do not promote a package type
or example into protocol authority.

| Surface | Owning revision | V1 selection |
| --- | --- | --- |
| SHELL, THEME, IDENTITY | [napplet/naps 5ac0490](https://github.com/napplet/naps/tree/5ac0490461ca6fec2f0d2e45b4835cf9bc08de24/naps) | Existing handshake/theme plus read-only identity |
| STORAGE | [PR3 f71e84e](https://github.com/napplet/naps/blob/f71e84ebca7474db260346cbfc2d88f41b4e421e/naps/NAP-STORAGE.md) | Explicitly selected draft get/set/remove/keys subset |
| RELAY | [PR2 0be8abc](https://github.com/napplet/naps/blob/0be8abce18beb46ca37bd4ddd042f58d30b4eedc/naps/NAP-RELAY.md) | Explicitly selected draft query/subscribe/close and individually approved publish |
| OUTBOX | [PR32 4589a8f](https://github.com/napplet/naps/blob/4589a8f9a16d8aa29b3740e2b3b0cdca11e0976e/naps/NAP-OUTBOX.md) | Reviewed, disabled; automatic NIP-65 routing is deferred |
| Relay authentication | [NIP-42 a2494f4](https://github.com/nostr-protocol/nips/blob/a2494f4f81d46684e5814a9bf35e2b1df978f955/42.md) | Separate explicit approval or auth-required denial |

NAP-IDENTITY is read-only; NAP-KEYS describes keyboard bindings. Do not invent
identity.signEvent or keys.sign. Approval Lab uses the genuine SDK's
relay.publish(EventTemplate). State Lab declares identity/storage; Approval Lab
declares identity/relay. Theme is optional; shell is mandatory. Required domain
tags are bare names, not Kehto ACL strings such as relay:write.

The inspected SDK0.27.2 depends on core0.31.1/NAP0.31.2. Its identity/storage/relay/
outbox type and SDK files match host NAP0.31.1 byte-for-byte. This establishes that
subset's package compatibility, not complete protocol or native conformance.
NAP0.31.1's RelayPublishMessage wrongly declares a signed NostrEvent, while the
owning draft, core API and SDK accept EventTemplate. Define boundary validation
from the owning unsigned shape; never supply a dummy signature to satisfy a type.

## Message shapes

Requests flow napplet to host. Correlation id is a bounded opaque string, never
authority. Results flow host to the original live source. Unregistered senders,
forged results/pushes, malformed envelopes and ungranted domains are rejected
before dispatch. Canonical failures use each operation's result/closed shape;
Kehto's nonstandard operation.error reply is not sufficient for this profile.

Identity operations use request type plus .result and the same id. Public-key
result is pubkey:string, including empty string when unavailable, and never an
error field. Identity change push is {type:identity.changed,pubkey} without id.
Other recognized read requests return supported values or the specified empty
defaults: getRelays→relays map, getProfile→profile|null, getFollows/getMutes/
getBlocked→pubkeys[], getList(listType)→entries[], getZaps→zaps[], getBadges→badges[].
Do not label bootstrap relay settings as discovered NIP-65 metadata. Unsupported
social/profile reads stay empty; no private signer enters the WebView.

| Storage request | Request fields besides type | Success result fields after type/id |
| --- | --- | --- |
| storage.get | id,key,scope? | value:string|null |
| storage.set | id,key,value:string,scope? | none |
| storage.remove | id,key,scope? | none |
| storage.keys | id,scope? | keys:string[] |

Scope is absent/shared or instance. The native registry supplies owner and instance;
there is no caller-selected publisher/user/instance field. Error uses the same
request type plus .result and error:string, with primary result fields absent.
Missing key is null; read failure is an error. Emit write success only after commit.
There is no storage.clear, dirty flag, transaction or migration wire operation.

| Relay request | Canonical shape/lifecycle |
| --- | --- |
| relay.publish | id,event:{kind,content,tags,created_at}; result id,ok,event?,eventId?,error? |
| relay.query | id,filters[]; result id,events:RelayEventResult[],error? |
| relay.subscribe | id,subId,filters[],relay?; relay.event(subId,result), relay.eose(subId), relay.closed(subId,reason?) |
| relay.close | id,subId; revoke only this session's subscription |
| relay.publishEncrypted | Recognize canonical request, return its .result with ok:false,error:publish denied |

RelayEventResult wraps a signed event and optional sidecar; never mutate the signed
event to add sidecar data. Resource sidecars/encryption are disabled in this minimal
profile. Do not claim unrestricted NAP-RELAY conformance. Preserve and validate the
canonical optional subscribe relay URL, or deny it explicitly. No automatic NIP-65
fanout, SDK convenience-field reinterpretation or private-network relay selection.

## Native ownership and storage continuity

Bind each native view to immutable sessionId, fresh generation, identityEpoch,
selected user pubkey, verified publisher, stable app/d-tag, aggregate version,
persisted instance ID and granted domains. Native registration supplies these;
untrusted JSON never selects its owner. Map original correlation by generation,
operation and napplet id; reject reuse with a different payload. Replies cannot
target a replaced view or source.

Use transactional SQLite composite columns for user, publisher, stable app,
aggregate/version, shared-or-instance scope, persisted instance ID or empty, and
opaque user key. The storage draft requires version isolation. The previous plan's
physical no-version namespace proposal is superseded. Preserve product continuity
on an explicitly accepted verified update by freezing/revoking old generations,
atomically copying saved strings into a new empty same-owner version namespace,
recording a receipt and selected version, then opening fresh generations. Keep the
old namespace. If the target already has retained state, do not overwrite it blindly.
On validation/copy/persistence failure keep the old selected version and data.
Never copy between users, publishers or stable apps; never run a napplet's migration
code in native authority. Byte-copy continuity does not promise schema compatibility.

Use prepared queries and a512KiB UTF-8 namespace quota including keys/values, bounded
keys/requests and serialized transactional quota checks. Delimiter-like keys remain
ordinary user data and cannot select an instance namespace. Persisted instance ID
survives reload/restart; native renderer generation does not. Closing retains shared
saved data. Secrets never enter this database or browser storage.

## Real Kehto admission and native operations

Retain genuine createShellBridge, namespace injection, source-window registry,
session/domain/capability/ACL/firewall checks. Add an explicit host-only operation
override after those checks and before builtin storage or signing. Preserve complete
windowId, original message and reply ownership. Absent override retains upstream
behavior; the native profile must not fall through to a signer after consuming a
publication request. This is an implementation adapter, not a new napplet protocol.

The pinned Kehto storage path bypasses services.storage and uses synchronous browser
localStorage. It can emit apparent success after persistence failure. Keep it disabled
and route storage natively. services.relay sees an already-signed event, so replacing
that service alone cannot implement approval. Keep Kehto auth.getSigner null; own
the entire approve-and-publish operation natively. The reviewed whole-operation patches are integrated and browser-tested. The
[native admission checkpoint](native-capabilities.md) records broker, registry and
WK transport proof and the connected owner/runtime. The isolated native State Lab
journeys have separate receipts; remote loading and signing remain unavailable.

Before and after asynchronous reads and immediately before every cryptographic or
network effect, validate live registration, epoch, focused review ownership, expiry
and cancellation. Native navigation admission revokes before replacement content
can inherit the WindowProxy; a second iframe load is only a backstop. Close, identity
change, accepted update, renderer/navigation failure and process death revoke old
authority. Late callbacks cannot mutate a new account or deliver to a new source.

## Exact approval, lifetime and outcomes

Validate unsigned EventTemplate fields, finite safe integers, kind bounds, dense
string tags and payload bytes. Freeze a deep-cloned exact NIP-01 snapshot including
selected pubkey and finalized timestamp. Freeze normalized native write destinations
before review. UI displays that immutable event and its actual publisher/app/identity.
No field or destination changes under an old approval. Sign a fresh copy, independently
reparse/hash/verify the result without trusting cached verification flags, then
recheck authority before sending. Approve once consumes the request once.

Admission limits are4 per session/16 global, at most600 seconds from native monotonic
receipt. Only the focused session is eligible; unfocused requests remain pending.
Dismiss rejects the current item and pauses review until explicit resume. User app
backgrounding preserves unapproved requests and pauses/hides review, while approved
in-flight authority is revoked and secret UI cleared. Do not cancel merely because
an OS authentication prompt transiently marks the app inactive. Process death never
persists or replays approvals.

The injected Kehto namespace otherwise times every request out after30 seconds, and
its builtin publish handler separately rejects event timestamps older than30 seconds
after signing. Configure only signing-publication response deadlines to660 seconds;
native expiry stays at most600 seconds plus bounded bridge admission, with native
timer sweeps and checks before effects. Route whole publication natively to avoid
the second stale-time check. Never refresh created_at after review. Ordinary read
timeouts remain short. No standardized caller-cancel wire message exists; do not
invent one. Test review beyond30 seconds and near expiry on both platforms.

Success requires at least one explicit relay acceptance, not a connected socket or
queued bytes. Keep per-relay accepted/rejected/unknown outcomes in trusted UI/harness.
Timeout after send is unknown; unsubscription cannot recall an already-sent event.
Do not silently retry or resign. Canonical free-text result errors cannot represent
all receipt nuance; retain the richer native outcome without inventing wire fields.

NIP-42 AUTH is a separate approved operation tied to exact relay/challenge/socket
generation/identity, or is denied with auth-required status. A note approval never
approves AUTH. Challenge change, reconnect or identity change revokes the old grant.
Never hand an unrestricted signer to automatic relay authentication. Kind22242 cannot
be used through ordinary napplet publish as an AUTH bypass.

## Required evidence

Both native platforms must exercise genuine SDK storage and relay publication,
canonical errors, wrong owner/generation, quota/commit failures, state separation,
accepted-update copy/rollback, exact-event mutation/replay, queue focus/dismissal/
background/expiry, sign/publish cancellation, independently verified signatures and
relay receipts, and navigation/renderer revocation. Fake-adapter unit tests and
Chromium/WebKit host tests are useful precursors, not native security acceptance.
