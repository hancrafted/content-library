# Drive review

The calibration answers for every decision page of this project, in the shape the `to-review` skill asks for. /drive passes this file to the page skill as the caller's inputs, so the page skill skips its calibration. The feedback behind it: three rounds on the first Fortify page.

## Mode

Per use: Fortify's page and a Reason page that settles open choices run in `decide`; a page that shows settled decisions runs in `explain`.

## Audience

The Operator as a cold reader: they were in the session, recall none of it and carry a high load, and they know software engineering. Introduce every concept before asking about it, even one the grilling covered. Lead with the principle in play, so a seasoned engineer grasps the change at once.

## Layout

One section per Option, never one merged question; the pick bar sits in the rail beside it. A section reads as an inverted pyramid:

1. title and a two-line statement of the problem in plain, precise words;
2. an analogy, collapsed;
3. the proposal: apply principle X and Y to reach Z;
4. a before/after visual of what changes;
5. evidence, cost and impact, collapsed.

## Depth

`both`, explain first: plain name, problem, analogy (collapsed), principle then outcome, before/after visual, details collapsed. The first view needs no knowledge of the grilling.

## Fidelity

Default `diagram`: a graph, flowchart, dependency diagram or ordered steps showing what changes. Raise an item's rung only when a diagram cannot settle it; dispatch.md then moves the page to the top tier.

## Feedback route

The page skill's default.

## Review width

About 1512 px (the Operator's laptop), in light and dark. The page never wraps inline code or a list one letter per line.
