---
type: adr
id: FE-009
title: 'Slide Frame'
domain: frontend
rules: false
# prettier-ignore
files: ['src/components/episode/**', 'src/components/episodes/**', 'src/hooks/use-slide-zone*', 'src/hooks/use-revealed-on-view.ts', 'src/lib/slide-zone.pure*', 'src/lib/reading-line.pure*', 'src/app/globals.css', 'eslint.config.mjs', '.dependency-cruiser.cjs', 'tests/post-build/episode-structure.build.test.ts']
# prettier-ignore
paths: ['src/components/episode/**', 'src/components/episodes/**', 'src/hooks/use-slide-zone*', 'src/hooks/use-revealed-on-view.ts', 'src/lib/slide-zone.pure*', 'src/lib/reading-line.pure*', 'src/app/globals.css', 'eslint.config.mjs', '.dependency-cruiser.cjs', 'tests/post-build/episode-structure.build.test.ts']
description: 'Wrapper owns mechanics, canvas owns creativity: a single-column Content area, a server Slide wrapper that never clips, a client SlideMount that drops far content, one observer with two thresholds, and a pause duty for looping animation.'
---

# Slide Frame

## Context

**Status: proposal** ([#11](https://github.com/hancrafted/content-library/issues/11)). Supersedes the FE-011 and FE-012 proposals from the Slide frame prototypes, which were never merged; their numbers are not reused.

An Episode stacks many Slides, some heavy (charts, looping demos). Navigation needs every Slide to be a stable, measurable box; a visualisation needs total freedom inside it. Those demands conflict only if one element serves both.

**The split: the wrapper owns mechanics, the Canvas owns creativity.** The Slide wrapper is governed by position: anchor, height, mount boundary. The Canvas inside is governed by nothing (FE-007 §4). A Slide heading may sit centred, top or lower right, so it is never a mechanical anchor: content placement would move the observer's target. The wrapper anchors instead.

**Why a grid.** The Content area is a single-column CSS grid, one cell per Slide. Reading mode looks like flow layout, but a future overview mode re-tiles the same cells into columns without restructuring markup. A flattened flow layout would cost that.

**Why a server wrapper and a client mount.** The wrapper carries the anchor and the min-height, so it must exist in the static HTML for deep links, print and crawlers (FE-005, FE-006). Only the decision "mount or not" needs JavaScript, so a small `SlideMount` inside it holds that.

**Why three zones, two thresholds.** `far` (content unmounted, wrapper keeps its height), `near` (mounted, paused) and `active` (mounted, playing, highlighted). The reading line (`src/lib/reading-line.pure.ts`) decides `active`; a wider approach margin decides `near`, so content is ready before it arrives. One threshold gives either a pop-in or a premature highlight. Both come from one observer, so the reading-line rule runs once ([FE-001](./FE-001-state-management.md)).

**Unmount discards state, by choice.** A played animation replays on return. That is chosen, not discovered; persisting it is a Canvas concern outside the wrapper.

**Title slide:** its id leads the observer's ids, so scrolling back makes it `active`, clears the previous Slide and pauses looping islands. **Cost of the `near` default:** an unreported Slide reads `near`, so hydration mounts every Slide's content once; the first observer callback only removes content.

**Reserved, not built:** overview mode (disables the observer, re-tiles the grid); guided-tour popovers (only the portal root exists); keyboard landing, a scroll target distinct from the wrapper's top, so an arrow-key jump to a Slide with a centred heading does not land on empty space.

## Decision

### 1. The split

1. The Slide wrapper MUST own a Slide's mechanics: anchor, min-height, mount boundary, zone.
2. The Canvas MUST stay ungoverned (FE-007 §4); no rule here constrains markup inside `SlideMount`.

### 2. Content area

1. Slides MUST render inside one Content area: a single-column grid (`grid grid-cols-1`), one cell per Slide wrapper.
2. The Content area MUST own vertical rhythm; a wrapper MUST NOT declare outer margins or gaps.
3. Grouping elements between the Content area and a wrapper (the Section `<section>`) MUST use `display: contents`.
4. The Content area MUST host the Episode portal root (`data-slot="portal-root"`).

### 3. Slide wrapper

1. `SlideWrapper` MUST be a server component rendered by `EpisodePageContainer` from one record entry, receiving its id from `slideAnchor()` (FE-002 §2); it declares nothing itself.
2. It MUST be at least viewport height (`min-h-svh`), grow with its content and never clip: no `overflow: hidden | auto | scroll` on it.

### 4. SlideMount

1. `SlideMount` MUST be a `*.client.tsx` leaf inside the wrapper that renders its children only outside `far`, keeping the wrapper's measured height while unmounted.
2. It MUST provide its Slide id to its subtree, so `useSlideZone()` reads that Slide's zone.

### 5. One observer

1. One Slide observer component per Episode page (two instances, one per threshold) MUST be the only code under `src/` creating an `IntersectionObserver` but the reveal hook; the Title slide's id (`top`) leads its ids.
2. Its reading-line threshold decides `active` and MUST call the page service's `reportReading(id)` (FE-001 §2); its approach threshold decides `near` and touches nothing else.
3. It MUST write zones to one zone store provided at page level, so a new Episode starts fresh.

### 6. Good citizen

1. A continuously animating island (loop, video, simulation) MUST pause outside `active`, reading `useSlideZone()`. One-shot entrance animations are exempt.

## Do's and Don'ts

### Do's

1. **DO** add rhythm, gaps and grid changes on the Content area only. (Decision 2)
2. **DO** let tall Slides grow the page. (Decision 3)
3. **DO** read a Slide's zone with `useSlideZone()` in any looping island. (Decision 4, Decision 6)
4. **DO** portal popovers into the Episode portal root. (Decision 2)
5. **DO** put zone and threshold maths in `src/lib/slide-zone.pure.ts`, beside the reading-line rule. (Decision 5)

### Don'ts

1. **DON'T** use a Slide heading as an anchor or observer target. (Decision 1)
2. **DON'T** clip a wrapper or give it an inner scrollbar. (Decision 3)
3. **DON'T** create an `IntersectionObserver` outside the Slide observer and the one-shot reveal hook, or use the reveal hook (`src/hooks/use-revealed-on-view.ts`) inside an Episode. (Decision 5)
4. **DON'T** flatten the Content area to flow layout. (Decision 2)
5. **DON'T** let a looping animation run in `near` or `far`. (Decision 6)
6. **DON'T** add a rule that reaches inside the Canvas. (Decision 1)

## Consequences

**Positive:**

1. **Free Canvas:** headings and visuals sit anywhere without moving navigation.
2. **Light long Episodes:** far content leaves the DOM; the wrapper keeps the scroll height.
3. **No pop-in, no early highlight:** two thresholds, one observer.
4. **One scrollbar:** wrappers never clip, so only the page scrolls.
5. **Overview-ready:** the grid re-tiles cells without new markup.

**Negative:**

1. **State resets on return:** interactive Canvas state is lost when a Slide goes `far`.
2. **Two margins to tune** across breakpoints.
3. **Pausing is a duty, not a mechanism:** the wrapper cannot see inside the Canvas.

**Risks:**

1. **A non-grid element between Content area and wrapper breaks the cells.** **Mitigation:** Decision 2.3; the post-build test checks wrappers are grid children.
2. **Unclipped content bleeds into the next Slide.** **Mitigation:** the Canvas manages its own bounds; browser verification at 375px and 1440px.
3. **The height kept for a `far` Slide is stale after a resize.** **Mitigation:** the mount re-measures while mounted; a jump is a browser-verification step.

## Compliance and Enforcement

**Enforcers, earliest first:**

1. **Fast** (`npm run verify`): zone derivation tests beside `src/lib/slide-zone.pure.ts`; wrapper and mount contract tests under `src/components/episode/`.
2. **Lint** (`eslint.config.mjs`, [#13](https://github.com/hancrafted/content-library/issues/13)): `no-restricted-syntax` on `new IntersectionObserver` outside the Slide observer and the reveal hook, each exempted by its own `files:` block; baseline in FE-001.
3. **Boundary** (`.dependency-cruiser.cjs`, FE-006): `SlideMount` and the observer are client leaves reached from the container.
4. **Post-build** (`npm run test:build`): `tests/post-build/episode-structure.build.test.ts` checks the Content area grid, the portal root, wrappers as grid children and anchors in the static HTML.

**Amended exception (§5.1):** `src/hooks/use-revealed-on-view.ts` is the reveal hook. It observes once to stagger in the landing page's About cards and start their count-up, then disconnects. It reports to no page service and writes no zone, so it cannot compete with the Slide observer for `active`.

**Manual review duties:** looping islands pause outside `active` (§6); the reveal hook is not imported under an Episode (§5.1); no `overflow` on wrappers; the Canvas stays ungoverned. **Browser verification:** far content absent with no scroll-height jump; a looping demo pauses and resumes.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [FE-001 State Management](./FE-001-state-management.md), [FE-002 Episode Page](./FE-002-episode-page.md), [FE-005 Static Export Contract](./FE-005-static-export-contract.md), [FE-006 Server/Client Boundary](./FE-006-server-client-boundary.md), [FE-007 Module Layering](./FE-007-module-layering.md), [FE-010 Context Drawer](./FE-010-context-drawer.md).
- [`GLOSSARY.md`](../../GLOSSARY.md) — Content area, Slide wrapper, Canvas, Zone.
- [MDN IntersectionObserver `rootMargin`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin), [MDN `display: contents`](https://developer.mozilla.org/en-US/docs/Web/CSS/display#contents).
