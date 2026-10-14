---
type: feature-guide
title: Design system
stale_after: 2027-01-11T00:00:00Z
---

# Design system

Why the site's colours and type work the way they do, and which tokens exist. The binding rules live in [FE-011 Design Tokens](../../.archgate/adrs/FE-011-design-tokens.md); this guide holds the reasons and the reference. Taste (what looks good) has its own guide, [the design guide](design-guide.md).

## Two layers

A Slide has a **governed frame** and a **free Scene**.

- **Governed:** the base palette, the type scale, the Slide's title and caption, and the Foreground insets that clear the Chrome ([FE-009 Slide Frame](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md)).
- **Free:** the Scene's markup, props, layout and spacing.

Tokens govern _values_, never _shape_. A Scene may lay itself out however it likes, but every colour, font size and weight in it is a token reference. This is how three Episodes built by separate agents still read as one body of work. The early prototype failed because structure was forced on it; values were never the problem.

## Colour

Colours are CSS custom properties, in two tiers:

| Tier   | Where                                                      | May hold raw values                       |
| ------ | ---------------------------------------------------------- | ----------------------------------------- |
| Global | `:root` and `.dark` in `src/app/globals.css`               | yes: the base palette and text colours    |
| Slide  | the Slide's token file, a CSS module in the Slide's folder | yes: colours only this Slide's Scene uses |

`--card` is `oklch(1 0 0)` in light and `oklch(0.205 0 0)` in dark.

Everywhere else a colour is a reference: a Tailwind token utility (`bg-primary`, `text-muted-foreground`) or `var(--…)`.

- **Shared meanings use the global token.** Primary, secondary, accent, machine, human and AI are referenced, never re-declared under the same name in a Slide.
- **Every raw colour has a light and a dark value.** In a Slide token file, the dark value goes under the same selector prefixed with `:global(.dark)`.
- **Slide-local names are free.** The CSS module already scopes them, so they need no prefix.

```css
/* slides/metro-map/metro-map.module.css */
.laneA {
  --lane: #d0342c;
}
:global(.dark) .laneA {
  --lane: #ff7a6e;
}
```

### Status colours

Four global status colours, each with a `-foreground` pair: `--destructive` (danger), `--success`, `--warning` and `--info`. Utilities: `bg-success`, `text-warning`, `text-info-foreground`, and so on. They are promoted from the `ai-token-economy` Slide token files, where three Slides each declared their own. Every one is 4.5:1 as text on the page and card surfaces, and its `-foreground` is 4.5:1 as text on a fill of it, in light and dark:

| Token           | Light                       | Dark                        | On page (light / dark) | Foreground on fill (light / dark) |
| --------------- | --------------------------- | --------------------------- | ---------------------- | --------------------------------- |
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | 4.56 / 6.84            | 4.56 / 6.84                       |
| `--success`     | `oklch(0.5 0.13 150)`       | `oklch(0.78 0.16 150)`      | 5.41 / 10.51           | 5.41 / 10.51                      |
| `--warning`     | `oklch(0.52 0.12 65)`       | `oklch(0.82 0.15 80)`       | 5.5 / 11.17            | 5.5 / 11.17                       |
| `--info`        | `oklch(0.5 0.15 245)`       | `oklch(0.78 0.12 240)`      | 5.58 / 10.04           | 5.58 / 10.04                      |

The foregrounds are `oklch(0.985 0 0)` in light and `oklch(0.145 0 0)` in dark. A Slide whose surface is inverted (the `/context` terminal) keeps its own tuned names (`--term-success`).

There is deliberately no global chart palette and no colour scales (`--teal-500`). The Scene palette is unknown until three real Episodes show it; scales chosen now would be guesses.

### Promotion path

After the three workshop Episodes, review every Slide token file. A colour that repeats across Slides gets promoted to a global token, and the Slides switch to referencing it. Spacing follows the same path, should a Scene spacing scale ever earn its place.

## Type

Heading level and visual size are separate. The h1/h2/h3 elements follow the Episode's spine (Episode, Section, Slide). Size comes from a **role**.

| Role       | Utility           | Value                            | Line height | Used for                                                                   |
| ---------- | ----------------- | -------------------------------- | ----------- | -------------------------------------------------------------------------- |
| hero       | `text-hero`       | `clamp(2.5rem, 5.2vw, 4.5rem)`   | 1.05        | landing hero and Title slide, through `HeroTitle` only                     |
| heading    | `text-heading`    | `clamp(2.25rem, 4.2vw, 3.75rem)` | 1.1         | section slide titles                                                       |
| subheading | `text-subheading` | `clamp(1.875rem, 3.4vw, 3rem)`   | 1.15        | page slide titles                                                          |
| body       | `text-body`       | `1rem`                           | 1.6         | everything else: prose, Chrome, Context drawer, cards, buttons, links      |
| caption    | `text-caption`    | `0.875rem`                       | 1.5         | secondary text: Slide captions, table contents, labels, captions in Scenes |

- **Four sizes, plus hero as the one exception.** `caption` is allowed everywhere, Scenes included. A Scene has no fifth size. Hierarchy inside a Scene comes from weight first, then colour.
- **One value per role.** Each size scales fluidly with `clamp()`, so no breakpoint prefix (`md:text-…`) ever appears on a size.
- **Weights:** 400, 500, 600 (normal, medium, semibold). A card title inside a Scene is `text-body font-semibold`.
- **Text strengths:** full (`text-foreground`) and muted (`text-muted-foreground`). A Slide caption (`SlideCaption`) is `caption` + muted.
- **Fonts:** `--font-sans` (the system sans) and `--font-mono`, declared once in `globals.css`. Both stacks are Tailwind's defaults. Changing the typeface is a one-line edit.
- **Heading tracking:** `--tracking-heading` is `-0.02em`, applied to hero, heading and subheading.
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

Tailwind's default palette and size scale are not reset, because legacy files still use them. Checks ban them in new code instead: ESLint (`better-tailwindcss`, in `eslint.config.mjs`) rejects a class Tailwind does not generate (E1), a palette colour, off-role size or other weight (E2), and `text-hero` outside `HeroTitle` (E3); the Archgate rules in FE-011 (A1–A6) cover raw values in CSS and code, Slide token files, `globals.css` and the legacy list.

## Design-system token editor

`src/components/design-system-token-editor/` is a dev-only popover (it renders only under `next dev`, so it is absent from `out/`). Its trigger is an icon button in the site header, beside the theme and locale toggles, and the panel drops down from it on every page. The panel keeps its own fixed palette (`token-panel.module.css`, the one token file outside a Slide that FE-011 allows raw colours in), so it keeps its look while the site's tokens are being edited.

The Global tab lists the global tokens in designer order, each in a group under a sticky header (Brand, Surface & text, Feedback, Lines & focus, Domain, Chrome, Typography, Shape, Layout, Other), a colour beside its `-foreground` pair, each with a one-line description. The order and the descriptions live in `src/lib/token-groups.pure.ts`; a token missing from its table shows no description and lands under Other. The Slide tab lists the active Slide's own tokens, one group per selector that declares them, colours first; it is disabled off an Episode page. Clicking a colour's swatch opens a picker (`react-colorful`) that writes the pick back in the token's own format: `oklch(L C H)` stays oklch, a hex token stays hex (`src/lib/colour-convert.pure.ts`).

The header is outside the Episode page and its URL-state service, so the active Slide reaches the editor through a dev-only relay: `DevSlideReporter` inside the page reads `useActiveSlide()` and hands the id to `src/hooks/use-dev-slide.ts`. The editor's hook is `src/hooks/use-page-tokens.ts`; its stylesheet and DOM logic are in `src/lib/page-tokens.ts`.

Each row has an experimental **Find usage** button that lists the elements in view using the token; it lives in one folder, `design-system-token-editor/token-usage/`, behind one `rowAddon` prop, and its limits are in `docs/adr/0003-token-usage-lookup-is-experimental.md`.

Edits are not saved. **Copy changed** exports only the tokens you changed, as a prompt to paste to an agent, which then adopts them into source. Saving edits as a user preference is a later feature.

## Legacy

The landing page, `ai-token-economy` and `maintaining-markdown-for-ai` predate these rules and sit on a legacy list, `src/design-system/legacy.json`, which ESLint and Archgate both read. Legacy files are exempt from E2 and the raw-value rules, not from E1 and E3. The list only shrinks: touching one of these files is the moment to migrate it.

## Motion

A Slide's motion is **CSS only**, in the Slide's own CSS module: transitions, keyframes and scroll-driven `animation-timeline`. JavaScript motion (GSAP in a `*.client.tsx`) waits for an Episode that proves it needs it.

What starts a motion:

- **By default, one entrance when the Slide becomes active,** keyed on `[data-zone='active']`. `SlideMount` sets `data-zone` ([`slide-mount.client.tsx`](../../src/components/episode-page/slide-mount.client.tsx)), and [FE-009](../../.archgate/adrs/FE-009-slide-wrapper-and-scene.md) §6 names it a stable CSS hook, so renaming it is a breaking change. The entrance replays when the reader returns, which FE-009 accepts.
- **Scroll-driven (`animation-timeline`) only when the motion _is_ progress:** a timeline, growth, a sequence. `vertical-sticky-years` is the worked example.
- **Under reduced motion, every motion rests in its final state.** Wrap the motion in `@media (prefers-reduced-motion: no-preference)`, so the base rule is the finished picture.

```css
/* slides/<slide>/<slide>.module.css */
.bar {
  transform-origin: left;
}
@media (prefers-reduced-motion: no-preference) {
  [data-zone='active'] .bar {
    animation: grow 600ms cubic-bezier(0.2, 0, 0, 1) both;
  }
}
@keyframes grow {
  from {
    transform: scaleX(0);
  }
}
```

A Slide stands on its own at rest, so the final state of a motion must carry the claim; motion adds emphasis, never content.

### Library motions

A **Slide library motion** is a CSS module under `src/components/slide-shared/motions/`: `stick-on` and `draw-in`, listed in [the Slide library](slide-library.md#library-motions). A motion moves there when a second Slide needs it ([FE-007](../../.archgate/adrs/FE-007-module-layering.md) Do 7). A Slide's CSS module takes it with `composes:`, a relative import that [FE-007](../../.archgate/adrs/FE-007-module-layering.md) §1 and the dependency rules allow, and that builds under Next.js CSS modules (verified with a throwaway module):

```css
.bar {
  composes: grow from '../../../../slide-shared/motions/grow.module.css';
}
```

The staging check reads the file names in that folder (without `.module.css`) as the motions a Dossier `Visual` may name. A Visual's `motion:` is a comma-separated list: `none` (stands alone), `local` (motion in the Slide's own folder, described in the Visual prose in viewer terms) or a library motion, so `motion: reading-highlight, local` is valid. The library list, with each Master slide's motion, lives in [the Slide library](slide-library.md).
