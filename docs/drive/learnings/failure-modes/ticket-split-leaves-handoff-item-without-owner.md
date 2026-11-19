---
title: 'A ticket split leaves a handoff item with no owning ticket'
enforcer: 'check: new dispatch check that fails when a Describes or hand-off line in a ticket names a file no queued ticket owns, architectural'
status: proposed
---

# A ticket split leaves a handoff item with no owning ticket

## Symptom

A ticket's report hands an item to a later ticket whose Files line forbids the files the item needs, so no ticket owns it until a review finds it.
