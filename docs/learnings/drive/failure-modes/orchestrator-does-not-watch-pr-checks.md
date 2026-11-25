---
type: failure-mode
stale_after: 2026-12-19
title: "The Orchestrator does not watch a PR's checks and mergeability, so the Operator relays failures"
enforcer: 'test-runner: test, `drive pr watch <n> --integration` exits with distinct codes for a failing check, a conflict and a merge (pr-watch tests)'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/792
fixed-by: https://github.com/hancrafted/content-library/commit/417962f348b8cfeb2eeea5c66dfec144c904dd91
fixed-on: '2026-11-19'
---

# The Orchestrator does not watch a PR's checks and mergeability, so the Operator relays failures

## Symptom

The Orchestrator does not watch CI or mergeability after it opens a PR, so the Operator relays "ci failes" and "merge conflicts" by hand.

## Fix

`drive pr watch <n> --integration` exits with distinct codes for a failing check, a merge conflict and a merge (landed in #792).
