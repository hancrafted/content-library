---
title: 'The Orchestrator runs a check itself instead of delegating it'
enforcer: 'review: the Architect profile''s "Lean context" line already says what lands in the repo is delegated; a check run only reads, so no hook can tell it from a Subagent''s'
status: proposed
---

# The Orchestrator runs a check itself instead of delegating it

## Symptom

The Orchestrator runs a check inline to settle a Subagent's flagged risk instead of delegating it.
