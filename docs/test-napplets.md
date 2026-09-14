# Test napplets

The approved fixture suite is **UX Lab → State Lab → Approval Lab**. Start with
multiple loaded UX Lab instances to tune switching, overview, closing and scroll
conflicts before adding persistence and signing dependencies. Existing napplets
remain additional compatibility tests. The earlier profile screenshot is a UI
example, not a required product napplet.

| Fixture | Status | Intended coverage |
| --- | --- | --- |
| [UX Lab](../napplets/ux-lab/README.md) | Standalone artifact and browser checks implemented | Temporary input/counter, horizontal and vertical content, instance lifecycle, optional colors |
| State Lab | Planned; storage/identity contracts need selection | Unsaved/saved state, close/reopen and user + publisher + stable napplet isolation |
| Approval Lab | Planned; signing/outbox contracts need selection | Explicit approve/deny, background deferral, cancellation and independently verified results |

Use disposable identities for automated runs and retain the same identity across
the restart being tested. Keep the fixture publisher separate. A resettable local
relay will provide repeatable success, rejection, delay and disconnection; a
separate integration check will retrieve releases from real Nostr/Blossom
locations. These relay and release arrangements are agreed but not implemented.

Embedding the fixture first is approved, followed by publication of the same bytes
under the designated publisher. The publisher npub, trusted signer and destinations
remain unidentified. The shell's public startup relay lists are now selected from
RocketShell; see [relay configuration](relays.md). Fixture publication destinations
remain a separate release configuration. No fixture is embedded in Hypergolic,
signed or published yet.
UX Lab has no network/signing/storage requirement, so its standalone tests do not
need the relay or a test identity.

## Selected fixture tooling and checked references

UX Lab pins SDK **0.27.2**, Vite plugin **0.14.1**, conformance CLI **0.2.18**,
Playwright **1.63.0**, Vite **7.3.6** and TypeScript **6.0.3**. Its independent
lockfile resolves `@napplet/nap` 0.31.2 and core 0.31.1. Direct package licenses are
MIT (Playwright and TypeScript: Apache-2.0). The native Expo 57.0.20 pin is unchanged. This is a
tested fixture-tooling set, not a selected compatible native runtime stack.

| Reference | Role and pinned revision |
| --- | --- |
| [Kehto web](https://github.com/kehto/web/tree/a7e0d12f6a6bd4c6d8f90a2b884febf7a2e08bfd) | Intended host toolkit and playground integration examples |
| [NIP-5A](https://github.com/nostr-protocol/nips/blob/a2494f4f81d46684e5814a9bf35e2b1df978f955/5A.md) | Draft nsite manifest/hash substrate; named nsite kind 35128 |
| [NAP registry](https://github.com/napplet/naps/tree/a040914b4bbd3a5cd8a14b0f316a723c968ebfb2) | Capability ownership/status and proposal links |
| [RocketShell napplet skills](https://github.com/nostrocket/rocketshell/tree/0b46d9cf8369576f11d87b92aa5436920fdfcd87/napplets/.codex/skills) | Reviewed design-napplet, build-napplet and test-napplet guidance |
| [Proposed NIP-5D](https://github.com/dskvr/nips/blob/24711d9c47bbdd07908bf1d52bf677d9cbc530f0/5D.md) | PR 2303; single-file sandboxed napplets and distinct manifest kinds; named kind 35129 |
| [NAP-THEME proposal](https://github.com/napplet/naps/blob/acac69d90811d1891db5faa33d64716be97d0a76/naps/NAP-THEME.md) | PR 8 head; color payload, get/result/change and failure semantics; document still says draft |

Inspected on 14 September 2026. The registry labels theme active while the proposal
text says draft. Its change notifications are automatic wire messages; the SDK
provides a local callback adapter. Optional theme recipients are at host discretion.
The fixture can continue without it.

The registry snapshot still describes kind 35128, whereas the pinned NIP-5D proposal
and selected plugin use 35129. Keep this distinction explicit in native loader
selection. Kehto's playground also documents host-owned shell bootstrap missing
from parts of the published shim. UX Lab does not supply a replacement handshake;
its Ready label is only a UI observation.

## Evidence and next integration gate

The standalone build, source typecheck, 24 Chromium/WebKit tests, artifact and
hash assertions, and dependency audit pass. Upstream conformance passes five
checks and skips five; see the fixture README for exact limits. The browser tests
prove instance behavior inside test-owned opaque frames, not Hypergolic's native
host or touch/zoom transitions. The CI job is configured; a hosted run has not
been observed for this change.

Root source typecheck, React Doctor, aislop, the high/critical audit gate and Android
export passed. `pnpm check` stops at the existing Expo Doctor mismatch (expected
`~57.0.22`, pinned `57.0.20`); the subsequent gates were run separately. The quality
tools audit reports one moderate issue, below its configured failure threshold.
No native dependency/configuration or product UI changed in this fixture task.

Next, select and review the minimal Kehto/WebView host boundary and native test
driver, then load multiple copies of the built UX artifact in Hypergolic. Prove
inset-handle reachability and scroll arbitration, zoom overview/return, unknown-state
close warning, and state preservation with actual phone input. Storage, signing,
remote trust, dirty-state reporting and process-death handling still require
implementation against the confirmed architecture; browser results cannot close them.
