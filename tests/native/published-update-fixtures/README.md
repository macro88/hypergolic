# Published update native fixture

This test entry uses a public identity and two separately signed, embedded
kind-35129 revisions for one napplet coordinate. The signing key was discarded;
the app cannot sign or publish. The second revision becomes discoverable only
after the fixture's **Make new revision available** action. Both native drivers
use the ordinary first-open consent, process-owned update coordinator, Settings
review, workspace replacement, and native host. No public relay or Blossom
server participates.

Build a separate Android Release package in an isolated test checkout or
generated Android tree. In the generated `android/app/build.gradle`, change only:

- `react.entryFile` to `file('../../tests/native/published-update-fixtures/index.tsx')`
- `defaultConfig.applicationId` to `org.nostrocket.hypergolic.publishedupdatefixture`

Save the original Gradle file outside the tree first, and restore its exact
bytes in a shell `trap` even if the build fails. Do not install this over the
normal app. With the pinned local tools loaded, build, align, sign with the
repository's disposable debug key, and verify the separate APK:

```sh
source .tools/use-local-tools.sh
android/gradlew -p android :app:assembleRelease \
  -PreactNativeArchitectures=arm64-v8a --console=plain
"$ANDROID_HOME/build-tools/36.0.0/zipalign" -P 16 -f 4 \
  android/app/build/outputs/apk/release/app-release-unsigned.apk \
  /private/tmp/hypergolic-update-aligned.apk
"$ANDROID_HOME/build-tools/36.0.0/apksigner" sign \
  --ks android/app/debug.keystore --ks-pass pass:android \
  --key-pass pass:android \
  --out /private/tmp/hypergolic-published-update.apk \
  /private/tmp/hypergolic-update-aligned.apk
"$ANDROID_HOME/build-tools/36.0.0/apksigner" verify \
  /private/tmp/hypergolic-published-update.apk
"$ANDROID_HOME/build-tools/36.0.0/zipalign" -c -P 16 4 \
  /private/tmp/hypergolic-published-update.apk
```

Restore Gradle and confirm `cmp` against its saved copy before installing.
Choose an unlocked, disposable API 36 emulator and use its explicit serial.
The driver never installs or clears application data. Record the exact APK
hash and frozen-source hash from the same checkout:

```sh
shasum -a 256 /private/tmp/hypergolic-published-update.apk
PYTHONPATH=tests/native python3 -B -c \
  'from pathlib import Path; import published_update_driver as d; print(d.source_digest(d.source_hashes(Path.cwd())))'
adb -s EXPLICIT_SERIAL install -r /private/tmp/hypergolic-published-update.apk
python3 -B tests/native/published_update_driver.py --source "$PWD" \
  --serial EXPLICIT_SERIAL \
  --package org.nostrocket.hypergolic.publishedupdatefixture \
  --expected-apk-sha256 VERIFIED_APK_SHA256 \
  --expected-source-sha256 VERIFIED_SOURCE_SHA256 \
  --output /private/tmp/hypergolic-android-update-UNIQUE --launch
```

For iOS, use the same public-only entry and a separate Simulator bundle ID.
The normal app requires physical-device identity storage, so the Simulator
fixture does not prove production iOS key protection.

```sh
source .tools/use-local-tools.sh
source .tools/use-ios-tools.sh
xcodebuild -workspace ios/Hypergolic.xcworkspace -scheme Hypergolic \
  -configuration Release -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=EXPLICIT_SIMULATOR_UUID' \
  -derivedDataPath /private/tmp/hypergolic-published-update-ios-build \
  CODE_SIGNING_ALLOWED=NO \
  PRODUCT_BUNDLE_IDENTIFIER=org.nostrocket.hypergolic.publishedupdatefixture \
  ENTRY_FILE=tests/native/published-update-fixtures/index.tsx build
xcrun simctl install EXPLICIT_SIMULATOR_UUID \
  /private/tmp/hypergolic-published-update-ios-build/Build/Products/Release-iphonesimulator/Hypergolic.app
python3 -B tests/native/ios-driver.py --udid EXPLICIT_SIMULATOR_UUID \
  --bundle-id org.nostrocket.hypergolic.publishedupdatefixture \
  --repo "$PWD" --output /private/tmp/hypergolic-ios-update-UNIQUE \
  published-update
```

Inspect the result JSON and screenshots. These journeys establish explicit
first-open review, v1 native guest readiness, rejection retaining v1,
acceptance replacing it with v2, and v2 restoration after a cold app restart
on the named Simulator/emulator builds. They do not establish live
relay/Blossom transport, changed-access review, physical iPhone identity
security, or older Android compatibility.
