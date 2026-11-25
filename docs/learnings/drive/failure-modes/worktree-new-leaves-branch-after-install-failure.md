---
type: failure-mode
stale_after: 2026-12-19
title: '`wt:new` leaves its branch and folder behind when `npm ci` fails'
enforcer: 'test-runner: test:slow test that injects an install failure and asserts no branch or folder remains, quick win'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/797
fixed-by: https://github.com/hancrafted/content-library/commit/db4b92c0ff42e11c60b640f53f6ae22530a560d7
fixed-on: '2026-11-19'
---

# `wt:new` leaves its branch and folder behind when `npm ci` fails

## Symptom

`worktree new` leaves its branch and folder behind when the install step fails, so the rerun says the branch already exists.
