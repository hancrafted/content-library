---
type: adr
id: FE-001
title: 'State Management'
domain: frontend
rules: true
files: ['src/**/*.{ts,tsx}', 'src/shared/config.yaml', 'eslint.config.mjs']
paths: ['src/**/*.{ts,tsx}', 'src/shared/config.yaml', 'eslint.config.mjs']
description: 'Where state lives: application state in the URL, user preference in one localStorage key, hands-on progress in a second, the rest in memory. One module writes history, one writes storage.'
---

# State Management

## Context

Table of contents and Context drawer each tracked "current Slide" with own observer. Mid-scroll they disagreed; a click made the drawer flick through every Slide in between. Preferences had the same drift risk: one storage key per feature, nobody inventories, writers clobber each other.

Cause: no rule for where state lives or who writes it. Fix: class every piece of state by **what it must survive**.

| Kind              | Survives                                                 | Lives in                  | Examples                                          |
| ----------------- | -------------------------------------------------------- | ------------------------- | ------------------------------------------------- |
| Application       | reload, bookmark, shared link                            | URL                       | locale, active Slide — `/de/episodes/x#slide-4`   |
| Preference        | reload on this device; never imposed by link             | one localStorage key      | theme, drawer beside/over                         |
| Hands-on progress | reload, a visit from another Episode; exported as a file | a second localStorage key | a Workflow run's pasted results, teaching mode    |
| Transient         | nothing                                                  | memory                    | drawer open, selected tab, menu open, scroll zone |

**Reload test** admits transient state: reload loses nothing reader would miss and can't get back in one action.

**Why one URL writer.** Browsers rate-limit history writes (Safari throws past ~100 per 10 s); scrolling reports a new Slide many times a second. Only a single owner can throttle. Click is _intent_ (show now), scroll is _report_ (passes Slides on the way) — a single owner lets intent win.

**Why one key per kind.** One inventory in devtools; malformed data degrades to defaults in one place. Progress is a viewer's work, not a setting: it grows with pasted text, so a corrupt or oversized entry must not reset the theme. Rejected for it: a field of the prefs object (one bad paste degrades every preference); a key per hands-on (no inventory, the bug above).

**Rejected:** state library (can't own the hash without replacing the router); per-feature stores (the bug above); query params (static export sees them only after hydration).

## Decision

### 1. Class state first

1. New state MUST be classed application, preference, hands-on progress or transient before it is written.
2. Application state MUST live in the URL: path, locale segment, hash. No query-param state.
3. Transient state MAY live in memory only if it passes the reload test. Derived values computed in render, never stored.

### 2. URL: one writer, one reader

1. Only `src/shared/lib/url-state.ts` MAY write browser history; one instance per page, disposed on leave.
2. Writes MUST be throttled. A click shows its Slide at once and wins over scroll reports until the scroll ends.
3. Components MUST read the active Slide through `useActiveSlide()`, never mirror it into own state.

### 3. Storage: one key per kind (📜 Rule: `single-storage-key`)

1. Every preference MUST be a field of one JSON object under the prefs key; every hands-on's progress MUST be one entry of one JSON object under the progress key. Both are named once in `src/shared/config.yaml`; no third key.
2. Storage MUST be read and written only through the prefs module (`src/shared/lib/prefs-storage.ts`); writes merge, never overwrite. Pre-paint theme script: read-only exception.
3. A progress entry MUST be keyed by hands-on, never by Episode or Slide — `human-in-the-loop/project-plan` — so every Episode showing it shares one run.
4. A progress entry MUST carry a hash of its hands-on's source. A stored entry or an imported file whose hash differs MUST NOT load silently: a stored one is offered for download or discard, an imported one is refused.

## Do's and Don'ts

### Do's

1. **DO** ask "would a reload lose something the reader misses?" before `useState` for anything visible. (Decision 1)
2. **DO** move the reader with the page service's `navigateTo(id)`; read with `useActiveSlide()`. (Decision 2)
3. **DO** add a preference as a new field — `{ theme, locale, drawerMode }` + one. (Decision 3)
4. **DO** add a hands-on's progress as one entry under the progress key — `{ "human-in-the-loop/project-plan": { hash, … } }`. (Decision 3)

### Don'ts

1. **DON'T** put transient state in the URL — `#drawer=open` opens a stranger's drawer. (Decision 1)
2. **DON'T** add a state library or a per-feature store. (Decision 1)
3. **DON'T** write history outside the URL module: no `pushState`/`replaceState`, `location.hash =`, `router.push('#…')`. (Decision 2)
4. **DON'T** add a third storage key, sessionStorage or cookie, or store progress in the prefs object. (Decision 3, 📜 Rule: `single-storage-key`)
5. **DON'T** key progress by Episode, or apply an entry whose hash no longer matches. (Decision 3)

## Consequences

**Positive:**

1. **One "current":** every consumer subscribes to one value; Table of contents and drawer can't disagree.
2. **Shareable place:** scrolling updates the hash; a copied link reopens where reader was.
3. **One inventory:** every stored preference under one key, every hands-on run under another.
4. **Work survives:** a run resumes after reload and in any Episode showing the hands-on.

**Negative:**

1. **URL lags** reading line by the throttle; subscribers don't.
2. **Back leaves the Episode:** clicks replace, not push, history entries.
3. **No self-storing libraries:** e.g. `next-themes` writes own key — unusable as-is.
4. **Reload test is judgement:** no tool decides what a reader "would miss".
5. **Any source edit orphans progress:** a typo fix in a hands-on's source invalidates every saved run; the viewer keeps only a download.

**Risks:**

1. **Fast fling hits Safari's limit** alongside router writes. **Mitigation:** throttle leaves headroom; a caught error keeps the page working.
2. **Pasted text fills the storage quota.** **Mitigation:** a failed write is caught and the viewer is told to download their progress.

## Compliance and Enforcement

1. **Rule** `single-storage-key` (`FE-001-state-management.rules.ts`, error): every `getItem`/`setItem` under `src/` passes one of the two configured keys; `PREFS_KEY` and `PROGRESS_KEY` each equal `src/shared/config.yaml`.
2. **Lint** (`eslint.config.mjs`): history writes refused outside `src/shared/lib/url-state.ts`.
3. **Tests** (`npm run verify`): URL service driven against a fake window — intent, throttle, dispose, isolation.

**Manual review duties:** new state classed per §1; no `location.hash` or `router.push('#…')` writes; storage touched only via the prefs module; progress keyed by hands-on and hash-checked on load and import (§3.3, §3.4).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [MDN `pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState), [MDN `localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
