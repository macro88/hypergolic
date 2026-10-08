---
status: investigating
requirement: UX-02
created: 2026-10-08
---

# Profile avatar missing from ordinary entry

The accepted requirement is a profile avatar when available and a deterministic
local fallback otherwise, including correct selected identity after switch/restart.
Source inspection supplies affirmative missing-wiring evidence:

- `src/shell/IdentityShell.tsx` creates the ordinary WorkspaceEntry identity with
  only `npub`, with no profile subscription or avatar field.
- `src/shell/WorkspaceEntry.tsx` carries that identity through ApprovalWorkspace/Shell.
- `src/shell/Header.tsx` can render an optional trusted avatar, but ordinary entry
  never supplies it. Valid profile images therefore cannot reach that branch.
- Avatar's failure flag is currently keyed only by npub. Any repair also needs
  a new validated picture for the same identity to recover from a previous failure.

No controlled valid-image physical case has run and no product repair is claimed.
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
