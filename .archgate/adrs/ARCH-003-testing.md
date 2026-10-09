---
type: adr
id: ARCH-003
title: 'Testing'
domain: architecture
rules: true
files: ['src/**/*.test.ts']
paths: ['**/*.test.ts', 'src/**/*.pure.ts']
description: "What a test file may do and how it is shaped: six behavioural Don'ts that keep green meaningful everywhere, plus a three-block suite split, marked test bodies and two import homes under src/."
---

# Testing

## Context

Test-driven development (TDD) and the red-green-refactor cycle are the primary agentic coding practices. Because agents optimizing for a green signal routinely introduce mocks, skips, and ambient shortcuts that destroy test validity, this ADR establishes behavioral boundaries and uniform suite structures to keep passing tests trustworthy proof and missing cases visible.

## Decision

### 1. Determinism and Real Execution

1. **Tests MUST be fully deterministic**: all time, randomness, and inputs MUST be supplied explicitly with zero dependence on ambient state or network.
2. **Tests MUST provide real assertion value**: tests MUST execute real code against explicit expected values—mock frameworks (`vi.mock`/`vi.spyOn`), snapshots, skipped tests (`.skip`), and assertion-free bodies are forbidden.

### 2. Suite structure

1. Under `src/**/*.test.ts`, a top-level suite MUST split into exactly three `describe` blocks — `success cases`, `failure cases`, `edge cases` — each holding at least one test. There is no fourth name. (📜 Rule: `suite-three-blocks`)
2. `describe` MUST NOT nest past two levels; a test MUST NOT sit at file top level.

### 3. Test-body structure

1. Every test body MUST carry `// ARRANGE`, `// ACT` and `// ASSERT`, uppercase, exactly once each, in that order; one marker per comment, so `// ARRANGE / ACT` is two markers short. (📜 Rule: `test-body-aaa`)
2. The `// ASSERT` block MUST NOT hold a magic string or number; name it in `// ARRANGE`, so a reviewer can disagree with it. Exempt as pure noise: `0`, `1`, `-1`, `true`, `false`, `null`, `undefined`, `''`, `[]`, `{}`.
3. An assertion MUST NOT collapse into a boolean inside `// ACT`. Put the observation in `// ACT` and keep the rich matcher in `// ASSERT` — `expect(seen).toContain(key)` names the missing key, while `expect(isSeen).toBe(true)` discards why it failed.

### 4. Where a test lives

1. A unit test sits beside its subject under `src/` — `slide-zone.pure.test.ts` beside `slide-zone.pure.ts` — and runs in the fast suite.
2. A test that needs the built site is `*.build.test.ts` under `tests/post-build/`, run only after `npm run build`; the fast suite never needs a build.
3. An Episode test reaches only what an Episode file may, plus Node builtins for in-test fixtures.

## Do's and Don'ts

### Do's

1. **DO** pass every instant, seed and input a test depends on into the test explicitly. (Decision 1.1)
2. **DO** write the expected value out by hand, so a reviewer can disagree with it. (Decision 1.2)
3. **DO** hand-write a stand-in when a collaborator must be substituted, and keep it in the test file where a reader can see what it does. (Decision 1.2)
4. **DO** split every suite under `src/` into `success cases`, `failure cases` and `edge cases`, with at least one test in each. (Decision 2, 📜 Rule: `suite-three-blocks`)
5. **DO** treat a block you cannot fill as a question about the subject, not a rule to route around. (Decision 2.1)
6. **DO** mark every body `// ARRANGE`, `// ACT`, `// ASSERT`, naming expected values before asserting them. (Decision 3, 📜 Rule: `test-body-aaa`)
7. **DO** put pure logic in a `*.pure.ts` and test it from its same-name sibling. (Decision 4)
8. **DO** assert an absence of side effects by comparing an observation taken before the action against the same observation taken after it. (Decision 1.2)

### Don'ts

1. **DON'T** call `Date.now()`, `Math.random()`, `performance.now()`, or `new Date()` with no argument. (Decision 1.1)
2. **DON'T** commit `.only` or `.skip` on `it`, `test` or `describe`. (Decision 1.2)
3. **DON'T** write a test body with no `expect` in it. (Decision 1.2)
4. **DON'T** use `toMatchSnapshot`, `toMatchInlineSnapshot`, or any matcher ending in `Snapshot`. (Decision 1.2)
5. **DON'T** call `vi.mock`, `vi.doMock`, `vi.spyOn`, `vi.mocked`, `vi.stubGlobal`, or a `jest` equivalent. (Decision 1.2)
6. **DON'T** assert an expected value the code under test computed. (Decision 1.2)
7. **DON'T** inline a magic string or number in the `// ASSERT` block. (Decision 3.2)
8. **DON'T** assert a side effect's absence against a pristine or empty baseline — that measures ambient repository state, and it fails on the very commit that changes the tree it guards. (Decision 1.2)

## Consequences

### Positive

- **Tests are dependable evidence.** Mocks, skips, assertion-free bodies, and ambient state are mechanically blocked, ensuring green means correctness and red means real breakage.
- **Missing cases surface immediately.** The mandatory three-block split (`success cases`, `failure cases`, `edge cases`) forces unhandled errors and edge cases to be confronted explicitly.

### Negative

- **Collaborator substitution requires hand-written stand-ins.** In-file test doubles are more verbose than `vi.spyOn`, trading brevity for transparency.
- **Built-output tests run late.** A `*.build.test.ts` fails on the pull request, not at commit.

### Risks

- **Bans bypassed via helper imports.** Non-deterministic calls or mocks could hide behind local imports. **Mitigation:** dependency-cruiser constrains import graphs and code review inspects test utilities.
- **Stand-in complexity creep.** Hand-written doubles could accumulate hidden framework-like behavior. **Mitigation:** stand-ins must stay in the test file, keeping growth visible in diffs.

## Compliance and Enforcement

1. **Rules** (archgate, error): `suite-three-blocks` (§2.1), `test-body-aaa` (§3.1), over `src/**/*.test.ts`.
2. **Dependency rules:** Episode tests reach only Slide parts and builtins (§4.3).
3. **Test config:** the fast suite excludes `*.build.test.ts` (§4.2).

**Manual review duties:** §1 — no mocks, spies, snapshots, `.skip`/`.only`, ambient time or randomness, network, assertion-free or tautological bodies; nesting depth and a test per block (§2); no magic values in `// ASSERT`, rich matchers (§3.2, §3.3).

**Exceptions:** amend this record; never an inline suppression.

## References

- [Vitest Test API](https://vitest.dev/api/) — assertions, runner controls, and test lifecycle.
