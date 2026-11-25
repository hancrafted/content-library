---
type: failure-mode
stale_after: 2026-12-19
title: '`drive worktree done` refuses over pids that belong to other sessions or have exited'
enforcer: 'test-runner: test, a case in `skills/drive/scripts/worktree-process.pure.test.ts` for stale and foreign pids, quick win'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/797
fixed-by: https://github.com/hancrafted/content-library/commit/db4b92c0ff42e11c60b640f53f6ae22530a560d7
fixed-on: '2026-11-19'
---

# `drive worktree done` refuses over pids that belong to other sessions or have exited

## Symptom

`worktree done` refuses to remove a worktree over pids that belong to other sessions or have already exited.
