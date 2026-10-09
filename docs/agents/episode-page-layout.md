# Episode page layout

Read before changing where things sit on an Episode page. Binding rules live in FE-002; this page holds layout detail that doesn't need to bind.

## Table of contents

- Sticky left column from `md`; below `md`, a pill bottom-left opens it as a drawer.
- Heading links to the Title slide (`#top`) and is current there; no entry for the Title slide, none highlighted on `top`.
- Pill shows remaining reading time only.
- Takes pre-translated props from the container.

## Corners

- Bottom-left: table of contents pill.
- Bottom-right: Context drawer trigger; back-to-top above it.
- Top-right: video player.

## Reserved places

- YouTube: one per Episode and locale, on the Title slide, loaded on play — never with the page.
- Arrow-key navigation and back-to-top: owned by the container.
- Speaker notes and voice script: per Slide, shown in the Context drawer.
