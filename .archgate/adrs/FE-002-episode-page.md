---
type: adr
id: FE-002
title: 'Episode Page'
domain: frontend
rules: false
# prettier-ignore
files: ['src/components/episodes/**', 'src/components/episode/**', 'src/components/pages/episode-page.tsx', 'src/app/**/episode/**', 'src/lib/routes.ts', 'src/lib/episode.pure.ts', 'src/messages/*.json', 'tests/post-build/episode-structure.build.test.ts', 'eslint.config.mjs', '.dependency-cruiser.cjs']
# prettier-ignore
paths: ['src/components/episodes/**', 'src/components/episode/**', 'src/components/pages/episode-page.tsx', 'src/app/**/episode/**', 'src/lib/routes.ts', 'src/lib/episode.pure.ts', 'src/messages/*.json', 'tests/post-build/episode-structure.build.test.ts', 'eslint.config.mjs', '.dependency-cruiser.cjs']
description: 'The authoring floor for an Episode page: a typed Episode record rendered only by EpisodePageContainer, headings mirroring the manuscript, free slide content, keyed strings, and the table of contents consumed through the container.'
---

# Episode Page

## Context

An Episode is one page: a Title slide, then its Sections, each a section slide followed by zero or more page Slides, stacked vertically beside the Episode's table of contents. Every Episode is built the same way, and the manuscript (Markdown, not yet in the repo) shares its H1/H2/H3 spine with the page, so a future pipeline can map one onto the other.

**Why structure is schema and content is not.** A prior prototype forced each slide through a per-slide type interface. The agent then bent its visual design to fit the schema, and the visualisations degraded. A visualisation needs creative freedom a schema cannot anticipate. One level up the case reverses: how an Episode is put together (title, Sections, Slides, anchors, reading times, the table of contents) is the same for every Episode, and drift there breaks navigation, translation and the manuscript mapping. So the Episode's _structure_ is a typed record rendered by one container, and each Slide's _content_ is free JSX.

A page file never writes slots or anchors, so the table of contents (which reads the same anchors) cannot drift from the slides. Reading time is per locale because German narration runs longer; it lives beside the slug until a manuscript pipeline supplies it. A schema for the Slide master's basic structures is a separate, later decision. The catalog's role vocabulary and worked examples live in [`docs/agents/episode-catalog-keys.md`](../../docs/agents/episode-catalog-keys.md).

**Out of scope, with a reserved place (Decision 7):** the Episode's video, back-to-top and corner allocation ([#6](https://github.com/hancrafted/content-library/issues/6)); arrow-key navigation. Speaker notes and voice script: [FE-010](./FE-010-context-drawer.md). **Elsewhere:** URL and fragment stability ([#7](https://github.com/hancrafted/content-library/issues/7)); table-of-contents internals and motion (code comments); locale routing ([FE-003](./FE-003-localization.md)); the client boundary ([FE-006](./FE-006-server-client-boundary.md)).

## Decision

### 1. One container renders every Episode

1. Only `EpisodePageContainer` MAY emit an Episode's slots (`episode-page` > `toc`, `slides`, `context`), Title slide, `section[data-section]` wrappers, anchors (`id`, `data-slide`) and table of contents, all derived from one record via `src/lib/episode.pure.ts`.

### 2. The Episode record

1. Each Episode MUST be `src/components/episodes/<slug>/` exporting an `Episode` record, listed in its `registry.ts` and `EPISODE_SLUGS`, served via `EpisodePage` (FE-007 §1).
2. Every Section and Slide MUST carry a stable kebab-case `slug`, a plain `title` and `minutes: PerLocale<number>`.

### 3. Slide content is free

1. A Slide's `content` MUST be free JSX from the Slide master and Slide layouts; no slide-type union, renderer or content schema MAY sit between a Slide and its markup.

### 4. Headings mirror the manuscript

1. `h1` MUST be the Title slide's Episode title, `h2` only a section slide's title, `h3` only a page slide's title; `h4`+ are free.
2. `src/components/episodes/**` MUST NOT write raw `h1`–`h3` or `SlideTitle as="h1"|"h2"`.

### 5. Every string is a keyed leaf

1. Episode strings MUST be keyed `episodes.<episode>.<role>` (Title slide and page metadata) or `episodes.<episode>.sections.<section>[.slides.<slide>…].<role>`, by slug, never position; leaves only; variable text via ICU, never concatenated; in every catalog in the same change.

### 6. The table of contents is consumed through the container

1. It MUST receive only serializable, pre-translated props and sit sticky in the left column from `md`, in the pill-opened drawer below; the Title slide gets no entry.

### 7. Reserved places

1. Speaker notes and voice script attach per Slide (`notes`, `voiceScript`), see FE-010; YouTube link per Episode and locale, on the Title slide, loaded only on play; arrow keys and back-to-top are the container's; corners: TOC pill bottom-left, drawer trigger bottom-right, back-to-top above it, player top-right.

## Do's and Don'ts

### Do's

1. **DO** start an Episode as `src/components/episodes/<slug>/<slug>.tsx` exporting an `Episode` record, plus a registry line, an `EPISODE_SLUGS` entry and a `description` key per locale for its page metadata ([FE-008](./FE-008-page-metadata.md)). (Decision 2)
2. **DO** give each Slide a function returning its record, with free JSX in `content`. (Decision 2, Decision 3)
3. **DO** set `minutes` per locale, from your speaking pace on each manuscript. (Decision 2)
4. **DO** build slides from the Slide master and Slide layouts, or one-off with `SlideFrame` and `<SlideTitle as="h3">`. (Decision 3, Decision 4)
5. **DO** add every new key to `en.json` and `de.json` together. (Decision 5)

### Don'ts

1. **DON'T** render `TableOfContents`, set an `id`/`data-slide`, or add a route file for one Episode. (Decision 1, Decision 2, Decision 6)
2. **DON'T** introduce a slide-type union or a renderer that picks markup from data. (Decision 3)
3. **DON'T** write raw `h1`–`h3` or `SlideTitle as="h1"|"h2"` in an Episode. (Decision 4)
4. **DON'T** key a string by position (`0`, `first`) or heading level (`h2`). (Decision 5)
5. **DON'T** embed a YouTube iframe or URL that loads with the page. (Decision 7)

## Consequences

**Positive:**

1. **Structure is right while drafting:** most rules hold by construction or show up in the editor during `npm run dev`, before any build.
2. **One-place change:** a layout or table-of-contents change in the container reaches every Episode.
3. **Manuscript-ready:** the H1/H2/H3 spine and stable slugs let a manuscript pipeline target the record without touching design.

**Negative:**

1. **Every Episode looks structurally alike** by design; an Episode wanting a different page shape needs this ADR amended.
2. **Per-locale minutes double the bookkeeping** until a pipeline estimates them.
3. **Placement is not machine-checked:** the HTML shows order, not that the table of contents sits left and sticky.

**Risks:**

1. **Reserved fields rot unused.** **Mitigation:** #6 and the manuscript pipeline are their first consumers; drop a field rather than guess its shape.
2. **The post-build net runs only after `npm run build`.** **Mitigation:** CI runs it on every pull request; layers 1–3 below catch most breaks earlier.

## Compliance and Enforcement

**Enforcers, earliest first:**

1. **Types** (`tsc`, editor and `next dev`): `Episode` in `src/components/episode/episode-page-container.pure.ts` types the record; `PerLocale` fails a missing locale; the registry is typed against `EPISODE_SLUGS` in `src/lib/routes.ts`; `de.json` is typed against `en.json`. §2, §5.
2. **Derivation** (`npm run verify`): `src/components/episode/episode-page-container.test.ts` checks table-of-contents entries derive from the anchors, in the page's locale, and reject duplicate slugs. §1.
3. **Lint** (`eslint.config.mjs`): `no-restricted-syntax` over `src/components/episodes/**` refuses raw `h1`–`h3` and `SlideTitle as` `h1`/`h2` (string, braced or template literal; a variable level is left to layer 4). `.dependency-cruiser.cjs`: `toc-reached-only-from-container` (from `src/components/episodes/**`, `src/components/episode/**`), `episodes-reach-only-slide-parts` and `episodes-never-render-the-shell` (no Title slide or container import in an Episode). The registry type makes each key equal its record's `slug`. §1, §3, §4.2.
4. **Post-build** (`npm run test:build`, CI): `tests/post-build/episode-structure.build.test.ts` reads every exported Episode in every locale with `cheerio`: slots in order; Title slide first with the only `h1`; one `h2` per section slide, one `h3` per page slide, none elsewhere; table-of-contents links equal the slide anchors in order; no duplicate `id`; no YouTube iframe or URL; anchors identical across locales. §1, §4.1, §7.

**Measured:** probe files in the Episode folder and `src/components/` fired every lint and dependency-cruiser rule above, including `as={'h1'}` and ``as={`h2`}``, while `<SlideTitle as="h3">` and `h4` passed; a registry key differing from its record's slug failed `tsc`; the post-build test found a real duplicate `id` in the table of contents on its first run.

**Manual review duties:** placement at `md` and below (§6); reserved places stay as §7 allocates them; slugs stay stable once published.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md) — Episode, Section, Slide, Title slide, Slide master, Slide layout, Speaker notes, Voice script, Table of contents.
- [FE-003 Localization](./FE-003-localization.md), [FE-005 Static Export Contract](./FE-005-static-export-contract.md), [FE-006 Server/Client Boundary](./FE-006-server-client-boundary.md), [FE-010 Context Drawer](./FE-010-context-drawer.md), [ARCH-001 Dependency Admission Bar](./ARCH-001-dependency-admission-bar.md) (`cheerio`: 30.5k stars, 100+ contributors, 33M weekly downloads, pushed 2026-10-08).
- [cheerio](https://cheerio.js.org/) — parses with `parse5`, the spec parser browsers follow.
