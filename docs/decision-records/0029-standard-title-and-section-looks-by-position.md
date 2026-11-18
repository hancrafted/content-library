---
type: decision-record
title: Standard Title and section looks by position
status: accepted
---

# Standard Title and section looks by position

The Title slide and section slides get a standard presentation by default, chosen by position. A Slide or Episode that declares its own presentation keeps it. This reverses "author choices, not renderer defaults" in [Slide transitions](../features/slide-transitions.md) for these two kinds only. Content Slides still opt in to every capability.

## Human acceptance

**Approver:** Han. **Decision:** Q3 and Q16 of the `event-copy-derivation` grill, 2026-11-18: "1, with a default beforePx and afterPx that makes it look good". Q20 and the spacing, 2026-11-18: the Title is no longer inverse, so every section slide gets one uniform look; section slides take 200px before and after.

## Why

The same Title look is hand-copied into 16 Slide files, and two section looks into 38. Aligning the Event look by hand in three PRs (#714, #733, #737) showed that the copies drift.

## Decision

1. **Kinds.**
   - **Standard Title look:** the Title slide's look.
   - **Standard section look:** every section slide, the first included.

   Position decides the kind, using the container's existing recognition (`level: 'h2'`, not `withoutSectionSlide`).

2. **Values,** accepted by Han:
   - **Title:** normal tone and surface, no effect, 160px space after.
   - **Section slide:** inverse, softened surface, liquid enter and leave, 200px space before and after. A normal Title makes the first section slide's edge the same light-to-dark enter as every later one, so no opening variant is needed, whether or not the first Section has a section slide.
3. **Declaration wins.** A Slide's own `presentation`, or the Title's `title.presentation`, replaces the default in full. Defaults and declarations are never merged key by key, so a Waterline section slide keeps its bubbles.
4. **Where the defaults apply.** The page record applies them (`recordContent`), after Episode instance overrides have been resolved (Decision record _An Event copy is an instance of its Episode_) and before adjacent edges are resolved and the surface clock decides whether it runs. The wrapper and the clock see ordinary declarations.
5. **Home.** The standard looks are named constants in the Slide master. They are not a Theme field or a renderer registry.

## Amends

- [Slide transitions](../features/slide-transitions.md): "Omission enables none" and "No shared nonzero spacing policy" now hold for content Slides only.
- Decision record _Slide presentation and a domain-free transition clock_ (0022): Episode composition gains one input, the standard looks. The clock, the wrapper and the Scene's freedom are unchanged.

## Alternatives

- **An opt-in field on each Episode:** keeps one line of copying per Episode, and new Episodes start without the look.
- **Per Theme:** Themes are copy sources (Decision record _Themes are authoring templates_), not a runtime layer.
