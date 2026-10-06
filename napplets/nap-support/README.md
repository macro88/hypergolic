# NAP Support

A portable, unsigned napplet showing the reviewed NAP catalogue and the running shell's support. Hypergolic bundles it under **Settings → Open NAP Support**.

Rows use outline icons, independent upstream status and ✓ Full / ◐ Partial / ✕ Unsupported / ? Unverified support. Expand a row for limits, published availability and the exact proposal reference. Search and availability filters work offline. `Active` is the owning registry's label; it is not renamed to `Approved`. New contracts found only in an open proposal are labelled `Proposed`. The registry sometimes says Active while a document header still says draft; the catalogue reports registry status, not an inferred ratification.

Build with the repository's pinned tools:

```sh
pnpm --dir napplets/nap-support run type-check
pnpm --dir napplets/nap-support run build
```

This uses the existing locked runtime Vite/compiler, without another dependency installation. `dist/index.html` and `dist/manifest.json` form the unsigned publication candidate. Review before signing or publishing. The only requested privileged domain is `link`; a shell lacking it can still display the catalogue and selectable source addresses.

## Updating the living catalogue

1. Review the owning registry and new contract proposals. Update `src/runtime/nap-catalogue.ts`, its review date and exact revisions. Preserve upstream status wording; distinguish proposals from amendments and subtracks.
2. Review actual implementation and evidence. Update `src/runtime/support-report.ts` and bump `SUPPORT_PROFILE` when availability, operations or limits change. `Partial` is a selected bounded profile; `Full` requires all operations/lifecycle/error contracts of the cited revision and relevant native evidence. No current entry is promoted to Full.
3. Build and inspect the portable output. Stage reviewed bytes with `node runtime/tools/build-support-napplet.mjs --stage-reviewed`, then explicitly repin its HTML/aggregate hashes in `src/runtime/bundled-catalog.ts`.
4. Run admission, storage, broker, browser and native checks. Rebuild the host/app so catalogue and host report revisions travel together. A published copy is separately versioned and needs a reviewed release.

## Discovery and host report

NAP-SHELL's `shell.supports()` is scoped to what this napplet may use. False cannot distinguish an absent implementation from a missing grant. The napplet therefore never turns that boolean into a global Unsupported claim.

Hypergolic injects `window.hypergolicSupportReport`: a frozen, public, read-only advisory snapshot built by the running trusted host. This is a local diagnostic extension, not a new NAP operation or permission. It contains only the shell name, reviewed profile revision and public domain support/limitations; no identity, grants, files, keys or native bridge. Other shells without this extension show Unverified support and scoped availability. No network status update runs automatically.
