---
title: "A ticket conflicts with a binding ADR and the conflict surfaces only in the Subagent's report"
enforcer: 'check: new `check:tickets` that fails a ticket body with no ADRs line, quick win (the content check stays review)'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/793
fixed-by: https://github.com/hancrafted/content-library/commit/3822510c81164552328a421757060216aefacf34
fixed-on: '2026-11-19'
---

# A ticket conflicts with a binding ADR and the conflict surfaces only in the Subagent's report

## Symptom

A ticket asks for something a binding ADR forbids and the conflict surfaces only in the Subagent's report.

## Fix

`drive dispatch check <issue…>` fails a ticket body with no `ADRs:` line (landed in #793); whether the named ADRs fit the ticket stays a review.
