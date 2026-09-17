---
quick_id: 260917-dg2
status: complete
mode: quick
execution: inline
---

# Signed tester APK command

1. Add a local macOS/Linux ARM64 release pipeline using an existing external keystore and interactive signing. Verify artifact identity, signature and alignment; emit isolated versioned output, checksum and a nonsecret receipt.
2. Document prerequisites, version/key continuity, the command and tester limitations in README and development guidance.
3. Exercise success and failure contracts, run applicable checks and attempt the native pipeline with a disposable validation key. Keep validation artifacts private; update task state and commit only task changes locally.
