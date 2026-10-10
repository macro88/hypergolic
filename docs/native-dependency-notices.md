# Native dependency metadata and notices

The 9 October 2026 inventory captures the installed Android Release dependency
graph and iOS Pods at source `8715f05a536ee9bf8cf807c29e8f61afb5eb2880`.
It supports BUILD-01 review. It does not approve license compliance or establish a
complete inventory of the components and notices shipped in final apps.

## Verified inventory

| Scope | Observed result |
| --- | --- |
| Android `releaseRuntimeClasspath` graph | 150 Maven components and 11 project components, including the application |
| Selected external Android artifacts | 144 artifact records, 140 distinct SHA-256 hashes |
| Maven license declarations | Captured for all 150 coordinates; eight inherit their declarations from captured parent POMs |
| Android archive notices | 18 named notice/license entries, including repeated selected artifacts |
| Android native binaries | 88 `.so` entry records, 80 distinct hashes, across 12 external artifact owners |
| Installed iOS root pods | 98 specifications with versions matching `Podfile.lock`; installed `Manifest.lock` is byte-identical |
| iOS pod license declarations | 94 MIT, one Unlicense (`ReactCodegen`), three first-party UNLICENSED modules |
| CocoaPods acknowledgements | Ten library entries; the originals are preserved |
| Installed iOS device framework slices | 13 binary hashes, selected by XCFramework platform metadata; `lipo` confirms ARM64 |
| Input preservation | All 1,337 sealed source/configuration/Pod inputs are unchanged through capture |

Android resolution runs offline with the existing Gradle cache and installed Expo
local Maven repositories. Nine Expo POMs come from those local repositories rather
than the Gradle cache. A cache-only preliminary observation is retained separately
and superseded by the complete selected-coordinate capture.

The dependency graph includes project components even though external artifact
capture filters to Maven components. This avoids treating Android project variant
ambiguity as missing external dependencies. The filter uses Gradle's documented
[artifact view component selection](https://docs.gradle.org/current/userguide/artifact_views.html).
It does not filter the full resolved dependency graph or silently ignore unresolved
dependencies. The two failed inventory attempts are retained.

License names and URLs remain as declared by the captured POMs and podspecs.
Parent inheritance is explicit. These declarations describe the owning package;
they do not enumerate every third-party component inside a prebuilt native binary.
The three first-party module declarations are recorded without changing application
licensing policy.

CocoaPods can share acknowledgements between related specifications. Ten entries
versus 98 specifications is therefore not evidence of 88 missing notices. The
capture also preserves nearby source license originals and their exact attribution
paths. A missing nearby file is not treated as a missing license declaration.

## Remaining distribution review

Before final BUILD-01 acceptance:

- Map the final linked/embedded Android and iOS binaries to their component
  inventories. Resolve bundled third-party components in React Native, Hermes,
  ReactNativeDependencies, image codecs, compression and SQLite separately from
  their root package declarations.
- Reconcile the captured native metadata and originals with the existing shell
  and web-runtime JavaScript inventory. Exclude build tools from the shipped
  component inventory using actual packaging evidence.
- Assemble the applicable original notices and attribution into the final
  distribution, then inspect both final app products for their presence. A named
  file search alone does not prove adequate notice coverage.
- Repeat the source/build/lock binding after final dependency or native packaging
  changes. Current metadata is a dated checkpoint, not final build sign-off.

A name-based inspection of the retained ordinary Android QA APK
`9efd2af6933a9da5ff9e399117dd8f6b8488bdebad5f14bdf795a9437ae73046` finds
`META-INF/androidx/annotation/annotation/LICENSE.txt` and
`okhttp3/internal/publicsuffix/NOTICE`. This does not establish complete notice
coverage. The installed Pod framework capture is not an inspection of the final
linked iPhone application.

No phone UI, protected key, app data, signing configuration, dependency pin or
production behavior changes during this inventory. BUILD-01 and full Phase 2
acceptance remain open; physical matrix statuses are unchanged.


## ExpoImage prebuilt dependency provenance — 9 October 2026

Installed ExpoImage57.0.4 declares five exact SPM build pins in
`node_modules/expo-image/spm.config.json`. Each corresponding installed iOS-device
framework is byte-identical to the package's Release prebuild; the Debug binary
does not match. Immutable upstream tag resolutions and original licenses/package
files are captured for these declared pins:

| Product | Declared exact version | Immutable upstream license source |
| --- | --- | --- |
| SDWebImage | 5.21.6 | [License original](https://raw.githubusercontent.com/SDWebImage/SDWebImage/449e8f8f10377f620db8ad22ea81208eecf6325f/LICENSE) |
| SDWebImageAVIFCoder | 0.12.0 | [License original](https://raw.githubusercontent.com/SDWebImage/SDWebImageAVIFCoder/b6455e16f2752d43e05d58ffbe38aac56e7c1149/LICENSE) |
| SDWebImageSVGCoder | 1.8.0 | [License original](https://raw.githubusercontent.com/SDWebImage/SDWebImageSVGCoder/85b5d58ad02c207c496fa34426dc6560d6ae32f0/LICENSE) |
| SDWebImageWebPCoder | 0.15.0 | [License original](https://raw.githubusercontent.com/SDWebImage/SDWebImageWebPCoder/12d83edbcc795fb7b5c0c3cb74d739108d3357d2/LICENSE) |
| libavif | 1.0.0 | [libavif submodule original](https://raw.githubusercontent.com/AOMediaCodec/libavif/bc41fc5b22786976ca23664905875ccd104f55c4/LICENSE) |

The libavif wrapper tag has no root LICENSE file. Its actual `avif` submodule
points to AOMediaCodec/libavif commit
`bc41fc5b22786976ca23664905875ccd104f55c4`; that source owns the captured license.
The initial root-file404 failure remains recorded. No attribution is invented.

This verifies declared build pins and identical packaged/installed Release bytes.
It does not reproduce an upstream source build or prove that every declared pin
is the actual compiler input. Package manifests also declare libwebp-Xcode from
1.1.0 and libaom-Xcode from3.0.0. These are lower bounds, not verified compiled
versions. The prebuilt build's resolved transitive versions and their notices still
need exact provenance before the complete distribution review can close.

Framework Info.plist version1.0 is packaging metadata and is not used as a
third-party library version. CocoaPods source dependency ranges are also not
substituted for the separate prebuilt SPM selections. App/native dependency pins,
production behavior, phone UI and matrix acceptance remain unchanged.


## Packaged native images and compiled version reporters — 10 October 2026

The corrected ordinary ARM64 Android Release and signed iPhoneOS Release now have
an inspection of their packaged native images, rather than only installed dependency
metadata. The Android APK is
`461eb9ebcb11a4a138696fee4cfde2339da7e5c9620a8dfd091dc9d051b7412a`.
The existing dependency lockfiles and all selected external artifact hashes still
match the earlier inventory.

| Packaged scope | Verified result |
| --- | --- |
| Android native libraries | All 21 ARM64 ELF images accounted for: 15 are byte-identical to selected external archive entries; six match all allocated file-backed sections of local native build outputs |
| iPhone embedded frameworks | All 14 match the owning installed/package binary UUID and every file-backed section byte; whole-file hashes differ after packaging/signing |
| iPhone application load commands | Every direct framework `@rpath` reference resolves to an observed embedded framework |
| Independent format check | LLVM confirms section layout and bytes for all 21 ELF images and 14 frameworks; Apple UUID inspection confirms all 14 framework UUIDs |
| Product preservation | Original signed products and all 1,247 captured source inputs remain unchanged; temporary ELF extracts are removed |

The iPhone count includes ExpoModulesJSI 57.0.8, built through its package script;
the earlier scan of only framework paths inside Pods omitted that package-owned
product. Its actual compiled sections match the embedded framework. This capture
does not infer the contents of static libraries linked into the main application.

Bounded ARM64 disassembly of the packaged WebP decoder and encoder version
functions establishes the constant return `0x010100`, meaning 1.1.0. The packaged
libaom version function returns `0x030000`, meaning 3.0.0. The decoding follows the
owning [WebP API header](https://chromium.googlesource.com/webm/libwebp/+/d7844e9762b61c9638c263657bd49e1690184832/src/webp/decode.h)
and [libaom API header](https://aomedia.googlesource.com/aom/+/d853caa2ab62d161e5edf344ffee7b597449dc0d/aom/aom_codec.h).
Original license, patent, authorship and API files from those immutable upstream
release commits are retained with hashes. These are compiled version reporters,
not an attestation of the complete source tree, patches or transitive components.
No version function was executed on a phone.

Native patch provenance remains a required follow-up. The
[upstream security announcement](https://groups.google.com/a/webmproject.org/g/webp-discuss/c/YhVFA45DVfM)
records both the 1.3.2 lossless-decoder fix and backports to the 1.1.0 branch.
The 1.1.0 version reporter therefore proves neither presence nor absence of that
fix. Source inspection shows ExpoImage defaults to Apple's WebP decoder, and the
shell does not override that setting; this is source evidence, not a traced native
decoder selection. The alternate bundled codec still needs a patch audit.
No new security exception is selected.

The APK still contains only the two named notice files reported by the prior
name-based scan. This count does not establish complete attribution coverage.
Complete native/transitive patch provenance, static-linked component inventory,
JavaScript/runtime reconciliation and original notices embedded in both final
products remain required. BUILD-01 and full Phase 2 acceptance remain open.


## Source-built iOS WebP repair — 10 October 2026

The old precompiled ARM64 decoder's Huffman wrapper does not contain the
measure-first/allocate-capacity sequence from the
[upstream security fix](https://chromium.googlesource.com/webm/libwebp/+/902bc9190331343b2017211debcec8d2ab87e17a).
That conclusion comes from bounded wrapper disassembly compared with original
and backported upstream source, rather than the 1.1.0 version reporter alone.
It does not establish a live exploit, the entire compiler source tree or actual
selection of the alternate decoder on a phone.

The permanent iOS configuration now uses Expo's supported
[per-package source build](https://docs.expo.dev/guides/prebuilt-expo-modules/)
for `expo-image`, with an explicit CocoaPods `libwebp` 1.6.0 pin. Native regeneration,
pod installation and a signed ordinary-entry ARM64 iPhoneOS Release succeed.
The retained bundle identifier, app label and signing certificate stay the same;
this product has not been installed on a phone. The earlier signed app is preserved.
The new main executable SHA-256 is
`5a95473cb09aed2a7666348ed640eb989228c9511f4f8cc737347c1f7af28dc9`.
Its packaged `_VP8LBuildHuffmanTable` first measures without an output table, checks
segment capacity and allocates before writing. The build log also records compilation
of the owning installed Huffman source.

Four installed lossless-decoder files and `COPYING` match the immutable 1.6.0
release commit `4fa21912338357f89e4fd51cf2368325b59e9bd9` byte for byte.
The captured Huffman source SHA-256 is
`15c1d89d7567c2121bae05ce8dea6deba160945dd398bc6d6b9a88b40ba523eb`.
Original `PATENTS`, `AUTHORS` and `NEWS` are retained too; CocoaPods did not install
those three files. Capturing them does not mean they are shipped in the app.

`pnpm run test:native-webp` compiles all 119 installed codec C files with host
ASan/UBSan and passes eight undersized-table growth cases, a pixel-exact lossless
RGBA round-trip and twelve truncated-header rejections. The runner hashes all 176
installed C/header files and checks that its inputs remain unchanged. Its first
repository run failed because the compiler lacked a macOS SDK path; explicitly
resolving and passing that SDK repairs the runner. The earlier standalone CMake
attempt failed because the installed Pod source omits `CMakeLists.txt`. Both
original failures remain recorded. No sanitizer finding was hidden.

The source-built image dependency selection differs from the previous precompiled
SPM chain: SDWebImage 5.21.7, AVIFCoder 0.11.1, SVGCoder 1.7.0, WebPCoder 0.14.6,
libavif 1.0.0 and libdav1d 1.2.0 are the observed Pod resolutions. Only WebP has the
new explicit version pin. Their complete patch/provenance review, static-linked
inventory and shipped original notices remain required. The host regression and
signed local build do not close physical decoder behavior, BUILD-01, final numeric
quality or any other complete cross-platform acceptance row. No new security
exception or source push is authorized by this repair.


## Source-built dav1d backport — 10 October 2026

The source-built AVIF chain resolves libavif 1.0.0 and libdav1d 1.2.0. The wrapper
is pinned to SDWebImage/libdav1d-Xcode commit
`0143c7ca8cf62ddc844031e1f3a661c99d086432`, including its dav1d submodule at
`676a864a11af2c0522e1f992e770589543894686`. Before patching, all 294 captured owning
source files match the immutable upstream Git blobs. Wrapper-generated headers
are checked separately. This establishes source provenance, not complete security.

The patch manifest backports the released upstream
[tile-offset correction](https://github.com/videolan/dav1d/commit/2b475307dc11be9a1c3cc4358102c76a7f386a51)
to the exact installed `decode.c` and `internal.h`. It changes tile-offset storage
and arithmetic to unsigned values. Both full-file before/after hashes are pinned;
unknown source changes stop installation before either file is written. Upstream
copyright and license text remain intact. The Pod version stays truthfully 1.2.0.
The captured CNA record for CVE-2024-1580 covers versions before 1.4.0 and does not
exclude ARM64; this one backport is not proof that the entire CVE or decoder is clear.

The focused host regression uses the actual owning loop and structures. Twelve
exact offsets across three tiny synthetic grids pass ASan/UBSan. Its original
pre-fix failure is retained; it is not rerun as part of ordinary builds. The Ruby
hook also passes staged validation, idempotence and file-mode checks. WebP's
existing full-source host regression still passes after direct Pod pin enforcement.
These are host tests rather than full AV1 bitstream or physical-device acceptance.

The first root-working-directory Pod install omitted `apple.extraPods`. Running
from `ios` enforced the WebP pin but the extra-Pod Git route omitted the dav1d
submodule and failed. The config plugin now emits a direct immutable libdav1d
source pin with `:submodules => true`; native-directory Pod installation succeeds
and both installed lockfiles match. Original failures remain in the evidence.

The ordinary header avatar reader currently admits bounded PNG, JPEG, WebP and
GIF bytes and rejects AVIF. That source restriction does not establish that all
native decoder entry paths are unreachable. Complete codec/transitive provenance,
final packaged attribution, native runtime and BUILD-01 acceptance remain open.
No additional dependency exception, source push or complete Phase 2 pass follows.


The finalized signed ARM64 iPhoneOS product also passes after the hook guard,
with63 sealed files, strict ready/archive signatures, the same certificate and
unchanged older signed apps. Its main executable SHA-256 is
`5427a7b79e42b7fde708bd07c50c658c33fda990e5a5edb3eb1d497f992d5f63`.
The initial build log compiles the patched owning `decode.c`; the retained owning
object and packaged decoder symbols bind that subset. The final source/native
inputs remain stable through compilation. Only completed owned intermediates are
removed after artifact preservation. This app is ready locally and remains
uninstalled on iPhone; Android's matching current-code ordinary package is updated
in place. No physical AV1 decoding or complete codec safety claim is made.


## Packaged source-built iOS image notices — 11 October 2026

The selected iOS image stack now ships ten byte-preserved original notice files
in `HypergolicNappletHostAssets.bundle`. Its provenance manifest records each
library's actual source version, immutable upstream commit, original path and
SHA-256. It includes the original patent notices for dav1d and WebP, and WebP's
original author list. Required upstream attribution is preserved verbatim.

| Source-built component | Version | Original files supplied |
| --- | --- | --- |
| SDWebImage | 5.21.7 | LICENSE |
| SDWebImageAVIFCoder | 0.11.1 | LICENSE |
| SDWebImageSVGCoder | 1.7.0 | LICENSE |
| SDWebImageWebPCoder | 0.14.6 | LICENSE |
| libavif | 1.0.0 | LICENSE, including its original embedded third-party terms |
| libwebp | 1.6.0 | COPYING, PATENTS, AUTHORS |
| dav1d | 1.2.0 with the recorded backport | COPYING, doc/PATENTS |

The owning Git trees match 689 installed files exactly. Three further files have
verified transformations: the two pinned dav1d patch files and WebP's declared
CocoaPods `<inttypes.h>` to `<stdint.h>` header preparation. The first source
comparison stopped on that header difference; its failure is retained. It passes
only after the exact preparation command and complete transformed bytes match.
A preceding restricted-network retrieval failure is also retained.

CocoaPods' generated acknowledgements include the other six image components but
omit dav1d. The previous 63-file ready app has no dedicated notice-like file paths;
all ten complete selected original texts are also absent from its files. The
corrected ordinary ARM64 iPhoneOS Release contains all ten originals with matching
hashes, plus the provenance manifest. All 74 ready-copy files match the signed
build product. Strict signature verification, the retained bundle identifier and
the existing signing certificate pass; the previous ready app remains unchanged.
No device installation or physical decoder acceptance occurred.

The host pod specification verifies the complete expected notice-file set, sizes
and hashes before pod evaluation, then includes those files in its resource bundle.
The codec check exercises unchanged originals, rejection of same-length altered
attribution and rejection of a missing patent notice. The real pod specification,
iOS prebuild, cached Pod installation, TypeScript checks and signed build pass.

This resolves the selected image-library notice packaging gap. It does not finish
app-wide attribution, native binary provenance or license/security acceptance.
React Native, Hermes, their transitive components, compression, SQLite, the shell
and web-runtime JavaScript distribution, and Android still require their separate
owning inventories and packaged notice reconciliation. Final quality and physical
acceptance remain open; no new exception or source push is implied.


## Packaged trusted web-runtime attribution — 11 October 2026

The trusted host already appends its notices to `host.js`; an additional native
notice file is unnecessary for this delivered material. An instrumented rerun of
the owning Vite build observes 47 contributing modules, including 15 package-owned
modules from nine exact package/version identities. The observer relocates imports
and records the existing module list without changing build logic. Its host,
index document, asset manifest and notice file are byte-identical before/after,
and all 1,292 captured source inputs remain unchanged.

| Contributing package | Version | Observed license material |
| --- | --- | --- |
| @kehto/acl | 0.18.0 | Declared MIT; published package has no separate license file |
| @kehto/firewall | 0.5.0 | Declared MIT; published package has no separate license file |
| @kehto/runtime | 0.22.0 | Declared MIT; published package has no separate license file |
| @kehto/services | 0.20.0 | Declared MIT; published package has no separate license file |
| @kehto/shell | 0.20.0 | Declared MIT; published package has no separate license file |
| @napplet/core | 0.31.1 | Declared MIT; published package has no separate license file |
| @noble/curves | 2.0.1 | Exact installed LICENSE, including original copyright |
| @noble/hashes | 2.0.1 | Exact installed LICENSE, including original copyright |
| nostr-tools | 2.24.0 | Exact installed Unlicense original |

Every package identity matches `runtime/assets-manifest.json`. Build tools such
as Vite, TypeScript and Playwright do not contribute a package module to this
observed host; installation alone is not treated as shipped-code evidence. The
inventory hashes each contributing package file and owning package metadata.
A package's prebundled distribution file is the observed unit; this does not
establish every component embedded upstream inside that file.

The retained ordinary signed Android APK and the 74-file ordinary iPhone ready
app contain the identical trusted host:
`2ab511794668109d110d533155aabd87c907333fbd2fd871d291f191d861a8ad`.
Both contain the complete existing notice-file bytes, all nine metadata headers
and the three byte-preserved installed license originals. Android's full APK hash
matches its retained build receipt; the iPhone's complete ready-copy seal matches.
These are local packaged-product observations, not new device installs or native
execution. No production code, notice text, dependency, product or permission changes.

The recorded Kehto source commit
`f031d5d2264d047cd40e2524bf12b7f68c74caa6` independently has the same five versions
and MIT declarations. Its complete Git tree has no dedicated license/copying/
notice filename. This does not prove absence of copyright text within every source
file or compiler input. Public reference discovery finds no matching installed
package-version tag; the recorded Napplet repository returns 404 for the queried
public tag endpoint. Those outcomes remain evidence, not substituted provenance.

Six packages therefore still have declaration-based generic MIT material rather
than a verified original copyright/license file. Do not invent an author, silently
substitute a current branch or declare full attribution acceptance from metadata.
Owning artifact/upstream attribution reconciliation stays open, alongside the main
React Native/Hermes JavaScript bundle, native libraries and complete BUILD-01.
The existing runtime notices are proven delivered; app-wide review remains open.
