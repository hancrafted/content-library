---
title: '`git branch -d` refuses to delete a Task branch after a squash merge'
enforcer: 'test-runner: test, cleanup deletes a branch with `-D` only after confirming its PR merged, quick win'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/797
fixed-by: https://github.com/hancrafted/content-library/commit/db4b92c0ff42e11c60b640f53f6ae22530a560d7
fixed-on: '2026-11-19'
---

# `git branch -d` refuses to delete a Task branch after a squash merge

## Symptom

`git branch -d` refuses to delete a Task branch after a squash merge because git sees it as unmerged.
