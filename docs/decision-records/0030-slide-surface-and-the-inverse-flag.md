---
type: decision-record
title: Slide Surface and the inverse flag
status: accepted
---

# Slide Surface and the inverse flag

A Slide sets the colour it sits on with two independent declarations: a **Surface**, its background colour, and the **inverse flag**, which swaps the theme. Ink transitions run to the incoming Slide's colour. Both replace `tone: 'inverse'`.

## Human acceptance

**Approver:** Han. **Decision:** Q1–Q11 of the `slide-surface` grill, 2026-11-19. The decisions log is `.scratch/slide-surface/decisions.md`. The rendered result needs Han's acceptance on a preview, in both themes, before the feature doc records it as accepted.

## Why

`tone: 'inverse'` swapped the text colours (`--foreground`, `--border`, `--primary`) but no surface colour (`--card`, `--muted`, `--background`). Anything that paints its own background kept its light colour and took the light text: when the standard section look made every section slide inverse (#760), the cards and Explorables on those slides became unreadable. `data-tone-flip` patched this one element at a time.

Three overlapping ways also set a Slide's colour: `tone`, `style['--slide-surface']`, and a Scene writing `--foreground` itself (Waterline). The ink transition read its colour from the first two.

## Decision

1. **Surface.** `presentation.surface` is one value: `{ background, foreground, muted?, textScope? }`. It sets the Slide's background, `--surface-foreground` and the inherited text colour. It leaves the site-wide theme tokens alone, so a card or panel that paints its own background keeps its own colours with no marker (a _surface boundary_). The Slide master's own parts (header, caption, Title actions) read `--surface-foreground`.
2. **Slide-wide text.** A Surface declaring `textScope: 'slide'` also sets `--foreground` and `--muted-foreground` for the whole Slide. The default is `'own'`. It exists for Scenes whose text sits directly on a coloured Surface and whose cards reset their own text, as Waterline's zones do.
3. **Inverse flag.** `presentation.inverse: true` renders `data-inverse`. It is CSS only: it swaps every theme token (`--background`, `--card`, `--muted`, `--border`, `--primary`, the text pairs) to the other theme's values, like a nested dark mode, in both themes. A flag nested inside an inverse area swaps back, up to three levels deep. Tailwind's `dark:` variant follows the flag. A Slide with the flag and no Surface paints the swapped `--background`. The flag is the default way to flip a Slide's contents: when a Surface colour is too dark for the content, the author adds the flag instead of tuning colours.
4. **Independence.** Surface and flag are separate fields. Either can be declared alone; `inverse: true` alone is the mirror look.
5. **Ink colour.** An ink transition runs to the incoming Slide's colour: its Surface background, else the swapped `--background` when it has only the flag, else the page background. A transition may override it with `style['--slide-transition-ink']`. The ink element carries the incoming Slide's flag, so the swapped `--background` it paints matches.
6. **Chrome.** The surface clock publishes the active Slide's declared flag through the existing page-tone channel (`data-page-tone`). The header applies the same CSS swap. It never adopts a Surface's colour, so a coloured Surface leaves the header as it is.
7. **Homes.** The `Surface` type and the standard Surfaces live in `slide-master/surface.ts`. `SOFT_MIRROR` is `color-mix(in oklab, var(--background) 88%, var(--foreground))`, read inside the inverse area, so one definition serves both themes. A Scene builds its own Surface values from its own colours.
8. **Retired.** `presentation.tone`, the Episode record's `tone`, `data-tone-flip`, and writing `--foreground` or `--muted-foreground` in a presentation's `style`. All current uses migrate in the same change; no alias remains.

## Amends

- Archgate ADR FE-004-slide-architecture, Decision 5.4: "surface tone" becomes the Surface and the inverse flag.
- Decision record _Slide presentation and a domain-free transition clock_: semantic tone is the declared inverse flag; the FE-011 line on surface overrides now reads through this record.
- Decision record _Standard Title and section looks by position_: the section look is `{ inverse: true, surface: SOFT_MIRROR }` with liquid enter and leave.
- [Slide transitions](../features/slide-transitions.md): the surface interface, the header band, the ink destination and the standard looks.

## Alternatives

- **`tone` plus a required foreground on `--slide-surface`:** keeps two ways to set one colour, and the light or dark reading of an arbitrary colour stays unknown.
- **Named Surfaces in `globals.css`:** global CSS would have to know Waterline's computed sky and zone colours.
- **Cards switch with the text-only swap, or opt out one by one:** the half-swap that caused the bug, or `data-tone-flip` on every card in about 231 Slide files.
- **The header takes the Surface's colour:** turns Waterline's header sky-blue or abyss-blue.
- **Migrate Waterline's 252 text classes to a surface class:** rewrites the Episode the change must keep as it is, for no visible gain.

## Consequences

- Cards on an inverse section turn dark in the light theme, instead of staying white.
- Waterline keeps its look: its zone Surfaces declare `textScope: 'slide'` and its bubbles take the zone colour from the incoming Surface.
- A new Archgate check under FE-004-slide-architecture rejects `tone:`, `data-tone-flip`, and `--foreground` or `--muted-foreground` keys in a presentation's `style`.
- UX taste remains a manual-review gap: contrast on Surfaces without the flag and the dark cards on inverse sections need Han's eye in both themes.
