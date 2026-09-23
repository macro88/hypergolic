# iOS approval transport unit tests

This disposable Swift package compiles the exact production approval authority,
shared capability sequence registry, configuration wrapper and approval transport.
It does not copy their policy into the harness and does not expose a signer, key,
relay client, Expo runtime or WebView.

The owning tests cover the shared sequence boundary, independent 25/600-second
lifetimes, focus and foreground revocation, explicit resume, dismissal pause,
one claim, replay and stale-owner rejection, exact terminal reply correlation,
malformed response denial, configuration domain admission and cleanup.

```sh
source .tools/use-ios-tools.sh
python3 tests/native/approval-transport-unit/runner.py \
  --build-root /private/tmp/hypergolic-approval-transport-unit
```
