---
name: visual-check
description: Check rendered pages from the shell — DOM numbers as JSON and screenshots, in light and dark. Use for any visual or layout verification.
---

# Visual check

Numbers first, pictures last: a probe answers most layout questions in a few hundred bytes, and one image costs more context than many probes.

## Serve

- Built export: `npm run build`, then `npm run preview` serves `out/` at `http://localhost:4300/` (`PREVIEW_PORT` overrides). Run it in the background.
- Live edits: a running `next dev` URL works the same.

## Probe

`npm run inspect-page -- --url <url> [--url …] --probe <selector> [--probe …] [--styles prop,prop] [--theme light,dark] [--width 1280 --height 800]`

Prints a JSON array, one entry per url x theme: per selector its match `count`, the first match's `box` (page coordinates) and the requested computed `styles`. `--wait <ms>` (default 500) lets motion settle after load. Repeat `--url` and list themes to check many pages in one call; that is the fast path.

## Screenshot

Add `--out <scratchpad path>.png`, optionally `--clip <selector>` to frame one element (scrolled into view first, so an Episode Slide mounts) and `--theme light|dark` to emulate the system colour scheme the site follows by default. Screenshots render at device pixel ratio 2, capped at 1568 px on the longest edge. With several url x theme entries `--out shot.png` becomes `shot-<n>[-<theme>].png`; each entry's `image.path` names its file. Read at most one image per iteration, and only when a probe cannot answer the question (colour, overlap, visual balance).

## Browser

The first call installs `chrome-headless-shell` into the git-ignored `.cache/inspect-page-shared/` of the main checkout (once for all worktrees, slow) and starts it detached; every later call, parallel ones included, opens its own tab in that worktree's one browser (profile and endpoint in its own `.cache/inspect-page/`) and closes only that tab. It exits after 10 minutes without a call; `npm run inspect-page -- --stop` ends it early. A dead browser is replaced on the next call. `CHROME_PATH` overrides the binary.

## Browser tools

The claude-in-chrome tools are deferred, not missing: load them via ToolSearch before concluding they are unavailable. They suit interactive checks; this skill suits repeatable ones.
