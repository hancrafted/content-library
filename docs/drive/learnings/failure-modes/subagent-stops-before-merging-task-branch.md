---
title: 'A Subagent stops before committing and merging its Task branch'
enforcer: 'hook: new SubagentStop hook that blocks while the Task branch is unmerged, with an escape for a reported blocker, architectural'
status: ticket
ticket: https://github.com/hancrafted/skills/issues/65
---

# A Subagent stops before committing and merging its Task branch

## Symptom

A Subagent ends its turn before it has committed and merged its Task branch and needs a message from the Orchestrator to finish.
