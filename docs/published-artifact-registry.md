# Published artifact native registry contract (in progress)

The trusted JavaScript verifier establishes a signed kind-35129 manifest,
coordinate and original HTML hash. First-open consent is a separate trusted
shell flow still to be implemented. Native must independently
establish byte integrity and host ownership before those bytes can enter a
WebView. Native registry checks do not establish Nostr signature validity or
publisher trust.

The Android and iOS registries implement the following core contract. The Expo
modules now stage verified bytes through a bounded app-only transfer, but no
host view claims a staged handle yet.

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

The Expo module transfer uses `registerPublishedSession`,
`beginPublishedArtifact`, `appendPublishedArtifact`, `finishPublishedArtifact`,
`cancelPublishedArtifact`, `revokePublishedSession`, and
`revokeAllPublishedArtifacts` on both platforms. A begin call binds the exact
claims and declared length (1 through 2 MiB) to a registered session. At most
four uploads can exist, with one per session and a 60-second lifetime. Each
zero-based sequential, canonical Base64 chunk decodes to 1 through 48 KiB.
Malformed or repeated chunks consume the partial upload. Finish consumes it
and independently checks exact length, strict UTF-8, original SHA-256 and the
single-path aggregate before returning a one-use handle. Backgrounding revokes
all pending bytes and registrations; the trusted owner must register again
before a later transfer. No claim function is exposed to JavaScript. A
verifier-branded JavaScript adapter chunks a private copy and rechecks live
ownership around every native call.

The host claim and WebView byte-transfer protocol remain unimplemented. They
must retain the existing main-frame/sender/generation checks, strict document
and subresource allowlists, and CSP/namespace injection after verification.
Both platforms still need real native host tests and a consent-gated app route.
The Android production-source JVM proof passes 175 assertions with
`javac -Xlint:all -Werror`; the Swift transfer and registry proofs pass 88 and
36 checks with `swiftc -warnings-as-errors`. The Android module's Release Kotlin
and Java compilation and the unsigned iOS Simulator Release app compile with
the transfer functions. Neither build or standalone proof is a published
napplet journey.

```sh
source .tools/use-local-tools.sh
python3 tests/native/android-published-artifact-registry/runner.py --output /private/tmp/hypergolic-android-registry-proof
xcrun swiftc -warnings-as-errors modules/napplet-host/ios/PublishedArtifactRegistry.swift \
  tests/native/published-artifact-registry/PublishedArtifactRegistryProof.swift \
  -o /private/tmp/hypergolic-ios-registry-proof
/private/tmp/hypergolic-ios-registry-proof
xcrun swiftc -warnings-as-errors modules/napplet-host/ios/PublishedArtifactRegistry.swift \
  modules/napplet-host/ios/PublishedArtifactTransfer.swift \
  tests/native/published-artifact-transfer/PublishedArtifactTransferProof.swift \
  -o /private/tmp/hypergolic-ios-transfer-proof
/private/tmp/hypergolic-ios-transfer-proof
```
