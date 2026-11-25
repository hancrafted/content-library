---
type: failure-mode
stale_after: 2026-12-19
title: 'A Subagent stops before committing and merging its Task branch'
enforcer: 'hook: new SubagentStop hook that blocks while the Task branch is unmerged, with an escape for a reported blocker, architectural'
status: proposed
---

# A Subagent stops before committing and merging its Task branch

## Symptom

A Subagent ends its turn before it has committed and merged its Task branch and needs a message from the Orchestrator to finish.
