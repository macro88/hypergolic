# iOS WK boundary tests

This independent UIKit app compiles the owning `modules/napplet-host/ios/RestrictedNappletHost.swift` directly by PBX source reference. There is no second policy implementation. It uses a separate `org.nostrocket.hypergolic.boundaryprobe` identity and a generated, byte-verified resource bundle. The Expo wrapper remains an owning-app integration check.

Historical checkpoint: the reviewed core was exercised on iPhone17 Simulator/iOS26.5: 12 methods passed in the first 13-method run; an invalid-session receipt helper asserted an intentionally absent URL. After correcting optional recorder metadata, that one method passed separately. The original failed run remains preserved in private build evidence. This describes observed coverage across two runs, not one green suite.

The 13 methods cover genuine Kehto ready/theme, opaque parent/native/storage access, guest and synthetic diagnostic source spoofing, absent handler in wrong worlds, real child-frame native rejection, exact native schema/generation/UTF-8 limits, valid main-frame diagnostic admission, per-URI CSP network denial, top/self navigation, actual core unmount/session revocation, and invalid/reused sessions. Native-only instrumentation installs a distinct isolated-world observer before load to capture genuine WKFrameInfo. The app exposes no Expo testing API.

All script stimulus is privileged native frame-scoped injection. Its execution is not a guest CSP bypass. Each denial that should leave a live session is followed by a parent-source theme.get.result barrier with exact expected palette. CSP evidence requires individually attributed effectiveDirective/blockedURI for fetch, WebSocket, image, script and worker. It does not establish packet-level zero-egress. A native-retained WKView can still evaluate after unmount; the test establishes handler/session revocation, not renderer disappearance. No private forced-process API or fabricated native frame/message is used.

From this directory, after the owning runtime assets exist (`pnpm runtime:build` at repository root):

```sh
python3 build.py
```

The helper verifies the reviewed core/wrapper/fixture hashes, creates ignored Resources/, compiles without simulator input, rejects changing inputs and seals full app/test products in ignored `build/boundary-build.json`. A future runtime/core change requires review and a fresh explicit expected-runtime baseline. Never silently regenerate expected hashes from whatever source happens to exist.

After an explicit device handoff, use the chosen already-booted UDID and a fresh private xcresult path:

```sh
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild test-without-building \
  -project BoundaryProbe.xcodeproj -scheme BoundaryProbe \
  -destination 'platform=iOS Simulator,id=EXPLICIT_UDID' \
  -derivedDataPath build -resultBundlePath evidence/FRESH-RUN.xcresult \
  -parallel-testing-enabled NO -maximum-concurrent-test-simulator-destinations 1
```

Record pre/post sealed source and product hashes and export actual xcresult summary/attachments. A successful compilation is not a native test pass. Tests attach actual nonce-bound frame metadata, generation/session values, native events and JSON observations. Preserve failed runs and distinguish unsupported native claims from executed evidence. Physical-device and production Expo-wrapper validation remain separate.

## Native capability transport checkpoint

The 15 September 2026 transport revision passes all 17 tests in one Simulator run.
The source-linked target now also compiles CapabilityLeaseRegistry.swift and
CapabilityTransport.swift; their hashes are part of the explicitly reviewed
baseline. The unchanged UX Lab runtime includes the previously reviewed Kehto
operation patches. Four additional tests admit native-owned snapshots, exercise
one-use replies, deny forged sources/frames/generations, and revoke claimed work
on close or frame navigation. Capability requests use privileged native injection;
no real SDK storage, database, signer or Expo-wrapper journey is claimed here.
All 18 sealed inputs and 12 products matched after execution. Historical failed
receipts remain preserved separately. See [scope and remaining work](../../../docs/native-capabilities.md).
