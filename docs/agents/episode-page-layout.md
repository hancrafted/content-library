# Episode page layout

Read before changing where things sit on an Episode page. Binding rules live in FE-002; this page holds layout detail that doesn't need to bind.

## Table of contents

- Fixed overlay at the left from `md`, taking no layout space (Slides pad their left inset past it); below `md`, a pill bottom-left opens it as a drawer.
- Heading links to the Title slide (`#top`) and is current there; no entry for the Title slide, none highlighted on `top`.
- Pill shows remaining reading time only.
- Takes pre-translated props from the container.

## Layers

- Chrome floats over the Slides; each Slide gets the full viewport width. The Content area pads every wrapper with `--inset-l` and `--inset-r` (FE-009 §2), so the Foreground clears the chrome and the Backdrop stays full-bleed.
- Put full-bleed decoration in `SlideBackdrop`, content in `SlideFrame` (the Foreground). Z-index values come from the ladder in FE-009 §8.

## Corners

- Bottom-left: table of contents pill (below `md`); the docked talk player (from `lg`, with the Talk player work) sits under the table of contents.
- Bottom-right: Context drawer trigger; back-to-top above it.
- Top-right: the Context drawer card, never the video.

## Reserved places

- YouTube: one per Episode and locale, in the Title slide's Foreground, loaded on play, never with the page.
- Back-to-top: owned by the container.
- Arrow-key navigation (implemented): ←/→ step to the previous or next Slide, no wrap; ignored with a modifier and inside editable fields, tab/menu/listbox/slider/radio widgets, the drawer, open dialogs and iframes. ↑/↓ and PageUp/PageDown scroll natively. The URL follows through the observer, not the keys.
- Speaker notes and voice script: per Slide, shown in the Context drawer.
