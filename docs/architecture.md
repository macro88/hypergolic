# Architecture

## V1 platform and quality requirements

V1 must work on **Android and iOS**. Both need real native napplet execution and
the complete shared identity, gesture, approval, persistence and published-loading
journey. Local standalone builds and platform-specific evidence are required.
The earlier Android-only finish line and iOS deferral are superseded by the user
correction of 15 September 2026. Public app-store publication remains separate.
Final React Doctor and aislop scores must both be 100/100 without hiding findings.

## MVP capability scope — 29 September 2026

The MVP scope corrected on 30 September extends through Outbox: relay query/subscriptions, resources,
uploads, public identity data, external links, intent/inc, notify/config and outbox,
alongside existing shell/theme/storage and approved publication.
The [roadmap](../.planning/ROADMAP.md) preserves the accepted order and dependencies;
the [requirements](../.planning/REQUIREMENTS.md) define CAP-01–CAP-12 and CAP-14 for MVP. Value/zaps (CAP-13)
and Value Lab move to post-MVP phase 4. Every MVP group
needs a test napplet and native Android/iOS acceptance. This expands scope without
claiming implementation or selecting wallet providers or new draft revisions.

The [upload phase](upload-access.md) passes selected Android/iOS native SDK
journeys for prepared photos, unchanged attachments, revoked picker recipients,
approved exact uploads, transfer faults, queues and durable uncertainty recovery.
Normal shell admission of a locally supplied signed Upload Lab now passes both
selected hosts, including first-open review, original SDK receipt, selected WAV
and cold-restored cache/grant. The owner approved a single documented exception for the still-visible Expo
tooling dependency advisory after its tested locked patch. CAP-05 is accepted
for this selected profile under that exception. Physical/protected identity, ordinary identity-switch parity and
public-provider acceptance remain final MVP gates.

Photo preparation stays inside the native picker/upload owner, before any guest
handoff or trusted review. The shared service verifies output identity and presents
the prepared content; guest MIME, caption and filename cannot choose sanitation
policy. This makes the reviewed hash describe the actual native-owned output.

The selected [configuration contract](notifications-configuration.md) now reports
both a negative registration ACK and one requester-bound schema-error push. Six
ordinary physical Android SDK checks verify the repair, preserved values and peer
isolation after a data-preserving app update. A separate nine-check ordinary
physical Android run proves masked secret set/cancel/clear, peer isolation, actual
process-restart persistence, depth-four values and schema-removal orphan purge.
The next identity-isolation run found schema loss after cancelled identity selection.
The shared owner binding now retains routing registrations during confirmation;
actual switches still revoke them. Red/green shared regressions, native registry
checks and both signed products pass. The corrected eight-case ordinary physical
Android run verifies
exact cancellation preservation, confirmed remounts, separate identity-scoped
values and restoration on both return switches. Both modified scopes restore
defaults and the original identity/empty workspace; keeper inventory and bytes
verify. Earlier application and observer failures remain recorded.
Complete physical iOS, broader owner/version isolation, configuration fault/update
and published acceptance remain open.

## Implemented

`index.ts` registers `src/App.tsx` with Expo. Both native hosts run verified,
bundled UX Lab, State Lab and Feed Lab artifacts through the restricted Kehto view. The
[identity/storage integration](native-capabilities.md) connects the genuine SDK to
a process-owned identity authority and SQLite; the original UX Lab retains only
theme access. State Lab and its peer are unsigned, embedded test artifacts with
reserved fixture namespaces. Their presence does not establish publisher trust.

The [relay query adapter](relay-query.md) mediates bounded historical reads through
the native lease and app-only WSS transport. Feed Lab has isolated native Android
and iOS Simulator query/lifecycle evidence. The selected [live subscription
profile](relay-subscriptions.md) now passes eight actual native WSS lifecycle
checks and nine diagnostic SDK/native fault cases on each platform. Switching
retains loaded feeds; background cancels sockets and foreground refreshes bounded
reads. Broader relay operations and full published compatibility remain open.

The [public identity resolver](public-identity-data.md) uses native-captured ownership,
signed bounded relay reads and a dedicated reverified SQLite cache. Separate trusted
consent governs public mutes and categorized lists; Settings revocation also gates
queued native delivery. Phase 2.5 selected acceptance is recorded in `docs/public-identity-data.md`; broader protected and physical MVP gates remain Phase 2.11.
The ordinary header now shares that resolver through an app-only selected-profile
read. A process-owned avatar store binds user/epoch, cancels on transition/background,
and supplies bounded native-HTTPS raster bytes as a local image source. Missing,
denied or failed images use the deterministic fallback. The controlled valid/missing/broken
profile, identity-switch and cold-restart journey now passes UX-02 on both physical
platforms; native transport fault attribution and broader identity security remain
separate requirements.
See the trusted shell avatar section in the identity document.

The [external-link owner](external-links.md) provides native per-opening HTTPS review,
normal OS handoff and identity/lifecycle revocation. Its selected Android/iOS native profile
and CAP-07 are accepted under the two documented locked dependency exceptions. Domain admission alone
does not establish completion of a capability.

The shell enters through a native identity vault; Android protected entry and
public identity continuity have native evidence, while iOS protected storage needs
a physical iPhone. See the [identity checkpoint](identity-storage.md). The
[workspace controller](workspace-storage.md) persists opening order, selection and
explicit empty state per identity. Android loaded foreground WebViews remain resumed for
live overview previews; selected focus separately gates media and privileged
operations. Activity background pauses rendering and playback. The physical
Android overview/media regression is scoped in that checkpoint. Confirmed [identity changes](identity-switching.md)
revoke the old authority and restart all loaded napplets. Authenticated identity
backup is implemented with native-only reveal and explicit device authentication;
physical-device acceptance remains open. The [signing integration](signing-approval.md)
connects native lifetime authorities, immutable event checks, protected signing,
trusted review and the relay adapter. Android passes the isolated SDK-to-local-relay
journey; iOS passes native review/rejection with a public-identity Simulator fixture.
Physical iOS signing and the full acceptance audit remain open. Published napplet
link, manifest and HTML verification exist as a pre-execution gate. Both native
modules now stage the verified bytes through a bounded app-only transfer and
one-use registry. Both native host views can claim the handle and stream bytes
to the trusted packaged runtime; browser and standalone native proofs pass.
The Settings QA path opens one locally embedded signed published view on both
native hosts. Ordinary workspace entry now resolves a pasted `naddr` through the
configured Lookup relays and native HTTPS transport, verifies the signed event
and HTML, requests first-open consent, pins the exact event and saves its grant.
The NIP-19 decoder accepts valid `naddr` TLV field orderings; re-encoding an
address must not be used as a byte-for-byte admission rule. The owner-approved
[tolerant admission policy](nap-support.md) lets verified napplets launch after
trusted review even when requested domains are unavailable. Review lists every
requested domain and warns about unavailable features; only the supported
intersection becomes native authority. Request-set or support-profile changes
require fresh review, and Settings retains capability details. The host admits
`identity`, `storage`, `theme`, `relay`, `resource`, `upload`, `link`, `intent`,
`inc`, `notify` and `config` for verified napplets. Published Outbox access is
withheld pending acceptance. Upload admission has scoped normal-shell native
evidence; its selected acceptance uses the documented patched-tooling exception.
Requests for `cvm`, `webrtc`, `fs` or `media` no longer block launch, but their
services remain unavailable. The address decoder follows
[NIP-19 at revision 0046368](https://github.com/nostr-protocol/nips/blob/0046368a747c5c25ae2bec28bae0e537744c8f10/19.md),
which defines address TLV fields and does not prescribe their ordering.
Settings can check for a newer signed event; a separate explicit update review
keeps the old session until acceptance, and changed access requires another
consent review. The process-owned coordinator stages accepted bytes through the
one-use native handoff. The network boundary is described in
[published-network.md](published-network.md). Embedded signed public-only
revisions now pass first-open, decline, accept, cold-restart, rollback-denial
and background-revocation/retry journeys on Android API 36 and iOS Simulator.
A second embedded signed coordinate adds `relay` access in v2; both platforms
pass a separate changed-access review, denial retaining v1, and acceptance
replacing it with v2.
A public-only live relay/Blossom first-open journey passes on Android API 36,
Android API 29 with WebView 91, and iOS 26.5 Simulator, including exact review
and connected guest rendering. API 26 with bundled WebView 58 safely refuses
guest execution because native message-listener support is unavailable.
The normal Android API 29 Release app also passes public remote first-open
consent and restores the connected guest with the same npub after cold restart.
Live published updates, protected identity security and physical-device
acceptance remain open.
Controlled host-JVM plus API 26/API 29 Android-runtime HTTPS/WSS and host-macOS plus
iPhone Simulator iOS HTTPS/WSS TLS proofs cover selected failure paths. The
emulator/Simulator proofs run owning transports as standalone binaries; app
lifecycle and physical-device failure paths remain open.
Inactive identity deletion now has a shared
review and an Android system-PIN journey; iOS
action acceptance still requires a physical device.
The supplied logo is visible in the native header. Native journeys, boundary
probes and their limits are recorded separately; full v1 acceptance remains open.

`app.json` enables Android and iOS, disables hosted updates and uses
`org.nostrocket.hypergolic.dev` as the development package/bundle identifier. The
previous iOS scaffold evidence remains scoped to that earlier checkpoint. A real
WKWebView host now builds and reaches Kehto Ready on the iPhone Simulator.
Independent native workspace and boundary checks are recorded in
[execution progress](../.planning/phases/02-independent-android-proof/02-07-PROGRESS.md).
Physical-device execution and full native security acceptance remain open. There
is no EAS project, hosted build configuration, user key or relay connection.

The iOS image dependency builds from source with WebP1.6.0 and an immutable
libdav1d wrapper/submodule pin. A hash-checked CocoaPods hook applies the released
tile-offset backport while retaining the1.2.0 version. Host regression and signed
packaging evidence remain distinct from full codec/physical security acceptance.
See [native dependency provenance](native-dependency-notices.md).

Expo generates the ignored `android/` and `ios/` trees. Source configuration and the lockfile
are authoritative. `plugins/withUnsignedRelease.cjs` replaces the generated release
debug-key configuration with unsigned output and fails if the template is no longer
recognized. Final APK signing is a separate local operation with an owner-controlled
keystore. The [tester APK command](development.md#tester-apk-command) automates
building, local signing and artifact verification using that existing key; it does
not establish native security acceptance. Do not edit generated native files as
permanent configuration.

The Expo config blocks the unused Android template declarations for vibration,
overlay windows and read/write external storage. A regenerated ARM64 Release APK's
merged manifest contains Internet, network state, biometric and legacy fingerprint
compatibility, plus Android's internal non-exported receiver permission. The app
still needs native device security review; these package declarations are not a
napplet capability policy.

## Intended boundary

The React Native shell owns identities, signing decisions, permissions, and native
operations. A bundled trusted Kehto host adapts the selected NAP subset inside a
restricted WebView. Verified napplet bytes remain untrusted; publisher pinning does
not grant native authority. Applesauce supplies selected Nostr event/relay plumbing.
Kehto is now installed in an isolated web build with reviewed package/protocol
pins and a restricted identity/storage/theme boundary. The Applesauce relay
adapter is connected to native approval and protected signing, with Android local
wire evidence and iOS review/lifecycle evidence. Integration
follows the [selected capability contract](capability-contract.md);
the native broker never falls through to a browser signer or localStorage.

First launch must create and securely persist an identity; later launches must reuse
it. Storage failures must never cause silent replacement. Explicit `nsec` import
belongs in trusted settings after entry. Retain previous identities encrypted,
provide a saved-identity selector and optional manual backup. Export and deletion
require device authentication; keep them unavailable when authentication cannot
be completed. For iOS manual backup, warn that screenshots cannot reliably be
prevented; hide during recording/mirroring and before app-switcher snapshots.
This supported-API limitation was accepted on 22 September 2026. Require another saved identity before deleting the last one.
A profile editor is only a UI example, not a required napplet.
External signers are phase 2.

## Confirmed product direction

V1 has a minimal square-logo / focused-napplet-name / avatar-and-short-npub header.
The [supplied Hypergolic logo](../assets/brand/README.md) is preserved in the brand
assets. The confirmed starting header size is 32 logical pixels, to be validated
on the native device.
The logo has no tap action. The avatar opens trusted settings, including the full
copyable npub, saved identities and Open napplet. A pasted published napplet link
opens after verification. After an ordinary exit with an open napplet, later launches
reopen the last active napplet subject to verification. Deliberately closing all
napplets persists the empty state across restarts and overrides automatic reopening.
Restore the overview list and opening order, and reload other napplets from saved
data when selected. Normal live switching preserves unsaved state; unsaved drafts
are not guaranteed to survive process termination in v1. The catalogue is a future
napplet.

V1 accepts compatible napplets from any publisher when their artifacts verify.
On first open, show the publisher and requested access for explicit confirmation.
Verification does not establish publisher trust or bypass signing approval. Keep
the selected version pinned until the user accepts a verified update, respecting
unsaved-work and session safeguards.

V1 includes multiple loaded napplets: thumb-height inset side handles for previous/
next, handle taps for a zoom overview, card taps for zoom return and upward card
swipes for close. The accepted phone overview starts with a two-column grid; card
sizing and motion remain subject to device testing. Loaded napplets keep their
opening order, with new napplets appended at the end; focusing does not reorder
them. Switching stops at the first and last napplet with a small resistance
animation instead of wrapping. Handle taps still open the overview at either end.
Normal switching preserves input and scroll. Closing terminates
the session and pending approvals while preserving saved data; unsaved or unknown
state requires a Keep open / Close anyway warning. After a card is closed, keep
the overview open while other napplets remain; do not automatically focus another
napplet. Closing the final napplet leaves a quiet empty overview with an Open
napplet action using the existing settings flow. Identity/settings stay accessible.
The dirty-state contract and exact native gestures still need selection and phone
validation.

Every v1 event update requires explicit confirmation in a trusted shell-owned
sheet. Show the requested action and content, requesting napplet and publisher,
and selected identity. Exact event details are expandable; the actions are
Approve once and Reject. Review multiple signing requests one at a time, with no
Approve all control in v1, including when one action produces several events.
Each approval stays specific and independently testable, at the cost of more taps.
Dismissing the signing sheet rejects the current request and returns to the
napplet. Other requests remain pending, with review paused until the user resumes
it. Dismissal gives the user a reliable exit from the approval flow. Pending signing
requests are cancelled after process termination and relaunch; napplets must submit
fresh requests.
On iOS, inactive interruptions also pause review. Returning to active requires
explicit Resume; native authority and shared presentation use the same suspension
policy. Approved in-flight work is revoked. See the [repair evidence](signing-approval.md#ios-inactive-state-presentation-repair--8-october-2026).
This makes the request understandable while retaining access to the precise event
for inspection. Layout refinement, exact payload binding and request lifecycle
handling still need implementation and validation.
Approval requests from an unfocused napplet wait for focus and show an overview
indicator. Future policy by event kind, publisher and napplet may permit silent
background signing; that engine is deferred. Identity switching confirms once,
cancels pending requests and restarts all loaded sessions under the single selected
identity. Cancelling preserves them.
Saved data is scoped to user + verified publisher + stable napplet identity.

Use the [RocketShell relay defaults](relays.md) as editable local startup lists,
keeping network reads/writes separate from lookup/manifest discovery. The settings
service persists edits; selected Network relays reach signing approval and selected
Lookup relays feed trusted published entry. Live first-open routing now passes
in public-only Android/iOS fixtures; production identity and live updates remain
to be proved. Automatic NIP-65 relay-list discovery and routing remain unimplemented and are now
required by the MVP outbox phase; the 29 September scope decision supersedes the
previous post-v1 deferral.

Purpose-built test napplets are approved, with embedding first and publication
under the designated key later. The standalone UX Lab and its browser tests are
implemented separately from the app. See [test napplets](test-napplets.md) for the
approved suite, source registry, commands, evidence and remaining native work.

## Remaining engineering gates

| Area | Required engineering output |
| --- | --- |
| Published napplet loading | Extend the proven public-only live first-open path to protected production identity and live updates on both platforms; choose our fixture publication destinations and retain exact-version failure evidence |
| Kehto/NAP/native adaptation | Pin compatible Kehto, NAP, NIP-5A and proposed NIP-5D revisions; define schemas, caller binding, error/resource limits and smallest host capability surface |
| Identity protection | Choose Android and iOS storage/encryption and secure manual export handling; implement confirmed failed-read, preservation and whole-shell switch behavior |
| Signing approval | Bind exact payload authorization through asynchronous work; implement accepted cancellation/restart rules; define queue bounds, expiry, revocation and partial failures |
| WebView isolation | Define CSP/network/navigation rules, native bridge reachability, origin/message binding, per-napplet storage isolation and device attack tests |
| Remaining UX and relay details | Tune native gestures, zoom, keyboard/accessibility and memory behavior; define dirty-state reports and refine the confirmed approval sheet; wire editable relay defaults and test authentication requirements |

Resolve these before their dependent implementation. Library selection and static
scanner scores cannot settle them. The seed already specifies useful negative
tests; assign each to an implementation plan and record target-device evidence.


## Resource boundary — Phase 2.3

The granted `resource` domain routes genuine SDK calls through the injected Kehto facade and captured native capability broker. A resource-owned HTTPS operation repeats public DNS/address and TLS checks on each of at most two HTTPS redirects. App-only bounded byte reads feed the trusted resource service; verified Blossom, one-hop public Nostr JSON and data bytes share its MIME/size/lifetime admission. A separate realm-bound one-use transfer pool projects complete Blobs into the SDK without enlarging ordinary JSON messages.

Memory cache lifetime follows the loaded napplet. Trusted native focus/background control pauses Blob media and return requires Play. Download server settings use a dedicated public SQLite store across identities. The [resource profile](resource-access.md) records the owning draft, active SDK facade, exact engineering limits, native evidence requirements and post-Phase-4 Hashtree/SVG gaps. CAP-04 acceptance and physical/published MVP completion remain separate.


## Intent and INC boundary — Phase 2.7

The [selected intent/INC profile](intent-inc.md) uses a verified identity-specific manifest catalog, explicit user defaults, trusted per-dispatch/topic/channel reviews and native-attested cross-view routing. Foreground switching remains live; background pauses topics and closes channels without a payload backlog. Closed handlers reopen through the ordinary exact pinned artifact path. Trusted Settings removal preserves saved data. Native lifecycle/identity/generation authority, strict wire capture and bounded transport remain mandatory; final signed/cold/fault acceptance is tracked separately from compilation.

The [notifications and configuration profile](notifications-configuration.md) adds native-attributed foreground alerts, exact-channel remembered permission and Settings revocation, plus a shell-owned bounded schema editor. Configuration has its own native encrypted namespace and aggregate-hash scope. The selected Phase 2.8 profile passes both native lifecycle/fault matrices and ordinary Release packaging; physical/protected and full published acceptance remain CAP-14.

## Outbox routing — implementation closed, acceptance in Phase 2.11

The [selected Outbox context](../.planning/phases/02.9-outbox-routing/02.9-CONTEXT.md) records A1–F1: the pinned draft, bounded public-WSS discovery, per-identity cache intervals, explicit read/own-publication fallback and reviewed existing signed relay-list redistribution. Signed kind10002 lists use NIP-01 replacement winners and separate read/write roles under existing public-WSS restrictions. Bundled Feed Lab getEvent/query/resolveRelays and subscriptions now use native source/identity ownership, Lookup discovery, identity-specific SQLite cache and app-only data transport. Both Android and iOS pass the [Plan02 native read/stream journeys](../.planning/phases/02.9-outbox-routing/02.9-02-SUMMARY.md), including cold cache, exact signed results, observed relay hints, truthful partial reads, switching, fresh routing before foreground reconnection, close and identity revocation. Private native completion signals never become guest outbox.eose. Original SDK publication now uses immutable native review, protected primary signing and separate primary/existing-list receipts. Actual Android production emulator publication subsets pass; iOS native core and presentation do not prove supported protected signing. The owner closed implementation on 5 October and moved all remaining acceptance into [Phase 2.11](../.planning/phases/02.11-published-mvp-acceptance/02.11-OUTBOX-HANDOFF.md). CAP-12 final acceptance remains open. The [selected routing profile](outbox-routing.md) documents D-07–D-09, native bounds and the existing-list extension to the pinned draft.

## Trusted fixture publication

The claimed identity owner also composes the bounded Settings fixture publisher
described in [fixture-publisher.md](fixture-publisher.md). Its separate native
registry admits only packaged, catalog-pinned HTML. It reuses the protected
vault projections, native upload/approval cores, durable recovery ledger and
public DNS/TLS owners. Guest transports never receive this registry or its
opaque tokens. Upload approval, stored-byte verification, manifest approval and
independent signed-event retrieval are distinct stages. This development tool
confers no published Outbox admission or additional guest upload formats.

The trusted release recovery codec persists HTML metadata while guest HTML byte
admission stays denied. The private HTTPS owner retains the single transfer
claim, and relay ACKs are compared to the reviewed snapshot's canonical URL set.
The first protected public Android fixture releases and ordinary published Feed
Lab relay query are verified; full iPhone release and published Outbox acceptance
remain open. See the scoped checkpoint in the owning fixture publication document.


The Outbox publication owner has a compile-time HYPERGOLIC_NETWORK_PROOF route
for separate native QA builds. It retains the real reservation, atomic send gate,
ACK classifier and receipt completion while selecting a controlled TLS receiver.
Ordinary builds exclude the route and use the existing public relay policy.
See the [physical transport evidence and limits](../.planning/phases/02.11-published-mvp-acceptance/02.11-04-CHECKPOINT.md#physical-owning-publication-transport).


The selected upload interoperability profile accepts a WAV MIME alias only after
native byte validation and retains canonical SDK MIME separately from the provider
receipt. Recovery owns a distinct two-redirect fixed-hash GET profile with fresh
public DNS/TLS per hop; alternate-origin absence stays unknown. Approved PUTs
remain exact one-use transfers without redirects. See [upload access](upload-access.md).


Native iOS backup handoff: successful LocalAuthentication must also regain active UIKit presentation before any backup-secret read. The backup adapter waits at most five seconds while rechecking the same native attempt, cancellation, background and protected-data availability. Existing selected-identity/inventory/deadline/capture/panel checks still apply. Core regressions and the signed native build pass; actual physical reveal remains an owner-device acceptance step. See [identity storage](identity-storage.md).
