# Trusted test-fixture publisher

Settings contains **Publish test napplets**, owned by the shell and its selected
protected identity. It prepares only the ten sealed acceptance artifacts built
from `runtime/fixtures` and `src/runtime/bundled-catalog.ts`. The NAP support
napplet has a separate publication project and is excluded. Routing peer keeps
its distinct manifest identifier and archetype with the exact Routing HTML.

`runtime:build` verifies raw UTF-8 bytes, SHA-256 and the selected single-path
aggregate hash before copying the generated bounded catalog into both native
resource bundles. The generated catalog is ignored; changing fixture code still
requires updating the reviewed source catalog pins. No caller-supplied HTML,
picker data, guest message or generic relay authorization enters this tool.

The first review captures the selected public author, exact server, HTML MIME,
length, SHA-256 and frozen relay destinations. Upload approval is one-use and
signs the existing factory-created kind24242 snapshot inside the protected vault.
The profile remains [Blossom b5bd280 BUD-02](https://github.com/hzrd149/blossom/blob/b5bd2801d1763aa635fc8fea7a76597e0eb18990/buds/02.md)
and [BUD-11](https://github.com/hzrd149/blossom/blob/b5bd2801d1763aa635fc8fea7a76597e0eb18990/buds/11.md):
exact hash, upload verb, hostname scope and 120-second expiration. The native
PUT uses the existing durable recovery ledger, public DNS/address restrictions,
TLS owner and descriptor validation. A fresh native GET must match the entire
reviewed byte length and SHA-256 before a manifest review becomes available.

Manifest publication uses the existing guarded Applesauce/React Native relay
service. It checks the live native approval at socket creation and exact EVENT
frame dispatch; the independent stored-event lookup uses the native published
relay source. Public publication and its full physical lifecycle are still unrun.

The second review displays the complete kind35129 unsigned template and its ID.
Native approval claims that exact immutable template once. Protected signing
checks every signed field; publication requires a matching canonical relay ACK
and a separate fresh retrieval of the complete verified signed event. The result
contains the signed event, per-relay receipts, independently observed storage and
an naddr with the observed relays. Upload and manifest success are separate facts.

Foreground loss, identity transitions, expiry and cancellation revoke old native
handles. Returning to the foreground never revives approval. Uncertain uploads
remain in the existing durable recovery ledger and block the same identity,
server and hash until reconciled through the normal upload recovery controls.
Cancellation does not remove a public copy. Failed manifest verification may
follow a dispatched event; inspect the reviewed ID before a new release attempt.

This tool does not enable published Outbox admission or change the guest HTML
classifier, protected signer exclusions, first-open consent or NAP capability
claims. Full physical Android/iPhone acceptance, signed HEAD/server behavior and
the transferred Outbox register remain Phase 2.11 obligations. Core tests and
controlled TLS tests do not prove public provider retention or a device journey.

Run `node --experimental-strip-types --test tests/outbox/fixture-publisher.test.ts`
and `python3 tests/native/fixture-release/run.py` for the owning contracts. Run
ordinary upload regressions, exports, prebuilds, native builds and quality gates
before installation. Keep the installed display name Hypergolic and existing
package/certificate identities so updates preserve private app data.
