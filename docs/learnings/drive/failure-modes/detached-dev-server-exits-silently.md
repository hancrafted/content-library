---
type: failure-mode
stale_after: 2026-12-19
title: 'A detached dev server start exits without a message'
enforcer: 'test-runner: test:slow for a `dev:bg` launcher that waits for Ready or prints its log, quick win'
status: proposed
---

# A detached dev server start exits without a message

## Symptom

A dev server started detached exits with an error count and no reason, while a foreground start works.
