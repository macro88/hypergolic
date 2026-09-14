# Architecture

## Implemented

`index.ts` registers `src/App.tsx` with Expo. The app renders one static development
screen. `app.json` configures Android only, disables hosted updates, and uses the
development application ID `org.nostrocket.hypergolic.dev`. That ID reserves no
production naming decision. There is no EAS project, hosted build config, key,
relay connection, instantiated WebView, or runtime bridge.

Expo generates the ignored `android/` tree. Source configuration and the lockfile
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
Neither Kehto nor Applesauce is installed yet: package/protocol compatibility and
the bridge surface need review together before runtime code is introduced.

First launch must create and securely persist an identity; later launches must reuse
it. Storage failures must never cause silent replacement. Explicit `nsec` import
belongs in trusted settings after entry. Retain previous identities encrypted,
provide a saved-identity selector and optional manual backup protected by device
authentication. A profile editor is only a UI example, not a required napplet.
External signers are phase 2.

## Confirmed product direction

V1 has a minimal square-logo / focused-napplet-name / avatar-and-short-npub header.
The [supplied Hypergolic logo](../assets/brand/README.md) is preserved in the brand
assets. The confirmed starting header size is 32 logical pixels, to be validated
on the native device.
The logo has no tap action. The avatar opens trusted settings, including the full
copyable npub, saved identities and Open napplet. A pasted published napplet link
opens after verification; later launches reopen the last successful napplet subject
to verification. The catalogue is a future napplet.

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
napplet. The final-napplet empty state is still an open decision. The dirty-state contract and
exact native gestures still need selection and phone validation.

Every v1 event update requires explicit confirmation. Approval requests from an
unfocused napplet wait for focus and show an overview indicator. Future policy by
event kind, publisher and napplet may permit silent background signing; that engine
is deferred. Identity switching confirms once, cancels pending requests and restarts
all loaded sessions under the single selected identity. Cancelling preserves them.
Saved data is scoped to user + verified publisher + stable napplet identity.

Purpose-built test napplets are approved, with embedding first and publication
under the designated key later. The standalone UX Lab and its browser tests are
implemented separately from the app. See [test napplets](test-napplets.md) for the
approved suite, source registry, commands, evidence and remaining native work.

## Seed review: implementation blockers

| Decision needed | Required engineering output |
| --- | --- |
| Published napplet loading | Select link contract, delivery/publisher trust, artifact/version and rollback policy; identify fixture publisher, signer and relay/Blossom destinations |
| Kehto/NAP/native adaptation | Pin compatible Kehto, NAP, NIP-5A and proposed NIP-5D revisions; define schemas, caller binding, error/resource limits and smallest host capability surface |
| Identity protection | Choose Android storage/encryption and secure manual export handling; implement confirmed failed-read, preservation and whole-shell switch behavior |
| Signing approval | Define exact payload authorization, binding through asynchronous work, revocation, timeout and restart behavior |
| WebView isolation | Define CSP/network/navigation rules, native bridge reachability, origin/message binding, per-napplet storage isolation and device attack tests |
| Remaining UX and relay details | Tune native gestures, zoom, keyboard/accessibility and memory behavior; define dirty-state reports and approval UI; settle NIP-65 deferral and NIP-42 from selected relays |

Resolve these before their dependent implementation. Library selection and static
scanner scores cannot settle them. The seed already specifies useful negative
tests; assign each to an implementation plan and record target-device evidence.
