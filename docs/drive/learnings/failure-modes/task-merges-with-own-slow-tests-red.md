---
title: 'A Task merges into the Integration branch with its own slow tests red'
enforcer: 'hook: new `beforeMerge` hook in `docs/drive/binding.yml` that runs the slow tests the Task branch changed, quick win'
status: ticket
ticket: https://github.com/hancrafted/skills/issues/66
---

# A Task merges into the Integration branch with its own slow tests red

## Symptom

A Task merges into the Integration branch with its own slow tests red, because the brief forbids the pre-push run and the afterMerge slow-test hook only reports.
