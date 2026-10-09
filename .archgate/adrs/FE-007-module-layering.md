---
type: adr
id: FE-007
title: 'Module Layering'
domain: frontend
rules: false
files: ['src/**/*.{ts,tsx}']
paths: ['src/**/*.{ts,tsx}']
description: 'Two zones under different laws — src/app governed by content, the authored zone by position — one import direction app → components → hooks → lib with no cycles and no React in lib, and Slide internals left explicitly ungoverned.'
---

# Module Layering

## Context

Under the App Router the directory **is** the URL: `src/app/[locale]/episode/page-template/page.tsx` sits where it sits because `/de/episode/page-template` exists. So the tree splits into two zones:

- **Framework zone** — `src/app/**`. The router owns position; this record governs what a file there may _contain_.
- **Authored zone** — `src/components/**`, `src/hooks/**`, `src/lib/**`. Position is chosen, so the folder is the tier.

One rule spans both: import direction. Lib stays React-free so a lib module is a plain module a test imports without a DOM.

Rejected: a flat Package tree under `src/packages/` (markdown-harness's model). The router forbids it in the framework zone; in the authored zone three tier folders already carry the direction, and a Package tree would add a second positional law. A record wanting Packages must reverse this one.

## Decision

### 1. Thin routes

1. A `page.tsx` MUST render one page component from `src/components/pages/**`, plus its segment exports.
2. A root layout MUST render `SiteShell`, plus `metadata` and segment exports. A nested layout MUST NOT (`SiteShell` renders `<html>`); it MAY wrap its children.
3. Route files MUST hold no layout markup, data shaping or business logic.
4. A route MUST reach `src/components/**` only through the two composition roots: `src/components/pages/**` and `SiteShell`.

### 2. Import direction

1. Tiers run `app → components → hooks → lib`. An edge MAY skip a tier downward; it MUST NOT point upward.
2. No import cycle MAY exist under `src/`.
3. `src/components/pages/**` is the top sub-tier of components: only a route or a test imports it.
4. A stylesheet import is not a tier edge.

### 3. `src/lib/**` imports no React

1. `src/lib/**` MUST NOT import `react` or `react-dom` — not even types — and MUST hold no `.tsx` file.

### 4. The ungoverned zone: Slide internals

1. What renders inside one Slide — markup, props, layout — is explicitly **not** governed: no mandated component shape, prop interface or layout rule.
2. Why: a prior prototype failed because an agent invented a per-slide type interface and forced bespoke markup through it, degrading the visualization across repeated attempts and models.
3. Governance binds boundaries — routes, locale, client bundle, build output, import direction — never the inside of a Slide. Written down because unstated silence gets filled with structure by the next agent.

## Do's and Don'ts

### Do's

1. **DO** write a page as a single `<XxxPage locale={…} />` from `@/components/pages/*`. (Decision 1)
2. **DO** add a new page component under `src/components/pages/` and import it only from routes. (Decisions 1 and 2)
3. **DO** move logic a route needs into `src/lib/**` and call it from the page component. (Decision 1)
4. **DO** import downward or skip tiers downward: components → lib, hooks → lib, app → lib. (Decision 2)
5. **DO** keep `src/lib/**` to `.ts` files that test without a DOM. (Decision 3)
6. **DO** leave a Slide's internal markup to the visualization it serves. (Decision 4)

### Don'ts

1. **DON'T** import `src/components/ui/**` or any non-root component from a route. (Decision 1)
2. **DON'T** shape data, branch on content or lay out markup under `src/app/**`. (Decision 1)
3. **DON'T** import upward: lib → hooks/components/app, hooks → components/app, components → app. (Decision 2)
4. **DON'T** import a page component from another component, or create an import cycle. (Decision 2)
5. **DON'T** write `import type { ReactNode } from 'react'` or a `.tsx` file under `src/lib/**`. (Decision 3)
6. **DON'T** invent a shared Slide type, prop interface or layout contract and route Slides through it. (Decision 4)

## Consequences

**Positive:**

1. **Direction held mechanically:** every upward edge, cycle and React import in lib fails at commit and in CI, not at review.
2. **Lib stays plain:** pure logic tests without a DOM.
3. **Thin routes partly checkable:** a route importing a UI primitive, or a page rendering no page component, fails.
4. **The visualization keeps its freedom:** the one area a prior prototype degraded by over-structuring is fenced off in writing.

**Negative:**

1. **Roots named by path:** `SiteShell` and the two root layouts carry no classifier; a second shell or root layout needs the checks widened by hand.
2. **Two laws to learn:** a contributor must know a file's zone before knowing which rules apply.
3. **Logic-free routes are review-held:** only the import ceiling is mechanical.
4. **The stylesheet exclusion is load-bearing:** `SiteShell` imports `@/app/globals.css`; drop the exclusion and components → app fires on an unrelated-looking edge.

**Risks:**

1. **A thin graph reports success:** if type-only imports are erased before the check, a type-only React import in lib passes. **Mitigation:** type imports are kept in the graph; read the dependency count, not just the checkmark.
2. **A Slide grows a contract by drift.** **Mitigation:** §4 is a review duty; a shared Slide shape needs a new ADR reversing it.

## Compliance and Enforcement

1. **Dependency rules** (dependency-cruiser, error; `npm run lint:boundaries`, pre-commit and CI): §1.1, §1.2, §1.4, §2.1–§2.3, §3.
2. **Unused-file check** (knip, pre-push and CI): an unimported `.tsx` under `src/lib/` (§3).

**Known gap:** `routes.ts`, `prefs-storage.ts` and `utils.ts` in `src/lib/` carry no classifier; left for a future lib-tree record.

**Manual review duties:** routes hold no markup, data shaping or logic (§1.3); no nested layout renders `<html>` (§1.2); no shared Slide shape (§4).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — folder-as-route.
- [dependency-cruiser — rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) — `forbidden`, `required`, `circular`.
- [`docs/research/adr-candidates.md`](../../docs/research/adr-candidates.md) §2 — the survey this record came from.
