---
type: record
workflow: drive-learnings-consolidate
date: '2026-11-18'
fortify: skipped
skip-reason: 'not recorded when the learnings file was migrated; no Fortify answer was logged for this Workflow'
---

# drive-learnings-consolidate

Merging the learnings PRs #774, #776 and #777 into one.

## parallel-workflows-conflict-in-learnings-file

- **Evidence:** #774, #776 and #777 each appended failure modes after the last entry and corrections before the last line, so each conflicted with main and the others; merged by hand into one PR, and the "Operator skips Fortify" count was raised from 1 to 3 across them
- **Correction:** "774,776 and 777 are pr with learndings updates of drive. they have conflices and will cause conflicts of each other."
