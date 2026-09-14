---
quick_id: 260914-s6w
status: complete
mode: quick
execution: inline
code_commit: 88f2c1a0a713690db90b6588e078dffc4eb63f0a
---

# UX Lab standalone fixture completed

UX Lab is the first fixture in the approved UX Lab → State Lab → Approval Lab
sequence. It builds one self-contained HTML artifact with unsigned NIP-5D metadata,
no hard capabilities and optional SDK theme colors. Controls expose temporary
input, counter, horizontal selection and vertical edge taps with explicit reset.
No native app UI, identity, signing, persistence, relay or WebView was implemented.

The independent pnpm lockfile keeps fixture tooling out of the native app graph.
The CI job runs fixture verification separately. Architecture, engineering guidance
and project scope now reflect the accepted multi-napplet UX and signing decisions;
profile editing is only an example. Existing local iOS changes remain uncommitted.

## Verification

- Frozen-lockfile install, fixture source typecheck and single-file build passed.
- 24/24 Playwright tests passed in Chromium and WebKit: three independent instances,
  hide/show state preservation, remove/recreate, reset, keyboard/wheel input,
  optional theme errors/updates/races, plain text and narrow layouts.
- Dark/light screenshots inspected. These are browser fixtures, not phone evidence.
- HTML/aggregate hash assertions, no remote resources/forbidden API assertions,
  and unsigned metadata assertions passed. Fixture audit found no known issues.
- Upstream conformance: 5 passed, 0 failed, 5 skipped. Manifest event resolution,
  emitted wire envelopes and lifecycle teardown are not verified by that run.
- Root typecheck, React Doctor, aislop, high/critical audit gate and Android export
  passed. Aggregate check stops at the existing Expo Doctor recommendation for
  ~57.0.22 while 57.0.20 remains pinned. Quality tooling has one moderate audit issue.
- Workflow YAML parses. Hosted CI has not run for this local commit.
- Diff/privacy review passed. Native dependency/configuration pins are unchanged.

Artifact HTML SHA-256: `01ab63dbcdadab0b44fd6f3b9a6bcfbd98d8c1de1510f96c821d3efe1876909c`.
Aggregate hash: `3e96b737ec8fd25b170ff64a7f0f1c4a95f8badb943ee190cc79d629459988a6`.
The generated manifest is unsigned and no artifact was published to Nostr/Blossom.

## Remaining work

Select the minimal Kehto/WebView boundary and native driver before embedding
multiple copies in the actual shell. Validate inset gestures, zoom, close warnings,
keyboard/accessibility and phone isolation there. State Lab and Approval Lab need
their storage/identity/signing contracts. The publisher, trusted signer and external
destinations remain required release inputs. See `docs/test-napplets.md` for exact
source revisions and fixture compatibility limits.
