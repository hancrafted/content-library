---
title: '`git branch -d` refuses to delete a Task branch after a squash merge'
enforcer: 'test-runner: test, cleanup deletes a branch with `-D` only after confirming its PR merged, quick win'
status: ticket
ticket: https://github.com/hancrafted/content-library/issues/797
---

# `git branch -d` refuses to delete a Task branch after a squash merge

## Symptom

`git branch -d` refuses to delete a Task branch after a squash merge because git sees it as unmerged.
