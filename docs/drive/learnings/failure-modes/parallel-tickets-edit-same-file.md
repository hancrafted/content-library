---
title: 'Parallel tickets edit the same file and the rules are relayed by hand'
enforcer: 'check: new dispatch check that fails when two parallel tickets declare the same file, architectural'
status: ticket
ticket: https://github.com/hancrafted/content-library/issues/793
---

# Parallel tickets edit the same file and the rules are relayed by hand

## Symptom

Two tickets queued in parallel declare or edit the same file, so the Orchestrator relays rules by message and a sync conflicts.
