---
type: adr
id: FE-004
title: 'User Preference'
domain: frontend
rules: true
files: ['src/**/*.{ts,tsx}', 'src/config.yaml']
paths: ['src/**/*.{ts,tsx}', 'src/config.yaml']
description: 'Where client-side user preferences live: one localStorage key, named in src/config.yaml, holding one JSON object.'
---

# User Preference

## Context

Preferences such as theme and locale outlive a page load, and a static site can only keep them in the browser. Each one claiming its own storage key scatters state across keys nobody inventories, and lets one preference's writer clobber or misread another's.

The Context drawer's layout (beside or over the Slides) is a preference too: a reader sets it once, and a shared link must not impose it. It lived in component state as `'side' | 'overlay'` before moving into the preferences object under the names below, so a reader sees the same layout after a reload.

## Decision

### 1. One localStorage key holds every client-side preference (📜 Rule: `single-storage-key`)

1. Every client-side user preference MUST live in one localStorage key, as one JSON object with one field per preference (`{ theme, locale, drawerMode }`).
2. `drawerMode` MUST be `'beside' | 'over'`, defaulting to `'beside'` when absent or invalid: the Context drawer's layout ([FE-010](./FE-010-context-drawer.md) §7), a preference rather than application state ([FE-001](./FE-001-state-management.md) §1).
3. That key MUST be set once, as `localStorageKey` in `src/config.yaml`. `PREFS_KEY` in `src/lib/prefs.pure.ts` MUST equal it, and every `localStorage.getItem` and `localStorage.setItem` call MUST pass `PREFS_KEY` or that literal.
4. That key MUST be read and written only through `readPrefs` and `writePrefs` in `src/lib/prefs-storage.ts`, which merge a patch rather than overwrite; the pre-paint theme script built in `src/lib/theme.pure.ts` is the one read-only exception.

## Do's and Don'ts

### Do's

1. **DO** add a new preference as a field on `Prefs` in `src/lib/prefs.pure.ts`, validated in `parsePrefs`. (Decision 1)
2. **DO** persist a change with `writePrefs({ <field>: value })`. (Decision 1)

### Don'ts

1. **DON'T** create a second localStorage or sessionStorage key, or a cookie, for a preference. (Decision 1)
2. **DON'T** pass `getItem` or `setItem` any key other than `PREFS_KEY` or the `src/config.yaml` value, or change one without the other. (Decision 1, 📜 Rule: `single-storage-key`)
3. **DON'T** call `localStorage` outside `src/lib/prefs-storage.ts` and the theme init script. (Decision 1)
4. **DON'T** keep the drawer layout in component state alone or in the URL; read and write `drawerMode`. (Decision 1)

## Consequences

**Positive:**

1. **One inventory:** devtools shows every stored preference under one key, and a malformed value degrades to defaults in one place.
2. **A layout survives reloads:** the drawer opens beside or over the Slides as the reader last chose, and a shared link never imposes it.

**Negative:**

1. **A second key breaks the build:** the next legitimate localStorage use fails the rule until this record is amended — accepted, since no second use is foreseen.
2. **Libraries with their own storage are excluded:** packages such as `next-themes` that write their own key cannot be used as-is.

## Compliance and Enforcement

**Enforcer:** `FE-004-user-preference.rules.ts`, `error` tier, rule `single-storage-key`: reads `localStorageKey` from `src/config.yaml`, then fails any `getItem`/`setItem` call under `src/` that passes neither `PREFS_KEY` nor that literal, and any `PREFS_KEY` declaration with a different value. The config is a YAML file and the code does not import it, because importing YAML would need a new loader dependency (ARCH-001); the rule keeps the two in step instead. Manual review still checks that `localStorage` is called only in `src/lib/prefs-storage.ts` and the theme init script.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [FE-001 State Management](./FE-001-state-management.md), [FE-010 Context Drawer](./FE-010-context-drawer.md).
- [MDN — Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
