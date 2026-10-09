---
name: visual-check
description: Check rendered pages from the shell — DOM numbers as JSON and small screenshots. Use for any visual or layout verification, including from subagents without browser tools.
---

# Visual check

Numbers first, pictures last: a probe answers most layout questions in a few hundred bytes, and one image costs more context than many probes.

## Serve

- Built export: `npm run build`, then `npm run preview` serves `out/` at `http://localhost:4300/` (`PREVIEW_PORT` overrides). Run it in the background.
- Live edits: a running `next dev` URL works the same.

## Probe

`npm run shot -- --url <url> --probe <selector> [--probe …] [--styles prop,prop] [--width 1280 --height 800]`

Prints JSON: per selector its match `count`, the first match's `box` (page coordinates) and the requested computed `styles`. `--wait <ms>` (default 500) lets motion settle after load.

## Screenshot

Add `--out <scratchpad path>.png`, optionally `--clip <selector>` to frame one element (scrolled into view first, so an Episode Slide mounts) and `--theme light|dark` to emulate the system colour scheme the site follows by default. The image is capped at 800 px on its longest edge. Read at most one image per iteration, and only when a probe cannot answer the question (colour, overlap, visual balance).

## Browser tools

The claude-in-chrome tools are deferred, not missing: load them via ToolSearch before concluding they are unavailable. They suit interactive checks; this skill suits repeatable ones.
