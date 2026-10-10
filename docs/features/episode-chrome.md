---
type: feature-guide
stale_after: 2027-01-11T00:00:00Z
---

# Episode chrome

Read before changing the look, layout or interaction of what surrounds an Episode's Slides: the table of contents, the Context drawer, the video player and where each sits. Binding rules: [FE-010 Context Drawer](../../.archgate/adrs/FE-010-context-drawer.md) and [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md). This guide holds the detail that does not bind.

## Layers

- The Chrome (table of contents, Context drawer, talk player) floats over the Slides and takes no layout space; each Slide gets the full viewport width. The Content area pads every wrapper with `--inset-l` and `--inset-r` ([FE-009 §2](../../.archgate/adrs/FE-009-slide-frame.md)), so the Foreground clears the Chrome while the Backdrop stays full-bleed.
- Insets: `1rem` each side below `md`; from `md`, `21rem` left (the table of contents plus its gap) and `3rem` right, or the drawer width plus `4rem` while the drawer sits beside.
- Full-bleed decoration goes in `SlideBackdrop`, content in `SlideFrame` (the Foreground). Z-index values come from the ladder in FE-009 §8; popovers render through the Episode portal root, modals as a native `<dialog>`.

## Corners

- Top-right: the Context drawer card, never the video.
- Bottom-left: the table of contents pill, below `md` only; from `lg`, the docked talk player (17rem wide, 1rem from the edges) under the table of contents.
- Bottom-right: Context drawer trigger.
- There is no back-to-top button.

## Table of contents

- Fixed overlay on the left from `md`, taking no layout space; below `md`, the pill opens it as a drawer sliding in from the left.
- While the talk player is docked, its max-height leaves the player room (`--toc-reserve`) and it scrolls inside itself.
- The pill shows where the reader is, the current Slide's number and title, plus the remaining reading time.
- The heading links to the Title slide (`#top`) and is current there. The Title slide has no entry, so nothing is highlighted on `top`.
- It takes pre-translated props from the container.

## Reserved places

- YouTube: one player per Episode and locale, loaded on play, never with the page. It plays in a 16:9 talk slot in the Title slide's Foreground through one host that is never re-parented (re-parenting reloads the video). Undocked it is `absolute` at the slot's page coordinates, re-measured on resize, not on scroll, so it scrolls natively and cannot lag. From `lg` it docks, becoming `fixed`, when the active Slide leaves `top`; the glide between the two animates `transform` only, and is instant under `prefers-reduced-motion`. Docked it offers "Back to video" and Close; undocked, Close only. Below `lg` it never docks.
- Arrow-key Slide navigation: ←/→ step to the previous or next Slide, without wrapping; ignored with a modifier and inside editable fields, tab/menu/listbox/slider/radio widgets, the drawer, open dialogs and iframes. ↑/↓ and PageUp/PageDown scroll natively. The URL follows through the observer, not the keys.

## Card

A floating card in the table of contents' chrome (corners, border, shadow), opaque so it does not ghost over Slide text. `top-24`, below the sticky site header (`top-32` below `md`, where the header wraps), 1rem from the right and bottom edges. A sticky head, then one scroll container. It slides in from the right by `transform` alone: 250ms ease-out in, 200ms ease-in out, and not at all under `prefers-reduced-motion`.

## Modes

- **From `xl` (1280px):** a "more" menu in the head picks **beside** (default) or **over**. Beside widens the Foreground's right inset to clear the card at once, through `data-drawer-beside` on the Episode page, so the Slides reflow once while Backdrops keep the full width. The mode is the `drawerMode` user preference, read and written only through `readPrefs`/`writePrefs` (FE-001).
- **Below `xl`:** the card is always an overlay and the menu is hidden. The stored mode is kept, not reset, so widening the window restores it. CSS alone decides: the menu hides through `max-xl:hidden`, and only the beside inset uses `xl:` classes.
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
