# Plan 02-03 execution progress

Status: partial; no plan-completion claim.

## First-entry identity

Implemented native process ownership, secure-random bootstrap, protected key
adapters, durable nonsecret metadata/journals, a public identity header and Settings,
and failure states that do not silently replace established identities. See
[identity storage](../../../docs/identity-storage.md) for ownership, platform limits,
commands and evidence scope.

Android cold-restart continuity passes with the normal diagnostic-free app. iOS
native modules build, but complete file protection is absent on Simulator. The
normal app reports a physical-iPhone requirement before opening metadata or
creating an identity. The existing failed initialization journal is preserved.
Actual physical-iPhone identity/storage/authentication acceptance remains open.

A separate standalone Simulator UI fixture exercises unchanged shared shell and
native-host source with a labelled public identity. It does not link identity,
secure storage or signing modules. Its shared UI results cannot close iOS identity
requirements. Portable Android restart and native iOS file-policy probes are now
tracked; the fixture's preparation remains a private artifact.

## Verification and quality

Local typechecking and 278 security, 13 bootstrap and 25 shell cases pass. The
portable harness checks pass 12 Python Android cases, three real Nostr decoder
cases and five file-policy runner cases. Native Swift unit coverage and the actual
Simulator file-policy rejection are recorded separately from physical-device proof.
Full aislop is 100/100; complete React Doctor has zero diagnostics, numeric score
unavailable while the external scoring request awaits permission. Quality targets
and coverage are unchanged. Source has not been pushed or reconfigured.

## Next work

Integrate durable workspace/scoped storage, import and whole-shell switching, then
fresh device-authenticated backup/deletion. Continue exact approval/publish and
verified loading in dependent plans. Finish standalone and physical-device
acceptance on both platforms before marking v1 complete. Check account usage after
each small batch; stop at 45% weekly usage with a coherent saved checkpoint.

The separate fixture also passes four native content-gesture checks: vertical and
horizontal scrolling, marker selection, and retained scroll/selection after
switching away and back. Root, runtime and quality-tool dependency audits report
no known vulnerabilities. Expo Doctor passes 20 of 21 checks; the remaining check
requests newer patches for Expo, Crypto, Image, SecureStore and SQLite. The
explicit Expo 57.0.20 pin is preserved; no compatibility exclusion or suppression
has been added. The aggregate `pnpm run check` is therefore not green.

## Workspace persistence integration

The public-identity-scoped workspace database and controller now drive the actual
shell. Opening order, last selection and explicit empty state survive native
restarts on Android and the separate iOS SQLite fixture. The integrated core passes
62 storage/controller tests. Its string and accepted-update ports are not yet wired
through the native napplet boundary. See [workspace storage](../../../docs/workspace-storage.md)
for commands, failure behavior and the limits of each native result.

Next: import and whole-shell identity switching, authenticated actions, then the
native capability/approval/loading work. The saved workspace does not include
volatile drafts, and lazy restoration remains open. React Doctor's numeric request
and physical-iPhone identity proof remain pending. Stop at 45% weekly account use.


## Confirmed identity switching integration

The process-owned transition now handles nsec review, one confirmation, preserved
cancelled live sessions, protected import/readback, duplicate selection and complete
shell remount after identity change. Workspace bindings and session authority check
identity revision/epoch; uncertain selection/workspace commits require restart.
The integrated storage suite has 71 cases. See
[identity switching](../../../docs/identity-switching.md) for the exact limits.

The standalone Android test app passed import/switch/restart with the production
vault, without reading the generated starting secret or changing the normal app.
The iOS public-key-only fixture passed five native UI checks. That run exposed and
then verified a real modal safe-area correction: Done now starts at y=74 below the
observed y=62 safe-area baseline. The corrected Android artifact also passed two
cold launches and Settings dismissal. Both final settings screenshots were inspected.
The vault/transition is not an implemented napplet signing/storage wire capability.

Next: native identity/storage admission and State Lab, authenticated actions,
approval and verified published loading. Physical iPhone proof and React Doctor's
external numeric score remain open. Keep checking account usage; stop at 45%.
