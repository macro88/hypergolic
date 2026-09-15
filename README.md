# Hypergolic

An Android and iOS shell for Nostr napplets, built on Expo and React Native.
The development app runs embedded test napplets in restricted native Kehto views
with a shared switcher and two-column overview. Protected identity, signing,
saved state and published napplet loading remain in progress.

- [Development and native builds](docs/development.md)
- [Architecture and decisions needed before implementation](docs/architecture.md)
- [Phase-zero evidence and limitations](docs/phase-zero.md)
- [GSD project](.planning/PROJECT.md) and [roadmap](.planning/ROADMAP.md)

Application source lives in this repository on `mobile-revamp`. Confirmed requirements and
open implementation decisions are documented in [architecture](docs/architecture.md).

```powershell
# Node 24.20.0
pnpm install --frozen-lockfile
pnpm run quality:install
pnpm run check
pnpm run export:android
```

See the development guide for this machine's isolated runtime, native prerequisites,
GSD installation, and release signing. A bundle export is not an APK.
