# Architecture

## V1 platform and quality requirements

V1 must work on **Android and iOS**. Both need real native napplet execution and
the complete shared identity, gesture, approval, persistence and published-loading
journey. Local standalone builds and platform-specific evidence are required.
The earlier Android-only finish line and iOS deferral are superseded by the user
correction of 15 September 2026. Public app-store publication remains separate.
Final React Doctor and aislop scores must both be 100/100 without hiding findings.

## Implemented

`index.ts` registers `src/App.tsx` with Expo. Both native hosts run verified,
bundled UX Lab and State Lab artifacts through the restricted Kehto view. The
[identity/storage integration](native-capabilities.md) connects the genuine SDK to
a process-owned identity authority and SQLite; the original UX Lab retains only
theme access. State Lab and its peer are unsigned, embedded test artifacts with
reserved fixture namespaces. Their presence does not establish publisher trust.

The shell enters through a native identity vault; Android protected entry and
public identity continuity have native evidence, while iOS protected storage needs
a physical iPhone. See the [identity checkpoint](identity-storage.md). The
[workspace controller](workspace-storage.md) persists opening order, selection and
explicit empty state per identity. Confirmed [identity changes](identity-switching.md)
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
Settings can check for a newer signed event; a separate explicit update review
keeps the old session until acceptance, and changed access requires another
consent review. The process-owned coordinator stages accepted bytes through the
one-use native handoff. The network boundary is described in
[published-network.md](published-network.md). Embedded signed public-only
revisions now pass first-open, decline, accept and cold-restart journeys on
Android API 36 and iOS Simulator. A live public relay/Blossom journey and
physical-device acceptance are still open.
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

Expo generates the ignored `android/` and `ios/` trees. Source configuration and the lockfile
are authoritative. `plugins/withUnsignedRelease.cjs` replaces the generated release
debug-key configuration with unsigned output and fails if the template is no longer
recognized. Final APK signing is a separate local operation with an owner-controlled
keystore. The [tester APK command](development.md#tester-apk-command) automates
building, local signing and artifact verification using that existing key; it does
not establish native security acceptance. Do not edit generated native files as
permanent configuration.

APK inspection shows Expo's template currently declares Internet, vibration,
overlay-window permission, read/write external storage through API 32, and its
internal non-exported receiver permission. The screen requests none of these at
runtime. Review and remove unnecessary declarations before product/device security
acceptance; these template defaults are not a chosen napplet capability policy.

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
Lookup relays feed trusted published entry. Live routing on both platforms and
the Settings journey remain to be proved. Automatic
NIP-65 relay-list discovery and routing are deferred beyond v1.

Purpose-built test napplets are approved, with embedding first and publication
under the designated key later. The standalone UX Lab and its browser tests are
implemented separately from the app. See [test napplets](test-napplets.md) for the
approved suite, source registry, commands, evidence and remaining native work.

## Remaining engineering gates

| Area | Required engineering output |
| --- | --- |
| Published napplet loading | Prove live public relay/Blossom retrieval and native first-open/update on both platforms beyond embedded fixtures; choose fixture publication destinations and retain exact-version failure evidence |
| Kehto/NAP/native adaptation | Pin compatible Kehto, NAP, NIP-5A and proposed NIP-5D revisions; define schemas, caller binding, error/resource limits and smallest host capability surface |
| Identity protection | Choose Android and iOS storage/encryption and secure manual export handling; implement confirmed failed-read, preservation and whole-shell switch behavior |
| Signing approval | Bind exact payload authorization through asynchronous work; implement accepted cancellation/restart rules; define queue bounds, expiry, revocation and partial failures |
| WebView isolation | Define CSP/network/navigation rules, native bridge reachability, origin/message binding, per-napplet storage isolation and device attack tests |
| Remaining UX and relay details | Tune native gestures, zoom, keyboard/accessibility and memory behavior; define dirty-state reports and refine the confirmed approval sheet; wire editable relay defaults and test authentication requirements |

Resolve these before their dependent implementation. Library selection and static
scanner scores cannot settle them. The seed already specifies useful negative
tests; assign each to an implementation plan and record target-device evidence.
