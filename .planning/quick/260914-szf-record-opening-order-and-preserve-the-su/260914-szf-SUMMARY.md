---
quick_id: 260914-szf
status: complete
mode: quick
execution: inline
code_commit: 97f31e0cc33880f05d0f4e709443291a4bfccc54
---

# Project logo and navigation decisions captured

Preserved the supplied original at `assets/brand/hypergolic-logo.png` and recorded
its intended noninteractive shell-header role. The PNG is 1254 × 1254 with a
transparent background. A static comparison at 24/32/40 CSS pixels on dark and white
surfaces was visually inspected. The 32-logical-pixel starting size was subsequently
confirmed on 14 September, still subject to native validation; no alternative
artwork was made.

Confirmed navigation: preserve opening order, append newly opened napplets, and
stop at either end with a small resistance animation. Handle taps still show the
accepted two-column overview. After closing a card, keep the overview open while
other napplets remain, as subsequently confirmed on 14 September. Closing the final
napplet leaves a quiet empty overview with an Open napplet action using the existing
settings flow, also confirmed on 14 September. Explicitly closing all napplets
preserves that empty state across restarts; ordinary restarts with an open napplet
still reopen the last active one, subject to verification. Exact motion and native
behavior remain unimplemented.

Subsequent signing UX confirmation on 14 September: use a trusted shell-owned
sheet showing the requested action and content, requesting napplet and publisher,
and selected identity. Exact event details are expandable, with Approve once /
Reject controls. Rationale: make each request understandable while preserving
access to the precise event. Payload binding, request lifecycle and native UI
implementation remain open; the confirmation does not introduce a protocol contract.

Verification: source and project copies match SHA-256
`16fcc05023863f81bbc74395fb039b59f9634fef0930f370541a979979b92448`;
all six size samples decoded and retained square aspect ratio. PNG metadata was
inspected: orientation, dimensions, sRGB and XMP toolkit metadata only; no personal
identifiers were found. Diff/link/privacy checks passed. Original artwork and prior
local iOS/ignore edits were preserved. Source commits remain local.

No app UI, native configuration, dependencies or fixture behavior changed. No build
or automated regression suite was rerun for this asset/documentation task. The
logo is not yet installed as a launcher icon, splash screen or actual shell header.
