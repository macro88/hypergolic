---
status: resolved
trigger: Actual Android original Outbox SDK query timed out despite unit/browser checks.
---
# Outbox SDK override

Inline GSD debugging fallback; no delegated debugger or independent review claimed.

Observed: first Android query timed out without an original result. The runtime declared an Outbox override, but the installed patched runtime hostOperationNames omitted outbox.query. The service stub therefore handled the operation and threw without returning its required result.

Fix: extend the existing pinned pnpm runtime patch with outbox.query and canonical required-empty-events failure. Preserve ACL/firewall gates, native captured owner and absent-hook behavior. Original SDK event/empty/failure/older-WebView wire cases plus ACL/firewall cases pass in Chromium and WebKit:216 tests.

Separate fixture issue: independently verified replaceable kind10002 sample ceased to exist by exact id on both discovered relays; both native hosts returned valid empty results. Preserve those runs as failed acceptance. Choose a retained signed kind1 sample instead; no fixture publication.

Follow-up: source-bound native query acceptance and cold-cache evidence remain pending until recorded in the phase summary. Detailed reads now preserve earlier verified partial data at the total deadline; legacy query deadline behavior and external/native revocation remain unchanged and covered by new regressions.
