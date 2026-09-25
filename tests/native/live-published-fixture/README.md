# Live published napplet fixture

This isolated Android/iOS entry uses a public-only identity and the app's real
native WSS lookup, native HTTPS fetch, signed-artifact verifier, first-open review,
and one-use host handoff. Its signing and publication effects always fail. Build it
under a separate package/bundle identifier; never use it as the normal app entry.

The external test candidate is the public `file-browser` kind-35129 coordinate
shown in `index.tsx`. On 25 September 2026 its signed event
`a3c01be3f0d75cd8ff758c78f71ab9446487f01b791f53ac141fce15d1214d0d`
was retrieved from `wss://nos.lol`. The verified publisher is
`266815e0c9210dfa324c6cba3573b14bee49da4209a9456f9484e5106cd408a5`.
Its `/index.html` hash is
`191cd5d503d588ed94eec6ebda80c4054f4cc2df6074228eeb0d8eee388ce6c5`;
its signed access list contains only `theme`. A public relay/Blossom release may
change or disappear, so validate these exact values at each native checkpoint.
The read-only pinned probe receipt is in the private project checkpoint.

The **Probe native source** control retrieves and verifies the signed event,
fetches the signed Blossom URL directly through the native port, then verifies
that the shared source reads both the known-good hint and the complete signed
hint list. It does not execute the guest. The separate Settings journey pastes
the same naddr, shows publisher/event/access review, accepts first-open consent,
and observes the native hosted guest. The candidate's own file browser reports
filesystem unavailable because its manifest requests only `theme`; that is not
a proof of functional file access.

Use the isolated Release build and generated-file restoration pattern in
[the signed-update fixture guide](../published-update-fixtures/README.md),
substituting `tests/native/live-published-fixture/index.tsx` as the entry and
`org.nostrocket.hypergolic.livepublishedfixture` as the package/bundle ID.
Preserve separate APK/bundle hashes, source hashes, screenshots, and a native UI
receipt for each platform. Do not install over the normal app or use a real nsec.

On 25 September 2026, the Android API 36 emulator and iPhone 17 Pro iOS 26.5
Simulator both passed native relay/HTTPS artifact verification, exact first-open
review, consent, and visible connected guest. These public-only fixtures do not
prove protected production identity, guest signing, functional filesystem,
physical iPhone security, older Android, or a live published update.
