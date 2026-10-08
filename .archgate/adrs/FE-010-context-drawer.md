---
type: adr
id: FE-010
title: 'Context Drawer'
domain: frontend
rules: true
files: ['src/components/context-drawer/**/*', 'src/app/globals.css']
# prettier-ignore
paths: ['src/components/context-drawer/**', 'src/components/episode/**', 'src/components/episodes/**', 'src/hooks/use-context-*.ts', 'src/hooks/use-url-state.ts', 'src/hooks/use-table-of-contents*', 'src/components/table-of-contents/**', 'src/lib/context-drawer.pure*', 'src/lib/context-link.pure*', 'src/lib/roving-focus.pure*', 'src/i18n/catalog-strings*', 'src/lib/reading-line.pure*', 'src/lib/episode*', 'src/lib/routes*', 'src/lib/table-of-contents*', '.archgate/adrs/FE-010-context-drawer.rules.ts', 'src/app/globals.css', 'src/messages/*.json', 'tests/post-build/context-drawer.build.test.ts', 'tests/post-build/episode-structure.build.test.ts', '.dependency-cruiser.cjs', 'docs/agents/episode-catalog-keys.md', 'docs/agents/context-drawer-design.md', 'GLOSSARY.md']
description: 'The Context drawer: a non-modal floating card, side by side with or over the Slides, showing the current Slide Speaker notes and Voice script, both server-rendered into the page and printed in full, linked to the Slide by targets and context references, with the note and segment shapes typed as content and kept apart from design.'
---

# Context Drawer

## Context

The Speaker notes and Voice script of a Slide are the author's working text: what to say, where a claim comes from, how to hand over to the next Slide. A reader or presenter wants them beside the Slide, not on it. The Context drawer is that view. It is a view onto text already in the page, never a second copy of it.

**Why the text lives in the HTML.** A drawer that mounts its text on open exists only inside JavaScript: find-in-page, a PDF handout and a crawler all miss it. The notes also feed a printed handout. So the server renders every Slide's notes and script into the page, and the drawer only decides what is visible on screen. `hidden`, `display: none` and an unmounted subtree all drop text from print, so a closed drawer hides itself with `invisible` plus an off-screen transform.

**Why structure here, when FE-002 says content is free.** FE-002 §3 keeps Slide markup free because a schema made visualisations bend to it. A note or a segment is different: it is text with a fixed role, the same on every Slide, and a drawer, a handout and later a guided tour all read it. So content may be typed and keyed. Design may not. The boundary of FE-002 §3 and FE-007 §4 stays where it was.

**Why `xl`.** Side by side takes a 17rem table of contents, the card and the Slides' column; below about 1280px the Slides get too narrow, so the card overlays them. The menu is hidden there and the stored mode kept; the card never needs JavaScript to know the width.

**Why plain `[n]` markers.** A description is one catalog string, so a citation lives inside it. A bare `[1]` survives a translator, a handout and a reader without JavaScript; a pure function makes it a superscript button, checked against the note's sources. Rich-text tags would put markup in a catalog leaf.

**Why `ContextRef` is a button.** It names a note from inside Slide text, so the Slide reads in full without the drawer: an underlined phrase, no number (the only superscript is a citation marker). It is a button, not a link, because it acts on the drawer rather than navigating; the drawer listens by delegation, so the Slide stays a server component (FE-006).

**Why the drawer takes input.** It is a view, so it must not know where its text came from. Its feeding is FE-002 §6. Open state and selected tab are transient ([FE-001](./FE-001-state-management.md)): a shared link never opens someone's drawer. The layout mode is a preference ([FE-004](./FE-004-user-preference.md)).

**Details.** `Alt+N` matches `event.code`. Notes, segments and sources key on a kebab-case `slug`, never a position. Print overrides a `hidden` class, not a `hidden` attribute. Card, head, menu, disclosure and selected-state detail: [`docs/agents/context-drawer-design.md`](../../docs/agents/context-drawer-design.md).

**Out of scope:**

- **Guided tour:** designed for, not built. There are no finished Episode pages to tour yet. The `target` pairing is the hook, as in Shepherd's `attachTo`: walking the note items in order and resolving each target is the tour.
- **PDF export:** not built; full print keeps it possible.
- **Live annotation:** needs an editable content layer, to be decided on purpose.
- **axe coverage:** a separate accessibility-testing decision.

## Decision

### 1. Non-modal (📜 Rule: `drawer-is-non-modal`)

1. No `showModal(` or `aria-modal` in `src/components/context-drawer/`.

### 2. In the DOM, printed (📜 Rule: `print-reveals-context`)

1. The server MUST render all notes, scripts and sources into one `data-slot="context"` slot, entries tagged `data-context-for`.
2. A closed drawer MUST hide with `invisible` plus a transform, never `hidden`, `display: none` or `inert`.
3. `globals.css` MUST hold an `@media print` block setting `[data-slot='context']` to `display: block`.

### 3. Typed content

1. A note: `header`, `description`, optional `sources` and `image`, required `target`. A segment: `from`, `to`, `title`, `keywords`, `script`, optional `bridge`. Neither MAY carry design.
2. A description cites by `[n]` markers, each naming a source of its note.

### 4. Targets

1. A layout given `anchor` MUST emit ids `<slide anchor>--<element>`; a `target` MUST resolve to one id in its Slide.
2. A `ContextRef` wraps a phrase, shows no number, emits its note's id, is a `<button type="button">`.

### 5. Interaction

1. `Alt+N` toggles, Escape closes; focus enters on open, returns on close.
2. The drawer MUST be a `*.client.tsx` leaf in `src/components/context-drawer/`, reached only from `EpisodePageContainer` and its adapter.

### 6. Strings and links

1. Catalog keys follow `docs/agents/episode-catalog-keys.md`; chrome under `contextDrawer.*`; en and de together.
2. A source MUST be an `https` link (FE-003 §1.4) named as opening a new tab.

### 7. Card and modes

1. A floating card: one-step width, only `transform` animates; beside from `xl`, else over.
2. Layout MUST be FE-004's `drawerMode`; open state and tab stay in memory (FE-001).

### 8. Input only

1. The drawer MUST render from one `ContextDrawerInput` and import no Episode, route, table-of-contents or `next-intl` code.
2. It MUST take the active Slide from `useActiveSlide()`, never observe the viewport; a `ContextRef` finds its note by target id, not `data-slide`.

## Do's and Don'ts

### Do's

1. **DO** keep the drawer a non-modal region. (Decision 1, 📜 Rule: `drawer-is-non-modal`)
2. **DO** keep the `@media print` block for `[data-slot='context']` in `globals.css`. (Decision 2, 📜 Rule: `print-reveals-context`)
3. **DO** hide a closed drawer with `invisible` and a transform. (Decision 2)
4. **DO** give every note a `target` and pass `anchor` to the layout that holds it. (Decision 3, Decision 4)
5. **DO** write German notes from the same facts, not as translations. (Decision 6)
6. **DO** reserve the card's width in one step and animate only its `transform`. (Decision 7)
7. **DO** pass the drawer everything as `ContextDrawerInput`, built by the Episode-side adapter. (Decision 8)

### Don'ts

1. **DON'T** call `showModal(` or set `aria-modal` in the drawer. (Decision 1)
2. **DON'T** put the `hidden` attribute, `display: none` or `inert` on the context slot. (Decision 2)
3. **DON'T** add a layout, style or placement field to a note or segment. (Decision 3)
4. **DON'T** render the drawer from an Episode file. (Decision 5)
5. **DON'T** show a source as plain text, or open it without `rel="noopener noreferrer"`. (Decision 6)
6. **DON'T** transition width, grid tracks or margins for the card. (Decision 7)
7. **DON'T** read Episode, table-of-contents or catalog code from the drawer, or number a `ContextRef`. (Decision 4, Decision 8)

## Consequences

**Positive:**

1. **Handout-safe:** notes and script are in the static HTML, selectable and printed in full whether or not the drawer ever opened. A closed or inactive panel is not reachable by browser find-in-page, since `invisible` and `hidden` content is skipped; `hidden=until-found` is not used.
2. **Tour-ready:** every note names its element, so a tour needs no migration.
3. **No new dependency:** native elements, one small client leaf.

**Negative:**

1. **Sources leave the site:** a source opens in a new tab, unchecked; a dead link is found by hand. Each needs a localized title.
2. **`Alt+N` is untested on every assistive stack;** `aria-keyshortcuts` announces a shortcut and implements nothing.
3. **Side by side reflows the Slides once** per open or close; overlay covers them instead. Print appends notes after the Slides, not between them.
4. **Closed sources rely on `beforeprint`** to print; a browser without it prints them closed.
5. **Between `md` and `xl` the card only overlays,** whatever the menu last chose.
6. **A `ContextRef` does nothing without JavaScript;** its phrase and the note still read.

**Risks:**

1. **Drawer and table of contents disagree on the current Slide.** **Mitigation:** one observer, one hook: both read `useActiveSlide()` (FE-001, FE-009).
2. **A design field creeps into the note shape.** **Mitigation:** review duty below.

## Compliance and Enforcement

**Enforcers, earliest first:**

1. **Types** (`tsc`): note and segment types in `src/lib/context-drawer.pure.ts`; `de.json` typed against `en.json`. `tsc` does not check that a note or segment catalog key exists: the unit key-shape test and the post-build raw-key test do. The adapter is `src/components/episode/context-drawer-input.ts`, unit-tested in its `.pure` sibling.
2. **Fast** (`npm run verify`): unit tests beside `src/lib/{context-drawer,context-link,roving-focus,episode}.pure.ts` and `src/i18n/catalog-strings.pure.ts`.
3. **archgate:** `FE-010-context-drawer.rules.ts`, both rules at `error`: `print-reveals-context` over `src/app/globals.css`, `drawer-is-non-modal` over `src/components/context-drawer/**`. §1, §2.
4. **dependency-cruiser** (`.dependency-cruiser.cjs`): `context-drawer-reached-only-from-container`, `context-drawer-takes-input-only` (drawer, hooks and lib import no Episode, table-of-contents, route or `next-intl` code). §5, §8.
5. **Post-build** (`npm run test:build`): `tests/post-build/context-drawer.build.test.ts` checks the slot, notes in static HTML, no `hidden` attribute, resolving targets (incl. every `ContextRef` id), locale parity, numbered sources as links, citation markers and the print block; `tests/post-build/episode-structure.build.test.ts` keeps the slot order. §2, §5, §8.

**Manual review duties:** the card's placement, motion and one-step layout at 1440px, 1100px and 375px; the head row at 360px; the pills' fit at 375px; `ContextRef` hover, focus and click; the mode menu with a keyboard; German copy quality; `Alt+N` on real screen readers; a real print preview; focus return; no design field in the note shape; catalog key shape (`docs/agents/episode-catalog-keys.md`, `GLOSSARY.md`).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [FE-002 Episode Page](./FE-002-episode-page.md), [FE-003 Localization](./FE-003-localization.md), [FE-006 Server/Client Boundary](./FE-006-server-client-boundary.md), [FE-007 Module Layering](./FE-007-module-layering.md), [ARCH-001](./ARCH-001-dependency-admission-bar.md).
- [`GLOSSARY.md`](../../GLOSSARY.md) — Speaker note item, Voice script segment, Bridge, Context drawer, Context reference, Citation marker.
- [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [WCAG 2.1.4](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html), [`docs/research/context-drawer-patterns.md`](../../docs/research/context-drawer-patterns.md).
