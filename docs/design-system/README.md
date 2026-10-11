---
type: feature-guide
stale_after: 2027-01-11T00:00:00Z
---

# Design system

Why the site's colours and type work the way they do, and which tokens exist. The binding rules live in [FE-011 Design Tokens](../../.archgate/adrs/FE-011-design-tokens.md); this guide holds the reasons and the reference. Taste (what looks good) has its own guide, not this one.

## Two layers

A Slide has a **governed frame** and a **free Scene**.

- **Governed:** the base palette, the type scale, the Slide's title and caption, and the Foreground insets that clear the Chrome ([FE-009 Slide Frame](../../.archgate/adrs/FE-009-slide-frame.md)).
- **Free:** the Scene's markup, props, layout and spacing.

Tokens govern _values_, never _shape_. A Scene may lay itself out however it likes, but every colour, font size and weight in it is a token reference. This is how three Episodes built by separate agents still read as one body of work. The early prototype failed because structure was forced on it; values were never the problem.

## Colour

Colours are CSS custom properties, in two tiers:

| Tier   | Where                                                      | May hold raw values                       |
| ------ | ---------------------------------------------------------- | ----------------------------------------- |
| Global | `:root` and `.dark` in `src/app/globals.css`               | yes: the base palette and text colours    |
| Slide  | the Slide's token file, a CSS module in the Slide's folder | yes: colours only this Slide's Scene uses |

Everywhere else a colour is a reference: a Tailwind token utility (`bg-primary`, `text-muted-foreground`) or `var(--…)`.

- **Shared meanings use the global token.** Primary, secondary, accent, machine, human and AI are referenced, never re-declared under the same name in a Slide.
- **Every raw colour has a light and a dark value.** In a Slide token file, the dark value goes under `:global(.dark) .scene`.
- **Slide-local names are free.** The CSS module already scopes them, so they need no prefix.

```css
/* slides/<slide>/<token file>.module.css */
.scene {
  --loop-edge: oklch(0.6 0.12 200);
}
:global(.dark) .scene {
  --loop-edge: oklch(0.75 0.1 200);
}
```

There is deliberately no global chart palette and no colour scales (`--teal-500`). The Scene palette is unknown until three real Episodes show it; scales chosen now would be guesses.

### Promotion path

After the three workshop Episodes, review every Slide token file. A colour that repeats across Slides gets promoted to a global token, and the Slides switch to referencing it. Spacing follows the same path, should a Scene spacing scale ever earn its place.

## Type

Heading level and visual size are separate. The h1/h2/h3 elements follow the manuscript (Episode, Section, Slide). Size comes from a **role**.

| Role       | Utility           | Value                            | Line height | Used for                                                                                 |
| ---------- | ----------------- | -------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| hero       | `text-hero`       | `clamp(2.5rem, 5.2vw, 4.5rem)`   | 1.05        | landing hero and Title slide, through `HeroTitle` only                                   |
| heading    | `text-heading`    | `clamp(2.25rem, 4.2vw, 3.75rem)` | 1.1         | section slide titles                                                                     |
| subheading | `text-subheading` | `clamp(1.875rem, 3.4vw, 3rem)`   | 1.15        | page slide titles                                                                        |
| body       | `text-body`       | `1rem`                           | 1.6         | everything else: prose, Chrome, table of contents, Context drawer, cards, buttons, links |

- **Three sizes, plus hero as the one exception.** A Scene has no fourth size. Hierarchy inside a Scene comes from weight first, then colour.
- **One value per role.** Each size scales fluidly with `clamp()`, so no breakpoint prefix (`md:text-…`) ever appears on a size.
- **Weights:** 400, 500, 600 (normal, medium, semibold). A card title inside a Scene is `text-body font-semibold`.
- **Text strengths:** full (`text-foreground`) and muted (`text-muted-foreground`). A caption is `body` + muted.
- **Fonts:** `--font-sans` (the system sans) and `--font-mono`, declared once in `globals.css`. Changing the typeface is a one-line edit.
- **Two relative sizes are allowed, one file each:** the citation marker `<sup>` at `0.7em` and inline `code` at `0.9em`. They scale with the text around them.

The kit's `Title` maps a title's position to its role: Title slide → `hero`, section slide → `heading`, page slide → `subheading`, h4 and below → `body` semibold.

## How tokens reach Tailwind

Raw values sit on `:root` and `.dark`; `@theme inline` maps each utility to the variable. Every token therefore stays a runtime variable, which is what lets the token editor change it live.

```css
:root {
  --size-heading: clamp(2.25rem, 4.2vw, 3.75rem);
}
@theme inline {
  --text-heading: var(--size-heading);
}
```

Tailwind's default palette and size scale are not reset, because legacy files still use them. A check bans them in new code instead.

## Design-system token editor

`src/components/design-system-token-editor/` is a dev-only popover (it renders only under `next dev`). It edits the global tokens (colours, sizes, weights, fonts) and the current Slide's own tokens, in whichever theme is active.

Edits are not saved. **Copy changed** exports only the tokens you changed, as a prompt to paste to an agent, which then adopts them into source. Saving edits as a user preference is a later feature.

## Legacy

The landing page, `ai-token-economy` and `maintaining-markdown-for-ai` predate these rules and sit on a legacy list. The list only shrinks: touching one of these files is the moment to migrate it.

## Out of scope

Motion is not covered yet. [FE-009](../../.archgate/adrs/FE-009-slide-frame.md) §6 already covers its one mechanical duty: looping animation pauses outside `active`.
