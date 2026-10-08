# Approval Lab

Approval Lab is an unsigned, standalone test napplet for Hypergolic's explicit
approval flow. It reads the selected public identity through `@napplet/sdk` and
submits unsigned kind-1 notes or kind-0 profile metadata through `relay.publish`.
The default is a note. Selecting profile metadata captures the bio as a JSON
`about` field and warns that acceptance replaces the selected identity’s profile;
use a development identity and the controlled QA relay for that test.

The fixture deliberately has no signing key, signer protocol, network client,
persistent storage, outbox or retry queue. Each button press captures an immutable
request payload, including its event kind and serialized content. A selected shell must review, sign and publish it.

```sh
pnpm verify
```

The browser tests use an explicitly labelled SDK mock. They prove fixture behavior
and artifact metadata, not native approval, signing, relay delivery or security.

Profile metadata follows [NIP-01 at the selected revision](https://github.com/nostr-protocol/nips/blob/01e707bacdc87cf262db80545aecaa8f17ac2a4f/01.md).
Changing the editor or event type after submission cannot change an existing
request. Each result shows its captured kind and actual content. Physical kind-0
review/signature/receipt acceptance remains a separate Phase 2.11 test.


Hypergolic retains the previous exact packaged artifact for saved Approval Lab
views. Open a new Approval Lab view for these event-type controls; existing views
keep their original version. The retained copy is excluded from fixture releases.
