# Native identity unit suite

This macOS-hosted Swift suite compiles the owning production files from modules/identity-owner/ios and modules/identity-store/ios. It preserves the reviewed 52 Swift test functions and 82 cases, including parameterized cases. The test payload contains no production policy implementation or source copy.

Run from the repository root:

```sh
python3 -B scripts/test-identity-native.py
```

The runner generates a disposable SwiftPM package under the already-ignored .tools/identity-native-tests directory. Its relative symlinks point directly to the real production module directories and this suite's Tests directory. Only the small Package.swift template is copied into that generated package. There are no symlinks in committed test/source files, no root Package.swift, no external Swift dependencies and no Package.resolved. Do not weaken the source quality verifier to admit symlinks.

Use the selected full Xcode toolchain with Swift 6.3 or newer on macOS 15 or newer. DEVELOPER_DIR, when already configured, is respected. No developer-specific SDK path is stored here. Build/cache/config/security outputs remain inside the selected build directory. The existing root .gitignore is unchanged.

Read-only checks:

```sh
python3 -B scripts/test-identity-native.py --check-only
python3 -B scripts/test-identity-native.py --check-only --check-frozen
```

The ordinary run compiles current owning sources, allowing intentional source changes to be tested. --check-frozen additionally requires the reviewed native file set and hashes plus unchanged test files from source-manifest.json. Update that manifest deliberately when establishing a new frozen review; the runner never refreshes it silently. An optional --source-root supports pre-integration review of another checkout, and --build-root keeps all generated output in another disposable directory.

The 52 functions / 82 cases cover encrypted-file readback/recovery, no silent secret replacement, exact one-use deletion grants, native inventory/context binding, cancellation/revocation, runtime leases and native registry races. Authentication and Keychain are deterministic test adapters. The backing-store tests use real CryptoKit where already specified. The tests do not use a device or authentication prompt and do not read application identity data.

SwiftPM explicitly excludes the real Expo modules, LAContext adapter, UIKit observer and JSI runtime-lifetime source that require the iOS/Expo build environment. The production services file's iOS composition is also inactive on the macOS host. Those production files remain in source and must receive actual native build/runtime proof separately. The source manifest still accounts for all 18 native Swift files, including the excluded platform adapters.

The process owner claim is only admission for one trusted bootstrap per OS process. Compiling/testing that code and its exact-context registry does not establish generic runtime or napplet isolation. This suite does not prove actual Expo runtime disposal order, device PIN/biometric behavior, iOS backup/protection behavior, physical-device security or the required quality scores.
