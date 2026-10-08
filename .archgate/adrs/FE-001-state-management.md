---
type: adr
id: FE-001
title: 'State Management'
domain: frontend
rules: false
files: ['src/**/*.{ts,tsx}', 'eslint.config.mjs']
paths: ['src/**/*.{ts,tsx}', 'eslint.config.mjs']
description: 'Three kinds of state and where each lives — application state in the URL, user preference in FE-004 storage, transient state in memory under a reload test — plus the one URL-state service that alone writes browser history.'
---

# State Management

## Context

**Status: proposal** ([#11](https://github.com/hancrafted/content-library/issues/11)). FE-008 is the last approved record.

An Episode page has two companions that show "the current Slide": the Table of contents and the Context drawer. Each worked it out alone, with its own `IntersectionObserver` and its own click override. With the drawer open, a Table of contents click several Slides down made the drawer flick through every Slide in between, because only the Table of contents knew a click was in flight. Nothing said where live state lives or who may write it, so each feature grew its own channel, and the next one would grow a third.

**Three kinds of state.** The split below is our working vocabulary, not a standard: no first-party source names it ([research](../../docs/research/url-as-application-state.md) §1). It answers one question per piece of state: _where does it survive?_

- **Application state** — what the reader is looking at: route, locale (FE-003), active Slide. It survives a reload, a bookmark and a shared link, so it lives in the URL.
- **User preference** — how the reader likes the site: theme, locale choice, Context drawer layout. It survives a reload on this device and is never forced on someone else by a link, so it lives in the FE-004 key.
- **Transient and derived state** — everything else: drawer open, selected tab, zones, menu open. It lives in memory, admitted by one test: **a reload loses nothing the reader would miss and cannot recover in one action.**

**Why the hash, behind one service.** Verified facts (research §2): no Next.js hook exposes the hash, so it is read from `window.location.hash`; `pushState`/`replaceState` never fire `hashchange`, so a store must notify its own subscribers after it writes; prerendered HTML cannot know the hash; WebKit throws `SecurityError` after 100 history writes per 10 s on the main frame, `pushState` and `replaceState` sharing the counter; Blink drops writes past its limit silently. Scrolling reports a new Slide many times a second, so writes must be throttled and owned by one module. 150 ms caps us at about 67 writes per 10 s; the research infers, without measuring, that Next.js's own router writes share the quota, so the gap is kept as headroom.

**Intent versus report.** A click is intent: the reader chose a Slide, and every consumer should show it now. The observer is a report: it says what the reading line crosses, including every Slide a smooth scroll passes. Two calls make the suppression rule explicit. The fallback timeout exists because a click on a Slide already in view scrolls nothing and fires no `scrollend`. Clicks use `replaceState` for now; switching them to `pushState` is a one-line change inside the service.

**Rejected:** a state library (none manages the hash without replacing the router; ARCH-001 not invoked); per-feature stores (the bug above); query parameters (in a static export `useSearchParams` needs a Suspense boundary and the value exists only after hydration).

**Elsewhere:** the Slide observer and zones, [FE-009](./FE-009-slide-frame.md); the preference key, [FE-004](./FE-004-user-preference.md); page consumers, [FE-002](./FE-002-episode-page.md) §6.

## Decision

### 1. Three kinds of state

1. Application state MUST live in the URL: path, locale segment (FE-003) and hash; no query-parameter state without amending this record.
2. User preference MUST live in the FE-004 preferences object.
3. Transient and derived state MAY live in memory only if a reload loses nothing the reader would miss and cannot recover in one action; derived values MUST be computed during render, not stored.
4. A new piece of state MUST be classed as one of the three before it is written.

### 2. One URL-state service

1. `src/lib/url-state.ts` MUST be the only module that calls `history.pushState` or `history.replaceState`; it imports no React (FE-007 §3).
2. It MUST be built by a factory over a window (`createUrlState(window)`), so tests create isolated instances; one client singleton serves the app.
3. It MUST expose: read the active Slide (from the hash, `null` when empty); `subscribe(listener)`; `navigateTo(id)`; `reportReading(id)`.
4. `subscribe` MUST re-read the hash on `popstate`, so Back and Forward notify every subscriber.
5. Any component MAY call `navigateTo`; only the Slide observer (FE-009) MAY call `reportReading`.

### 3. Intent and report

1. `navigateTo(id)` MUST notify subscribers immediately, write the hash, and suppress reports until `scrollend` or a fallback timeout, whichever comes first.
2. `reportReading(id)` MUST be ignored while a navigation is in flight; otherwise it notifies subscribers immediately when the id changes.
3. The service MUST write history at most once per 150 ms, always flushing the trailing value.
4. A write MUST pass the current `history.state` through and MUST catch a `SecurityError`, keeping subscribers correct while the URL lags.
5. Both calls use `replaceState` for now.

### 4. One hook

1. Components MUST read the active Slide only through `useActiveSlide()` in `src/hooks/use-url-state.ts`, built on `useSyncExternalStore` with a server snapshot of `null`.

## Do's and Don'ts

### Do's

1. **DO** ask "does a reload lose something the reader would miss?" before adding `useState` for anything the reader sees. (Decision 1)
2. **DO** put a new preference on `Prefs` per FE-004, never in the URL or memory. (Decision 1)
3. **DO** call `urlState.navigateTo(id)` from a click that moves the reader. (Decision 2, Decision 3)
4. **DO** read the active Slide with `useActiveSlide()`. (Decision 4)
5. **DO** test the service through `createUrlState` with a fake window and fake timers. (Decision 2)

### Don'ts

1. **DON'T** call `history.pushState`/`replaceState` outside `src/lib/url-state.ts`. (Decision 2)
2. **DON'T** write `location.hash` or call `router.push('#…')` to move between Slides. (Decision 2)
3. **DON'T** mirror the hash into `useState` or a context. (Decision 1, Decision 4)
4. **DON'T** put drawer open state, tab, zones or any other transient state in the URL. (Decision 1)
5. **DON'T** add a state-management library or a per-feature store. (Decision 1, Decision 2)

## Consequences

**Positive:**

1. **One answer to "what is current":** every consumer subscribes to the same value, so the Table of contents and Context drawer cannot disagree.
2. **Shareable place:** manual scrolling updates the hash, so a copied URL reopens the reader where they were.
3. **Safari-safe:** the throttle and the `SecurityError` catch keep fast flings below WebKit's limit instead of throwing.
4. **Testable without a browser:** the factory runs against a fake window in the fast suite (ARCH-003).
5. **A reviewable test:** any new state is judged by one sentence, not taste.

**Negative:**

1. **The URL lags by up to 150 ms** behind the reading line; subscribers do not.
2. **Clicks do not add history entries** while `replaceState` is used; Back leaves the Episode rather than the previous Slide.
3. **The memory test is judgement:** no tool decides whether a reader "would miss" something.

**Risks:**

1. **A fast fling still hits the limit** together with router writes. **Mitigation:** the 150 ms cap leaves about a third of WebKit's budget; the catch keeps the page working; a Safari fling is a browser-verification step.
2. **A navigation never ends** (no `scrollend`, timeout misjudged) and reports stay suppressed. **Mitigation:** the fallback timeout always resumes reports; the factory test covers both paths.

## Compliance and Enforcement

**Enforcers, earliest first:**

1. **Types** (`tsc`): `useActiveSlide()` returns `string | null`; the service is the only export that writes.
2. **Fast** (`npm run verify`): the service's test beside `src/lib/url-state.ts` drives a fake window: intent notifies at once; reports suppressed in flight; resume on `scrollend` and on timeout; at most one write per 150 ms with trailing flush; `popstate` notifies; the hash is read on creation.
3. **Lint** (`eslint.config.mjs`, added in [#13](https://github.com/hancrafted/content-library/issues/13)): `no-restricted-properties` refuses `history.pushState`/`history.replaceState` under `src/**` outside `src/lib/url-state.ts`, plus a `no-restricted-syntax` selector for the `window.history.*` and `globalThis.history.*` forms, which `object: 'history'` does not match (probed: 1 of 3 forms fired); `no-restricted-syntax` refuses `NewExpression[callee.name='IntersectionObserver']` outside the Slide observer (FE-009). Flat config replaces a rule's options per block, so the observer selector MUST be appended to every existing `no-restricted-syntax` list (FE-006's two blocks and FE-002's Episode block), not set in a new block that overrides them.

**Measured** on `main` (4c412c3), by running ESLint over `src` with both rules passed on the command line: `no-restricted-properties` 1 hit (`src/components/table-of-contents/toc-panel.tsx:46`, `history.replaceState`); `no-restricted-syntax` 2 hits (`src/hooks/use-reading-line-id.ts:15`, `src/hooks/use-table-of-contents.ts:14`). Target after #13: 0 and 0, with one probe file per rule shown to fire.

**Manual review duties:** every new piece of state is classed by §1 and passes the memory test; no transient state in the URL.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`docs/research/url-as-application-state.md`](../../docs/research/url-as-application-state.md) — every external fact above, with sources.
- [FE-002 Episode Page](./FE-002-episode-page.md), [FE-003 Localization](./FE-003-localization.md), [FE-004 User Preference](./FE-004-user-preference.md), [FE-007 Module Layering](./FE-007-module-layering.md), [FE-009 Slide Frame](./FE-009-slide-frame.md), [ARCH-001](./ARCH-001-dependency-admission-bar.md), [ARCH-003 Testing](./ARCH-003-testing.md).
- [React `useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), [MDN `pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState), [WebKit `History.cpp`](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/page/History.cpp).
