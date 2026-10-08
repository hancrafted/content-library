---
type: adr
id: FE-005
title: 'Static Export Contract'
domain: frontend
rules: true
files: ['src/**/*', 'next.config.ts', 'next.config.js', 'next.config.mjs', 'proxy.ts', 'middleware.ts']
paths: ['src/**/*', 'next.config.ts']
description: "What output: 'export' forbids — every request-time Next.js feature — and what every dynamic route segment must export so its path set is closed at build time."
---

# Static Export Contract

## Context

The site deploys to GitHub Pages as the static files `next build` writes to `out/` under `output: 'export'`. No Next.js server ever runs, so any feature that needs a request — cookies, headers, Server Actions, a proxy, ISR, Draft Mode, rewrites, on-demand image optimisation — is unsupported. Some of these fail `next build` outright; others build, export and simply do nothing on Pages. Either way the failure surfaces at or after deploy, not where the code is written.

The repo already practises the contract: `src/app/[locale]/page.tsx`, `layout.tsx` and `episode/page-template/page.tsx` export `generateStaticParams = prefixedLocaleParams` and `dynamicParams = false`, with `resolveLocale()` in `src/app/[locale]/params.ts` calling `notFound()` on anything else. Nothing enforced it. This record writes the live convention down and puts checks behind it; it changes no behaviour.

Rejected alternatives: a self-hosted Node server (gives up free static hosting for features this content site does not need); relying on `next build` errors alone (silent for the features that build but no-op).

A post-build assertion over `out/` was first rejected on two premises: it needed a hand-kept route list, and a `scripts/` home for loose tooling. The first was wrong — the expected URL set derives from `ROUTES` and `LOCALES`/`localizePath`, the modules the site already renders from, so no page list is hand-kept — only the section prefix `ROUTES.episodes` is excluded — and the check cannot drift from the app. The second is answered by making it a test, not a script: assertions, failure output and CI reporting come free. It is now adopted as a post-build test lane (Compliance).

## Decision

### 1. Dynamic segments are closed at build time (📜 Rule: `dynamic-segment-static-params`)

1. Every `page` and `layout` file under a dynamic `[segment]` in `src/app/` MUST export `generateStaticParams` returning the complete param list, and MUST export `dynamicParams = false`, so an unlisted param is a 404 rather than an on-demand render.

### 2. The export config stays intact (📜 Rule: `export-config-intact`)

1. `next.config.ts` MUST set `output: 'export'` and `images: { unoptimized: true }`; the default `next/image` loader optimises at request time.
2. `next.config.ts` MUST NOT declare `rewrites`, `redirects` or `headers`; only a Next.js server applies them.

### 3. No request-time features (📜 Rule: `no-request-time-features`)

1. Code under `src/` MUST NOT import `next/headers` (`cookies`, `headers`, `draftMode`), `next/server` (`NextRequest`, `NextResponse`, proxy helpers) or `next/cache` (revalidation and the data cache). Enforced by ESLint `no-restricted-imports` in `eslint.config.mjs`.
2. No `proxy` or `middleware` file MAY exist at the root or in `src/`.
3. No `'use server'` directive (Server Actions) and no `export const revalidate` (ISR) MAY appear under `src/`.
4. No intercepting route folder — `(.)`, `(..)`, `(...)` — MAY exist under `src/app/`.
5. A route handler MUST export only `GET`, declared with no `Request` parameter.

## Do's and Don'ts

### Do's

1. **DO** write `export const dynamicParams = false;` and `export const generateStaticParams = <params fn>;` in every dynamic page and layout, as `src/app/[locale]/page.tsx` does. (Decision 1, 📜 Rule: `dynamic-segment-static-params`)
2. **DO** keep `output: 'export'` and `images: { unoptimized: true }` in `next.config.ts`. (Decision 2, 📜 Rule: `export-config-intact`)
3. **DO** compute everything a page needs at build time; content is read in the server component during `next build`. (Decision 3)
4. **DO** run `npm run build` locally after touching `src/app/` or `next.config.ts`; CI runs it on every pull request. (Decision 1)

### Don'ts

1. **DON'T** import `next/headers`, `next/server` or `next/cache` under `src/`. (Decision 3)
2. **DON'T** add `rewrites`, `redirects` or `headers` to `next.config.ts`, nor a `proxy.ts` or `middleware.ts` to do their job. (Decisions 2 and 3)
3. **DON'T** write `'use server'`, `export const revalidate`, a non-`GET` route handler, or a `GET(request)` that reads the request. (Decision 3, 📜 Rule: `no-request-time-features`)
4. **DON'T** create an intercepting route folder; give the view its own route. (Decision 3)
5. **DON'T** leave a dynamic segment's param list open — no `dynamicParams = true`, no omitted `generateStaticParams`. (Decision 1)

## Consequences

**Positive:**

1. **Deploy failures move left:** a request-time feature fails `eslint` or `archgate check` where it is written, not on Pages after merge.
2. **Closed path set:** every exported URL is enumerated at build time, so `out/` maps one-to-one onto the site and unlisted params 404.

**Negative:**

1. **No request-time escape hatch:** forms, auth, personalisation and server redirects need a third-party service or a client-side design; the next such feature costs an amendment or a different host.
2. **A dropped page is only partly held:** the post-build test fails when a URL derived from `ROUTES` × `LOCALES` has no file in `out/` — an incomplete `generateStaticParams`, a moved or deleted page. It cannot see a page that `ROUTES` itself never lists, nor an entry deleted from `ROUTES` (the expected set shrinks with it; only the printed page count drops). It runs post-build, off the commit path, so a dropped page fails at CI or a local `npm run test:build`, not at commit.

**Risks:**

1. **Transitive reach gap:** every check here is textual over this repo's files. A banned feature reached through a dependency — a package that imports `next/headers` or ships a `'use server'` module — is invisible to `no-restricted-imports` and to the archgate rules; so is a dynamic `import('next/headers')` or `require`, which `no-restricted-imports` does not inspect, and an arrow-form `GET` reading its request. **Mitigation:** `next build` in CI errors on many of these, and reviewers check new dependencies under [ARCH-001](./ARCH-001-dependency-admission-bar.md). Coverage of dependencies is not claimed.
2. **Next.js adds a new request-time feature:** the ban list is pinned to the Next.js 16.4 static-export docs. **Mitigation:** re-read the static-export page on each Next.js minor upgrade and amend this record.

## Compliance and Enforcement

**Enforcers per Discipline:**

- §1, §2 and §3.2–§3.5: `FE-005-static-export-contract.rules.ts`, `error` tier — rules `dynamic-segment-static-params`, `export-config-intact`, `no-request-time-features`.
- §3.1: ESLint `no-restricted-imports` scoped to `src/**/*.{ts,tsx}` in `eslint.config.mjs`. Measured on introduction: a probe file with four banned import statements under `src/` went from 0 errors to 4; the same probe outside `src/` stays at 0; the repo stays at 0.
- §1 outcome (pages land in `out/`): `tests/post-build/static-export.build.test.ts`, run by `npm run test:build` right after `npm run build` in the CI `check` job — post-build, off the commit path, excluded from `npm run verify` by its `*.build.test.ts` suffix. Prints the page count walked, since a walk over zero pages would pass silently. Measured on introduction: 4 pages walked, 0 missing; with `src/app/[locale]/episode/page-template/page.tsx` removed and rebuilt, red with `de/episode/page-template/index.html` missing; restored, green at 4. Deleting `ROUTES.episodeTemplate` stays green at 2 pages walked (Negative 2) — `tsc` fails on its callers instead.
- Archgate rules: `FE-005-static-export-contract.rules.test.ts` carries the measurement duty the ESLint line above carries inline — a pass and fail case per rule, plus pinned known cases: a commented `headers:` false positive in `export-config-intact`, and the arrow-form `GET(request)` gap of Risk 1.
- Backstop: the CI `check` job's `npm run build`, which fails on many request-time APIs.

**Manual review duties** (never linted): new dependencies are checked for request-time Next.js APIs (Risk 1); a new page has a `ROUTES` entry, so the post-build test expects it (Negative 2).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Static Exports](https://nextjs.org/docs/app/guides/static-exports) — the supported and unsupported feature lists this record mirrors.
- [Next.js — `generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) and [`dynamicParams`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams).
- [ESLint — `no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports).
- [FE-003 Localization](./FE-003-localization.md) — the URL shape the exported locale paths follow.
- [ARCH-001 Dependency Admission Bar](./ARCH-001-dependency-admission-bar.md) — the review that carries Risk 1.
- [`docs/research/adr-candidates.md`](../../docs/research/adr-candidates.md) §1 — the survey this record was chosen from.
