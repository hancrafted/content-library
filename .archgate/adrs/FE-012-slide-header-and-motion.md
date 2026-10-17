---
type: adr
id: FE-012
title: 'Slide Header and Motion'
domain: frontend
rules: false
# prettier-ignore
files: ['src/components/{episodes,episode-page,slide-master}/**', 'src/lib/{slide-zone,typewriter}.pure*.ts', 'src/app/globals.css']
# prettier-ignore
paths: ['src/components/{episodes,episode-page,slide-master}/**', 'src/lib/{slide-zone,typewriter}.pure*.ts', 'src/app/globals.css']
description: 'Every titled Slide opens with a shared Slide header — a computed Eyebrow, the title, the caption — that the Slide wrapper renders above the Scene and types in once; the Scene fades up once and carries no entrance of its own; hover emphasis comes from one shared BEM vocabulary; an Episode record may opt out with header authored.'
---

# Slide Header and Motion

## Context

A Slide wrapper and its Scene split mechanics from creativity (FE-009). Scenes that each author their own kicker, title and caption drift in size, spacing and wording, and an audience reads a talk faster when every Slide opens the same way. So the header is shared: the **Eyebrow** (the Section's title and `n / N`), the title at its position's level, and the caption close under it. The Eyebrow is computed from the Section titles the table of contents shows, so it can't drift from them.

**Why the entrance plays once.** A replay on every return turns scrolling back to re-read into waiting, and a server-rendered Scene that zone keyframes hide and play in again flashes on load. The entrance — the header typing in, the Scene fading up — runs the first time a Slide is active, then stays done for the page's life in the zone store (FE-001: transient, in memory). It hides a Slide only under the `js` class, set in `<head>` before first paint, so without JavaScript, in print and under reduced motion every Slide shows at once. A per-element entrance inside a Scene would play under the shared one.

**Why a typewriter in CSS.** The characters are split on the server and timed by a seeded jitter, so the pace is irregular like a person typing yet stable across loads, and no client component runs for the header. Another entrance is another keyframe set over the same spans.

**Why a hover vocabulary.** The presenter points with the mouse; a few shared emphasis patterns, each mirrored on keyboard focus, teach the audience what a hover means across Episodes.

Rejected: a per-Slide header prop (no Slide has needed a different one yet); a GSAP or client-side typewriter (a client leaf per Slide for text that is static); replaying the entrance on return (waiting on re-read).

## Decision

### 1. One shared header

1. The Slide wrapper MUST render `SlideHeader` (composing `SlideEyebrow`) above the Scene for every titled Slide; the container supplies its data.
2. The Eyebrow MUST be computed from the table of contents' Sections: the Section title and the Slide's place among its titled page Slides. Section slides and the Title slide have none.
3. Type comes from tokens: Eyebrow `caption`, uppercase, muted; title its level's role; caption `body`, muted, `mt-2`, `max-w-[70%]` from `md`.
4. On the shared header a Scene MUST NOT render the title or caption; the kit's `Title` throws there.
5. An Episode record MAY set `header: 'authored'`: its Scenes render their own header, and its Slides keep their `[data-zone]` entrances.

### 2. Entrance, once

1. The entrance MUST play once per Slide per page: `pending` until first `active`, then `entering`, then `done`, held in the zone store.
2. It MUST hide nothing without the `js` class, in print or under reduced motion.
3. The typewriter MUST be CSS over server-split spans timed by `typewriter.pure.ts`, keep the full text for assistive tech, and settle within 1.5s.
4. On the shared header a Scene MUST NOT carry an entrance of its own, per element or whole; looping or emphasis motion with a purpose stays (FE-009 §6).

### 3. Hover vocabulary

1. Scene hover and focus emphasis MUST reuse the `globals.css` classes `card-hover`, `focus-group` and `hover-reveal` with their elements and modifiers; a new pattern is added there and to the design-system catalogue first.
2. Every pattern MUST also apply on `:focus-visible` or `:focus-within` and drop its transition under reduced motion.

## Do's and Don'ts

### Do's

1. **DO** give a Slide `title` and `caption` in its own Translation file and let the wrapper render them. (Decision 1)
2. **DO** keep a Scene to its visual: `SlideFrame` with the picture, no heading. (Decision 1)
3. **DO** pick `entrance: 'fade'` or `'none'` on the record when typing does not suit the Episode. (Decision 2)
4. **DO** reach for `card-hover--raise`, `focus-group--dim-others` or `hover-reveal__detail` for hover emphasis. (Decision 3)

### Don'ts

1. **DON'T** write `<Title>`, a kicker or a caption in a Scene on the shared header. (Decision 1)
2. **DON'T** author an Eyebrow; it is computed. (Decision 1)
3. **DON'T** stagger, draw on or fade in a Scene's elements on entry on the shared header. (Decision 2)
4. **DON'T** hide content outside `.js` or in print. (Decision 2)
5. **DON'T** invent a one-Scene hover pattern a second Scene could use. (Decision 3)

## Consequences

**Positive:**

1. **One opening per Slide:** every Slide reads Eyebrow, title, caption, then its visual.
2. **No flash, no replay:** a Slide enters once, from hidden only when JavaScript will reveal it.
3. **Lighter Scenes:** no heading markup and no entrance code per Slide.

**Negative:**

1. **A pending Slide is blank until active:** with JavaScript, the top of the next Slide shows empty while the current one is read.
2. **Typed headers weigh more:** one span per character in the static HTML.
3. **Two header modes:** an Episode with `header: 'authored'` keeps each Scene's own header and entrances.

**Risks:**

1. **A Slide stays hidden if the observer never reports it.** **Mitigation:** only `.js` hides; a browser check counts `data-entry` values after load.
2. **Scenes keep their own headers by habit.** **Mitigation:** the kit's `Title` throws on the shared header, failing the build.

## Compliance and Enforcement

1. **Types:** the record's `header`, `entrance` and `title` fields.
2. **Unit tests:** the entrance's states in the zone store; the seeded jitter (deterministic, uneven, normalised, within budget); the Eyebrow's count; the header text by default and none on `header: 'authored'`; the kit's `Title` refused on the shared header; wrapper and mount contracts.
3. **Post-build test:** reader text per Episode counts the typed header once.
4. **Browser check:** `visual-check` after load: the Title slide `data-entry="done"`, Slides below the fold `pending`, the caption 70% of the Foreground from `md`, a section slide at least `40svh`.

**Manual review duties:** no entrance in a Scene on the shared header (§2.4); hover emphasis uses the shared classes (§3).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [FE-009](FE-009-slide-wrapper-and-scene.md) — the Slide wrapper and Scene this header sits between.
- [`GLOSSARY.md`](../../GLOSSARY.md) — Slide header, Eyebrow.
- [`docs/design/design-system.md`](../../docs/design/design-system.md) — header typography, the entrance, the hover catalogue.
