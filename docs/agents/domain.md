# Domain Docs

How engineering skills should consume this repo's domain documentation when exploring the codebase. This repo is **single-context**.

## Two kinds of ADR

This repo has two decision records. Keep them apart.

| Name           | Lives in          | Written by                                                     | Records                                                                                         |
| -------------- | ----------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **ADR**        | `.archgate/adrs/` | Archgate (`archgate:adr-author`, `archgate:lessons-learned`)   | Universal coding Disciplines, enforced by `archgate check`. Governed by GEN-001.                |
| **Design-ADR** | `docs/adr/`       | Engineering skills (`/domain-modeling`, `/grill-with-docs`, …) | Feature-, contract- and architecture-shaped decisions that a later feature could make obsolete. |

Whenever an engineering skill says "ADR" (offer an ADR, record an ADR, ADR-FORMAT.md, `docs/adr/`), it means a **design-ADR**. Never write into `.archgate/adrs/` from an engineering skill.

### Design-ADR front matter

Every design-ADR in `docs/adr/` opens with this front matter, then follows the skill's ADR format (`NNNN-slug.md`, sequential numbering):

```md
---
type: design-adr
status: accepted
---

# {Short title of the decision}

{1-3 sentences: context, decision, why.}
```

`status` is `proposed | accepted | deprecated | superseded by design-ADR-NNNN`. Cite design-ADRs as `design-ADR-0007` so they don't collide with Archgate IDs like `GEN-001`.

## Before exploring, read

- **`GLOSSARY.md`** at the repo root.
- **`docs/adr/`**: read the design-ADRs that touch the area you're about to work in.
- **`.archgate/adrs/`**: the Archgate ADRs are binding rules; `archgate review-context` gives condensed briefings.

If `GLOSSARY.md` or `docs/adr/` doesn't exist, **proceed silently**. Don't flag the absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── GLOSSARY.md
├── docs/adr/                      ← design-ADRs (engineering skills)
│   ├── 0001-some-decision.md
│   └── 0002-another-decision.md
├── .archgate/adrs/                ← ADRs (Archgate governance)
└── src/
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing design-ADR, surface it explicitly rather than silently overriding:

> _Contradicts design-ADR-0007 (event-sourced orders), but worth reopening because…_

A conflict with an Archgate ADR is not up for reopening here: it is a hard blocker. Follow the Archgate refusal policy.
