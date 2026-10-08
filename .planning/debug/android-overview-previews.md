---
status: resolved
trigger: physical Android workspace acceptance
created: 2026-10-08
updated: 2026-10-08
---

# Android inactive overview previews

## Current focus

Hypothesis: conflating selected media focus with WebView foreground lifecycle prevents
previously loaded offscreen renderers from drawing their live overview cards.
Test: keep loaded WebViews resumed while the activity is foreground, retaining the
existing focus-gated media prelude and native approval/picker/transport authority.
Expecting: all visible loaded previews render; unfocused media stays paused.
Next: ordinary signed in-place Android build and physical visual regression.

## Evidence

- Current ordinary Release physical Android shows blank inactive cards for three
  freshly opened UX fixtures. Settling does not restore the two inactive cards.
  The runtime-connected footer remains visible.
- Native switching retains exact counters and public drafts for every test view;
  this is a rendering fault rather than fixture reload or state loss.
- `updateMediaPlayback` previously called `onPause` whenever a view lost focus,
  including foreground navigation and overview. Activity lifecycle independently
  provides the foreground value.
- Android documents `WebView.onPause` as best-effort suspension of safe processing;
  JavaScript is not suspended. No global `pauseTimers` or unlimited preraster setting
  is introduced. Owning reference: https://developer.android.com/reference/android/webkit/WebView

## Resolution

Root cause: foreground selection incorrectly paused inactive WebViews used for live overview previews.
Fix: separate foreground renderer lifetime from selected media authority.
Verification: same-certificate ordinary in-place Android Release, matching installed bytes, all three visible previews, 16 exact state assertions and five real public-video focus/background checks pass. Native Keep open and exact disposable-target close also pass.
Full UX-05 and Phase 2 acceptance remain open.
