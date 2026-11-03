---
type: adr
id: FE-009
title: 'Slide Wrapper and Scene'
domain: frontend
rules: false
files: ['src/episodes/**', 'src/shared/hooks/**', 'src/shared/lib/reading-line.pure*.ts']
paths: ['src/episodes/**', 'src/shared/hooks/**', 'src/shared/lib/reading-line.pure*.ts']
description: 'Wrapper owns mechanics, stable geometry and local presentation hosts; Scene owns creativity in Backdrop and Foreground. One Content area owns insets, the server wrapper never clips, SlideMount drops far Scenes with height kept, one observer owns zones, and local layers stay below chrome.'
---

# Slide Wrapper and Scene

## Context

Navigation needs stable, measurable Slide boxes; visualisations need freedom inside them. Wrapper mechanics and Scene creativity have separate owners.

**The split:** the server wrapper owns anchors, sizing, mount boundary, stacking, geometry and local presentation hosts. It renders the header and entrance governed by design-ADR-0012. The Scene stays free: full-bleed **Backdrop**, inset **Foreground**. Headings are never anchors or measurement targets. An outgoing edge host stays available for its geometric interval inside its wrapper, independently of Scene mounting.

**Two Scene layers:** chrome floats over full-width Slides. Content-area insets keep the Foreground clear; Backdrops stay full-bleed. The beside drawer widens only the right Foreground inset.

**Grid:** one cell per wrapper supports overview re-tiling without new markup.

**Server wrapper, client leaves:** anchors and min-height reach static HTML for deep links, print and crawlers. Client leaves own mounting and presentation measurements; the container stays server.

**Zones:** `far` drops Scene content with height kept; `near` mounts paused; `active` plays and highlights. One observer uses the reading line for `active`, a wider margin for `near`, avoiding pop-in and premature highlighting.

**Scene state** resets on unmount unless the Scene persists it. The page zone store holds the play-once entrance.

**Insets:** container sets `--inset-l`/`--inset-r`: `1rem` each below `md`; from `md`, left `21rem`, right `3rem`. Beside/open drawer from `xl`: right `--drawer-width + 4rem`; below `xl` it overlays. Insets never transition.

**Backdrop:** `SlideBackdrop` covers the wrapper padding box at `-z-10`: clipped, `pointer-events: none`, `aria-hidden`, hidden in print and below `md` unless `mobile`. Looping decoration pauses outside `active`, while hidden and under reduced motion; parallax rests under reduced motion. A Scene Backdrop drops with its mount; surface/effect lifetime is independent. A Foreground element MAY explicitly break out with negative inset margins.

**Ladder, lowest to highest:**

| Layer                                                                              | z    |
| ---------------------------------------------------------------------------------- | ---- |
| Surface (inside the `isolate` wrapper)                                             | -20  |
| Rear Backdrop decoration (inside the wrapper)                                      | -10  |
| Primary Scene content (inside the wrapper)                                         | auto |
| Resolved outgoing edge effect (inside the wrapper)                                 | 10   |
| Front decoration (inside the wrapper)                                              | 20   |
| From `md`: table of contents, drawer card (non-modal), talk player, drawer trigger | 40   |
| Episode portal root (popovers), site header                                        | 50   |
| Scrim (below `md`)                                                                 | 60   |
| Drawer card below `md`, sheets                                                     | 70   |

Native `<dialog>`s occupy the top layer without z-index. Portal popovers stay above non-modal cards.

The five local layers stay ordered inside their isolating wrapper below chrome. Primary content cannot escape its rung; effects never become Episode overlays. Popovers escape through the portal root. Every new layer picks a rung here.

**Reserved, not built:** overview mode; guided-tour popovers (only the portal root exists); keyboard landing on a scroll target distinct from the wrapper's top.

## Decision

### 1. The split

1. The server wrapper MUST own stable geometry, local presentation hosts and mechanics: anchor, width, min-height, mount boundary, stacking, zone.
2. The Scene's shape MUST stay ungoverned; only token values, §6–§8 and design-ADR-0012 apply.

### 2. Content area

1. Slides MUST render inside one Content area: a full-width single-column grid, one cell per wrapper.
2. It MUST own vertical rhythm and the insets; a wrapper MUST NOT declare margins, gaps or padding.
3. Elements between Content area and wrapper MUST use `display: contents`.
4. It MUST host the Episode portal root.

### 3. Slide wrapper

1. `SlideWrapper` MUST be a server component, so anchors reach static HTML.
2. It MUST be full width, grow with its content, never clip, and be `isolate`: a page Slide at least viewport height, a section slide at least `40svh`.
3. A resolved edge host MUST remain available throughout its geometric interval independently of Scene mounting, inside the outgoing wrapper's stacking context.

### 4. SlideMount

1. `SlideMount` MUST be a client leaf inside the wrapper, rendering removable Scene content only outside `far` with height kept. Surface/effect lifetime MUST be independent.
2. It MUST provide its Slide id for `useSlideZone()`.

### 5. One observer

1. The Slide observer MUST be the only `src/` code creating an `IntersectionObserver`, besides the one-shot reveal hook.
2. The reading line alone decides `active`; a wider approach margin decides `near` only.
3. Zones MUST live in one page-level store, so a new Episode starts fresh.

### 6. Good citizen

1. A looping island MUST pause outside `active`, and in a Backdrop also while hidden or under reduced motion. One-shot entrances are exempt.
2. `SlideMount`'s `data-zone` and its values MUST stay a stable CSS hook for entrance motion on an Episode with `header: 'authored'`.
3. One page-instance adapter MUST own tone publication/cleanup from authored surfaces and geometry, independently of zones or effect selection; it MUST preserve zone/active-Slide authority.

### 7. Backdrop

1. Rear decoration MUST use `SlideBackdrop`, decoration only, preserving clipping, pointer pass-through, assistive exclusion, mobile opt-in, print exclusion and pause duties.

### 8. Stacking ladder

1. Layers MUST follow the ladder, all five local rungs inside the isolating wrapper below chrome; effects MUST NOT become Episode overlays. Popovers MUST use the portal root.

## Do's and Don'ts

### Do's

1. **DO** add rhythm, gaps and grid changes on the Content area only. (Decision 2)
2. **DO** let tall Slides grow the page. (Decision 3)
3. **DO** read a Slide's zone with `useSlideZone()` in any looping island. (Decisions 4 and 6)
4. **DO** portal popovers into the Episode portal root. (Decision 8)
5. **DO** use `SlideBackdrop`; opt cheap decoration into phones with `mobile`. (Decision 7)
6. **DO** take z-index values from the ladder. (Decision 8)
7. **DO** keep zone/threshold maths beside the reading-line `.pure.ts`. (Decision 5)
8. **DO** key a Slide's CSS entrance motion on `[data-zone='active']`, only with `header: 'authored'`. (Decision 6)
9. **DO** retain outgoing hosts for their geometric interval, independently of Scenes. (Decision 3, Decision 4)
10. **DO** publish/clean up geometry-driven tone through one page adapter. (Decision 6)

### Don'ts

1. **DON'T** use a Slide heading as an anchor or observer target. (Decision 1)
2. **DON'T** clip a wrapper or give it an inner scrollbar. (Decision 3)
3. **DON'T** create another `IntersectionObserver`, or use the reveal hook inside an Episode. (Decision 5)
4. **DON'T** flatten the Content area to flow layout. (Decision 2)
5. **DON'T** let a looping animation run in `near` or `far`. (Decision 6)
6. **DON'T** govern Scene shape beyond tokens, §6–§8 and design-ADR-0012. (Decision 1)
7. **DON'T** pad, transition or margin wrapper insets; Content area applies `--inset-l`/`--inset-r`. (Decision 2)
8. **DON'T** put reader-needed content, links or text in a Backdrop. (Decision 7)
9. **DON'T** render a popover inside a Scene's own subtree. (Decision 8)
10. **DON'T** tie host lifetime to a removable Scene/Backdrop. (Decision 3, Decision 4, Decision 7)
11. **DON'T** lift effects/front decoration outside local rungs. (Decision 8)

## Consequences

**Positive:**

1. **Free Scene:** heading placement never moves navigation; Backdrops reach viewport edges.
2. **Light long Episodes:** far content leaves the DOM; the wrapper keeps the scroll height.
3. **No pop-in/early highlight:** two thresholds, one observer.
4. **One scrollbar:** unclipped wrappers.
5. **Overview-ready:** grid re-tiles existing cells.
6. **Stable presentation:** hosts survive Scene unmount.

**Negative:**

1. **State resets on return:** interactive Scene state is lost when a Slide goes `far`.
2. **Two insets to tune** across breakpoints.
3. **Beside reflows the Foreground:** the right inset widens once per open and close.
4. **Pausing is a Scene duty:** the wrapper cannot enforce it.
5. **Hydration mounts everything once:** an unreported Slide reads `near`; the first observer callback only removes content.
6. **Separate lifetimes:** mounts cannot own edge-renderer availability.

**Risks:**

1. **Intermediate elements break grid cells.** **Mitigation:** §2.3; post-build grid-child checks.
2. **Content bleeds into neighbours.** **Mitigation:** Scene-managed bounds; browser checks at 375px/1440px.
3. **Isolated popovers sit below chrome.** **Mitigation:** §8 requires the portal root.
4. **Kept height goes stale.** **Mitigation:** mounted remeasurement and browser checks for resize jumps.

## Compliance and Enforcement

1. **Unit tests:** zone derivation; wrapper and mount contracts.
2. **Lint:** `new IntersectionObserver` refused outside the Slide observer and the reveal hook (§5.1).
3. **Post-build test:** Content area grid, portal root, wrappers as isolated grid children, Backdrops assistively hidden and absent in print, no three-column grid, static anchors (§2, §3, §7).
4. **Browser check:** DOM numbers at 375, 1100 and 1440px, drawer beside/over/closed: viewport-wide Backdrop, Foreground clear of chrome (§2, §7).

**Exception (§5.1):** the landing About-card reveal hook observes once, then disconnects; no page-service report or zone write.

**Review:** pause duties (§6); no Episode reveal hook (§5); unclipped wrappers; container-only mount/observer reach (§4, §5); free Scenes except tokens, §6–§8 and design-ADR-0012; ordered local layers (§8); full-interval Scene-independent hosts (§3, §4, §7); one tone/cleanup adapter, preserved active-Slide authority (§6). **Browser:** far Scenes absent without height jumps, loops pause/resume, separate simultaneous edge hosts.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Presentation boundary](../../docs/adr/0022-slide-presentation-and-transition-clock.md) — accepted contracts.
- [`GLOSSARY.md`](../../GLOSSARY.md) — Scene layers and chrome.
- [design-ADR-0012](../../docs/adr/0012-slide-header-and-play-once-motion.md) — the Slide header, the play-once entrance, the hover vocabulary.
- [MDN IntersectionObserver `rootMargin`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin), [MDN `display: contents`](https://developer.mozilla.org/en-US/docs/Web/CSS/display#contents).

### Terms

**Content area**: viewport-wide single-column grid owning Slide spacing, wrapper insets and the Episode portal root.

**Slide wrapper**: server box owning a Slide's mechanics, stable geometry, local hosts and Scene mount; full-width, content-growing, isolated, never clipping, height kept while far.
