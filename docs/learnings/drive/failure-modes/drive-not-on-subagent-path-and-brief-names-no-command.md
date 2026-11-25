---
type: failure-mode
stale_after: 2026-12-19
title: "`drive` is not on a Subagent's PATH and its brief names no command that works"
enforcer: 'test-runner: test that the task brief template in `dispatch.md` carries the command line `npm run -s drive -- worktree ...`, quick win'
status: proposed
---

# `drive` is not on a Subagent's PATH and its brief names no command that works

## Symptom

A Subagent's shell has no `drive` on PATH and the brief points at the drive skill's references, not at a command that runs.
