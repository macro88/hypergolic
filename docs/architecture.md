# Architecture

## V1 platform and quality requirements

V1 must work on **Android and iOS**. Both need real native napplet execution and
the complete shared identity, gesture, approval, persistence and published-loading
journey. Local standalone builds and platform-specific evidence are required.
The earlier Android-only finish line and iOS deferral are superseded by the user
correction of 15 September 2026. Public app-store publication remains separate.
Final React Doctor and aislop scores must both be 100/100 without hiding findings.

## Implemented

`index.ts` registers `src/App.tsx` with Expo. The Android and iOS screens host the
bundled UX Lab through the [restricted native Kehto view](native-contract.md).
The current application runtime exposes readiness and theme only. The next
[native identity/storage admission layer](native-capabilities.md) is implemented and
partly native-tested, with owner/runtime connection still pending. The shell now enters through
a native process-owned identity vault; Android public-identity continuity is
observed, while iOS protected storage needs a physical iPhone. See the
[identity implementation checkpoint](identity-storage.md). The [workspace controller](workspace-storage.md) now persists opening order, last
selection and explicit empty state per public identity. The shared
[identity selector and import flow](identity-switching.md) now restart all loaded
napplets after a confirmed change. Authenticated identity actions, signing, napplet
saved-data access and published loading remain incomplete. The SDK-based State Lab
and peer fixture now build independently, and the pinned Kehto whole-operation
adapter passes browser checks; neither is exposed as a native privilege yet. The supplied logo
is visible in the native header. Current emulator evidence covers actual input,
theme, listed boundary denials and renderer-failure teardown; full native acceptance
and remaining release/device adversarial probes stay open.

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
keystore. Do not edit generated native files as permanent configuration.

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
pins and a theme-only boundary. Applesauce and the privileged native adapters are
planned under the [selected capability contract](capability-contract.md); native
conformance and exact authorization must be validated before exposure.

First launch must create and securely persist an identity; later launches must reuse
it. Storage failures must never cause silent replacement. Explicit `nsec` import
belongs in trusted settings after entry. Retain previous identities encrypted,
provide a saved-identity selector and optional manual backup. Export and deletion
require device authentication; keep them unavailable when authentication cannot
be completed. Require another saved identity before deleting the last one.
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
keeping network reads/writes separate from lookup/manifest discovery. Automatic
NIP-65 relay-list discovery and routing are deferred beyond v1.

Purpose-built test napplets are approved, with embedding first and publication
under the designated key later. The standalone UX Lab and its browser tests are
implemented separately from the app. See [test napplets](test-napplets.md) for the
approved suite, source registry, commands, evidence and remaining native work.

## Remaining engineering gates

| Area | Required engineering output |
| --- | --- |
| Published napplet loading | Pin the link/delivery contract; implement accepted first-open trust and explicit verified updates; define version retention/failure handling and fixture publisher/signer/release destinations |
| Kehto/NAP/native adaptation | Pin compatible Kehto, NAP, NIP-5A and proposed NIP-5D revisions; define schemas, caller binding, error/resource limits and smallest host capability surface |
| Identity protection | Choose Android and iOS storage/encryption and secure manual export handling; implement confirmed failed-read, preservation and whole-shell switch behavior |
| Signing approval | Bind exact payload authorization through asynchronous work; implement accepted cancellation/restart rules; define queue bounds, expiry, revocation and partial failures |
| WebView isolation | Define CSP/network/navigation rules, native bridge reachability, origin/message binding, per-napplet storage isolation and device attack tests |
| Remaining UX and relay details | Tune native gestures, zoom, keyboard/accessibility and memory behavior; define dirty-state reports and refine the confirmed approval sheet; wire editable relay defaults and test authentication requirements |

Resolve these before their dependent implementation. Library selection and static
scanner scores cannot settle them. The seed already specifies useful negative
tests; assign each to an implementation plan and record target-device evidence.
