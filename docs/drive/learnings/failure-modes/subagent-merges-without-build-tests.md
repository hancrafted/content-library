---
title: 'A Subagent merges a render-changing task without running the build and its tests'
enforcer: 'test-runner: test:build, quick win (Implementer profile line) or architectural (`drive worktree done` runs the build lane)'
status: proposed
---

# A Subagent merges a render-changing task without running the build and its tests

## Symptom

A Subagent merges a task that changes rendered output after running only the fast suite, so the Integration push fails on build tests and costs a fix task.
