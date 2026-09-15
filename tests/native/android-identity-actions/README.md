# Android deletion authority regressions

Run with the pinned JDK on PATH:

```sh
python3 scripts/test-android-identity-actions.py --output /private/tmp/hypergolic-deletion-proof
```

The output directory must be new. The runner compiles the owning production
`DeletionAuthority.java` directly with its test harness, checks source hashes before
and after execution, and retains compiler output and a JSON receipt. No native
authority implementation is copied into the test harness.

The 95 assertions cover missing admission, exact target/session/context, immutable
inventory, busy requests, one-use consumption, authentication denial, stale and
cross-owner callbacks, settings replacement, background/retirement, expiry at
authentication and actual erase, changed inventory, entropy failure, uncertain
erase, late opening and concurrent revocation. Inventory, authentication result,
clock and erase ports are explicit doubles. This is neither an Android OS prompt
nor Android Keystore/SharedPreferences proof.

The native authority is not yet connected to the Expo action module. Android's
production deletion path continues to deny all requests. Native owner binding,
system authentication and lifecycle must be connected and verified before that
path is enabled. The native record reader and erase effect have the separate
Android runtime proof below.


## Native protected-record probe

`RecordsInstrumentation.java` runs only in a separate instrumentation APK targeting
the isolated identity fixture. It first reads the two existing identities written
by the actual Expo SecureStore SDK. It then exercises malformed ciphertext and
payloads, cancelled/revoked approvals, and one-use native deletion against separate
disposable preferences encrypted with the existing Android Keystore wrapping key.
The wrapping key is never exported or replaced. Existing identity records must be
byte-identical before and after; disposable preferences are removed in `finally`.
No raw exception or secret is included in the result. OS-authentication completion
is an explicit double: this is a record and erase proof, not a system prompt test.

The probe passes 89 assertions on the API 36 emulator. The reader accepts only the
reviewed SecureStore 57.0.3 canonical AES-GCM envelope, fixed service and alias,
128-bit tag, 12-byte IV, bounded HGI1/HGK1 payloads and valid nonzero scalars. Legacy
formats, missing keys, unfinished staging and unknown formats fail without repair.
This reader creates no wrapping key and has no secret-write operation. Mutable
plaintext bytes are cleared; Java/JSON String zeroization is not claimed.

The host runner requires the exact installed standalone app/test APK digests, the
expected selected public key, a fresh output directory, and the exact reviewed SDK
sources in `secure-store-source.json`. It records source hashes and installed bytes
before and after execution. Build preparation must separately attest that these
owning sources produced the supplied APKs. Only the isolated fixture package is
accepted; the normal application is not an instrumentation target.

```sh
python3 scripts/test-android-identity-records.py --serial emulator-5554 \
  --expected-apk-sha256 APP_SHA256 --expected-test-apk-sha256 TEST_APK_SHA256 \
  --selected FIXTURE_PUBLIC_KEY --output /private/tmp/hypergolic-records-proof
```

To build the private test APK, compile the owning modules in the isolated fixture,
copy the instrumentation source into its Android app's `src/androidTest/java` at
the matching package path, and set `testBuildType "release"` plus
`testInstrumentationRunner "org.nostrocket.hypergolic.identityowner.RecordsInstrumentation"`.
Build `assembleRelease assembleReleaseAndroidTest`, attest the source/artifacts,
and install both APKs with the same local test certificate. This setup is confined
to the isolated fixture; it adds no production test receiver or diagnostic API.
