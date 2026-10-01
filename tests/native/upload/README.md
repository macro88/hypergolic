# Isolated native upload tracer

Activate the repository's pinned Android/Node and iOS toolchains. Start `python3 tests/native/upload/serve.py --output FRESH_OBSERVER_DIRECTORY` in a separate terminal. It creates a disposable TLS certificate for `files.example.com`, listens only on loopback port 19943, independently verifies complete Schnorr authorization and records exact stored PNG bytes. Keep its private key and generated credentials out of source and shared evidence. Stop the server after the journey.

Build the isolated application with `python3 tests/native/upload/build.py --platform android --anchor OBSERVER_DIRECTORY/anchor.b64 --output FRESH_ANDROID_BUILD_DIRECTORY` and the equivalent `--platform ios`. The script restores generated Android configuration and records matching source fingerprints before/after packaging. Its disposable certificate is admitted only by the compile-gated native proof seam; ordinary builds retain public DNS and platform trust. These products use an explicitly known public signing key, not the protected identity store.

For Android, reverse TCP port 19943 with ADB, install the isolated APK, and run:

```sh
python3 tests/native/upload/android-upload.py --serial DEVICE \
  --apk ANDROID_BUILD_DIRECTORY/uploadfixture.apk --build ANDROID_BUILD_DIRECTORY/build.json \
  --observer OBSERVER_DIRECTORY/observer.json --output FRESH_ANDROID_JOURNEY_DIRECTORY
```

For iOS, install `IOS_BUILD_DIRECTORY/derived/Build/Products/Release-iphonesimulator/Hypergolic.app` with simctl, then run:

```sh
python3 tests/native/upload/ios-upload.py --device SIMULATOR_UUID \
  --app IOS_BUILD_DIRECTORY/derived/Build/Products/Release-iphonesimulator/Hypergolic.app --build IOS_BUILD_DIRECTORY/build.json \
  --observer OBSERVER_DIRECTORY/observer.json --output FRESH_IOS_JOURNEY_DIRECTORY
```

Run the two journeys sequentially: each compares independent connection/request counts before review, immediately after native Reject, and after one approved PUT. Each requires actual SDK receipt and cold launch. Android records screenshots/accessibility XML and installed APK equality; iOS uses the existing XCTest project and checks installed app files. Export and inspect XCTest screenshots separately before claiming visual review. Avoid concurrent UIAutomator commands during the Android driver.

The initial tracer accepts only its bounded, independently checked metadata-free PNG. It establishes neither system picker nor arbitrary photo sanitation, attachments, protected physical-device identity, uncertainty reconciliation or published upload acceptance. Those remain subsequent phase slices.
