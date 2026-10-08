# content-library

A statically exported Next.js site (App Router, TypeScript, Tailwind CSS, shadcn/ui), deployed to GitHub Pages.

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
`PromotionHero` client leaf. A full-width desktop, paper trays and non-digital
stationery use layered SVG, material gradients and soft shadows. On wide,
fine-pointer screens, the workload grows continuously. The envelope slides in,
waits and jitters for four seconds, then opens automatically (or on an earlier
click). The caption is visually blank until it opens; the three words then fly
into their reserved slots.

After the words land, hovering or keyboard-focusing **plan**, **spec**, **review**
or either CTA rapidly empties the tray. Leaving lets it grow again. A bounded
pool of 96 sheets reaches past the scene's upper edge without accumulating DOM
nodes. Motion pauses off-screen and in background tabs. **Stop animation** clears
the tray and reveals the complete caption permanently for that visit.

Narrow screens, reduced motion and JavaScript-free visits get the open envelope
and complete, crisp caption directly. The caption stays available to assistive
technology while visually hidden on animated desktop. Copy is under `landing.hero`
in both catalogs; the secondary CTA opens
the approved Calendly booking page in a new tab.

The existing GSAP dependency is used without new packages. Its
[standard license](https://gsap.com/standard-license/) was checked on 2026-10-09:
website animation is a permitted use; competing no-code visual animation builders
are restricted.

Pure flight geometry and reversible pile progression run in `npm run verify`. Static copy and CTA checks run in
`npm run test:build` after a build. For visual changes, also preview both locales
at desktop and 390px widths, with reduced motion and JavaScript disabled, and
check early opening, the four-second wait, blank-caption reveal, hover/focus
draining and rebuilding, off-screen pausing, and resize during flight.

## Routes and locales

English is the default locale and is served **unprefixed**; German lives under `/de`.

| English                  | German                      |
| ------------------------ | --------------------------- |
| `/`                      | `/de`                       |
| `/episode/page-template` | `/de/episode/page-template` |

Static export runs no middleware, so locales are an explicit route tree; next-intl only supplies the strings:

- `src/app/(en)/` — default-locale routes, rendered with `locale="en"`.
- `src/app/[locale]/` — prefixed routes; `generateStaticParams` returns only `de`.

Both are root layouts that render the same `SiteShell`, header and page components from `src/components/`. Build URLs with `localizePath` from `src/lib/locale.pure.ts`; never hand-write a `/de` prefix.

Strings live in `src/messages/<locale>.json`. Read them with `getTranslations({ locale, namespace })` from `next-intl/server`, passing the locale explicitly. Episode keys follow `docs/agents/episode-catalog-keys.md`. `de.json` is typed against `en.json`, so a missing German key fails `npm run typecheck`, and a missing key at render time fails the build.

## Preferences

Every client-side preference (`theme`, `locale`) lives in **one** localStorage key, `hancrafted:prefs`, as a JSON object. Read and write it only through `src/lib/prefs-storage.ts`.

## Test hooks

Every interactive element carries a stable `data-testid`. Select by it, never by class, text or DOM position.

## Deploy

`.github/workflows/deploy.yml` builds and publishes `out/` to GitHub Pages on every push to `main` and on manual dispatch. `.github/workflows/ci.yml` runs lint, typecheck, tests and a build on pull requests.

One-time setup: **Settings → Pages → Source: GitHub Actions**.

### `NEXT_PUBLIC_BASE_PATH`

The sub-path the site is served from. A project site at `<user>.github.io/<repo>` needs it set to `/<repo>`, or every asset 404s. The deploy workflow fills it in from `actions/configure-pages`. It defaults to empty, which suits local dev and sites served from a domain root.

```sh
NEXT_PUBLIC_BASE_PATH=/content-library npm run build
```
