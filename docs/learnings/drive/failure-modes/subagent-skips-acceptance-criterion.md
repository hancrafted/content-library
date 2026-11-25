---
type: failure-mode
stale_after: 2026-12-19
title: 'A Subagent skips an acceptance criterion and the report passes the shape check'
enforcer: 'review: Implementer profile line, quick win; new test for a report parser called by `worktree done`, architectural'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/791
fixed-by: https://github.com/hancrafted/content-library/commit/b916b0f5c880d95451cb1185a439a40d014c4bc0
fixed-on: '2026-11-19'
---

# A Subagent skips an acceptance criterion and the report passes the shape check

## Symptom

A Subagent leaves an acceptance criterion undone and the report passes its shape check; the Orchestrator accepts it as a Trade-off and someone else finds the gap later.

## Fix

`drive worktree done` refuses to merge while the report has an unchecked acceptance criterion without `deferred: <ticket url>` (landed in #791).
