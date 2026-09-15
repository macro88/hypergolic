# 02-07 iOS native execution progress

Status: **in progress**. Native host, scoped boundary and workspace regression
checks pass. Identity, signing, loading, remaining native attacks and full v1
acceptance remain open. This checkpoint does not complete plans 02-07 or 02-02.

## Implemented and observed

The Expo view mounts the genuine Kehto runtime and byte-verified embedded UX Lab
through `RestrictedNappletHost.swift`. This production core owns the WK policy;
`NappletHostView.swift` supplies Expo mount/recycle lifecycle. CocoaPods, the full
native application build and the portable boundary-harness build pass. The rebuilt
application was installed without deleting app data. Its complete built and installed
bundles match. Runtime assets are unchanged: host.js SHA-256
`8e8964d28f39d614270e20a301a6ff136b9e8fadb2c4163a21c77d890930df59`;
original UX Lab SHA-256
`01ab63dbcdadab0b44fd6f3b9a6bcfbd98d8c1de1510f96c821d3efe1876909c`.

The actual target is iPhone 17 / iOS 26.5 Simulator. The supported minimum is
18.4 for public file-chooser denial; minimum-OS and physical-device tests remain.
Debug execution requires Metro and does not establish standalone operation.

## Native boundary evidence

The independent harness compiles the owning production WK source. Thirteen
scenarios have observed passes across two preserved runs. Run one passed twelve
and had one XCTest recorder failure; run two corrected optional metadata recording
and passed that scenario without changing production policy or weakening assertions.
The checks exercise genuine Kehto readiness/theme, actual main/opaque-child frames,
storage/parent/native-handler denial, source spoof rejection, strict message schema,
UTF-8/generation checks, CSP denials, navigation revocation and unmount/reuse denial.

CSP observations do not prove packet-level zero egress. Unmount revokes authority;
a deliberately retained WK reference can still evaluate, so immediate renderer
termination is not claimed. Actual permission delegate execution, real renderer
termination, prebootstrap controls and physical-device behavior remain open.
Portable sources and commands: `tests/native/ios-boundary/README.md`.

## Shared workspace evidence

Earlier native runs passed seven iOS switching checks and thirteen Android
switching/state checks. The final gesture source passes these new independent runs:

- iOS content gestures: four checks, including both content scroll axes, selection
  and retained state after returning.
- iOS cancellation: three UI checks plus two archived-trajectory validators. The
  original 20-point stroke remains in overview, and a real two-finger pinch leaves
  all cards present. Both fingers start together; interruption by a later second
  finger remains unproved. Archived endpoints are not delivered callback samples.
- iOS closing: nine checks, including gentle card scrolling, rapid-swipe warning,
  Keep open state retention, exact visible-card removal, other-session retention,
  quiet empty overview and Settings/Open routes. It does not load a fresh fixture.
- Android: seventeen short-card and navigation/closing checks. Actual native input
  is causally bound to each app-owned WebView target, UUID generation and frame.
  Confirmed closes remove exactly one target until none remain; visible Settings
  then opens a fresh UX Lab 4. Earlier gentle-overview-scroll checks also pass.

The original iOS slow-card drag failed while a gutter drag scrolled normally.
`Gesture.Manual` corrected recognizer handoff. A separate short stroke exposed that
UIKit's tap recognizer can omit the lift endpoint in its movement-distance check.
The shell now validates `onTouchesUp.changedTouches` against the original pointer
before accepting a tap. Fresh runs on both platforms pass the original short stroke
and ordinary card tap. All diagnostic traces are removed; failed receipts remain.

Full installed/source manifests stayed unchanged during each passing run. Selected
checkout hashes plus an explicit cold launch are not an attestation of the exact
Metro bytes executed. Public iOS accessibility observations do not identify native
generation IDs, renderer destruction or animation frame pacing. Screen-reader and
release/device acceptance remain separate.

## Quality and evidence

Strict source/test TypeScript and 25 shell tests pass. Latest aislop: **100/100**,
37 supported files, five engines complete, zero findings. Latest complete React
Doctor: 38 analyzed files, zero findings, numeric score null in local privacy mode.
No numeric 100 is claimed; external scoring authorization remains pending. The
strict report verifier rejects incomplete, missing, stale or nonmaximum reports.

Private receipts and inspected captures are indexed under
`.tools/evidence/native-workspace-checkpoint-20260915`; portable harnesses live in
`tests/native`. Source remote and push remain owner-only. Next: integrate protected
identities, scoped persistence, individual approvals, verified loading/updates and
editable relay settings, then finish native and standalone device acceptance.
