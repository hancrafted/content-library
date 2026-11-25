---
type: failure-mode
stale_after: 2026-12-19
title: 'A ticket that documents code is dispatched before that code merges'
enforcer: 'check: new dispatch check that refuses a ticket declaring `Describes: <ticket>` while that ticket is unmerged, architectural; or a dispatch.md rule, quick win'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/793
fixed-by: https://github.com/hancrafted/content-library/commit/3822510c81164552328a421757060216aefacf34
fixed-on: '2026-11-19'
---

# A ticket that documents code is dispatched before that code merges

## Symptom

A ticket that documents code is dispatched before that code merges, so it documents the ticket, not the code.

## Fix

`drive dispatch check <issue…>` fails a ticket whose `Describes:` target is neither closed nor merged into the Integration branch (landed in #793).
