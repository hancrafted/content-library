---
type: adr
id: FE-009
title: 'Slide Frame'
domain: frontend
rules: false
files: ['src/components/{episode*,slide-master}/**', 'src/hooks/**', 'src/lib/{slide-zone,reading-line}.pure*.ts']
paths: ['src/components/{episode*,slide-master}/**', 'src/hooks/**', 'src/lib/{slide-zone,reading-line}.pure*.ts']
description: 'Wrapper owns mechanics, canvas owns creativity: a single-column Content area, a server Slide wrapper that never clips, a client SlideMount that drops far content, one observer with two thresholds, and a pause duty for looping animation.'
---

# Slide Frame

## Context

An Episode stacks many Slides, some heavy (charts, looping demos). Navigation needs every Slide to be a stable, measurable box; a visualisation needs total freedom inside it. The two conflict only if one element serves both.

**The split:** the Slide wrapper owns mechanics — anchor, height, mount boundary. The Canvas inside is ungoverned. A heading may sit centred, top or lower right, so it is never an anchor: placement would move the observer's target.

**Why a grid:** reading mode looks like flow layout, but a future overview mode re-tiles the same cells into columns without new markup.

**Why a server wrapper and a client mount:** the wrapper carries anchor and min-height, so it must be in the static HTML for deep links, print and crawlers. Only "mount or not" needs JavaScript.

**Why three zones, two thresholds:** `far` (unmounted, height kept), `near` (mounted, paused), `active` (mounted, playing, highlighted). The reading line decides `active`; a wider margin decides `near`, so content is ready before it arrives. One threshold gives either pop-in or a premature highlight. One observer runs both, so the reading-line rule runs once.

**Unmount discards state, by choice:** a played animation replays on return; persisting it is a Canvas concern.

**Reserved, not built:** overview mode; guided-tour popovers (only the portal root exists); keyboard landing on a scroll target distinct from the wrapper's top.

## Decision

### 1. The split

1. The Slide wrapper MUST own a Slide's mechanics: anchor, min-height, mount boundary, zone.
2. The Canvas MUST stay ungoverned; nothing here constrains markup inside `SlideMount`.

### 2. Content area

1. Slides MUST render inside one Content area: a single-column grid, one cell per Slide wrapper.
2. The Content area MUST own vertical rhythm; a wrapper MUST NOT declare outer margins or gaps.
3. Grouping elements between Content area and wrapper (the Section `<section>`) MUST use `display: contents`.
4. The Content area MUST host the Episode portal root.

### 3. Slide wrapper

1. `SlideWrapper` MUST be a server component rendered by the container from one record entry, taking the id its position gives it.
2. It MUST be at least viewport height, grow with its content and never clip — no `overflow: hidden | auto | scroll`.

### 4. SlideMount

1. `SlideMount` MUST be a client leaf inside the wrapper that renders its children only outside `far`, keeping the wrapper's height while unmounted.
2. It MUST provide its Slide id to its subtree, so `useSlideZone()` reads that Slide's zone.

### 5. One observer

1. The Slide observer MUST be the only code under `src/` creating an `IntersectionObserver`, besides the one-shot reveal hook; the Title slide's id (`top`) leads its ids.
2. Its reading-line threshold decides `active` and reports the reading Slide to the page service; its approach threshold decides `near` and touches nothing else.
3. It MUST write zones to one page-level zone store, so a new Episode starts fresh.

### 6. Good citizen

1. A continuously animating island (loop, video, simulation) MUST pause outside `active`, reading `useSlideZone()`. One-shot entrance animations are exempt.

## Do's and Don'ts

### Do's

1. **DO** add rhythm, gaps and grid changes on the Content area only. (Decision 2)
2. **DO** let tall Slides grow the page. (Decision 3)
3. **DO** read a Slide's zone with `useSlideZone()` in any looping island. (Decisions 4 and 6)
4. **DO** portal popovers into the Episode portal root. (Decision 2)
5. **DO** put zone and threshold maths beside the reading-line rule in a `.pure.ts`. (Decision 5)

### Don'ts

1. **DON'T** use a Slide heading as an anchor or observer target. (Decision 1)
2. **DON'T** clip a wrapper or give it an inner scrollbar. (Decision 3)
3. **DON'T** create another `IntersectionObserver`, or use the reveal hook inside an Episode. (Decision 5)
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
3. **Pausing is a duty, not a mechanism:** the wrapper can't see inside the Canvas.
4. **Hydration mounts everything once:** an unreported Slide reads `near`; the first observer callback only removes content.

**Risks:**

1. **A non-grid element between Content area and wrapper breaks the cells.** **Mitigation:** §2.3; the post-build test checks wrappers are grid children.
2. **Unclipped content bleeds into the next Slide.** **Mitigation:** the Canvas manages its own bounds; browser check at 375px and 1440px.
3. **A `far` Slide's kept height goes stale after a resize.** **Mitigation:** the mount re-measures while mounted; a jump is a browser-check step.

## Compliance and Enforcement

1. **Unit tests:** zone derivation; wrapper and mount contracts.
2. **Lint:** `new IntersectionObserver` refused outside the Slide observer and the reveal hook (§5.1).
3. **Dependency rules:** `SlideMount` and the observer are client leaves reached from the container (§4, §5).
4. **Post-build test:** Content area grid, portal root, wrappers as grid children, anchors in static HTML (§2, §3).

**Exception (§5.1):** the reveal hook observes once to stagger in the landing page's About cards, then disconnects. It reports to no page service and writes no zone, so it can't compete for `active`.

**Manual review duties:** looping islands pause outside `active` (§6); the reveal hook isn't imported under an Episode (§5.1); no `overflow` on wrappers; the Canvas stays ungoverned. **Browser check:** far content absent with no scroll-height jump; a looping demo pauses and resumes.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`GLOSSARY.md`](../../GLOSSARY.md) — Content area, Slide wrapper, Canvas, Zone.
- [MDN IntersectionObserver `rootMargin`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin), [MDN `display: contents`](https://developer.mozilla.org/en-US/docs/Web/CSS/display#contents).
