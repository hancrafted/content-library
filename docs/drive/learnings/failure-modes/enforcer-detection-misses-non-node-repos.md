---
title: 'Enforcer detection misses non-Node repos (pyproject, uv, Cargo, go.mod)'
enforcer: 'test-runner: test, architectural'
status: ticket
ticket: https://github.com/hancrafted/skills/issues/55
---

# Enforcer detection misses non-Node repos (pyproject, uv, Cargo, go.mod)

## Symptom

`drive setup` detects Enforcers only from `package.json` scripts, husky and `.archgate`, so a repo using pyproject, uv, Cargo or go.mod gets an empty Enforcer list.
