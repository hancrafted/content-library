---
type: adr
id: FE-008
title: 'Page Metadata'
domain: frontend
rules: true
files: ['src/app/**/*']
paths: ['src/app/**', 'src/lib/{page-metadata*,site-url,messages,routes}.ts', 'tests/**', '.github/**/deploy.yml']
description: 'Every page exports metadata built by pageMetadata(): per-locale title and description from messages.ts, a canonical, and reciprocal en/de/x-default hreflang, resolved against a SITE_URL the deploy sets. Layouts hold site-wide metadata only.'
---

# Page Metadata

## Context

This record makes a decision; it does not write down a live convention. At adoption both root layouts exported `{ title: 'Content Library' }` — the same English string on German pages — no `page.tsx` exported metadata, and nothing set `metadataBase`, a canonical or an alternate.

The decision is a product one with an SEO mechanism. Per `AGENTS.md`, the site serves two audiences with different goals: international English viewers arriving from YouTube (reach) and German businesses arriving from German queries (conversion). Search indexes locales separately, so each locale needs its own canonical, and each page must tell crawlers its counterpart exists. Without reciprocal `hreflang`, a search engine may treat `/x` and `/de/x` as near-duplicates and rank one for both audiences — the English page in a German result costs conversion, the German page in an English result costs reach.

Alternatives weighed:

1. **Status quo, a title on the layout.** Rejected: it is what produced one English title for both locales. A layout cannot know which page it frames.
2. **Hand-written metadata per route.** Rejected: twelve URLs per page pair written by hand drift exactly as the duplicated title did. `localizePath` and `ROUTES` already produce the en/de pair — the argument that carried FE-005's post-build test.
3. **Relative canonicals, no `metadataBase`.** Rejected: Next.js then resolves them against `http://localhost:3000`, publishing localhost canonicals.
4. **Origin hard-coded in `next.config.ts`.** Rejected: a later custom domain would need a code change, and a forgotten one silently canonicalises to the old host.
5. **An i18n library such as `next-intl`.** Rejected: [ARCH-001](./ARCH-001-dependency-admission-bar.md) admits no dependency for what two pure functions do.

Settled points, argued here so Decision stays short:

- **§3, the base.** `configure-pages` reports a custom domain's `base_url` once one is configured, so moving domain needs no code change. `SITE_URL` is read only by build-time server metadata, so it has no reason to reach the client bundle.
- **§4, layouts.** Next.js inherits a layout's metadata field into every page that omits it, so a layout canonical declares every child page a copy of one URL. A layout keeps the `metadata` [FE-007](./FE-007-module-layering.md) §1.2 permits — the absolute base and the brand frame — and nothing page-shaped.
- **§5, scope.** Crawlers read `robots.txt` only at an origin root, never at `/content-library/robots.txt`, so `robots.ts` and `sitemap.ts` are moot on a project subpath; they become one record when a custom domain lands, reusing `SITE_URL`. `not-found.tsx` is a UI decision with two root layouts in play, for a separate record. An unknown prefix such as `/fr/` is no file in `out/` because FE-005's `dynamicParams = false` closes `[locale]` to `PREFIXED_LOCALES`; GitHub Pages serves its own 404. `resolveLocale()`'s `notFound()` only narrows `string` to `Locale` for the type checker — nothing may rely on it as behaviour.

## Decision

### 1. Every page exports metadata built by `pageMetadata()` (📜 Rule: `page-exports-metadata`)

1. Every `src/app/**/page.tsx` MUST export `metadata` or `generateMetadata` returning `pageMetadata(<PageKey>, locale)` from `src/lib/page-metadata.pure.ts`.
2. `pageMetadata` derives the canonical and one alternate per `LOCALES` entry plus `x-default` (the `DEFAULT_LOCALE` URL) with `localizePath`. No route writes a URL.
3. `PageKey` (`src/lib/routes.ts`) is every `ROUTES` key except `episodes`; a page MUST have one.

### 2. Title and description are messages

1. They MUST live in `MESSAGES[locale].meta[<PageKey>]` in `src/lib/messages.ts`, typed so a missing page or locale fails `tsc`.
2. A page at a root layout's own segment MUST name the brand in its title; `title.template` skips that segment.

### 3. `SITE_URL` is the absolute base

1. `metadataBase` MUST come from `SITE_URL` (origin plus base path), read only in `src/lib/site-url.ts` via `resolveSiteUrl()`. The deploy sets it from `actions/configure-pages`' `base_url`.
2. Unset, it falls back to `http://localhost:3000` plus `NEXT_PUBLIC_BASE_PATH`; malformed, the build throws.
3. It MUST NOT carry the `NEXT_PUBLIC_` prefix.

### 4. Layouts hold site-wide metadata only (📜 Rule: `layout-holds-site-metadata-only`)

1. A root layout MUST export only `siteMetadata(locale, SITE_URL)`: `metadataBase` and the `title` default and template.
2. A layout MUST NOT set `alternates`, `canonical` or `description`, nor call `pageMetadata`.

### 5. Scope

1. `sitemap.ts`, `robots.ts` and `not-found.tsx` are out of this record.
2. An unknown locale prefix is owned by [FE-005](./FE-005-static-export-contract.md) §1, not by `resolveLocale()`.

## Do's and Don'ts

### Do's

1. **DO** write `export const metadata = pageMetadata('<page>', DEFAULT_LOCALE)` in the unprefixed tree and `generateMetadata` returning `pageMetadata('<page>', await resolveLocale(params))` under `[locale]`. (Decision 1, 📜 Rule: `page-exports-metadata`)
2. **DO** add a new page's `ROUTES` key and its `meta` entry in both locales before its route. (Decisions 1 and 2)
3. **DO** write titles and descriptions for the reader of a search result in that language, not as translations of each other. (Decision 2)
4. **DO** keep root layouts to `siteMetadata(locale, SITE_URL)`. (Decision 4, 📜 Rule: `layout-holds-site-metadata-only`)
5. **DO** run `npm run build` then `npm run test:build` after touching metadata, routes or locales. (Decisions 1 and 3)

### Don'ts

1. **DON'T** write a title, description or URL literal into a route's metadata. (Decisions 1 and 2)
2. **DON'T** set `alternates`, `canonical` or `description` on a layout. (Decision 4)
3. **DON'T** hard-code the site origin, or read `SITE_URL` anywhere but `src/lib/site-url.ts`. (Decision 3)
4. **DON'T** rename `SITE_URL` to `NEXT_PUBLIC_SITE_URL`. (Decision 3)
5. **DON'T** add `sitemap.ts`, `robots.ts` or `not-found.tsx` under this record. (Decision 5)

## Consequences

**Positive:**

1. **Each audience finds its locale:** every page names its own canonical and its counterpart, so a German query can surface the `/de` page and an English one the bare page.
2. **One source per fact:** URLs from `localizePath`, copy from `messages.ts`, the origin from the deploy. The duplicated title cannot recur.
3. **Domain-portable:** a custom domain changes `configure-pages`' output, not code.
4. **Held at three depths:** route text by archgate, copy completeness by `tsc`, the emitted HTML by the post-build test.

**Negative:**

1. **Pull-request builds carry localhost canonicals:** only the deploy sets `SITE_URL`, so CI's `check` job asserts the shape against the fallback, not the real origin.
2. **Two export forms:** the `[locale]` tree needs `generateMetadata` where the unprefixed tree uses a constant.
3. **The root title repeats the brand by hand** (Decision 2.2).

**Risks:**

1. **A deploy loses `SITE_URL`:** canonicals would publish as localhost. **Mitigation:** the deploy passes `SITE_URL` to the post-build test separately from the build step; a build that lost it fails against the workflow's value. Dropping it from both steps is not caught.
2. **A page missing from `ROUTES`:** the post-build test walks `ROUTES` × `LOCALES`, so it cannot see it. **Mitigation:** `page-exports-metadata` still forces `pageMetadata(<PageKey>)`, which accepts only a `ROUTES` key — `tsc` fails first.

## Compliance and Enforcement

**Enforcers per Discipline:**

- §1.1, §4: `FE-008-page-metadata.rules.ts`, `error` tier — rules `page-exports-metadata` and `layout-holds-site-metadata-only`, textual over `src/app/**/*`; pass and fail paths in `FE-008-page-metadata.rules.test.ts`, including a pinned false positive: a comment naming `description` in a layout fails.
- §1.2, §3: `tests/post-build/page-metadata.build.test.ts`, run by `npm run test:build` after `npm run build` in CI's `check` job and in `.github/workflows/deploy.yml` before upload. It asserts one canonical per page equal to its served URL under `SITE_URL`, the full `LOCALES` + `x-default` set on every page, every alternate resolving to a file in `out/`, and every alternate linking back. Prints pages and alternates walked.
- §1.2, §2, §3.2: `src/lib/page-metadata.test.ts` (fast suite) and `tsc` (§2.1).

**Measured on introduction:** archgate, 0 errors before; probes — a page with no metadata, a page with a hand-written `{ title }`, `alternates: { canonical }` on `(en)/layout.tsx` — gave 4 (1, 1, 2 on line 7); removed, 0. Post-build, 4 pages walked, 12 alternates, 5 tests green both without `SITE_URL` (CI's shape, site `http://localhost:3000`) and with it. A one-way probe (German pages drop their `en` alternate): 10 alternates, 2 tests red, naming the 2 English pages whose `de` alternate does not link back. A build without `SITE_URL` tested against the deploy's: 3 tests red on localhost canonicals. Restored: 4 pages, 12 alternates, 5 green.

**Manual review duties** (never linted): titles and descriptions read well to a searcher in their own language — no check grades copy (§2); no route spells a URL or copy outside `pageMetadata` (§1); `SITE_URL` stays set on both deploy steps (Risk 1).

**Known reach gap:** Open Graph and Twitter cards, structured data, and titles supplied from the manuscript content pipeline are unaddressed.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Metadata and `generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — `metadataBase`, `alternates`, `title.template`, inheritance.
- [Google Search — Localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions) — reciprocal `hreflang` and `x-default`.
- [actions/configure-pages](https://github.com/actions/configure-pages) — the `base_url` output.
- [FE-003 Localization](./FE-003-localization.md) — the URL shape `localizePath` produces.
- [FE-005 Static Export Contract](./FE-005-static-export-contract.md) — the post-build lane, and the unknown-prefix 404.
- [FE-007 Module Layering](./FE-007-module-layering.md) — what a root layout may export.
- [`docs/research/adr-candidates.md`](../../docs/research/adr-candidates.md) §5 — the survey this record came from.
