# Plan 02-04 progress — 22 September 2026

Status: in progress. No end-to-end native approval or publication claim.

The [signing checkpoint](../../../docs/signing-approval.md) describes tested
native lifetime authorities for Android/iOS, shared queue presentation, immutable
event/signature verification and a revocable Applesauce adapter with actual local
WebSocket observations. Native authorities compile in their owning modules but
have no Expo/transport/signer integration. Approval Lab now builds as a standalone unsigned test artifact with 32 passing
Chromium/WebKit checks; it is not in the native catalogue. Conformance has five
passes and five explicit skips, not native protocol acceptance.

All three plan tasks remain open at their native acceptance scope. Next work is
owner-bound native admission/reply adaptation, protected signing and the shared
review sheet, then the genuine SDK-to-relay trace and both-platform lifecycle
matrix. Preserve the 600-second native lifetime and publication-only 660-second
reply deadline as one integration change. Physical devices, remote loading and
publication credentials remain separate gates. No source push or remote change.
