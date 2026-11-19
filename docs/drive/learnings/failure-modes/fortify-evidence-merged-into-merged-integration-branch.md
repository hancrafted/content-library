---
title: 'Fortify evidence is merged into an Integration branch whose PR had already merged'
enforcer: 'review: Fortify takes its evidence from the base branch after the merge (Decision record 0028), architectural'
status: fixed
fixed-by: https://github.com/hancrafted/content-library/pull/768
fixed-on: '2026-11-18'
---

# Fortify evidence is merged into an Integration branch whose PR had already merged

## Symptom

Fortify evidence is merged into an Integration branch whose PR had already merged, so the work lands on a dead branch.

## Fix

Fortify takes its evidence from the base branch after the merge (landed in #740, Decision record 0028).
