# Plan 02-05 progress — published loading and relays

## Implemented boundary

The trusted shell now has a pure gate for canonical named-napplet `naddr`
coordinates, fresh kind-35129 NIP-01 event and publisher/`d` checks, NIP-5A
`/index.html` hashes, immutable verified bytes, exact signed event pinning,
revocation and no fallback after a chosen version's blob fails. The pinned
protocol revisions and local size/profile limits are in
[`docs/native-contract.md`](../../../docs/native-contract.md). A transport
adapter queries only configured lookup relays and retrieves content-addressed
Blossom paths from signed HTTPS hints. Its HTTPS connection port must enforce
public-IP pinning; it is not yet provided by the app.

The trusted Network and Lookup relay lists seed the selected RocketShell defaults
once, persist edits in a dedicated SQLite database and expose add/remove/restore
controls in Settings. Approved publications use the current Network list at
request admission. A relay storage startup failure leaves identity entry usable,
shows an unavailable state and denies new signing requests before key use.

## Verified so far

- Focused napplet, relay and runtime-owner suite: 40 passing tests.
- Pinned TypeScript checks pass.
- Android and iOS JavaScript exports pass; they do not prove native behavior.
- React Doctor numeric score 100/100 and aislop 100/100 with zero diagnostics
  at the last integrated run. Recheck after any further edits.

## Remaining for 02-05 and v1

There is no app-entry link flow, first-open publisher/access consent, native
verified-byte registry, published WebView execution, trusted cache, pinned
restart recovery, explicit update UI, or native settings journey yet. The
transport still needs platform network ports with bounded relay frames and
connection-time public-IP checks. The native handoff must transfer at most 2 MiB
without putting HTML, paths or URLs in React view props, then check the original
bytes again before host CSP and namespace injection. Android and iOS published
journeys and update/recovery drivers remain open. Do not mark LOAD-01 through
LOAD-03 or RELAY-02 complete from these unit tests or bundle exports.
