---
title: 'The pre-push slow lane fails under parallel pushes and the hook does not name the failing test'
enforcer: 'hook: pre-push prints the name of the failing test and serialises the slow lane behind a lock, architectural'
status: proposed
---

# The pre-push slow lane fails under parallel pushes and the hook does not name the failing test

## Symptom

The pre-push slow lane fails when many pushes run in parallel and the hook does not name the failing test.
