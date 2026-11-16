---
type: adr
id: GEN-005
title: 'Lint and Format Toolchain'
domain: general
rules: false
files: ['oxlint.config.mts', 'tools/lint/*.ts', '.oxfmtrc.jsonc', '.lintstagedrc.json']
paths: ['oxlint.config.mts', 'tools/lint/*.ts', '.oxfmtrc.jsonc', '.lintstagedrc.json']
description: 'Which tools lint and format the repo, their exact pins, why the alpha JS-plugin layer is acceptable, and the dependency-admission review of each package.'
---

# Lint and Format Toolchain

## Context

A cold full verify took about 63 s, bounded by format (34 to 50 s) and lint (12.5 s). Several agent worktrees share one machine, so that cost is paid in parallel and pushes tests past their timeouts. Caching did not help: the lint cache missed a stale-result hole for the phantom-class check.

Other ADRs say "lint" and "format" without naming a tool. This ADR owns which tools do that, so a tool swap amends one record.

Options spiked on a scratch copy (spec #607):

1. **Stay on the old pair.** Complete coverage, same speed problem.
2. **Biome.** Loses the phantom-class check, cyclomatic complexity and two Next rules, and corrupts Markdown. Rejected.
3. **oxlint and oxfmt.** Native rules matched every rule group on 33 seeded files in 1.9 s cold; formatting takes 0.2 s with no Markdown corruption. Chosen.

Lint rules here are ADR enforcers, so a linter that cannot host them is not a candidate.

## Decision

### 1. The tools

1. Lint MUST run through oxlint and format through oxfmt, each with one config, so every file type has one owner.
2. A rule with no native port MUST run as an oxlint JS plugin: `better-tailwindcss`, `check-file`, and `oxlint-plugin-eslint` carrying the original `no-restricted-syntax` selectors unchanged.
3. oxfmt `printWidth` MUST be `120` explicitly; the default of 100 would reflow the repo.
4. A script that formats a generated file MUST use oxfmt.
5. The lint config MUST be the TypeScript file `oxlint.config.mts` (oxlint 1.93 loads it under Node, experimental), never a committed JSON copy. It imports the design-token legacy list `src/shared/design-system/legacy.json` and the selector and token constants in `tools/lint/constants.ts`, so the list stays one file read by lint and Archgate (FE-011) and no glob is duplicated. A generator with a staleness test was the fallback and is not needed.
6. ESLint, typescript-eslint, `@next/eslint-plugin-next`, `eslint-config-prettier` and the ESLint config are removed. The `better-tailwindcss` and `check-file` plugins stay as oxlint JS plugins, and `@typescript-eslint/parser` stays as a dev dependency for the FE-013 rules test, which parses as Archgate does.
7. The format config MUST be `.oxfmtrc.jsonc`, and what oxfmt skips MUST live in its `ignorePatterns` beside the reason, with no separate ignore file and no `.prettierrc` or `.prettierignore`. `sortImports` MUST be on: two blocks (`builtin`, `external`, `subpath`, `internal`, `unknown`; then `parent`, `sibling`, `index`), `ignoreCase: true`, `newlinesBetween: false`, the closest match to the former organize-imports order. oxfmt never removes an unused import; lint's `no-unused-vars` reports it (`tests/boundaries/oxlint-config.test.ts`).

### 2. Exact pins

1. oxlint and `oxlint-plugin-eslint` MUST pin `1.93.0`; oxfmt MUST pin `0.78.0`. The two JS plugins stay at their versions of record.
2. A pin MUST NOT become a range. A bump is a deliberate change that re-runs the lint probe suites and the format check.

### 3. Why the alpha plugin layer is acceptable

1. The JS-plugin API is alpha and oxfmt is pre-1.0, so behaviour can change between releases. That is accepted because exact pins stop an install changing it, and a plugin that breaks fails loudly: probe suites plant each ADR violation, and CI runs the same commands as the local gates.
2. The switch MUST NOT weaken a rule: complexity, size caps, Next rules and every ADR-enforcing selector keep their strictness and ids.
3. The plugins are ESLint-ecosystem code, so a return is a config move.

### 4. Admission review

1. A new tool or plugin MUST clear the dependency admission bar, and its review is recorded below.
2. Read 2026-11-16, per package: stars, contributors or organisation, weekly downloads, latest release.
   - `oxlint`: 23.5k (shared oxc repo), organisation `oxc-project`, 47.8M, 2026-11-09. Clears.
   - `oxlint-plugin-eslint`: same repo and organisation, 1.4M, 2026-11-09. Clears.
   - `oxfmt`: same repo and organisation, 29.9M, 2026-11-09. Clears.
   - `eslint-plugin-better-tailwindcss`: 865 stars, 2.1M, pushed 2026-11-15. Misses stars; already admitted, only the host changes.
   - `eslint-plugin-check-file`: 616 stars, 1.6M, pushed 2026-09-13. Misses stars; already admitted, only the host changes.
   - `@typescript-eslint/parser` (kept for the FE-013 rules test, §1.6): 16.5k stars (shared typescript-eslint repo), organisation `typescript-eslint`, 181.7M, 2026-11-11. Clears; already admitted, only its job narrows to parsing a test fixture as Archgate does.
   - `json5` (pinned `2.2.3`; reads `.oxfmtrc.jsonc` for `formatAsRepo` and the `ignorePatterns` test, so neither needs the TypeScript compiler API): 7.2k stars, organisation `json5`, 32 contributors, 322.7M, last release 2022-12-31, commits merged and collaborator replies 2026-11. Clears: recency holds through maintainer activity; already in the tree transitively.
3. The oxc packages' risk is maturity, not popularity; §2 and §3.1 mitigate it, accepted knowingly.

## Do's and Don'ts

### Do's

1. **DO** lint with oxlint and format with oxfmt, one config each. (Decision 1.1)
2. **DO** run non-native rules as oxlint JS plugins, selectors unchanged. (Decision 1.2)
3. **DO** set oxfmt `printWidth: 120` explicitly. (Decision 1.3)
   **DO** keep the format config in `.oxfmtrc.jsonc` with ignores in `ignorePatterns`. (Decision 1.7)
4. **DO** pin oxlint, `oxlint-plugin-eslint` and oxfmt exactly. (Decision 2.1)
5. **DO** re-run the probe suites and format check on a bump. (Decision 2.2)
6. **DO** add an admission row here for any new tool or plugin. (Decision 4.1)

### Don'ts

1. **DON'T** add a second linter or formatter beside these. (Decision 1.1)
2. **DON'T** shell out to the retired tools from a script. (Decision 1.4)
3. **DON'T** loosen a pin to a range. (Decision 2.2)
4. **DON'T** weaken a rule to land the switch. (Decision 3.2)

## Consequences

**Positive:**

1. **Speed:** lint about 2 s cold, format about 0.2 s, so format leaves verify's critical path.
2. **Less contention:** parallel worktrees stop saturating the machine on static checks.
3. **No cache:** cold runs are fast, so the stale-cache hole disappears.
4. **One record:** other ADRs stay tool-neutral; a swap edits this one.

**Negative:**

1. **Immature tools:** the plugin API and formatter output can shift between releases.
2. **Output deltas:** union-type layout (about 20 TS files), a few HTML specs and one Markdown table format differently.
3. **Import housekeeping:** unused imports are reported by lint, and oxfmt sorts imports (the reorder landed as its own commit, #615).

**Risks:**

1. **A plugin breaks or stops firing on upgrade.** **Mitigation:** exact pins and probe suites that fail when a planted violation goes unreported.
2. **A formatter default changes.** **Mitigation:** options that matter are explicit, and the pin moves only on a deliberate bump.
3. **Upstream drops the JS-plugin layer.** **Mitigation:** ESLint-ecosystem plugins make a return a config move; a superseding ADR records it.

## Compliance and Enforcement

No Archgate rule. Range shape and suppression are enforced by the dependency-range and no-inline-suppression rules; the probe suites, the verify and CI static-lane commands, and lint-staged at commit enforce the rest.

**Manual review duties:** a new pin is exact (§2); a new tool or plugin has an admission row (§4); no rule is weakened (§3.2).

**Exceptions:** raise a separate ADR; human approval required.

## References

- [oxlint JS plugins](https://oxc.rs/docs/guide/usage/linter/js-plugins): the alpha layer §3 accepts.
- [oxfmt](https://oxc.rs/docs/guide/usage/formatter): formatter configuration.
- Spec: [hancrafted/content-library#607](https://github.com/hancrafted/content-library/issues/607).
