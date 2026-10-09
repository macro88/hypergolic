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

Five cases require actual Android WebView callbacks and positive controls:

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
signing, real OS background/lock/process death, renderer termination, UTF-8 bounds,
published artifacts, independent network egress and complete SEC acceptance remain
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
build evidence retains all three builds, including the final cleanup ordering review. These five cases have not run on a device.

## Future physical run

First confirm the owner has closed every identity backup panel and that recording
is stopped. Use the exact sealed artifacts and an explicitly selected device.
Never target a retained primary/QA package, reset its data or change OS permissions
to make the test pass. Check source/product hashes before and after the run,
including the retained installed apps. Install only these two disposable artifacts:

```sh
adb -s EXPLICIT_SERIAL install app.apk
adb -s EXPLICIT_SERIAL install -t test.apk
adb -s EXPLICIT_SERIAL shell am instrument -w -r \
  -e runId FRESH_RUN_ID \
  org.nostrocket.hypergolic.androidboundaryprobe.test/org.nostrocket.hypergolic.boundary.BoundaryInstrumentation
```

Retain the original instrumentation output, device/API/WebView metadata, every
per-case result, nonce-bound frame/response observations and exact artifact/source
seals. Require all five named cases and successful owned cleanup. Bootstrap/emitter,
frame injection, timing or unsupported-platform failures stay failures; do not
fabricate a frame, replace the transport or weaken an assertion. A physical pass
can add only its named partial evidence to the existing matrix. It cannot close a
whole security or product requirement by itself.

API authority: [AndroidX WebMessageListener](https://developer.android.com/reference/androidx/webkit/WebViewCompat.WebMessageListener)
provides the actual source origin and main-frame flag; [WebViewCompat](https://developer.android.com/reference/androidx/webkit/WebViewCompat)
documents origin-scoped listeners and document-start script injection. The test
checks the installed provider's feature support before using those APIs.
