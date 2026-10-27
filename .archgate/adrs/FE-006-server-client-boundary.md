---
type: adr
id: FE-006
title: 'Server/Client Boundary'
domain: frontend
rules: false
files: ['src/**/*.{ts,tsx}', 'eslint.config.mjs', '.dependency-cruiser.cjs']
paths: ['src/**/*.{ts,tsx}', 'eslint.config.mjs', '.dependency-cruiser.cjs']
description: "Server Components by default; 'use client' only at leaves, never under src/app, and only in a file named *.client.tsx — the classifier that makes the client bundle glob-addressable; hooks and *.client.tsx leaves stay thin wiring shells."
---

# Server/Client Boundary

## Context

Under the App Router every component is a Server Component until a `'use client'` directive marks a module as a client entry point. Everything that module imports joins the client bundle. Where the directive sits therefore decides bundle size, which props must survive serialization, and — under `output: 'export'` — whether a component renders into the HTML at build time or only after hydration.

A glob cannot see inside a file. With the directive alone, "which files are client entry points" is answerable only by reading every file, so no ADR `files:` scope, ESLint block or dependency-cruiser rule can address the client bundle. Naming every client entry point `*.client.tsx` makes the boundary glob-addressable.

Hooks and `*.client.tsx` leaves sit on the browser boundary. When branching and arithmetic on data accumulate inside them, logic is trapped behind DOM APIs and React state where fast unit tests and mutation testing cannot reach it. Capping hooks and `*.client.tsx` files at `complexity: 3` and `max-depth: 1` keeps them thin wiring shells and pushes branching and math into `.pure.ts` modules.

Rejected alternatives: the directive alone (not addressable); a `client/` folder as the classifier (leaves sit beside the server components that render them; inside one Episode the Slide folder is the fence, §5); third-party `server-only` / `client-only` marker packages (address nothing by glob).

## Decision

### 1. Server Components are the default

1. A component MUST be a Server Component unless it needs state, effects, handlers or a browser API.
2. `'use client'` MUST sit at a leaf, rendered by a server parent. A layout, page or shell MUST NOT turn client for one child's interactivity.
3. No file under `src/app/**` MAY carry `'use client'`.

### 2. The `.client` classifier, checked in both directions

1. A file carrying a top-level `'use client'` directive MUST be named `*.client.tsx`.
2. A file named `*.client.tsx` MUST carry the directive as its first statement.
3. `.client` MUST be a `.tsx`-only suffix under `src/{page-assembly,episodes,events,explorable-explanations,pipeline,shared}/**`, never stacked with another classifier.
4. No file under `src/app/**` MAY carry a classifier, so no `.client` file sits there.

### 3. Edges across the boundary

1. A hook MUST be reached only from a `*.client.tsx` file, another hook, or a test; it carries no directive.
2. A `*.client.tsx` file MUST NOT import from `src/app/**`.
3. `src/shared/lib/prefs-storage.ts` (`window.localStorage`) MUST be reached only from a hook, a `*.client.tsx` file, or a test: at build time it returns `{}`, rendering wrong.

### 4. Props crossing the boundary

1. Every prop a Server Component passes to a `*.client.tsx` component MUST be serializable by React: primitives, plain objects and arrays of them, `Date`, `Map`, `Set`, promises, JSX — never a function, class instance or unregistered symbol. Pass a Translation file slice, not a callback.

### 5. Episode and `slide-shared` client files

1. An Episode's `*.client.tsx` files MUST live in a Slide folder, `…/slides/<slide>/` or `slide-pool/<slide>/`, nowhere else; the Slide's entry stays server.
2. A Slide's client widget MUST reach only its own folder, hooks and lib.
3. A `slide-shared` part's or Explorable explanation's client leaf MUST sit in its own folder and reach only it, hooks and lib (an explanation's also `ui/`); the entry stays server.

### 6. Hooks and client leaves are thin shells

1. A hook or `*.client.tsx` leaf MUST hold wiring only: browser APIs, React state, refs and effects, event handlers, and calls into `.pure.ts` functions. All branching and arithmetic on data MUST live in a `.pure.ts` module.
2. Every hook and `*.client.tsx` file MUST stay within `complexity: 3` and `max-depth: 1` (while the global budget remains `7` and `3`).
3. Pre-existing shells over budget sit in `src/shared/design-system/legacy-shells.json` at `7` / `3`; the list MUST only shrink, and any changed hook or `*.client.tsx` file MUST meet the shell rule and come off the list.

## Do's and Don'ts

### Do's

1. **DO** start every new component as a Server Component and add the directive only when a hook or handler forces it. (Decision 1)
2. **DO** push interactivity down: extract the interactive part into its own `*.client.tsx` leaf, as `site-header.tsx` renders `ThemeToggle`. (Decision 1)
3. **DO** name a client entry point `<subject>.client.tsx` and open it with `'use client';`. (Decision 2)
4. **DO** rename the file when the directive is added or removed — the suffix and the directive move together. (Decision 2)
5. **DO** keep hooks in `src/**/hooks/**` without the directive, imported from client leaves. (Decision 3)
6. **DO** reach `readPrefs` / `writePrefs` through a hook or a `*.client.tsx` leaf, as `use-theme.ts` and `locale-toggle.client.tsx` do. (Decision 3)
7. **DO** pass serializable data from server to client: strings, numbers, plain objects, Translation file slices. (Decision 4)
8. **DO** put an Episode's interactive visualisation in its Slide folder as `<name>.client.tsx`, its logic in a `.pure.ts` beside it. (Decision 5)
9. **DO** put an Explorable explanation's client leaf in its own folder; its server entry takes the Slide's Preset and words. (Decision 5)
10. **DO** extract branching and arithmetic from hooks and `*.client.tsx` leaves into a `.pure.ts` module — `fractionInto(page, box)` in `table-of-contents.pure.ts` — and remove a touched file from `legacy-shells.json`. (Decision 6)

### Don'ts

1. **DON'T** put `'use client'` on a page, layout or anything under `src/app/**`. (Decision 1)
2. **DON'T** write `'use client'` in a file without the `.client.tsx` suffix, or the suffix without the directive. (Decision 2)
3. **DON'T** name a `.ts` file `*.client.ts` or stack the suffix (`x.client.pure.tsx`). (Decision 2)
4. **DON'T** import a hook or `src/shared/lib/prefs-storage.ts` from a Server Component, or import `src/app/**` from a client leaf. (Decision 3)
5. **DON'T** pass a function, class instance or unregistered symbol as a prop to a `*.client.tsx` component. (Decision 4)
6. **DON'T** put `'use client'` in a Slide's server entry, a part or an Episode file. (Decision 5)
7. **DON'T** import the Slide master from a Slide's client widget. (Decision 5)
8. **DON'T** branch over data or compute domain math inside a hook or `*.client.tsx` component, or add a file to `src/shared/design-system/legacy-shells.json`. (Decision 6)

## Consequences

**Positive:**

1. **Glob-addressable client bundle:** `src/**/*.client.tsx` is the complete list of client entry points, so a later rule — no `.client` importing a build-time loader, a bundle budget over the `.client` glob — has something to address.
2. **Both directions held mechanically:** the suffix cannot lie about the directive, nor the directive hide behind an ordinary name.
3. **Static HTML stays complete:** server-rendered by default means a static export ships real markup, not a hydration shell.
4. **Visible at the call site:** an import of `@/shared/page-chrome/header/nav-link.client` tells a reader of a server file it crosses the boundary.

**Negative:**

1. **Rename churn:** adding or removing interactivity renames the file and every import of it.
2. **Two new dev dependencies:** `eslint-plugin-check-file` misses the dependency admission bar's stars signal (614 at adoption); admitted on downloads, contributors and recency because core ESLint cannot match a filename. `dependency-cruiser` clears all four.
3. **Transitive client code is unnamed:** a module without the suffix still joins the bundle when a `.client` leaf imports it; the suffix names entry points, not bundle membership.

**Risks:**

1. **Serializability is unchecked.** No static check sees what a server parent passes. **Mitigation:** review duty below; a function prop also fails `next build`, which CI runs on every pull request.
2. **dependency-cruiser reports success over a thin graph.** Without `tsPreCompilationDeps: true` it drops type-only edges yet the total rises, because the post-compilation graph injects `react/jsx-runtime` edges. **Mitigation:** the flag is set in `.dependency-cruiser.cjs`; read the dependency count, never the checkmark (measurements below).

## Compliance and Enforcement

**Enforcers per Discipline:**

- §2.1: ESLint core `no-restricted-syntax`, selector `Program > ExpressionStatement[directive='use client']`, over `src/**/*.{ts,tsx}` ignoring `src/**/*.client.tsx`.
- §2.2: ESLint core `no-restricted-syntax`, selector `Program:not(:has(> ExpressionStatement[directive='use client']))`, over `src/**/*.client.tsx`.
- §2.3, §2.4 and so §1.3: `check-file/filename-naming-convention` in `eslint.config.mjs` — `src/app/**/*.{ts,tsx}` is `KEBAB_CASE`, `src/{page-assembly,episodes,events,explorable-explanations,pipeline,shared}/**/*.tsx` is `+([a-z0-9-])?(.client)`, `src/**/*.ts` is `!(*.client)`. §1.3 needs no own check: an app file cannot carry the suffix (§2.4), and an unsuffixed file cannot carry the directive (§2.1).
- §5: ESLint forbids the directive in Episode files except a Slide folder's `*.client.tsx`; dependency rules limit a Slide widget's and a `slide-shared` client leaf's reach.
- §6: ESLint `complexity: 3` and `max-depth: 1` over hooks and `*.client.tsx`, with per-file overrides from `src/shared/design-system/legacy-shells.json`; a fast-suite boundaries test enforces that every listed entry exists and still exceeds the shell cap.
- §3: `.dependency-cruiser.cjs` rules `hooks-reached-only-from-client`, `client-never-imports-app` and `prefs-storage-reached-only-from-client`, `error` severity, run by `npm run lint:boundaries` (`depcruise src skills tools`) inside `npm run lint`, which `npm run verify` and CI run.

**Known reach gap.** §3.3 names one module by path, not by glob: no classifier marks "touches a browser API", so a second browser-API module under `src/shared/lib/**` is unguarded until the rule is widened by hand.

**Manual review duties** (never linted): props from a server parent to a `.client` component are serializable (§4); the directive sits at the smallest leaf, not a wrapper widened for convenience (§1.2); branch-free arithmetic in hooks and `*.client.tsx` leaves is extracted to `.pure.ts` and `legacy-shells.json` only shrinks (§6).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — the `'use client'` boundary, leaf placement, serializable props.
- [React — `'use client'`](https://react.dev/reference/rsc/use-client) — the serializable prop types §4 lists.
- [eslint-plugin-check-file](https://github.com/dukeluo/eslint-plugin-check-file) and [ESLint — `no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax).
- [dependency-cruiser — rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) and [`tsPreCompilationDeps`](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#tspre-compilation-deps).
