---
title: 'Workflow progress lives only in the session, so a quota reset ends it'
enforcer: "test-runner: new test for a resume command that rebuilds the Workflow's state from `decisions.md` and the branches, architectural"
status: ticket
ticket: https://github.com/hancrafted/content-library/issues/796
---

# Workflow progress lives only in the session, so a quota reset ends it

## Symptom

A Workflow's progress lives only in the Orchestrator's session, so a quota reset or a closed session ends it and nothing resumes it.
