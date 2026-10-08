# Context drawer design

Read before changing the drawer's look, layout or interaction. The binding rules live in [FE-010](../../.archgate/adrs/FE-010-context-drawer.md); this page holds the detail that does not need to bind.

## Card

A floating card in the table of contents' chrome (corners, border, shadow), opaque so it does not ghost over Slide text. `top-24`, below the sticky site header (`top-32` below `md`, where the header wraps), 1rem from the right and bottom edges. A sticky head, then one scroll container. It slides in from the right by `transform` alone: 250ms ease-out in, 200ms ease-in out, and not at all under `prefers-reduced-motion`.

## Modes

- **From `xl` (1280px):** a "more" menu in the head picks **side by side** (default) or **overlay**. Side by side reserves the card's width by changing the Episode grid's third column at once, through a spacer in the context slot, so the Slides reflow once. Width, grid and margin never transition. The mode is in memory, not a stored preference, so FE-004 is not engaged.
- **Below `xl`:** the card is always an overlay and the menu is hidden. The stored mode is kept, not reset, so widening the window restores it. This is decided by CSS alone (`xl:` classes on the spacer and the menu), never by a JavaScript width check.
- **Below `md`:** a dimmed scrim (`bg-black/40`, backdrop blur) covers the page; tapping it closes the drawer. It is pointer-only: Escape and the close button still work.

## Head

Sticky. Row one: the tabs left, the menu and close right. The tabs may shrink and scroll sideways; the close button never leaves the row, so it stays visible at 320px. Row two: the current Slide's title once, wrapping freely, so a long title never moves the tabs. The per-entry title shows only in print.

## Menu

`aria-haspopup="menu"`, `aria-expanded`, `menuitemradio` items with `aria-checked`; arrows, Home and End move; Escape closes the menu alone and returns focus to its button.

## Notes

- **Flat items.** A note or segment is no bordered card inside the card: a flat list, items spaced apart by a short centred divider, hierarchy by type alone. Chips and badges are fine.
- **Numbers.** Notes are numbered in order; a `ContextRef` shows its note's number as a superscript.
- **Sources.** A closed `<details>` "Sources (n)" holding a numbered list. Each source is a link whose text is its localized title, with the domain as muted meta and an external-link icon. `beforeprint` opens every `<details>` in the slot, `afterprint` restores them.
- **Citation markers.** `[n]` in a description becomes a `<sup>` button. Click expands that note's Sources and moves focus to source n. In print it is plain superscript text.

## Linking a Slide and its notes

- **Block target.** A note's `target` names a layout element (a column, title or prose); the element carries the id `<slide anchor>--<element>`.
- **Inline target.** `ContextRef` wraps a phrase inside Slide text and emits the id `<slide anchor>--<note slug>`, so the note's `target` is its own slug. In a catalog string the phrase sits inside a `<ref>` rich-text tag.
- **Behaviour.** Hovering or focusing a note, or a `ContextRef`, sets `data-context-active` on the other side; CSS draws an outline in `--highlight-target`, which takes no space, so nothing shifts. Clicking a `ContextRef` opens the drawer on Notes at that note.
- **Print.** A `ContextRef` prints as its phrase plus a plain superscript.

## Selected

One `--selected` / `--selected-foreground` pair in `globals.css` marks the selected tab, active table-of-contents entry and current nav link: 3:1 against the surface, text 4.5:1, light and dark. `--highlight-target` is the hover and focus outline between a note and its target, with the same contrast.
