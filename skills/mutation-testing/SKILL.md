---
name: mutation-testing
description: Harden changed logic with scoped mutation testing (`npm run test:mutation`) and triage surviving mutants to zero. Use once `/tdd` and `/code-review` have settled before `/commit`; writing new tests from scratch belongs to `/tdd`.
---

# Mutation testing

Harden changed logic (`*.pure.ts` and `skills/**/scripts/**/*.ts`) once `/tdd` ⇄ `/code-review` have settled (`ARCH-003-testing` §6). Run the four steps in order.

## Steps

**1. Scope.** `npm run test:mutation` computes the `*.pure.ts` modules and `skills/**/scripts/**/*.ts` skill scripts changed since the merge-base with `origin/main`, including the `.pure.ts` or script subject of any changed unit test. When no mutatable files are in scope, it prints `✔ no mutatable logic files changed since origin/main` and exits 0 — stop there.

**2. Run.** When files are in scope, `npm run test:mutation` runs Stryker in place (`stryker.config.mjs`) over the scoped files.
_Done when_ `npm run test:mutation` finishes and prints the surviving mutants (and writes `reports/mutation/mutation.json`), or exits 0 with no files in scope.

**3. Triage each survivor in changed code.** Inspect every `[Survived]` and `[NoCoverage]` mutant in changed code and resolve each one per `ARCH-003-testing` §6:

- **Real test gap → kill with a test.** Add or sharpen a behavioural test in the sibling `*.test.ts` file (following `ARCH-003-testing`) that fails against the mutant and passes against the original.
- **Equivalent mutant → mark with a mutator and reason.** When the mutation cannot change observable behaviour for any valid input, place a reasoned Stryker comment (`// Stryker disable next-line <Mutator>: <reason>` or `/* Stryker disable <Mutator>: <reason> */` paired with `/* Stryker restore <Mutator> */`) obeying `ARCH-003` rule `stryker-marker-reason`.
- **Production logic change → re-review.** If killing a survivor requires changing production logic (`*.pure.ts` or a skill script rather than comments), re-run `/code-review` on that fix before continuing.
- **No score target.** Triage every individual survivor in changed code; never optimize for a numeric mutation score threshold.

_Done when_ every survivor in changed code has either a killing test or a reasoned equivalent-mutant marker, and any production logic fix has passed `/code-review`.

**4. Re-run.** Run `npm run test:mutation` to prove every survivor in changed code is killed or marked, then run `npm run verify`.
_Done when_ `npm run test:mutation` reports 0 surviving and 0 no-coverage mutants across the scoped files and `npm run verify` exits 0.
