# Published artifact native registry contract (in progress)

The trusted JavaScript verifier establishes a signed kind-35129 manifest,
coordinate and original HTML hash. First-open consent is a separate trusted
shell flow still to be implemented. Native must independently
establish byte integrity and host ownership before those bytes can enter a
WebView. Native registry checks do not establish Nostr signature validity or
publisher trust.

The standalone Android and iOS registries now implement the following core
contract. No Expo module function or host view calls them yet.

The registry accepts an app-only staging call with original UTF-8 bytes and
bounded claims: shell session ID, publisher public key, stable napplet `d`
identifier, signed event ID, aggregate version hash and HTML SHA-256. It checks
the 2 MiB byte limit, strict UTF-8 decoding, SHA-256 and NIP-5A single-path
aggregate over `<html hash> /index.html\n`. It copies the bytes privately,
enforces a small number of pending artifacts and short staging expiry, and
returns an unpredictable opaque token. It never accepts a caller-supplied
`verified` flag as proof.

The native host claims a token once, atomically matching the exact session and
artifact claims, then binds the bytes to its newly minted view generation.
Replay, changed claims, expiry, backgrounding or session revocation fail closed.
Claiming returns a private byte copy to the host only; React props and events
carry the token and bounded claims, never HTML, a path or an arbitrary URL.
The current generated host still accepts only packaged fixtures; merely adding
the registry cannot enable published execution.

The trusted owner must explicitly register a live shell session before staging and
revoke pending bytes on closure, identity change or backgrounding. A saved
session may be registered again after revocation. Claimed bytes have moved to
the host's ownership; the host must clear its copy on view teardown. The native
cores do not currently receive lifecycle callbacks because module/host wiring
is still pending.

The module bridge and WebView byte-transfer protocol are not yet selected.
An implementation must bound transfer before allocating a 2 MiB artifact and
retain the existing main-frame/sender/generation checks, strict document and
subresource allowlists, and CSP/namespace injection after verification. Both
platforms need real native host tests in addition to the standalone core proofs.
The Android production-source JVM proof passes 70 assertions with
`javac -Xlint:all -Werror`; the Swift proof passes 36 checks with
`swiftc -warnings-as-errors`. Both cover exact-limit acceptance, over-limit
denial, bad UTF-8/hash/aggregate, cross-session claims, one-use replay, expiry
and revocation. The normal unsigned Android Release APK and iOS Simulator
Release app compile with the new sources, including a nonempty iOS JavaScript
bundle. Neither build or standalone registry test is a published-napplet journey.

```sh
source .tools/use-local-tools.sh
python3 tests/native/android-published-artifact-registry/runner.py --output /private/tmp/hypergolic-android-registry-proof
xcrun swiftc -warnings-as-errors modules/napplet-host/ios/PublishedArtifactRegistry.swift \
  tests/native/published-artifact-registry/PublishedArtifactRegistryProof.swift \
  -o /private/tmp/hypergolic-ios-registry-proof
/private/tmp/hypergolic-ios-registry-proof
```
