# 02-01 execution checkpoint — 15 September 2026

Status: first native trace and the bounded checkpoint probes are complete.
See 02-01-SUMMARY.md for the handoff. This evidence record does not mark full v1
or complete native security acceptance.

## Implemented and verified

- Genuine pinned Kehto host, original hash-verified bundled UX Lab and real
  SHELL/THEME readiness. Only shell/theme exposed; no identity or network authority.
- Local Expo Android view, exact trusted asset routes, native UUID generation,
  origin/main-frame/schema/size validation, opaque iframe and restrictive CSP.
- Failed/terminated native runtime destroys its view and revokes callback ownership.
- Recorded pnpm patch replaces Kehto request-ID Math.random fallback with secure
  random bytes; unavailable secure APIs fail closed without a scanner suppression.
- Pinned runtime/browser build, asset verification/copy, notices, CI install/test
  wiring and runtime dependency audit integrated.
- Native driver uses actual ADB input and actual WebView attachment, preserving
  source/installed artifact hashes and explicit limitations.

## Current evidence

The API 36 ARM64 emulator runs Android WebView 133.0.6943.137. The installed
Debug-signed APK SHA256 is
`7040df6fa5ae59852807b940c32a5b1039e5d9522654e9e7ab47404cc8127050`.
Its original UX fixture hash is
`01ab63dbcdadab0b44fd6f3b9a6bcfbd98d8c1de1510f96c821d3efe1876909c`.
Installed host.js is 115571 bytes, SHA256
`52167c05c027da7afdc76bae660a7cb12b6902205e7ac25a57a76a06c403acc8`.

Private run evidence is retained under these ignored source-local directories:

- `.tools/evidence/native-trace-hardened-second-20260915`: five checks passed;
  actual native readiness/theme, ADB counter input, typed draft/mirror and keyboard
  dismissal. The draft screenshot was visually inspected.
- `.tools/evidence/native-boundary-hardened-20260915`: actual opaque-frame native
  object/parent/browser-storage denial; malformed/privileged message denial;
  duplicate readiness and valid theme barrier; fetch/socket/image/script/worker/
  top-navigation denial. CSP evidence identifies measured layers only.
- `.tools/evidence/native-renderer-loss-hardened-20260915`: targeted actual
  Page.crash; native renderer-stopped diagnostic, removed WebView, surviving shell
  process and empty executable target list. Failure screenshot visually inspected.
- `.tools/evidence/native-receiver-hardened-second-20260915`: Android HTTP and
  WebSocket positive controls before/after; four nonce-specific child network
  attempts denied with actual CSP events and zero independent receiver receipts.
- `.tools/evidence/native-navigation-hardened-20260915`: file/content fetch,
  nested frame and popup denial; self-navigation destroyed the view and target
  while the native app survived.
- `.tools/evidence/native-diagnostics-hardened-20260915`: explicitly trusted-host
  fault injection through the real listener. Seven invalid diagnostics, including
  wrong generation and a 2192-byte otherwise-valid message, preserved readiness.
  A subsequent valid error control destroyed the view and target.
- `.tools/evidence/native-trace-restored-final-20260915`: all five native trace
  checks passed again after destructive probes and a fresh app launch.
- `.tools/artifacts/native-host-2026-09-15`: preserved corresponding Debug APK.

These are current debug/emulator checks. They do not prove a standalone no-Metro
release, physical-device UX or all future privileged capabilities.

## Checks

Typecheck, Android prebuild, native Debug builds and Android export pass. The
runtime suite passes 26 Chromium/WebKit tests, including secure-RNG fallback and
failure cases. React Doctor is clean after the patch. Aislop scores 99 with an
informational pre-mount cleanup callback finding. Root and runtime audits have no
known vulnerabilities; the existing quality-tool audit has one moderate issue,
below the configured high-severity gate. Native driver unit checks pass; later
probe extensions receive their own rerun.

`pnpm run check` still exits at Expo Doctor: the unchanged Expo 57.0.20 pin differs
from the tool's ~57.0.22 recommendation. The remaining checks were run separately;
this mismatch is neither suppressed nor misreported as an all-green aggregate.
CI changes were reviewed and YAML-parsed locally; no source push or remote CI run
occurred.

## Open and next

Native forged origin/main-frame metadata, pre-ready traffic, unregistered sibling
creation and rate/resource exhaustion remain unproved on this fixed native fixture.
Chromium/WebKit separately test pre-ready traffic, unregistered siblings and forged
synthetic source events; those results do not substitute for native evidence.
User-gesture popup variants, download/chooser/media/SSL paths, release-mode hostile
artifacts and physical-device behavior remain later checks. Accessibility
activation/timing and the fixture counter's omitted numeric accessibility label
need the planned UI/device work. Privileged adapters require navigation admission
revocation before a replaced WindowProxy can inherit authority.

The live switcher and zoom overview are being prepared separately for 02-02.
Identity, persistence, signing, published loading/updates, real fixture publication
and independent signed v1 APK remain in 02-03 through 02-06. Broad product interviews
are not needed; final publisher/device inputs remain explicit.
