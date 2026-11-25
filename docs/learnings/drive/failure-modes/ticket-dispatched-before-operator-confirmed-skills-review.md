---
type: failure-mode
stale_after: 2026-12-19
title: 'A ticket is dispatched before the Operator confirmed its Skills and Review lines'
enforcer: 'check: new `drive` dispatch check that refuses a ticket whose Skills and Review-after lines are not marked confirmed, architectural'
status: proposed
---

# A ticket is dispatched before the Operator confirmed its Skills and Review lines

## Symptom

A ticket goes out with Skills and Review-after lines the Operator never answered directly.
