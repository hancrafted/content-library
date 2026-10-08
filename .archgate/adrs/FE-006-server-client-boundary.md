---
type: adr
id: FE-006
title: 'Server/Client Boundary'
domain: frontend
rules: false
files: ['src/**/*.{ts,tsx}', 'eslint.config.mjs', '.dependency-cruiser.cjs']
paths: ['src/**/*.{ts,tsx}', 'eslint.config.mjs', '.dependency-cruiser.cjs']
description: "Server Components by default; 'use client' only at leaves, never under src/app, and only in a file named *.client.tsx — the classifier that makes the client bundle glob-addressable."
---

# Server/Client Boundary

## Context

Under the App Router every component is a Server Component until a `'use client'` directive marks a module as a client entry point. Everything that module imports joins the client bundle. Where the directive sits therefore decides bundle size, which props must survive serialization, and — under `output: 'export'` ([FE-005](./FE-005-static-export-contract.md)) — whether a component renders into the HTML at build time or only after hydration.

A glob cannot see inside a file. With the directive alone, "which files are client entry points" is answerable only by reading every file, so no ADR `files:` scope, ESLint block or dependency-cruiser rule can address the client bundle. A filename suffix fixes that: it makes the boundary glob-addressable, the property the classifier suffixes of the reference ADRs (markdown-harness `ARCH-004 Folders and Files`) exist to provide.

**Deviation from the reference ADRs.** Their classifier axis is determinism — `.pure` / `.impure` / `.types`. In a React tree the architecturally consequential axis is server versus client. This is the reference ADR's own stated risk — "the suffix set is closed on no measured evidence" — arriving in a different stack. The two axes do not collide, because `src/lib/**` holds no components — but `src/lib/**` is only partly classified. `locale.pure.ts`, `theme.pure.ts` and `prefs.pure.ts` follow the determinism axis; `messages.ts`, `routes.ts`, `prefs-storage.ts` and `utils.ts` carry no classifier, and no ADR here governs them. `utils.ts` is a name the reference `ARCH-004` Decision 4 bans outright; it arrived with the shadcn scaffold, so it is inherited, not chosen. This record classifies and renames nothing under `src/lib/**`.

Repo state at adoption: four files carried the directive. Three are leaf components, renamed here — `src/components/locale-toggle.client.tsx`, `nav-link.client.tsx`, `theme-toggle.client.tsx`. The fourth, `src/hooks/use-theme.ts`, dropped its directive: a hook is not a boundary — it is imported only by client leaves and joins the bundle through them; the import-graph rule below holds that instead.

Rejected alternatives: the directive alone (not addressable); a `client/` folder (position cannot carry it — leaves sit beside the server components that render them); the third-party `server-only` / `client-only` marker packages (they fail the build on a wrong import but address nothing by glob, and pass [ARCH-001](./ARCH-001-dependency-admission-bar.md) for no gain today).

## Decision

### 1. Server Components are the default

1. A component MUST be a Server Component unless it needs state, effects, event handlers or a browser API.
2. `'use client'` MUST sit at a leaf: the smallest component that needs the browser, rendered by a server parent. A layout, page or shell MUST NOT become a client component to give one child interactivity.
3. No file under `src/app/**` MAY carry `'use client'`.

### 2. The `.client` classifier, checked in both directions

1. A file carrying a top-level `'use client'` directive MUST be named `*.client.tsx`.
2. A file named `*.client.tsx` MUST carry the directive as its first statement.
3. `.client` MUST be a `.tsx` suffix only, under `src/components/**` or `src/hooks/**`, and MUST NOT stack with another classifier.
4. No file under `src/app/**` MAY carry a classifier, so no `.client` file sits there.

### 3. Edges across the boundary

1. `src/hooks/**` MUST be reached only from a `*.client.tsx` file, another hook, or a test; a hook does not carry the directive.
2. A `*.client.tsx` file MUST NOT import from `src/app/**`.
3. `src/lib/prefs-storage.ts`, which calls `window.localStorage`, MUST be reached only from a hook, a `*.client.tsx` file, or a test. A Server Component calling `readPrefs` at build time gets `{}` and renders silently wrong — no throw, no failed build.

### 4. Props crossing the boundary

1. Every prop a Server Component passes to a `*.client.tsx` component MUST be serializable by React: primitives, plain objects and arrays of them, `Date`, `Map`, `Set`, promises, JSX — never a function, class instance or unregistered symbol. Pass a message bundle slice (as `ThemeToggle` takes `labels`), not a callback.

## Do's and Don'ts

### Do's

1. **DO** start every new component as a Server Component and add the directive only when a hook or handler forces it. (Decision 1)
2. **DO** push interactivity down: extract the interactive part into its own `*.client.tsx` leaf, as `site-header.tsx` renders `ThemeToggle`. (Decision 1)
3. **DO** name a client entry point `<subject>.client.tsx` and open it with `'use client';`. (Decision 2)
4. **DO** rename the file when the directive is added or removed — the suffix and the directive move together. (Decision 2)
5. **DO** keep hooks in `src/hooks/**` without the directive, imported from client leaves. (Decision 3)
6. **DO** reach `readPrefs` / `writePrefs` through a hook or a `*.client.tsx` leaf, as `use-theme.ts` and `locale-toggle.client.tsx` do. (Decision 3)
7. **DO** pass serializable data from server to client: strings, numbers, plain objects, message slices. (Decision 4)

### Don'ts

1. **DON'T** put `'use client'` on a page, layout or anything under `src/app/**`. (Decision 1)
2. **DON'T** write `'use client'` in a file without the `.client.tsx` suffix, or the suffix without the directive. (Decision 2)
3. **DON'T** name a `.ts` file `*.client.ts` or stack the suffix (`x.client.pure.tsx`). (Decision 2)
4. **DON'T** import a hook or `src/lib/prefs-storage.ts` from a Server Component, or import `src/app/**` from a client leaf. (Decision 3)
5. **DON'T** pass a function, class instance or unregistered symbol as a prop to a `*.client.tsx` component. (Decision 4)

## Consequences

**Positive:**

1. **Glob-addressable client bundle:** `src/**/*.client.tsx` is the complete list of client entry points, so a later rule — no `.client` importing a build-time loader, a bundle budget over the `.client` glob — has something to address.
2. **Both directions held mechanically:** the suffix cannot lie about the directive, nor the directive hide behind an ordinary name.
3. **Static HTML stays complete:** server-rendered by default means a static export ships real markup, not a hydration shell.
4. **Visible at the call site:** an import of `@/components/nav-link.client` tells a reader of a server file it crosses the boundary.

**Negative:**

1. **Rename churn:** adding or removing interactivity renames the file and every import of it.
2. **Two new dev dependencies:** `eslint-plugin-check-file` misses ARCH-001's stars signal (614 at adoption); admitted on downloads, contributors and recency because core ESLint cannot match a filename. `dependency-cruiser` clears all four.
3. **Transitive client code is unnamed:** a module without the suffix still joins the bundle when a `.client` leaf imports it; the suffix names entry points, not bundle membership.

**Risks:**

1. **Serializability is unchecked.** No static check sees what a server parent passes. **Mitigation:** review duty below; a function prop also fails `next build`, which CI runs on every pull request.
2. **dependency-cruiser reports success over a thin graph.** Without `tsPreCompilationDeps: true` it drops type-only edges yet the total rises, because the post-compilation graph injects `react/jsx-runtime` edges. **Mitigation:** the flag is set in `.dependency-cruiser.cjs`; read the dependency count, never the checkmark (measurements below).

## Compliance and Enforcement

**Enforcers per Discipline:**

- §2.1: ESLint core `no-restricted-syntax`, selector `Program > ExpressionStatement[directive='use client']`, over `src/**/*.{ts,tsx}` ignoring `src/**/*.client.tsx`.
- §2.2: ESLint core `no-restricted-syntax`, selector `Program:not(:has(> ExpressionStatement[directive='use client']))`, over `src/**/*.client.tsx`.
- §2.3, §2.4 and so §1.3: `check-file/filename-naming-convention` in `eslint.config.mjs` — `src/app/**/*.{ts,tsx}` is `KEBAB_CASE`, `src/{components,hooks}/**/*.tsx` is `+([a-z0-9-])?(.client)`, `src/**/*.ts` is `!(*.client)`. `check-file` matches the basename with the final extension stripped. §1.3 needs no own check: an app file cannot carry the suffix (§2.4), and an unsuffixed file cannot carry the directive (§2.1).
- §3: `.dependency-cruiser.cjs` rules `hooks-reached-only-from-client`, `client-never-imports-app` and `prefs-storage-reached-only-from-client`, `error` severity, run by `npm run lint:boundaries` (`depcruise src`) inside `npm run lint`, which `npm run verify` and CI run.

**Measured on introduction** (probe files under `src/`, removed after): a directive in `probe-a.tsx`, a directiveless `probe-b.client.tsx`, a `src/app/probe/probe-c.client.tsx` and a `src/hooks/probe-d.client.ts` gave 5 errors, one per breach plus §2.1 on `probe-d`; a correct `probe-e.client.tsx` gave 0. A server file importing `@/hooks/use-theme` and a `.client` file importing `@/app/[locale]/params` each fired its depcruise rule. Repo: 0 errors. dependency-cruiser with `tsPreCompilationDeps: true`: **77 dependencies cruised, 54 local, 12 type-only**; with `false`: 80 cruised, 49 local, 0 type-only, 15 injected `react/jsx-runtime`. A falling local count with a rising total is the failure signature.

**Measured for §3.3:** a probe Server Component `src/components/probe-brand.tsx` importing `@/lib/prefs-storage` fired `prefs-storage-reached-only-from-client` (1 error, 78 dependencies cruised); removed, the repo is clean at 77 cruised, 54 local, 12 type-only. The 2 live edges into the module come from `use-theme.ts` and `locale-toggle.client.tsx`.

**Known reach gap.** §3.3 names one module by path, not by glob: no classifier marks "touches a browser API", so the addressability argument this record makes for `.client` arrives again one directory over. A second browser-API module under `src/lib/**` is unguarded until the rule is widened by hand. A classifier to close it is a separate decision.

**Manual review duties** (never linted): props from a server parent to a `.client` component are serializable (§4); the directive sits at the smallest leaf, not a wrapper widened for convenience (§1.2).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — the `'use client'` boundary, leaf placement, serializable props.
- [React — `'use client'`](https://react.dev/reference/rsc/use-client) — the serializable prop types §4 lists.
- [eslint-plugin-check-file](https://github.com/dukeluo/eslint-plugin-check-file) and [ESLint — `no-restricted-syntax`](https://eslint.org/docs/latest/rules/no-restricted-syntax).
- [dependency-cruiser — rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) and [`tsPreCompilationDeps`](https://github.com/sverweij/dependency-cruiser/blob/main/doc/options-reference.md#tspre-compilation-deps).
- [FE-005 Static Export Contract](./FE-005-static-export-contract.md) — why build-time rendering matters here.
- [ARCH-001 Dependency Admission Bar](./ARCH-001-dependency-admission-bar.md) — the screen both new dependencies passed.
- [`docs/research/adr-candidates.md`](../../docs/research/adr-candidates.md) §1 — the survey this record was chosen from.
