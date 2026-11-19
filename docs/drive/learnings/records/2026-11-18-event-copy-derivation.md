---
workflow: event-copy-derivation
date: '2026-11-18'
fortify: skipped
skip-reason: 'not recorded when the learnings file was migrated; no Fortify answer was logged for this Workflow'
---

# event-copy-derivation

Deriving Event copy from the Episode.

## grill-questions-pointed-to-not-stated

- **Evidence:** the Orchestrator's setup message sent the Operator to "round 1, Q1 to Q4 from my last message" and offered a `/drive resume` line; the Operator had to ask "list round 1 questions"
- **Correction:** list round 1 questions

## issues-stay-open-after-pr-merge

- **Evidence:** the Orchestrator found #710, #728 and #735 still open after #714, #733 and #737 had merged, and asked the Operator whether to close them
