---
type: feature-guide
title: Episode chrome
stale_after: 2027-01-11T00:00:00Z
---

# Episode chrome

Read before changing the look, layout or interaction of what surrounds an Episode's Slides: the table of contents, the Context drawer, the video player and where each sits. Binding rules: [FE-010 Context Drawer](../../.archgate/adrs/FE-010-context-drawer.md) and [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md); the Context marker is decided in [design-ADR-0013](../adr/0013-context-markers.md). This guide holds the detail that does not bind.

For geometry-driven header tone and Title-departure ToC presentation, read the [Slide presentation contracts](slide-transitions.md).

## Layers

- The page chrome (table of contents, Context drawer) and the talk player float over the Slides and take no layout space; each Slide gets the full viewport width. The Content area pads every wrapper with `--inset-l` and `--inset-r` ([FE-009 §2](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md)), so the Foreground clears the Chrome while the Backdrop stays full-bleed.
- Insets: `1rem` each side below `md`; from `md`, `21rem` left (the table of contents plus its gap) and `3rem` right, or the drawer width plus `4rem` while the drawer sits beside.
- Full-bleed decoration goes in `SlideBackdrop`, content in `SlideFrame` (the Foreground). Z-index values come from the ladder in FE-009 §8; popovers render through the Episode portal root, placed by the shared `usePopoverPlacement` hook (`src/shared/hooks/use-popover-placement.ts`, maths in `src/shared/lib/popover-placement.pure.ts`); modals as a native `<dialog>`.

## Under an Event

On an Event-scoped Episode page a past Event's notice sits inside the Title slide above its title, inside the insets, and the Playlist walk follows the last Slide. There are no breadcrumbs, and a current or upcoming Event reserves no notice space. The notice and walk scroll with the page; neither floats. Detail: [Events](events.md#routes).

The table of contents also offers Event navigation, derived at build time by `src/page-assembly/episode/event-navigation.pure.ts`; the shared chrome receives a plain outline, never records or Scenes. Each page-bearing Episode appears once in first-occurrence Playlist order. Section and Slide links retain the Event route and locale and land directly on their anchors. Decision: [Event navigation is a derived outline](../adr/0021-event-navigation-is-a-derived-outline.md).

The zoom icon left of the top-right ellipsis switches between the current Episode's Sections and Slides and the full Event Episode → Section → Slide tree. Its tooltip appears above and names the destination scope: zoom out to Event, zoom in to this Episode. There is no separate Tree presentation or duplicate Playlist menu item. Collapse/expand appears with its matching icon. The mobile drawer has no collapse command and therefore no empty menu. `TOC_DEFAULT_SCOPE` in `src/shared/lib/table-of-contents.pure.ts` defaults to `page`; scope is transient and resets on a fresh page load, never stored. Switching scope leaves the reader in place. Standalone pages have no Event controls.

Page assembly also supplies the current title/route and optional back-link label/route through `episodeContextOf` in the same module, or the Guide page template. This is page context, not stored Episode metadata or part of the Event tree. The back arrow names and returns to the current Event from an Event Episode, the Episodes overview from a standalone Episode, or Guides from a Guide. The muted parent label stays on one line and truncates with an ellipsis; the full name remains accessible. The collapsed rail shows the arrow alone. Other page kinds keep their supplied title and no invented back destination. The header shows neither remaining-time text nor a redundant Event-title link.

## Corners

- Top-right: the Context drawer card, never the video.
- Bottom-left: the table of contents pill, below `md` only; from `lg`, the docked talk player (17rem wide, 1rem from the edges) under the table of contents.
- Bottom-right: Context drawer trigger.
- The table of contents' left-aligned page title returns to the document start, including any Event framing, through the page's URL service. The collapsed rail keeps an explicit up-arrow action; expanded mode has no duplicate footer action.
- Pages without a table of contents use the site-wide back-to-top button after scrolling more than a viewport; CSS suppresses that fallback wherever a table of contents exists.
- Mobile back-to-top outside the closed contents drawer is not yet verified: its hit area currently conflicts with the Context trigger. E2E investigation was deferred by request.

## Table of contents

- Fixed overlay on the left from `md`, taking no layout space; below `md`, the pill opens it as a drawer sliding in from the left.
- While the talk player is docked, its max-height leaves the player room (`--toc-reserve`) and it scrolls inside itself.
- The pill shows where the reader is, the current Slide's number and title, without remaining-time text.
- The header separates leaving the page (the back arrow and muted parent label) from returning to its top (the page title below). The title link is current on `top`; the Title slide has no entry in the outline.
- The menu opens to the right of the rail, clamped within the viewport. It portals out of the rail's stacking context; in the mobile native dialog it stays within that dialog's top layer. The mobile drawer omits rail collapse/expand.
- Reading progress runs clockwise around the current panel border from 12 o'clock. With Voice scripts it is time-weighted; without them it weights every body Slide equally (untitled Slides included), using the active Slide's fraction without claiming remaining minutes. The path is remeasured on resize and has a normalized length, so collapse/expand never turns a percentage into a stale pixel offset. The total includes Title slide script time that is absent from the outline; `readingTime` credits that elapsed introduction once the first body Slide is active, so reaching the bottom completes the border without forcing 100% on entry to the last Slide. At 100% the border transitions to the success green token; reduced motion skips the transition. Section rings are unchanged.
- It takes pre-translated props from the container.

## Reserved places

- YouTube: one player per Episode and locale, loaded on play, never with the page. An unlisted Episode's Event recording (GLOSSARY: Video) plays on both locale pages; its launcher names the language spoken in it before play (`talkPlayer.recordedIn.<locale>`, `[data-recording-language]`). It plays in a 16:9 talk slot in the Title slide's Foreground through one host that is never re-parented (re-parenting reloads the video). Undocked it is `absolute` at the slot's page coordinates, re-measured on resize, not on scroll, so it scrolls natively and cannot lag. From `lg` it docks, becoming `fixed`, when the active Slide leaves `top`; the glide between the two animates `transform` only, and is instant under `prefers-reduced-motion`. Docked it offers "Back to video" and Close; undocked, Close only. Below `lg` it never docks.
- Arrow-key Slide navigation: ←/→ step to the previous or next Slide through the page's URL service (`navigateTo`), without wrapping; ignored with a modifier and inside editable fields, tab/menu/listbox/slider/radio widgets, the drawer, open dialogs and iframes. ↑/↓ and PageUp/PageDown scroll natively.

## Card

A floating card in the table of contents' chrome (corners, border, shadow), opaque so it does not ghost over Slide text. `top-24`, below the sticky site header (`top-32` below `md`, where the header wraps), 1rem from the right and bottom edges. A sticky head, then one scroll container. It slides in from the right by `transform` alone: 250ms ease-out in, 200ms ease-in out, and not at all under `prefers-reduced-motion`.

## Modes

- **From `xl` (1280px):** a "more" menu in the head picks **beside** (default) or **over**. Beside widens the Foreground's right inset to clear the card at once, through `data-drawer-beside` on the Episode page, so the Slides reflow once while Backdrops keep the full width. The mode is the `drawerMode` user preference, read and written only through `readPrefs`/`writePrefs` (FE-001).
- **Below `xl`:** the card is always an overlay and the menu is hidden. The stored mode is kept, not reset, so widening the window restores it. CSS alone decides: the menu hides through `max-xl:hidden`, and only the beside inset uses `xl:` classes.
- **Below `md`:** a dimmed scrim (`bg-overlay/40`, backdrop blur) covers the page; tapping it closes the drawer. It is pointer-only: Escape and the close button still work.

## Head

Sticky. Row one: the tabs left, the menu and close right. The tabs may shrink and scroll sideways; the close button never leaves the row, so it stays visible at 320px. Row two: the current Slide's title once, wrapping freely, so a long title never moves the tabs. The per-entry title shows only in print.

## Menu

`aria-haspopup="menu"`, `aria-expanded`, `menuitemradio` items with `aria-checked`; arrows, Home and End move; Escape closes the menu alone and returns focus to its button.

## Notes

- **Flat items.** A note or segment is no bordered card inside the card: a flat list, items spaced apart by a short centred divider, hierarchy by type alone. Chips and badges are fine.
- **No numbers.** A note header and a Context reference carry no number. The only superscript is a citation marker.
- **Sources.** A closed `<details>` "Sources (n)" holding a numbered list. Each source is a link whose text is its localized title, with the domain as muted meta and an external-link icon. `beforeprint` opens every `<details>` in the slot, `afterprint` restores them.
- **Citation markers.** `[n]` in a description becomes a `<sup>` button in the body font (`0.7em`, tabular numerals, padded for a comfortable target, focus ring on `:focus-visible` only). Click expands that note's Sources and moves focus to source n. In print it is plain superscript text.

## Linking a Slide and its notes

The targeting rules are in [FE-010 §4](../../.archgate/adrs/FE-010-context-drawer.md#4-targets). What they leave open:

- **Which targets exist.** The kit's `<Title>` marks `title`. The section slide, basic page and three-column layouts mark `caption`; basic page marks `prose`; three-column marks each column by its slug. A free layout (`SlideFrame`) marks only `title`, so a note aiming at `caption` or `prose` there resolves to nothing, silently: mark the element yourself with `{...target('caption')}`.
- **Two forms of Context reference.** `ContextRef` underlines a phrase (`<ref>` in the string, `ref('<note>')` in `t.rich`). `ContextMarker` is the Context button's speech-bubble icon beside a fact: inline, `<marker>phrase</marker>` with `marker('<note>')` renders the phrase, a no-break space and `(icon)` on its baseline; on an element, the kit's `<Marker note="…" />` sits in the top-right corner of a `relative` element, or where its `className` puts it; `placement="beside"` keeps it in the flow of a label. A marker owns its hit area, so a `static` class on one fails lint. Both use the same `data-context-ref` attribute and listener. A marker is named `Speaker note: <note header>` (`contextDrawer.markerNote`), muted at rest, foreground on an accent tint on hover, a ring on keyboard focus, and absent from print.
- **Which form** ([design-ADR-0013](../adr/0013-context-markers.md)). A new Episode gives every fact whose note carries a source a Context reference: a marker, or an underline where a phrase fits. `episode-template`'s `why-a-template` shows one of each marker.
- **A Context reference names a note, not an element.** A note's `target` is the element holding the fact, not the reference.
- **Highlight.** Hovering or focusing a note, or a Context reference, sets `data-context-active` on the other side; a note pinned open by a Context reference sets `data-context-pinned` on its item. Both tint the whole item with `--highlight-target` at 14% opacity, with no border or outline. The Slide's element, which has no padding of its own, gets the same tint spread 0.25rem past its box by a `box-shadow` ring, which takes no space, so nothing shifts. Screen only; print shows none.
- **Click.** Clicking a Context reference opens the drawer on Notes at that note and scrolls the drawer's body so the note sits as near the top as the content allows (`revealScrollTop`); a note near the end stops where the content ends.

## Selected

One `--selected` / `--selected-foreground` pair in `globals.css` marks the selected drawer tab, the active table-of-contents entry, the current nav link and the selected landing-page filters: 3:1 against the surface, text 4.5:1, light and dark. `--highlight-target` is the tint behind a note and its target.

## Sources of truth in code

The Slide observer in `src/episodes/components/episode-page/` owns the one `IntersectionObserver`, at the shared reading line in `src/shared/lib/reading-line.pure.ts`. `src/episodes/components/episode-page/context-drawer-input.ts` is the only adapter from an Episode record to the drawer's `ContextDrawerInput` (`src/shared/page-chrome/context-drawer/context-drawer-input.ts`; rule: FE-010 §8).
