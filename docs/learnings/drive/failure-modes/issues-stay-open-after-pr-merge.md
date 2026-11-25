---
type: failure-mode
stale_after: 2026-12-19
title: 'Issues stay open after the PR that closes them has merged'
enforcer: "hook: `drive worktree done` closes or lists the issues its Integration branch's PR references, quick win"
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/792
fixed-by: https://github.com/hancrafted/content-library/commit/417962f348b8cfeb2eeea5c66dfec144c904dd91
fixed-on: '2026-11-19'
---

# Issues stay open after the PR that closes them has merged

## Symptom

Issues that the Integration PR was meant to close stay open after it merges, and the Orchestrator asks the Operator whether to close them.

## Fix

`drive push` writes `Closes #n` for every ticket and `drive pr watch <n> --integration` lists the tickets still open on merge (landed in #792).
