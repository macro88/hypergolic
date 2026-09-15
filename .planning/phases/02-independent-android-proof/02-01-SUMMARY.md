---
phase: 02-independent-android-proof
plan: "01"
subsystem: runtime
tags: [android, expo, kehto, webview, sandbox]
requires:
  - phase: 01
    provides: Pinned Expo scaffold and original UX Lab
provides:
  - Restricted native Kehto host with an actual UX Lab trace
  - Reproducible asset build and current debug/emulator boundary evidence
affects: [02-02, 02-03, 02-04, 02-05, 02-06]
key-files:
  created: [runtime/src/main.ts, modules/napplet-host/android/src/main/java/org/nostrocket/hypergolic/host/NappletHostView.kt, tests/native/driver.py]
  modified: [src/App.tsx, package.json, docs/native-contract.md]
requirements-completed: []
completed: 2026-09-15
status: complete
---

# Native host checkpoint

The real Kehto host runs the original hash-verified UX Lab in the Android WebView.
Actual ADB input changes its counter and draft; readiness and theme pass through
the selected host protocol. This completes the first implementation milestone,
not any full-v1 security, fixture or release requirement.

## Implementation and checks

The local Expo module admits only its trusted packaged document and script, uses
an exact-origin/main-frame/generation-bound diagnostic listener, and destroys failed
views. Kehto registers one opaque iframe with only shell/theme enabled. Both build
and runtime verify original artifact bytes. A recorded dependency patch removes a
weak random fallback in correlation IDs and fails when secure entropy is absent.

The current installed Debug APK and bundled asset hashes, exact native result
directories and the 26 passing browser tests are recorded in
[02-01-PROGRESS.md](02-01-PROGRESS.md). Native evidence covers actual input,
listed frame/native/storage/network denials, independent receiver controls,
self-navigation teardown, renderer loss and bounded trusted diagnostic fault
injection. The app was restored and passed its five trace checks afterward.

Typecheck, Android prebuild/Gradle, Android export, React Doctor, aislop and configured
audit gates pass. `pnpm run check` stops at the existing Expo Doctor 57.0.20 versus
~57.0.22 mismatch; the accepted pin is preserved. No remote CI or source push ran.

## Deviations and limits

Implementation, hardening and harness files are committed as one coherent local
checkpoint because the first native path was built and measured together. Planning
was committed separately as `c93a944`. Pre-existing iOS/app configuration edits stay
outside the implementation commit; generated artifacts and private captures stay
ignored. The commit containing this summary is the implementation checkpoint.

Browser source/sibling/pre-ready tests and native trusted-host fault injection are
labelled separately. They do not prove forged native origin/main-frame metadata or
all untrusted native pre-ready/sibling paths. Those, resource exhaustion, additional
platform permission paths and release/phone adversarial artifacts remain explicit
final acceptance work. No broad security row is marked complete. Native privileged
adapters must revoke authority at navigation admission before replacement content
can inherit a WindowProxy; current post-load cleanup alone is insufficient for them.

The counter's numeric accessibility value and WebView descendant activation need
further UI/device work. The current Debug build requires Metro. No identity, signing,
saved data, published installation or independent release is implied.

## Next

The user clarified that v1 requires Android and iOS. Add the equivalent iOS native
host and platform-specific evidence alongside the shared switcher and two-column
overview. Further broad interviews are unnecessary. This Android checkpoint cannot
substitute for iOS execution or the complete two-platform v1 journey.
