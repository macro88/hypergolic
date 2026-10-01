# Upload access — implementation in progress

Phase 2.4 selects the [NAP upload draft at a7cc174](https://github.com/napplet/naps/blob/a7cc17463cbf5d9cb87884b31071bc4fc826034c/naps/NAP-UPLOAD.md)
and [Blossom at b5bd280](https://github.com/hzrd149/blossom/tree/b5bd2801d1763aa635fc8fea7a76597e0eb18990).
The public operations are `upload.info`, `upload.upload` and `upload.status`, with
`upload.status.changed` notifications. Blossom is the selected rail; NIP-96 is
rejected. Published upload admission remains disabled while native acceptance is
in progress. The unsigned bundled Upload Lab is a separate reviewed fixture.

## Confirmed product decisions

The shell has one editable default upload server in trusted Settings. The first
engineering default is `https://blossom.nostr.build`; each review names the captured
destination. The selected provider enforces the authorization's server scope in
the retained read-only HEAD comparison. That observation is not evidence of PUT,
retention or universal free attachments. The [operator's service description](https://blossom.nostr.build/)
distinguishes free image/audio/video uploads from paid formats and larger files.
Download configuration remains independent, and uploads have no automatic fallback.

Every upload needs separate approval of its requesting napplet, publisher, selected
identity, actual file preview, output type, size, SHA-256 and destination. Approval
is one-use. Photos must have embedded personal metadata removed before review;
other attachments retain their bytes with a metadata warning. Failed preparation
must not silently upload the original. Orientation and color must remain correct.
The system photo/file picker is accepted: only selected files become readable by
the requester, including when an upload is declined. The selected-PNG picker journey is verified on both native hosts; broader
photo-format acceptance is still pending.

Approved uploads continue when switching between loaded napplets while the app is
in the foreground. Trusted progress and Cancel remain available. Background,
requester close/replacement, renderer loss and identity changes revoke authority.
Cancel does not promise deletion of a server copy. An uncertain dispatched outcome
must be reconciled at the same destination/hash before a freshly approved retry;
the durable recovery/reconciliation slice is still pending.

## Current implementation boundary

`src/uploads` contains the strict request contract, immutable byte snapshot,
protected upload-signing projection, per-file coordinator, native port and private
SQLite settings. The ordinary relay approval lane rejects kind 24242. The upload
lane signs only a factory-created upload snapshot under a live native approval;
the shared verifier checks the complete Schnorr signature and exact event.
Native credential parsers independently check the captured identity, purpose,
hash, server, event ID and time, but do not independently verify Schnorr signatures.

The genuine SDK sends Blob/ArrayBuffer data to the trusted Kehto adapter. That
adapter copies intrinsic bytes before asynchronous work, then uses an ordered
private begin/chunk/seal lane. Native code captures the origin, body and destination,
computes SHA-256, and retains opaque review/grant handles. Private tokens and
credentials never enter public SDK results. Metadata, caption, filename and
`noTransform` survive the adapter boundaries without becoming network authority.

The current preparation profile accepts noninterlaced 8-bit RGB/RGBA PNGs,
bounded to 4,194,304 pixels and 4096 pixels per dimension. Native code verifies
container bounds, chunk CRCs and ordering, then removes text, modification-time
and validated neutral-orientation Exif metadata before hashing/review. Supported
pixel and color chunks remain byte-identical. Compressed text is discarded without
inflating it; the unchanged pixel stream is independently checked for decoded size
and row filters, and iOS also exercises ImageIO. Nonneutral orientation, extra image
directories, ICC, animation, unknown chunks and other photo formats fail closed.
This partial preparer does not complete the full photo requirement. The container
basis is [PNG Third Edition, 24 June 2025](https://www.w3.org/TR/2025/REC-png-3-20250624/).

Both hosts now route a single-file input to the native system picker only for a
live, focused, upload-enabled generation. Native code copies and prepares bounded
selected bytes before returning an app-private representation to that original
input. Android keeps global file/content access disabled and exposes only an
unexported, UID-checked provider with an exact declared descriptor length. iOS
uses public document/photo pickers, reads an open-in-place document or selected
photo representation, and returns a copied private file. Neither returns original
provider paths or requests whole-library permission. Only the selected PNG
profile is currently implemented; broader formats and ordinary attachments remain
pending. A declined upload does not revoke the selection already shared with its
requesting napplet.

Picker preparation and retained selections are bounded. Close, replacement, focus
loss and background clear staged representations; callbacks recheck the captured
generation and native registration. Android's external chooser necessarily suspends
the parent activity: its outstanding user selection may return on foreground resume
within the original deadline. Returned or processing selections are cancelled on
background. This exception creates no upload approval and revives no revoked
network grants. The full revoked-recipient native journey remains to be verified.

Native owners allow one request per realm and two per process, with a 10 MiB file
bound, 256 KiB carrier chunks, a ten-minute review lifetime and a sixty-second
approved transfer lifetime. These are engineering bounds for this phase. Native
monotonic clock regression revokes authority. Authorization remains strictly past
and unexpired even if the wall clock moves backward.

Both native hosts and Expo modules now have the private byte/review/PUT methods.
Original renderer recipients are captured for status delivery; WebKit's initial
reply handler is used once and progress uses a separate captured-world delivery.
The PUT owner vets the complete DNS answer, connects to a numeric public address,
checks platform TLS trust/hostname, and sends the reviewed exact body without
redirects or retry. Body progress means bytes accepted by the local socket, not
server confirmation. Only an exact native-validated receipt can produce completion.
Post-dispatch lost, invalid or stale results remain uncertain.

The isolated QA build has a compile-gated loopback TLS seam for exactly
`https://files.example.com:19943` with a disposable anchor. Android requires
`-PhypergolicUploadProof=true`; iOS requires `HYPERGOLIC_NETWORK_PROOF`.
Ordinary builds reject proof configuration. The isolated entry uses a disposable
signer and does not establish protected-device identity acceptance.

## Evidence and remaining work

Run `pnpm run test:uploads`, `pnpm run test:uploads:native` and
`pnpm run test:uploads:tls`. The [owning proof scope](../tests/native/upload-authority/README.md)
separates shared controlled ports, native ownership logic, actual isolated raw TLS
transfers and SDK/native UI journeys. TypeScript and the complete Chromium/WebKit
runtime suite cover the shared carrier. A successful Android/iOS build confirms
compilation, not file-picker, preview, approval or server-byte acceptance.

Phase 2.4 remains open. The first metadata-free SDK/native PNG tracer is accepted.
Finish selected-file native acceptance and supported photo sanitation/orientation/color,
unchanged audio/video/documents, uncertain
reconciliation, published admission and final quality/native acceptance. Final
React Doctor and aislop scores must both be 100/100 on the final source.

## First native tracer acceptance

The initial metadata-free 2×1 PNG completes the genuine SDK → Kehto → native
review → scoped signing → pinned raw PUT → original SDK receipt path on Android
API 36 and iOS 26.5 Simulator. Native Reject produces zero new TLS connections or
requests. One fresh approval produces one independently observed 71-byte stored
file with SHA-256 `5a852fbaaaecaf4cd14c01e150c7f881c5c5894b0a1e3c53be7e007c58374ee6`;
the separate server process verifies the complete Schnorr signature, selected
public disposable identity, destination/hash scope and short lifetime. Both
journeys pass cold launch, with source/build/installed product seals and inspected
review/confirmation screenshots. The iOS fixture uses native entropy initialization.

Native finish now revokes the grant synchronously before delivering its declared
terminal outcome, preventing a competing cancellation receipt. Shared metadata
recapture accepts safely copied JSON records while preserving accessor, inherited
object, depth and size rejection. The review holds a stable decoded preview and
exposes its actual outcome text to accessibility.

The associated checks pass: shared upload 44, protected security 349 plus bootstrap
13, capability owner 50, native authority 485, raw TLS 26 and genuine browser SDK
runtime 154. Both ordinary production JS exports pass. Full React Doctor and aislop
reach 100/100 with nine dependency audits. Native fixtures establish the selected
first-PNG path with disposable signing; they do not establish protected physical
device identity, picker/photo-format/media acceptance, durable reconciliation or
published admission. CAP-05 remains open until the remaining phase plans pass.

## Exif parser foundation

Java and Swift now have a bounded, read-only TIFF/Exif directory validator for
the remaining photo work. It reports only the primary image orientation (1–8),
validates referenced Exif/GPS/interoperability and thumbnail directories, and
rejects invalid offsets, duplicate tags, cycles, truncation and excess resources.
Limits are 256 KiB of metadata, 32 directories, 128 entries per directory and
1,024 entries overall. Independent recipes exercise both byte orders, all eight
primary orientations, a differently oriented real JPEG thumbnail, actual GPS/date
fields and exact resource boundaries. Java and Swift each pass 1,127 assertions;
the existing native upload/PNG/registry suite remains 655 passing assertions.

This helper is not connected to the preparer or picker yet. It does not rotate,
recode, remove metadata from a returned image, validate thumbnail pixels or prove
color preservation. Accepted native products still establish only the previous
selected-PNG checkpoint; no broader format admission changes here.

The directory/orientation basis is the published
[CIPA DC-008-2012 Exif specification](https://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf),
sections 4.5 and 4.6. ColorSpace and Gamma carry rendering information, so the
future photo preparer must preserve their meaning rather than discard them as
personal metadata. CIPA now lists
[Exif 3.1, DC-008-Translation-2026](https://www.cipa.jp/e/std/std-sec.html); this
checkpoint does not claim full current-standard conformance. Remaining work must
verify format-specific orientation/color behavior through both native journeys.
