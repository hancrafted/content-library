---
type: feature-guide
title: Design guide
stale_after: 2027-01-13T00:00:00Z
---

# Design guide

Han's taste for Episode Slides: what makes a Slide look and feel right, beyond the tokens and reasons in [the design system](design-system.md) and the rules in [FE-011 Design Tokens](../../.archgate/adrs/FE-011-design-tokens.md).
The `write-spec` designers and its reviewer read it.

## Medium

Talk first, as of 2026-10-13. A Slide is designed for the recorded talk: its meaning shows at rest, and hover may add detail but never content. Reader first, where hover and click carry content, comes later.

## A Slide stands on its own

A reader who never hears the voice still gets the Slide's claim **at rest**: a still frame with no pointer, nothing clicked and every motion finished. A Slide may be as dense as a consultant's slide. Depth goes behind progressive disclosure, and disclosure holds depth, never the claim.

| Surface        | Holds                                  | Limit                                 |
| -------------- | -------------------------------------- | ------------------------------------- |
| Popover        | A term or an aside                     | At most two lines                     |
| Context drawer | Evidence and sources, as Speaker notes | None                                  |
| Modal          | One worked example, opened by a button | A native `<dialog>`, as FE-009 allows |

A Slide's popover is copied from a Master slide that has one (`metro-map`, `horizontal-rail`, `horizontal-gantt`) in [the Slide library](slide-library.md).

## Title and caption

A Slide's title names its **topic**; its caption states the **claim**. The title is also the Dossier's table-of-contents entry, so it stays short.

## Named styles

An Episode's style may differ by Episode and audience, and stays consistent within one Episode. It works within the tokens as they stand: Scene composition, Slide-local colours, illustration and motion. The typefaces, type scale and global tokens are the same in every Episode. A new style is added when an Episode uses one.

### Editorial

Suits a mixed audience and consulting prospects: sober, self-explanatory Slides that read as a consultant's work.

- Type leads.
- One diagram per Slide.
- Neutral surfaces.
- `primary` marks the one thing to look at.
- The meaning colours (`machine`, `human`, `ai`) appear only for their meanings.

### Board

Suits founders and coaching cohorts, who plan on whiteboards and sticky notes: a planning board reads as their own tool, one they can copy straight away.

- A board surface carries the Slide; sticky notes carry the content.
- `primary` marks the one thing to look at.
- The meaning colours (`machine`, `human`, `ai`) appear only for their meanings.

## Like this

`markdown-in-ai-workflows` (Episode `maintaining-markdown-for-ai`). It stands on its own at rest, with depth behind a modal and the Context drawer. Its meaning colours (Knowledge `ai`, Instructions `human`, Memory `machine`) colour things that are not those meanings, so do not copy them. The Episode is legacy and keeps them until it is next touched.

## Not this (run 1)

`four-disciplines` is the example.

- A Master slide with its text swapped, where the layout should come from the idea.
- Meaning hidden behind hover.
- Meaning colours used as decoration.
- Motion reduced to hover transitions.

Why run 1 was underwhelming: <!-- draft: Han edits --> the Slides looked like the Slide library with new words in it. Each one picked a Master slide first and fitted the idea to it, so the layout said nothing about the idea. What the Slide meant sat behind hover, and the only motion was a hover transition.
