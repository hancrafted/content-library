---
type: adr
id: FE-003
title: 'Localization'
domain: frontend
rules: true
files: ['src/**/*.{ts,tsx}']
paths: ['src/**/*.{ts,tsx}']
description: 'How a locale shows up in a URL: the default locale is served unprefixed, every other locale under a /<locale> path segment.'
---

# Localization

## Context

The site is a static export, so no middleware can detect a locale or rewrite a prefix at request time; the URL itself is the only carrier of locale. Without one fixed shape, the same page gains two canonical URLs (`/x` and `/en/x`), and links or locale switches built by hand drift from the routes actually exported.

## Decision

### 1. The default locale is unprefixed; every other locale is a path segment (📜 Rule: `href-via-localize-path`)

1. The default locale (`DEFAULT_LOCALE`, currently `en`) MUST be served at the bare path, which is its canonical URL; no `/<default-locale>` route may exist.
2. Every other locale MUST be served under a leading `/<locale>` segment (`/de`, `/de/episode/page-template`).
3. Every internal JSX `href` MUST be the expression `{localizePath(<logical path>, locale)}`, with `localizePath` from `src/lib/locale.pure.ts`. A locale switch passes `stripLocale(pathname)` as the logical path, so it keeps the reader on the same logical page; a switch via `router.push` MAY carry the current Slide as the fragment (third argument of `localizePath`).
4. An external link is the one other `href`: a string literal starting `https://`, or `{externalHref(<url>)}` from `src/lib/external-link.pure.ts` for a URL held in data, which throws on anything but `https:`. Its tag MUST carry `target="_blank"` and `rel="noopener noreferrer"`. A bare variable, `http:` and any other helper stay banned.

## Do's and Don'ts

### Do's

1. **DO** link with `localizePath(ROUTES.<route>, locale)`, keeping `src/lib/routes.ts` locale-neutral. (Decision 1)
2. **DO** derive a locale switch target as `localizePath(stripLocale(pathname), target)`. (Decision 1)
3. **DO** open an external link with `target="_blank"` and `rel="noopener noreferrer"`, and tell the reader it opens a new tab. (Decision 1)

### Don'ts

1. **DON'T** add an `/en` route or redirect, or emit `/en` in any URL. (Decision 1)
2. **DON'T** give an `href` any value other than `{localizePath(...)}`, an `https://` literal or `{externalHref(...)}` — no hand-written prefix such as `'/de' + path`, no `http:`, no other helper. (Decision 1, 📜 Rule: `href-via-localize-path`)

## Consequences

**Positive:**

1. **One canonical URL per page per locale:** the bare path is English, and prefixed paths map one-to-one onto the exported files.

**Negative:**

1. **External targets are unchecked:** the rule sees the scheme and the tag's `target` and `rel`, not whether a URL is live or trusted.
2. **Asymmetric route tree:** the default locale and the prefixed locales need separate route roots (`src/app/(en)/`, `src/app/[locale]/`) that must stay in step.

## Compliance and Enforcement

**Enforcer:** `FE-003-localization.rules.ts`, `error` tier, rule `href-via-localize-path`: scans every `src/**/*.tsx` file and fails any JSX `href` that is not `{localizePath(`, an `https://` literal or `{externalHref(`, and any external one whose tag lacks `target="_blank"` or `rel` with `noopener` and `noreferrer`. Manual review still checks that no `/en` route exists and that the logical path passed in is locale-neutral.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — static exports](https://nextjs.org/docs/app/guides/static-exports) — why no middleware runs.
