---
type: failure-mode
stale_after: 2026-12-19
title: 'A commit hook times out two unrelated tests while a Subagent runs in parallel'
enforcer: 'test-runner: test, the load-scaled timeout in `vitest.config.mts`, quick win'
status: proposed
---

# A commit hook times out two unrelated tests while a Subagent runs in parallel

## Symptom

A commit or push hook fails on unrelated test timeouts while Subagents run in parallel, and the retry passes.
