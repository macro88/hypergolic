# Phase 02 context: Independent Android and iOS proof

Goal: complete the accepted native shell, publish controlled test fixtures, and prove the full journey on Android and iOS using local standalone builds. The user explicitly corrected the earlier Android-only finish line on 15 September 2026. Source status at planning is scaffold-only. Product decisions are settled; remaining implementation choices below are engineering discretion.

## Decisions

<decisions>
### D-01
Use current mobile-revamp checkout, preserve existing edits and cleaned history. The owner alone changes the source remote and pushes to the new repository; local source commits and private Notes routine sync remain separate.

### D-02
Expo/React Native shell, Kehto trusted web host, Applesauce Nostr integration; preserve Expo 57.0.20. Build standalone Android and iOS without Expo Go, Metro or Expo hosted services for final proof. Both platforms require real native runtime, gestures, identities, signing, saved state and published loading; an iOS placeholder or Simulator scaffold is insufficient.

### D-03
Minimal header: supplied 32 logical-pixel square logo with no tap action, focused napplet name, avatar + shortened selected npub opening trusted settings. Profile photo if available, deterministic local fallback; full copyable npub in settings.

### D-04
Multiple loaded napplets in opening order, append new, focus does not reorder. Inset thumb-height left/right inward handles move previous/next, follow drag, allow early cancellation, stop with resistance at ends; taps work at ends.

### D-05
Tap either handle to zoom focused view into a two-column overview; card tap zooms into focus; upward card swipe closes. Keep state during normal live switching. Validate on a phone, including scroll conflicts.

### D-06
Close destroys session/cancels approvals while preserving saved data. Clean closes directly; unsaved or unknown warns with Keep open default and Close anyway. After close remain in overview; last close gives quiet empty overview plus Open napplet/settings.

### D-07
Restore workspace order and last active after ordinary restart, verify code, lazy-load others from saved data. Explicit close-all persists empty across restarts. Unsaved process-death drafts are not guaranteed; pending approvals are cancelled after termination and must be resubmitted.

### D-08
Automatically create/persist identity on first device launch; reuse thereafter; failed reads never replace it. Post-entry nsec import validates/selects while keeping previous identities encrypted and selectable. No hex requirement or external-signer onboarding.

### D-09
One identity across all sessions. Switch/import confirms once about unsaved work, cancels old requests and restarts every loaded session with separate selected-identity data; cancel preserves all sessions. Storage namespace = user + verified publisher + stable napplet identity; same verified versions retain data.

### D-10
Optional explained manual nsec backup and separate explicit deletion require device authentication; unavailable auth blocks both. Preserve another usable saved identity before deleting the last. No automatic secret cloud backup.

### D-11
Every supported update requires individual trusted-shell approval; sheet shows action/content, napplet/publisher, selected identity, expandable exact event and Approve once/Reject. No Approve all.

### D-12
Dismissal rejects current request and returns to napplet; remaining requests stay pending with review paused until explicitly resumed. Unfocused requests wait for focus and show overview indicator. Close/identity switch/process restart cancel pending work.

### D-13
Settings Open napplet accepts supported published link; compatible publishers allowed after artifact verification and explicit first-open publisher/access confirmation. Pin selected version until verified update explicitly accepted, respecting unsaved/session safeguards.

### D-14
Use exact RocketShell network defaults relay.damus.io, nos.lol, bucket.coracle.social and lookup defaults purplepag.es, relay.damus.io, nos.lol, all wss. Lists editable and persisted; preserve user edits. Automatic NIP-65 routing deferred.

### D-15
Build UX Lab then State Lab then Approval Lab for automation. Embedded initial testing is allowed; publish the same built bytes under designated project key, test real published retrieval, supplement with compatible existing napplets. Profile screenshot is a UI example, not a required product app.

### D-16
Disposable automation identities stay separate from release publisher; same identity remains across restart tests. Resettable local relay exercises success/reject/delay/disconnect. Real release destinations are separately verified.

### D-17
No further broad interview prerequisite. Resolve engineering details by research/tests; ask only material scope/privacy tradeoffs or genuinely missing publisher/signing/device inputs, batched by exception.
### D-18
V1 must work on both Android and iOS. Native security and device behavior require independent platform evidence; shared React Native code or Android success cannot close iOS acceptance. Public app-store publication is a separate activity.

### D-19
Final React Doctor and aislop scores must both be 100/100. Fix findings instead of suppressing them, excluding task source or lowering gates. Keep the accepted Expo pin and report its separate Doctor mismatch honestly.
</decisions>

## Agent discretion

Pin reviewed compatible protocols and packages; select exact supported link formats and typed errors; native containment; secure storage/journaling/export implementation; approval queue bounds/expiry; relay fault controls; dirty-status handling from an actual owning contract; test driver; animation thresholds, Back/keyboard/accessibility/reduced motion and memory handling. Fail closed for unsupported operations. Do not manufacture a NAP field or promote library behavior to protocol authority.

## Deferred ideas

External signers, silent policy configuration, catalogue napplet, social/DM/zaps, public app-store distribution. These are not acceptance dependencies. Process-death unsaved draft recovery is not promised.

## Actual external inputs

Fixture publisher npub, authorized signing method and intended verified relay/Blossom publication destinations remain unknown. Prepare concrete unsigned release artifacts first, then collect these values without requesting the nsec in chat. Android and iPhone devices must be connected/unlocked/authorized for platform-specific validation. iOS device signing/team/provisioning must be checked when building the installable artifact; account enrollment is owner-controlled. Existing local test signing certificate supports a clearly labelled standalone test APK; production identity/certificate custody is separate. Source remotes/push are owner-only.
