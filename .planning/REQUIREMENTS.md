# Requirements: independent Android proof

Status: planned, derived 15 September 2026 from accepted product decisions. Every row remains open unless a final current-state evidence record proves it. The implementation baseline is a static native development screen, standalone UX Lab, supplied logo, and unused relay seed arrays. Historical browser/scaffold evidence is partial only.

The goal is the complete agreed native shell and independent Android proof, including purpose-built fixture publication under the designated project key. The theme-only first native trace is a dependency, not the finish line.

## Acceptance matrix

| ID | Requirement | Required evidence | Baseline |
|---|---|---|---|
| UX-01 | Minimal header, supplied 32dp square logo without tap action, focused napplet name, avatar + shortened selected npub opening trusted settings | Screenshot and accessibility tree on target phone; actual tap opens settings; full npub copies correctly; focused napplet fills remaining space | partial logo |
| UX-02 | Profile avatar when available; deterministic local fallback otherwise | Two controlled identities, valid/missing/broken profile image cases; avatar and short/full keys match after switch and restart | missing |
| UX-03 | Multiple loaded napplets, stable opening order/new appended, focus does not reorder | At least three UX instances with distinct values; list order assertions after navigation/open/close | partial browser fixture |
| UX-04 | Inset thumb-height handles: left inward previous/right inward next; follow drag; cancel early; resistance at ends, no wrap | Actual touch input and frame/video observations at both ends and middle; early-release return; no false switch while using near-edge fixture controls | missing |
| UX-05 | Tap either handle -> zoom to two-column overview; card tap zooms into focused app, including at ends | Phone screenshots and transition recording establishing focused view-to-card geometry in both directions, plus reduced-motion behavior | missing |
| UX-06 | Live switching retains unsent input and both scroll positions | Fill/counter/scroll three fixtures; switch through all; independently observe exact values and visible markers on return | missing |
| UX-07 | Upward card swipe closes; clean closes without prompt; unsaved/unknown warns Keep open(default)/Close anyway | Clean/dirty/unknown cases via selected contract; cancel preserves session; accepted close tears it down and cancels approvals; no guessed dirty-state NAP | missing |
| UX-08 | Closing preserves saved data, remains in overview; last close -> quiet empty view with Open napplet/settings | Close/reopen State Lab and inspect saved values; close last and verify accessible identity and existing Open napplet settings flow | missing |
| UX-09 | Ordinary restart restores order, last active verified view; lazy reload others; deliberate empty survives restart | Force-stop/relaunch with same identity/data; compare order/focus/version/empty state; do not claim unsaved draft process-death recovery | missing |
| UX-10 | Keyboard, Back, accessibility and motion tuning | Real keyboard entry/occlusion, focus restoration, screen-reader controls and Back from focused/settings/overview/approval; phone conflict observations | missing |
| ID-01 | First launch creates and securely persists one key without onboarding/external signer; subsequent launches reuse | Fresh disposable app profile; independent npub derivation; repeated process/reboot reuse; failure-injection proves failed read never creates replacement | missing |
| ID-02 | Authenticated encrypted storage with native key protection; no secret leaks or automatic backup | Native code/config inspection, at-rest ciphertext/tamper tests, backup exclusion, secret absence in WebView/React persistence/logs/crash artifacts, controlled failure paths | missing |
| ID-03 | Trusted-settings nsec import validates, selects and persists; previous keys remain encrypted/selectable | Valid/cancelled/malformed/out-of-range import tests; same npub after restart; switching back works; hex import not required | missing |
| ID-04 | One identity across every loaded napplet; switch confirms once, warns unsaved loss, cancels all old requests/restarts sessions | Three sessions + pending approval, cancel-switch preservation, confirm-switch isolation, stale callback/replay rejection and no old event under new identity | missing |
| ID-05 | Optional manual nsec backup after explanation/device auth; no export on cancel/failure | Native auth success/cancel/unavailable cases, exact exported/imported public identity comparison, secret handling observations without recording raw key | missing |
| ID-06 | Deletion separate/explicit/device-authenticated; another saved identity required | Delete cancel/failure/success tests, last-identity action unavailable, ciphertext removed and surviving identity/session behavior correct | missing |
| STATE-01 | User + verified publisher + stable napplet storage scope; same verified app versions retain data | State Lab A/B d-tags, publisher A/B, identity A/B cross-product; update/reopen comparisons, quota/type errors, no namespace supplied by untrusted caller | missing |
| SIGN-01 | Every supported update explicitly approved in trusted sheet | At least note and another supported kind, full action/content/napplet/publisher/identity plus exact expandable event; Approve once/Reject; no silent route | missing |
| SIGN-02 | One request at a time, no Approve all; dismiss rejects current and pauses remainder | Multiple requests same/different sessions; actual dismissal/back/swipe behavior; only deliberate resume shows next | missing |
| SIGN-03 | Background/unfocused requests wait for focus and overview indicates pending | Arm delayed Approval Lab request, switch before emission, prove no signing/dialog theft, focus/review afterward | missing |
| SIGN-04 | Cancel on close, identity change or process termination; never replay approvals | Pending/current/in-flight race tests and restart fresh-request requirement; bound queue/expiry/resource handling and deterministic native cancellation errors | missing |
| SIGN-05 | Exact approval payload bound through asynchronous signing/publication | Mutate/reorder/duplicate/replay submissions, request ID/session/version/key binding; independently verify event ID/signature/tags/content/pubkey and relay receipt | missing |
| SIGN-06 | Denial prevents signing/publication; clear network outcomes | Independent local relay counts/logs for approve, reject, delay, disconnect, timeout/interrupted or partial publication; UI must not report unobserved success | missing |
| LOAD-01 | Settings accepts chosen published link; manifests/signatures/content hashes verified before execute | Valid supported identifier; malformed/wrong-kind/wrong-publisher/missing/tampered/oversized artifacts rejected before code marker; no fallback to unrelated code | missing |
| LOAD-02 | Any compatible publisher after first-open publisher/access confirmation | Two controlled publishers; cancel prevents execution; unknown/denied/unsupported capability handling; verification not displayed as personal trust | missing |
| LOAD-03 | Version pin until explicit verified update, respecting unsaved/session rules | Serve old/new valid versions and invalid update; no silent replacement, cancellation keeps current, accepted update storage continuity, revoked pending old requests | missing |
| RELAY-01 | RocketShell startup network and lookup roles, editable persisted lists | Exact default arrays, distinct roles, first-run seed only, edit/remove/add/restart, invalid URLs, restore defaults only via explicit action; no NIP-65 auto-routing | partial config |
| RELAY-02 | Required relay authentication/errors handled | Detect selected service auth requirements; native NIP-42 only if needed and consistent with explicit v1 approval; offline/reject/timeout UI observed | missing |
| SEC-01 | Trusted bundled Kehto host, verified untrusted sandbox, source-window/native sender binding | Pin selected contracts; native tests forged sibling/frame/main-frame messages, navigation generation/stale sessions, ungranted operation and malformed/oversized envelopes | missing |
| SEC-02 | No private key, generic native bridge or unrestricted network from napplet | Native malicious fixtures probe parent/native APIs, origin/storage, fetch/XHR/WS/forms/images/navigation/popups/downloads/file/content URLs; external receiver confirms blocked escapes | missing |
| SEC-03 | Navigation/content-process/resource failures fail closed | Renderer termination/reload, redirect/navigation attempts, cleanup/subscription teardown, queue/byte/session limits; no inherited privilege after failure | missing |
| FIX-01 | UX Lab -> State Lab -> Approval Lab, controlled local relay, stable UI identifiers | All fixtures build/conform; tests use public napplet APIs and user-visible shell controls, no privileged fixture approval/storage bypass | partial UX only |
| FIX-02 | Same fixture bytes embedded and published under designated project key | Artifact hash parity, signed release metadata/publisher plus real Nostr/Blossom retrieval; repeat representative behavior through published route | missing |
| FIX-03 | Disposable run identities separate from release publisher, retained across restart | Evidence records public test IDs + fixture versions/hashes; reset only between independent runs; project key never used for routine generated events | missing |
| BUILD-01 | Pinned compatible dependencies/protocols/licenses, checks + native build | Lockfiles/ref inventory and scope-limited conformance; typecheck, React Doctor, aislop, audit, fixture verify, Android export/prebuild/Gradle from current state | partial scaffold |
| BUILD-02 | Locally signed independent Android v1 APK, installed/cold-launched without Metro/Expo hosted services | Current APK payload/signature/hash/permissions inspection; no-Metro launch and full journey on Android; retained commands, exact device/OS, artifact and failures | partial old scaffold |
| BUILD-03 | Preserve current branch/checkout until ready; owner handles new remote/push | Final branch/remotes/status prove no source remote mutation/push; coherent local commits preserve pre-existing edits | currently satisfied |

## Traceability

| Requirement | Implementing plans | Final evidence owner |
|---|---|---|
| UX-01 | 02-02, 02-03 | 02-06 |
| UX-02 | 02-03, 02-05 | 02-06 |
| UX-03 | 02-02 | 02-06 |
| UX-04 | 02-02 | 02-06 |
| UX-05 | 02-02 | 02-06 |
| UX-06 | 02-02 | 02-06 |
| UX-07 | 02-02 | 02-06 |
| UX-08 | 02-02 | 02-06 |
| UX-09 | 02-02, 02-03, 02-05 | 02-06 |
| UX-10 | 02-02 | 02-06 |
| ID-01 | 02-03 | 02-06 |
| ID-02 | 02-03 | 02-06 |
| ID-03 | 02-03 | 02-06 |
| ID-04 | 02-03, 02-04 | 02-06 |
| ID-05 | 02-03 | 02-06 |
| ID-06 | 02-03 | 02-06 |
| STATE-01 | 02-03, 02-05 | 02-06 |
| SIGN-01 | 02-04 | 02-06 |
| SIGN-02 | 02-04 | 02-06 |
| SIGN-03 | 02-04 | 02-06 |
| SIGN-04 | 02-04 | 02-06 |
| SIGN-05 | 02-04 | 02-06 |
| SIGN-06 | 02-04 | 02-06 |
| LOAD-01 | 02-05 | 02-06 |
| LOAD-02 | 02-05 | 02-06 |
| LOAD-03 | 02-05 | 02-06 |
| RELAY-01 | 02-05 | 02-06 |
| RELAY-02 | 02-04, 02-05 | 02-06 |
| SEC-01 | 02-01, 02-04 | 02-06 |
| SEC-02 | 02-01, 02-05 | 02-06 |
| SEC-03 | 02-01 | 02-06 |
| FIX-01 | 02-01, 02-03, 02-04 | 02-06 |
| FIX-02 | 02-06 | 02-06 |
| FIX-03 | 02-04 | 02-06 |
| BUILD-01 | 02-01 | 02-06 |
| BUILD-02 | 02-06 | 02-06 |
| BUILD-03 | 02-06 | 02-06 |

## Exclusions

External signers, configurable silent-signing policy, catalogue, feeds, DMs, zaps/payments, mandatory profile editing and independent iOS distribution are later work. Hex key import is not required. Unsaved drafts need not survive process termination. The source remote and source push remain owner-controlled.

## Evidence discipline

A test must exercise the actual behavior its row names. Fixture success text, browser-only tests, model/unit tests and static scanners do not prove native boundary safety or phone UX. Completion requires current code/artifact hashes, actual target-device interactions, independent relay/event verification, and recorded limitations. Never mark a row complete from a planned file or a generated manifest.
