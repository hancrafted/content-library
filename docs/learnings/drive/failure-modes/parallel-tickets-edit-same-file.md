---
type: failure-mode
stale_after: 2026-12-19
title: 'Parallel tickets edit the same file and the rules are relayed by hand'
enforcer: 'check: new dispatch check that fails when two parallel tickets declare the same file, architectural'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/793
fixed-by: https://github.com/hancrafted/content-library/commit/3822510c81164552328a421757060216aefacf34
fixed-on: '2026-11-19'
---

# Parallel tickets edit the same file and the rules are relayed by hand

## Symptom

Two tickets queued in parallel declare or edit the same file, so the Orchestrator relays rules by message and a sync conflicts.

## Fix

`drive dispatch check <issue…>` fails when two queued tickets declare overlapping `Files:` globs, naming both (landed in #793).
