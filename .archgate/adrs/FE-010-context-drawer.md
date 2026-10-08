---
type: adr
id: FE-010
title: 'Context Drawer'
domain: frontend
rules: true
files: ['src/components/context-drawer/**/*', 'src/app/globals.css']
# prettier-ignore
paths: ['src/components/context-drawer/**', 'src/components/episode/**', 'src/components/episodes/**', 'src/hooks/use-context-drawer.ts', 'src/hooks/use-table-of-contents.ts', 'src/lib/context-drawer.pure.ts', 'src/lib/context-drawer.pure.test.ts', 'src/lib/episode.pure.ts', 'src/lib/episode.test.ts', '.archgate/adrs/FE-010-context-drawer.rules.ts', 'src/app/globals.css', 'src/messages/*.json', 'tests/post-build/context-drawer.build.test.ts', 'tests/post-build/episode-structure.build.test.ts', '.dependency-cruiser.cjs', 'docs/agents/episode-catalog-keys.md', 'GLOSSARY.md']
description: 'The Context drawer: a non-modal panel beside an Episode showing the current Slide Speaker notes and Voice script, both server-rendered into the page and printed in full, with the note and segment shapes typed as content and kept apart from design.'
---

# Context Drawer

## Context

The Speaker notes and Voice script of a Slide are the author's working text: what to say, where a claim comes from, how to hand over to the next Slide. A reader or presenter wants them beside the Slide, not on it. The Context drawer is that view. It is a view onto text already in the page, never a second copy of it.

**Why the text lives in the HTML.** A drawer that mounts its text on open exists only inside JavaScript: find-in-page, a PDF handout and a crawler all miss it. The notes also feed a printed handout. So the server renders every Slide's notes and script into the page, and the drawer only decides what is visible on screen. `hidden`, `display: none` and an unmounted subtree all drop text from print, so a closed drawer hides itself with `invisible` plus an off-screen transform.

**Why structure here, when FE-002 says content is free.** FE-002 §3 keeps Slide markup free because a schema made visualisations bend to it. A note or a segment is different: it is text with a fixed role, the same on every Slide, and a drawer, a handout and later a guided tour all read it. So content may be typed and keyed. Design may not. The boundary of FE-002 §3 and FE-007 §4 stays where it was.

**Details.** `Alt+N` matches `event.code`. The drawer is a right panel from `md` and a bottom sheet below, by CSS alone. Notes and segments keep a kebab-case `slug` as key identity, never a position. Print overrides a `hidden` class but not a `hidden` attribute.

**Out of scope:**

- **Guided tour:** designed for, not built. There are no finished Episode pages to tour yet. The `target` pairing is the hook, as in Shepherd's `attachTo`: walking the note items in order and resolving each target is the tour.
- **PDF export:** not built here. This ADR only keeps it possible, by printing notes and script in full.
- **Live annotation:** it implies an editable content layer, which is to be decided on purpose, not by drift.
- **axe coverage:** a separate accessibility-testing decision.
- **Slide internals:** they stay ungoverned.

## Decision

### 1. Non-modal (📜 Rule: `drawer-is-non-modal`)

1. The drawer MUST be a non-modal region: no `showModal(` or `aria-modal` under `src/components/context-drawer/`.

### 2. In the DOM, printed in full (📜 Rule: `print-reveals-context`)

1. The server MUST render every Slide's notes and script into one `data-slot="context"` slot in page order, entries tagged `data-context-for`.
2. A closed drawer MUST hide with `invisible` plus a transform, never the `hidden` attribute, `display: none` or `inert`. Inactive tab panels MAY use the `hidden` class.
3. `globals.css` MUST hold an `@media print` block setting `[data-slot='context']` to `display: block`.

### 3. Per Slide

1. The drawer shows the Slide at the reading line, via the table of contents' observer.

### 4. Schema boundary: content typed, design never

1. A **speaker note item**: `header`, `description`, optional `sources`, optional `image` (`src`, `alt`), required `target`, the element of its Slide it explains (a whole-Slide note targets the title).
2. A **voice script segment**: `from`, `to` (minutes), `title`, `keywords`, `script`, optional `bridge` into the next Section.
3. Both MAY be typed and keyed; neither MAY carry layout, style or markup.

### 5. Targets

1. A layout given `anchor` MUST emit ids `<slide anchor>--<element>`. A `target` is the element name and MUST resolve to one id inside its own Slide.

### 6. Interaction

1. `Alt+N` toggles, Escape closes; the trigger shows the hint and `aria-keyshortcuts`. Focus enters on open, returns on close.

### 7. Layering

1. The drawer MUST be a `*.client.tsx` leaf in `src/components/context-drawer/`, reached only from `EpisodePageContainer`.

### 8. Strings

1. Keys `...slides.<slide>.notes.<note>.{header,description,image.alt}` and `...voiceScript.segments.<segment>.{title,keywords,script,bridge}`; chrome under `contextDrawer.*`; en and de together. Non-localized facts stay in the record. A source renders as selectable text, never an `href`.

## Do's and Don'ts

### Do's

1. **DO** keep the drawer a non-modal region. (Decision 1, 📜 Rule: `drawer-is-non-modal`)
2. **DO** keep the `@media print` block for `[data-slot='context']` in `globals.css`. (Decision 2, 📜 Rule: `print-reveals-context`)
3. **DO** hide a closed drawer with `invisible` and a transform. (Decision 2)
4. **DO** give every note a `target` and pass `anchor` to the layout that holds it. (Decision 4, Decision 5)
5. **DO** write German notes from the same facts, not as translations. (Decision 8)

### Don'ts

1. **DON'T** call `showModal(` or set `aria-modal` in the drawer. (Decision 1)
2. **DON'T** put the `hidden` attribute, `display: none` or `inert` on the context slot. (Decision 2)
3. **DON'T** add a layout, style or placement field to a note or segment. (Decision 4)
4. **DON'T** render the drawer from an Episode file. (Decision 7)
5. **DON'T** write an `href` for a source. (Decision 8)

## Consequences

**Positive:**

1. **Handout-safe:** notes and script are in the static HTML, selectable and printed in full whether or not the drawer ever opened. A closed or inactive panel is not reachable by browser find-in-page, since `invisible` and `hidden` content is skipped; `hidden=until-found` is not used.
2. **Tour-ready:** every note already names its element, so a tour needs no migration.
3. **No new dependency:** native elements plus one small client leaf.

**Negative:**

1. **Sources are not links.** FE-003's `href-via-localize-path` rule leaves external links inexpressible, so sources are selectable text until an external-link decision exists. This is a gap.
2. **`Alt+N` is untested on every assistive stack;** `aria-keyshortcuts` announces a shortcut and implements nothing.
3. **The drawer overlays rather than reflows** the Slides, and print appends notes after them in page order, not between Slides.

**Risks:**

1. **The drawer and the table of contents disagree on the current Slide.** **Mitigation:** both read one observer hook.
2. **A design field creeps into the note shape.** **Mitigation:** review duty below.

## Compliance and Enforcement

**Enforcers, earliest first:**

1. **Types** (`tsc`): note and segment types in `src/lib/context-drawer.pure.ts`; `de.json` typed against `en.json`. `tsc` does not check that a note or segment catalog key exists: the unit key-shape test and the post-build raw-key test do.
2. **Fast** (`npm run verify`): unit tests beside `src/lib/context-drawer.pure.ts` and `src/lib/episode.pure.ts`.
3. **archgate:** `FE-010-context-drawer.rules.ts`, both rules at `error`: `print-reveals-context` over `src/app/globals.css`, `drawer-is-non-modal` over `src/components/context-drawer/**`. §1, §2.
4. **dependency-cruiser** (`.dependency-cruiser.cjs`): `context-drawer-reached-only-from-container`. §7.
5. **Post-build** (`npm run test:build`): `tests/post-build/context-drawer.build.test.ts` checks the slot, notes in static HTML, no `hidden` attribute, resolving targets, locale parity, sources as text and the print block; `tests/post-build/episode-structure.build.test.ts` keeps the slot order. §2, §5, §8.

**Manual review duties:** German copy quality; `Alt+N` on real screen readers; a real print preview; focus return; no design field in the note shape; catalog key shape (`docs/agents/episode-catalog-keys.md`, `GLOSSARY.md`).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [FE-002 Episode Page](./FE-002-episode-page.md), [FE-003 Localization](./FE-003-localization.md), [FE-006 Server/Client Boundary](./FE-006-server-client-boundary.md), [FE-007 Module Layering](./FE-007-module-layering.md), [ARCH-001](./ARCH-001-dependency-admission-bar.md).
- [`GLOSSARY.md`](../../GLOSSARY.md) — Speaker note item, Voice script segment, Bridge, Context drawer.
- [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [WCAG 2.1.4](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html), [`docs/research/context-drawer-patterns.md`](../../docs/research/context-drawer-patterns.md).
