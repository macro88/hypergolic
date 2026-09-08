# Hypergolic

An Android shell for Nostr napplets, rebuilt on Expo and React Native.
The current application is a development screen. Identity, signing, Kehto,
Applesauce, and napplet loading are not implemented.

- [Development and Android builds](docs/development.md)
- [Architecture and decisions needed before implementation](docs/architecture.md)
- [Phase-zero evidence and limitations](docs/phase-zero.md)
- [GSD project](.planning/PROJECT.md) and [roadmap](.planning/ROADMAP.md)

Application source lives in this repository on `revamp`. Confirmed requirements and
open implementation decisions are documented in [architecture](docs/architecture.md).

```powershell
# Node 24.20.0
npm.cmd ci
npm.cmd run quality:install
npm.cmd run check
npm.cmd run export:android
```

See the development guide for this machine's isolated runtime, native prerequisites,
GSD installation, and release signing. A bundle export is not an APK.
