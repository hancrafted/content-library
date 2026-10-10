---
type: feature-guide
stale_after: 2027-01-10T00:00:00Z
---

# Episode chrome

Read before changing the look, layout or interaction of what surrounds an Episode's Slides: the table of contents, the Context drawer, the video player and where each sits. Binding rules: [FE-010 Context Drawer](../../.archgate/adrs/FE-010-context-drawer.md) and [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md). This guide holds the detail that does not bind.

## Corners

- Top-right: video player (`fixed top-20 right-4`).
- Bottom-left: table of contents pill, below `md` only; from `md` the table of contents is a sticky left column.
- Bottom-right: Context drawer trigger.
- There is no back-to-top button.

## Table of contents

- Sticky left column from `md`; below `md`, the pill opens it as a drawer sliding in from the left.
- The pill shows where the reader is, the current Slide's number and title, plus the remaining reading time.
- The heading links to the Title slide (`#top`) and is current there. The Title slide has no entry, so nothing is highlighted on `top`.
- It takes pre-translated props from the container.

## Reserved places

- YouTube: one player per Episode and locale, on the Title slide, loaded on play, never with the page.
- Arrow-key Slide navigation: planned (#33), not built. The container will own it; build neither it nor anything that assumes it exists.

## Card

A floating card in the table of contents' chrome (corners, border, shadow), opaque so it does not ghost over Slide text. `top-24`, below the sticky site header (`top-32` below `md`, where the header wraps), 1rem from the right and bottom edges. A sticky head, then one scroll container. It slides in from the right by `transform` alone: 250ms ease-out in, 200ms ease-in out, and not at all under `prefers-reduced-motion`.

## Modes

- **From `xl` (1280px):** a "more" menu in the head picks **beside** (default) or **over**. Beside reserves the card's width by changing the Episode grid's third column at once, through a spacer in the context slot, so the Slides reflow once. The mode is the `drawerMode` user preference, read and written only through `readPrefs`/`writePrefs` (FE-001).
- **Below `xl`:** the card is always an overlay and the menu is hidden. The stored mode is kept, not reset, so widening the window restores it. CSS alone decides: the menu hides through `max-xl:hidden`, and only the spacer uses `xl:` classes.
- **Below `md`:** a dimmed scrim (`bg-black/40`, backdrop blur) covers the page; tapping it closes the drawer. It is pointer-only: Escape and the close button still work.

## Head

Sticky. Row one: the tabs left, the menu and close right. The tabs may shrink and scroll sideways; the close button never leaves the row, so it stays visible at 320px. Row two: the current Slide's title once, wrapping freely, so a long title never moves the tabs. The per-entry title shows only in print.

## Menu

`aria-haspopup="menu"`, `aria-expanded`, `menuitemradio` items with `aria-checked`; arrows, Home and End move; Escape closes the menu alone and returns focus to its button.

## Notes

- **Flat items.** A note or segment is no bordered card inside the card: a flat list, items spaced apart by a short centred divider, hierarchy by type alone. Chips and badges are fine.
- **No numbers.** A note header and a `ContextRef` carry no number. The only superscript is a citation marker.
- **Sources.** A closed `<details>` "Sources (n)" holding a numbered list. Each source is a link whose text is its localized title, with the domain as muted meta and an external-link icon. `beforeprint` opens every `<details>` in the slot, `afterprint` restores them.
- **Citation markers.** `[n]` in a description becomes a `<sup>` button in the body font (`0.7em`, tabular numerals, padded for a comfortable target, focus ring on `:focus-visible` only). Click expands that note's Sources and moves focus to source n. In print it is plain superscript text.

## Linking a Slide and its notes

The targeting rules are in [FE-010 §4](../../.archgate/adrs/FE-010-context-drawer.md#4-targets). What they leave open:

- **Which targets exist.** The kit's `<Title>` marks `title`. The section slide, basic page and three-column layouts mark `caption`; basic page marks `prose`; three-column marks each column by its slug. A free layout (`SlideFrame`) marks only `title`, so a note aiming at `caption` or `prose` there resolves to nothing, silently: mark the element yourself with `{...target('caption')}`.
- **A `ContextRef` names a note, not an element.** A note's `target` is the prose block holding the phrase, not the phrase.
- **Highlight.** Hovering or focusing a note, or a `ContextRef`, sets `data-context-active` on the other side; a note pinned open by a `ContextRef` sets `data-context-pinned` on its item. Both tint the whole item with `--highlight-target` at 14% opacity, with no border or outline. The Slide's element, which has no padding of its own, gets the same tint spread 0.25rem past its box by a `box-shadow` ring, which takes no space, so nothing shifts. Screen only; print shows none.
- **Click.** Clicking a `ContextRef` opens the drawer on Notes at that note.

## Selected

One `--selected` / `--selected-foreground` pair in `globals.css` marks the selected drawer tab, the active table-of-contents entry, the current nav link and the selected landing-page filters: 3:1 against the surface, text 4.5:1, light and dark. `--highlight-target` is the tint behind a note and its target.

## Sources of truth in code

The Slide observer in `src/components/episode-page/` owns the one `IntersectionObserver`, at the shared reading line in `src/lib/reading-line.pure.ts`. `src/components/episode-page/context-drawer-input.ts` is the only adapter from an Episode record to the drawer's `ContextDrawerInput` (`src/components/context-drawer/context-drawer-input.ts`; rule: FE-010 §8).
