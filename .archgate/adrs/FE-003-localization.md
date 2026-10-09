---
type: adr
id: FE-003
title: 'Localization'
domain: frontend
rules: true
files: ['src/**/*.tsx']
paths: ['src/**/*.{ts,tsx}']
description: 'How a locale shows up in a URL: the default locale is served unprefixed, every other locale under a /<locale> path segment; every href is built one way; text a client completes is filled from one template.'
---

# Localization

## Context

Static export: no middleware detects a locale or rewrites a prefix at request time, so the URL is the only carrier of locale. Without one fixed shape a page gains two canonical URLs (`/x` and `/en/x`), and hand-built links drift from the routes actually exported.

Some text is completed only in the browser — "Show all 12", once a filter has counted. Reading the raw string with `t.raw` needs a cast and escapes the typed keys, and each widget grew its own replace call.

## Decision

### 1. Default locale unprefixed, every other locale a path segment

1. The default locale (`en`) MUST be served at the bare path, its canonical URL; no `/en` route may exist.
2. Every other locale MUST be served under a leading `/<locale>` segment — `/de`, `/de/episode/page-template`.

### 2. Every href is built one way (📜 Rule: `href-via-localize-path`)

1. An internal `href` MUST be `{localizePath(<logical path>, locale)}`; the logical path is locale-neutral. A locale switch passes `stripLocale(pathname)`, so the reader stays on the same page.
2. An external `href` MUST be an `https://` literal, or `{externalHref(url)}` for a URL held in data, so its scheme is checked. Its tag MUST carry `target="_blank"` and `rel="noopener noreferrer"`, and tell the reader it opens a new tab.
3. Nothing else: no bare variable, no `http:`, no other helper, no `href` spread in.

### 3. Text a client completes is a template, filled once

1. A Translation string a client component completes at runtime MUST keep its `{name}` placeholders and be filled by `fillTemplate` — no other replace.
2. An Episode MUST hand it over from its kit's `template(key)`, never `t.raw`.

## Do's and Don'ts

### Do's

1. **DO** link with `localizePath(ROUTES.<route>, locale)`; keep route constants locale-neutral. (Decision 2)
2. **DO** switch locale with `localizePath(stripLocale(pathname), target)`. (Decision 2)
3. **DO** open an external link in a new tab and say so to screen readers — `<span className="sr-only">(opens in a new tab)</span>`. (Decision 2)
4. **DO** link another Slide of the same Episode with the kit's `slideHref(slug)`. (Decision 2)
5. **DO** pass `template('show-all')` to the widget and render `fillTemplate(label, { count })`. (Decision 3)

### Don'ts

1. **DON'T** add an `/en` route or redirect, or emit `/en` in any URL. (Decision 1)
2. **DON'T** build an `href` any other way — `'/de' + path`, `http://…`, `{url}`, `{...{ href }}`. (Decision 2, 📜 Rule: `href-via-localize-path`)
3. **DON'T** read an Episode string with `t.raw`, or fill a placeholder by hand — `label.replace('{count}', …)`. (Decision 3)

## Consequences

**Positive:**

1. **One canonical URL per page per locale:** bare path is English; prefixed paths map one-to-one onto exported files.
2. **No stray links:** every `href` in the tree has one of three known shapes.
3. **Typed runtime text:** an Episode's template key is checked like any other; one fill function site-wide.

**Negative:**

1. **Asymmetric route tree:** the default and prefixed locales need separate route roots (`src/app/(en)/`, `src/app/[locale]/`) kept in step.
2. **Internal links need the locale:** a Slide gets it, and its Slide links, from the kit; other code without it can't link internally.
3. **Wrappers repeat:** each external link restates `target`, `rel` and the new-tab label.
4. **A missing value shows:** an unfilled `{count}` stays on the page as written, by design.

**Risks:**

1. **External targets unchecked:** the rule sees scheme, `target` and `rel`, not whether a URL is live or trusted. **Mitigation:** review checks each new URL.
2. **New-tab label unchecked:** easy to forget. **Mitigation:** review duty below.

## Compliance and Enforcement

1. **Rule** `href-via-localize-path` (archgate, error): every JSX `href` under `src/` is `localizePath(…)`, an `https://` literal or `externalHref(…)`; external ones carry `target` and `rel`; spread `href`s refused.
2. **Unit tests:** `localizePath` and `switchLocale` — bare default, `/de` prefix, round-trip switch; `fillTemplate`.
3. **Types:** the kit's `template` takes only a string leaf of the Slide's own keys (§3.2).
4. **Lint:** `.raw(` refused in Episode files (§3.2).

**Manual review duties:** no hand-written placeholder replace (§3.1); no `/en` route; logical path locale-neutral; every external link tells the reader it opens a new tab.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — static exports](https://nextjs.org/docs/app/guides/static-exports) — why no middleware runs.
