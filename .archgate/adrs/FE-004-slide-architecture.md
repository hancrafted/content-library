---
type: adr
id: FE-004
title: 'Slide Architecture'
domain: frontend
rules: false
# prettier-ignore
files: ['src/episodes/**', 'src/explorables/**', 'src/page-assembly/**', 'src/app/**/{episode,episodes,events}/**']
# prettier-ignore
paths: ['src/episodes/**', 'src/explorables/**', 'src/page-assembly/**', 'src/app/**/{episode,episodes,events}/**']
description: 'Read-first architecture map: tiers, Episode modules, static composition, text/style/client homes, reuse and approved presentation boundaries. Detailed rules belong to each concern’s owner.'
---

# Slide Architecture

## Context

Map of shape and ownership. Rules stay with their owner (Episode page, imports, server/client, Slide wrapper, Context drawer), which wins on conflict.

**Layers and tiers.** Imports only point down; inside a layer, `components/ → hooks/ → lib/`.

```mermaid
flowchart TD
  app["src/app — routes"] --> tpl
  subgraph pa["src/page-assembly — flat"]
    tpl["one folder per page template"] --> palib["lib/ — metadata, JSON-LD"]
    merge["translations.ts — merges every owner's i18n/"]
  end
  tpl --> episodes["src/episodes — content and code"]
  tpl --> events["src/events — Events, Playlists"]
  tpl --> explain["src/explorables — one folder each"]
  tpl --> pipeline["src/pipeline — pipeline, Run log, dashboard"]
  tpl --> chrome["src/shared/page-chrome"]
  episodes -- "a Slide shows one" --> explain
  episodes -- "the container" --> chrome
  tpl --> store["src/content-store — records, refusals, catalogue/"]
  app -. "static params" .-> store
  episodes --> store
  events --> store
  store -- "Episode metadata only" --> episodes
  store --> shared["src/shared — domain-free"]
  explain --> shared
  pipeline --> shared
  chrome --> shared
  tools["skills/, tools/"] -. "node-safe entries" .-> pipeline
```

Areas meet in page assembly via props: the Event template passes Episode cards to the Playlist list.

**Episodes:** content (`<ep>/`, `by-event/`, `slide-pool/`, `resources/`) stays apart from code (`components/`, `lib/`, `hooks/`); these names are reserved.

**Episode modules.** Arrows are allowed imports.

```mermaid
flowchart LR
  ep["Episode — record, Sections, Slides"] --> master["slide-master — frame and types"]
  ep --> shared["slide-shared — parts two Slides share"]
  ep -- "sections/ only" --> pool["episodes/slide-pool — shared content Slides"]
  pool --> master
  pool --> shared
  ep --> explain["src/explorables — Slides show by Preset"]
  explain --> core["core-components — primitives parts share"]
  explain --> ui
  shared --> core
  ep --> ui["ui — primitives"]
  shared --> ui
  container["episode-page — container and adapters"] --> master
  container -- "domain-free inputs" --> clock["shared — surface geometry and progress"]
  container --> toc["page chrome: table-of-contents"]
  container --> drawer["page chrome: context-drawer"]
```

**Episode to page:** static HTML. A route ships every client component it reaches, lazy imports too: one route per Episode page.

```mermaid
flowchart LR
  R["generated route"] --> REC["own record: Sections of Slides"]
  R --> P["Episode page template"]
  P --> SUM["other pages' summaries"]
  P --> C["container"]
  REC --> C
  C --> W["Slide wrappers + Scenes"]
  C --> CH["page chrome: contents, drawer; talk player"]
```

**Inside a Slide:** wrapper owns mechanics and presentation hosts; Scene owns content. Wrapper rules hold lifetime and stacking.

```mermaid
flowchart LR
  W["Slide wrapper"] --> H["Slide header"]
  W --> S["Scene — creative content"]
  S --> B["Backdrop — full-bleed decoration"]
  S --> F["Foreground — inset primary layer"]
  W --> E["Outgoing edge host — Scene-independent lifetime"]
  W --> D["Optional rear Backdrop and front decoration"]
```

**Server/client:** interactive leaves only. URL/page state owns identity and navigation; clock/CSS signals own presentation, never DOM-derived identity or tone.

```mermaid
flowchart TD
  S["server: container, wrappers, Scenes"] --> M["mount + observer leaves"]
  S --> X["Slide widgets *.client.tsx"]
  S --> CL["page chrome leaves"]
  M --> ST["page state: active Slide, zones"]
  ST --> CL
  ST --> X
  S --> IP["magnetic ink: context + action leaves"]
  S --> PA["presentation adapter leaf"]
  PA --> CK["domain-free geometry clock"]
  ST -- "navigation lifecycle" --> CK
  CK --> FX["effect renderer"]
  CK --> SG["generic CSS signals — single page-tone writer"]
  SG --> CL
```

**Magnetic ink:** draws in `shared/components/animations/`, attaches in `shared/hooks/`, computes in `shared/lib/`; `SiteShell` composes context. `docs/adr/0022-magnetic-ink-is-a-shared-action-effect.md`.

Rejected: visual schema (constrains Scenes), per-Episode containers (navigation drift), flat packages (lose tier direction).

## Decision

### 1. This record is the map

1. Read first; each area's owner holds its rules.

### 2. Layers, one direction

1. `app → page-assembly → areas → content-store → shared`, downward only.

### 3. Each module owns one thing

1. `episodes/[by-event/<e>/]<ep>/` owns one Episode: `episode.ts`, text, anchors, Slide folders, `sections/<slug>.ts` per Section.
2. A Slide folder owns its Scene, widgets, logic, CSS, text, notes, Voice script; imports no other.
3. `episodes/slide-pool/<slide>/`: content Slides Episodes share, never Title or section; only a Section imports one, via `@/`.
4. `slide-master/` owns frame, layouts, record, kit and optional presentation types; `slide-shared/`, parts two Slides share.
5. `episode-page/` owns the one container, composition mechanics and page-scoped presentation adapters; it feeds plain inputs to domain-free shared measurement. Page chrome: reached only from page assembly or the container.
6. `episodes/templates/<slug>/`: Template composition, including Themes (design-ADR 0026), never an Episode.

### 4. One pass from Episode to page

1. Generated route → own record → template → container → static HTML; anchors from position. Other composed pages: via the registry.
2. Routes: `/episodes/<ep>/`; `/events/`, its `<e>/` and `<e>/episodes/<ep>/`. Resources: `/resources/`, `/<type>/<slug>/`; Themes: `/themes/<slug>/` (design-ADR 0026).
3. A page naming another (card, overview, Event navigation, metadata) reads its summary, never its composition: an Episode page ships only its own JS and CSS.
4. `npm run registry` writes routes and summaries; a stale one fails the fast suite.

### 5. Text, styling and client code have fixed homes

1. Text: its owner's `i18n/`: page template, area, page chrome, Episode, Slide, Explorable explanation; one owner per namespace.
2. Styling: tokens in `globals.css`; an Episode's remap in its scope; a Slide's in its CSS module.
3. Client code: `*.client.tsx` leaves only; hooks hold browser state.
4. A Slide MAY declare surface tone, apart from effects and slots; one container adapter publishes `data-page-tone` on `<html>` from geometry at the sampling line. Chrome follows; Scenes never style chrome or infer tone from colours.

### 6. What an agent may change

1. Free: Title slide notes and Voice script, a Scene, a Slide folder, a templated Episode, a §7 promotion.
2. Only a new ADR: a tier, module, second container, route beyond §4.2, shared Slide shape, text or style home.
3. Presentation configuration and the clock boundary follow `docs/adr/0022-slide-presentation-and-transition-clock.md`; the rest here stays binding.

### 7. Where reuse goes

1. By kind:

| Kind               | Home                   |
| ------------------ | ---------------------- |
| Slide, as-is       | Slide pool             |
| Slide to adapt     | Slide library, `cp -r` |
| part               | `slide-shared/`        |
| interactive visual | Explorable explanation |

## Do's and Don'ts

### Do's

1. **DO** start from this map, then open the record that owns the concern. (Decision 1)
2. **DO** run `npm run registry` after adding an Episode (copy `episode-template/`, add metadata) or editing a folder, Playlist, text or Voice script. (Decision 3, Decision 4)
3. **DO** add a Slide as one folder, one import and one list entry in its Section's `sections/<section-slug>.ts`. (Decision 3, design-ADR-0008)
4. **DO** promote a part a second Slide needs to `slide-shared/`, a Slide several Episodes show as-is to the Slide pool, imported via `@/`. (Decision 3, Decision 7)
5. **DO** put Slide text in its folder's `i18n/`, Slide CSS in its own module. (Decision 5)
6. **DO** keep interactivity in the smallest `*.client.tsx` leaf. (Decision 5)
7. **DO** keep presentation types in the Slide master, page mechanics in the container, plain inputs to the clock. (Decision 3, Decision 6)
8. **DO** publish geometry-driven tone through the container's single presentation adapter. (Decision 5)

### Don'ts

1. **DON'T** import upward, or from one Slide folder into another, a pool Slide included. (Decision 2, Decision 3)
2. **DON'T** add an Episode-local `parts/` or `client/` folder, or put a Title or section slide in the Slide pool. (Decision 3)
3. **DON'T** render Slide anchors or headings outside the container, or reach page chrome from anywhere but page assembly or the container. (Decisions 3 and 4)
4. **DON'T** put an Episode's text in another owner's Translation files. (Decision 5)
5. **DON'T** style a Slide from `globals.css` or the Episode stylesheet. (Decision 5)
6. **DON'T** add a tier, module or Slide schema beyond the approved presentation boundary without a new ADR. (Decision 6)
7. **DON'T** restyle chrome from a Scene or infer semantic tone from computed colours. (Decision 5)
8. **DON'T** let shared measurement import Episode records or Title policy. (Decision 3)
9. **DON'T** list a page via `compositionOf(ref)`; read `summaryOf(ref)`. (Decision 4)

## Consequences

**Positive:**

1. **Entry point:** one map.
2. **No overlap:** one rule owner.
3. **Stable names:** outlive function renames.
4. **Slides travel:** copyable folders.

**Negative:**

1. **Two reads:** map plus owner.
2. **One more command:** text or Playlist edits need `npm run registry`.
3. **Restatement:** owner rules recur here.
4. **A pool fix travels:** a pool Slide change reaches every Episode that composes it; copy it out first to differ.

**Risks:**

1. **Map drifts from the tree.** **Mitigation:** `files:` globs fail when folders move; reviewers update this map with a new module.
2. **Summary contradicts its owner.** **Mitigation:** Decision 1 makes the owner win; review fixes the map.

## Compliance and Enforcement

1. **Dependency rules** (`npm run lint:boundaries`, pre-commit and CI) hold tier direction, Slide-folder and shared reach, the Section → pool Slide edge and its alias, no pool section slide, page chrome reached only from page assembly or the container, no Episode or listing route reaching the registry.
2. **Lint** holds the `'use client'` classifier; **types** hold the record, registry and per-Slide text; **unit and post-build tests** hold anchors, folder names, every pool Slide's folder checks, slot order, current routes and summaries.

**Manual review:** approved module/tier/text/style homes; per-Episode bundles (route bundle stats); presentation config governs mechanics, never Scene layout; domain-free measurement; one geometry-driven tone adapter; server defaults and leaf clients.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Presentation boundary and approval](../../docs/adr/0022-slide-presentation-and-transition-clock.md).
- [`GLOSSARY.md`](../../GLOSSARY.md) — Episode, Slide, Scene, Page chrome.
- [Source tree](../../docs/adr/0017-source-tree-follows-the-product.md).
- [Self-contained Slide](../../docs/adr/0001-the-slide-is-a-self-contained-folder.md).
- [Episode authoring](../../docs/features/episode-migration.md).
- [Section modules](../../docs/adr/0008-pipeline-jobs-belong-to-stages.md).
- [Content model and routes](../../docs/adr/0016-content-data-model.md).
- [Shared magnetic ink](../../docs/adr/0022-magnetic-ink-is-a-shared-action-effect.md).
