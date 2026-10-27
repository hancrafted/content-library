---
name: mutation-testing
description: Run scoped mutation testing over changed pure modules and skill scripts with `npm run test:mutation` and triage surviving mutants.
---

# Mutation Testing

Run `npm run test:mutation` after `/tdd` and `/code-review` settle to mutation-test `*.pure.ts` modules and `skills/**/scripts/**/*.ts` skill scripts changed since the merge-base with `origin/main`.
