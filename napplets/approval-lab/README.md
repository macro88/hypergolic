# Approval Lab

Approval Lab is an unsigned, standalone test napplet for Hypergolic's explicit
approval flow. It reads the selected public identity through `@napplet/sdk` and
submits unsigned kind-1 `EventTemplate` objects through `relay.publish`.

The fixture deliberately has no signing key, signer protocol, network client,
persistent storage, outbox or retry queue. Each button press captures an immutable
request payload. A selected shell must review, sign and publish it.

```sh
pnpm verify
```

The browser tests use an explicitly labelled SDK mock. They prove fixture behavior
and artifact metadata, not native approval, signing, relay delivery or security.
