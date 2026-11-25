---
type: failure-mode
stale_after: 2026-12-19
title: 'A monitor session edits the learnings file directly because no monitor channel is documented'
enforcer: 'check: `drive learnings check` fails when `docs/drive/learnings.md` exists; prose in skills/drive/SKILL.md "Monitor" writes only `.scratch/<topic>/monitor.md`'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/798
fixed-by: https://github.com/hancrafted/content-library/commit/cc58d41b0
fixed-on: '2026-11-19'
---

# A monitor session edits the learnings file directly because no monitor channel is documented

## Symptom

A monitor session edits the learnings file directly, against fortify.md, because no monitor channel is documented.
