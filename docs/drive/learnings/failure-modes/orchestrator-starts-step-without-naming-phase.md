---
title: "The Orchestrator starts a step without naming its DRIVE phase or the Operator's decision points"
enforcer: 'test-runner: pure tests of phase derivation behind `drive status`, which names the phase and the next stop, architectural'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/796
fixed-by: https://github.com/hancrafted/content-library/commit/cd69f38585a00dae159c544b066abf143918c92c
fixed-on: '2026-11-19'
---

# The Orchestrator starts a step without naming its DRIVE phase or the Operator's decision points

## Symptom

The Orchestrator begins a step without saying which DRIVE phase it is in, what branch state follows or where the Operator must decide, so the Operator interrupts to ask or cannot tell whether the Workflow will run to the end unattended.
