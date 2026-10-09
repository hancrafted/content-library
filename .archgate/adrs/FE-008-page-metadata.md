---
type: adr
id: FE-008
title: 'Page Metadata'
domain: frontend
rules: true
files: ['src/app/**/*.tsx']
paths: ['src/app/**/*.tsx', 'src/lib/{page-metadata,site-url}*.ts']
description: 'Every page exports metadata built by pageMetadata(): per-locale title and description from the next-intl Translation files, a canonical, and reciprocal en/de/x-default hreflang, resolved against a SITE_URL the deploy sets. Layouts hold site-wide metadata only.'
---

# Page Metadata

## Context

Two audiences: English viewers arriving from YouTube (reach) and German businesses arriving from German queries (conversion). Search indexes locales separately, so each locale needs its own canonical, and each page must name its counterpart. Without reciprocal `hreflang` a search engine may treat `/x` and `/de/x` as near-duplicates and rank one for both — the English page in a German result costs conversion, the German page in an English result costs reach.

Rejected:

1. **A title on the layout:** a layout can't know which page it frames — it produced one English title on German pages.
2. **Hand-written metadata per route:** twelve URLs per page pair drift by hand; `localizePath` already produces the pair.
3. **Relative canonicals, no `metadataBase`:** Next.js resolves them against `http://localhost:3000` and publishes localhost.
4. **Origin hard-coded in `next.config.ts`:** a custom domain would need a code change, and a forgotten one canonicalises to the old host.

Why layouts stay site-wide: Next.js inherits a layout's field into every page that omits it, so a layout canonical declares every child a copy of one URL.

## Decision

### 1. Every page exports metadata built by `pageMetadata()` (📜 Rule: `page-exports-metadata`)

1. Every `page.tsx` MUST export `metadata` or `generateMetadata` returning `pageMetadata(<PageRef>, locale)`.
2. `pageMetadata` derives the canonical and one alternate per locale plus `x-default` (the default-locale URL). No route writes a URL.
3. `PageRef` is `'home'` or `{ episode: <EpisodeSlug> }`; every page has one.

### 2. Title and description are translated strings

1. They MUST live in the Translation files — `meta.home`, `episodes.<slug>.title` / `.description` — so a missing German key fails `tsc`.
2. A page at a root layout's own segment MUST name the brand in its title; `title.template` skips that segment.

### 3. `SITE_URL` is the absolute base

1. `metadataBase` MUST come from `SITE_URL` (origin plus base path), read only in `src/lib/site-url.ts`. The deploy sets it from `configure-pages`' `base_url`, so a custom domain needs no code change.
2. Unset, it falls back to localhost plus the base path; malformed, the build throws.
3. It MUST NOT carry the `NEXT_PUBLIC_` prefix; only build-time metadata reads it.

### 4. Layouts hold site-wide metadata only (📜 Rule: `layout-holds-site-metadata-only`)

1. A root layout MUST export only `siteMetadata(locale, SITE_URL)`: `metadataBase` and the `title` default and template.
2. A layout MUST NOT set `alternates`, `canonical` or `description`, nor call `pageMetadata`.

### 5. Scope

1. `sitemap.ts` and `robots.ts` wait for a custom domain — crawlers read `robots.txt` only at an origin root. `not-found.tsx` is a separate UI decision.
2. An unknown locale prefix is no file in `out/`, so Pages serves its 404. `resolveLocale()`'s `notFound()` only narrows the type; nothing relies on it.

## Do's and Don'ts

### Do's

1. **DO** write `export const metadata = pageMetadata('home', DEFAULT_LOCALE)` in the unprefixed tree and `generateMetadata` returning `pageMetadata('home', await resolveLocale(params))` under `[locale]`. (Decision 1, 📜 Rule: `page-exports-metadata`)
2. **DO** add a new page's `PageRef`, title and description in both Translation files before its route. (Decisions 1 and 2)
3. **DO** write each locale's title and description for a searcher in that language, not as translations of each other. (Decision 2)
4. **DO** keep root layouts to `siteMetadata(locale, SITE_URL)`. (Decision 4, 📜 Rule: `layout-holds-site-metadata-only`)
5. **DO** run `npm run build` then `npm run test:build` after touching metadata, routes or locales. (Decisions 1 and 3)

### Don'ts

1. **DON'T** write a title, description or URL literal into a route's metadata. (Decisions 1 and 2)
2. **DON'T** set `alternates`, `canonical` or `description` on a layout. (Decision 4)
3. **DON'T** hard-code the site origin, or read `SITE_URL` outside `src/lib/site-url.ts`. (Decision 3)
4. **DON'T** rename `SITE_URL` to `NEXT_PUBLIC_SITE_URL`. (Decision 3)
5. **DON'T** add `sitemap.ts`, `robots.ts` or `not-found.tsx` under this record. (Decision 5)

## Consequences

**Positive:**

1. **Each audience finds its locale:** a German query can surface `/de`, an English one the bare page.
2. **One source per fact:** URLs from `localizePath`, copy from the Translation files, origin from the deploy.
3. **Domain-portable:** a custom domain changes the deploy's output, not code.
4. **Held at three depths:** route text by rule, copy completeness by types, emitted HTML by the post-build test.

**Negative:**

1. **Pull-request builds carry localhost canonicals:** only the deploy sets `SITE_URL`, so CI checks shape, not the real origin.
2. **Two export forms:** `[locale]` needs `generateMetadata` where the unprefixed tree uses a constant.
3. **The root title repeats the brand by hand** (§2.2).

**Risks:**

1. **A deploy loses `SITE_URL`:** canonicals publish as localhost. **Mitigation:** the deploy passes `SITE_URL` to the post-build test separately from the build, so a build that lost it fails. Dropping it from both is not caught.
2. **A page missing from the walk:** the post-build test walks home and every Episode × locale. **Mitigation:** `pageMetadata` accepts only a known `PageRef`, so `tsc` fails first.

## Compliance and Enforcement

1. **Rules** (archgate, error): `page-exports-metadata` (§1.1), `layout-holds-site-metadata-only` (§4). A comment naming `description` in a layout is a known false positive.
2. **Types:** a missing Translation key or unknown `PageRef` fails `tsc` (§1.3, §2.1).
3. **Unit tests:** `pageMetadata` canonical, alternates and `x-default`; `SITE_URL` fallback and throw (§1.2, §3.2).
4. **Post-build test** (CI and deploy, before upload): one canonical per page equal to its served URL under `SITE_URL`; every alternate resolves to a file in `out/` and links back.

**Known gap:** Open Graph and Twitter cards, structured data.

**Manual review duties:** copy reads well to a searcher in its own language (§2); no route spells a URL or copy outside `pageMetadata` (§1); `SITE_URL` stays set on both deploy steps (Risk 1).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Metadata and `generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — `metadataBase`, `alternates`, `title.template`, inheritance.
- [Google Search — Localized versions of your pages](https://developers.google.com/search/docs/specialty/international/localized-versions) — reciprocal `hreflang` and `x-default`.
- [actions/configure-pages](https://github.com/actions/configure-pages) — the `base_url` output.
- [`docs/research/adr-candidates.md`](../../docs/research/adr-candidates.md) §5 — the survey this record came from.
