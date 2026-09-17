---
quick_id: 260917-dg2
status: complete
mode: quick
execution: inline
---

# Signed tester APK command

Added `pnpm run build:tester` with help/preflight modes, pinned Node/pnpm checks,
an external existing keystore, interactive password entry and optional key alias.
The macOS/Linux pipeline builds ARM64 Release, rejects stale/debuggable/wrong-version
artifacts, aligns, signs, verifies and emits a unique APK/checksum/nonsecret receipt
folder. It preserves earlier output, serializes its own runs and removes incomplete
output on handled failures. No auto key creation, version increment, upload or install.

Added explicit initial Android versionCode 1. Updated README, development guidance
and the architecture build paragraph. Application ID and original artwork remain
unchanged. Future distributed updates must increase versionCode and keep key/ID.

Validation:

- All 10 focused packaging contract tests pass, including failure cleanup, preflight,
  stale output rejection, signing/verification failures, spaced paths and build lock.
- Real ARM64 Release build succeeds (531 Gradle tasks). The complete command prompts
  for a disposable validation key password and produces a signed APK with verified
  metadata, certificate, alignment and matching independent SHA-256.
- TypeScript and Android export pass. Local React Doctor reports no issues; full
  aislop scores 100/100. React Doctor external numeric scoring remains unverified.
- Aggregate check stops at the pre-existing Expo patch mismatches (now six packages);
  no dependencies, exclusions or acceptance requirements were changed.
- README links, anchors and script names, whitespace and targeted privacy checks pass.

The disposable-key APK is validation-only and was moved out of the normal tester
output area. No device installation/runtime test, tester distribution, source push
or remote change occurred. This task validates packaging, not full v1 acceptance.
The unrelated .gitignore edit remains unstaged.
