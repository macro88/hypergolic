# Upload API coverage

| capability | decision | reason |
| --- | --- | --- |
| upload.info | INTEGRATE | Advisory introspection without preflight requirement. |
| upload.upload | INTEGRATE | Exact reviewed body, shell-selected Blossom server and one-shot consent. |
| upload.status | INTEGRATE | Realm-scoped status/recovery of an existing uploadId. |
| upload.status.changed | INTEGRATE | Bounded progress and terminal pushes. |
| Blossom PUT /upload | INTEGRATE | Raw unchanged approved output bytes. |
| Blossom GET hash | INTEGRATE | Bounded exact-size/hash reconciliation; complete 200/404 framing. |
| Blossom HEAD hash | OPT-OUT | Not used for recovery; HEAD alone cannot verify complete saved bytes. |
| Blossom HEAD /upload | OPT-OUT | Read-only research only; upload never requires preflight and production eligibility is advisory. |
| Blossom PUT /media | OPT-OUT | Server transformations cannot be previewed before our exact-byte approval. |
| Blossom PUT /mirror | OPT-OUT | Automatic replication is outside the selected single-destination upload profile. |
| Blossom list/delete | OPT-OUT | Remote account management is outside Phase 2.4; cancel never promises deletion. |
| NIP-96 discovery/upload | OPT-OUT | Owner selected Blossom-only initially; compatibility gap retained. |
| Broad library/camera authority | OPT-OUT | Only explicit system photo/file selection is authorized. |
