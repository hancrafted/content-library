---
type: design-adr
status: proposed
---

# A Context marker beside a fact is a second form of Context reference

A reader of a Slide cannot tell which facts have a sourced Speaker note behind them until something lights up on hover. The underlined phrase (`ContextRef`) answers that inside running text, but many facts are a whole card, column or chart with no phrase to underline. So a **Context marker**, the Context drawer's own speech-bubble icon placed beside the fact, becomes a second form of Context reference, and a new Episode marks every sourced fact. The Context drawer itself stays as FE-010 decides.

## Decisions

1. **Two forms, one link.** A Context reference is an underlined phrase (`ContextRef`) or a Context marker (`ContextMarker`). A marker names one note of its Slide by slug through the `ContextRef` attribute, is a `<button type="button">`, shows the Context button's icon, and carries no id, target or number. It is the same link as `ContextRef`, so the drawer gains no second path from a Slide to a note: no second attribute, listener or id.
2. **Placement.** Inline, a marker follows its phrase as `(icon)` on the baseline, never moving the line height: `<marker>phrase</marker>` with the kit's `marker('<note>')`. On an element it sits in a corner of a `relative` element, or beside its label by `className`: the kit's `<Marker note="…" />`. The same icon on the Context button tells the reader what a marker opens.
3. **Which facts carry one.** A new Episode gives every fact whose note carries a source a Context reference: a marker, or an underline where a phrase fits.
4. **Name, states, print.** A marker's accessible name is `Speaker note: <note header>`, localized from the site-wide Translation files. Colour and states come from tokens, never a raw colour or another icon: muted at rest, hover and keyboard-focus states visible. Print drops the marker without moving layout.
5. **Reveal scrolls the note to the top.** Clicking or pressing Enter on a Context reference opens the drawer on Notes for its Slide, pins its note and scrolls the drawer's body so the note sits as near the top as the content allows; the page itself does not scroll. A click asks for that note, and scrolling only until it is visible leaves it at the bottom edge with its description cut off. Hovering or focusing a note keeps lighting the element it explains.

Out of scope: markers on the Title slide, and changing the underline form in existing Episodes.

## Considered options

- **Underline only.** Rejected: a card, column or chart has no phrase to underline, so its source stays invisible until hover.
- **A separate marker link** (its own attribute, listener or id). Rejected: a second path from a Slide to a note that the drawer would have to keep in step with `ContextRef`.
- **Scroll the note only into view on reveal.** Rejected: it lands at the bottom edge with its description cut off.

## Consequences

- A reader sees which facts have a note before hovering anything, and any element can take a marker where an underline cannot go.
- Many sourced facts mean many icons on the Slide.
- Without JavaScript a marker is an inert icon; the note still prints.
- A marker naming a note its Slide lacks fails the build: the kit throws, and the types reject an undeclared slug.
- Enforcement: the kit's `marker` and `Marker` take only the Slide's declared notes; unit tests cover the marker's button, attribute and name, the kit's label per locale, and the reveal scroll position; a post-build test checks that every Context reference resolves to one note of its own Slide. Review checks every sourced fact of a new Episode marked; hover, focus and click at 1280px in light and dark; the note scrolled near the top; and print preview. Marker placement and states are detailed in [episode chrome](../features/episode-chrome.md).
