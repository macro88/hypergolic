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
