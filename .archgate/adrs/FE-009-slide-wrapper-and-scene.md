---
type: adr
id: FE-009
title: 'Slide Wrapper and Scene'
domain: frontend
rules: false
files: ['src/episodes/**', 'src/shared/hooks/**', 'src/shared/lib/reading-line.pure*.ts']
paths: ['src/episodes/**', 'src/shared/hooks/**', 'src/shared/lib/reading-line.pure*.ts']
description: 'Wrapper owns mechanics, Scene owns creativity in two layers (Backdrop and Foreground): a full-width single-column Content area that owns the insets, an isolating server Slide wrapper that never clips, a client SlideMount that drops far content, one observer with two thresholds, a stacking ladder, and a pause duty for looping animation.'
---

# Slide Wrapper and Scene

## Context

An Episode stacks many Slides, some heavy (charts, looping demos). Navigation needs every Slide to be a stable, measurable box; a visualisation needs total freedom inside it. The two conflict only if one element serves both.

**The split:** the Slide wrapper owns mechanics — anchor, height, width, mount boundary, stacking context — and renders the Slide header and the entrance, which design-ADR-0012 governs. The Scene inside is ungoverned, in two layers: a full-bleed **Backdrop** and an inset **Foreground**. A heading may sit centred, top or lower right, so it is never an anchor: placement would move the observer's target.

**Why two layers:** the page chrome (table of contents, Context drawer) and the talk player float over the Slides and take no columns, so every Slide gets the full viewport width. The Foreground, inset by the Content area, never sits under them; the Backdrop keeps the whole width, so a glow or image never ends at a column edge. Widening the right inset when the drawer sits beside the Slides moves only the Foreground.

**Why a grid:** reading mode looks like flow layout, but a future overview mode re-tiles the same cells into columns without new markup.

**Why a server wrapper and a client mount:** the wrapper carries anchor and min-height, so it must be in the static HTML for deep links, print and crawlers. Only "mount or not" needs JavaScript.

**Why three zones, two thresholds:** `far` (unmounted, height kept), `near` (mounted, paused), `active` (mounted, playing, highlighted). The reading line decides `active`; a wider margin decides `near`, so content is ready before it arrives. One threshold gives either pop-in or a premature highlight. One observer runs both, so the reading-line rule runs once.

**Unmount discards Scene state, by choice;** persisting it is a Scene concern. The shared entrance lives in the page's zone store, so it plays once.

**Insets.** The container sets `--inset-l` and `--inset-r`. Below `md`: `1rem` and `1rem`. From `md`, left is the table of contents' width plus its gap (`21rem`); right is `3rem`, or `--drawer-width` plus `4rem` when the drawer is beside and open (beside applies from `xl`; below it the drawer overlays). Insets never transition.

**Backdrop contract.** `SlideBackdrop` covers the wrapper's padding box at `-z-10`, with `overflow: hidden`, `pointer-events: none` and `aria-hidden`. It is hidden below `md` unless `mobile`, hidden in print, and sits inside the mount, so far content drops it. Parallax shows its resting state under reduced motion. A Foreground element MAY break out to the full width with negative inset margins, explicitly.

**Ladder, lowest to highest:**

| Layer                                                                              | z    |
| ---------------------------------------------------------------------------------- | ---- |
| Backdrop (inside the `isolate` wrapper)                                            | -10  |
| Foreground                                                                         | auto |
| From `md`: table of contents, drawer card (non-modal), talk player, drawer trigger | 40   |
| Episode portal root (popovers), site header                                        | 50   |
| Scrim (below `md`)                                                                 | 60   |
| Drawer card below `md`, sheets                                                     | 70   |

The card stays at 40 from `md` so a popover on the portal root (50) still shows above it. Modals are native `<dialog>`s in the top layer and take no z-index.

A new layer picks a rung here. The `isolate` wrapper would trap a popover under the table of contents or drawer, hence the portal root.

**Reserved, not built:** overview mode; guided-tour popovers (only the portal root exists); keyboard landing on a scroll target distinct from the wrapper's top.

## Decision

### 1. The split

1. The Slide wrapper MUST own a Slide's mechanics: anchor, width, min-height, mount boundary, stacking, zone.
2. The Scene's shape MUST stay ungoverned; only token values, §6–§8 and design-ADR-0012 apply.

### 2. Content area

1. Slides MUST render inside one Content area: a full-width single-column grid, one cell per wrapper.
2. It MUST own vertical rhythm and the insets; a wrapper MUST NOT declare margins, gaps or padding.
3. Elements between Content area and wrapper MUST use `display: contents`.
4. It MUST host the Episode portal root.

### 3. Slide wrapper

1. `SlideWrapper` MUST be a server component, so anchors reach static HTML.
2. It MUST be full width, grow with its content, never clip, and be `isolate`: a page Slide at least viewport height, a section slide at least `40svh`.

### 4. SlideMount

1. `SlideMount` MUST be a client leaf inside the wrapper, rendering children only outside `far` and keeping the wrapper's height.
2. It MUST provide its Slide id for `useSlideZone()`.

### 5. One observer

1. The Slide observer MUST be the only `src/` code creating an `IntersectionObserver`, besides the one-shot reveal hook.
2. The reading line alone decides `active`; a wider approach margin decides `near` only.
3. Zones MUST live in one page-level store, so a new Episode starts fresh.

### 6. Good citizen

1. A looping island MUST pause outside `active`, and in a Backdrop also while hidden or under reduced motion. One-shot entrances are exempt.
2. `SlideMount`'s `data-zone` and its values MUST stay a stable CSS hook for entrance motion on an Episode with `header: 'authored'`.
3. The page tone mark (FE-004 §5.4) MUST be set only while its Title slide is `active` and cleared when the Slide leaves `active`, or unmounts.

### 7. Backdrop

1. A Backdrop MUST use `SlideBackdrop`, decoration only.

### 8. Stacking ladder

1. Layers MUST follow the ladder; popovers MUST use the portal root.

## Do's and Don'ts

### Do's

1. **DO** add rhythm, gaps and grid changes on the Content area only. (Decision 2)
2. **DO** let tall Slides grow the page. (Decision 3)
3. **DO** read a Slide's zone with `useSlideZone()` in any looping island. (Decisions 4 and 6)
4. **DO** portal popovers into the Episode portal root. (Decision 8)
5. **DO** put full-bleed decoration in `SlideBackdrop`, and opt a cheap one into phones with `mobile`. (Decision 7)
6. **DO** take z-index values from the ladder. (Decision 8)
7. **DO** put zone and threshold maths beside the reading-line rule in a `.pure.ts`. (Decision 5)
8. **DO** key a Slide's CSS entrance motion on `[data-zone='active']`, only with `header: 'authored'`. (Decision 6)

### Don'ts

1. **DON'T** use a Slide heading as an anchor or observer target. (Decision 1)
2. **DON'T** clip a wrapper or give it an inner scrollbar. (Decision 3)
3. **DON'T** create another `IntersectionObserver`, or use the reveal hook inside an Episode. (Decision 5)
4. **DON'T** flatten the Content area to flow layout. (Decision 2)
5. **DON'T** let a looping animation run in `near` or `far`. (Decision 6)
6. **DON'T** add a rule that shapes a Scene's markup, props or layout; only token values, §6–§8 and design-ADR-0012 reach in. (Decision 1)
7. **DON'T** pad, transition or margin a wrapper for the insets; set `--inset-l` and `--inset-r` and let the Content area apply them. (Decision 2)
8. **DON'T** put reader-needed content, links or text in a Backdrop. (Decision 7)
9. **DON'T** render a popover inside a Scene's own subtree. (Decision 8)

## Consequences

**Positive:**

1. **Free Scene:** headings and visuals sit anywhere without moving navigation, and a Backdrop reaches both viewport edges.
2. **Light long Episodes:** far content leaves the DOM; the wrapper keeps the scroll height.
3. **No pop-in, no early highlight:** two thresholds, one observer.
4. **One scrollbar:** wrappers never clip, so only the page scrolls.
5. **Overview-ready:** the grid re-tiles cells without new markup.

**Negative:**

1. **State resets on return:** interactive Scene state is lost when a Slide goes `far`.
2. **Two margins to tune** across breakpoints, now as two inset variables.
3. **Beside reflows the Foreground:** the right inset widens once per open and close.
4. **Pausing is a duty, not a mechanism:** the wrapper can't see inside the Scene.
5. **Hydration mounts everything once:** an unreported Slide reads `near`; the first observer callback only removes content.

**Risks:**

1. **A non-grid element between Content area and wrapper breaks the cells.** **Mitigation:** §2.3; the post-build test checks wrappers are grid children.
2. **Unclipped content bleeds into the next Slide.** **Mitigation:** the Scene manages its own bounds; browser check at 375px and 1440px.
3. **A wrapper's stacking context traps a popover under the table of contents or drawer.** **Mitigation:** §8.1 requires the portal root; the ladder is written down once.
4. **A `far` Slide's kept height goes stale after a resize.** **Mitigation:** the mount re-measures while mounted; a jump is a browser-check step.

## Compliance and Enforcement

1. **Unit tests:** zone derivation; wrapper and mount contracts.
2. **Lint:** `new IntersectionObserver` refused outside the Slide observer and the reveal hook (§5.1).
3. **Post-build test:** Content area grid, portal root, wrappers as grid children carrying `isolate`, Backdrops `aria-hidden` inside their wrapper and hidden in print, the old three-column grid class absent, anchors in static HTML (§2, §3, §7).
4. **Browser check:** `visual-check` DOM numbers at 375, 1100 and 1440px with the drawer beside, over and closed: the Backdrop is as wide as the viewport; the Foreground is clear of the table of contents, drawer and talk player (§2, §7).

**Exception (§5.1):** the reveal hook observes once to stagger in the landing page's About cards, then disconnects. It reports to no page service and writes no zone, so it can't compete for `active`.

**Manual review duties:** looping islands pause outside `active` (§6); the reveal hook isn't imported under an Episode (§5.1); no `overflow` on wrappers; `SlideMount` and the observer are reached only from the container (§4, §5); the Scene stays ungoverned apart from token values, §6–§8 and design-ADR-0012; z-index values match §8; looping Backdrop content pauses while hidden (§6). **Browser check:** far content absent with no scroll-height jump; a looping demo pauses and resumes.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md) — Scene, Backdrop, Foreground, Page chrome.
- [design-ADR-0012](../../docs/adr/0012-slide-header-and-play-once-motion.md) — the Slide header, the play-once entrance, the hover vocabulary.
- [MDN IntersectionObserver `rootMargin`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin), [MDN `display: contents`](https://developer.mozilla.org/en-US/docs/Web/CSS/display#contents).

### Terms

**Content area**: the single-column grid that holds an Episode's Slide wrappers, spans the viewport, owns the spacing between Slides and the inline insets of every wrapper, and hosts the Episode's portal root.

**Slide wrapper**: the server-rendered box around one Slide that holds its mechanics: anchor, full viewport width, at least viewport height (a section slide `40svh`), never clipping, its own stacking context, and the mount that drops far content.
