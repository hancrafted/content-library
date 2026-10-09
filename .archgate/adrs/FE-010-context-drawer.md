---
type: adr
id: FE-010
title: 'Context Drawer'
domain: frontend
rules: true
files: ['src/components/context-drawer/**/*', 'src/app/globals.css']
paths: ['src/components/{context-drawer,episodes}/**', 'src/lib/context-{drawer,link}.pure*.ts', 'src/app/globals.css']
description: 'The Context drawer: a non-modal floating card, side by side with or over the Slides, showing the current Slide Speaker notes and Voice script, both server-rendered into the page and printed in full, linked to the Slide by targets and context references, with the note and segment shapes typed as content and kept apart from design.'
---

# Context Drawer

## Context

A Slide's Speaker notes and Voice script are the author's working text: what to say, where a claim comes from, how to hand over. A reader or presenter wants them beside the Slide, not on it. The Context drawer is that view — onto text already in the page, never a second copy.

**Why the text lives in the HTML:** a drawer that mounts its text on open exists only inside JavaScript; find-in-page, a PDF handout and a crawler all miss it. `hidden`, `display: none` and an unmounted subtree all drop text from print, so a closed drawer hides with `invisible` plus an off-screen transform.

**Why structure here, when Slide markup is free:** a schema over Slide markup made visualisations bend to it. A note or segment is text with a fixed role, the same on every Slide, read by the drawer, a handout and later a tour. So content may be typed and keyed; design may not.

**Why `xl`:** side by side needs the table of contents, the card and a usable Slide column; below about 1280px the card overlays. CSS alone decides.

**Why plain `[n]` markers:** a description is one translated string, so a citation lives inside it. A bare `[1]` survives a translator, a handout and no JavaScript; rich-text tags would put markup in a Translation file.

**Why `ContextRef` is a button:** it names a note from inside Slide text and acts on the drawer rather than navigating. The drawer listens by delegation, so the Slide stays a server component.

**Why the drawer takes input:** it is a view and must not know where its text came from. Open state and tab are transient — a shared link never opens someone's drawer; the layout mode is a preference.

**Why spans are counted:** hand-written `from`/`to` minutes drifted from the script they timed, once per locale. Counting script plus bridge words at the locale's speaking pace retimes a segment whenever its text changes.

Card, head, menu and selected-state detail: [`docs/agents/context-drawer-design.md`](../../docs/agents/context-drawer-design.md).

**Out of scope:** guided tour (the `target` pairing is the hook, as in Shepherd's `attachTo`); PDF export (full print keeps it possible); live annotation.

## Decision

### 1. Non-modal (📜 Rule: `drawer-is-non-modal`)

1. No `showModal(` or `aria-modal` in the drawer.

### 2. In the DOM, printed (📜 Rule: `print-reveals-context`)

1. The server MUST render all notes, scripts and sources into one context slot, entries tagged by Slide.
2. A closed drawer MUST hide with `invisible` plus a transform, never `hidden`, `display: none` or `inert`.
3. `globals.css` MUST reveal the context slot in an `@media print` block.

### 3. Typed content

1. A note: `header`, `description`, optional `sources` and `image`, required `target`. A segment: `title`, `keywords`, `script`, optional `bridge`. Neither MAY carry design.
2. A description cites by `[n]` markers naming its note's sources.
3. Notes, segments and sources key on a kebab-case `slug`, never a position.
4. A segment's time span MUST be counted from its words; it declares no time.

### 4. Targets

1. A note's `target` MUST be a short name (`prose`, `chart`), marked on one element inside its Slide's wrapper and found there only.
2. A `ContextRef` wraps a phrase, shows no number, names its note by slug, is a `<button type="button">`, carries no id or target.

### 5. Interaction

1. `Alt+N` toggles, Escape closes; focus enters on open, returns on close.
2. The drawer MUST be a client leaf reached only from the Episode page container and its adapter.

### 6. Strings and links

1. Translation keys follow `docs/agents/episode-translation-keys.md`; chrome under `contextDrawer.*`.
2. A source MUST be an `https` link named as opening a new tab.

### 7. Card and modes

1. A floating card: one-step width, only `transform` animates; beside from `xl`.
2. Layout MUST be the `drawerMode` preference; open state and tab stay in memory.

### 8. Input only

1. The drawer MUST render from one `ContextDrawerInput` and import no Episode, route, table-of-contents or `next-intl` code.
2. It MUST take the active Slide from `useActiveSlide()`, never observe the viewport.

## Do's and Don'ts

### Do's

1. **DO** keep the drawer a non-modal region. (Decision 1, 📜 Rule: `drawer-is-non-modal`)
2. **DO** keep the print block for the context slot in `globals.css`. (Decision 2, 📜 Rule: `print-reveals-context`)
3. **DO** hide a closed drawer with `invisible` and a transform. (Decision 2)
4. **DO** give every note a short `target` and mark that element — a layout's own (`title`, `prose`) or `{...target('chart')}`. (Decisions 3 and 4)
5. **DO** write German notes from the same facts, not as translations. (Decision 6)
6. **DO** reserve the card's width in one step and animate only `transform`. (Decision 7)
7. **DO** pass the drawer everything as `ContextDrawerInput`, built by the Episode-side adapter. (Decision 8)

### Don'ts

1. **DON'T** call `showModal(` or set `aria-modal` in the drawer. (Decision 1)
2. **DON'T** put the `hidden` attribute, `display: none` or `inert` on the context slot. (Decision 2)
3. **DON'T** add a layout, style, placement or time field to a note or segment. (Decision 3)
4. **DON'T** render the drawer from an Episode file. (Decision 5)
5. **DON'T** show a source as plain text, or open it without `rel="noopener noreferrer"`. (Decision 6)
6. **DON'T** transition width, grid tracks or margins for the card. (Decision 7)
7. **DON'T** read Episode, table-of-contents or Translation code from the drawer, or number a `ContextRef`. (Decisions 4 and 8)

## Consequences

**Positive:**

1. **Handout-safe:** notes and script are in the static HTML and print in full whether or not the drawer opened. Find-in-page skips a closed panel; `hidden=until-found` is not used.
2. **Tour-ready:** every note names its element, so a tour needs no migration.
3. **No new dependency:** native elements, one small client leaf.

**Negative:**

1. **Sources leave the site:** opened in a new tab, unchecked; a dead link is found by hand.
2. **`Alt+N` is untested on every assistive stack;** `aria-keyshortcuts` announces, implements nothing.
3. **Side by side reflows the Slides** once per open or close. Print appends notes after the Slides.
4. **Closed sources rely on `beforeprint`** to print.
5. **Between `md` and `xl` the card only overlays,** whatever the menu last chose.
6. **A `ContextRef` does nothing without JavaScript;** its phrase and the note still read.

**Risks:**

1. **Drawer and table of contents disagree on the current Slide.** **Mitigation:** both read `useActiveSlide()`, fed by one observer.
2. **A design field creeps into the note shape.** **Mitigation:** review duty below.

## Compliance and Enforcement

1. **Rules** (archgate, error): `drawer-is-non-modal` (§1), `print-reveals-context` (§2.3).
2. **Types:** note and segment shapes; German Translation file typed against English; every note and segment slug has a Translation subtree (§3, §6).
3. **Unit tests:** citation parsing, context links, roving focus, the input adapter, Translation key shape, counted spans.
4. **Dependency rules:** drawer reached only from the container; drawer code imports no Episode, table-of-contents, route or `next-intl` code (§5.2, §8).
5. **Post-build test:** slot and notes in static HTML, no `hidden` attribute, each target resolving to one element in its Slide, each `ContextRef` to one note, locale parity, sources as links, citation markers, print block (§2, §4, §6).

**Manual review duties:** card placement, motion and one-step layout at 1440px, 1100px and 375px; `ContextRef` hover, focus and click; the mode menu by keyboard; German copy; `Alt+N` on real screen readers; a real print preview; focus return; no design field in the note shape.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md) — Speaker note item, Voice script segment, Bridge, Context drawer, Context reference, Citation marker.
- [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [WCAG 2.1.4](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html), [`docs/research/context-drawer-patterns.md`](../../docs/research/context-drawer-patterns.md).
