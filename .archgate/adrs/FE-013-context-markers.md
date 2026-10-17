---
type: adr
id: FE-013
title: 'Context Markers'
domain: frontend
rules: false
files: ['src/components/slide-master/context-marker.tsx', 'src/hooks/use-context-links.ts']
paths: ['src/components/slide-master/{context-*,slide-kit}.tsx', 'src/components/episodes/**']
description: 'The Context marker: the Context button speech-bubble icon as a small button beside a fact on a Slide, a second form of Context reference beside the underlined phrase; which facts carry one, its accessible name, and how a click reveals its Speaker note at the top of the drawer.'
---

# Context Markers

## Context

A reader of a Slide cannot tell which facts have a sourced Speaker note behind them until something lights up on hover. The underlined phrase (`ContextRef`) answers that inside running text, but many facts are a whole card, column or chart: there is no phrase to underline.

A Context marker is the drawer's own speech-bubble icon placed beside the fact: `(icon)` after a phrase, or in an element's corner or beside its label. The same icon on the Context button tells the reader what it opens. It is the same link as `ContextRef`, so the drawer gains no second path from a Slide to a note.

**Why the note scrolls to the top:** a click asks for that note. Scrolling only until it is visible leaves it at the bottom edge with its description cut off; at the top, the note and its sources read in full.

**Out of scope:** markers on the Title slide; changing the underline form in existing Episodes.

## Decision

### 1. Two forms, one link

1. A Context reference is an underlined phrase (`ContextRef`) or a Context marker (`ContextMarker`).
2. A marker names one note of its Slide by slug through the `ContextRef` attribute, is a `<button type="button">`, shows the Context button's icon, carries no id, target or number.
3. Inline, it follows its phrase as `(icon)` on the baseline, never moving the line height; on an element it sits in a corner or beside a label.

### 2. Which facts carry one

1. A new Episode MUST give every fact whose note carries a source a Context reference: a marker, or an underline where a phrase fits.

### 3. Name, states, print

1. A marker's accessible name MUST be `Speaker note: <note header>`, localized from the site-wide Translation files.
2. Colour and states come from tokens: muted at rest, hover and keyboard-focus states visible.
3. Print drops the marker without moving layout.

### 4. Reveal

1. Clicking or pressing Enter on a Context reference opens the drawer on Notes for its Slide, pins its note and scrolls the drawer's body so the note sits as near the top as the content allows.
2. Hovering or focusing a note keeps lighting the element it explains.

## Do's and Don'ts

### Do's

1. **DO** write `<marker>phrase</marker>` with the kit's `marker('<note>')` for a fact in text. (Decision 1)
2. **DO** place the kit's `<Marker note="…" />` in a `relative` element's corner, or beside its label by `className`. (Decision 1)
3. **DO** mark every sourced fact of a new Episode. (Decision 2)

### Don'ts

1. **DON'T** add a second attribute, listener or id to link a Slide to a note. (Decision 1)
2. **DON'T** draw a marker in a raw colour or another icon. (Decisions 1 and 3)
3. **DON'T** scroll the page, or only scroll the note into view, on reveal. (Decision 4)

## Consequences

**Positive:**

1. **Visible sources:** a reader sees which facts have a note before hovering anything.
2. **Works on any element:** a card, column or chart takes a marker where an underline cannot go.

**Negative:**

1. **More chrome on the Slide:** many sourced facts mean many icons.
2. **No JavaScript, no drawer:** a marker is then an inert icon; the note still prints.

**Risks:**

1. **A marker names a note its Slide lacks.** **Mitigation:** the kit throws at build, and the types reject an undeclared slug.

## Compliance and Enforcement

1. **Types:** the kit's `marker` and `Marker` take only the Slide's declared notes (§1).
2. **Unit tests:** the marker's button, attribute and name; the kit's label per locale; the reveal scroll position (§1, §3, §4).
3. **Post-build test:** every Context reference resolves to one note of its own Slide (§1).

**Manual review duties:** every sourced fact of a new Episode marked; hover, focus and click at 1280px, light and dark; the note scrolled near the top; print preview.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md) — Context reference, Context marker, Speaker note item, Context drawer.
- [`docs/features/episode-chrome.md`](../../docs/features/episode-chrome.md) — marker placement and states.
