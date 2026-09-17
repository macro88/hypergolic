<p align="center">
  <img src="assets/brand/hypergolic-logo.png" alt="Hypergolic — a four-point orange spark" width="160" height="160">
</p>

<h1 align="center">Hypergolic</h1>

<p align="center">
  <strong>A native home for Nostr napplets.</strong><br>
  An Android and iOS shell built to keep identity and privileged actions under your control.
</p>

<p align="center">
  <a href="#try-the-development-build">Get started</a> ·
  <a href="#what-works-today">Current status</a> ·
  <a href="#trust-and-control">Trust &amp; control</a> ·
  <a href="docs/architecture.md">Architecture</a> ·
  <a href="#contributing">Contribute</a>
</p>

---

Hypergolic brings small web applications called **napplets** into a shared native
shell. Move between them, keep their saved data separate, and manage your Nostr
identities from trusted settings. The shell owns access to identity and native
capabilities; a napplet does not receive your secret key.

The goal is practical independence: choose your applications, retain your identity,
and control what gets signed. That goal is still being built. The current app runs
bundled test napplets; published napplet loading, event signing and relay publication
are not yet available.

> **Development preview · 0.0.0**
> Android and iOS are both v1 targets. Full device and security acceptance remains
> open. Use disposable test identities: authenticated manual backup is unfinished,
> and production iOS identity storage requires a physical iPhone.

## What works today

| Area | Current implementation and limits |
| --- | --- |
| Native workspace | Embedded UX Lab and State Lab run through Kehto in Android WebView and iOS WKWebView. Side handles, a two-column overview and close confirmation manage multiple napplets. |
| Identity | First-entry creation, saved identities, `nsec` import and confirmed whole-shell switching are integrated. Android identity continuity has emulator evidence; iOS protected storage still needs physical-device proof. |
| Saved state | Opening order, selection and an explicitly empty workspace persist per identity. State Lab exercises scoped native storage on both platform test builds. Unsaved drafts are not guaranteed to survive process termination. |
| Identity deletion | Inactive-identity deletion has Android system PIN and fingerprint evidence on an API 36 emulator. Physical-iPhone authentication and older Android compatibility remain open. |
| Next milestones | Authenticated backup, signing approvals, verified published loading, relay integration and complete native journeys on both platforms. |

The iOS Simulator journeys use separate, labelled public-identity fixtures. The
normal app deliberately stops at **“Use a physical iPhone”** there; fixture results
do not prove secret storage or authentication.

See the [architecture](docs/architecture.md), [identity evidence](docs/identity-storage.md)
and [native capability checkpoint](docs/native-capabilities.md) for the exact scope.

## Try the development build

Start from a checkout of this repository's `mobile-revamp` branch. Use
**Node 24.20.0** and **pnpm 10.34.5**. Native modules require a local native build.

```sh
pnpm install --frozen-lockfile
pnpm run runtime:install
pnpm run quality:install
```

### Android

Install the Android SDK and Java prerequisites in the
[development guide](docs/development.md#android), then start an emulator or connect
a development device:

```sh
pnpm run prebuild:android
pnpm run android
```

On a supported environment, the app creates a test identity on first entry and
opens the bundled workspace. Open settings from the identity button; use the side
handles to move between napplets or tap a handle for the overview. State Lab lets
you exercise saved data. Storage failures stop entry instead of silently replacing
an identity.

### iOS

Use macOS, full Xcode and CocoaPods. The native host targets **iOS 18.4 or later**.
Select your development device and configure signing in Xcode:

```sh
pnpm run prebuild:ios
pnpm exec expo run:ios --device
```

The normal app needs a physical iPhone for protected identity storage, and that
complete device journey remains unverified. For shared UI and storage experiments
on Simulator, follow the separate [native test harness](tests/native/README.md).

For both platforms, a Debug build needs Metro. See the
[development guide](docs/development.md) for toolchain pins, troubleshooting and
standalone builds. `export:android` and `export:ios` produce JavaScript bundles;
they do not produce installable native releases.

## Share an Android tester APK

On macOS or Linux, use the pinned development toolchain and an existing signing
keystore stored **outside this checkout**. Set its path, then run:

```sh
export HYPERGOLIC_KEYSTORE_PATH="/absolute/path/to/your-tester-key.jks"
pnpm run build:tester --check
pnpm run build:tester
```

The command builds a standalone **ARM64 Release APK**, prompts for the keystore
password, and verifies the application ID, version, signature and alignment. Each
successful run writes a new folder under `.tools/tester-apks/` containing the signed
APK, `SHA256SUMS` and `build.json` with the source commit and signing fingerprint.
The APK embeds the app; testers do not need Metro or Expo Go.

Use the same application ID and signing key for updates. Before each distributed
build, increase `expo.android.versionCode` in `app.json` and update `expo.version`
as needed. The command does not increment versions or create signing keys.

Cold-launch the exact APK with Metro stopped before sharing it through a private
download link. Testers should use disposable identities while backup and security
acceptance remain unfinished. This packaging command does not run the v1 quality
or device-acceptance gates and does not upload anything.

See [tester build setup](docs/development.md#tester-apk-command) for key creation,
optional key aliases, output details and troubleshooting.

## Trust and control

Hypergolic separates the native shell, a bundled Kehto host, and untrusted napplet
content. The current broker exposes reviewed identity, storage and theme operations.
It does not provide a general-purpose native bridge or a signing capability.

| Boundary | What to know |
| --- | --- |
| Secret keys | The identity vault controls secret access. Android uses Keystore-backed encrypted storage; iOS uses encrypted files with complete file protection and a Keychain-held wrapping key. Physical-device security acceptance is unfinished. |
| Napplet data | Saved strings live in local SQLite and are partitioned by identity, publisher, application, version and storage scope. This data is ordinary text, not an encrypted application-data vault. |
| Identity changes | Confirming a switch revokes the previous authority and restarts loaded napplets. Unsaved work is lost; cancelling the switch preserves the current workspace. |
| Network services | Relay defaults are recorded but not connected. Published discovery, Nostr reads/writes and editable relay settings remain unfinished. Hosted Expo updates are disabled. |
| Build dependencies | Local builds use package registries and platform toolchains. Android standalone builds do not require EAS or an Expo account. iPhone installation remains subject to Apple's signing requirements. |

Current isolation and boundary tests are development evidence, not a claim that
arbitrary third-party napplets are safe. Read the
[native host contract](docs/native-contract.md) and
[capability contract](docs/capability-contract.md) for supported operations and limits.

### Recovery and independence

A Nostr identity and local application data have different recovery requirements:

- **Identity:** `nsec` import is implemented. Authenticated manual backup/export is
  not. Keep an independent backup of any test identity you import; do not rely on
  this preview as the only copy of a key.
- **Application data:** local saved-state restoration works, but user-facing bulk
  export/import and migration to another installation are not implemented.
- **Providers:** configurable relay lists are the intended v1 route to provider
  choice. The [selected defaults and integration status](docs/relays.md) are
  documented; live provider switching is not available yet.
- **Independent builds:** source and pinned lockfiles support local development.
  A reproducible release process and complete distribution license inventory are
  not established. See [license status](#license).

## Verify the work

The repository contains shell, identity, storage, capability and native-boundary
checks. Useful starting points after installation are:

```sh
pnpm run test:shell
pnpm run test:security
pnpm run test:storage
pnpm run test:capabilities
pnpm run check
```

**The aggregate quality gate is not currently green.** The recorded checkpoint has
an Expo Doctor patch-version mismatch. Local React Doctor diagnostics are clear,
but its required external numeric score remains unverified. Full v1 acceptance
requires both React Doctor and aislop at 100/100, plus platform-specific native
proof. Static scores do not establish security.

See [quality gates](docs/development.md#quality-gates),
[release signing](docs/development.md#android) and
[native test instructions](tests/native/README.md). Android release output is
unsigned until explicitly signed locally. No reproducible-build claim is made.

## Contributing

Useful contributions include reproducible bug reports, documentation fixes,
accessibility findings and native tests that exercise denial, cancellation,
restart and recovery behavior. Include the platform, OS version, source revision,
steps and expected result; remove keys and personal data from reports.

Before changing behavior, read [AGENTS.md](AGENTS.md), the
[architecture](docs/architecture.md) and the [roadmap](.planning/ROADMAP.md).
Use the pinned pnpm lockfiles and run checks relevant to the change. Keep supported
behavior and its limits documented together. Repository maintainers review changes;
protocol and security policy changes need explicit agreement.

A dedicated vulnerability-reporting policy has not yet been documented. Do not
post secret keys, personal data or sensitive exploit details in public issues.

## Documentation

- [Development and local builds](docs/development.md)
- [Architecture and remaining decisions](docs/architecture.md)
- [Identity storage](docs/identity-storage.md) and [identity switching](docs/identity-switching.md)
- [Workspace persistence](docs/workspace-storage.md)
- [Native capabilities](docs/native-capabilities.md) and [test napplets](docs/test-napplets.md)
- [Project roadmap](.planning/ROADMAP.md)

## License

**A project license has not yet been added to this repository.** The source is
visible, but permission to use, modify and redistribute it has not been established
through a project license. Third-party components retain their respective terms.
License selection and a distribution inventory remain prerequisites for an
open-source release.
