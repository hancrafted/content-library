---
type: failure-mode
stale_after: 2026-12-19
title: "The PR watch counts the Orchestrator's own reply as a new comment"
enforcer: 'test-runner: test, `skills/drive/scripts/pr-watch.pure.test.ts`'
status: fixed
fixed-by: https://github.com/hancrafted/content-library/commit/64b272bda6228831db61aa1a6553b34c46131133
fixed-on: '2026-11-18'
---

# The PR watch counts the Orchestrator's own reply as a new comment

## Symptom

The PR watch counts the Orchestrator's own reply, posted from the Operator's account, as a new comment and wakes early.

## Fix

`drive pr watch` skips comments that start with `<!-- drive -->` (landed in 64b272bda, #741).
