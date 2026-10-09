---
type: adr
id: FE-005
title: 'Static Export Contract'
domain: frontend
rules: true
files: ['src/**/*.{ts,tsx,js,jsx,mjs}', '{next.config,proxy,middleware}.{ts,js,mjs}']
paths: ['src/**/*.{ts,tsx}', 'next.config.ts']
description: "What output: 'export' forbids — every request-time Next.js feature — and what every dynamic route segment must export so its path set is closed at build time."
---

# Static Export Contract

## Context

The site ships to GitHub Pages as the static files `next build` writes to `out/` under `output: 'export'`. No Next.js server ever runs, so anything that needs a request — cookies, headers, Server Actions, a proxy, ISR, Draft Mode, rewrites, on-demand image optimisation — is unsupported. Some fail `next build`; others build, export and silently do nothing on Pages. Either way the failure shows at or after deploy, not where the code is written.

Rejected: a self-hosted Node server (gives up free static hosting for features a content site doesn't need); relying on `next build` errors alone (silent for features that build but no-op).

## Decision

### 1. Dynamic segments are closed at build time (📜 Rule: `dynamic-segment-static-params`)

1. Every `page` and `layout` under a dynamic `[segment]` in `src/app/` MUST export `generateStaticParams` returning the full param list and `dynamicParams = false`, so an unlisted param 404s instead of rendering on demand.

### 2. The export config stays intact (📜 Rule: `export-config-intact`)

1. `next.config.ts` MUST set `output: 'export'` and `images: { unoptimized: true }`; the default image loader optimises per request.
2. `next.config.ts` MUST NOT declare `rewrites`, `redirects` or `headers`; only a Next.js server applies them.

### 3. No request-time imports

1. Code under `src/` MUST NOT import `next/headers`, `next/server` or `next/cache`.

### 4. No request-time features (📜 Rule: `no-request-time-features`)

1. No `proxy` or `middleware` file MAY exist at the root or in `src/`.
2. No `'use server'` (Server Actions) and no `export const revalidate` (ISR) under `src/`.
3. No intercepting route folder — `(.)`, `(..)`, `(...)` — under `src/app/`.
4. A route handler MUST export only `GET`, taking no `Request`.

## Do's and Don'ts

### Do's

1. **DO** write `export const dynamicParams = false;` and `export const generateStaticParams = <params fn>;` in every dynamic page and layout. (Decision 1, 📜 Rule: `dynamic-segment-static-params`)
2. **DO** keep `output: 'export'` and `images: { unoptimized: true }` in `next.config.ts`. (Decision 2, 📜 Rule: `export-config-intact`)
3. **DO** compute everything a page needs at build time, in the server component. (Decisions 3 and 4)
4. **DO** run `npm run build` after touching `src/app/` or `next.config.ts`. (Decision 1)

### Don'ts

1. **DON'T** import `cookies()`, `NextResponse` or `revalidatePath` — their modules need a server. (Decision 3)
2. **DON'T** add `rewrites`, `redirects` or `headers`, nor a `proxy.ts` or `middleware.ts` to do their job. (Decisions 2 and 4)
3. **DON'T** write `'use server'`, `export const revalidate`, a `POST` handler or `GET(request)`. (Decision 4, 📜 Rule: `no-request-time-features`)
4. **DON'T** create an intercepting route folder; give the view its own route. (Decision 4)
5. **DON'T** leave a param list open — no `dynamicParams = true`, no missing `generateStaticParams`. (Decision 1)

## Consequences

**Positive:**

1. **Deploy failures move left:** a request-time feature fails lint or `archgate check` where it's written, not on Pages after merge.
2. **Closed path set:** every exported URL is enumerated at build time; `out/` maps one-to-one onto the site.

**Negative:**

1. **No request-time escape hatch:** forms, auth, personalisation and server redirects need a third-party service or a client-side design.
2. **A dropped page is only partly caught:** the post-build test expects every URL derived from the route and locale lists, so it can't see a page missing from those lists. It runs after build, so a dropped page blocks the pull request and deploy, not the commit.

**Risks:**

1. **Transitive reach:** every check is textual over this repo. A dependency importing `next/headers` or shipping `'use server'`, a dynamic `import('next/headers')`, or an arrow-form `GET` reading its request all pass. **Mitigation:** `next build` in CI errors on many; new dependencies are reviewed for request-time APIs.
2. **Next.js adds a request-time feature:** the ban list mirrors the Next.js 16.4 static-export docs. **Mitigation:** re-read that page on each Next.js minor upgrade and amend.

## Compliance and Enforcement

1. **Rules** (archgate, error): `dynamic-segment-static-params` (§1), `export-config-intact` (§2), `no-request-time-features` (§4).
2. **Lint:** `no-restricted-imports` bans the three modules under `src/` (§3).
3. **Post-build test** (`npm run test:build`, CI and deploy, before upload): every URL from the route list × locales has a file in `out/`; prints the page count so an empty walk can't pass.
4. **Build:** `npm run build` in CI fails on many request-time APIs.

**Manual review duties:** new dependencies checked for request-time Next.js APIs; a new page has a route-list entry so the post-build test expects it.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Static Exports](https://nextjs.org/docs/app/guides/static-exports) — the supported and unsupported lists this record mirrors.
- [Next.js — `generateStaticParams`](https://nextjs.org/docs/app/api-reference/functions/generate-static-params) and [`dynamicParams`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/dynamicParams).
- [`docs/research/adr-candidates.md`](../../docs/research/adr-candidates.md) §1 — the survey this record came from.
