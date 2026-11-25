---
type: failure-mode
stale_after: 2026-12-19
title: 'Guard wiring covers husky only'
enforcer: 'hook: new hook-manager wiring for `.githooks` and lefthook, architectural'
status: proposed
---

# Guard wiring covers husky only

## Symptom

`drive setup` wires the commit guard only into `.husky/pre-commit`; a repo on `.githooks` or lefthook gets a printed line to add by hand and no guard.
