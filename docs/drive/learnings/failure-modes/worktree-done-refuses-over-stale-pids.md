---
title: '`drive worktree done` refuses over pids that belong to other sessions or have exited'
enforcer: 'test-runner: test, a case in `skills/drive/scripts/worktree-process.pure.test.ts` for stale and foreign pids, quick win'
status: ticket
ticket: https://github.com/hancrafted/content-library/issues/797
---

# `drive worktree done` refuses over pids that belong to other sessions or have exited

## Symptom

`worktree done` refuses to remove a worktree over pids that belong to other sessions or have already exited.
