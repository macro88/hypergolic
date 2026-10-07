# Upload access — selected profile

Phase 2.4 selects the [NAP upload draft at a7cc174](https://github.com/napplet/naps/blob/a7cc17463cbf5d9cb87884b31071bc4fc826034c/naps/NAP-UPLOAD.md)
and [Blossom at b5bd280](https://github.com/hzrd149/blossom/tree/b5bd2801d1763aa635fc8fea7a76597e0eb18990).
The public operations are `upload.info`, `upload.upload` and `upload.status`, with
`upload.status.changed` notifications. Blossom is the selected rail; NIP-96 is
rejected. Verified-published upload admission is implemented through the normal
shell, first-open consent, persisted grant and native binding. The signed local
fixture passes both selected hosts; selected acceptance is complete under the documented dependency exception. The
unsigned bundled Upload Lab remains a separate reviewed fixture.

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
the requester, including when an upload is declined. The selected static-photo and unchanged-attachment profiles have native picker evidence on both selected hosts; see the checkpoints below.

Approved uploads continue when switching between loaded napplets while the app is
in the foreground. Trusted progress and Cancel remain available. Background,
requester close/replacement, renderer loss and identity changes revoke authority.
Cancel does not promise deletion of a server copy. An uncertain dispatched outcome
must be reconciled at the same destination/hash before a freshly approved retry;
the durable recovery/reconciliation slice passes the selected native lifetime and
fault matrix described below.

## Admission and initial tracer

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
This describes the initial tracer. The later static-photo checkpoint below adds native orientation/color-preserving PNG preparation from supported JPEG/PNG/WebP/GIF/HEIC originals. The container
basis is [PNG Third Edition, 24 June 2025](https://www.w3.org/TR/2025/REC-png-3-20250624/).

Both hosts now route a single-file input to the native system picker only for a
live, focused, upload-enabled generation. Native code copies and prepares bounded
selected bytes before returning an app-private representation to that original
input. Android keeps global file/content access disabled and exposes only an
unexported, UID-checked provider with an exact declared descriptor length. Its
opaque URI opens a seekable app-private cache file; two selections, ten-minute
expiry and 128 descriptor opens per selection bound retention and access. iOS
uses public document/photo pickers, reads an open-in-place document or selected
photo representation, and returns a copied private file. Neither returns original
provider paths or requests whole-library permission. Selected PNGs and bounded WAV/MP4/PDF/ZIP/UTF-8 text are implemented;
static JPEG/PNG/WebP/GIF/HEIC preparation is covered by the later checkpoint.
Attachments retain their original bytes. A declined upload does not revoke the selection already shared with its
requesting napplet.

Picker preparation and retained selections are bounded. Close, replacement, focus
loss and background clear staged representations; callbacks recheck the captured
generation and native registration. Android's external chooser necessarily suspends
the parent activity: its outstanding user selection may return on foreground resume
within the original deadline. Returned or processing selections are cancelled on
background. This exception creates no upload approval and revives no revoked
network grants. The selected revoked-recipient journeys pass as described below; ordinary
workspace identity changes and protected-device parity remain final MVP work.

Native owners allow one request per realm, eight pending/staging requests and
two approved transfers per process, with a 10 MiB file bound, 256 KiB carrier chunks, a ten-minute review lifetime and a sixty-second
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

The selected native tracer, photo/attachment, recipient, recovery, transfer and
normal signed-admission journeys pass. Phase 2.4 and CAP-05 are accepted for this
declared profile under the explicit dependency exception; see [the phase verification](../.planning/phases/02.4-uploads/02.4-VERIFICATION.md).
The repository requires complete React Doctor and aislop scores of 100/100 and
clean locked dependency audits. The owner approved a narrow exception for the tested patched advisory on
2 October 2026. All other quality requirements remain unchanged.

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

The later photo preparer below connects this validator before decoding JPEG,
PNG and WebP metadata. The parser itself does not rotate images, validate
thumbnail pixels or prove decoded color preservation.

The directory/orientation basis is the published
[CIPA DC-008-2012 Exif specification](https://www.cipa.jp/std/documents/e/DC-008-2012_E.pdf),
sections 4.5 and 4.6. ColorSpace and Gamma carry rendering information, so the
future photo preparer must preserve their meaning rather than discard them as
personal metadata. CIPA now lists
[Exif 3.1, DC-008-Translation-2026](https://www.cipa.jp/e/std/std-sec.html); this
checkpoint does not claim full current-standard conformance. Remaining work must
verify format-specific orientation/color behavior through both native journeys.

## Bounded attachment checkpoint

The native classifier derives MIME from bytes rather than guest declarations.
WAV uses bounded RIFF/chunk lengths; MP4 uses bounded recognized-video-brand
boxes, including small 64-bit boxes; PDF/ZIP use bounded signature recognition;
plain UTF-8 text is limited to 1 MiB. The general file limit is 10 MiB. These
checks identify supported containers, not complete document semantics, archive
safety or playback validity. Failed photo preparation never falls through to an
unchanged attachment. MP3 recognition exists but has no selected native acceptance
yet. SVG/XML and unsupported photos remain denied.

Generated real PCM WAV, H.264 MP4, a one-page PDF, ZIP and text pass actual system
file selection, exact guest reading, trusted review/rejection, continued reading
after rejection and one freshly approved exact TLS upload on both native hosts.
Each rejection produces zero new connections or requests. The independent server
checks MIME, all bytes/hash and complete Schnorr authorization. The WAV comment
and ZIP metadata remain unchanged. The controlled server proves these attachment
bytes; it does not establish public-provider acceptance or free PDF/ZIP support.

Trusted attachment inspection currently shows the first 256 bytes in hexadecimal
plus complete-file MIME, size and SHA-256, caller, publisher, identity, destination
and metadata warning. It does not render documents or play audio/video. Photo
approval still waits for an actual decoded image. The larger WAV revealed a real
Android provider bug: Chromium's metadata probes could occupy pipe writers before
guest reading. Seekable private files fix that path without returning raw paths
or enabling global WebView file/content access.

Java/Swift attachment proofs each pass 5,392 assertions, including unchanged
review/dispatch bytes, MIME spoofing, truncated WAV/MP4, photo-brand rejection and
background revocation. With the existing authority/PNG/registry and Exif proofs,
the native suite totals 13,693 assertions. Shared uploads 44, capability owners
50, raw TLS 26, security 349 plus bootstrap 13 and browser SDK runtime 154 pass.
TypeScript and both production JS exports pass. Final native products and quality
reports are retained separately from earlier diagnostic runs. Plan 02 remains
open for broader photos, orientation/color and actual picker cancellation/revoked
recipients; plans 03–04 remain open.

## Bounded unchanged attachment journeys

Generate public test data outside source with `create-attachments.py --output
FRESH_FIXTURE_DIRECTORY`. Its manifest records exact WAV, H.264 MP4, valid PDF,
ZIP and UTF-8 text bytes. MP4 encoder timestamps vary; use that retained manifest
for the run. Start the observer with `--expected-dir FRESH_FIXTURE_DIRECTORY`;
it compares whole bodies/MIME/hashes and verifies real signatures.

Run `android-attachments.py` with the Android picker arguments except replace
`--seed` with `--fixtures FRESH_FIXTURE_DIRECTORY`. Use the native DocumentsUI
List view if names fall below the grid viewport; record that observed preflight.
Run `ios-upload.py --attachments FRESH_FIXTURE_DIRECTORY` with its usual sealed
iOS arguments. The isolated build temporarily enables Files access to its public
fixture Documents directory, restoring generated Info.plist in finally. Ordinary
builds gain no library sharing. Each file must pass selected exact bytes, trusted
inspection/reject, zero new TLS, guest read after rejection and one approved exact
stored body with valid signature. Inspection is a bounded hex header plus exact
whole-file identity, not document rendering or audio/video playback.

Run selected-PNG regressions against the same fresh products. Drivers and source
must stay frozen during acceptance; a driver edit invalidates source seals and
requires fresh products. Files grid title taps may only edit names; native tests
use the observed icon area of the identified folder/container/file cell. Export
XCTest screenshots and inspect actual review/selection/receipt images. Keep
failed diagnostics separate from accepted results and omit private TLS keys.


## Static photo preparation checkpoint

Native preparation now handles bounded static JPEG, PNG, WebP, GIF and HEIC.
Supported photos become lossless PNG without resizing, retaining displayed
orientation and decoded color. Selection discloses the PNG conversion; review
shows the decoded prepared image and its output MIME, size and SHA-256. The
same native preparer owns arbitrary guest photo bytes before upload approval.
Failed preparation shares no original and never falls through to an unchanged
attachment.

The recoding profile is canonical sRGB or Display P3, dimensions at most
4,096 per side and 4,194,304 pixels total, with input/output at most 10 MiB.
Animated/partial images, HDR gain maps, unsupported color spaces and malformed
bounded containers/Exif are rejected. The ImageIO recoding path accepts 8-bit
components. Existing eligible PNGs keep their original rendering chunks/pixels
while removing nonrendering metadata. Other photos use complete native decodes
and fresh PNG output with canonical rendering profiles; original custom ICC,
Exif, text and timestamps are not carried forward.

Independent fixtures include all eight JPEG/PNG/WebP orientations, a static GIF,
sRGB/P3 HEIC, P3 PNG, a real differently oriented embedded JPEG thumbnail and
actual camera/date/GPS metadata. Both codec probes pass
72 admission/idempotence/rejection checks. Separate Pillow verification checks
all 31 prepared images for complete-image orientation, dimensions, color and
metadata removal. A second comparison against a separate complete native decode
of each original confirms maximum RGBA channel error at most one. The Android
probe uses real API 36 codecs under the shell UID; the ImageIO probe runs on
macOS. These probes complement the selected SDK/native UI journeys described below;
the macOS probe is not iOS device acceptance.

Android ImageDecoder ignores PNG eXIf orientation on the selected host. The
preparer validates and removes that Exif before decoding, then applies exact
rotation/mirroring to decoded pixels. ImageIO also uses complete image decoding
and exact pixel-group permutation rather than thumbnail transformation. This
preserves edge pixels and avoids resampling HEIC when orienting it. Tiny 64×32
maximum-quality HEIC fixture encoding fails the emulator's Goldfish HEVC decoder;
realistic 512×256 quality-0.85 fixtures pass. Unsupported decode failures remain
truthful and never send the original.

Generate and verify retained fixtures outside source with `create-photos.py`,
`create-heic.swift`, `verify-photo.py` and `verify-codec-preservation.py`. The
observer's `--photo-dir` independently verifies approved prepared PNG bodies
against those fixture recipes. Keep actual picker cancellation, revoked recipients,
protected identity and published acceptance distinct from codec proof.


The picker-lifetime review reproduced a real Android gap: an outstanding
DocumentsUI chooser could deliver a new selection after Home and return. The
native guard now watches its own task visibility on API 32+, screen interaction
and bounded system leave/lock broadcasts; all resulting callbacks are cancelled
and cannot revive upload approval. The deliberate launch into the external
system chooser uses `FLAG_ACTIVITY_NO_USER_ACTION`. Fresh sealed products pass positive selection and denial regressions on the
selected Android API 36 host. Older/OEM behavior remains unverified.

The Android API basis is the official [TaskInfo.isVisible reference](https://developer.android.com/reference/android/app/TaskInfo#isVisible),
[Intent.FLAG_ACTIVITY_NO_USER_ACTION reference](https://developer.android.com/reference/android/content/Intent#FLAG_ACTIVITY_NO_USER_ACTION)
and system broadcast definitions. `ACTION_CLOSE_SYSTEM_DIALOGS` is deprecated
for third-party sending on Android 12; this path only receives system leave events
and uses the task visibility guard on the selected API 36 host. The two compiler
deprecation warnings are disclosed; older/OEM picker acceptance remains a
separate compatibility gate.


Fresh Android and iOS Simulator Release fixtures each pass 14 real Files picker
photo journeys: eight JPEG orientations, oriented PNG/WebP, static GIF, P3 HEIC,
P3 PNG and a JPEG with a differently oriented embedded thumbnail. Each journey
shares only sanitized PNG, rejects an upload with zero additional TLS dispatch,
reads the selected bytes after rejection, then freshly approves an upload whose
exact signed body/hash/size the controlled server independently verifies. iOS
also passes the actual Photos-library picker journey for oriented P3 HEIC.

The same final products pass four actual Android picker denials (system cancel,
malformed photo, Home/late callback and fresh picker), and six iOS picker denials
(menu/photo/file cancellation, photo/file background and fresh menu). No file or
network authority is granted in those denied cases. Screenshots of both hosts'
P3 HEIC and embedded-thumbnail reviews, and the iOS library review, were visually
inspected: the full primary image is correctly oriented; the unrelated embedded
thumbnail is not used. Source, runtime, fixture and installed-product seals are
recorded by each journey. These are disposable-identity, controlled-server
fixtures, not protected-identity, public-provider or physical-device acceptance.

The picker recipient and direct-original checkpoints below extend this evidence.
Plan 03 owns durable uncertain-outcome reconciliation and Plan 04 owns
normal/published admission and final acceptance. CAP-05 remains incomplete.


## Picker recipient and guest-original checkpoint

The isolated native hosts now exercise close, configuration replacement, identity
reconfiguration and actual renderer termination while the system picker is pending.
Old recipients are removed; a fresh opening receives no late file and no upload
network authority. Android selects from the stale system chooser after revocation.
iOS dismisses its picker, then verifies the new recipient; an actual malformed
Exif file selected through Files is also denied. These are controlled native
configuration faults. Replacement and identity changes reject reuse of an immutable
host with `session-reuse-blocked`; they do not establish the ordinary workspace
identity-switch journey or protected signing. Those remain final acceptance gates.

Android terminates its actual WebView renderer through `WebViewRenderProcess`.
The iOS Simulator proof uses WebKit's private `_killWebContentProcess` test selector
to terminate the real process and observes the public termination callback. The
selector is gated by both `HYPERGOLIC_NETWORK_PROOF` and `targetEnvironment(simulator)`.
An ordinary iOS Release binary excludes that selector and proof fault strings;
Android's ordinary compiled fault methods are no-ops. This test seam is not a
production API. Its basis is the upstream
[WebKit private test header](https://github.com/WebKit/WebKit/blob/main/Source/WebKit/UIProcess/API/Cocoa/WKWebViewPrivate.h).

Upload Lab also embeds explicitly generated public JPEG and oriented Display P3
HEIC originals with fake camera/date/GPS metadata. Genuine SDK uploads bypass the
system picker. Both native hosts prove original guest input hashes, native prepared
PNG review, rejection with zero additional TLS connections, fresh approval, exact
stored output and original scoped SDK receipt. The independent observer verifies
full-image orientation/color, metadata removal, body/hash/size and Schnorr signing.
The prepared hash differs from the original; each platform's PNG encoding may
differ. Both hosts' JPEG and HEIC review screenshots were visually inspected.

The guest artifact and unsigned manifest must be explicitly rebuilt, reviewed and
repinned in `runtime/fixtures` and `src/runtime/bundled-catalog.ts` before runtime
packaging. `runtime:build` validates the staged artifact; it does not rebuild the
napplet source. Native source/installed-product seals accompany each accepted run.
These remain disposable-identity controlled-server proofs. Full ordinary workspace lifecycle, public-provider and published-napplet acceptance remain open. The recovery checkpoint below is a separate controlled-server slice.


## Recovery and transfer lifetime checkpoint

Before native networking begins, the native owner atomically saves an uncertain
record containing only the public upload ID, identity, publisher, app ID, captured
provider, prepared hash, type, size and state. It stores no file body, filename,
caption, authorization, private key or resumable approval. The checksum and exact
readback detect damaged or lost writes; storage failure disables admission. The
store retains at most 32 records and 128 KiB, evicting settled records only.

Android uses private mode-700/mode-600 files under the app's no-backup directory,
no-follow opens and file/directory sync. iOS uses an excluded Application Support
directory with complete file protection, exclusive temporary files, full file
sync, atomic rename and directory sync. Production iOS requires readback of the
protection attribute. The isolated `HYPERGOLIC_NETWORK_PROOF` Simulator fixture
permits its observed missing protection attribute; that exception is compiled
only for the Simulator proof and establishes no physical-device protection.

A dispatched interruption blocks the same identity/provider/hash before another
review. Trusted recovery reads use a fresh native context and foreground epoch,
a 60-second deadline, at most two concurrent checks and only `GET /<saved-hash>`
at the saved provider. They send no authorization, follow no redirects and accept
only completely framed bounded 200/404 responses. A 200 must match the complete
saved size and SHA-256; a 404 records current absence, not proof that an older
request can never finish. Neither result creates a retry approval. Wrong bytes,
truncation, other statuses, stale ownership and background leave uncertainty.

Active transfers are excluded from interrupted checks, preventing a premature
absence check while the same attempt is still sending. Confirmed receipts and
completely framed server rejection settle their native record. Failure before
body/header dispatch records not-sent; malformed receipts, lost replies and
revoked dispatched work remain uncertain. Approval never restores after close,
background, identity change or renderer loss.

The integrated queue separates eight pending/staging reviews from two approved
transfers, with one request per realm. Trusted progress and Cancel occupy their
own layout space outside the guest. Both actual native hosts pass 21 transfer
fault cases and five queue checks each. Android passes 12 recovery checks; iOS
passes 11 plus independently witnessed lost ACK. They cover cold restart without
networking, duplicate blocking, fixed-hash fault reads, fresh reviewed approval
and two-loaded-host navigation with the original SDK receipt. iOS hosts now start
inactive until explicit trusted focus, so a new hidden peer cannot steal review
focus. Screenshots, native input/accessibility, disk records, observer counts and
exact source/products are retained; see the [plan03 summary](../.planning/phases/02.4-uploads/02.4-03-SUMMARY.md).

Transfer matrices precede the later UI/focus refinements; each evidence set names
its exact sealed build. Refined products pass the affected queue/recovery journeys.
Failures remain failed. These are disposable-identity local-TLS fixtures, with the
Simulator protection exception described above. Normal signed admission has the separate checkpoint below. Final selected acceptance is recorded below; broader MVP gates remain open.


## Normal signed admission checkpoint — 2 October 2026

The shared producer, Android binding, iOS binding and trusted runtime now agree on
`identity`, `storage`, `theme`, `relay`, `resource` and `upload`. The old shared
producer retained four domains, and the runtime retained five; real Android
first-open testing exposed the runtime rejection. Unknown/duplicate domains and
missing grants remain denied. Domain admission does not imply every operation is
implemented. First-open and reopened access disclosures explain selected-file
reading and separate approval for each upload.

A signed local Upload Lab manifest and exact HTML pass the normal IdentityShell,
Settings address entry, manifest verification, first-open rejection/acceptance,
persisted grant, native binding and original SDK upload recipient on Android API36
and iOS26.5 Simulator. The fixture publisher differs from the disposable signing
identity. The same path verifies advisory `upload.info` without networking, PNG
rejection with zero TLS, fresh approved exact PNG bytes and Schnorr authorization,
system-selected 4MiB WAV reading after rejection, fresh approved exact WAV bytes,
and cold-restored workspace/cache/grant without automatic networking. Android
build25 passes nine checks; iOS build26 passes eleven. Patched-tooling build27
produces byte-identical products on both platforms. Its Android journey27 passes
nine checks and fresh-state iOS journey28 passes eleven, with matching current
source and installed-product seals. Original and later receipts remain separate.

The shell reserves progress/outcome space inside its SafeArea footer. Review,
first-open consent, selected-file confirmation and cold-launch accessibility
were checked on both native hosts. Full original SDK receipt fields were parsed
from native accessibility; an offscreen receipt is not claimed as visible pixels.
This is normal shell integration with controlled signed artifact retrieval, a
public disposable signing identity and compile-gated local TLS. It does not
establish public relay/provider retrieval, protected-identity signing, physical
iOS file protection or the complete ordinary identity-switch journey. Those
remain distinct Phase2.11 gates.

Final shared uploads51, published adapters96 and genuine Chromium/WebKit runtime158
regressions pass. Both ordinary JS exports and normal Android arm64/iPhoneOS
Release compilation pass; iOS compilation is unsigned. Earlier prebuilds pass on
both platforms after restoring the CocoaPods workspace. The final audit newly
reports [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv)
in Expo's tooling dependency. React Doctor is100/100, aislop98/100, and eight of
nine lockfile audits pass. The owner-approved tested local dependency patch is locked; its
registry advisory stays visible. See [dependency remediation](dependency-patches.md).


The later ordinary patched-tooling exports and both normal Release compilations
also pass. The ordinary iPhoneOS executable excludes the actual private QA
renderer selector. A repeat iOS first-open run27 reused an existing persisted
grant and therefore correctly showed no new consent; it remains a failed test
setup. Fresh isolated-fixture installation passes28. The initial cold-launch
screenshot captures an intermediate layout; a later settled Simulator screenshot
shows the trusted header/identity and guest, with independently unchanged server
counts. See the phase verification for all evidence limits.


## Physical iPhone upload subset — 8 October 2026

Settings now exposes the existing bundled Upload Lab through its ordinary launcher.
A signed Release update preserves the Hypergolic bundle identity, team, entitlements
and application data. The same retained development identity is verified before
and after cold launch. The publisher used for public fixture releases stays separate.

Two independent complete ordinary SDK suites pass: thirteen review/lifecycle checks
and seven approved-upload checks. Upload info reports Blossom enabled, NIP-96
disabled and a 10 MiB limit. The generated PNG review captures the selected identity,
`https://blossom.nostr.build`, MIME, 71-byte size and independently calculated hash.
Approval is enabled after the native preview decodes. Reject and subsequent status
return the same upload ID and canonical cancellation. A second request needs a
fresh ID and review. Actual OS background state 3 cancels a pending review, with no
review replay on return. JPEG and HEIC originals reach decoded prepared PNG reviews
with hashes different from their independently checked source files; both are
rejected. Cold launch retains identity and view with no pending review. These
physical checks do not retrieve the prepared JPEG/HEIC bytes or independently prove
all metadata removal, dimensions or color fidelity.

Under the standing approval for non-sensitive development-key data, the generated
PNG is approved through the exact native review. The original SDK returns complete,
matching hash/size/MIME and a public download URL. Fresh status returns the same
receipt; the next request still needs review and is rejected. Cold identity
continuity and cleanup restore the previous view. Independent retrieval observes a
307 from the returned Blossom Band URL, checks the public HTTPS hash path, then
retrieves 200 image/png from image.nostr.build. Its exact 71 bytes match the reviewed
SHA-256 `5a852fbaaaecaf4cd14c01e150c7f881c5c5894b0a1e3c53be7e007c58374ee6`.
No before-upload absence check was made; this proves provider confirmation and
exact retrieval, not creation of a previously absent blob or exclusive ownership.

Private `iphone-uploads01` preserves original SDK/AX receipts, inspected screenshots,
source/product seals, external observers, provider reference bytes and pinned
NAP-UPLOAD revision `a7cc17463cbf5d9cb87884b31071bc4fc826034c`. Earlier attempts remain
separate: the missing launcher required the one-line app change; XCTest's long-label
selector and an incorrect upload/download-host assumption required observer fixes.
The first positive attempt already received complete from the provider before its
host assertion failed. It was not an uncertain transfer retried silently. A failed
pre-install entitlement parser performed no install; the corrected XML comparison
passed before the in-place update. The first retrieval observed 307, not file bytes.

TypeScript, shell 28, capability 57, uploads 51 and quality 74 checks pass. Both
production JavaScript exports and the ordinary signed iPhoneOS Release build pass.
Full local React Doctor scans 425 files with zero findings and numeric scoring
disabled; aislop is 98 across 417 files with the same two approved dependency
findings. Expo Doctor remains 20/21 with the six existing patch mismatches. No new
Android native build, iOS prebuild or full native upload/fault suite is claimed.

CAP-05 is partial on iOS. Physical system selection and unchanged attachments,
approved transfer navigation/interruption, uncertainty recovery, queue/fault/stale
native effects, identity/replacement, verified published parity and Android remain
open. All final matrix rows and Phase 2 stay open. Weekly usage is 44%, below the
approximately 98% ceiling. Source push remains owner-only.


## Physical WAV navigation and unresolved recovery — 8 October 2026

The ordinary iPhone app approves an unchanged, generated 4 MiB WAV under the
standing development-key test authorization. Four checks pass before the suite
fails: retained identity, exact native attachment review, original SDK progress
and continued native progress with another loaded napplet focused. The native HUD
shows over 1 MiB sent while that peer is focused. This is a sampled foreground
navigation result; the suite does not complete or confirm the provider receipt.
The app then reports outcome unknown. The uncertain record is preserved and this
attempt is not approved again.

An independent public HEAD reports the reviewed 4,194,304-byte size and hash, with
Content-Type audio/x-wav. GET at the saved provider/hash returns 307 to a public
HTTPS audio host. A separate direct GET of that observed target returns 200 and
the exact independently generated WAV bytes and SHA-256. The initial GET's empty
redirect body is retained separately from the successful retrieval. No pre-upload
absence or exclusive ownership is established. An unauthenticated public list
request returns 401; it supplies no stored descriptor. The original PUT response
is not captured, so MIME alias rejection is a hypothesis rather than a confirmed
cause of the unknown outcome.

The current native receipt contract requires the provider's type to equal the
reviewed MIME string. The current recovery profile starts at the saved provider
and hash and deliberately follows no redirects. Its successful 200 settlement
checks full size and SHA-256, not MIME. Therefore the observed GET redirect cannot
settle through the selected recovery transport; the served WAV MIME alias does
not itself explain a failed recovery read. No protocol policy has changed.

Two recovery observers and one picker-cancellation observer fail to initialize
XCTest automation before any test case or setup runs. The final attempt uses the
explicit Xcode developer directory and executable path and encounters the same
timeout. This supplies no physical proof of cold recovery persistence, duplicate
blocking, recovery settlement, document/photo selection or cancellation. The
controllers cold-launch the main app, so the earlier ephemeral guest receipt
cannot be assumed to survive. No file is selected, app data cleared or duplicate
upload approved. A final process check finds no owned UI runner left alive.

Private iphone-upload-interruption01 preserves original receipts, selected public
app screenshots/accessibility, observers, response headers, exact public bodies
and post-attempt seals. All 410 executable inputs match the previous committed
capture and all attempts. The local signed main product is unchanged; installed
executable bytes are not retrieved. Automatic opaque system captures and the full
device process inventory are excluded. NAP-UPLOAD a7cc174 and Blossom b5bd280 remain
selected. This checkpoint changes documentation only; no fresh build, dependency
scan or source push is claimed.

CAP-05 remains partial. The next decisions are whether to recognize the observed
WAV MIME alias in an otherwise exact receipt and whether to permit guarded,
read-only public HTTPS recovery redirects. Both remain proposals. Recovery/picker,
approved interruption, native fault/queue/identity, published and Android parity
remain open. All 61 final rows and Phase 2 remain open. Weekly usage is 44%, below
the approximately 98% ceiling.


## Accepted WAV interoperability profile — 8 October 2026

The owner selected narrow WAV alias equivalence and guarded recovery redirects.
Native reviews validate the full bounded RIFF/WAVE container before accepting
`audio/x-wav` for canonical `audio/wav`; shared receipt handling independently
checks the reviewed bytes. The provider descriptor retains its reported type;
the SDK completion keeps the canonical reviewed MIME. Exact hash, size, public
hash URL, bounded metadata and current native authority checks still apply.
Other MIME mismatches remain uncertain after dispatch.

App-only recovery starts at the captured provider/hash and follows at most two
read-only HTTPS redirects. Every hop retains the same hash path, with an optional
1–16 character alphanumeric extension, no credentials/query/fragment, fresh
public DNS pinning and exact hostname TLS verification. One overall deadline,
body bound and native foreground/identity/generation lease span all hops. No
signature, credential or upload body is forwarded. Only complete exact size/hash
bytes settle presence. A 404 from another origin cannot settle absence at the
saved provider. PUT redirects and automatic retries remain denied.

These are selected shell refinements to the existing pinned drafts, not a new
upstream status. Owning local proofs do not close physical or published CAP-05.
The original physical unknown record must be reconciled through ordinary UI
before any replacement upload of the same file is approved.


The accepted implementation passes 52 shared upload tests, both native authority
suites, 62 actual recovery TLS cases and 26 PUT TLS cases. Test TLS endpoints and
recovery metadata stores are injected; this is transport/core evidence, not a
physical app journey. Ordinary Android/iOS exports and prebuilds, Android Release,
and a signed iPhone Release build pass. The iPhone product retains Hypergolic,
the existing bundle identity and identical entitlements; it is not installed.

A fresh complete 425-file React Doctor scan now reports an actual 100/100 after
the owner-approved numeric request. Aislop remains 98/100 with only the existing
Forge/braces findings. All ten audits retain only those exact existing exceptions;
the unmodified normal verifier remains red. The installed patch/verifier suite
passes 74 tests. Subsequent checkpoint documentation does not alter scanned code.
Expo Doctor remains 20/21 because the six selected updates are not installed:
`expo-sqlite@57.0.4` triggers pnpm's existing publisher-trust downgrade guard.
Neither dependency pins nor the trust policy are changed. Resolving this new
provenance issue requires a separate concrete choice.

The current physical identity observer again times out enabling XCTest automation
before setup. No current retained-identity/recovery/picker result is claimed and
no app data is changed. Private upload-interop01 retains the exact local proof,
quality, build and initialization-failure evidence. CAP-05 and every final physical
acceptance row remain open; the original unknown WAV is not silently reuploaded.


## Physical published Android WAV — 8 October 2026

Current source 848b98d passes an ordinary physical Android subset after an in-place
Hypergolic update with the existing package/certificate and matching installed APK
bytes. The protected development identity survives update and cold launch. Native
review releases the exact Upload Lab HTML/manifest; independent retrieval verifies
HTML and signed manifest on both selected relays. Ordinary signed admission grants
upload access. The generated 4 MiB WAV passes native exact identity/server/hash/size
review, complete original SDK receipt and separate status read. Independent GET
follows 307/200 to all 4,194,304 exact bytes served as audio/x-wav; the SDK retains
reviewed audio/wav. A fresh request is rejected through native review and returns
cancelled; cold launch restores the published runtime and identity.

Eleven checked observations pass in private android-published-upload01. Provider
bytes pre-existed; retrieval does not attribute storage to this attempt. Raw PUT
descriptor type is unobserved. A stale transfer XML is excluded; fresh trees prove
completion/status/cold results. No active navigation, native zero effects, picker,
fault, isolation or full CAP-05 claim follows. iPhone recovery remains untested:
XCTest fails before setup, macOS Automation Mode is disabled/authentication required,
and no new main install occurs. Its original unknown record remains preserved.

A1 holds all six SDK 57 upgrades with the publisher-trust guard and pins intact.
Earlier Doctor 100/aislop 98 exact approved exceptions remains the last full quality
result; executable inputs were unchanged before this documentation checkpoint.
CAP-05 Android is partial; all 61 final rows and Phase 2 remain open. Weekly 47%,
ceiling about 98%; no source push.
