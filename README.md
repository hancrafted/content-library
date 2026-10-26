# content-library

A statically exported Next.js site (App Router, TypeScript, Tailwind CSS, shadcn/ui), deployed to Cloudflare Pages (`docs/features/hosting.md`).

## Develop

```sh
npm install
npm run dev        # http://localhost:3000
```

| Command             | What it does                                               |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Dev server with hot reload                                 |
| `npm run build`     | Static export into `out/`                                  |
| `npm run lint`      | ESLint                                                     |
| `npm run typecheck` | Generates Next route types, then `tsc --noEmit`            |
| `npm test`          | Vitest unit tests                                          |
| `npm run verify`    | Every gate: archgate, lint, format, types, tests, knip, mh |

Preview a production build with any static server, e.g. `npx serve out`.

### Landing hero

`HeroSection` supplies localized copy and the SVG desk to the isolated
`PromotionHero` client leaf. A neutral wall, a marble desktop (white in light
mode, dark in dark mode), a window behind the paper tray and non-digital
stationery (clipboard, pen) use layered SVG, material gradients and soft shadows.
The window shows a sun by day and a moon by night; its light pools on the desk
and the tray's shadow lengthens as the sheets stack up. Clearing the workload
reveals the outside. The headline accents "promotion" in the hero's orange
accent; on desktop it breaks after that word. On wide,
fine-pointer screens, the workload grows continuously. The envelope slides along
the desk and turns as it stops. Over the next ten seconds it wiggles, then jumps,
stands up and turns red — flap included — with an angry face before bursting
open (or on an earlier click). Every caption word and both CTAs explode out of
it along their own randomized bowed arc straight to their resting place; the
caption is split into words only for the flight and restored afterwards.
All remain visually hidden beforehand, with the CTAs inert until landing.

After landing, hovering or keyboard-focusing **Episodes** clears 80/3 sheets per
second; **Work with me** clears 80. The caption words are not controls. Leaving
lets the pile grow again. Completed sheets receive a green check drawn in the
sheet's own perspective, lift clear of the tray walls (lower sheets lift
further) and are thrown off-screen right with their own lift, pace, drop and
tilt. At capacity, unchecked sheets fall off the far edge at randomized
one-to-four-second intervals, accelerating under gravity while gliding side to
side with randomized sway, swing count, tilt and drift. The tray's left wall and
front sit in front of the pile. A bounded
pool of 96 sheets reaches past the scene's upper edge without accumulating DOM
nodes; departing copies are removed as each flight ends. Motion pauses off-screen
and in background tabs. **Stop animation** clears the tray and all flying papers,
and reveals the caption and CTAs permanently for that animation instance.

Narrow screens, reduced motion and JavaScript-free visits get the open envelope
and complete, crisp caption and CTAs directly. The caption stays available to assistive
technology while visually hidden on animated desktop. Copy is under `landing.hero`
in both Translation files; the secondary CTA opens
the approved Calendly booking page in a new tab.

The existing GSAP dependency (core plus its bundled SplitText plugin) is used
without new packages. Its
[standard license](https://gsap.com/standard-license/) was checked on 2026-10-09:
website animation is a permitted use; competing no-code visual animation builders
are restricted.

Pure flight geometry (arcs, exits, overflow falls) and reversible pile
progression run in `npm run verify`. Static copy and CTA checks run in
`npm run test:build` after a build. For visual changes, also preview both locales
at desktop and 390px widths, in light and dark mode, with reduced motion and
JavaScript disabled, and
check early opening, the ten-second escalation, word/CTA flights, both hover/focus
drain rates, green-check exits, overflow falls, rebuilding, the growing shadow,
off-screen pausing, and resize during flight.

## Routes and locales

English is the default locale and is served **unprefixed**; German lives under `/de`.

| English                     | German                         |
| --------------------------- | ------------------------------ |
| `/`                         | `/de`                          |
| `/episode/episode-template` | `/de/episode/episode-template` |

Static export runs no middleware, so locales are an explicit route tree; next-intl only supplies the strings:

- `src/app/(en)/` — default-locale routes, rendered with `locale="en"`.
- `src/app/[locale]/` — prefixed routes; `generateStaticParams` returns only `de`.

Both are root layouts that render the same `SiteShell` and header from the page chrome, `src/shared/page-chrome/`; each route renders one page template from `src/page-assembly/`. Build URLs with `localizePath` from `src/shared/lib/locale.pure.ts`; never hand-write a `/de` prefix.

Strings live with the folder that renders them, in its `i18n/<locale>.json`; `src/page-assembly/translations.ts` merges every owner's pair into one message set, and a namespace two owners define fails the fast suite and the build (FE-003). Read them with `getTranslations({ locale, namespace })` from `next-intl/server`, passing the locale explicitly. Episode keys follow `docs/features/episode-translation-keys.md`. Each `de.json` is typed against its `en.json`, so a missing German key fails `npm run typecheck` and the fast suite, and a missing key at render time fails the build.

## Preferences

Every client-side preference (`theme`, `locale`) lives in **one** localStorage key, `hancrafted:prefs`, as a JSON object. Read and write it only through `src/shared/lib/prefs-storage.ts`.

## Test hooks

Every interactive element carries a stable `data-testid`. Select by it, never by class, text or DOM position.

## Deploy

`.github/workflows/deploy-cloudflare.yml` builds `out/` and deploys it to Cloudflare Pages: production on every push to `main`, a preview on every same-repo pull request. `.github/workflows/deploy.yml` publishes only redirect stubs for the old GitHub Pages URLs (temporary). `.github/workflows/ci.yml` runs lint, typecheck, tests and a build on pull requests. One-time setup and operations: `docs/features/hosting.md`.

### `NEXT_PUBLIC_BASE_PATH`

The sub-path the site is served from. Empty on Cloudflare Pages, which serves from the domain root, and by default, which suits local dev. A project site at `<user>.github.io/<repo>` would need `/<repo>`.

```sh
NEXT_PUBLIC_BASE_PATH=/content-library npm run build
```
