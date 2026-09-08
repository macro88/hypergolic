# Hypergolic engineering

Work in this application repository on the existing `revamp` branch. The previous
implementation was intentionally deleted in `f674137`; do not restore it.

Read `docs/architecture.md` and `.planning/STATE.md` before implementation. Keep
source and engineer-facing decisions here. Link existing repository documentation
instead of duplicating planning prose.

This repository is public. Before publishing, inspect all changed files and Git
metadata for personal identifiers, private repository references, credentials and
personal filesystem paths. Use portable paths and neutral roles. Keep private
operational context out of public files, commits, logs and artifacts. Preserve
intentional public attribution and required third-party notices. Never rewrite
published history without explicit authorization.

Use the pinned Node and npm lockfiles. Run `npm run check` and Android bundle export
after application changes; native/config-plugin changes also require Android
prebuild and the relevant native build. Never represent a generated project or
successful bundle as device, release, identity, or security validation.

Do not implement key storage, signing approval, remote napplet trust policy, or
identity-switch safeguards until their open decisions have been resolved. The
confirmed identity flow and napplet ownership of profile editing remain settled.

GSD is installed with `npm run gsd:install`; generated `.codex/` is local and ignored.
Planning uses `.planning/`; implementation docs use `docs/`. Keep both concise and
record actual results. Do not auto-advance into product implementation from setup.
