# Upload owning proofs

Use the pinned development tools:

- `pnpm run test:uploads:native` compiles actual Java/Swift owners with warnings as errors. Controlled native clocks test body/hash/review matching, one-use signing/dispatch, quotas, focus, background, close/replacement, expiry and clock regression. Credential cases check the exact private event template/hash/scope/time, including wall-clock rollback after capture. These native parsers are not Schnorr verifiers.
- PNG cases check unchanged metadata-free output, CRC/order/color, compressed stream and decoded-size limits, malformed files and denied embedded metadata. iOS also exercises the actual ImageIO decoder. Other photos and arbitrary photo sanitation remain unaccepted.
- Registry cases exercise native-captured registration/header, opaque token versus public ID, foreign-generation denials, one-use take/review/signing/dispatch and sticky post-dispatch uncertainty. Host frame/origin/sequence admission is outside these portable owner checks.
- `pnpm run test:uploads:tls` runs actual Java and Swift raw PUT owners against isolated TLS servers. A separate observer compares exact stored bytes/hash and independently verifies the real disposable Schnorr authorization. Cases cover 200/201, switching, 403/413/429, redirects, lost acknowledgement, pre/post-dispatch cancel, mixed DNS, untrusted certificate and wrong hostname. No public PUT occurs. The mixed-address policy case does not establish public DNS behavior.

Shared `test:uploads` ports are controlled doubles; Chromium/WebKit `runtime` tests use the genuine SDK/Kehto and actual private carrier with controlled native replies. Neither is a native SDK-to-HTTPS/UI acceptance journey.

The [isolated upload entry](../upload/index.tsx) is in progress. It uses a disposable identity and a compile-gated loopback proof route. File-picker, broader photo-format sanitation, durable reconciliation, protected-device signing and full published upload acceptance remain open. See [the selected upload boundary](../../../docs/upload-access.md).
