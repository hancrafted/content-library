---
type: failure-mode
stale_after: 2026-12-19
title: 'The Subagent hook and event log record nothing when drive runs from the main checkout'
enforcer: 'test-runner: test:slow, slow tests that start the hook and a command from a checkout on main'
status: fixed
fixed-by: https://github.com/hancrafted/content-library/commit/7f06410c62a30dd4b964cbc2c482c9841da28a6b
fixed-on: '2026-11-19'
---

# The Subagent hook and event log record nothing when drive runs from the main checkout

## Symptom

The SubagentStart hook and the drive command log take their topic from the current branch, so a run from the main checkout writes no entry and `drive transcript --topic` finds no Subagent.

## Fix

The topic is taken from the branch argument, then the Subagent's brief, then the single Integration worktree (landed in 7f06410c6).
