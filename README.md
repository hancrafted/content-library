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

Strings live in `src/messages/<locale>.json`. Read them with `getTranslations({ locale, namespace })` from `next-intl/server`, passing the locale explicitly. `de.json` is typed against `en.json`, so a missing German key fails `npm run typecheck`, and a missing key at render time fails the build.

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
