---
type: failure-mode
stale_after: 2026-12-19
title: 'The Integration PR can be merged before `/code-review` has run on it'
enforcer: 'check: new required GitHub status `drive/review`, architectural; or draft PR until the review report exists, quick win'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/792
fixed-by: https://github.com/hancrafted/content-library/commit/417962f348b8cfeb2eeea5c66dfec144c904dd91
fixed-on: '2026-11-19'
---

# The Integration PR can be merged before `/code-review` has run on it

## Symptom

The Integration PR can be merged, or is opened ready, before `/code-review` has run on it.

## Fix

`drive push --spec <n>` opens the Integration PR as a draft and `drive pr ready <n>` refuses without `.scratch/<topic>/review.md` (landed in #792).
