---
type: feature-guide
title: Slide library
stale_after: 2027-01-13T00:00:00Z
---

# Slide library

Every Master slide a Slide can copy from the Slide master Episode (`src/episodes/tooling/slide-master/slides/`, `cp -r`), and the motions the library holds. The `write-spec` designers pick from it, and a vitest keeps the headings below equal to the folders.

Each entry has three lines.

- _Shows_: a fact taken from the code.
- _When_: when to use it. <!-- draft: Han edits --> The _When_ lines are drafts from the code and from how earlier Episodes used each Master slide.
- _Motion_: starts with the `motion:` value a copy of the Master slide carries, `none` or `local` (no library motions exist yet), then the motion the Master slide has today, read from its CSS and client parts. Every motion here is a CSS transition, keyframe or scroll-driven animation, except the `radial-cycle` hand, which a client part turns with the Web Animations API (`element.animate`). Elsewhere a client part only flips a state or a play state, as FE-009 describes, or, in `grid-3x2`, writes the pointer position into two CSS variables that a CSS transition then shows. `grid-2x3`, `horizontal-gantt`, `horizontal-rail` and `metro-map` run their entrance as a CSS transition that a client part latches on once, when the Slide first becomes `active`.

A Slide whose motion is only hover is a hover transition, not an animation, and [the design guide](design-guide.md) lists "motion reduced to hover" under "Not this". Under the Editorial style it is a weak starting point: add an entrance or a scroll-driven motion.

Entrances here predate the Motion rule in [the design system](design-system.md), which keys an entrance on `[data-zone='active']` and replays it when the reader returns. These Slides latch and do not replay. A new local motion follows the design system's Motion rule, not these Slides.

Motion rules and the reasons behind them live in [the design system](design-system.md).

## grid-1x1

- _Shows_: One feature cell across the whole Foreground: a tall poster tile with title and caption set bottom-left over a soft gradient in the primary and foreground colours.
- _When_: A single idea that earns the whole Slide: an opening claim, a definition, a quote-sized statement. Not for comparing things. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: drifts the gradient a few percent (a CSS transition, instant under reduced motion). No entrance.

## grid-1x2

- _Shows_: Two facing halves, each with a title and caption.
- _When_: A pairing or contrast of exactly two things: before and after, this and that. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: on one half dims the other (CSS only). No entrance.

## grid-1x3

- _Shows_: Three feature columns on hairlines, each with an oversized numeral, a title and a caption.
- _When_: Three parallel points that are not a sequence, such as three principles or three benefits. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: grows an accent stub along the hairline above the column (CSS only). No entrance.

## grid-2x1

- _Shows_: Two full-width banner rows, each with an index, a title, a caption and an arrow.
- _When_: Two items that each need a sentence of explanation and read top to bottom. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: tints the row and slides the arrow in (CSS only). No entrance.

## grid-2x2

- _Shows_: A quadrant matrix: four cells around an axis cross, each with a title and caption.
- _When_: A two-axis split, such as two dimensions with two values each. Only when the axes carry meaning. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: tints a quadrant and lights the axis arms next to it (CSS only). No entrance.

## grid-2x3

- _Shows_: Six filled tonal cards with an icon chip, a title and a caption.
- _When_: Six parallel items of equal weight, such as a checklist of capabilities or six factors. <!-- draft: Han edits -->
- _Motion_: `motion: local`. A staggered fade-in once when the Slide first becomes active, then a hover lift. Under reduced motion the cards are simply there.

## grid-3x1

- _Shows_: Three agenda rows, each with an italic ordinal, a title and a caption.
- _When_: Three items in reading order that stay short, such as an agenda or three steps in a talk. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: indents the row and colours its ordinal (CSS only). No entrance.

## grid-3x2

- _Shows_: Six outlined cards on a dotted surface, each with an index, a title and a caption.
- _When_: Six parallel items when the Slide should feel technical and light, such as features of a tool. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: a spotlight follows the pointer along each card border. Static under reduced motion. No entrance.

## grid-3x3

- _Shows_: A wall of nine tiles whose rows and columns are both data.
- _When_: Nine items sorted on two dimensions of three, where rows and columns both mean something. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover only: tints every tile that shares the row or column of the hovered tile, at three columns (`lg`) and up (CSS only). No entrance.

## grid-bento

- _Shows_: Tiles of different sizes on one grid: one lead tile and five supporting tiles.
- _When_: One lead idea with several supporting points, where the sizes state the weight. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Hover lifts a tile and dims its siblings. The lead tile carries a slow gradient drift that runs only while the Slide is active. Under reduced motion both rest.

## grids

- _Shows_: A section Slide: a title and a caption introducing the grid Slides.
- _When_: Opening a run of grid Slides inside an Episode. <!-- draft: Han edits -->
- _Motion_: `motion: none`. No motion.

## horizontal-gantt

- _Shows_: Phases as bars on a shared quarter axis, in three lanes, with a "today" line and a tooltip per bar.
- _When_: Overlapping phases or workstreams over one year, where the overlap is the point. <!-- draft: Han edits -->
- _Motion_: `motion: local`. The bars grow in once, the first time the Slide reaches the reading line. A tooltip opens on hover, focus or click.

## horizontal-rail

- _Shows_: Six milestones on one horizontal axis, labels alternating above and below, each with a toggletip.
- _When_: A short sequence of milestones in order, without overlap. <!-- draft: Han edits -->
- _Motion_: `motion: local`. The axis line and the dots draw in once, the first time the Slide becomes active. A toggletip opens on hover, focus or click.

## horizontal-scroll-snap

- _Shows_: A row of tall cards wider than the Slide, with a progress bar and previous and next buttons.
- _When_: A row of many parallel items that does not fit at rest. Because the claim must show at rest, use it only when the first cards carry it. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Native scroll and swipe snap card by card. The progress bar and the active card follow the scroll position. The buttons scroll smoothly except under reduced motion.

## metro-map

- _Shows_: Parallel lanes with stations that branch and merge, like a subway map, with a lane filter and a popover per station.
- _When_: Parallel tracks that fork and join, such as several workstreams feeding one outcome. <!-- draft: Han edits -->
- _Motion_: `motion: local`. The lanes draw in once, the first time the Slide is active. Selecting a lane dims the others. Station hover scales the dot.

## radial-cycle

- _Shows_: Six phases of a repeating cycle around a clock face, with the shown phase in the centre.
- _When_: A process that returns to its start, such as a feedback loop. Not for a one-way sequence. <!-- draft: Han edits -->
- _Motion_: `motion: local`. The ring draws in once on first active. A hand turns while the Slide is active. Hover previews a phase, click or focus selects it.

## timelines

- _Shows_: A section Slide: a title and a caption introducing the timeline Slides.
- _When_: Opening a run of timeline Slides inside an Episode. <!-- draft: Han edits -->
- _Motion_: `motion: none`. No motion.

## vertical-center-spine

- _Shows_: One spine down the middle with entries alternating left and right.
- _When_: A chronology with few, short entries, where the spine fills as the viewer reads down. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Scroll-driven: the spine fills, nodes and dates light and cards enter as each passes the reading line. At rest or under reduced motion all of it shows finished.

## vertical-stepper

- _Shows_: A numbered process on one spine, each step a disclosure with one open at a time.
- _When_: A numbered procedure where the headings carry the claim and the details are depth. Keep the detail to depth only. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Opening a step animates its caption height (grid-template-rows) and fills the spine down to it. Hover underlines the title. Under reduced motion the changes are instant.

## vertical-sticky-years

- _Shows_: A changelog: each year pins in a narrow left column while its entries scroll past on the right.
- _When_: A long history grouped by period, such as a changelog or release notes. <!-- draft: Han edits -->
- _Motion_: `motion: local`. Scroll-driven: the year lights and its mark draws as it crosses the reading line. Hover tints the entry row and slides in an arrow. At rest everything shows finished.

## Library motions

A library motion is a CSS module under `src/episodes/components/slide-shared/motions/`. The folder `src/episodes/components/slide-shared/motions/` is empty today, so no Slide carries a library motion and every motion above is Slide-local. A motion moves into the folder when a second Slide needs it.
