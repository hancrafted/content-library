---
type: failure-mode
stale_after: 2026-12-19
title: "A learnings ticket's brief names no evidence source, so its Subagent credits every line to the current Workflow"
enforcer: 'check: `drive dispatch check` fails a ticket with no `Evidence from:` line, quick win'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/793
fixed-by: https://github.com/hancrafted/content-library/commit/3822510c81164552328a421757060216aefacf34
fixed-on: '2026-11-19'
---

# A learnings ticket's brief names no evidence source, so its Subagent credits every line to the current Workflow

## Symptom

A learnings ticket's brief names no evidence source, so its Subagent credits every line to the current Workflow.

## Fix

`drive dispatch check <issue…>` fails a ticket body with no `Evidence from:` line, so the brief always has a source to name (landed in #793).
