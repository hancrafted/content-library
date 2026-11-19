---
title: 'A push is not checked against the remote'
enforcer: 'test-runner: test:slow test for `drive push` that fails when the remote does not hold the pushed commit, architectural'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/792
fixed-by: https://github.com/hancrafted/content-library/commit/417962f348b8cfeb2eeea5c66dfec144c904dd91
fixed-on: '2026-11-19'
---

# A push is not checked against the remote

## Symptom

A push is not checked against the remote: the exit code is masked by a pipe or reads null, and nothing compares the remote's commit with the local one.

## Fix

`drive push` fails on a null or non-zero exit and when `git ls-remote` lacks the local commit (landed in #792; the first fix in #740 did not hold, see the regression recorded on 2026-11-19).
