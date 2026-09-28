# Android published transport runtime proof

Run the actual Java HTTPS and WSS transport owners inside a disposable Android
emulator process, against TLS servers bound to that emulator's loopback. The
runner compiles the repository sources to Java 8 bytecode and DEX, generates
short-lived test certificates, runs 25 HTTPS and 37 WSS checks, and removes
its temporary emulator files. API 26 and API 29 both pass. It writes a
source- and DEX-bound JSON receipt.

```sh
source .tools/use-local-tools.sh
python3 tests/native/android-published-transport-device/runner.py \
  --serial emulator-5554 --output /private/tmp/hypergolic-transport-proof
```

The output directory must be new. The target must be an explicitly named
emulator. The proof runs under Android's shell UID through `app_process`; it
does not install or modify Hypergolic, exercise its Expo bridge or lifecycle,
or use the app's system trust store. Its test-only resolver, trust factory and
hostname verifier permit disposable loopback TLS. Public production entry
points remain unchanged. Physical-device and app-level negative-path
acceptance remain separate.
