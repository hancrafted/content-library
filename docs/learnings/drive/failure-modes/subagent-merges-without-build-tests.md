---
type: failure-mode
stale_after: 2026-12-19
title: 'A Subagent merges a render-changing task without running the build and its tests'
enforcer: 'test-runner: test:build, quick win (Implementer profile line) or architectural (`drive worktree done` runs the build lane)'
status: fixed
fixed-by: https://github.com/hancrafted/content-library/pull/768
fixed-on: '2026-11-19'
---

# A Subagent merges a render-changing task without running the build and its tests

## Symptom

A Subagent merges a task that changes rendered output after running only the fast suite, so the Integration push fails on build tests and costs a fix task.
