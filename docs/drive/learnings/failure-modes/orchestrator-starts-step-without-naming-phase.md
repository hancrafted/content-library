---
title: "The Orchestrator starts a step without naming its DRIVE phase or the Operator's decision points"
enforcer: 'hook: new PreToolUse hook on `wt:new` that requires a fresh phase marker written by a new `drive status`, architectural'
status: ticket
ticket: https://github.com/hancrafted/content-library/issues/796
---

# The Orchestrator starts a step without naming its DRIVE phase or the Operator's decision points

## Symptom

The Orchestrator begins a step without saying which DRIVE phase it is in, what branch state follows or where the Operator must decide, so the Operator interrupts to ask or cannot tell whether the Workflow will run to the end unattended.
