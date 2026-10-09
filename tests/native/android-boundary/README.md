# Android native boundary instrumentation

This test-only instrumentation compiles against the unmodified production
`NappletHostView`, native transports and packaged runtime. A disposable ordinary
Expo Release app supplies the real React/Expo context. Each test attaches its own
native view; the guest runs the original bundled UX Lab and SDK. No second host
policy, fabricated frame, test Expo API or enabled production fault hook is used.

The package is `org.nostrocket.hypergolic.androidboundaryprobe`; the instrumentation
package adds `.test`. The label remains Hypergolic. Both are distinct from the
retained primary and QA apps. The build helper never installs, launches, captures
or otherwise accesses a device. It preserves generated packaging files by using
a Gradle init script rather than rewriting them. Products use the existing local
development signer; they are test builds, not production distribution artifacts.

## Prepared scope

Seven cases require actual Android WebView callbacks and positive controls:

- Native main/opaque guest frame observations, original SDK readiness and exact
  parent-source theme response; guest parent/local-storage/native bridge denial;
  native-owned registration and a one-use generation-bound reply.
- Malformed JSON/schema, wrong generation, invalid numeric sequences and replay
  rejection followed by a fresh valid native admission and response.
- A real matching-origin child invokes the actual privileged listener, but gains
  no main-frame authority; the original opaque guest and exact main sequence
  continue to work.
- Four-per-generation/eight-global native queue limits across three actual views;
  consumed overload sequence rejection after capacity becomes available.
- Explicit native foreground input revokes claimed/queued work; actual view
  destruction revokes its generation and stale delivery cannot reach replacement.
- Valid UTF-8 JSON whose byte count exceeds the wire bound despite fewer characters;
  an in-bound wire whose native registration snapshot is oversized, denied sequence
  replay, and fresh valid admission after both byte denials.
- Actual public Android renderer termination, claimed/queued lease revocation,
  destroyed-view removal and a different renderer handle/native generation with
  no stale response reaching the replacement.

Reflection observes the owning native registry and exact view fields. It does
not insert requests, alter counters, replace dispatchers or bypass host admission.
A distinct nonce-bound diagnostic listener records the callback's real WebView,
origin and main-frame flag. Native document-start injection supplies fixed probe
operations in each real frame; native `evaluateJavascript` supplies main-frame
stimulus. The observer is privileged test instrumentation and changes the test
browser environment. Its presence or successful injection proves no guest CSP
bypass. Opaque origins are distinguished by genuine frame-scoped reply proxies,
not by comparing two serialized `null` origins. The injected probes use no new
Origin API dependency or polyfill on older WebViews.

This is transport coverage. A storage-shaped injected message in the theme-only
registration grants no storage permission. Manually attached views have no React
JavaScript callback registration; registry observations and actual WebView replies
are the test oracles. Normal Expo capability dispatch/permissions, SQLite, protected
signing, real OS background/lock/application process death, published artifacts,
independent network egress and complete SEC acceptance remain
separate work. Compilation cannot establish that any native case passes.

## Build only

Prepare the normal generated Android project and reviewed runtime through the
existing development workflow first. Enable the pinned local toolchain if present,
then use a fresh output directory outside the repository:

```sh
source .tools/use-local-tools.sh
python3 -B tests/native/android-boundary/build.py --output /tmp/android-boundary-build-01
```

`expected-inputs.json` pins the reviewed 62 native/build/runtime inputs. A changed
input requires review before an explicit rebaseline. The helper seals the full
source snapshot, unchanged generated packaging, signed app/test APKs, exact runtime
bytes, JavaScript bundle and Gradle log. It refuses an existing output directory
and reports `compiled-not-executed`. Preserve every failed build and its log.

The 9 October 2026 offline build compiles the signed ARM64 Release app and instrumentation APK with
all inputs unchanged, exact runtime bytes and matching development certificates.
The first failure was a missing instrumentation compile dependency; the corrected
init script adds the same pinned WebKit 1.17.0 dependency already used by the host.
No application source, lockfile, device or acceptance status changed. Private
build evidence retains all three initial builds, including the cleanup ordering review. These five cases had not executed at that checkpoint.

## Future physical run

First confirm the owner has closed every identity backup panel and that recording
is stopped. Use the exact sealed artifacts and an explicitly selected device.
Never target a retained primary/QA package, reset its data or change OS permissions
to make the test pass. Check source/product hashes before and after the run,
including the retained installed apps. Install only these two disposable artifacts:

```sh
adb -s EXPLICIT_SERIAL install app.apk
adb -s EXPLICIT_SERIAL install -t test.apk
python3 -B tests/native/android-boundary/run.py \
  --serial EXPLICIT_SERIAL --build /tmp/EXACT_SEALED_BUILD \
  --output /tmp/FRESH_NATIVE_RUN
```

Retain the original instrumentation output, device/API/WebView metadata, every
per-case result, nonce-bound frame/response observations and exact artifact/source
seals. Require all seven named cases and successful owned cleanup. Bootstrap/emitter,
frame injection, timing or unsupported-platform failures stay failures; do not
fabricate a frame, replace the transport or weaken an assertion. A physical pass
can add only its named partial evidence to the existing matrix. It cannot close a
whole security or product requirement by itself.

API authority: [AndroidX WebMessageListener](https://developer.android.com/reference/androidx/webkit/WebViewCompat.WebMessageListener)
provides the actual source origin and main-frame flag; [WebViewCompat](https://developer.android.com/reference/androidx/webkit/WebViewCompat)
documents origin-scoped listeners and document-start script injection. The test
checks the installed provider's feature support before using those APIs.


## Actual emulator fault checkpoint — 9 October 2026

All seven cases pass in one Android API36/ARM64 emulator run with493 assertions,
then pass again through `run.py` with exact installed-byte/source and owned cleanup
verification. The provider is WebView133.0.6943.137. Both runs use the same sealed
ordinary Release app and instrumentation. All62 reviewed native/build/runtime
inputs, the compiled owning implementation and Java test body remain unchanged
through execution. A fresh disposable AVD uses the already installed image;
existing emulator userdata/snapshots and both phones are untouched. The owned
emulator shuts down after testing, and its temporary userdata is removed.

The original native run fails observing a reply because the initial test watched
the iOS window-message path. The corrected observer listens on the real Android
native message object, with exact result type and generation. Five cases then pass
with347 assertions before the byte/renderer/per-view-replay additions. The new
runner's first preflight rejects a valid dotted package path; its raw receipt is
retained and no native action occurs. The corrected runner passes all seven cases,
requires exact source/artifact hashes and cleanup, and never installs, resets or
automatically retries after an observation timeout. Preserve every predecessor.

The measured oversized native snapshot is2,097,521 bytes against a2,097,152-byte
limit, while its original wire fits. The renderer test uses the public
[WebViewRenderProcess.terminate](https://developer.android.com/reference/android/webkit/WebViewRenderProcess)
API, requires Android29+ and a real renderer handle, observes actual production
renderer-fault destruction/revocation, then requires a different handle and live
SDK/native responses from the new generation. Handle identity is not an OS PID.
No private process SPI or enabled application fault switch is involved.

This proves the named emulator transport scope. No physical Android case, protected
signer, complete owning authorization, OS background/lock/application death,
independent egress or whole SEC row is accepted. All61 matrix scopes/statuses remain
unchanged, six cross-platform complete/55 open. Physical testing waits for both
owner backup-panel closure confirmations.
