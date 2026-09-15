# Hypergolic engineering

## Orient and preserve work

Before editing, inspect `git status --short`, `git branch --show-current`, remotes,
recent commits and relevant diffs. This checkout uses `mobile-revamp`; verify the
current target rather than assuming an old branch or commit still exists. Preserve
user changes and intentional removals. Stage only this task's files. Do not restore
legacy implementation or rewrite published history without explicit authorization.

Read `docs/architecture.md` and `.planning/STATE.md`. Keep implementation decisions,
commands and their validation status current with the code; avoid duplicated plans.

## Publication privacy

This repository is public. Before publishing, inspect changed files, Git metadata,
logs and artifacts for unintended personal identifiers, private repository references,
credentials and personal filesystem paths. Use portable paths and neutral roles.
Keep private operational context out of public artifacts. Preserve intentional
public attribution, the repository's configured public Git identity and required
third-party notices. Do not change that identity without a request.

## Stack and scope

Use Expo and React Native for the Android and iOS shell, Kehto for the web runtime,
and Applesauce for Nostr integration. Follow the existing strict TypeScript and Expo
module conventions; do not impose Kehto's framework-free package architecture or
ESM-only output on native/config-plugin files.

Do not implement key storage, signing approval, remote napplet trust policy or
identity-switch safeguards until their open decisions are resolved. First-launch
identity creation/reuse and post-entry trusted settings for import remain confirmed.
The profile napplet is a UI example, not a required product feature. A browser
runtime does not prove Android WebView or iOS WKWebView isolation. Build, signing, device behavior
and security each need their own evidence.

## Workflow and checks

Use pnpm and its pinned lockfiles. If the manifest, lockfiles or scripts disagree,
report the migration gap; do not silently fall back to npm or recreate its lockfiles.
Use actual `package.json` scripts: `pnpm run check`, `pnpm run export:android`, and,
for native/config-plugin changes, `pnpm run prebuild:android` plus the relevant Gradle
build in `docs/development.md`. Documentation-only edits need command/link, diff and
privacy checks; do not claim a build was rerun when it was not.

Add regression coverage for changed behavior using real contract cases. Require complete React
Doctor and aislop reports with scores of 100/100; fix findings without suppressing
source or lowering either gate. Update affected setup and architecture docs in the same change.

Install GSD with `pnpm run gsd:install`. Use the installed Codex skills appropriate to
the task: `$gsd-quick` for a small change, `$gsd-debug` for investigation, and
`$gsd-plan-phase` / `$gsd-execute-phase` for planned work. Keep `.planning/` state
accurate; generated `.codex/` stays local. Resolve missing product decisions before
auto-advancing. Finish with a coherent commit and authorized push, reporting the
actual target, checks and remaining limits; a PR is not mandatory for every task.

## Protocol changes

Before changing a NAP/NIP surface, check its owning specification and record the
exact revision. Compare wire fields, direction, errors, lifecycle and caller trust.
Treat library exports, issues and tests as implementation evidence, not protocol
authority. Draft contracts require explicit selection; document gaps and conflicts
instead of inventing policy.

Carry accepted fields through every affected shell/host adapter and permission
check. Test lifecycle, denied requests, sender binding and payload integrity at the
native boundary. Document intentionally unsupported operations and report the
checked specification/ref with conformance results. Do not copy upstream browser
behavior or package wiring as proof of native security.

Adapted from [Kehto's engineering guidance](https://github.com/kehto/web/blob/8ccc4f44b0a2bff3f16d1a4165d35b9c801b8634/AGENTS.md).
Kehto-specific worktree paths, package publishing, changesets and playground commands
do not apply to this application.
