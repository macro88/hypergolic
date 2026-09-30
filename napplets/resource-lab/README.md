# Resource Lab

Unsigned bundled SDK 0.27.2 fixture for complete resource Blobs. Load a URL, inspect byte-derived MIME/size/SHA-256, display a decoded image, or manually Play bounded audio/video. Bulk preserves order and individual errors. Cancel uses the SDK AbortSignal; Release preview pauses media and releases Object URLs.

Build with `pnpm --dir napplets/resource-lab build` using its frozen lockfile. The bundled HTML and manifest are separately byte-pinned in the host catalog. Rebuilding the standalone fixture does not automatically change the embedded pin. No signer, upload, OS save flow or fixture publication is involved.

[The selected profile](../../docs/resource-access.md) defines schemes, bounds, download settings, lifetime and deferred gaps. [Native journeys](../../tests/native/resource/README.md) use actual input/accessibility/screenshots on selected Android/iOS targets. Browser port doubles are labelled separately.
