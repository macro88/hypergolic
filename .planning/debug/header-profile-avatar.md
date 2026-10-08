---
status: awaiting-native-verification
requirement: UX-02
created: 2026-10-08
---

# Profile avatar missing from ordinary entry

The accepted requirement is a profile avatar when available and a deterministic
local fallback otherwise, including correct selected identity after switch/restart.
Initial source inspection supplied affirmative missing-wiring evidence before repair:

- `src/shell/IdentityShell.tsx` creates the ordinary WorkspaceEntry identity with
  only `npub`, with no profile subscription or avatar field.
- `src/shell/WorkspaceEntry.tsx` carries that identity through ApprovalWorkspace/Shell.
- `src/shell/Header.tsx` can render an optional trusted avatar, but ordinary entry
  never supplies it. Valid profile images therefore cannot reach that branch.
- Avatar's failure flag is currently keyed only by npub. Any repair also needs
  a new validated picture for the same identity to recover from a previous failure.

No controlled valid-image physical case has run. The shared product repair below
is implemented; its native acceptance is not yet claimed.
Both UX-02 platform entries remain not-run. Existing fallback-only header proof
supports UX-01's named header scope, not complete available-profile behavior.

The repair should remain process-owned: reuse the selected identity's verified,
bounded signed kind0/cache/relay resolver and the app-only bounded native HTTPS
transport. Avoid synthetic guest registrations or giving a WebView the native
transport. Supply validated local image bytes to the header. Capture selected
public key/epoch, revoke stale work on identity/recovery/background, and keep the
fallback while absent, malformed, expired or failed. Profile work must not block
shell startup or manufacture an empty workspace. Native DNS/TLS/body controls
must continue to apply; a direct untrusted picture URL handed to Image would
bypass those controls.

Use the installed Expo Image API and a source-sensitive failure reset. Its
[official SDK reference](https://docs.expo.dev/versions/latest/sdk/image/) documents
source, error handling and cache policy; installed types and version remain the
implementation authority. The modern-web-guidance search/retrieval ran; its
browser image-priority guide is not a native image transport implementation and
its update notice does not authorize changing the installed skill or dependencies.

Verification must include valid/missing/malformed/broken image, stale identity and
background responses, same-identity image replacement after failure, type/byte
bounds and both physical native hosts. Preserve the existing identities, workspace
and source branch. Keep every broader physical/published/security gate open until
its actual complete evidence passes.

## Shared repair — 8 October 2026

Ordinary entry now supplies an external-store avatar from the actual trusted owner.
The app-only profile method shares the existing reverified signed/cache/relay path;
the guest interface and approval admission remain unchanged. The selected user/epoch
store cancels before React on transition and on background, retains only one local
image, and bounds its combined work to40 seconds. Native public HTTPS transport,
canonical two-MiB Base64 decoding and existing4096-axis raster admission precede the
local data URI. Full platform codec failures remain an Image fallback, with a new
source able to recover for the same npub. No disk/memory Image cache or animation
autoplay. Redirects use the existing direct-only native policy and fall back.

TypeScript and83 identity,5 guest identity-broker,28 shell and23 resource tests pass.
These include29 new meaningful avatar/profile regressions. Full current quality and
ordinary signed builds are being verified separately. UX-02 stays not-run on both
phones until actual available/missing/broken image and selected switch/restart cases
run on source-bound physical hosts. Do not reclassify the previous fallback-only
header or iPhone empty-workspace evidence as complete avatar proof.

Foreground startup runs on the next task so an immediately cancelled shared profile
read can release its admission slot before return. A real SQLite/resolver regression
covers immediate background/foreground cancellation, not only a profile-port double.

Each admitted source carries its fresh native operation cache key, which also keys
the Avatar component. Replacement remounts isolate delayed old codec callbacks;
same-user, same-byte rereads still obtain distinct keys. No Image cache is enabled.


Local implementation27a3e4d is committed. Both ordinary signed Release builds pass;
all1217 build inputs remain unchanged, with no repaired-product installation yet.
Full Doctor100/100 across428 files and aislop98/100 across420 files are source-bound;
only the two exact approved dependency exceptions remain and the normal verifier
stays red. Ten lockfile audits complete. Original verifier/scanner predecessors are
preserved privately. Physical UX-02 remains not-run on both hosts.
