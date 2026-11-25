---
type: failure-mode
stale_after: 2026-12-19
title: 'Workflow progress lives only in the session, so a quota reset ends it'
enforcer: "test-runner: new test for a resume command that rebuilds the Workflow's state from `decisions.md` and the branches, architectural"
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/796
fixed-by: https://github.com/hancrafted/content-library/commit/cd69f38585a00dae159c544b066abf143918c92c
fixed-on: '2026-11-19'
---

# Workflow progress lives only in the session, so a quota reset ends it

## Symptom

A Workflow's progress lives only in the Orchestrator's session, so a quota reset or a closed session ends it and nothing resumes it.
