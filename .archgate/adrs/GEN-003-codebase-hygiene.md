---
type: adr
id: GEN-003
title: 'Codebase Hygiene'
domain: general
rules: true
files: ['src/**/*']
paths: ['src/**/*']
description: 'Hygiene Disciplines binding every file under src/ whatever its language and belonging to no one subsystem: so far, the ban on inline lint suppression.'
---

# Codebase Hygiene

## Context

A home for hygiene Disciplines that bind every file under `src/`, whatever its language, and belong to no one subsystem.

An inline lint-disable directive silences a rule where no reviewer looks for it, and agents reach for it to turn red green. The linter honours every directive it's handed, so only a separate check can refuse them. Two families exist: `eslint-*` directives, which the ESLint-compatible JS plugin layer still recognises, and `oxlint-*` directives, which oxlint honours natively.

## Decision

### 1. No inline lint suppression (📜 Rule: `no-eslint-disable`)

1. A file under `src/` MUST NOT carry a lint directive comment in either family — `eslint-disable`, `oxlint-disable`, their `-line` and `-next-line` variants, or `eslint-enable` and `oxlint-enable`, in `//` or `/* */` form.
2. A wrong rule is turned off in the lint config, behind a `files:` glob, with its reason.

## Do's and Don'ts

### Do's

1. **DO** turn a wrong lint rule off in the lint config, scoped by `files:` and carrying its reason. (Decision 1)

### Don'ts

1. **DON'T** write `// eslint-disable-next-line`, `// oxlint-disable-next-line` or any other directive under `src/`. (Decision 1, 📜 Rule: `no-eslint-disable`)

## Consequences

**Positive:**

1. **Auditable suppression:** every exception sits in one config, with a glob and a reason.

**Negative:**

1. **No local escape hatch:** a one-off false positive needs a config glob or an ADR amendment.

## Compliance and Enforcement

1. **Rule** `no-eslint-disable` (archgate, error): every file under `src/`; the rule id keeps its original name though it now covers both directive families.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [ESLint — configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments) and [oxlint — inline ignore comments](https://oxc.rs/docs/guide/usage/linter/ignore-comments.html) — the directive forms §1 bans.
