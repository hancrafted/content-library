---
type: failure-mode
stale_after: 2026-12-19
title: 'A push after the Integration PR merged leaves its commit off the base branch'
enforcer: 'test-runner: `drive push` refuses a branch whose PR is merged and tells the agent to branch anew (pr-ready and push tests in `skills/drive/scripts`)'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/792
fixed-by: https://github.com/hancrafted/content-library/commit/417962f348b8cfeb2eeea5c66dfec144c904dd91
fixed-on: '2026-11-19'
---

# A push after the Integration PR merged leaves its commit off the base branch

## Symptom

A push made after the Integration PR auto-merged leaves its commit on a dead branch, off the base branch, until someone cherry-picks it.

## Fix

`drive push` refuses a branch whose PR is merged and tells the agent to branch anew (landed in #792).
