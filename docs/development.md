# Development

## Versions

| Component | Pin | Source |
| --- | --- | --- |
| Node / pnpm | 24.20.0 / 10.34.5 | `.nvmrc`, `packageManager` |
| Expo / React Native / React | 57.0.20 / 0.86.3 / 19.2.3 | root manifest and lockfile |
| TypeScript | 6.0.3 | root lockfile |
| Java | Temurin 17.0.20.1+1 | CI API version notation: `17.0.20+101` |
| Android API / build-tools | 36 / 36.0.0 | Expo and React Native generated inputs |
| NDK / CMake | 27.1.12297006 / 3.22.1 | native dependencies |
| Gradle / Android Gradle plugin | 9.3.1 / 8.12.0 | generated wrapper / React Native version catalog |
| GSD Core | `@opengsd/gsd-core` 1.13.0 | root lockfile |
| React Doctor / Expo Doctor | 0.9.13 / 1.20.4 | root lockfile |
| aislop | 0.16.0 | `tools/quality/pnpm-lock.yaml` |

Node, pnpm, Expo, React, React Native, TypeScript, GSD, React Doctor and aislop declare MIT
licenses. Temurin uses GPLv2 with the Classpath Exception. Android SDK packages carry
Google's SDK terms; Gradle is Apache-2.0. The installed Kehto and Applesauce
packages declare MIT licenses; their selected versions are pinned in the root/runtime
manifests and lockfiles. Phase2.11 records installed production JavaScript metadata
and a [native dependency metadata/notice checkpoint](native-dependency-notices.md).
Final shipped-component and notice coverage remain open. This table is not a
complete distribution license inventory.

## Install and check

Use Node 24.20.0 and pnpm 10.34.5, then run from the repository root:

```powershell
pnpm install --frozen-lockfile
pnpm run quality:install
pnpm run check
pnpm run export:android
```

Use the pinned pnpm version from `packageManager` with Node 24.20.0. If the optional
local tool bundle is present under ignored `.tools/`, enable it for this session:

```powershell
. ./scripts/use-local-tools.ps1
node --version
pnpm --version
java -version
```

This changes only the current process environment. On another machine, install the
table's versions normally and set `JAVA_HOME` and `ANDROID_HOME`; `.tools/` is not
distributed. The helper sets `jdk.net.unixdomain.tmpdir` to `.tools/java-tmp` when no
explicit setting exists: the machine's default Windows temp path caused Gradle's
JVM pipe to fail with `Invalid argument: connect`; a normal local path fixed startup.
Node Windows archive SHA-256:
`6cac9ffbca8f6a47091e4b5c772e0606049c3871cb67d900c0cedde630e545ba`.
Temurin Windows archive SHA-256:
`e53a79c3c3d86865bd7e787903884331068e71321714ffd44f145785affc7cb0`.

## Android

Install Android API 36, build-tools 36.0.0, NDK 27.1.12297006 and CMake 3.22.1 through
Android Studio's SDK Manager or the official Android CLI. On this machine the downloaded
command-line tools are revision 23.0. The new CLI takes slash
package names; the sdkmanager compatibility wrapper split old semicolon names.

On macOS, an existing checkout-local `.tools/` bundle can supply the pinned Node,
Java and Android SDK. It is ignored by Git and does not configure a new shell
automatically. From the repository root, **source** its helper in the same terminal
before running Expo:

```sh
source .tools/use-local-tools.sh
node --version
java -version
adb devices -l
pnpm run android
```

The helper sets `ANDROID_HOME`, `JAVA_HOME` and `PATH` only for the current shell.
If `.tools/` is absent, install the toolchain normally and set `ANDROID_HOME` to
the actual SDK directory with `platform-tools` on `PATH`. A fresh terminal without
either setup makes Expo search the default `~/Library/Android/sdk` and fail to
spawn `adb` when the SDK lives elsewhere.

```powershell
. ./scripts/use-local-tools.ps1
& ./.tools/android-sdk/cmdline-tools/23.0/cmdline-tools/bin/android.exe --sdk "$env:ANDROID_HOME" sdk install platforms/android-36 build-tools/36.0.0 ndk/27.1.12297006 cmake/3.22.1
pnpm run prebuild:android
./android/gradlew.bat -p android assembleRelease --no-daemon -PreactNativeArchitectures=arm64-v8a
```

On Linux/macOS use `pnpm` and `cd android && ./gradlew assembleRelease --no-daemon
-PreactNativeArchitectures=arm64-v8a`. The scaffold targets ARM64 in this command;
choose `x86_64` for a matching emulator. Prebuild may regenerate `android/`; commit
configuration/plugins instead of editing that tree. Gradle downloads native artifacts
from Maven/Google and its distribution server; the package registry and those registries remain build
dependencies. No EAS command or Expo account is required by this route.

The expected output is `android/app/build/outputs/apk/release/app-release-unsigned.apk`.
It embeds JavaScript and does not need Metro, but it must be signed before installation.
The plugin deliberately removes Expo's default debug signing for release builds.
The tracked `app.json` blocks unused vibration, overlay and external-storage
permissions during prebuild; verify the final merged release APK, not only the
generated manifest, with `"$ANDROID_HOME/build-tools/36.0.0/aapt" dump permissions
android/app/build/outputs/apk/release/app-release-unsigned.apk`. Debug builds may
retain overlay permission for development tools.

Set `HYPERGOLIC_KEYSTORE_PATH` privately to an owner-controlled keystore, then use
build-tools 36.0.0 locally:

```powershell
# These commands prompt for passwords; never put credentials in tracked files.
$buildTools = Join-Path $env:ANDROID_HOME 'build-tools/36.0.0'
& "$buildTools/zipalign.exe" -P 16 -f -v 4 android/app/build/outputs/apk/release/app-release-unsigned.apk .tools/hypergolic-aligned.apk
& "$buildTools/apksigner.bat" sign --ks $env:HYPERGOLIC_KEYSTORE_PATH --out .tools/hypergolic.apk .tools/hypergolic-aligned.apk
& "$buildTools/apksigner.bat" verify --verbose --print-certs .tools/hypergolic.apk
Get-FileHash .tools/hypergolic.apk -Algorithm SHA256
adb install .tools/hypergolic.apk
```

No release keystore is generated by setup. Confirm production app ID and signing
credential custody before the first real release. Installation, cold launch with
Expo hosted services unavailable, restart behavior, and seed security tests require
device evidence. The scaffold cannot complete the seed's identity/profile journey.

A development-signed copy from this machine is `.tools/hypergolic-development.apk`.
It was signed explicitly using the generated Android Debug keystore after the
unsigned build. Its hash and verification are in `phase-zero.md`. This is not a
production release. At that phase-zero checkpoint, device checks were awaiting
local security-prompt approval. Later emulator checks are recorded separately;
physical-device and seed security acceptance still need their own evidence.

## Stable physical test installs

Use **Hypergolic** as the display name on both platforms. Update the existing
physical test packages in place: `org.nostrocket.hypergolic.napsupportfixture` on
Android and `org.nostrocket.hypergolic.mvpacceptance` on iOS. Retain each package's
existing signing identity; do not append a phase number to its name or identifier.
This preserves app data and gives device installation permissions a consistent
package to apply to. Device policy may still require an installation prompt.

These are established development test packages, separate from a production
release identity. Do not uninstall or clear their data as part of an update.
Restore temporary generated packaging changes after building. Keep durable
configuration in the app configuration or plugins, not the ignored native trees.
The 6 October Android in-place update succeeded without another installer prompt;
the signed iPhone update subsequently installed in place after unlocking. See the
[Plan02 checkpoint](../.planning/phases/02.11-published-mvp-acceptance/02.11-02-CHECKPOINT.md)
for the acceptance scope.

## iOS development

The app enables iOS with development bundle identifier
`org.nostrocket.hypergolic.dev`. The earlier scaffold targeted iOS 16.4; the native napplet host now targets
iOS 18.4 and uses Hermes. Keep generated `ios/` ignored; make permanent configuration changes through
app configuration or plugins. The Android unsigned-release plugin is unchanged.

Verified on 12 September 2026: Xcode 26.6 (17F113), iOS 26.5 Simulator (23F77),
iPhone 17, and CocoaPods 1.16.2. Pod installation completed with 86 pods using
Homebrew Ruby 4.0.5 and the pinned Node/pnpm. Native Debug compilation, installation
and launch passed with no errors and one duplicate `-lc++` linker warning.

Enable the pinned Node/pnpm environment first. Select full Xcode for each shell:

```sh
export DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer
```

For an absent native project, build the bundled runtime and generate only iOS to
preserve Android:

```sh
pnpm run prebuild:ios
```

The iOS image module builds from source through the package-specific
`expo.autolinking.ios.buildFromSource` selection in `package.json`. The permanent
`expo-build-properties` configuration pins its CocoaPods WebP dependency to 1.6.0.
This replaces the older WebP decoder in the precompiled ExpoImage framework;
a JavaScript export alone cannot update the native codec. Regenerate the native
project and install pods after changing this configuration:

```sh
pnpm run prebuild:ios
cd ios
pod install
cd ..
pnpm run test:native-codec-patches
pnpm run test:native-webp
pnpm run test:native-dav1d
```

The regression compiles the installed codec's 119 C files with the macOS SDK and
AddressSanitizer/UndefinedBehaviorSanitizer. It checks eight undersized Huffman-table
allocations, an exact lossless RGBA round-trip and twelve short-header rejections.
Its receipt hashes all 176 installed C/header files and checks their stability,
plus the test source and Pod lock. Output stays in a fresh temporary directory;
the compiled test binary and its debug-symbol bundle are removed even on failure. This is host-source evidence.
Build and install the signed ordinary iPhone app separately, then test actual
native image decoding. See [native dependency provenance](native-dependency-notices.md#source-built-ios-webp-repair--10-october-2026).

Run CocoaPods from the `ios` directory: the installed Expo autolinker resolves
`Podfile.properties.json` relative to its working directory. Invoking it from the
repository root can omit `apple.extraPods`, even with `--project-directory=ios`.

`plugins/withNativeCodecPatches.cjs` pins the libdav1d wrapper to an immutable Git
commit with its dav1d submodule included. Its CocoaPods post-install hook applies
the released upstream tile-offset fix to the known 1.2.0 source. The manifest
checks both complete file hashes before writing, accepts already-patched sources,
and rejects unexpected source or hook changes. It preserves source file modes.
The version remains 1.2.0; this is a backport rather than a new released wrapper.

`test:native-codec-patches` exercises the real Expo plugin and Ruby hook, including
repeated generation, conflicting pins, incomplete hooks, source drift before any
write, and read-only file modes. It needs the installed iOS Pod sources.
`test:native-dav1d` extracts the actual installed tile-offset loop and uses the
owning native structures in a host ASan/UBSan arithmetic regression. Three small
synthetic grids check twelve exact offsets, including the signed-integer boundary.
It does not decode AV1 bitstreams or prove behavior on a phone. Temporary binaries
and debug symbols are removed. The complete native dependency and physical review
remain required; see [decoder provenance](native-dependency-notices.md).

The native host's iOS resource bundle includes the original notices in
`modules/napplet-host/ios/Resources/notices/`. Its manifest pins source versions,
immutable upstream references and original file hashes. Pod evaluation rejects a
missing, changed or extra notice file before generating the bundle. Update the
owning inventory and byte-preserved originals together when changing an image
library; do not rewrite third-party terms or substitute a version label.
`pnpm run test:native-codec-patches` also checks attribution integrity and missing
patent notices. After pod installation and signed packaging, inspect the actual
app bundle against every manifest hash. This is the image-stack subset; see
[native dependency notices](native-dependency-notices.md#packaged-source-built-ios-image-notices--11-october-2026)
for remaining distribution review.

The same notice manifest now includes the reviewed main iOS JavaScript dependency
profile and shared React Native notice mappings. Pod evaluation checks the root
package/lock and installed package metadata hashes; changed dependency inputs stop
installation until the profile is refreshed. To review the graph, use the installed
`expo export:embed` command for ordinary `index.ts`, iOS, production/non-minified
output, with `--sourcemap-output` in a private temporary directory. Compare its code
body with the native build's raw bundle, separating only explicit source-map
metadata comments. Inventory the actual map contributors and preserve their
original license bytes; verify binary assets independently. Repeat this review
after changed imports as well as dependencies, because metadata freshness alone
does not prove an unchanged contribution graph. Keep source maps outside shipped
products. See the
[main iOS JavaScript provenance](native-dependency-notices.md#packaged-main-ios-javascript-originals--11-october-2026)
for actual checked counts and remaining distribution gates.

The Simulator build command installs dependencies and starts Metro as needed:

```sh
pnpm exec expo run:ios --device 'iPhone 17'
```

The verified setup installed pods first, started Metro on localhost:8081, then ran
`pnpm exec expo run:ios` with the selected Simulator UUID, `--no-install` and
`--no-bundler`. Do not combine `--port` with `--no-bundler`; Expo rejects that pair.
Use `Hypergolic.xcworkspace` when opening the generated project in Xcode.

Simulator checks passed: actual screenshots, Home/Spotlight navigation, typing the
app name and tapping its result, Hermes evaluation and console events, manual
reload, cold launch with Metro running, and Fast Refresh before and after cold
launch. The first live edit stayed stale until one Dev Menu Reload; subsequent
edits updated automatically while preserving the JS runtime. The initial stale
connection's cause was not established. Press Command-D in Simulator and choose
Reload if the development connection becomes stale. The temporary label was fully
restored. Text entry was tested in Simulator Spotlight; this scaffold has no app
form, navigation flow or product controls.

The Debug app needs Metro. These checks do not establish offline iOS operation,
physical-iPhone signing, device behavior or security. For a local iPhone run, follow
the [README's phone setup and signing steps](../README.md#ios), then run
`pnpm exec expo run:ios --device` and select the connected phone. Keep Metro running;
the phone and Mac must share a reachable local network. This Simulator's localhost
address is not the phone's address. Xcode team selection in the generated native
project may need repeating after a clean prebuild. Keep Apple account credentials
and personal signing settings out of tracked files. The owner handles account,
pairing and device confirmations.

A free Xcode Personal Team supports personal-device testing, with seven-day
provisioning and app/device/capability limits. Paid Apple Developer Program membership
supports TestFlight and broader distribution. EAS internal iPhone builds use paid
ad hoc signing and registered devices. No physical-iPhone or EAS run is verified.
See [Apple's account overview](https://developer.apple.com/help/account/basics/about-your-developer-account),
[Expo's local development guide](https://docs.expo.dev/develop/development-builds/introduction/),
[Simulator setup](https://docs.expo.dev/workflow/ios-simulator/) and
[EAS internal distribution](https://docs.expo.dev/build/internal-distribution/).

## iPhoneOS Release compile checkpoint

On 28 September 2026 the normal production entry compiled as an unsigned
`Release-iphoneos` app for a generic iPhone, using the current workspace and
`CODE_SIGNING_ALLOWED=NO`:

```sh
source .tools/use-local-tools.sh
source .tools/use-ios-tools.sh
xcodebuild -workspace ios/Hypergolic.xcworkspace -scheme Hypergolic \
  -configuration Release -sdk iphoneos -destination 'generic/platform=iOS' \
  -derivedDataPath /tmp/hypergolic-ios-device-build CODE_SIGNING_ALLOWED=NO build
```

The app reports `iphoneos`, arm64, minimum iOS 18.4 and bundle ID
`org.nostrocket.hypergolic.dev`. Its embedded `main.jsbundle` SHA-256 is
`28bd07d03c86b248821fac0ba86a83b9e8386f74dbfc5312d9b616d64b2b5925`;
its packaged trusted `host.js` matches the expected
`2098a63671ce05a3f6c5dbdeaa4fe9f55e40eb078b8af0431b500c7554eb5281`.
The Info.plist includes the Face ID backup/deletion usage text. This app has no
code signature or embedded provisioning profile and cannot be installed on an
iPhone. Only simulated iPhones were connected at this checkpoint; signed-device
packaging, protected storage, system authentication and the full native journey
remain open.

## Dependency policy

The root and tools/quality directories each have an independent pnpm workspace and
lockfile to preserve the scanner's separate dependency tree. Both pin pnpm 10.34.5,
require a seven-day release age for new resolutions, reject provenance downgrades,
and allow only esbuild dependency build scripts. Use frozen installs for both;
the root workspace also carries the scoped Xcode UUID override.
The quality workspace allows the exact `adm-zip@0.6.1` security release before
that age threshold to resolve GHSA-vwc7-r8mq-g2x9. Future versions remain subject
to the normal delay. The [maintainer release](https://github.com/cthackers/adm-zip/releases/tag/v0.6.1)
fixes extraction through destination symlinks; local ancestor/leaf symlink probes
reject writes while ordinary extraction still succeeds. The quality lockfile
audit reports no known vulnerabilities after this update.

## Quality gates

`pnpm run check` runs TypeScript, all Expo Doctor checks, React Doctor with warnings
blocking, aislop requiring 100/100, and separate pnpm audit gates blocking high/critical
advisories in the root, runtime and quality-tool lockfiles. No blanket rule suppressions are configured. Generated
GSD/native/tool files are excluded from app scanning. Justify any future exception
with a finding, affected paths, rationale and removal condition in a reviewed change.

React Doctor's score/telemetry and Socket.dev scan are disabled; local diagnostics
remain enabled. pnpm audit is explicit. aislop is isolated because its React 19.2.8
dependency conflicts with Expo's React 19.2.3 pin. The scanner can fail to launch its
package-manager audit subprocess on Windows;
the separate pnpm audit gate remains mandatory. Report any skipped engine explicitly.
Both final React Doctor and aislop scores must be 100/100. A local React Doctor
scan with `--no-telemetry` disables its scoring service and does not report a
numeric score; it cannot satisfy that final gate. Scores do not establish native
security acceptance. A scoped `xcode -> uuid@11.1.1` override removes
GHSA-w5hq-g745-h8pq without downgrading Expo. Xcode's only UUID API use is `v4()`;
its CommonJS UUID generation was executed successfully with the override. Remove
the override when Xcode's declared dependency is patched. The native iOS Simulator
Debug build also passes; physical-iPhone builds remain untested.

CI runs the same checks and bundles JavaScript, then separately attempts an unsigned
native release build. Uploaded unsigned output is a build artifact, not a release.

## GSD

```powershell
pnpm run gsd:install
node .codex/gsd-core/bin/gsd-tools.cjs runtime-identity
node .codex/gsd-core/bin/gsd-tools.cjs query validate.health
```

This is the official `open-gsd/gsd-core` installer, not another similarly named GSD
package. It installs 72 local skills and 35 agent roles in ignored `.codex/`.
It also writes `runtime` and `resolve_model_ids` to the user's `.gsd/defaults.json`,
even with `--local`; the project config explicitly sets its own values. Generated
paths are machine-specific, so rerun the installer after moving this checkout.

Restart Codex and open a task rooted at the application repository, then run
`$gsd-health` or `$gsd-progress`. Open the task at this repository root so that local
skills are discovered in the intended project scope.
Codex CLI 0.153.4 was detected. Official GSD docs require >=0.130.0, or >=0.137.0 for
stable hook events. Skill discovery and typed-agent execution still require a fresh
session check; installation is not proof they ran.

Published 1.13.0 installs multiple context-monitor hooks. Newer `next` documentation
says these are no-ops on Codex and removes them. Do not rely on them for context
warnings or safety enforcement. The scaffold's planning files were initialized from
the seed and GSD templates; no completed interactive GSD product interview is claimed.
Automatic advancement and parallel execution are disabled. Model selection inherits
the active Codex configuration. GSD phase numbers map to seed phases in the roadmap.

## References

- [Expo SDK compatibility](https://docs.expo.dev/versions/latest/)
- [Local production builds](https://docs.expo.dev/guides/local-app-production/)
- [GSD runtime installation](https://github.com/open-gsd/gsd-core/blob/next/docs/how-to/install-on-your-runtime.md)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [React Doctor](https://github.com/millionco/react-doctor)
- [aislop](https://github.com/scanaislop/aislop)
- [Android CLI](https://developer.android.com/tools/agents/android-cli)


## Native napplet host checkpoint

The Android app now has a local Expo module under `modules/napplet-host` and a
separately locked Kehto build under `runtime`. Run `pnpm run runtime:install` once
per lock update. Android prebuild/export scripts run `runtime:build`, which verifies
and copies the generated trusted assets. A direct Gradle build fails if those
assets are absent. Regenerate them after any runtime source/fixture/patch change.

The initial native host Debug build passed with the pinned toolchain and displayed
UX Lab, the host theme and the native readiness diagnostic on the existing API 36
ARM64 emulator. It does not establish the complete shell, signing, persistent
identity or published loader. See [the native contract](native-contract.md) and
phase-2 execution records for current checks and remaining gates. Source pushes and
remote replacement are reserved for the owner; continue on `mobile-revamp`.


## iOS napplet host build

The local module now includes a Swift WKWebView host and a dedicated verified
runtime resource bundle. The selected minimum is iOS 18.4, needed for public
file-chooser denial. With the pinned JavaScript tools and Xcode selected:

```sh
pnpm run prebuild:ios
cd ios
pod install
cd ..
pnpm exec expo run:ios --device "$HYPERGOLIC_IOS_UDID" --no-install --no-bundler
```

Select an explicit Simulator UDID and run Metro separately using the documented
local workflow. The initial native Debug build installed successfully on iPhone 17
/ iOS 26.5 and displayed the real UX Lab, Host colors and Runtime connected. A
Debug dylib may hold the actual native code, so artifact evidence must hash the
complete installed app bundle rather than only CFBundleExecutable. This is a
Simulator development build; standalone iPhoneOS signing and physical-device
acceptance remain required in plan 02-06. `pnpm run export:ios` prepares the iOS
JavaScript bundle and does not replace a native build or device test.


## Maximum quality verification

`pnpm run test:quality` tests the verifier's negative cases. After reviewing and
authorizing the external React Doctor score request, run the full quality receipt
against stable source with a fresh output path outside the checkout:

```sh
node scripts/run-quality.mjs "$PWD" /tmp/hypergolic-quality-UNIQUE.json
node scripts/verify-quality.mjs "$PWD" /tmp/hypergolic-quality-UNIQUE.json
```

The fixed command disables Socket lookups and ancillary React Doctor telemetry,
keeps the actual numeric score service, and separately audits every pnpm lockfile.
A local clean preflight is required when authorizing only an empty findings list:
the CLI posts findings before the final verifier can inspect its result. Both
scores must be exactly 100 with zero findings and complete applicable checks.
Source changes, missing scores, malformed audits and stale receipts fail. Generated
native trees and unsupported native languages remain outside these scanners;
manual native source, build and runtime verification is still required.

## Shared workspace regression checkpoint

The native switcher now passes slow overview scroll, short card-swipe rejection,
rapid close confirmation, Keep open and selected-card removal on Android and iOS.
iOS also rejects a real two-finger pinch that starts with both fingers present.
The shared recognizer checks the actual release coordinates: UIKit can omit a
movement callback before lifting a short stroke. Temporary trace code is removed.
The latest source/test TypeScript and 25 shell tests pass; aislop is 100/100 with
all five engines complete, and React Doctor reports zero findings in a complete
38-file scan. Its numeric score remains unavailable without the pending scoring
permission. These are development checkpoint results, not full v1 acceptance.

Use the portable [native harnesses](../tests/native/README.md). After source or
native changes, explicitly cold-launch the installed app when HMR is disconnected.
Fetching current Metro script text does not attest the bytes executing in Hermes.
Preserve failed-run receipts alongside later passing evidence.

## First-entry identity checkpoint

See [identity storage](identity-storage.md) for the integrated owner/vault,
platform restrictions and exact acceptance scope. Reproduce public Android
continuity with [the identity driver](../tests/native/android-identity.md), and
Foundation file protection with [the native iOS probe](../tests/native/ios-file-policy/README.md).
Private receipts are under `.tools/evidence/identity-checkpoint-20260915`.

At this checkpoint the local type/security/shell and full static scans pass;
the configured `aislop` score is 100/100.
React Doctor has zero diagnostics but no authorized numeric score yet. All three
dependency audits are clear. Expo Doctor's patch compatibility check remains red:
it expects Expo ~57.0.22, Crypto ~57.0.3, Image ~57.0.5, SecureStore ~57.0.4 and
SQLite ~57.0.3. Existing reviewed pins, including Expo 57.0.20, are preserved.
Do not report the aggregate check or full v1 acceptance as passed.


## Native State Lab journeys

Use an already-installed, attested isolated test app; these drivers never install,
wipe data or operate on the normal application. The Android fixture contains the
production identity/runtime implementation under a separate application ID. The
Simulator fixture uses public keys only and excludes protected identity modules.
Fresh output directories preserve failures and exact build/source receipts.

```sh
python3 tests/native/state_storage.py --source "$PWD" --serial EXPLICIT_SERIAL \
  --package org.nostrocket.hypergolic.identityfixture \
  --activity org.nostrocket.hypergolic.dev.MainActivity \
  --expected-apk-sha256 VERIFIED_INSTALLED_APK_SHA256 \
  --output /tmp/hypergolic-state-UNIQUE state-storage
python3 tests/native/state_close.py --source "$PWD" --serial EXPLICIT_SERIAL \
  --package org.nostrocket.hypergolic.identityfixture \
  --activity org.nostrocket.hypergolic.dev.MainActivity \
  --expected-apk-sha256 VERIFIED_INSTALLED_APK_SHA256 \
  --output /tmp/hypergolic-close-UNIQUE state-close
python3 tests/native/ios-driver.py --udid EXPLICIT_SIMULATOR_UUID \
  --bundle-id org.nostrocket.hypergolic.identityuifixture \
  --repo VERIFIED_PUBLIC_FIXTURE_SOURCE \
  --output /tmp/hypergolic-ios-state-UNIQUE state-storage
```

The iOS `state-close` scenario separately verifies the exact close warning, shared
storage retention and a fresh private instance namespace. `state-storage` requires
two saved public test identities and exercises the actual confirmed selector.
Android requires Node from the pinned local tools for canonical npub decoding.
Read the scenario receipt and inspect screenshots; a compiled fixture or successful
command alone does not establish the [native acceptance scope](native-capabilities.md).

For the separate signed published-host QA route, install a freshly built Android
Release app on an isolated emulator, record the exact installed APK SHA-256, then
run the source- and artifact-bound driver. It reviews the fixed signed event and
theme-only access before tapping Open, checks native host readiness, captures the
rendered guest for visual review, and closes the host. The fixture has no relay
server hint and is not a published release.

```sh
python3 -B tests/native/published_host_driver.py --source "$PWD" \
  --serial EXPLICIT_SERIAL --package org.nostrocket.hypergolic.dev \
  --expected-apk-sha256 VERIFIED_INSTALLED_APK_SHA256 \
  --output /tmp/hypergolic-published-host-UNIQUE --launch
```

For iOS, build the test-only entry under a separate bundle ID. The normal iOS
app deliberately rejects Simulator identity storage; this fixture has no
identity or signing key and tests only the published host path. On an already
booted Simulator, use the current fixture source and a fresh output directory:

```sh
source .tools/use-local-tools.sh
source .tools/use-ios-tools.sh
xcodebuild -workspace ios/Hypergolic.xcworkspace -scheme Hypergolic \
  -configuration Release -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=EXPLICIT_SIMULATOR_UUID' \
  -derivedDataPath /tmp/hypergolic-published-fixture-build \
  CODE_SIGNING_ALLOWED=NO \
  PRODUCT_BUNDLE_IDENTIFIER=org.nostrocket.hypergolic.publishedhostfixture \
  ENTRY_FILE=index.published.fixture.tsx build
xcrun simctl install EXPLICIT_SIMULATOR_UUID \
  /tmp/hypergolic-published-fixture-build/Build/Products/Release-iphonesimulator/Hypergolic.app
python3 -B tests/native/ios-driver.py --udid EXPLICIT_SIMULATOR_UUID \
  --bundle-id org.nostrocket.hypergolic.publishedhostfixture --repo "$PWD" \
  --output /tmp/hypergolic-ios-published-host-UNIQUE published-host
```

The iOS scenario checks the exact signed review, native connected state,
accessible guest marker and close. Its result does not establish production
identity, network retrieval, first-open grants or physical-device security.

The separate [published update fixture](../tests/native/published-update-fixtures/README.md)
uses two signed public revisions per coordinate and the ordinary first-open
and update flows. Its Android and iOS drivers capture explicit review, rejection
retaining the old native guest, acceptance replacing it with the new guest,
cold restart retaining that guest, rejection of an older available revision,
and background revocation with explicit retry. A second coordinate adds
`relay` access in v2; its drivers verify a separate consent review, denial
retaining v1, and acceptance replacing v1. Keep these results separate from
live network and physical-device acceptance.

## Tester APK command

`pnpm run build:tester` packages the current checkout as a signed standalone ARM64
Android preview on macOS or Linux. Use the pinned Node/pnpm, Java and Android SDK
from this guide, with Build Tools 36.0.0 installed. Install root, runtime and quality
workspaces first. The command runs `prebuild:android`, Gradle `assembleRelease`,
`zipalign`, signing and final signature/alignment verification. It checks the APK's
application ID/version against app.json and rejects debuggable or non-ARM64 output.
It also checks the packaged manifest against the reviewed Release permission set:
Internet, network state, biometric, legacy fingerprint compatibility and the
package-scoped non-exported receiver permission. A future permission addition
must be reviewed and the contract updated before tester packaging can succeed.

### One-time signing setup

Reuse your existing tester signing key if available. Otherwise create a dedicated
key **outside the source checkout** with Android Studio or the JDK's `keytool`.
For example, replace the path below with your private signing location; its parent
directory must already exist:

```sh
keytool -genkeypair -keystore /absolute/private/path/hypergolic-tester.jks \
  -alias hypergolic-tester -keyalg RSA -keysize 3072 -validity 10000
```

Follow the interactive password and certificate prompts. Back up the keystore and
store its password separately. Do not commit either or regenerate a key on each
build. Android uses the signing identity to determine update compatibility.

```sh
export HYPERGOLIC_KEYSTORE_PATH="/absolute/private/path/hypergolic-tester.jks"
# Optional; needed when the keystore contains multiple keys:
export HYPERGOLIC_KEY_ALIAS="hypergolic-tester"
pnpm run build:tester --check
pnpm run build:tester
```

`--check` verifies local configuration, tool availability and version pins without
building or unlocking the keystore. It does not validate the password, key alias,
Gradle dependency availability or device compatibility. `--help` lists usage.
Signing inherits the terminal and prompts for passwords; no password CLI option
or generated signing key is provided. An interrupted build may leave
`.tools/tester-apks/.build.lock`; confirm no build is still running before removing
that lock. Do not run a separate Android prebuild/Gradle operation concurrently.

### Versioned output and sharing

Set `expo.version` and a positive `expo.android.versionCode` in app.json. VersionCode
starts at 1; increase it before each distributed update. Keep the application ID
and key stable. The command does not edit version configuration or install on a
device. Regeneration of ignored native projects follows the existing Expo workflow.

Each success creates `.tools/tester-apks/<version>-<code>-<commit>-<unique>/`:

- `hypergolic-<version>-<code>-arm64.apk`: signed installable artifact.
- `SHA256SUMS`: SHA-256 of that exact signed APK.
- `build.json`: app ID, version, architecture, commit, dirty-worktree flag,
  build time, APK hash and signing certificate SHA-256 fingerprints.

The receipt contains no keystore path or certificate subject. It is build metadata,
not a reproducibility attestation or a native security test result. A dirty checkout
is allowed and marked; commit reviewed changes before a traceable tester release.
Prior output folders are preserved. Failed runs produce no new successful output
folder; a stale unsigned APK is removed before Gradle starts.

Cold-launch the exact signed APK with Metro stopped and exercise the intended
journey before sharing. Verify update installation and retained data for later
builds. A different key cannot update an existing installation normally; avoid
uninstalling an identity-bearing app without addressing backup and data loss.
Share the APK, checksum and test brief through your chosen private channel. Use
disposable identities for the present preview. This command does not run quality
gates, install, publish, change remotes or imply v1 acceptance.

Run `pnpm run test:tester` for packaging failure/success contract tests. Those tests
use controlled tool substitutes and do not establish native runtime behavior.

## External-link native verification

The [selected contract](external-links.md) separates actual OS handoff from page
loading, browser doubles, owning core assertions and final MVP acceptance. From
the pinned checkout, run `pnpm run test:links`, `pnpm run test:links:native` and
`pnpm run runtime:test`. Native units use the installed JVM/Swift toolchains.

`tests/native/links/build.py` seals an isolated Release product with ordinary
native network/security settings. Use an evidence directory outside the checkout:

```sh
python3 tests/native/links/build.py --platform android --output "$HYPERGOLIC_LINK_EVIDENCE_DIR/android-build"
adb -s "$ANDROID_SERIAL" install -r "$HYPERGOLIC_LINK_EVIDENCE_DIR/android-build/linkfixture.apk"
python3 tests/native/links/android.py --matrix --serial "$ANDROID_SERIAL" --build "$HYPERGOLIC_LINK_EVIDENCE_DIR/android-build/build.json" --apk "$HYPERGOLIC_LINK_EVIDENCE_DIR/android-build/linkfixture.apk" --output "$HYPERGOLIC_LINK_EVIDENCE_DIR/android-matrix"
```

Set both variables to the actual evidence directory and selected emulator. The
Android QA APK uses debug signing and its isolated `linkfixture` application ID;
it does not establish ordinary tester signing. The iOS counterpart uses
`build.py --platform ios`, the resulting Simulator app and `ios.py --matrix`.
Its XCTest runner records native input, accessibility and exported attachments.
Both drivers compare tested source and exact installed product before/after.

`build.py --suite published` selects normal IdentityShell admission of locally
supplied signed Resource Lab fixtures. The `android-published.py` and
`ios-published.py` drivers exercise separate domain consent, fresh native review,
OS return, persisted grant, confirmed identity change and an undeclared link domain.
These isolated fixtures use disposable public identities and make no external
publication or protected/physical-device claim. Reset only their fixture container
before a fresh signed journey. Keep original failed and passing reports distinct.

After native verification, run the ordinary exports, prebuild and Release builds.
The required unsuppressed numeric quality report remains separate from local
zero-finding scans. Current locked dependency exceptions and pending decisions
are recorded in [dependency patches](dependency-patches.md); an existing exception
does not authorize accepting a new advisory.

## October 7 fixture publisher dependency checkpoint

The trusted Settings release tool is described in [fixture-publisher.md](fixture-publisher.md).
The root lockfile pins `shell-quote@1.11.0` and `@modelcontextprotocol/sdk@1.31.0`
for the newly reported critical/high advisories. Both releases meet the existing
seven-day minimum release age. Their public consumers are React DevTools and the
GSD development tool, respectively. The independent quality-tool workspace also
pins the same reviewed MCP SDK fix; no capability policy changed.

Live Expo Doctor now recommends six newer SDK57 patch versions. The October6
`expo-sqlite@57.0.4` release does not meet the seven-day policy, so an attempted
compatible update was refused and the existing lockfile remains in use. Record
this fresh compatibility failure separately from the two owner-approved patched
Forge/braces advisory exceptions. Recheck the precise versions after maturation;
do not suppress the check or broaden the release-age exclusions.


## Android JavaScript notice packaging — 11 October 2026

The Android native host packages original JavaScript dependency licenses from
`modules/napplet-host/android/src/main/assets/notices/`. Its `preBuild` invokes
`NativeDependencyNotices.cjs`, which requires the reviewed complete file set,
original hashes, shared mappings and current dependency-metadata hashes.
Run the actual guard regressions with:

```sh
node --test tests/native/codecs/android-notices.cjs
```

Refresh the reviewed graph/originals together after changed imports or dependencies.
Use the installed Expo embed command for ordinary `index.ts`, Android production
output, `--minify false` and `--sourcemap-output`; compile with the installed Hermes
command and the Gradle task's flags. Verify the resulting bytecode against the
ordinary native product before treating its map as delivered attribution. Preserve
binary asset bindings separately from map text. After prebuild and signed native
packaging, inspect all `assets/notices/` files against the manifest and verify the
existing app identity/certificate, permissions and assets. No package metadata or
runtime behavior changes are required for this notice-only correction.

The current signed build contains 56 originals for 60 package/version identities,
with four shared React Native mappings. Native Android libraries and the separate
trusted-runtime attribution gaps remain outside this profile; see
[the exact Android review](native-dependency-notices.md#packaged-main-android-javascript-originals--11-october-2026).


## Android selected archive notices — 11 October 2026

The Android native module also packages the exact archive originals under
`src/main/assets/archive-notices/`. Its `preBuild` resolves the app's external
`releaseRuntimeClasspath` artifacts, records a temporary build-only inventory,
and invokes `ArchiveDependencyNotices.cjs`. The committed profile uses Maven
coordinates, filenames and hashes, not local cache locations. Build tools are
excluded by using the app runtime configuration; project components remain part
of the separately recorded full dependency graph.

Run both original-integrity guards' regression cases with:

```sh
node --test tests/native/codecs/android-notices.cjs tests/native/codecs/archive-notices.cjs
```

When runtime artifacts change, re-inventory the actual archives, preserve original
texts with their owning entry bindings and update the entire selected-artifact
profile together. Retain failure outcomes and binary/class provenance separately.
Inspect both notice folders in the final signed APK and recheck existing DEX/native
and asset bytes, identity/certificate and permissions. The guard checks the selected
archive distribution subset; full Maven/native/transitive review remains required.
See the [archive-original review](native-dependency-notices.md#selected-android-archive-originals-delivered--11-october-2026).


Scoped `.gitattributes` rules disable line-ending conversion for original native
notice `.txt` files on both platforms. An isolated actual Git checkout with
`core.autocrlf=true` preserves all 128 original files exactly, including upstream
CRLF text. This protects portable hash checks without rewriting the originals.


## Android reviewed C++ notices — 11 October 2026

The native module packages six originals and a separate manifest in
`src/main/assets/cpp-notices/`. `CppDependencyNotices.cjs` checks the selected NDK's
original licence slices, complete toolchain/sysroot aggregates, embedded prebuilt
notice range, runtime, compiler metadata and 1,009 reviewed headers: 895 libc++,
92 system and 22 Clang. It also checks existing owning-package original mappings. Gradle supplies the app's
actual resolved NDK directory; the guard makes no network requests.

Run the combined integrity regressions with:

```sh
node --test tests/native/codecs/*notices.cjs
```

The test uses the locally installed reviewed NDK by default. Set
HYPERGOLIC_NOTICE_NDK to an explicit reviewed NDK directory when needed. The
manifest records NDK 27.1.12297006, darwin-x86_64 toolchain paths and ARM64 runtime
inputs; another host, revision or ABI requires renewed review rather than a hash
bypass. Preserve exact original blocks and upstream credits with their provenance,
and retain separate evidence for compiler inputs and final native-image binding.
After packaging, check all four Android notice folders and compare prior assets,
DEX/native bytes and app identity/certificate. Preserve upstream original bytes,
including trailing whitespace; do not normalize them to satisfy an authored-text
check. See the [NDK original review](native-dependency-notices.md#android-system-and-clang-header-originals--11-october-2026).


## Android prefab owner notice review — 11 October 2026

The archive manifest also binds original prefab-owner terms to the actual selected
AARs and compiled headers. The real preBuild archive guard checks all selected
artifact hashes, owner mappings, original references, header count/path consistency
and inline notice mappings. It reuses the existing shared React Native original
for byte-identical owner texts. The JavaScript and NDK notice profiles retain their
separate scopes.

Run the complete Android notice regressions with:

```sh
node --test tests/native/codecs/android-notices.cjs tests/native/codecs/archive-notices.cjs tests/native/codecs/cpp-notices.cjs
```

After an owning dependency changes, renew both the AAR-entry and compiler-input
comparison against immutable upstream sources. Preserve generation parameters
separately: glog uses the recorded React Native token preparation, while the RN
spec header comes from Android schema/code generation. Select Hermes V1's tag
from .hermesv1version and confirm its version against the actual AAR; the legacy
.hermesversion is a different source selection. Retain exact full root terms and
applicable compiled BSD notice blocks. Check the final APK and byte preservation
against the previous product, allowing only explicitly reviewed notice changes.
See the [compiled prefab review](native-dependency-notices.md#android-compiled-prefab-owner-notices--11-october-2026).


### SQLite original notice guards

Both native products include the original SQLite 3.50.3 internal/API dedication
comments. Android's pre-build archive guard checks the selected prebuilt AAR and
its source/notice bindings. iOS Pod evaluation checks the compiled source copies,
vendor originals, prefix reversal and notice ranges; run `pod install --deployment`
from `ios` after changing resource membership. Dependency changes require a fresh
owning-source review, not regenerated notice hashes alone.

Run `node --test tests/native/codecs/android-notices.cjs tests/native/codecs/archive-notices.cjs tests/native/codecs/cpp-notices.cjs`
and `ruby tests/native/codecs/notice-packaging.rb` from the repository root.
Use the [SQLite package checkpoint](native-dependency-notices.md#original-sqlite-notices-in-both-native-packages--11-october-2026)
for static native-byte/relocation evidence and its physical/runtime limits.


### Running Android notice verification independently

The host pre-build guard depends on the app-owned selected-artifact inventory task,
so it can verify the actual release graph independently of app assembly:

```sh
source .tools/use-local-tools.sh
./android/gradlew -p android :hypergolic-napplet-host:preBuild --offline --console=plain --no-daemon
```

The inventory is regenerated in the owning app project for every invocation.
The host still checks the complete reviewed external archive set and original
notice/source bindings. This command does not build or install a phone app.


### Android compiler original notices

`node --test tests/native/codecs/compiler-notices.cjs` checks notice and compiler identity drift
using disposable resolver results. The real offline
`:hypergolic-napplet-host:preBuild` task captures D8's class-loader origin through
the app plugin, resolves its unique artifact inside a root-owned task and verifies
the complete archive hash, embedded version and immutable commit. Both compiler
and runtime inventories refresh on every guard invocation. Compiler records stay
separate from the 144 selected release runtime artifacts.

The native host packages the original R8 BSD text in `assets/compiler-notices/`.
Its original hash, Git blob identity and exact file set are checked before packaging.
See [compiler/source and helper evidence](native-dependency-notices.md#android-d8-compiler-and-generated-helper-review--11-october-2026).


## Native Outbox acknowledgement regressions

After sourcing the local Android and iOS tool environments, use fresh external
output directories to retain original failures and receipts:

```sh
python3 tests/native/outbox/publication/run.py --output <fresh-core-directory>
python3 tests/native/outbox/publication/tls_run.py --output <fresh-tls-directory>
python3 tests/native/outbox/publication/owning_tls_run.py --output <fresh-swift-owner-directory>
python3 tests/native/outbox/publication/android_owning_tls_run.py --output <fresh-android-owner-directory>
```

The first compiles actual native core sources and checks ACK size/depth/type/EOF
boundaries alongside approval/plan rules. The Swift owner and shared sender suites use the existing bounded
loopback TLS proof paths and an independent exact-frame receiver; disposable TLS
private keys are deleted. The owning suite exercises the actual Swift publication
owner's receipt outcomes. The Android owner suite uses its unchanged compiled
owner plus explicit host-clock/initialization and isolated route adapters. It
covers twenty receipt faults, four in-flight publications, capacity/replay denial,
recovery and final semaphore/deadline cleanup. Its adapter patch and complete
compiled inputs are sealed, and ordinary source stays unchanged. These host proofs do not replace actual Android platform
JSON, protected signing, owning Expo/guest or physical-device acceptance. See the
[native proof README](../tests/native/outbox/publication/README.md) for the detailed
scope; valid local reports do not close full numeric external quality gates.
The expanded Swift owner suite retains all13 earlier cases and adds real task
cancellation, independently triggered post-frame revocation/cancellation, bounded
slow/flood/oversized replies and four-send capacity/replay/recovery. It checks the
actual owner counter after settled tasks; it does not claim general timer/leak
acceptance. Both compiled test binaries and26 source inputs are sealed. Production
sources, ordinary products and device data remain unchanged.


For the Android platform-parser subset on a connected physical API36 device:

```sh
python3 -B tests/native/outbox/publication/device_plan_run.py --serial <device-serial> --output <fresh-device-core-directory>
```

This standalone shell-UID process runs the same 69 native plan/ACK assertions with
boot-framework JSON. It requires no app install or screen unlock. Source/class/
DEX/fixture hashes, actual UID/API/boot loader and unchanged retained APK/inventory
are recorded. Exact owned temporary files are hash-checked and removed. This
proves neither ordinary app/guest/protected-signer composition nor phone lifecycle.


The native Outbox core suite now includes strict JSON syntax regressions before
Android object decoding. Its physical framework runner defaults to all 106 core
assertions; append `--ack-grammar` for the focused 37-assertion subset. Failed probe
logs are captured only for the exact reported disposable PID. Both modes verify
remote-file removal and unchanged keeper/inventory. Host core, 38 TLS writer and
27-per-platform owner cases remain distinct from ordinary app/protected-signer
and full physical acceptance. See the [parser repair](outbox-routing.md#android-ack-json-syntax--11-october-2026).


The [physical Android transport runner](../tests/native/android-published-transport-device/README.md#physical-android-selected-transport-cases--11-october-2026)
runs the existing compiled HTTPS/WSS and envelope proofs without installing a
test app. Its source/compiled-input, retained-package and exact cleanup records
are required parts of the result. It supplies selected native transport evidence;
ordinary app and complete physical fault acceptance remain open.


The Android archive notice guard additionally binds five selected Fresco ARM64
entries and the original linked WebP 1.3.2 COPYING/PATENTS/AUTHORS texts. The
app-owned inventory reads the current AAR entries on each invocation. Run the
combined Node notice suites after changing this profile, then inspect actual
signed packaging. See [native owner provenance](native-dependency-notices.md#selected-android-fresco-and-linked-webp-originals--11-october-2026).


### Checked physical Android input — 11 October 2026

The shell-UID [checked UI helper](../tests/native/presentation/CheckedUiInput.java)
observes a fresh native hierarchy, waits up to ten seconds for the target control,
sends one `UiDevice.click` at its measured centre, records the Boolean result, and
requires the expected native postcondition within eight seconds. It uses the
installed legacy UI Automator APIs, not an app-state or React callback seam. Its
[ordinary Settings driver](../tests/native/presentation/checked-input-physical-android.py)
is a portable adaptation of the exact executed warm driver. It requires the known
public development identity, empty workspace, exact keeper APK and packaging
source hashes; it refuses to replace an existing helper. It removes its own helper
and XML and verifies retained APK/path, inventory and source hashes at completion.
Build the Java source with the installed Android36 `android.jar`, `uiautomator.jar`
and optional `android.test.base.jar`, then dex with installed `d8` at min API26 and
package `classes.dex` as the supplied helper JAR. Supply the existing APK whose
sibling `source-inputs.json` records the packaging inputs:

```sh
python3 tests/native/presentation/checked-input-physical-android.py \
  --serial "$ANDROID_SERIAL" --npub "$DEVELOPMENT_NPUB" \
  --apk "$RETAINED_APK" --ui-jar "$CHECKED_INPUT_JAR" \
  --output "$PRIVATE_EVIDENCE_DIR"
```

Physical Android evidence distinguishes two outcomes. In the cold probe, the
actual enabled Settings control was present but `UiDevice.click` returned `false`
after134ms; the test stops without repeating the click. In the separate warm probe,
Settings opens with the exact expected public identity and Done returns to the
empty workspace; both clicks report `true` and their postconditions pass. All1469
bound source inputs, original APK/path and package inventories are unchanged, and
both exact observer files are absent after cleanup. Original screenshots are
inspected. This is a delivery diagnostic and one warm input pair, not five passing
cold checks, a production repair or full UX05 acceptance. A Boolean failure does
not prove that no partial motion event reached the app, and the original historical
miss is not attributed to this newer failure.

Three preceding observer failures remain in the private evidence: unsupported
Android XML parser option; the cold identity-loading screen appearing before the
requested control; and a transient missing initial accessibility root. They send
no checked test click. The final helper waits for fresh roots and real target
presence; the subsequent cold input rejection is distinct. No APK installation,
identity mutation, OS security setting change or accessibility acceptance occurs.
Legacy UI Automator may suppress accessibility services, so these results do not
prove TalkBack behavior. Full Phase2 and existing device/quality gates remain open.


## Approved quality checks and device prompts — 11 October 2026

The complete source-bound check on `d5693e2` returns actual React Doctor 100/100,
zero findings across 442 files, and aislop 98/100 with only the two existing
[dependency exceptions](dependency-patches.md). All ten audits complete/eight
clean, and 74 installed-patch/verifier regressions pass. The normal quality gate
remains red; no suppression or new waiver is introduced. The owner has approved
the exact score/audit metadata transfers, so those approvals are resolved.

Two Android fresh-profile installation retries fail before fresh app input.
Original native screenshots now show Hypergolic's **Install via USB** prompt,
an unchecked **Remember my choice**, **Install**, and **Deny(10)** decreasing to
**Deny(1)** before the terminal install refusal. This observes unattended prompt
expiry; the terminal wording does not establish deliberate owner rejection.
A remembered preference's scope/persistence was not tested or changed.

The bounded read-only iPhone startup retry again fails UI automation initialization
before its app test body. The direct post-cleanup screenshot still shows the empty
**Enter iPhone Passcode for XCTest — Enable UI Automation** prompt. Ordinary
unlock is separate. Enter that passcode directly on the phone before retrying;
the observer does not request or capture it. Command-scoped full Xcode leaves
global configuration untouched; the secondary diagnostic lookup error persists.

Both actors and independent cleanup verify the exact owned package/helper/staged
files absent, retained Android APK/path/inventory unchanged, and retained iPhone
bundle/version/container inventory unchanged. Installed iOS executable bytes and
full app-data byte identity were not retrieved. Neither retry proves a new app
workflow or closes a complete acceptance row. Preserve these original failures;
retry only with owner attention to the two observed device prompts.


## Attended install and iPhone automation readiness — 11 October 2026

The next physical iPhone startup probe runs and passes its actual native
Settings/public-identity/Done body. The effective xctestrun selects the intended
existing startup method explicitly. No runner-code/app rebuild or global Xcode
change is needed. Earlier startup failures remain retained; their complete
historical cause is not established by this success. The subsequent prepared
ordinary [notification recheck](notifications-configuration.md#ordinary-iphone-notification-recheck--11-october-2026)
passes eight scoped checks and restores its owned grant/view and original focus.
Exact runner cleanup and retained app inventory are independently verified.

The attended Android fresh-profile APK installation succeeds with exact installed
bytes, then naturally opens UX Lab1. Its observer incorrectly expected an empty
workspace and times out before relay checks. The corrected observer waits for
Settings and preserves the initial bundled view/public identity during cold
verification. The APK/app remains unchanged. The subsequent reinstall prompt
expires before app input, so the corrected first-run relay cases are unexecuted;
one more attended Install press is needed. Do not change production to manufacture
an empty fresh profile or claim first-run seeding from installation alone.

Both failed attempts remain original evidence. Exact temporary package/helper/XML/
staged-APK absence and retained Android APK/path/inventory/identity/empty workspace
verify. Original iPhone focus/identity and selected installed metadata remain;
installed executable/data-byte identity is not claimed. The next iPhone tests can
proceed without treating the previous XCTest passcode question as still pending.


## Physical relay persistence checkpoint — 11 October 2026

Attended Android first-run run08 passes the three previously blocked checks:
exact ordered network/lookup defaults before any settings write, reuse of the
same protected public identity and defaults after process death, and retention
of an explicitly empty network list after a second cold launch while lookup
stays unchanged. It uses the prepared disposable ordinary-entry Release and
preserves its normal first view. Seven original native XML role inventories and
two distinct new PIDs independently verify. Exact temporary package/helper/XML/
staged APK removal and retained app APK/path/inventory/identity restore verify.
Together with the earlier seven ordinary Settings groups, Android RELAY-01 passes.

The retained ordinary iPhone passes six scoped groups: ordered role defaults,
cold reuse, both empty lists across process death, selected-role default restore,
restored-default persistence, and original relay/public-identity/focus cleanup.
Fifteen original native Remove inventories and four distinct app PIDs verify;
the temporary XCTest runner is removed and retained metadata inventory matches.
The first observer counted nested selectable-text accessibility twins before
any relay writes. Original AX and screenshot show three rows; the corrected
observer reads each unique attributed Remove control. Preserve both attempts.
This does not establish VoiceOver behavior or installed executable byte identity.

Three original PNGs per successful host were inspected; all648 actual product
inputs stayed unchanged. Only the iPhone test runner was newly compiled. The app
and dependencies are unchanged, so no new app build or full quality result is
claimed. Physical iPhone fresh-profile seed, invalid/duplicate URLs and add/edit
remain open, alongside separate routing/AUTH/usability requirements. The shared
acceptance matrix retains all61 original scopes, with7 rows fully complete.


## Physical iPhone relay settings closeout — 12 October 2026

The retained ordinary app passes all ten invalid URLs and both duplicates with
exact errors and unchanged role lists. Successful remove/add preserves ordered
append and separate roles. Modified lists and explicitly restored defaults survive
two stopped-process cold launches; original public identity, defaults and focus
return. Independent review checks27 original native Remove inventories and three
distinct PIDs. Native field values are read back before submission; human-readable
AX diagnostics can truncate their text. Original startup and typing-guard failures
remain separate evidence, with no app-code change.

First-run proof uses a uniquely identified temporary copy of the signed ordinary
Release, with an explicit fresh Keychain group excluding retained-app access.
All53 executable section payloads and all other files match the original except
bundle metadata/signature. The physical fresh app creates a different protected
public identity and seeds exact role defaults before settings writes. Same identity/
defaults survive process death, while an explicitly empty network role stays empty
after another restart and lookup remains unchanged. Nine native row inventories,
three distinct PIDs and canonical public-identity decoding independently verify.

Both temporary packages are removed, including the XCTest runner. A final independent
live retained metadata inventory matches; original identity/UX focus and648 actual
source/product input hashes remain. Six original PNGs were inspected across the two
passed runs. This does not prove byte-identical installed iOS executables, complete
Keychain erasure or full database rollback. Private originals are retained under
`iphone-relay-closeout01`; compiled intermediates are hash-inventoried before exact
owned-directory cleanup.

Together with previous empty-list and selected-role restore proof, RELAY-01 now
passes on both phones. The matrix preserves all61 original contracts, with8 rows
complete/53 open. AUTH/availability, automatic routing, accessibility and other
Phase2 acceptance remain separate. No new app build/full quality result is claimed.


## Physical observer cleanup reporting — 12 October 2026

A timed-out temporary iPhone observer could exit its cleanup block before writing
its receipt. The prepared next-run driver now records command timeout/launch
failures, attempts each claimed cleanup separately and atomically writes the final
result after caught cleanup/check failures. An unattempted runner is not a cleanup
target. Unavailable inventory or product fingerprints remain unknown; zero cleanup
exit alone does not establish absence or an unchanged retained app.

Two host cases reproduce the original missing receipt. Fifteen regressions execute
the actual repaired command/finalization code, including real child timeout and
termination. They cover ownership, primary-error retention, interrupts, malformed/
unavailable inventories and source/metadata drift. Explicit repository/batch/device
parameters leave that tested code unchanged. This is private observer repair;
application/native code and dependencies are unchanged. Existing 648 product inputs
and the 132-file local ready iPhone app still match their recorded hashes.

Use the corrected observer in the next uniquely prepared batch after reconciling
the interrupted device transaction. These host checks do not prove Face ID,
installer settlement, installed iOS bytes, native key erasure or physical cleanup.
The full acceptance matrix remains 8 of 61 complete; no new physical row closes.


### Native follow-up reconciliation

After the system permission dialog disappears, the exact previously uncertain
app uninstall returns a successful native receipt. A fresh one-case XCTest uses
the repaired reporting path and verifies the retained known full public identity
and UX Lab7 before/after Settings in the same process. Original AX, three inspected
PNGs and the passed/no-skips summary agree. The runner and old temporary app are
absent; the complete selected metadata inventory matches its test baseline, and
only the stable Hypergolic app remains in the project namespace.648 product inputs
stay unchanged. This settles the selected cleanup/focus handoff without proving
authentication, key erasure, cold behavior or full MVP acceptance.

Failed-install originals and native follow-up proof are byte-readback preserved.
Only the two completed runner-derived trees and hash-matching unused app copy
are removed; the retained ordinary ready app remains. No acceptance status changes.


## Physical iPhone authentication retry — 12 October 2026

Real ordinary Release in an isolated disposable app reaches system Face ID after
exact permission approval through SpringBoard input. Live original pixels show
Face Not Recognised. Authentication does not complete before the authority
lifetime ends; the positive deletion test fails and the app reports deletion not
approved. Original AX verifies unchanged two-identity inventory/selected public
identity. Both175-byte encrypted-file metadata records match before/after; no
secret-content read. One preparation test passes, one authentication test fails,
no skips; cold-survivor test is not dispatched. Both restore retained identity
and UX Lab7. Exact temporary app/runner cleanup and metadata inventory match;
all648 existing product inputs unchanged.265 archive members read back exactly;
unused exact build/app copies are removed after hash checks. Only the observer
compiles. ID-06 gains denied/incomplete-authentication preservation evidence,
remaining partial; positive deletion, explicit cancellation, live session and
Android parity remain.61 original contracts/statuses and8 complete rows preserved.
No app-code change, source push or Phase3 advance.
