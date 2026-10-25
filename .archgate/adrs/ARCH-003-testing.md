---
type: adr
id: ARCH-003
title: 'Testing'
domain: architecture
rules: true
files: ['src/**/*.test.ts', '{tests/browser,skills}/**/*.browser.test.ts']
paths: ['**/*.test.ts', 'src/**/*.pure.ts']
description: "What a test file may do and how it is shaped: six behavioural Don'ts that keep green meaningful everywhere, a three-block suite split, marked test bodies and two import homes under src/, and browser tests that wait on the page, never on time."
---

# Testing

## Context

Test-driven development (TDD) and the red-green-refactor cycle are the primary agentic coding practices. Because agents optimizing for a green signal routinely introduce mocks, skips, and ambient shortcuts that destroy test validity, this ADR establishes behavioral boundaries and uniform suite structures to keep passing tests trustworthy proof and missing cases visible.

Rationale for the rules below: the three suite blocks have no fourth name. a `// ARRANGE / ACT` comment is two markers short. A named expected value in `// ARRANGE` lets a reviewer disagree with it. `expect(seen).toContain(key)` names the missing key, while `expect(isSeen).toBe(true)` discards why it failed. The fast suite and pull-request CI open no browser, so neither needs a build. A sleep passes by being long enough: slow on a fast machine, red on a slow one. A retrying assertion matters because `expect(await drawer.isVisible()).toBe(true)` reads once. A pristine or empty baseline fails on the very commit that changes the tree it guards.

## Decision

### 1. Determinism and Real Execution

1. **Tests MUST be fully deterministic**: all time, randomness and inputs MUST be supplied explicitly, with no ambient state or network.
2. **Tests MUST provide real assertion value**: they MUST execute real code against explicit expected values—mocks, snapshot matchers, skipped tests and assertion-free bodies are forbidden. A reviewed contract file, `published-anchors.json`, is an expected value.

### 2. Suite structure

1. In every test under `src/` and every browser test, a top-level suite MUST split into exactly three `describe` blocks — `success cases`, `failure cases`, `edge cases` — each holding at least one test. (📜 Rule: `suite-three-blocks`)
2. `describe` MUST NOT nest past two levels; a test MUST NOT sit at file top level.

### 3. Test-body structure

1. Every test body MUST carry `// ARRANGE`, `// ACT` and `// ASSERT`, exactly once each, in order; one marker per comment. (📜 Rule: `test-body-aaa`)
2. The `// ASSERT` block MUST NOT hold a magic string or number; name it in `// ARRANGE`. Exempt: `0`, `1`, `-1`, `true`, `false`, `null`, `undefined`, `''`, `[]`, `{}`. (📜 Rule: `assert-no-magic`)
3. An assertion MUST NOT collapse into a boolean inside `// ACT`: observe in `// ACT`, keep the rich matcher in `// ASSERT`.

### 4. Where a test lives

1. A unit test sits beside its subject under `src/` and runs in the fast suite.
2. `*.build.test.ts` (in `tests/post-build/`) runs after `npm run build`. `*.browser.test.ts` drives the built export, via `npm run test:browser` and nightly on `main` in CI.
3. An Episode test reaches only what an Episode file may, plus Node builtins for in-test fixtures.

### 5. Browser tests wait on the page

1. A browser test MUST NOT wait on time — no `waitForTimeout`, `setTimeout` or `delay`.
2. It waits on what the page shows: a retrying assertion, or an animating element reaching `data-motion="settled"`.
3. An assertion MUST retry (`await expect(drawer).toBeVisible()`), not read once.

## Do's and Don'ts

### Do's

1. **DO** write the expected value out by hand, so a reviewer can disagree with it. (Decision 1.2)
2. **DO** hand-write a stand-in for a substituted collaborator, in the test file. (Decision 1.2)
3. **DO** split every suite under `src/`, and every browser test, into `success cases`, `failure cases` and `edge cases`, with at least one test in each. (Decision 2, 📜 Rule: `suite-three-blocks`)
4. **DO** treat a block you cannot fill as a question about the subject, not a rule to route around. (Decision 2.1)
5. **DO** mark every body `// ARRANGE`, `// ACT`, `// ASSERT`, naming expected values before asserting them. (Decision 3, 📜 Rule: `test-body-aaa`)
6. **DO** put pure logic in a `*.pure.ts` and test it from its same-name sibling. (Decision 4)
7. **DO** assert an absence of side effects by comparing an observation taken before the action against the same observation taken after it. (Decision 1.2)

### Don'ts

1. **DON'T** call `Date.now()`, `Math.random()`, `performance.now()`, or `new Date()` with no argument. (Decision 1.1)
2. **DON'T** commit `.only` or `.skip` on `it`, `test` or `describe`. (Decision 1.2)
3. **DON'T** write a test body with no `expect` in it. (Decision 1.2)
4. **DON'T** use `toMatchSnapshot`, `toMatchInlineSnapshot`, or any matcher ending in `Snapshot`. (Decision 1.2)
5. **DON'T** call `vi.mock`, `vi.doMock`, `vi.spyOn`, `vi.mocked`, `vi.stubGlobal`, or a `jest` equivalent. (Decision 1.2)
6. **DON'T** assert an expected value the code under test computed. (Decision 1.2)
7. **DON'T** inline a magic string or number in the `// ASSERT` block. Strings: by review. (Decision 3, 📜 Rule: `assert-no-magic`)
8. **DON'T** assert a side effect's absence against a pristine or empty baseline (it measures ambient repository state). (Decision 1.2)
9. **DON'T** sleep in a browser test — `page.waitForTimeout(500)`. (Decision 5)
10. **DON'T** assert a browser read taken once (`expect(await el.isVisible())`). (Decision 5)

## Consequences

### Positive

- **Tests are dependable evidence.** Mocks, skips, assertion-free bodies, and ambient state are mechanically blocked, ensuring green means correctness and red means real breakage.
- **Missing cases surface immediately.** The mandatory three-block split (`success cases`, `failure cases`, `edge cases`) forces unhandled errors and edge cases to be confronted explicitly.
- **Browser tests run as fast as the page.** No sleep pads a run, and a timeout names the element that never arrived.

### Negative

- **Collaborator substitution requires hand-written stand-ins.** In-file test doubles are more verbose than `vi.spyOn`, trading brevity for transparency.
- **Built-output tests run late.** A `*.build.test.ts` fails on the pull request, not at commit; a CI-only browser failure surfaces the next morning, not on the pull request.
- **Animations carry a contract.** Every animating element a browser test waits on reports `data-motion`; a missing `settled` hangs the test until its timeout.

### Risks

- **Bans bypassed via helper imports.** Non-deterministic calls or mocks could hide behind local imports. **Mitigation:** dependency-cruiser constrains import graphs and code review inspects test utilities.
- **A sleep hides behind a helper.** A wrapper named `waitForAnimation` can still sleep. **Mitigation:** lint bans the sleep calls by name in browser tests, and review reads shared browser helpers.
- **Stand-in complexity creep.** Hand-written doubles could accumulate hidden framework-like behavior. **Mitigation:** stand-ins must stay in the test file, keeping growth visible in diffs.

## Compliance and Enforcement

1. **Rules** (archgate, error): `suite-three-blocks` (§2.1), `test-body-aaa` (§3.1), `assert-no-magic` (§3.2, numbers only), over `src/**/*.test.ts` and the browser tests in `tests/browser/` and `skills/`.
2. **Dependency rules:** Episode tests reach only Slide parts and builtins (§4.3).
3. **Test config:** the fast suite excludes `*.build.test.ts` and `*.browser.test.ts` (§4.2).
4. **Lint** (Playwright plugin, from the Playwright browser lane on), over `**/*.browser.test.ts`: no fixed waits, web-first assertions (§5.1, §5.3). Until then §5 is a review duty.

**Manual review duties:** §5.2 — a wait names a page condition, and a shared helper never sleeps; §1 — no mocks, spies, snapshots, `.skip`/`.only`, ambient time or randomness, network, assertion-free or tautological bodies; nesting depth and a test per block (§2); no magic strings in `// ASSERT` (§3.2), rich matchers (§3.3).

**Exceptions:** amend this record; never an inline suppression.

## References

- [Vitest Test API](https://vitest.dev/api/) — assertions, runner controls, and test lifecycle.
- [Playwright — auto-waiting](https://playwright.dev/docs/actionability) and [web-first assertions](https://playwright.dev/docs/test-assertions) — the waits §5 asks for.
- [eslint-plugin-playwright](https://github.com/mskelton/eslint-plugin-playwright) — `no-wait-for-timeout`, `prefer-web-first-assertions`.
