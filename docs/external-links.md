# External links

Phase 2.6 and CAP-07 are accepted for the selected profile under the two
[approved dependency exceptions](dependency-patches.md).
The selected [NAP-LINK proposal 53](https://github.com/napplet/naps/blob/e25143355f6d416bfce73b12ec814f1c795ec16a/naps/NAP-LINK.md)
is open and unmerged, checked 3 October 2026. Draft bytes SHA-256:
`e65cb78b0d30aff82c370a3b21840282649dec16ed984d99dc10e1b800d9ba1d`.

## Selected contract

HTTPS requests need trusted native approval for every opening. Review shows the
native-captured napplet/publisher and complete actual destination. The device’s
normal handler may open a browser or associated installed app. The guest label
cannot choose the destination, review buttons or policy. No remembered link
allowance, guest opener, shell fetch or returned bytes is granted. `opened` means
accepted OS handoff, not successful page loading. HTTP, mailto, tel, nostr and
custom schemes remain gaps without a promised delivery phase.

The conservative URI profile accepts absolute ASCII HTTPS URLs up to 4096 bytes,
DNS/punycode hosts, canonical dotted IPv4, bracketed IPv6, ports 1–65535 and
encoded paths/query/fragment. It rejects credentials, raw whitespace, controls,
backslash, Unicode, malformed hosts/ports and invalid escapes. Callers must encode
international names and paths; the shell does not silently normalize an approved
destination. A reviewed HTTPS localhost/private address does not grant guest
local-network fetching. No DNS or fetch preflight occurs.

The wire envelope is bounded to 16 KiB, IDs to 1–128 bytes and an optional label to
256 bytes without controls. One review/dispatch is permitted globally, with three
admitted reviews per generation and twelve globally per minute, at most 64
registered generations and a 25-second review expiry. There is no automatic retry.

## Ownership and revocation

Focus and foreground are required for review and dispatch. Blur/background cancels
undispatched review. A claimed one-shot OS receipt may complete across the background
it caused; close, replacement and identity revocation still suppress delivery.
That receipt cannot dispatch another opening or revive ordinary work.

The trusted identity owner synchronizes user/epoch/availability before vault work
or React teardown. A newer epoch invalidates old native generations. The app-only
synchronization method exposes no URL opener. Native null revocation clears runtime
transport bookkeeping without becoming a guest denial; browser coverage advances
beyond the transport timeout to verify no late result. A current owner still gets
canonical denial for policy failure or expiry.

Native review escapes control, bidi and paragraph characters in signed identifiers
literally while preserving ordinary Unicode and the original captured identity.

## Verification and remaining gates

The owning native cores pass 189 Android and 167 Swift assertions. The full browser
runtime passes 172 cases across Chromium and WebKit, including seven-domain published
artifact admission, SDK status shape, revoked recipients and legacy WebView imports.
These checks are separate from native execution evidence.

Selected Release emulator/Simulator lifecycle matrices pass thirteen Android and
twelve iOS cases: actual OS handoff/return, cancel, HTTP rejection, pending
blur/background/close/identity/unavailable-owner revocation, expiry, single-review
flood, generation rate limit and invalid URLs. Android additionally verifies an
actual missing HTTPS handler and restores Chrome afterward. iOS no-handler failure
is not reproduced on this Simulator; its conditional branch is reviewed only.

Normal locally signed Resource Lab admission passes eight cases on each host, including
separate domain consent, per-opening review, cold grant restoration, confirmed
identity transition and a sibling manifest without link access. Final-source repetitions, both ordinary exports/prebuilds and Android ARM64/iOS
Simulator Release builds pass with unchanged native-tested source. Fixtures use
disposable public identities and locally supplied signed artifacts; no external
publication or protected/physical-device claim is made.

A supplementary signed Android run waits for the actual focused browser window
and accessibility tree before capturing Chrome’s first-run screen, then verifies
the original SDK `opened` on return. This proves OS handoff, not page loading.
The original early handler image caught the app before browser drawing; it is
retained unchanged. Supplementary ADB-timeout and window-selector failures are
also preserved separately.

Earlier failed runs remain failed: stale identity denial on both native hosts,
missing published-artifact link admission, Android one-shot address truncation,
observer readiness and expiry timing. Drivers now verify complete native address
entry and wait for the actual guest accessibility tree. Android lifecycle cases
launch independent processes; the explicit close case removes/reopens a view
within that case. Repeated later remounts can lose virtual WebView accessibility
while controls remain rendered. That continuity issue remains a CAP-14 gap.
The global twelve-review bound is owning-core evidence, separate from these launches.

The fresh complete quality report measures React Doctor100 and aislop97. Doctor
has zero findings; aislop has exactly the approved Forge and braces findings.
The [locked patch exceptions](dependency-patches.md) are approved. A separate
review verifies full current-source coverage, unchanged before/after source,
exact tool/raw-report bindings, both installed patch closures and precisely the
expected audit consumers. All74 quality regressions pass. Root audit retains two
high advisories, quality audit one and the other seven lockfiles are clean.
The unchanged standard100/no-findings verifier still fails visibly.

The owner approved the exact zero-findings score payload and destination on
3October2026. Fresh full local preflight is empty before the numeric request;
ancillary telemetry remains disabled. The earlier automatic approval rejection
is preserved in the private evidence as a pre-execution rejection, followed by
this explicit authorization.

The ordinary check script stops at Expo Doctor’s existing locked-version check:
six Expo packages are behind its current recommendations. Pins remain unchanged.
Both ordinary exports/prebuilds and Release compilations pass. Broader protected,
physical, older-device and complete published MVP journeys remain CAP-14.
