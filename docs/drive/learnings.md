# Drive learnings

One entry per failure mode with its recurrence count, and every Operator correction verbatim. Format: the drive skill's references/fortify.md, "The learnings file".

## Failure modes

### Enforcer detection misses non-Node repos (pyproject, uv, Cargo, go.mod)

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** test-runner: test, architectural
- **Status:** proposed
- **Evidence:** drive: deferred from review checkpoint 2; detection reads only package.json scripts, husky and .archgate

### Guard wiring covers husky only

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** hook: new hook-manager wiring for `.githooks` and lefthook, architectural
- **Status:** proposed
- **Evidence:** drive: deferred from the final review; setup wires `.husky/pre-commit` and prints the line to add for `.githooks` and lefthook repos

### The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** hook: new PreToolUse hook on `wt:new` that requires a fresh phase marker written by a new `drive status`, architectural
- **Status:** proposed
- **Evidence:** drive: the Operator stopped `wt:new -- decisions/drive` ("are we starting to implement?"); the Operator asked whether the session needs a human and for a review guide

### Workflow progress lives only in the session, so a quota reset ends it

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** test-runner: new test for a resume command that rebuilds the Workflow's state from `decisions.md` and the branches, architectural
- **Status:** proposed
- **Evidence:** drive: the Operator asked to resume automatically after a quota reset; the Orchestrator added a cron watchdog that dies with the session

## Corrections

- 2026-11-17 drive: The Operator stopped `wt:new -- decisions/drive` and asked "are we starting to implement? or is this prep work? are we already on a new integration branch?". The Orchestrator had started a step without saying which DRIVE phase it was in or what branch state would follow. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked "can this session run until end or does it require a human?" and asked for a guide to reviewing the PR. The Orchestrator had not stated the Operator's decision points, or how to review, up front. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked to resume automatically after a quota reset. There is no built-in recovery, so the Orchestrator added a session-only watchdog (a cron job that dies with the session). → Workflow progress lives only in the session, so a quota reset ends it
