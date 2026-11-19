---
title: 'A Markdown-only commit or push runs the whole fast suite and the code gates'
enforcer: 'test-runner: test over the `docs/features/*.md` rerun trigger in `vitest.config.mts`, quick win; or hook: `verify:commit` and `verify:push` taking the docs lane, architectural'
status: proposed
---

# A Markdown-only commit or push runs the whole fast suite and the code gates

## Symptom

A one-file Markdown change runs the full fast suite and the code gates at commit and at push, taking minutes.
