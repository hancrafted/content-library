---
type: adr
id: FE-002
title: 'Episode Page'
domain: frontend
rules: false
# prettier-ignore
files: ['src/components/{episode-page,slide-master,episodes,table-of-contents}/**', 'src/app/**/episode/**', 'src/lib/speaking-time.pure*']
# prettier-ignore
paths: ['src/components/{episode-page,slide-master,episodes,table-of-contents}/**', 'src/app/**/episode/**', 'src/lib/speaking-time.pure*']
description: 'How an Episode page is built: the Slide is the unit, composed into Sections by a typed record and rendered by one container; Canvas is free JSX, position sets headings, strings and anchors keyed by Slide slug, reading time counted from the Voice script, Episode CSS scoped to its page.'
---

# Episode Page

## Context

Episode = one page: Title slide, then Sections, each a list of Slides whose first, the section slide, names it, beside a table of contents. Every Episode shares this shape, and the Markdown manuscript shares its H1/H2/H3 spine, so a later pipeline can map one onto the other.

**Structure is schema, content is not.** A prototype forced each slide through a typed interface; the agent bent visuals to fit and they degraded. Visualisations need freedom no schema anticipates. One level up it flips: title, Sections, anchors, reading time and table of contents are identical for every Episode, and drift there breaks navigation, translation and the manuscript mapping.

**The Slide is the unit.** A Slide's identity once sat in four hand-kept places (context key, translation path, anchor, record slug) and drifted. Now a Slide file writes its slug once; the rest follows by type or by position:

```
slug 'the-lost-middle', second Slide of Section 'attention'
  → keys    episodes.x.slides.the-lost-middle.*
  → anchor  attention--the-lost-middle
  → heading h3
```

**Reading time is counted, not written.** A hand-written minute count beside a Voice script drifted from it, per locale. Counting the script's words (German reads slower) keeps one source; a Slide without a script shows no time rather than a guess.

**How it fits.**

```mermaid
flowchart LR
  subgraph build["Build time: props"]
    S["Slide files<br/>slug, notes, segments, Canvas"] --> R["Episode record<br/>Sections of Slides"]
    R --> C[EpisodePageContainer]
    K[Translation file] --> C
    C -->|"content(kit)"| W[Slide wrappers]
  end
  subgraph run["Runtime: useActiveSlide"]
    O[Slide observer] -->|reportReading| U[URL state]
  end
  O -.->|observes| W
  C -->|sections| TOC[Table of contents]
  C -->|"notes, Voice script"| CD[Context drawer]
  C -->|youtubeId| TP[Talk player]
  U -->|useActiveSlide| TOC
  U -->|useActiveSlide| CD
  U -->|useActiveSlide| TP
  W -->|"context reference click"| CD
  CD -->|"note hover lights [data-target] in the Slide"| W
```

**The kit** gives a Slide `t` (whose `t.rich` knows `em`, `b`, `code`), `template`, `ref`, `target`, `slideHref`, `locale` and `Title`.

**Reference implementation: `src/components/episodes/page-template/`** is the minimal copy source; `slide-layouts/` shows every Slide layout rendered. How to write a Slide lives there and in the agent docs, not here.

## Decision

### 1. One container renders every Episode

1. Only `EpisodePageContainer` MAY emit an Episode's slots, Title slide, Sections, anchors, table of contents, drawer input.

### 2. The Slide is the unit

1. Each Slide MUST be one file `slides/<slide>.tsx`: slug, notes, Voice script segments, Canvas. The Episode file only composes.
2. A Section MUST be a list of Slides, the first naming it. Anchors by position: `<section>--<slide>`; slugs kebab-case, unique, never `top`.
3. An untitled Slide renders unlisted, still timed; only a titled one opens a Section.
4. Reading time MUST be counted from Voice script words per locale; nothing declares minutes. 0 shows none.

### 3. Canvas is free

1. A Canvas MUST be free JSX; no slide-type union, renderer or schema.
2. The Canvas MUST reach the record only via its typed kit. Never cast.
3. Browser code MUST live in `episodes/<ep>/client/`; Slide files stay server.
4. Parts several Slides share MUST live in `episodes/<ep>/canvas/`: plain props, no kit, no Slide import.

### 4. Headings mirror the manuscript

1. One `h1` MUST exist: the Episode title. Position sets `h2` section slide, `h3` page slide via the kit's `Title`.
2. No Episode file MAY write `h1`–`h3`.

### 5. Strings and anchors keyed by Slide slug

1. Translation keys MUST be flat by Slide slug — `episodes.x.slides.intro.title`, not `…sections.0.title`. Every locale in one change.
2. Published anchors MUST stay, snapshotted in `published-anchors.json`; remove one only deliberately.

### 6. Table of contents and Context drawer read the record

1. Both MUST take Slide data from the record, the active Slide from `useActiveSlide()`, never the DOM.

### 7. Episode styling stays in the Episode

1. `globals.css` MUST change only for a token two Episodes share.
2. Episode CSS MUST sit in its `canvas/`, every selector under `[data-episode='<slug>']`.
3. Shared meanings (machine, human, AI, primary, secondary) MUST use site tokens; any other colour needs a light and a dark value.

## Do's and Don'ts

### Do's

1. **DO** start an Episode by copying the `page-template/` folder, in this order: rename the slug; register it in `EPISODE_SLUGS` and the Episode registry; write its Translation keys, en and de, before any Slide file (the types derive from them); then the Slide files; then `published-anchors.json`. (Decision 2, Decision 5)
2. **DO** write a Voice script for every Slide the speaker talks over; its words are the reading time. (Decision 2)
3. **DO** leave `title` off a purely visual Slide. (Decision 2)
4. **DO** build a one-off Canvas from `SlideFrame` and the kit's `<Title>`. (Decision 3, Decision 4)
5. **DO** mark the element a note explains with `{...target('chart')}`. (Decision 3)
6. **DO** link another Slide with `slideHref('the-lost-middle')`, and pass a shared part its strings — `<Statement>{t('statement')}</Statement>`. (Decision 3)
7. **DO** colour a machine/human/AI meaning with `text-machine`, `text-human`, `text-ai`; check every Slide in both themes. (Decision 7)

### Don'ts

1. **DON'T** render the table of contents, set an anchor `id` or add a route for one Episode. (Decision 1)
2. **DON'T** add a slide-type union or a renderer picking markup from data. (Decision 3)
3. **DON'T** cast a key to make `t`, `ref` or `target` compile. (Decision 3)
4. **DON'T** write `<h2>` in an Episode file. (Decision 4)
5. **DON'T** rename or drop a published slug — it is a shared link. (Decision 2, Decision 5)
6. **DON'T** read a Slide's title, reading time or id from the DOM. (Decision 6)
7. **DON'T** write minutes or segment times by hand — `minutes: { en: 2, de: 2 }`, `from: 0, to: 2`. (Decision 2)
8. **DON'T** hand the kit to a `canvas/` part, or import a Slide from `canvas/`. (Decision 3)
9. **DON'T** add an Episode selector to `globals.css` or a colour with no dark value. (Decision 7)

## Consequences

**Positive:**

1. **Structure right while drafting:** most rules hold by construction or fail in the editor.
2. **Slug written once:** keys, anchor, heading level and kit names follow from it.
3. **One-place change:** a container change reaches every Episode.
4. **Manuscript-ready:** fixed spine and stable slugs let a pipeline target the record without touching design.

**Negative:**

1. **Reading time is only as good as the Voice script:** a short or missing script understates it; a fixed words-per-minute rate ignores pauses and demos.
2. **Many small files:** an Episode is a folder of Slide files, not one page file.
3. **No colour lint:** a raw colour without a dark value is caught only by looking at both themes.

**Risks:**

1. **Structure breaks only visible after build** (duplicate ids, heading order). **Mitigation:** post-build test over every exported Episode, run in CI on every pull request.
2. **A published anchor lost by a rename.** **Mitigation:** the snapshot test names it.
3. **Episode CSS leaking into another page.** **Mitigation:** every selector under `[data-episode]`; reviewer duty.

## Compliance and Enforcement

1. **Types:** record, registry, kit and Translation files typed; a missing locale, unregistered slug, foreign key, undeclared note or untitled Section opener fails `tsc`.
2. **Unit tests:** anchor derivation — `top` reserved, duplicate slugs rejected, untitled Slides counted but unlisted; reading time from words, 0 hidden; published anchors still produced, and a missing snapshot prints the file to paste.
3. **Lint and dependency rules:** Episode files can't write `h1`–`h3`, carry `'use client'` outside `client/`, render the table of contents or import the container; `canvas/` never imports a Slide; the per-function line cap is off only in `slides/` and `canvas/` (a Canvas is one long expression; complexity and file caps hold, `client/` keeps every cap).
4. **Post-build test:** every Episode in every locale — slot order, one `h1`, heading level by position, every note target resolves in its Slide, no duplicate ids.

**Manual review duties:** no part reads Slide data from the DOM; a Slide file declares only its own names; a `canvas/` part takes plain props; Episode CSS is scoped; every Slide looks right in light and dark (screenshots, then a browser).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md#episode-structure) — Episode structure: Section, Slide, Canvas, Slide master, Slide layout, Voice script.
- [`docs/agents/episode-translation-keys.md`](../../docs/agents/episode-translation-keys.md) — key roles, worked examples.
- [`docs/agents/episode-migration.md`](../../docs/agents/episode-migration.md) — converting a prototype into an Episode, step by step.
- [`docs/agents/episode-page-layout.md`](../../docs/agents/episode-page-layout.md) — table of contents placement, corner allocation, reserved places.
