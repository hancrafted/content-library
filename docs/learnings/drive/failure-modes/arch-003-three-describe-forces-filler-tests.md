---
type: failure-mode
stale_after: 2026-12-19
title: "ARCH-003's three-describe rule forces filler tests in composition-only section tests"
enforcer: 'adr-checker: archgate, narrow the ARCH-003-testing rule for composition-only section tests, quick win'
status: proposed
---

# ARCH-003's three-describe rule forces filler tests in composition-only section tests

## Symptom

ARCH-003's three-describe rule forces filler tests that can never fail in composition-only section tests.
