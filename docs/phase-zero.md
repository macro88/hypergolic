# Phase-zero evidence

Historical scaffold results recorded on Windows, 8 September 2026. These results
precede the current pnpm migration and are not proof of validation at the current tip.

## Executed

| Check | Result |
| --- | --- |
| Node/JDK installation | Local archives verified against publisher checksums; Node 24.20.0, npm 11.19.0, Temurin 17.0.20.1+1 executed |
| GSD | Official 1.13.0 installer completed; runtime-identity confirms package; planning health has no errors/warnings |
| TypeScript | Passed |
| Expo Doctor | 21/21 checks passed after isolating aislop and correcting React type version |
| React Doctor | No findings on 2 app source files; warnings block; generated tools excluded |
| aislop | 99/100, no errors/warnings; internal Windows npm audit subprocess failed, reported as advisory |
| Independent npm audits | Both dependency trees: zero vulnerabilities after scoped Xcode UUID override; Xcode UUID generation passed |
| Android export | Passed: Hermes bundle, 578 modules, approximately 1.4 MB |
| Android prebuild | Passed; generated Gradle 9.3.1 project; release signing changed to unsigned |
| Native release compilation | Passed in 6m 16s; 255 tasks executed; ARM64 unsigned APK produced |
| Development signing | zipalign and apksigner passed; v2/v3 signatures verify against the standard Android Debug certificate |
| APK contents | Package `org.nostrocket.hypergolic.dev`, min API 24, target API 36, ARM64, embedded JavaScript bundle and Hermes libraries confirmed |
| CI | Prior scaffold CI passed; no historical run link is used as evidence for the current checkout |
| Device/security | No device attached. No install/launch, production signing or seed acceptance behavior validated |

The initial [UUID advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
propagated through 10 Expo/Xcode dependency entries. A scoped UUID 11.1.1 override
removed it; Xcode uses the compatible CommonJS `v4()` API, verified by executing its
UUID generator. No SDK downgrade or audit-rule suppression was used. Passing an
audit does not establish runtime security; the gate blocks high/critical findings.

Local raw logs and reports are in ignored `.tools/`: `npm-audit.json`,
`aislop-report.json`, `gradle-release.log`, `gradle-release-ipv4.log`, and
`gradle-release-tmp.log`. They are machine evidence, not distributable release artifacts.

## Local artifacts

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `android/app/build/outputs/apk/release/app-release-unsigned.apk` | 25,766,060 | `bb615f021c16393e3d47b9b67c497e91c3aabebc27c37642936257e8f8ad08c1` |
| `.tools/hypergolic-development.apk` | 25,859,931 | `81ea0b299d85759e3b8b6d246cbbd49d944a679433fe5c3645ae46d890bb2c83` |

The development copy uses the template's public debug keystore, explicitly selected
after the unsigned build. It is suitable only for testing the scaffold, not a
production identity or release credential. Its signer certificate SHA-256 is
`fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c`.
No user keystore or secret was created.

`adb devices` started the official Google platform-tools 37.0.1 server on local TCP
5037 and reported no attached device. A local security prompt requires approval.
Further ADB/device actions are paused; no security UI was
approved or dismissed. Prompt acceptance is not needed for completed build checks.

## Remaining work

1. Establish owner-controlled production signing and target-device proof in the first product milestone.
2. Reopen Codex at the app repository and verify `$gsd-health` discovery; installation
   and CLI validation do not prove skill loading in a task rooted elsewhere.
3. Resolve the security, protocol and delivery decisions listed in `architecture.md`
   before phase 1 product code. The confirmed first-launch flow remains unchanged.

Phase-zero setup is complete. The seed's first milestone remains much larger than
this development scaffold. Check current validation separately after package-manager or toolchain changes.

## pnpm migration validation

On 8 September 2026, pnpm 10.34.5 frozen installs passed for both dependency trees.
TypeScript, Expo Doctor (21/21), React Doctor, aislop and both independent pnpm
audits passed; neither audit reported vulnerabilities. Android export bundled 578
modules and native prebuild passed. CI for this migration is pending the push;
historical native build evidence above does not validate these lockfiles.
