---
title: 'A decision page of the wrong model tier fails layout or rendering'
enforcer: 'review: the tier rule in dispatch.md "Model", read from the page''s calibration; the screenshot check in dispatch.md "A decision page"'
status: fixed
ticket: https://github.com/hancrafted/content-library/issues/798
fixed-by: https://github.com/hancrafted/content-library/commit/cc58d41b0282cfab0a08d2d62c019cb114f3114d
fixed-on: '2026-11-19'
---

# A decision page of the wrong model tier fails layout or rendering

## Symptom

A decision page built by a Subagent of the wrong model tier breaks layout or rendering, or the Operator has to ask for the right tier more than once because the tier the Orchestrator picked is not visible to them.
