# NAP Capability Explorer — standalone product specification

Date: 6 October 2026. Working title only. This specifies a future independent
napplet project; it does not create that project or authorize publication.

## Purpose and users

Give napplet users and shell developers an honest view of NAP proposals and what
the current shell offers to the running napplet. Keep the catalogue useful as new
NAPs are proposed. The same published artifact should work across conformant
shells without importing Hypergolic source or depending on its private adapters.

A user opens the napplet, sees a compact list with outline icons, searches for
`fs`, `media` or another domain, and expands a row for proposal status, discovery
result, known limits and source references. The supplied Amethyst access-list
reference informs the compact row treatment. The UI must explain the origin and
scope of every support claim.

## What the results mean

Keep these three facts separate:

1. **Proposal status:** what the owning NAP registry or proposal says.
2. **Availability:** what the shell reports to this napplet after its handshake.
3. **Conformance or operation evidence:** which specified behaviors were actually
   checked, against which revision, on which host. Availability alone provides
   no such evidence.

The standard discovery view uses the following labels:

| Result | Symbol | Meaning |
| --- | --- | --- |
| Available | ✓ | The completed shell environment offers this domain to this napplet. Individual operations may still require approval or have limits. |
| Not offered | ✕ | The completed environment does not offer this domain to this napplet. It may be unsupported, withheld or ungranted. This is not a global unsupported claim. |
| Unknown | ? | No usable result: missing API, incomplete/failed handshake, invalid response or query failure. |

Never turn an unopened permission prompt, a timeout or an unknown domain into
proof that the shell lacks the implementation. Do not automatically label all
available domains Partial, or interpret a tick as complete NAP conformance.

A separate optional shell-report view may say **Available / Unavailable / Unknown**
for its explicitly named scope, such as published napplets. Label this view
**Shell-reported**. It must coexist with the scoped discovery result when they
differ: a shell can implement storage while this napplet has no storage grant.

Full/Partial conformance may be added later only with a referenced contract,
explicit covered/missing operations and qualified evidence. Keep it separate from
the availability badge; otherwise omit that assessment.

## Standard discovery contract

The research baseline is [NAP-SHELL at
a040914b4bbd3a5cd8a14b0f316a723c968ebfb2](https://github.com/napplet/naps/blob/a040914b4bbd3a5cd8a14b0f316a723c968ebfb2/naps/NAP-SHELL.md).
Its document header says draft; the registry's status is a separate fact. Recheck
the owning revision at project kickoff before choosing the SDK and release profile.

Use the runtime-provided `window.napplet.shell` binding, await `ready()`, then query
`supports(domain)` for known catalogue domains. These queries use the delivered
environment, not a separate request per domain. Do not assume a particular
internal `capabilities` object layout. SHELL is foundational: infer its presence
from a successful handshake rather than querying it with `supports('shell')`.

Before readiness, keep results Unknown. After a reasonable deadline, show
“Shell discovery has not completed” and keep the catalogue usable. Accept late
readiness and replace the Unknown results. A rejected handshake or an individual
query failure must not crash the catalogue. A reload starts a fresh discovery
session; do not reuse one shell's results in another shell.

This baseline cannot discover all globally implemented but ungranted domains.
The product must disclose that limit. A genuinely global comparison across shells
would require a separately agreed public reporting contract adopted by those
shells. It must not be simulated by requesting broad privileges or by guessing
from SDK exports or user-agent strings.

## Permission and manifest policy

The base catalogue/discovery release requires only foundational shell behavior.
Do not declare every catalogue domain as a required permission. Many shells reject
napplets with unsupported required domains, and discovery should not acquire
identity, filesystem, signing, publishing, upload or network authority as a side
effect of inspection.

Opening source links is an enhancement. If the current napplet has link access,
use the shell's normal link API and approval flow. Otherwise display selectable
source URLs. The base napplet must remain usable without link access. Do not
invent an optional manifest tag: select only fields supported by the reviewed
owning manifest contract. If an optional workflow cannot be represented, omit its
requirement or supply a separately named diagnostic variant after explicit review.

No operation probes run automatically. Future probes require a defined safe
operation, explicit user action, bounded resources and existing shell approval.
Signing, publication, uploads, payments and data-changing tests are outside the
initial release. A denied request is a permission outcome, not conformance failure.

## Catalogue and maintenance

Ship a reviewed catalogue snapshot with the artifact. It works offline and has a
visible review date. The starting scope is the owning registry plus separately
identified new contract proposals; the current Hypergolic snapshot contains 35
entries but is not an exhaustive or permanent target.

Each record needs:

| Field | Requirement |
| --- | --- |
| Stable domain and NAP ID | Unique identifier used for discovery and updates |
| Display name, description and icon key | Plain-language content; icons supplement text |
| Upstream status | Preserve registry/proposal wording such as Active, Draft, Deferred or Proposed |
| Status source | Registry, document or open proposal; explain conflicting labels rather than silently choosing a ratification status |
| Owning source URL and exact revision | Immutable document URL when possible; PR URL plus exact head revision otherwise |
| Review date | Date the record was checked |
| Provenance | Distinguish a new contract from an amendment or subtrack |

Keep catalogue metadata separate from per-session discovery and shell-reported
limits. A new proposal's existence does not mean any shell implements it. Unknown
upstream statuses should display verbatim or as an explained unclassified state,
not be promoted to Approved.

For each catalogue update, review owning sources, record exact revisions, check
domain uniqueness and references, rebuild the artifact and inspect the rendered
rows. Publish a separately reviewed version. A future remote catalogue update
service is outside v1; it needs its own source trust, integrity, offline fallback
and update policy. Do not fetch and trust arbitrary PR content automatically.

## UI requirements

Use a compact single-column list that fits a phone and wider screens. Each row
shows an outline domain icon, domain/name, upstream status and a text-labelled
availability symbol. Expand it for the description, result scope/source, known
limits, owning link, exact revision and review date.

Search names, domains and descriptions. Offer All, Available, Not offered and
Unknown filters for standard discovery, with accurate counts and a useful empty
state. Unknown results must never be grouped as unavailable. If a separate
shell-report view exists, its labels and filters must match that scope.

Use native disclosure semantics, visible keyboard focus and text that does not
depend on color alone. Test keyboard expansion, filtering focus, small screens,
long domains/URLs and larger text. Honor reduced motion. Keep source addresses
selectable when external navigation is unavailable. Standard results and richer
reports must use the same vocabulary throughout the interface.

## Optional shell reports

Treat every extension as optional and versioned. Its absence must not impair
standard discovery. The independent project must not silently depend on
`window.hypergolicSupportReport`; supporting it is an explicit adapter decision.

Validate report version, scope, bounded strings and record counts, allowed states
and unique domains. Ignore malformed or unsupported records and retain the
standard result. Render text safely. Keep shell identity unknown unless the host
explicitly supplies it; do not infer the shell from browser identity.

Report scope, provider, review/profile revision and limits in the UI. Reports
describe the shell's own claims; they are not independent conformance tests and
must never grant privileges. Missing entries are Unknown unless another reliable
discovery source provides a scoped result. Define any interoperable reporting
format with participating shell developers before claiming it as a standard.

## Build and publication

Create source and data in a separate repository. Use pinned tools and a lockfile;
keep discovery/UI independent of host-specific adapters. Produce an inspectable
static napplet artifact using the selected NIP-5A/NIP-5D profile. Select and record
their exact owning revisions at kickoff rather than copying an older manifest
without review.

Review artifact bytes, manifest requirements, HTML/path/aggregate hashes, publisher
coordinate and delivery locations before signing. The same signed artifact must
be exercised through ordinary published loading in the named target shells. A
bundled Hypergolic fixture or standalone browser preview does not prove this.

Publisher identity, signer, destinations, release/update process and target shell
versions remain release decisions for the independent project. No credentials,
private paths or device identifiers belong in the published artifact. This spec
does not authorize signing, uploading or publishing a release.

## Acceptance checklist

| Scenario | Required behavior |
| --- | --- |
| Granted domain after handshake | Available, explicitly scoped to this napplet |
| Implemented but ungranted domain | Not offered in standard discovery; any broader report remains separately labelled |
| Absent/unknown domain | Not offered when discovery returns false; no unsupported inference |
| Missing, rejected or delayed handshake | Unknown; usable catalogue; late success updates results |
| Failed/malformed domain query | Unknown for that row without crashing others |
| Foundational SHELL | Shown from handshake success, not a false supports query |
| No custom report | Full standard UI remains functional |
| Malformed, incomplete or obsolete custom report | Safe fallback; no false global absence or privilege change |
| Known limitation | Visible specific operation/limit detail, separate from Available |
| New proposal | Reviewed metadata/date/revision; no invented approval or support |
| Search/filter/disclosure | Correct counts, keyboard controls, readable phone layout and larger text |
| No link permission | Catalogue works; source URL remains selectable |
| Reload or different shell | Fresh scoped results; no stale cross-shell support claims |
| Published release | Exact reviewed artifact loads in each named target shell; record unsupported hosts and distinguish browser mocks from actual host proof |

## Suggested build order

1. Standard handshake/discovery and offline catalogue, with honest scoped labels.
2. Compact accessible list, search, filters and expanded references.
3. Failure/lateness/fallback regression tests and real cross-shell fixtures.
4. Optional report adapters only where their scope and format are agreed.
5. Reviewed signed publication and ordinary host acceptance.

The initial product answers “What is offered to this napplet?” reliably. Detailed
whole-shell reporting and conformance testing can grow independently without
turning limited discovery into an unsupported claim.
