---
type: adr
id: FE-007
title: 'Module Layering'
domain: frontend
rules: false
files: ['src/**/*.{ts,tsx}', '{skills,tools}/**/*.ts']
paths: ['src/**/*.{ts,tsx}', '{skills,tools}/**/*.ts']
description: 'Who imports whom: thin routes, five layers importing only downward (app → page-assembly → product areas → content-store → shared, components → hooks → lib inside each), product areas that never import each other and meet only in page assembly, who reads the content store, how skills/ and tools/ reach src/, no React in lib, Slide internals ungoverned in shape, and a Slide folder importing only global shared code.'
---

# Module Layering

## Context

Under the App Router the directory **is** the URL: `src/app/[locale]/episodes/[episode]/page.tsx` sits where it sits because `/de/episodes/<slug>` exists. So `src/app/` is the **framework zone**: the router owns position, and this record governs only what a file there contains. Everywhere else position is chosen, so the folder carries the law.

The tree follows the product, so an agent learns what the product is before its plumbing (design-ADR `docs/adr/0017-source-tree-follows-the-product.md` holds the reasoning and the rejected layouts). Five layers:

1. **Routes**, `src/app/`: bind a URL to a template.
2. **Page assembly**, `src/page-assembly/`: one folder per page template (landing, Events overview, Event, Episode overview, Episode, dashboard, sitemap), plus `lib/` (page metadata, structured data) and the root Translation merge. A part one template uses sits beside it.
3. **Product areas**: `src/episodes/` (Episode content, then `components/ hooks/ lib/`), `src/events/`, `src/explorable-explanations/` (one self-contained folder per explanation, no tiers) and `src/pipeline/` (the content pipeline, its Run log, the dashboard).
4. **Content store**, `src/content-store/`: records, refusals and the delivery policy in `catalogue/`.
5. **Shared**, `src/shared/`: UI primitives, design system, i18n, domain-free lib and hooks, and page chrome.

Tier folders are named the same in every area, so one rule pattern binds them all. The Episodes area's composition registries in `lib/` import every Episode, so they sit above it.

**Why areas never import each other.** No product knows another; page assembly composes. When the Event page needs Episode cards in its Playlist list, page assembly builds the cards from the Episodes area and passes them in: the Events area never learns what an Episode card is. A ban needs a sanctioned path, and this is the one. A Slide showing an Explorable explanation is the one exception, so Slides keep their visuals. An explanation has no tier folders, so page assembly reaches its folder as a Slide does; a page showing one alone is a template composing it.

**Why page assembly reaches only `components/` and `lib/`.** An Episode's folders and a Slide's internals stay sealed, and with no per-area barrel nothing drags a whole area into a client bundle.

**Why the store has readers, not callers.** Page assembly and the areas read records directly, so page assembly stays thin and products stay deep. `shared/` never does, schemas included, so a primitive never learns about Episodes or Events; what page chrome needs arrives as props. The store's one upward edge, each Episode's metadata file, keeps an Episode one folder.

**Why `skills/` and `tools/` reach in only through `lib/`.** A skill or tool runs the product and never houses what it imports; a `src/` → `skills/` edge once passed unseen. Lib stays React-free, so a lib module is a plain module a test or a script under plain `node` imports without a DOM.

**Reach inside the Episodes area** (§5), named where rules check it:

- **Slide folder:** own files, `slide-master/`, `slide-shared/`, `src/explorable-explanations/`, `ui/`, shared hooks and lib; `core-components/` from server files only. Its `*.client.tsx`: own files, shared hooks and lib.
- **`slide-shared` part:** `slide-shared/`, `core-components/`, `ui/`, shared lib; its client leaf its own folder, `core-components/`, hooks, lib.
- **Explorable explanation:** its own area, `core-components/`, `ui/`, shared lib, never `slide-shared/`; its client leaf its own folder, hooks, lib.
- **`core-components/`:** itself, shared hooks and lib.

**Slide internals.** A prototype's per-Slide type interface degraded every visualisation; governance binds boundaries, never a Slide's inside, because silence gets filled with structure.

Rejected: a flat Package tree under `src/packages/` (markdown-harness's model). The router forbids it in the framework zone, and in the authored zone the layers and tier folders already carry direction.

## Decision

### 1. Thin routes

1. A `page.tsx` MUST render one page-assembly template, a root layout `SiteShell`; a nested layout never `<html>`.
2. A route holds no markup, data shaping or logic; shared components only via `SiteShell`, no area.

### 2. Import direction

1. Layers import downward only: `app → page-assembly → product areas → content-store → shared`; tiers `components → hooks → lib`. No cycles; a stylesheet is no edge.
2. Page assembly is flat: a folder per template plus `lib/`; a template imports only its folder and `lib/`.
3. Product areas MUST NOT import each other. A Slide folder MAY show an Explorable explanation.
4. Two areas meet only in page assembly, passing one's ready-made parts as props: the Playlist list takes Episode cards.
5. Page assembly reaches an area only via `components/` and `lib/`, no barrels; a tierless explanation via its folder. An explanation is a component, never a page.
6. `shared/` knows no domain, never reads the store or its schemas, and is open to every area alike.
7. Areas and page assembly read the store. Its one upward edge is an Episode's metadata file; `schemas/` is a leaf any tier imports.
8. `src/` never imports `skills/` or `tools/`, which reach it only via an area's `lib/` or the store's entry.

### 3. Lib imports no React

1. A `lib/` folder MUST NOT import React, types included, nor hold a `.tsx` file.

### 4. Slide internals are ungoverned

1. A Slide's markup, props and layout have no mandated shape; only token values apply.

### 5. A Slide folder imports only global shared code

1. A Slide folder imports only own files, the Slide master, `slide-shared/`, an explanation, `ui/`, shared hooks and lib, never another Slide or its Episode; its `*.client.tsx` only own files, hooks, lib.
2. A `slide-shared` part or an explanation imports only its kind, `core-components/`, `ui/` and shared lib; `core-components/` is a leaf owning no words.
3. Why: a Slide copied with `cp -r` needs one import and one list entry.

## Do's and Don'ts

### Do's

1. **DO** render one `<XxxPage locale={…} />` from `@/page-assembly/<template>/*`. (Decision 1)
2. **DO** add a page template as its own folder in `src/page-assembly/`, its single-use parts beside it. (Decision 2)
3. **DO** let page assembly hand one area's parts to another — `<PlaylistList entries={cards} />`. (Decision 2)
4. **DO** import or skip downward: an area → the store, an area → shared lib, hooks → lib. (Decision 2)
5. **DO** move logic a skill or tool needs into its area's `lib/`. (Decision 2)
6. **DO** keep a `lib/` folder to `.ts` files that test without a DOM. (Decision 3)
7. **DO** take a Scene's colour, size and weight from tokens, its markup from the visual it serves. (Decision 4)
8. **DO** move a part two Slides need into `slide-shared/`, a primitive parts share into `core-components/<name>/`. (Decision 5)

### Don'ts

1. **DON'T** lay out markup, shape data or import a UI primitive under `src/app/**`. (Decision 1)
2. **DON'T** import upward: into page assembly from below, lib → hooks or components, the store → an area but Episode metadata. (Decision 2)
3. **DON'T** import one product area from another — `import { EpisodeCard } from '@/episodes/…'` inside `src/events/`. (Decision 2)
4. **DON'T** reach an area's `hooks/`, an Episode folder or a barrel from page assembly, or a template from another. (Decision 2)
5. **DON'T** import the store or a domain module from `src/shared/`, or `skills/`/`tools/` from `src/`. (Decision 2)
6. **DON'T** write `import type { ReactNode } from 'react'` or a `.tsx` file in a `lib/` folder. (Decision 3)
7. **DON'T** invent a shared Slide type or layout contract and route Slides through it. (Decision 4)
8. **DON'T** import one Slide's folder from another — `'../other-slide/part'` — or an Episode file from a Slide. (Decision 5)

## Consequences

**Positive:**

1. **The tree names the product:** the top of `src/` lists its areas, so an agent knows where it is and where to go.
2. **Direction held mechanically:** every upward edge, cross-area edge, cycle and React import in lib fails at commit and in CI.
3. **Products stay deep:** an area knows only itself, the store and shared; page assembly stays a thin composer.
4. **Lib stays plain:** pure logic tests, and skill scripts run, without a DOM.
5. **A Slide travels:** its folder holds or names everything it needs.

**Negative:**

1. **Composition costs props:** a part one area builds for another passes through page assembly, a longer path than an import.
2. **Two laws to learn:** a file's zone decides which rules apply.
3. **Logic-free routes are review-held:** only the import ceiling is mechanical.
4. **The stylesheet exclusion is load-bearing:** `SiteShell` imports `@/app/globals.css`; drop it and the app rule fires on an unrelated-looking edge.
5. **Promotion before sharing:** a part a second Slide wants first moves to `slide-shared/`.

**Risks:**

1. **A thin graph reports success:** if type-only imports are erased, a type-only React import in lib passes. **Mitigation:** type imports stay in the graph; read the dependency count, not just the checkmark.
2. **A Slide grows a contract by drift.** **Mitigation:** §4 is a review duty; a shared Slide shape needs a new ADR reversing it.

## Compliance and Enforcement

1. **Dependency rules** (dependency-cruiser, error; `npm run lint:boundaries` over `src/`, `skills/` and `tools/`, pre-commit and CI): §1.1, §1.2, §2, §3 and §5; each message names the allowed locations and points here. Probe tests over a throwaway tree pin every rule.
2. **Unit test:** every top-level `src/` folder but the routes, and `tools/`, has a pointer-only `AGENTS.md` whose paths, ADR ids, sections and rule names exist.
3. **Unused-file check** (knip, pre-push and CI): an unimported `.tsx` in a `lib/` folder (§3).

**Known gap:** `routes.ts`, `prefs-storage.ts` and `utils.ts` in `src/shared/lib/` carry no classifier; left for a future lib-tree record.

**Manual review duties:** routes hold no markup, data shaping or logic (§1.2); no shared Slide shape (§4); core components own no words (§5.2); two areas meet by props passed in page assembly, never by moving one area's module into another (§2.4).

**Exceptions:** raise a separate ADR; human approval required.

## References

- `docs/adr/0017-source-tree-follows-the-product.md` — why the tree follows the product, and the layouts rejected.
- [Next.js — Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) — folder-as-route.
- [dependency-cruiser — rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) — `forbidden`, `required`, `circular`.
