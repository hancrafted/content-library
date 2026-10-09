---
type: adr
id: FE-002
title: 'Episode Page'
domain: frontend
rules: false
files: ['src/components/episode*/**', 'src/components/table-of-contents/**', 'src/app/**/episode/**']
paths: ['src/components/episode*/**', 'src/components/table-of-contents/**', 'src/app/**/episode/**']
description: 'How an Episode page is built: structure is a typed record rendered by one container, Slide content is free JSX, headings mirror the manuscript, strings keyed by slug.'
---

# Episode Page

## Context

Episode = one page: Title slide, then Sections, each a section slide plus page Slides, beside a table of contents. Every Episode shares this shape, and the Markdown manuscript shares its H1/H2/H3 spine, so a later pipeline can map one onto the other.

**Structure is schema, content is not.** A prototype forced each slide through a typed interface; the agent bent visuals to fit and they degraded. Visualisations need freedom no schema anticipates. One level up it flips: title, Sections, anchors, reading times and table of contents are identical for every Episode, and drift there breaks navigation, translation and the manuscript mapping.

So: typed record for structure, rendered by one container; free JSX for each Slide.

**How it fits.** Each Slide is declared once, in the record; every page part reads it from there.

```
episodes/<slug>/  → Episode record (Sections → Slides: slug, title, minutes, notes)
      ↓ registered by slug (typed: no record without slug, no slug without record)
container         → Title slide, Section wrappers, anchors
      ↓ same record
consumers         → table of contents, Context drawer, URL state
```

**Reference implementation: `src/components/episodes/page-template/`** — copy it to start an Episode. How a Slide is written (layouts, context notes, catalog keys) lives there, not here.

## Decision

### 1. One container renders every Episode

1. Only `EpisodePageContainer` MAY emit an Episode's slots, Title slide, Section wrappers, anchors and table of contents — all derived from the record. Page files never write them, so table of contents and Slides can't drift.

### 2. The record

1. Each Episode MUST be one folder `src/components/episodes/<slug>/` exporting an `Episode` record, registered by slug.
2. The record MUST be the only place Slide metadata is declared: stable kebab-case slug (`what-is-context`, never `top`, reserved for the Title slide), optional title, minutes per locale.
3. Title and minutes are a capability: an untitled Slide renders, isn't listed, still counts its minutes.

### 3. Slide content is free

1. A Slide's content MUST be free JSX from the Slide master and layouts; no slide-type union, renderer or schema between it and its markup.

### 4. Headings mirror the manuscript

1. Exactly one `h1` MUST exist: the Episode title, on the Title slide. `h2` a section slide, `h3` a page slide; `h4`+ free.
2. Episode files MUST NOT write `h1`–`h3` themselves; the container and layouts do.

### 5. Strings keyed by slug

1. Episode strings MUST be keyed by slug, never position — `episodes.x.sections.intro.title`, not `episodes.x.sections.0.title`. Every locale in one change.

### 6. Consumers read the record

1. Table of contents, Context drawer and any later consumer MUST take Slide data from the record and the active Slide from URL state — never from the DOM.

## Do's and Don'ts

### Do's

1. **DO** start an Episode from `page-template/`: copy the folder, register its slug. (Decision 2)
2. **DO** set minutes per locale — German narration runs longer. (Decision 2)
3. **DO** leave `title` off a purely visual Slide. (Decision 2)
4. **DO** build one-off slides with `SlideFrame` and `<SlideTitle as="h3">`. (Decision 3, Decision 4)

### Don'ts

1. **DON'T** render the table of contents, set an anchor `id` or add a route for one Episode. (Decision 1)
2. **DON'T** add a slide-type union or a renderer picking markup from data. (Decision 3)
3. **DON'T** write `<h2>` in an Episode file. (Decision 4)
4. **DON'T** read a Slide's title, minutes or id from the DOM. (Decision 6)
5. **DON'T** rename a published slug — it is a shared link. (Decision 2, Decision 5)

## Consequences

**Positive:**

1. **Structure right while drafting:** most rules hold by construction or fail in the editor.
2. **One-place change:** a container change reaches every Episode.
3. **Manuscript-ready:** fixed spine and stable slugs let a pipeline target the record without touching design.

**Negative:**

1. **Every Episode looks structurally alike;** a different page shape needs this ADR amended.
2. **Per-locale minutes double bookkeeping** until a pipeline estimates them.

**Risks:**

1. **Structure breaks only visible after build** (duplicate ids, heading order). **Mitigation:** post-build test over every exported Episode, run in CI on every pull request.

## Compliance and Enforcement

1. **Types:** record, registry and catalogs typed; a missing locale or unregistered slug fails `tsc`.
2. **Unit tests:** anchor derivation — `top` reserved, duplicate slugs rejected, untitled Slides counted but unlisted.
3. **Lint and dependency rules:** Episode files can't write `h1`–`h3`, render the table of contents or import the container.
4. **Post-build test:** every Episode in every locale — slot order, one `h1`, heading spine, table of contents equals anchors, no duplicate ids.

**Manual review duties:** no consumer reads Slide data from the DOM; published slugs stay stable.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md) — Episode, Section, Slide, Title slide, Slide master, Slide layout.
- [`docs/agents/episode-catalog-keys.md`](../../docs/agents/episode-catalog-keys.md) — key roles, worked examples.
- [`docs/agents/episode-page-layout.md`](../../docs/agents/episode-page-layout.md) — table of contents placement, corner allocation, reserved places.
