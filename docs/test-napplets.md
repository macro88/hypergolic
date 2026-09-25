# Test napplets

The approved fixture suite is **UX Lab → State Lab → Approval Lab**. Start with
multiple loaded UX Lab instances to tune switching, overview, closing and scroll
conflicts before adding persistence and signing dependencies. Existing napplets
remain additional compatibility tests. The earlier profile screenshot is a UI
example, not a required product napplet.

| Fixture | Status | Intended coverage |
| --- | --- | --- |
| [UX Lab](../napplets/ux-lab/README.md) | Standalone artifact and browser checks implemented | Temporary input/counter, horizontal and vertical content, instance lifecycle, optional colors |
| [State Lab](../napplets/state-lab/README.md) | Embedded; native storage/identity journeys recorded on Android and iOS | Unsaved/saved state, close/reopen and user + publisher + stable napplet isolation |
| [Approval Lab](../napplets/approval-lab/README.md) | Standalone unsigned artifact; native integration remains open | Explicit approve/deny, background deferral, cancellation and independently verified results |
| Signed host QA fixture | Fixed signed event and HTML embedded locally; Android Settings and isolated iOS native QA journeys pass | Published-artifact verification, explicit review, one-use native transfer and host rendering without relay or publisher deployment |
| [Live published QA fixture](../tests/native/live-published-fixture/README.md) | Public `file-browser` signed event loaded on Android API 36 and iOS 26.5 Simulator | Real native relay/Blossom retrieval, first-open publisher/access review, and connected guest rendering with a public-only identity |

Use disposable identities for automated runs and retain the same identity across
the restart being tested. Keep the fixture publisher separate. A resettable local
relay will provide repeatable success, rejection, delay and disconnection; a
separate integration check retrieves releases from real Nostr/Blossom
locations. A public third-party napplet now passes that native first-open check on
Android and iOS Simulator; live published updates and our own fixture publication
remain open. Local relay fault checks run through `pnpm run test:relay`.

Embedding the fixture first is approved, followed by publication of the same bytes
under the designated publisher. The publisher npub, trusted signer and destinations
remain unidentified. The shell's public startup relay lists are now selected from
RocketShell; see [relay configuration](relays.md). Fixture publication destinations
remain a separate release configuration. UX Lab and State Lab are embedded;
Approval Lab is standalone. UX Lab, State Lab and Approval Lab have not been
signed or published. The separate signed host QA fixture uses a disposable
test publisher whose secret was discarded; it is not a release napplet and has
not been published. Its signed manifest has no server hint, so its Settings
test route reads only the embedded bytes.
UX Lab has no network/signing/storage requirement, so its standalone tests do not
need the relay or a test identity.

## Live public-artifact checkpoint — 25 September 2026

A read-only probe retrieved and independently verified the signed `file-browser`
event and its 56,974-byte HTML. Separate public-only Android API 36 and iPhone 17 Pro
iOS 26.5 Simulator Release fixtures then used the real native WSS and HTTPS ports,
showed the exact publisher, event and `theme` access before consent, and rendered
the remote guest with **Runtime connected** after approval. [The fixture guide](../tests/native/live-published-fixture/README.md)
records the exact event/hash and test limits. Its own filesystem UI is unavailable:
the publisher requested only `theme`, so this does not establish functional file
browsing. The fixture does not sign, use a protected identity, publish an event,
or prove physical-device security. Live update retrieval remains to be tested.

The live run exposed two integration gaps that are now corrected: the public-only
fixture must install the same native secure-random bootstrap as production identity
startup before generating relay subscription IDs; and React Native's constructed
`Response` lacks the streaming body expected by the shared artifact reader. The
native HTTPS adapter now privately marks only already-capped native bytes so the
reader can copy and recheck them without accepting unbounded network responses.

## Older Android WebView checkpoint — 25 September 2026

The final trusted runtime supports an Android API 29 emulator with its bundled
WebView 91. It uses equivalent strict query counting on older WebViews, a secure
`getRandomValues`-based UUID fallback when `crypto.randomUUID` is absent, and an
`Object.hasOwn` compatibility shim required by Kehto. The public-only live
fixture passed native relay/HTTPS verification, exact first-open review and a
connected guest. The normal Release app separately retained its public npub and
connected bundled UX Lab across a cold restart. The final runtime also passed
the iOS 26.5 Simulator live first-open rerun.

Android API 26 with bundled WebView 58 lacks the native message-listener feature.
The host reports `webview-update-required`, and the shell tells the user to update Android System WebView. The guest does not execute. A modern
WebView or a supported native bridge remains necessary for API 26. These runs
do not prove live published updates, protected identity on iPhone, or physical
device security.

## Normal Android remote opening — 25 September 2026

The final normal Release APK on Android API 29 also opened the external
`file-browser` naddr under its process-owned identity. Settings displayed the
exact publisher, signed event and `theme` request; after explicit **Allow and
open**, the guest showed **Runtime connected**. A force-stop and relaunch kept
the same selected npub, selected `file-browser`, and connected guest. Its
filesystem remains unavailable because the signed artifact requests only
`theme`. This emulator evidence exercises the normal app path, but it does not
prove secret readback, signing, physical iPhone security or a live update. The
receipt and screenshots are in the private Notes checkpoint.

The same normal API 29 Release app also opened bundled State Lab through
genuine Kehto and native storage. It showed **Identity connected**, confirmed a
disposable Write, read the value back, then returned the same value after a
force-stop and cold launch. This covers the older WebView's SDK/storage path,
not a published napplet's storage grant. The manual screenshots and receipt are
in the private checkpoint.

The signed embedded update fixtures were also rerun on Android API 29 with
WebView 91 after the compatibility fix. The unchanged-access journey passed
exact review, decline, acceptance, cold restoration, rollback denial and
background revocation/retry. The changed-access journey passed its separate
`theme, relay` review, decline preserving v1 and acceptance replacing it.
Both used the same source/APK-bound Release fixture. The drivers now scroll
to the update's current-event field before applying their existing strict
review assertions on this older accessibility tree. Live public updates remain
unproved.

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

## Initial UX Lab checkpoint — 14 September 2026

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

## State Lab implementation checkpoint

[State Lab](../napplets/state-lab/README.md) and its distinct `state-lab-peer`
variant now build as unsigned single-file artifacts with required identity/storage
domains and optional theme. Thirty browser checks pass using test-only SDK adapters.
Both upstream conformance runs report 5 passes and 5 skips; the skips include
resolved manifest, wire traffic and lifecycle evidence, so this is not native or
complete protocol acceptance. No fixture was published.

The pinned Kehto whole-operation patches and native identity/storage transport are
now integrated. The [native capability checkpoint](native-capabilities.md) records
both-platform State Lab durability, isolation and restart journeys. Publisher
isolation uses separate host-bound fixture publishers, not a napplet-selected field.


## Approval Lab checkpoint — 22 September 2026

Approval Lab uses the real SDK identity and unsigned `relay.publish` surface. Its
controls submit one note, three individually reviewable notes, or one captured
note after five seconds. It retains the original content/timestamp/test sequence,
limits active requests to four, shows results and event IDs, cancels unsubmitted
timers on identity change/pagehide and ignores stale issued completions. It never
retries. The shell remains responsible for native request cancellation and signing.

From the repository root:

```sh
pnpm --dir napplets/approval-lab install --frozen-lockfile
pnpm --dir napplets/approval-lab verify
pnpm --dir napplets/approval-lab audit --audit-level=high
```

Type-check, single-file unsigned build and 32 Chromium/WebKit checks pass.
Conformance reports five passes, zero failures and five skips. Browser tests use
an explicit SDK namespace double; they do not prove wire admission or native
signing. Dark/light phone captures were visually inspected; narrow layouts are
checked at 240, 320 and 768 pixels. The pinned dependency audit reports no known
vulnerabilities. The build rejects development signing keys and emits no embedded
signer, direct network, persistent storage or outbox code.

Approval Lab is not yet included in the verified native catalogue. Its next gate
is the [native signing integration](signing-approval.md), including actual approval,
rejection, lifecycle cancellation and independently observed relay receipts on
Android and iOS. Fixture publication still requires the designated publisher and
release destinations.
