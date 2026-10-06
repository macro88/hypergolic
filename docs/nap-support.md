# NAP support and tolerant admission

The owner approved launch-with-warning on 6 October 2026. A signed, hash-verified published napplet can open even if its manifest requests domains the shell does not provide. Some napplets can degrade; this does not promise that every napplet will function without a declared dependency.

Owning discovery reference: [NAP-SHELL at a040914](https://github.com/napplet/naps/blob/a040914b4bbd3a5cd8a14b0f316a723c968ebfb2/naps/NAP-SHELL.md), with [registry scope at the same revision](https://github.com/napplet/naps/blob/a040914b4bbd3a5cd8a14b0f316a723c968ebfb2/README.md). SHELL defines synchronous cached per-napplet discovery; the registry permits refusal but does not require it. The selected manifest verifier still uses its existing pinned contract; this change does not invent optional tags or reinterpret a dependency as optional.

## Authority boundary

Signature, publisher/coordinate, aggregate/HTML hashes, trusted consent, pinned version/update review, one-use native claim, identity epoch and session revocation remain mandatory. Consent shows every requested domain and explains which remain unavailable. Only the requested/supported intersection is stored as a grant and sent to native configuration. Native parsers continue to reject unsupported domains; no fs/media/Outbox service is enabled by ignoring the launch rejection. Outbox published access remains withheld pending acceptance.

SQLite schema v4 adds bounded trusted `support_review` metadata to access grants. The v3 migration preserves all owners, revisions and domain sets. Metadata stores the reviewed requested set, allowed intersection and support-profile revision in the same transaction/CAS as the grant. A legacy grant without metadata receives one fresh review. Matching requested set and profile reopen silently; a change requires review, even when its allowed intersection is unchanged. Denial retains the old grant and cannot stage the replacement session. This review is identity/publisher/app scoped and cannot be written through guest storage.

Trusted Settings shows current requested/unavailable capabilities for a loaded published session; review warnings also appear on update and restored-session admission. A capability-warning acknowledgement is not an upload, signing, link or sensitive-list approval; operation-specific controls remain in force.

## Support napplet

See [portable source and maintenance instructions](../napplets/nap-support/README.md). The compact icon list has four support states with text labels, independent proposal status, expandable limits/sources, search and filters. The public host report is advisory, separate from permission discovery and native enforcement. `Full` is reserved for complete cited-revision conformance and native evidence. Current implemented profiles are conservatively Partial; foundational current-revision SHELL and the withheld Outbox profile are Unverified. Unimplemented domains, including fs/media, are Unsupported.

The reviewed catalogue includes 35 contracts from the registry and open contract proposals as of 6 October. Catalogue status does not approve implementation of a draft, change MVP scope or assign new phases. Public publication remains a separate reviewed release.

## Verification

Verification receipts and actual device/build limits belong to the quick-task summary and shared project evidence. Browser proof alone does not establish Android/iOS execution or full MVP acceptance. Phase2.11/CAP12/CAP14 remain open.
