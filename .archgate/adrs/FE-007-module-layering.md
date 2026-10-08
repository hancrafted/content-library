---
type: adr
id: FE-007
title: 'Module Layering'
domain: frontend
rules: false
files: ['src/**/*', '.dependency-cruiser.cjs', 'knip.json']
paths: ['src/**/*', '.dependency-cruiser.cjs', 'knip.json']
description: 'Two zones under different laws — src/app governed by content, the authored zone by position — one import direction app → components → hooks → lib with no cycles and no React in lib, and Slide internals left explicitly ungoverned.'
---

# Module Layering

## Context

The reference ADRs (markdown-harness `ARCH-004 Folders and Files`) put every source file in a flat Package under `src/packages/`, never nested. That cannot hold here. Under the App Router the directory **is** the URL: `src/app/[locale]/episode/page-template/page.tsx` sits where it sits because `/de/episode/page-template` exists. Its nesting is mandatory and the file cannot move.

So the tree splits into two zones under different laws:

- **Framework zone** — `src/app/**`. The router owns position. This record governs what a file there may _contain_, not where it sits.
- **Authored zone** — `src/components/**`, `src/hooks/**`, `src/lib/**`. Position is chosen, so it can carry meaning: the folder is the tier.

One rule spans both zones: import direction.

**Rejected: the flat-Package model (`ARCH-004` Decision 1).** Rejected for the framework zone because the router forbids it. Also not adopted for the authored zone: the repo has no `src/packages/`, and this record does not introduce one. Three tier folders already carry the direction; a Package tree on top would add a second positional law beside the router's. This is a decision, not an omission — the next record that wants Packages must reverse it here.

Repo state at adoption, verified: all 3 `page.tsx` files render a `src/components/pages/*` component; both layouts render `SiteShell`. `src/lib/**` imports no React, component or hook. `src/components/ui/button.tsx` imports `@/lib/utils` — downward, allowed. Only routes import `src/components/pages/**`. No import cycle exists. Nothing checked any of it except FE-006's `hooks-reached-only-from-client`. Why lib carries no React: a lib module stays a plain module a vitest test imports without a DOM or a renderer — which is why the `*.pure.ts` siblings (`locale.pure.ts`, `prefs.pure.ts`, `theme.pure.ts`) test the way they do under [ARCH-003](./ARCH-003-testing.md).

This record writes the live convention down and puts checks behind it; it changes no behaviour.

## Decision

### 1. Thin routes

1. A `page.tsx` under `src/app/**` MUST render a page component from `src/components/pages/**`, plus the segment exports [FE-005](./FE-005-static-export-contract.md) requires.
2. A root layout (`(en)/layout.tsx`, `[locale]/layout.tsx`) MUST render `SiteShell`, plus `metadata` and FE-005's segment exports. A nested layout MUST NOT (`SiteShell` renders `<html>`); it MAY wrap its children.
3. Route files MUST hold no layout markup, data shaping or business logic. Locale param plumbing lives in `src/app/[locale]/params.ts`.
4. A route MUST reach `src/components/**` only through those two composition roots: `src/components/pages/**` and `site-shell.tsx`.

### 2. Import direction

1. Tiers run `app → components → hooks → lib`. An edge MAY skip a tier downward; it MUST NOT point upward.
2. No import cycle MAY exist anywhere under `src/`.
3. `src/components/pages/**` is the top sub-tier of `components`, not a peer layer: only a route (or a test) imports it. No other component and no page component imports a page component. Shared helpers live lower.
4. A stylesheet import is not a tier edge. `site-shell.tsx` imports `@/app/globals.css`; the cruise excludes `\.css$`.

### 3. `src/lib/**` imports no React

1. `src/lib/**` MUST NOT import `react` or `react-dom` — not runtime, not types — and MUST hold no `.tsx` file, so no JSX.

### 4. The ungoverned zone: Slide internals

1. What renders inside one Slide — its markup, its props, its layout — is explicitly **not** governed: no mandated component shape, no prop interface, no layout rule.
2. Why, kept verbatim: a prior prototype failed because an agent invented a per-slide type interface and forced bespoke markup through it, degrading the visualization across repeated attempts and models.
3. Governance binds boundaries — routes, locale, client bundle, build output, import direction — never the inside of a Slide. It is written down because unstated silence gets filled with structure by the next agent.

## Do's and Don'ts

### Do's

1. **DO** write a page as a single `<XxxPage locale={…} />` from `@/components/pages/*`, as `src/app/(en)/page.tsx` does. (Decision 1)
2. **DO** add a new page component under `src/components/pages/` and import it only from routes. (Decisions 1 and 2)
3. **DO** move logic a route needs into `src/lib/**` and call it from the page component, not the route. (Decision 1)
4. **DO** import downward or skip tiers downward: components → lib, hooks → lib, app → lib. (Decision 2)
5. **DO** keep `src/lib/**` to `.ts` files with no React import, testable under vitest without a DOM. (Decision 3)
6. **DO** leave a Slide's internal markup to the visualization it serves. (Decision 4)

### Don'ts

1. **DON'T** import `src/components/ui/**` or any non-root component from a route. (Decision 1)
2. **DON'T** shape data, branch on content or lay out markup in a file under `src/app/**`. (Decision 1)
3. **DON'T** import upward: lib → hooks/components/app, hooks → components/app, components → app. (Decision 2)
4. **DON'T** import a page component from another component, or create an import cycle. (Decision 2)
5. **DON'T** write `import type { ReactNode } from 'react'` or a `.tsx` file under `src/lib/**`. (Decision 3)
6. **DON'T** invent a shared Slide type, prop interface or layout contract and route Slides through it. (Decision 4)

## Consequences

**Positive:**

1. **Direction held mechanically:** every upward edge, cycle and React import in lib fails at commit, push and in CI, not at review.
2. **Lib stays plain:** pure logic tests without a DOM, so ARCH-003's discipline stays cheap.
3. **Thin routes are partly checkable:** a route that imports a UI primitive, or a page that renders no page component, fails the cruise.
4. **The visualization keeps its freedom:** the one area a prior prototype degraded by over-structuring is fenced off in writing.

**Negative:**

1. **`site-shell.tsx` is named by path:** the second composition root carries no classifier, so a second shell needs the rule widened by hand.
2. **Two laws to learn:** a contributor must know which zone a file sits in before knowing which rules apply.
3. **Logic-free routes are review-held:** "no data shaping" is not a glob; only the import ceiling is mechanical.
4. **The `\.css$` exclusion is load-bearing:** `site-shell.tsx` imports `@/app/globals.css`, and `options.exclude` in `.dependency-cruiser.cjs` is the only reason `components-never-import-app` does not fire on it. Dropping it turns the repo red on a rule that reads as unrelated.

**Risks:**

1. **dependency-cruiser reports success over a thin graph.** Without `tsPreCompilationDeps: true` every `import type` edge is erased before rules run, so `lib-imports-no-react` misses a type-only React import. **Mitigation:** the flag is set (owned by FE-006); read the dependency count, never the checkmark (measurements below).
2. **A Slide grows a contract by drift.** **Mitigation:** Decision 4 is a review duty; a shared Slide shape needs a new ADR reversing it.

## Compliance and Enforcement

**Enforcers per Discipline:**

- §1.1, §1.2: `.dependency-cruiser.cjs` `required` rules `page-composes-a-page-component` (every `page.tsx`, root-level included) and `root-layout-composes-site-shell` (the two root layouts, by path), plus rule `site-shell-reached-only-from-root-layouts`, all `error`. `required` asserts presence, not count.
- §1.4: `.dependency-cruiser.cjs` rule `route-reaches-components-only-via-roots`, `error`.
- §2.1: rules `lib-imports-no-upper-tier`, `hooks-import-no-upper-tier`, `components-never-import-app`, `error`. FE-006's `hooks-reached-only-from-client` already bars app → hooks and server components → hooks; no rule here restates it. `components-never-import-app` and FE-006's `client-never-imports-app` both fire on a `.client` → app edge.
- §2.2: rule `no-circular`, `error`. §2.3: rule `pages-reached-only-from-app`, `error`.
- §3.1: rules `lib-imports-no-react` and `lib-tsx-never-imported`, `error`. `lib-tsx-never-imported` sees only an imported `.tsx`; an unimported one is an unused file to `knip` (`knip.json` projects `src/**/*.{ts,tsx,css}`), exit 1. `knip` runs in `npm run verify` (pre-push) and CI, not at commit.
- Runner for every dependency-cruiser rule: `npm run lint:boundaries` (`depcruise src`) inside `npm run lint`, which `npm run verify` (pre-push) and CI run; `verify:commit` (pre-commit) runs it directly. `no-circular` is scoped `from: { path: '^src/' }`, so its reach does not depend on the runner's argument. The names above are this record's; FE-006's three and FE-010's `context-drawer-*` pair are not.

**Measured on introduction** (probe files under `src/`, removed after): 8 probes, one breach per rule (a lib type-only React import, a lib `.tsx` imported, a two-file lib cycle, …), gave 9 errors — the probe page fired both `route-reaches-components-only-via-roots` and `page-composes-a-page-component`. Repo: 0 errors, **77 dependencies cruised, 54 local, 12 type-only**, 0 edges from `src/lib/**` to React. With `tsPreCompilationDeps: false` the same probes still gave 9 errors — but the type-only React import vanished and the lib `.tsx`'s injected `react/jsx-runtime` edge fired in its place; the clean repo reads 80 cruised, 49 local, 0 type-only, 15 injected `react/jsx-runtime` — FE-006's figures. Same count, different edges: the failure signature. A root `src/app/page.tsx` rendering no page component fired its `required` rule. Amended: a nested layout without `SiteShell` gave 0 errors, importing it 1 (`site-shell-reached-only-from-root-layouts`). `knip` listed an unimported `src/lib/probe-b.tsx` as 1 unused file and exited 1; clean, it exits 0.

**Known reach gap.** `src/lib/**` is only partly classified: `routes.ts`, `prefs-storage.ts` and `utils.ts` carry no classifier, and `utils.ts` is a name `ARCH-004` Decision 4 bans. Both belong to a future lib-tree record; this record leaves them as they are. The `\.css$` exclusion in `.dependency-cruiser.cjs` hides any stylesheet edge from every rule (§2.4), and `components-never-import-app` currently depends on it to stay green (Negative 4). The root layouts are named by path in two rules; a third root layout needs both widened by hand.

**Manual review duties** (never linted): route files hold no layout markup, data shaping or business logic (§1.3); no nested layout renders its own `<html>` (§1.2); no shared Slide shape, prop interface or layout rule is introduced (§4).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [FE-006 Server/Client Boundary](./FE-006-server-client-boundary.md) — the boundary rules sharing `.dependency-cruiser.cjs`, and the `tsPreCompilationDeps` measurement.
- [FE-005 Static Export Contract](./FE-005-static-export-contract.md) — the segment exports a route keeps.
- [ARCH-003 Testing](./ARCH-003-testing.md) — why lib stays React-free.
- markdown-harness `ARCH-004 Folders and Files` — the flat-Package model rejected in Context.
- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — folder-as-route.
- [dependency-cruiser — rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) — `forbidden`, `required`, `circular`.
- [`docs/research/adr-candidates.md`](../../docs/research/adr-candidates.md) §2 — the survey this record came from.
