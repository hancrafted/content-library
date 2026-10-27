---
type: adr
id: FE-014
title: 'Thin Shells'
domain: frontend
rules: false
# prettier-ignore
files: ['src/{shared,episodes,pipeline}/hooks/**/*.ts', 'src/explorable-explanations/*/use-*.ts', 'src/**/*.client.tsx']
# prettier-ignore
paths: ['src/{shared,episodes,pipeline}/hooks/**/*.ts', 'src/explorable-explanations/*/use-*.ts', 'src/**/*.client.tsx']
description: 'Hooks and *.client.tsx components are thin wiring shells (complexity <= 3, max-depth <= 1); branching and arithmetic on data live in a .pure.ts, browser behaviour is verified in the Playwright browser lane, and legacy shells sit on a list that only shrinks.'
---

# Thin Shells

## Context

Hooks (`src/{shared,episodes,pipeline}/hooks/**`, `src/explorable-explanations/*/use-*.ts`) and client leaves (`src/**/*.client.tsx`) sit on the browser boundary. When branching and arithmetic on data accumulate inside a hook or client component, logic is trapped behind DOM APIs, React state, effects and GSAP timelines:

1. **Unreachable by fast tests and mutation testing:** fast-suite unit tests and mutation testing target `.pure.ts` modules taking plain values. Logic embedded in `useEffect` or JSX event handlers cannot be exercised without a browser or a mock DOM.
2. **Too slow to cover in the browser lane:** driving every branch or boundary condition through a full static export (`out/`) in Playwright costs seconds per case instead of milliseconds.
3. **Global complexity caps are too wide for shells:** the repo-wide `complexity: 7` and `max-depth: 3` budget allows six branches inside a single hook before lint objects, so agents inline calculations by default.

Options considered:

- **`jsdom` or `happy-dom` component tests:** rejected — simulated DOMs fake layout, scroll and animation timing, encouraging mocks and diverging from real browser behaviour.
- **Full-page Playwright tests for every branch:** rejected — the browser lane exists for user-corrected interactive behaviours against `out/`, not combinatorial branching or arithmetic.
- **Review-only discipline at the global `7` / `3` budget:** rejected — review drifts without a mechanical cap on hooks and `*.client.tsx` files.
- **Thin shells capped by lint (`complexity: 3`, `max-depth: 1`) plus `.pure.ts` extraction (chosen):** hooks and client leaves hold wiring only; branching and arithmetic move into `.pure.ts` modules tested in the fast suite, and existing over-budget shells sit on a shrink-only override list.

## Decision

### 1. Hooks and client components are thin shells

1. A hook (`src/{shared,episodes,pipeline}/hooks/**/*.ts`, `src/explorable-explanations/*/use-*.ts`) or client component (`src/**/*.client.tsx`) MUST hold wiring only: browser APIs, React state, refs and effects, event handlers, and calls into `.pure.ts` functions.
2. All branching and arithmetic on data MUST live in a `.pure.ts` module taking plain inputs and returning plain outputs, tested by a sibling `.pure.test.ts` in the fast suite (`ARCH-003-testing`).
3. Every shell file MUST stay within `complexity: 3` and `max-depth: 1` (while the global budget remains `7` and `3`).

### 2. Browser lane and GSAP motion

1. End-to-end interactive behaviour that only a real browser can prove is verified in the Playwright browser lane (`*.browser.test.ts` against `out/`), governed by `ARCH-003-testing` and `design-ADR-0014` (`docs/adr/0014-browser-lane-runs-on-playwright.md`).
2. Animating elements in Explorable explanations MUST report `data-motion="running|settled"` so browser tests wait on `data-motion="settled"`, never on fixed timeouts (`design-ADR-0014`).
3. `npm run inspect-page` (`visual-check`) is development feedback for layout and visuals, never a test.

### 3. Legacy ratchet

1. Existing hooks and `*.client.tsx` files that predate the shell cap are listed in `src/shared/design-system/legacy-shells.json` under the previous budget (`complexity: 7`, `max-depth: 3`).
2. Rollout is a ratchet: whenever a hook or client component is changed, it MUST meet the shell rule (`complexity <= 3`, `max-depth <= 1`, logic extracted to `.pure.ts`) and be removed from `src/shared/design-system/legacy-shells.json`.
3. `src/shared/design-system/legacy-shells.json` MUST only shrink: no new file MAY be added, and no entry MAY remain once the file passes the shell budget.

## Do's and Don'ts

### Do's

1. **DO** extract branching and arithmetic from hooks and `*.client.tsx` leaves into a `.pure.ts` module — `fractionInto(scrollY, innerHeight, scrollHeight, box)` in `table-of-contents.pure.ts`, called from `use-table-of-contents.ts`. (Decision 1)
2. **DO** keep hooks and `*.client.tsx` files to DOM reads, React state/effects and calls into `.pure.ts` within `complexity: 3` and `max-depth: 1`. (Decision 1)
3. **DO** test extracted `.pure.ts` logic in a sibling `.pure.test.ts` with `success cases`, `failure cases` and `edge cases`. (Decision 1)
4. **DO** wait on `data-motion="settled"` and retrying assertions in `*.browser.test.ts`. (Decision 2)
5. **DO** extract logic and delete the `src/shared/design-system/legacy-shells.json` entry whenever touching a listed shell. (Decision 3)

### Don'ts

1. **DON'T** branch over data or compute domain math inside a hook or `*.client.tsx` component — even branch-free arithmetic (`(innerHeight * READING_LINE - box.top) / box.height`) belongs in `.pure.ts`. (Decision 1)
2. **DON'T** add a file to `src/shared/design-system/legacy-shells.json` or leave an entry whose file now passes `complexity: 3` and `max-depth: 1`. (Decision 3)
3. **DON'T** treat `npm run inspect-page` as a test, or sleep in a browser test instead of waiting on `data-motion="settled"`. (Decision 2)

## Consequences

**Positive:**

1. **Fast-suite and mutation coverage:** extracted `.pure.ts` logic runs in milliseconds in the fast suite and is hardened by mutation testing without launching a browser.
2. **Mechanical shell boundary:** ESLint rejects new branching or nesting in hooks and `*.client.tsx` leaves immediately.
3. **Shrinking legacy debt:** the fast-suite boundaries test fails whenever a listed file drops under the shell cap without being removed from `legacy-shells.json`.

**Negative:**

1. **Extra module hop:** small calculations move out of the hook or component into a `.pure.ts` function with its own `.pure.test.ts`.
2. **Gradual migration:** legacy shells stay at `7` / `3` until touched.

**Risks:**

1. **Branch-free arithmetic escapes the lint cap.** Straight-line math (`(a - b) / c`) adds no cyclomatic complexity and passes `complexity: 3`. **Mitigation:** code review checks changed hooks and `*.client.tsx` files for inline arithmetic and requires extraction to `.pure.ts`.
2. **Legacy list edits add new files.** **Mitigation:** code review rejects any addition to `src/shared/design-system/legacy-shells.json`, and the boundaries test rejects any entry that already passes the shell cap.

## Compliance and Enforcement

1. **Lint** (ESLint, error): `complexity: 3` and `max-depth: 1` over `src/{shared,episodes,pipeline}/hooks/**/*.ts`, `src/explorable-explanations/*/use-*.ts` (excluding `*.pure.ts` and `*.test.ts`) and `src/**/*.client.tsx`, with per-file overrides from `src/shared/design-system/legacy-shells.json` at `complexity: 7` and `max-depth: 3` (§1.3, §3.1).
2. **Tests** (fast-suite boundaries test): verifies that a thin shell passes, a branching shell fails, a listed offender passes at the old budget, and every entry in `src/shared/design-system/legacy-shells.json` exists and still exceeds the shell budget (§1.3, §3.2, §3.3).

**Manual review duties:** arithmetic that does not branch escapes `complexity: 3`, so review checks changed hooks and `*.client.tsx` files for inline math (§1.2); a changed hook or client component meets the shell rule and comes off `src/shared/design-system/legacy-shells.json`, and no new entries are added (§3.2, §3.3).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [`docs/adr/0014-browser-lane-runs-on-playwright.md`](../../docs/adr/0014-browser-lane-runs-on-playwright.md) (`design-ADR-0014`) — the Playwright browser lane against `out/`, `data-motion="settled"`, and why `inspect-page` is development feedback rather than a test.
- `ARCH-003-testing` — fast-suite `.pure.test.ts` structure (`success cases`, `failure cases`, `edge cases`, `// ARRANGE` / `// ACT` / `// ASSERT`) and browser waiting rules.
- [ESLint `complexity`](https://eslint.org/docs/latest/rules/complexity) and [`max-depth`](https://eslint.org/docs/latest/rules/max-depth).
