# Phase 2.4 progress

Plan 01 passes its selected first-PNG profile on Android API 36 and iOS 26.5
Simulator. Exact source/build/installed products, native review/reject/approve,
original SDK receipt and cold launch pass on both hosts. Independent server
observations require zero TLS connections after Reject and one exact 71-byte PUT
with full valid Schnorr authorization after fresh approval. Screenshots of both
trusted review and confirmed outcome have been inspected.

Shared uploads 44, security 349 plus bootstrap 13, capability owners 50, native
authority 485 and raw TLS 26 pass. Genuine SDK/browser runtime previously passes
154. Both ordinary production JS exports pass. Full React Doctor and aislop are
100/100 with all nine dependency audits. Sealed native products use a disposable
public identity and compile-gated local TLS; protected physical-device signing is
not established by this fixture.

Next is plan 02: native selected-file picker, photo metadata preparation with
orientation/color preservation, bounded unchanged attachments and their actual
Android/iOS journeys. Plans 03–04 cover durable uncertainty reconciliation, full
lifecycle/fault acceptance and final published admission/quality. CAP-05 remains
open and the phase remains in progress. Weekly consumption last observed 45%;
pause at 50%. Source changes are local on the existing branch without source push.


## Plan 02 selected-PNG checkpoint — 1 October 2026

The native document picker on Android and photo picker on iOS now hand only a
prepared, selected PNG to the original file input. The generated 302-byte fixture
contains actual Exif camera, date and GPS fields plus PNG text. Each genuine
SDK/native journey observes the exact 71-byte sanitized output before upload,
rejects with zero new TLS connections, reads the selection after rejection, then
freshly approves one exact stored upload with independently valid Schnorr signing.
Final build/source/installed-product seals pass on both hosts; native screenshots
of review and post-rejection guest reading have been inspected. These are isolated
public-disposable-identity journeys, not protected-device or published acceptance.

Native owner assertions now pass 655, raw TLS 26, shared upload 44 and capability
owners 50; TypeScript and both production JS exports pass. React Doctor and aislop
are both 100/100 with all nine audits on the selected-PNG implementation. Fixture
input names remain generic; final trusted caller UX is still reviewed in plan 04.

Plan 02 remains incomplete: JPEG/WebP/GIF/HEIC, nonneutral orientation and color,
ordinary audio/video/document attachment handoff/review/upload, native picker
cancel/revoked-recipient cases and broader sanitation evidence are still required.
Plans 03–04 also remain open. Android's external picker may return a fresh selected
file on foreground resume; it revives no prior upload approval or network grant.
Weekly usage last observed 48%, with the authorized pause at 50%.
