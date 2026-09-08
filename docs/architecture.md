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
belongs in trusted settings after entry. Profile name/photo editing belongs in a
napplet. External signers are phase 2. These are confirmed requirements.

## Seed review: implementation blockers

| Decision needed | Required engineering output |
| --- | --- |
| Remote profile napplet arrangement remains proposed | Confirm delivery, publisher key, artifact/version and rollback policy; select relay and Blossom endpoints |
| Kehto/NAP/native adaptation | Pin compatible Kehto, NAP, NIP-5A and proposed NIP-5D revisions; define schemas, caller binding, error/resource limits and smallest host capability surface |
| Identity protection | Choose Android storage/encryption and backup behavior; define failed-read behavior and import cancellation/replacement preservation |
| Signing approval | Define exact payload authorization, binding through asynchronous work, revocation, timeout and restart behavior |
| WebView isolation | Define CSP/network/navigation rules, native bridge reachability, origin/message binding, per-napplet storage isolation and device attack tests |
| Product details | Left icon/action, minimum settings/navigation, permission UI, and NIP-65 deferral; determine NIP-42 from selected relays |

Resolve these before their dependent implementation. Library selection and static
scanner scores cannot settle them. The seed already specifies useful negative
tests; assign each to an implementation plan and record target-device evidence.
