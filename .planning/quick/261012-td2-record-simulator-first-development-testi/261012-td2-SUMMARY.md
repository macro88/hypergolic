---
status: complete
mode: inline
---

The owner explicitly selected simulator/emulator testing during development, physical checks only for components unavailable there, and full E2E at feature-complete builds. Roadmap/state/architecture/context/validation and Plan03/04 scheduling now carry this decision. Matrix policy changes while all61 rows/results remain identical;8 final physical rows complete/53 open is coverage, not feature progress. No test was converted to a pass; product/profile/admission/quality decisions remain unchanged.

Next unresolved implementation decision: clean-close. A private opt-in close-check profile is proposed, with dirty/unknown receiving the existing warning; it is not yet selected or implemented. Full E2E no longer blocks unrelated build work. Later phase order is unchanged.

Verification: JSON parses and row preservation assertion passes; diff whitespace, local Markdown links and public-artifact privacy checked. Documentation-only; no source behavior, device operation, build, numeric quality or E2E rerun claimed. GSD executed inline under the session's no-subagent restriction; no independent planner or audit. Source commit is the commit introducing this summary; no source push.
