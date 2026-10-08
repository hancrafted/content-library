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

## 1. Rendering and runtime (static export)

| Practice                                                                                                                                                                                                                                                                                                                                                                                    | Repo state                                                            | Fit       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------- |
| **Static-export contract.** Every dynamic segment exports `dynamicParams = false` and `generateStaticParams`. Ban features a static export does not support: `next/headers` and cookies, `'use server'` (Server Actions), route handlers reading `Request`, `proxy`, rewrites, redirects and headers config, ISR, Draft Mode, intercepting routes, and the default `next/image` loader. [1] | Already done in `src/app/[locale]/*.tsx:4-5`, but nothing enforces it | 📜 high   |
| **Server Components by default.** `'use client'` only at leaf components, so the client bundle stays small; never in `src/app/**`. [2][4]                                                                                                                                                                                                                                                   | 4 client files, all leaves                                            | 📜 high   |
| **Environment poisoning.** Build-time loaders import `server-only`; only `NEXT_PUBLIC_*` env vars reach the client. [2][5]                                                                                                                                                                                                                                                                  | No loaders yet                                                        | 📜 medium |

## 2. Structure and module boundaries

| Practice                                                                                                                   | Repo state                                                       | Fit     |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------- |
| **Thin routes.** `app/**/page.tsx` only composes a `components/pages/*` component. [3]                                     | Already the pattern: `(en)` and `[locale]` share page components | 📜 high |
| **Import direction.** `app → components → hooks → lib`; `lib` never imports React.                                         | `*.pure.ts` split exists informally                              | 📜 high |
| **Pure/effect split.** Logic lives in tested `*.pure.ts`; browser side effects live in thin adapters. Pairs with ARCH-003. | Convention in use, not written down                              | 📜/🧠   |
| Colocation, `_private` folders, route groups. [3]                                                                          | Partly in use                                                    | 🧠 low  |

## 3. React component discipline

| Practice                                                                                                                                     | Repo state                                       | Fit                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| **Rules of React.** Components and hooks are pure; Rules of Hooks are linted with `eslint-plugin-react-hooks`. [6]                           | Plugin **not** configured in `eslint.config.mjs` | 🧹 high, cheap                         |
| **Effects only to sync with external systems.** No effects for derived state, event logic, chains of state updates or notifying parents. [7] | —                                                | 📜 (allowlist `useEffect` sites) or 🧠 |
| **React Compiler.** Adopt it, then ban manual `useMemo`, `useCallback` and `memo`. [8]                                                       | Not adopted; the Babel plugin must pass ARCH-001 | 📜 after adoption                      |
| **Boundary hygiene.** Server-to-client props are serializable; context providers render as deep as possible. [2]                             | —                                                | 🧠                                     |

## 4. Content and data pipeline

| Practice                                                                                                                  | Fit                           |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Content is build-time data.** One typed loader, validated by a schema at build; no client-side content fetching. [1][5] | 📜 + 🧠, a design decision    |
| Source of truth (MD, MDX or JSON) and how YouTube captures map to Episodes.                                               | 🧠, likely a design-ADR first |

## 5. Navigation, metadata and SEO

The bilingual audience split (English at `/`, German at `/de`) makes this
category matter more here than in a typical app.

| Practice                                                                                                               | Repo state                         | Fit                |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ------------------ |
| **Every `page.tsx` exports `metadata` or `generateMetadata`**, with canonical and `hreflang` alternates (en ↔ de). [4] | Only a static title in the layouts | 📜 high            |
| `sitemap.ts` and `robots.ts` (both work in a static export). [4]                                                       | Missing                            | 📜                 |
| Internal links use `next/link`; no raw `<a href="/…">`. [4]                                                            | Partly covered by FE-003           | 📜 (extend FE-003) |
| Custom `not-found.tsx` and error UI. [4]                                                                               | Missing                            | 📜                 |

## 6. Performance and assets

| Practice                                                                                                                                              | Fit                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **YouTube embeds** use a facade (lite-embed) pattern and `youtube-nocookie.com`. This is a performance gain and a GDPR point for the German audience. | 📜 high relevance       |
| **`next/font` self-hosting**, so there is no runtime Google Fonts request (also GDPR). [4]                                                            | 📜                      |
| **Image strategy.** `next/image` runs unoptimized on a static export, so decide on pre-sized assets with required `width` and `height`. [1][4]        | 📜/🧠                   |
| Client JS bundle budget. [4]                                                                                                                          | 📜 (build-output check) |

## 7. Accessibility and security

| Practice                                                                                                                    | Fit       |
| --------------------------------------------------------------------------------------------------------------------------- | --------- |
| `eslint-plugin-jsx-a11y` required; it is not in the current config. [4]                                                     | 🧹        |
| CSP through a `<meta>` tag, since GitHub Pages cannot set headers. The inline pre-paint theme script then needs a hash. [4] | 🧠 medium |
| `.env*` files gitignored; only `NEXT_PUBLIC_` variables are public. [4]                                                     | 📜        |

## Recommended shortlist

1. Static-export contract (section 1)
2. Server/client boundary placement (section 1)
3. Per-page metadata with hreflang and canonical (section 5)
4. Module layering and the pure/effect split (section 2)
5. YouTube embed and font privacy (section 6)
6. React lint baseline: hooks and a11y (sections 3 and 7)

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
