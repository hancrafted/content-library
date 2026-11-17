# Drive learnings

One entry per failure mode with its recurrence count, and every Operator correction verbatim. Format: the drive skill's references/fortify.md, "The learnings file".

## Failure modes

### Enforcer detection misses non-Node repos (pyproject, uv, Cargo, go.mod)

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** test-runner: test, architectural
- **Status:** proposed
- **Evidence:** drive: deferred from review checkpoint 2; detection reads only package.json scripts, husky and .archgate

## Corrections

### Guard wiring covers husky only

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** hook: new hook-manager wiring for `.githooks` and lefthook, architectural
- **Status:** proposed
- **Evidence:** drive: deferred from the final review; setup wires `.husky/pre-commit` and prints the line to add for `.githooks` and lefthook repos
