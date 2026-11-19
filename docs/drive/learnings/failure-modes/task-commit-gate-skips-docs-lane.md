---
title: "A Task's commit gate skips the docs lane, so the Integration branch goes red on check:docs"
enforcer: 'hook: .husky/pre-commit, run `check:docs` when a Task changes a governed doc or the learnings schema, quick win'
status: proposed
---

# A Task's commit gate skips the docs lane, so the Integration branch goes red on check:docs

## Symptom

A Task passes its commit gate (`verify:commit`) with a change that fails `check:docs`, so the docs lane is red only after the Task merges into the Integration branch.
