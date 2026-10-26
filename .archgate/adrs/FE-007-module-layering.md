---
type: adr
id: FE-007
title: 'Module Layering'
domain: frontend
rules: false
files: ['src/**/*.{ts,tsx}', '{skills,tools}/**/*.ts']
paths: ['src/**/*.{ts,tsx}', '{skills,tools}/**/*.ts']
description: 'Two zones under different laws — src/app governed by content, the authored zone by position — one import direction app → page-assembly → product areas → content-store → shared (components → hooks → lib inside each) with no cycles and no React in lib, product areas that meet only in page assembly, a Slide folder importing only global shared code, and Slide internals ungoverned in shape — values, not shape: only colour, size and weight follow tokens.'
---

# Module Layering

## Context

Under the App Router the directory **is** the URL: `src/app/[locale]/episode/episode-template/page.tsx` sits where it sits because `/de/episode/episode-template` exists. So the tree splits into two zones:

- **Framework zone** — `src/app/**`. The router owns position; this record governs what a file there may _contain_.
- **Authored zone** — `src/page-assembly/**`, `src/episodes/**`, `src/events/**`, `src/pipeline/**`, `src/explorable-explanations/**`, `src/content-store/**`, `src/shared/**`. Position is chosen, so the folder is the tier. `src/shared/` and each product area hold the tier folders `components/`, `hooks/` and `lib/` as needed, and the rules below on lib and hooks bind every one; the Episodes area's other folders are Episode content, and its composition registries in `lib/` import every Episode, so they sit above it.

One rule spans both: import direction. Lib stays React-free so a lib module is a plain module a test imports without a DOM.

Rejected: a flat Package tree under `src/packages/` (markdown-harness's model). The router forbids it in the framework zone; in the authored zone three tier folders already carry the direction, and a Package tree would add a second positional law. A record wanting Packages must reverse this one.

## Decision

### 1. Thin routes

1. A `page.tsx` MUST render one template from `src/page-assembly/`, plus its segment exports.
2. A root layout MUST render `SiteShell`, plus `metadata` and segment exports; a nested layout MUST NOT (`<html>`), it MAY wrap children.
3. Route files MUST hold no layout markup, data shaping or business logic.
4. A route MUST reach shared components and page chrome only through `SiteShell`, and no product area.

### 2. Import direction

1. Layers run `app → page-assembly → product areas → content-store → shared`; tiers run `components → hooks → lib`. An edge MAY skip downward, never upward. `src/shared/**` knows no domain: it imports only `shared/`.
2. No import cycle MAY exist under `src/`.
3. `src/page-assembly/**` is flat, a folder per template plus `lib/` and a root Translation merge: only routes, tests and the next-intl config import it; a template imports only its folder and `lib/`.
4. A stylesheet import is not a tier edge.
5. `src/content-store/**` imports no React. Its one upward edge is an Episode's metadata file, `episodes/[by-event/<e>/]<slug>/episode-metadata.ts`, so an Episode stays one folder; that file imports only schemas and lib. The store's `schemas/` is a leaf every tier may import, so a lib module takes a record type without an upward edge.
6. Product areas (`episodes/`, `events/`, `explorable-explanations/`, `pipeline/`) never import each other; a Slide folder MAY import an Explorable explanation. Areas meet only in page assembly, which passes one's parts to another as props and reaches an area only via `components/` and `lib/` (an explanation via its folder).
7. `src/` never imports `skills/` or `tools/`; they reach `src/` only via an area's `lib/` or the store's entry.

### 3. Lib imports no React

1. A `lib/` folder MUST NOT import `react` or `react-dom` — not even types — and MUST hold no `.tsx` file.

### 4. The ungoverned zone: Slide internals

1. What renders inside one Slide — markup, props, layout — is explicitly **not** governed: no mandated component shape, prop interface or layout rule. Values, not shape: tokens govern colour, size and weight inside a Scene; the Slide wrapper rules add only Backdrop, looping and stacking.
2. Why: a prototype's per-slide type interface degraded every visualisation. Governance binds boundaries, never a Slide's inside; silence gets filled with structure.

### 5. A Slide folder imports only global shared code

1. A Slide folder, `episodes/[by-event/<e>/]<ep>/slides/<slide>/` or `episodes/slide-pool/<slide>/`, MUST import only its own files and `slide-master/`, `slide-shared/`, `src/explorable-explanations/`, `ui/`, `src/shared/hooks/`, `src/shared/lib/` — never another Slide or its Episode; its `*.client.tsx` only own files, hooks, lib. A Slide reaches `shared/components/core-components/` only from its server files, never from a `*.client.tsx` widget.
2. A `slide-shared` part MUST import only `slide-shared/`, `ui/` and `src/shared/lib/` — never a Slide, Episode or the Slide master; its `*.client.tsx` only own folder, `shared/components/core-components/`, hooks, lib.
   1. (§5.2.1) `src/shared/components/core-components/` holds the primitives parts share, one subfolder each. It is a leaf: it MUST import only `core-components/`, `src/shared/hooks/`, `src/shared/lib/`, and own no words.
   2. (§5.2.2) Every `slide-shared` part, its `*.client.tsx` files included, MAY import `core-components/`.
3. An Explorable explanation (`src/explorable-explanations/<name>/`) imports only its own area, `core-components/`, `ui/` and `src/shared/lib/`, never `slide-shared/`; its client leaf as rule 2. From outside, only a Slide folder or page assembly imports it.
4. Why: a Slide copied with `cp -r`, one import and one list entry needs nothing else. §4 holds inside.

## Do's and Don'ts

### Do's

1. **DO** render one `<XxxPage locale={…} />` from `@/page-assembly/<template>/*`. (Decision 1)
2. **DO** add a page template as its own folder in `src/page-assembly/`, its single-use parts beside it. (Decisions 1 and 2)
3. **DO** move logic a route needs into its template or `src/shared/lib/**`. (Decision 1)
4. **DO** import or skip downward: an area → content-store, an area → shared lib, hooks → lib, app → lib. (Decision 2)
5. **DO** keep `src/shared/lib/**` to `.ts` files that test without a DOM. (Decision 3)
6. **DO** leave a Slide's internal markup to the visualization it serves; take its colour, size and weight from tokens. (Decision 4)
7. **DO** move a part two Slides need into `slide-shared/` and import it from there. (Decision 5)
8. **DO** put a primitive several `slide-shared` parts share in `shared/components/core-components/<name>/`, taking its words and data as props. (Decision 5.2.1)

### Don'ts

1. **DON'T** import `src/shared/components/ui/**` or any non-root component from a route. (Decision 1)
2. **DON'T** shape data, branch on content or lay out markup under `src/app/**`. (Decision 1)
3. **DON'T** import upward: into page assembly from below, lib → hooks/store/components/app, hooks → store/components/app, store → an area but an Episode's metadata file, shared → anything of the domain. (Decision 2)
4. **DON'T** import a template from a component or another template, or create a cycle. (Decision 2)
5. **DON'T** write `import type { ReactNode } from 'react'` or a `.tsx` file under `src/shared/lib/**`. (Decision 3)
6. **DON'T** invent a shared Slide type, prop interface or layout contract and route Slides through it. (Decision 4)
7. **DON'T** import one Slide's folder from another, or an Episode file from a Slide — `import { x } from '../other-slide/part'`. (Decision 5)
8. **DON'T** import a `slide-shared` part, `ui/` or a Slide from `core-components/`, or `core-components/` from a Slide's `*.client.tsx` widget. (Decision 5.1, 5.2.1)

## Consequences

**Positive:**

1. **Direction held mechanically:** every upward edge, cycle and React import in lib fails at commit and in CI, not at review.
2. **Lib stays plain:** pure logic tests without a DOM.
3. **Thin routes partly checkable:** a route importing a UI primitive, or a page rendering no page template, fails.
4. **The visualization keeps its freedom:** the one area a prior prototype degraded by over-structuring is fenced off in writing.
5. **A Slide travels:** its folder holds or names everything it needs, so copying it into another Episode is two lines of wiring.

**Negative:**

1. **Roots named by path:** `SiteShell` and the two root layouts carry no classifier; a second shell or root layout needs the checks widened by hand.
2. **Two laws to learn:** a contributor must know a file's zone before knowing which rules apply.
3. **Logic-free routes are review-held:** only the import ceiling is mechanical.
4. **The stylesheet exclusion is load-bearing:** `SiteShell` imports `@/app/globals.css`; drop the exclusion and components → app fires on an unrelated-looking edge.
5. **Promotion before sharing:** a part a second Slide wants must first move to `slide-shared`, a small refactor instead of a cross-folder import.

**Risks:**

1. **A thin graph reports success:** if type-only imports are erased before the check, a type-only React import in lib passes. **Mitigation:** type imports are kept in the graph; read the dependency count, not just the checkmark.
2. **A Slide grows a contract by drift.** **Mitigation:** §4 is a review duty; a shared Slide shape needs a new ADR reversing it.

## Compliance and Enforcement

1. **Dependency rules** (dependency-cruiser, error; `npm run lint:boundaries` over `src/`, `skills/` and `tools/`, pre-commit and CI): §1.1, §1.2, §1.4, §2.1–§2.3, §2.5–§2.7, §3, §5 including `core-components-are-a-leaf` and the core exception on the client-leaf rule (§5.2.2) (its message names the allowed locations; probe tests over a throwaway tree).
2. **Unused-file check** (knip, pre-push and CI): an unimported `.tsx` under `src/shared/lib/` (§3).

**Known gap:** `routes.ts`, `prefs-storage.ts` and `utils.ts` in `src/shared/lib/` carry no classifier; left for a future lib-tree record.

**Manual review duties:** routes hold no markup, data shaping or logic (§1.3); no nested layout renders `<html>` (§1.2); no shared Slide shape (§4); core components own no words (§5.2.1); `slide-shared` parts take serializable props and own no words, except an Explorable explanation's locale pair of data and default words, which a Slide overrides (§5).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — folder-as-route.
- [dependency-cruiser — rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) — `forbidden`, `required`, `circular`.
