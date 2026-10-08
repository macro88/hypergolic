# Approval Lab design

Approval Lab follows State Lab's compact system-font layout and host-theme support.
The selected public key stays visible above the event type and content controls. Native buttons
remain reachable at narrow phone widths and use their real disabled state when the
four-request fixture limit is full.

Visible native radio inputs select note or profile metadata; the note remains
the default. A profile warning explains replacement before any submission. The
same editor supplies the note literally or the profile JSON `about` value.

Every result retains the local test sequence, event kind, captured wire content, state and
returned event ID or error. The local sequence is also written to a deterministic
`test-sequence` event tag for automation; it is diagnostic correlation, not protocol
authority or a caller-chosen wire request ID.
