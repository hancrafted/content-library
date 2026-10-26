---
type: adr
id: FE-011
title: 'Design Tokens'
domain: frontend
rules: true
files: ['src/**/*.{ts,tsx,css,json}']
# prettier-ignore
paths: ['src/components/{episodes,slide-master,slide-shared,landing}/**', 'src/explorable-explanations/**', 'src/page-assembly/landing/**', 'src/app/globals.css']
description: 'Values, not shape: every colour, font size and font weight in the site and inside a Scene is a token reference — raw colours only in the global palette and a Slide token file, four type roles plus one hero exception, weights normal to semibold — while Scene markup, props and layout stay free; legacy files sit on a list that only shrinks.'
---

# Design Tokens

## Context

Three Episodes are built by separate agents, one per Slide. Left free on colour and type they drift: a fourth text size here, `bg-amber-500` there, a hex in an inline style. They stop reading as one body of work. A prototype that forced _structure_ on Slides degraded every visualisation, so the cure is not a shape contract. Fix the **values**; leave the shape alone.

**Two layers:** a governed frame (palette, type scale, Slide title and caption, Foreground insets) and a free Scene (markup, props, layout, spacing). Tokens reach inside the Scene for colour, size and weight only.

**Why tokens are runtime variables:** raw values sit on `:root` and `.dark`; the theme maps utilities to them. A dev-only token editor changes them live, and a typeface swap is a one-line edit.

Rejected: colour scales (`--teal-500`) and a global chart palette: the Scene palette is unknown until real Episodes show it; guesses become debt. Rejected: resetting Tailwind's default palette and sizes: legacy files use them; a check bans them in new code instead.

Reasons, values and the token reference: [`docs/design/design-system.md`](../../docs/design/design-system.md).

## Decision

### 1. Values, not shape

1. Colour, font size and font weight inside a Scene MUST come from tokens.
2. Markup, props and layout in a Scene MUST stay free.

### 2. Colour

1. A raw colour (hex, `rgb()`, `hsl()`, `oklch()`, named) MAY appear only in `globals.css` `:root` / `.dark`, a Slide token file, `token-panel.module.css`. (📜 Rule: `no-raw-colour-in-css`)
2. A Slide token file (a CSS module in the Slide's folder) MUST NOT declare a global token name (`--primary`). (📜 Rule: `slide-token-no-global-name`)
3. Every raw colour in a Slide token file MUST have a dark counterpart under `:global(.dark)`. (📜 Rule: `slide-token-dark-counterpart`)
4. Slide-local token names are free.

### 3. Type

1. Size comes from a role: `body`, `caption`, `subheading`, `heading`. Hierarchy comes from weight, then colour.
2. `hero` is the one exception, reached only through `HeroTitle` in `slide-master/`.
3. A role MUST NOT take a breakpoint prefix.
4. Weights are normal, medium, semibold.
5. Two relative sizes stay allowed, one file each: the citation marker at `0.7em`, inline `code` at `0.9em`.

### 4. Where values may not appear

1. In `.tsx` / `.ts` (style objects, SVG attributes, `.pure.ts` tables), a raw colour, `font-size`, `font-weight` or `font-family` MUST NOT appear. (📜 Rule: `no-raw-value-in-code`)
2. In a CSS module, `font-size`, `font-weight` and `font-family` MUST NOT appear.
3. Class strings MUST NOT use palette colours (`bg-amber-500`), arbitrary colours (`[#…]`), sizes outside the roles (`text-xs`, `text-[…]`) or other weights.
4. A class Tailwind cannot generate MUST NOT appear, legacy too.

### 5. `globals.css` holds tokens only

1. It MUST NOT hold an Episode selector (`[data-episode=`). (📜 Rule: `no-episode-selector-in-globals`)

### 6. Legacy list

1. Files predating these rules sit in `src/design-system/legacy.json`, exempt from §2–§4 except §3.2 and §4.4.
2. Entries are only removed, never added; a dead entry MUST go. (📜 Rule: `no-dead-legacy-entry`)

## Do's and Don'ts

### Do's

1. **DO** colour with `text-foreground`, `text-muted-foreground`, `bg-card`, or `var(--…)`. (Decision 2, 📜 Rule: `no-raw-colour-in-css`)
2. **DO** put a Slide's own colours in its token file, with `:global(.dark) .scene` values. (Decision 2, 📜 Rule: `slide-token-dark-counterpart`)
3. **DO** reference `--primary`, `--machine`, `--human`, `--ai` for shared meanings. (Decision 2)
4. **DO** size text with `text-body`, `text-caption`, `text-subheading` or `text-heading`; a card title is `text-body font-semibold`. (Decision 3)
5. **DO** render a hero title through `HeroTitle`. (Decision 3)
6. **DO** use `bg-(--loop-edge)` for a Slide token in a class string. (Decision 4)
7. **DO** keep layout, markup and props as the visualisation needs. (Decision 1)
8. **DO** migrate a legacy file when touching it, then delete its entry. (Decision 6)

### Don'ts

1. **DON'T** write `bg-amber-500`, `text-[#ff0000]`, `fill="#0af"` or `color: 'red'`. (Decision 2, Decision 4)
2. **DON'T** re-declare `--primary` or any global name in a Slide token file. (Decision 2, 📜 Rule: `slide-token-no-global-name`)
3. **DON'T** add a raw colour without a dark value. (Decision 2)
4. **DON'T** write `text-xs`, `text-2xl`, `text-[13px]`, `md:text-heading` or `font-bold`. (Decision 3, Decision 4)
5. **DON'T** set `font-size`, `font-weight` or `font-family` in a CSS module or inline style. (Decision 4, 📜 Rule: `no-raw-value-in-code`)
6. **DON'T** use `text-hero` outside `HeroTitle`. (Decision 3)
7. **DON'T** add `[data-episode='…']` to `globals.css`. (Decision 5, 📜 Rule: `no-episode-selector-in-globals`)
8. **DON'T** add a file to the legacy list or leave a dead entry. (Decision 6, 📜 Rule: `no-dead-legacy-entry`)
9. **DON'T** bind Scene markup, props or layout with a token rule. (Decision 1)

## Consequences

**Positive:**

1. **One body of work:** separate agents, same palette and type scale.
2. **Free Scenes:** only values are fixed; visualisations keep their shape.
3. **Mechanical feedback:** a raw colour or fourth size fails a check, not a review.
4. **Live editing:** variables stay runtime, so an editor and a typeface swap work without a rebuild.
5. **Shrinking debt:** legacy is named once and can only get smaller.

**Negative:**

1. **Few sizes:** a Scene wanting a fifth size must use weight or colour; some designs feel constrained.
2. **Two tiers to learn:** global versus Slide token, and which names are shared.
3. **Palette still unknown:** no scales means similar colours repeat across Slide token files until promoted.
4. **Admitted dependency:** the class-string lint adds a plugin that missed the popularity bar.

**Risks:**

1. **Slide colours diverge.** **Mitigation:** after the three workshop Episodes, review every token file; a repeating colour is promoted to a global token.
2. **Agents work around a check with a style form it cannot see.** **Mitigation:** the Archgate checks cover inline styles, SVG attributes and `.pure.ts` tables; review reads the diff for new forms.
3. **The legacy list grows by habit.** **Mitigation:** review duty; entries are only removed.

## Compliance and Enforcement

1. **Class-string lint** (ESLint `better-tailwindcss`, error): unregistered classes, palette and arbitrary colours, sizes outside the roles, breakpoint-prefixed sizes, other weights, `text-hero` outside `HeroTitle` (§3, §4).
2. **Archgate rules** (`FE-011-design-tokens.rules.ts`, error): raw colour, font size, weight or family in CSS or `.tsx`/`.ts` (§2, §4); a Slide token file declaring a global name or lacking a dark value (§2); `[data-episode=` in `globals.css` (§5); a dead legacy entry (§6).
3. **Gate:** `archgate check` and the lint in `npm run verify`.

**Rollout:** the rules file and its probe tests have landed and `rules: true`; the Archgate checks above are enforced. The class-string lint is enforced separately by ESLint.

**Manual review duties:** the legacy list only shrinks; a Scene's markup, props and layout stay unconstrained; Slides look right in light and dark; repeated Slide colours get promoted.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`docs/design/design-system.md`](../../docs/design/design-system.md): reasons, type roles, token reference.
- [Tailwind CSS v4 theme variables](https://tailwindcss.com/docs/theme): `@theme inline`, `bg-(--x)` shorthand.
- [`eslint-plugin-better-tailwindcss`](https://github.com/schoero/eslint-plugin-better-tailwindcss): class-string rules.
