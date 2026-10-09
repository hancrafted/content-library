# ADR candidates: React and Next.js practices

Research date: 2026-10-08. Stack at that date: Next.js 16.4, React 19.3, with
`output: 'export'` deployed to GitHub Pages.

This document surveys architecturally relevant React and Next.js practices
from the official docs. It is meant for choosing which of them to turn into
Archgate ADRs. It is not binding; binding decisions live in `.archgate/adrs/`.
Each candidate was checked against the repo as of commit `074ebcb`.

Fit legend:

- 📜 An archgate rule can check it mechanically.
- 🧹 Better enforced by a lint plugin that the ADR mandates.
- 🧠 Needs human judgment; the ADR documents a decision rather than a check.

Check notes, last revised 2026-10-08 against `main` at `3afb105` (after
next-intl, FE-002 Episode Page and the table of contents landed):

- ✅ Decided in an ADR and enforced.
- 🟡 Practised in the repo but not written down or not checked.
- ⏳ Open.
- ➖ Moot for now.

## 1. Rendering and runtime (static export)

| Practice                                                                                                                                                                                                                                                                                                                                                                                    | Repo state                                                            | Fit       | Check notes                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Static-export contract.** Every dynamic segment exports `dynamicParams = false` and `generateStaticParams`. Ban features a static export does not support: `next/headers` and cookies, `'use server'` (Server Actions), route handlers reading `Request`, `proxy`, rewrites, redirects and headers config, ISR, Draft Mode, intercepting routes, and the default `next/image` loader. [1] | Already done in `src/app/[locale]/*.tsx:4-5`, but nothing enforces it | 📜 high   | ✅ **FE-005**. Archgate rules `dynamic-segment-static-params`, `export-config-intact`, `no-request-time-features`; ESLint `no-restricted-imports`; post-build test over `out/`. Episode routes export `generateStaticParams = episodeParams`.          |
| **Server Components by default.** `'use client'` only at leaf components, so the client bundle stays small; never in `src/app/**`. [2][4]                                                                                                                                                                                                                                                   | 4 client files, all leaves                                            | 📜 high   | ✅ **FE-006**, merged. `*.client.tsx` classifier checked both ways by ESLint, `check-file` and dependency-cruiser. 4 client entry points now, including `table-of-contents.client.tsx`.                                                                |
| **Environment poisoning.** Build-time loaders import `server-only`; only `NEXT_PUBLIC_*` env vars reach the client. [2][5]                                                                                                                                                                                                                                                                  | No loaders yet                                                        | 📜 medium | ⏳ Open, now concrete. `src/i18n/request.ts` (next-intl) is a build-time loader and `src/lib/site-url.ts` reads `process.env`; neither imports `server-only`, which is not installed. FE-006 makes a "no `.client` imports a loader" rule addressable. |

## 2. Structure and module boundaries

| Practice                                                                                                                   | Repo state                                                       | Fit     | Check notes                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Thin routes.** `app/**/page.tsx` only composes a `components/pages/*` component. [3]                                     | Already the pattern: `(en)` and `[locale]` share page components | 📜 high | ✅ **FE-007** §1. dependency-cruiser `page-composes-a-page-component` and `route-reaches-components-only-via-roots`; logic-free routes stay a review duty.                                                                                 |
| **Import direction.** `app → components → hooks → lib`; `lib` never imports React.                                         | `*.pure.ts` split exists informally                              | 📜 high | ✅ **FE-007** §2–§3. dependency-cruiser direction rules, `no-circular`, `lib-imports-no-react`, `lib-tsx-never-imported`.                                                                                                                  |
| **Pure/effect split.** Logic lives in tested `*.pure.ts`; browser side effects live in thin adapters. Pairs with ARCH-003. | Convention in use, not written down                              | 📜/🧠   | 🟡 Practised: `prefs.pure.ts` and `prefs-storage.ts`, `theme.pure.ts` and `use-theme.ts`, `table-of-contents.pure.ts` and `use-table-of-contents.ts`, `episode-page-container.pure.ts`. Not written down. ARCH-003 governs only the tests. |
| Colocation, `_private` folders, route groups. [3]                                                                          | Partly in use                                                    | 🧠 low  | ⏳ Open. `(en)` route group in use. No `_private` folders.                                                                                                                                                                                 |

## 3. React component discipline

| Practice                                                                                                                                     | Repo state                                       | Fit                                    | Check notes                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rules of React.** Components and hooks are pure; Rules of Hooks are linted with `eslint-plugin-react-hooks`. [6]                           | Plugin **not** configured in `eslint.config.mjs` | 🧹 high, cheap                         | ⏳ Open. Plugin still not configured, now with 8 effect sites. Out of scope for an ADR: a config change, pending ARCH-001.                                                                                                                                                                                                              |
| **Effects only to sync with external systems.** No effects for derived state, event logic, chains of state updates or notifying parents. [7] | —                                                | 📜 (allowlist `useEffect` sites) or 🧠 | 🟡 8 `useEffect` sites: `use-theme.ts` (2), `use-table-of-contents.ts` (5), `toc-drawer.tsx` (1). Most sync external systems (localStorage, `matchMedia`, IntersectionObserver, `scrollend`, a timer). `use-table-of-contents.ts:69`, a two-frame rAF that sets `settled`, is borderline; review it before any allowlist. Not enforced. |
| **React Compiler.** Adopt it, then ban manual `useMemo`, `useCallback` and `memo`. [8]                                                       | Not adopted; the Babel plugin must pass ARCH-001 | 📜 after adoption                      | ⏳ Not adopted. A later ban would hit `useCallback` in `use-theme.ts` and `useMemo` in `table-of-contents.client.tsx`.                                                                                                                                                                                                                  |
| **Boundary hygiene.** Server-to-client props are serializable; context providers render as deep as possible. [2]                             | —                                                | 🧠                                     | ✅ Serializable props are a review duty in FE-006 §4. No context providers exist yet.                                                                                                                                                                                                                                                   |

## 4. Content and data pipeline

| Practice                                                                                                                  | Fit                           | Check notes                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content is build-time data.** One typed loader, validated by a schema at build; no client-side content fetching. [1][5] | 📜 + 🧠, a design decision    | 🟡 Partly settled by **FE-002**: each Episode is a typed `Episode` record in `src/components/episodes/<slug>/`, listed in `registry.ts` and `EPISODE_SLUGS`, rendered only by `EpisodePageContainer`. Site strings live in next-intl catalogs, with `de.json` typed against `en.json`. No loader or build-time schema validation yet; Slide content is free JSX by decision. |
| Source of truth (MD, MDX or JSON) and how YouTube captures map to Episodes.                                               | 🧠, likely a design-ADR first | ⏳ Open. FE-002 fixes the shared H1/H2/H3 spine with the Markdown manuscript, which is not yet in the repo; the pipeline is deferred. Design-ADR first.                                                                                                                                                                                                                      |

**Where locale-neutral data lives** (added 2026-10-09). 🟡 Practised once,
not written down. `src/lib/episode-index.json` holds the Episode index: facts
per Episode with no copy (Topic, Format, dates, featured rank, accent, icon).
`parseEpisodeIndex` in `src/lib/episode-index.pure.ts` validates it at build
and rejects unknown fields, so no title slips into the data; copy stays in the
Translation files. It makes both rows above concrete. FE-007 fixes import
direction but not where a data file sits, so this one landed in `src/lib/`
beside its parser. Decide the home when a second data file arrives: `src/lib/`
beside its parser, or a dedicated `src/content/`. 📜 once decided: a rule can
pin data files to that folder.

## 5. Navigation, metadata and SEO

The bilingual audience split (English at `/`, German at `/de`) makes this
category matter more here than in a typical app.

| Practice                                                                                                               | Repo state                         | Fit                | Check notes                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Every `page.tsx` exports `metadata` or `generateMetadata`**, with canonical and `hreflang` alternates (en ↔ de). [4] | Only a static title in the layouts | 📜 high            | ✅ **FE-008**. Archgate rules `page-exports-metadata`, `layout-holds-site-metadata-only`; post-build reciprocity test. Copy now comes from next-intl catalogs via `PageRef`. |
| `sitemap.ts` and `robots.ts` (both work in a static export). [4]                                                       | Missing                            | 📜                 | ⏳ Deferred by FE-008 §5 until a custom domain: `robots.txt` is read only at an origin root.                                                                                 |
| Internal links use `next/link`; no raw `<a href="/…">`. [4]                                                            | Partly covered by FE-003           | 📜 (extend FE-003) | 🟡 FE-003 `href-via-localize-path` checks how every `href` is built, but not the element. Still no raw `<a>` under `src/`, so a ban is cheap now.                            |
| Custom `not-found.tsx` and error UI. [4]                                                                               | Missing                            | 📜                 | ⏳ Open. Still none under `src/app`. FE-008 §5 leaves it to a separate UI record.                                                                                            |

## 6. Performance and assets

| Practice                                                                                                                                              | Fit                     | Check notes                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **YouTube embeds** use a facade (lite-embed) pattern and `youtube-nocookie.com`. This is a performance gain and a GDPR point for the German audience. | 📜 high relevance       | ⏳ Open, now pressing. No embeds yet, but the `Episode` record reserves `youtube?: PerLocale<string>` (`episode-page-container.pure.ts`) and FE-002 reserves the video's place ([#6](https://github.com/hancrafted/content-library/issues/6)). Source still unverified (see the end of this document). |
| **`next/font` self-hosting**, so there is no runtime Google Fonts request (also GDPR). [4]                                                            | 📜                      | ➖ Moot for now: no web font is loaded, so the site uses system fonts.                                                                                                                                                                                                                                 |
| **Image strategy.** `next/image` runs unoptimized on a static export, so decide on pre-sized assets with required `width` and `height`. [1][4]        | 📜/🧠                   | 🟡 FE-005 §2 requires `images: { unoptimized: true }`. No images yet; sizing not decided.                                                                                                                                                                                                              |
| Client JS bundle budget. [4]                                                                                                                          | 📜 (build-output check) | ⏳ Open. FE-006 makes the `.client` glob addressable for it. next-intl now adds to the shared bundle.                                                                                                                                                                                                  |

## 7. Accessibility and security

| Practice                                                                                                                    | Fit       | Check notes                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `eslint-plugin-jsx-a11y` required; it is not in the current config. [4]                                                     | 🧹        | ⏳ Open. Not configured, while the TOC drawer (`<dialog>`) and panel add interactive UI. A config change, pending ARCH-001.  |
| CSP through a `<meta>` tag, since GitHub Pages cannot set headers. The inline pre-paint theme script then needs a hash. [4] | 🧠 medium | ⏳ Open. The inline theme script in `site-shell.tsx` still needs a hash.                                                     |
| `.env*` files gitignored; only `NEXT_PUBLIC_` variables are public. [4]                                                     | 📜        | 🟡 `.gitignore` still lists `.env` only. `.env.local` and the other variants are not ignored; a one-line fix, no ADR needed. |

## Recommended shortlist

1. Static-export contract (section 1) — ✅ FE-005
2. Server/client boundary placement (section 1) — ✅ FE-006
3. Per-page metadata with hreflang and canonical (section 5) — ✅ FE-008
4. Module layering (section 2) — ✅ FE-007; the pure/effect split stays open
5. YouTube embed and font privacy (section 6) — ⏳ next: the `youtube` field is already reserved
6. React lint baseline: hooks and a11y (sections 3 and 7) — ⏳ open

## Sources

All accessed 2026-10-08. No web search was used; these are primary docs read
directly.

1. Next.js — Static Exports: <https://nextjs.org/docs/app/guides/static-exports>
2. Next.js — Server and Client Components: <https://nextjs.org/docs/app/getting-started/server-and-client-components>
3. Next.js — Project Structure: <https://nextjs.org/docs/app/getting-started/project-structure>
4. Next.js — Production Checklist: <https://nextjs.org/docs/app/guides/production-checklist>
5. Next.js — Data Security: <https://nextjs.org/docs/app/guides/data-security>
6. React — Rules of React: <https://react.dev/reference/rules>
7. React — You Might Not Need an Effect: <https://react.dev/learn/you-might-not-need-an-effect>
8. React — React Compiler: <https://react.dev/learn/react-compiler>

The YouTube facade and `youtube-nocookie` recommendation in section 6 is not
backed by a source above; verify it before an ADR relies on it.
