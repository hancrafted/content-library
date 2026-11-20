---
title: 'A slow test hangs past its timeout and blocks `wt:done` until the process tree is killed by hand'
enforcer: 'test-runner: test:slow test that starts a background process in a temp worktree and asserts `wt:done` names and ends it, quick win'
status: ticket
ticket: https://github.com/hancrafted/skills/issues/64
---

# A slow test hangs past its timeout and blocks `wt:done` until the process tree is killed by hand

## Symptom

A slow test that hangs past its timeout in a Subagent worktree blocks `worktree done` until someone kills the process tree by hand.
