---
name: mutation-testing
description: Harden a finished change with scoped mutation testing (`npm run test:mutation`) once `/tdd` and `/code-review` have settled, and triage surviving mutants to zero. Use after implementation and review settle before `/commit`; writing new tests from scratch belongs to `/tdd`.
---

# Mutation testing

Harden changed logic (`*.pure.ts` and `skills/**/scripts/**/*.ts`) once `/tdd` ⇄ `/code-review` have settled (`ARCH-003-testing` §6). Run the four steps in order.

## Steps

**1. Scope.** `npm run test:mutation` computes the `*.pure.ts` modules and `skills/**/scripts/**/*.ts` skill scripts changed since the merge-base with `origin/main`, including the `.pure.ts` or script subject of any changed unit test (`skills/mutation-testing/scripts/mutation-scope.pure.ts`). When no mutatable files are in scope, it prints `✔ no mutatable logic files changed since origin/main` and exits 0 — stop there.

**2. Run.** When files are in scope, `npm run test:mutation` runs Stryker in place (`stryker.config.mjs`) over the scoped files, restores `.agents/` executable bits stripped by in-place backup, and removes `.stryker-tmp/` and stray `stryker-setup-*.js` files.
_Done when_ `npm run test:mutation` finishes and prints the surviving mutants (and writes `reports/mutation/mutation.json`), or exits 0 with no files in scope.

**3. Triage each survivor in changed code.** Inspect every `[Survived]` and `[NoCoverage]` mutant in changed code and resolve each one:

- **Real test gap → kill with a test.** Add or sharpen a behavioural test in the sibling `*.test.ts` file (following `ARCH-003-testing`: `success cases` / `failure cases` / `edge cases`, `// ARRANGE` / `// ACT` / `// ASSERT`, named expected values) that fails against the mutant and passes against the original.
- **Equivalent mutant → mark with a mutator and reason.** When the mutation cannot change observable behaviour for any valid input, place a reasoned Stryker comment directly above the line:
  ```ts
  // Stryker disable next-line EqualityOperator: boundary clamped on the line above
  ```
  Around pure data tables of labels and copy, use block markers paired with a restore comment:
  ```ts
  /* Stryker disable StringLiteral: display label table */
  const LABELS = { ... };
  /* Stryker restore StringLiteral */
  ```
  Every marker must name the specific mutator(s) and give a reason after `:` (`ARCH-003` rule `stryker-marker-reason`). Never use `Stryker disable all` or omit a reason.
- **Production logic change → re-review.** If killing a survivor requires changing production logic (`*.pure.ts` or a skill script rather than comments), re-run `/code-review` on that fix before continuing.
- **No score target.** Triage every individual survivor in changed code; never optimize for a numeric mutation score threshold.

_Done when_ every survivor in changed code has either a killing test or a reasoned equivalent-mutant marker, and any production logic fix has passed `/code-review`.

**4. Re-run.** Run `npm run test:mutation` to prove every survivor in changed code is killed or marked, then run `npm run verify`.
_Done when_ `npm run test:mutation` reports 0 surviving and 0 no-coverage mutants across the scoped files and `npm run verify` exits 0.
