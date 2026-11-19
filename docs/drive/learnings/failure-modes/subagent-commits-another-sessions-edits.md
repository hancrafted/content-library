---
title: "A Subagent commits another session's uncommitted edits"
enforcer: 'review: prose in skills/drive/references/dispatch.md brief rule 5, run `git status` before staging and report any change the Subagent did not make'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/798
fixed-by: https://github.com/hancrafted/content-library/commit/cc58d41b0
fixed-on: '2026-11-19'
---

# A Subagent commits another session's uncommitted edits

## Symptom

A Subagent stages and commits uncommitted edits that belong to another session in the same checkout.
