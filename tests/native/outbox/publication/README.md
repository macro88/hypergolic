# Native Outbox publication core proof

Run `source .tools/use-local-tools.sh`, `source .tools/use-ios-tools.sh`, then `python3 tests/native/outbox/publication/run.py --output <fresh-external-directory>`.

The runner compiles the actual Android module and exercises its immutable Kotlin plan on the host JVM. It compiles the actual Swift plan, approval registry and WSS publication owner with Swift 6 and warnings as errors. The Swift composition stub supplies only the static capability lease instance; assertions use the actual native lease and approval cores. Signed fixture inputs are public deterministic test events; no secret key is retained or event published.

Coverage includes event/identity/hash mutation, reviewed targets, one-use primary/ancillary relay pairs, signature consistency across targets, denied unprepared review, replay, and native background/revocation before frame emission. Receipts seal source and logs. This is native core and compilation evidence, not a device journey, public DNS/TLS publication or protected signing acceptance.


The companion `tls_run.py --output <fresh-external-directory>` uses disposable loopback TLS endpoints through the existing host-only policy seams. Both actual native plan/approval gates and WSS EVENT writers are exercised, with exact public signed fixture bytes independently checked by the relay. Seven cases per platform cover accepted/rejected ACKs, accepted followed by closure, no ACK, foreign ID, malformed boolean and revocation at final emission. This does not prove public DNS, guest admission, Android protected signing or physical-iPhone signing. Private TLS keys are deleted after the run.

The existing native WSS writers allow an 8192-byte text frame. Shared request capture and both native review captures enforce the complete signed EVENT size before review/signing, including signature overhead, UTF-8 and escaping. An oversized existing relay list blocks review rather than being silently omitted.

`review.tsx`, `../android-review.py` and `../ios-review.py` exercise the production approval/receipt components with native inputs and sealed products. The fixture explicitly says presentation only, owns no signer and performs no publication. Keep this evidence separate from the required original SDK/native/protected-signing journey.

`owning_tls_run.py --output <fresh-external-directory>` exercises the actual Swift
publication owner through the same approval registry, final send gate, receipt
classifier and WSS writer. Eight controlled host cases add an AUTH challenge to
the seven cases above. The independent receiver checks the exact EVENT and records
zero EVENT frames for revocation immediately before send.

The `HYPERGOLIC_NETWORK_PROOF` compilation condition enables only the test route,
public certificate anchor and pre-send revocation hook. Ordinary builds omit that
condition and retain the public relay policy. This test uses an already signed
public fixture; it does not exercise protected signing, guest admission, Expo
composition, physical devices or public DNS. Physical owner evidence is recorded
separately in the Phase 2.11 checkpoint.
