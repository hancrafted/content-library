# Drive learnings

One entry per failure mode with its recurrence count, and every Operator correction verbatim. Format: the drive skill's references/fortify.md, "The learnings file".

## Watch

- Grills that ended at Define: 0

## Failure modes

### A decision page of the wrong model tier fails layout or rendering

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** none deterministic: the tier rule in dispatch.md "Model", read from the page's calibration; the screenshot check in dispatch.md "A decision page"
- **Status:** proposed
- **Evidence:** drive: haiku failed layout; sonnet gave the best layout (the baseline); opus wrote better descriptions but broke rendering (mid-word wraps)

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

- **Count:** 2 (last: 2026-11-18, onboard-ai-every-time-event-look)
- **Enforcer:** hook: new PreToolUse hook on `wt:new` that requires a fresh phase marker written by a new `drive status`, architectural
- **Status:** proposed
- **Evidence:** drive: the Operator stopped `wt:new -- decisions/drive` ("are we starting to implement?"); the Operator asked whether the session needs a human and for a review guide; fortify-decision AR-1 proposes this hook (picks skipped 2026-11-17, count kept at 1: same Workflow); onboard-ai-every-time-event-look: the Operator could not tell whether the Workflow would run to the end without a question or a PR mid-run (Decision record 0028 closes the mid-run questions; the phase naming stays unenforced)

### Workflow progress lives only in the session, so a quota reset ends it

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** test-runner: new test for a resume command that rebuilds the Workflow's state from `decisions.md` and the branches, architectural
- **Status:** proposed
- **Evidence:** drive: the Operator asked to resume automatically after a quota reset; the Orchestrator added a cron watchdog that dies with the session

### A slow test hangs past its timeout and blocks `wt:done` until the process tree is killed by hand

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** test-runner: test:slow test that starts a background process in a temp worktree and asserts `wt:done` names and ends it, quick win
- **Status:** proposed (unpicked, picks skipped 2026-11-17)
- **Evidence:** drive: a vitest slow run hung 7+ minutes in a Subagent worktree, `wt:done` refused, the Orchestrator killed the tree by hand; `vitest.slow.config.mts` already sets `testTimeout: 60_000` and did not stop it (fortify-decision QW-1)

### `wt:new` leaves its branch and folder behind when `npm ci` fails

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** test-runner: test:slow test that injects an install failure and asserts no branch or folder remains, quick win
- **Status:** proposed (unpicked, picks skipped 2026-11-17)
- **Evidence:** drive: the first `wt:new -- decisions/drive` ended in a stack trace, the rerun said "branch already exists", `npm ci` was rerun by hand in the half-made worktree (fortify-decision QW-2)

### The main checkout is found with `core.bare=true` and nothing reports it

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** check: new check in `npm run preflight` plus a temp-repo test, quick win
- **Status:** proposed (unpicked, picks skipped 2026-11-17)
- **Evidence:** drive: mid-run the main checkout had `core.bare=true`, cause unknown (a test may have leaked into the real repo); a Subagent reset it by hand (fortify-decision QW-3)

### The Binding names a skill that main has renamed, and no check fails

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** test-runner: new test (or `drive setup` check) that fails when a skill named in the Binding is not installed, quick win
- **Status:** proposed (unpicked, picks skipped 2026-11-17)
- **Evidence:** drive: main renamed `to-decision-html` to `to-review`; `docs/drive/binding.yml` kept the old name with all checks green; the Orchestrator found it by hand in merge 283abde8 (fortify-decision QW-4)

### A Subagent stops before committing and merging its Task branch

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** hook: new SubagentStop hook that blocks while the Task branch is unmerged, with an escape for a reported blocker, architectural
- **Status:** proposed (unpicked, picks skipped 2026-11-17)
- **Evidence:** drive: twice a Subagent stopped ("waiting on monitor") before merging and needed a SendMessage to finish (fortify-decision AR-2)

### Parallel tickets edit the same file and the rules are relayed by hand

- **Count:** 1 (last: 2026-11-17, drive)
- **Enforcer:** check: new dispatch check that fails when two parallel tickets declare the same file, architectural
- **Status:** proposed (unpicked, picks skipped 2026-11-17)
- **Evidence:** drive: #667 and #668 both edited `learnings.md`, parallel fix Subagents shared it and `binding.yml`; rules relayed by SendMessage and one sync conflicted (fortify-decision AR-3)

### A Subagent merges a render-changing task without running the build and its tests

- **Count:** 1 (last: 2026-11-18, ai-attention-span-pool)
- **Enforcer:** test-runner: test:build, quick win (Implementer profile line) or architectural (`drive worktree done` runs the build lane)
- **Status:** proposed
- **Evidence:** ai-attention-span-pool: #711 merged on `npm run verify` alone; pre-push failed on `tests/post-build/episode-text/ai-attention-span.de.json` and cost one fix task

### A Subagent skips an acceptance criterion and the report passes the shape check

- **Count:** 2 (last: 2026-11-18, ai-gives-you-more-work-pool)
- **Enforcer:** none deterministic yet: Implementer profile line, quick win; new test for a report parser called by `worktree done`, architectural
- **Status:** proposed
- **Evidence:** ai-attention-span-pool: #712 reported visual-check as not done under Not verified and merged; the Orchestrator dispatched it separately; ai-gives-you-more-work-pool: the fix-review Subagent did not read the `test:build` output its ticket required, and the Orchestrator accepted that because pre-push runs build tests

### A pool Slide's test references a by-event Episode, and nothing checks it

- **Count:** 1 (last: 2026-11-18, ai-attention-span-pool)
- **Enforcer:** adr-checker: archgate, new rule in ARCH-003-testing over `src/episodes/slide-pool/**/*.test.ts`, quick win
- **Status:** proposed
- **Evidence:** ai-attention-span-pool: #711 left pool tests rendering through the 2026-10-28 Event copy and pool asserts duplicated in five section tests; review caught it, fix-review b54769a05

### The harness attribution reminder conflicts with the commit rule and a Subagent has to arbitrate

- **Count:** 1 (last: 2026-11-18, ai-attention-span-pool)
- **Enforcer:** hook: .husky/commit-msg, architectural (brittle by the commit skill's account); or an Implementer profile line
- **Status:** proposed
- **Evidence:** ai-attention-span-pool: both implementation Subagents noted `/commit` strips the Co-Authored-By the harness asks for; the project rule won

### A push is not checked against the remote

- **Count:** 2 (last: 2026-11-18, ai-gives-you-more-work-pool)
- **Enforcer:** test-runner: test:slow test for `drive push` that fails when the remote does not hold the pushed commit, architectural
- **Status:** fixed by #740
- **Evidence:** drive: pushes piped through `grep` and `tail` three times, masking the push exit code (#695); ai-attention-span-pool and ai-gives-you-more-work-pool: three more pushes piped through `grep`, `head` or `tail`, and none compared `git ls-remote` with the local commit

### What is live or scheduled that a change touches is raised only at the PR

- **Count:** 1 (last: 2026-11-18, onboard-ai-every-time-event-look)
- **Enforcer:** none deterministic yet: the Decision PR body's required section (Decision record 0028), architectural
- **Status:** fixed by #740
- **Evidence:** ai-attention-span-pool: spreading a change to four Episodes never named that one is presented at an Event that day, until the PR-body Subagent found it; ai-gives-you-more-work-pool raised it only at the PR; onboard-ai-every-time-event-look did not name it in Define either (count kept at 1: one Operator, one session of lessons)

### Fortify evidence is merged into an Integration branch whose PR had already merged

- **Count:** 1 (last: 2026-11-18, ai-attention-span-pool)
- **Enforcer:** none deterministic yet: Fortify takes its evidence from the base branch after the merge (Decision record 0028), architectural
- **Status:** fixed by #740
- **Evidence:** ai-attention-span-pool: the Fortify evidence Subagent self-merged into the Integration branch after the Operator had merged its PR, so the work landed on a dead branch and had to be recovered

### ARCH-003's three-describe rule forces filler tests in composition-only section tests

- **Count:** 1 (last: 2026-11-18, ai-gives-you-more-work-pool)
- **Enforcer:** adr-checker: archgate, narrow the ARCH-003-testing rule for composition-only section tests, quick win
- **Status:** proposed
- **Evidence:** ai-gives-you-more-work-pool: #729 added two tests that can never fail, only to satisfy the three-describe rule (its own Trade-offs line said so); the review caught them

### A grill round's questions are pointed to, not stated where the Operator reads

- **Count:** 1 (last: 2026-11-18, event-copy-derivation)
- **Enforcer:** none deterministic yet: a Define rule in the drive skill that each round's questions appear in full in the message that asks for answers, architectural
- **Status:** proposed
- **Evidence:** event-copy-derivation: the Orchestrator's setup message sent the Operator to "round 1, Q1 to Q4 from my last message" and offered a `/drive resume` line; the Operator had to ask "list round 1 questions"

### Issues stay open after the PR that closes them has merged

- **Count:** 1 (last: 2026-11-18, event-copy-derivation)
- **Enforcer:** hook: `drive worktree done` closes or lists the issues its Integration branch's PR references, quick win
- **Status:** proposed
- **Evidence:** event-copy-derivation: the Orchestrator found #710, #728 and #735 still open after #714, #733 and #737 had merged, and asked the Operator whether to close them

### The Operator skips Fortify, so corrections and options never reach a decision

- **Count:** 1 (last: 2026-11-18, ai-attention-span-pool)
- **Enforcer:** none deterministic yet: Fortify runs from the base branch after the merge and its picks are optional (Decision record 0028), architectural
- **Status:** proposed
- **Evidence:** ai-attention-span-pool, ai-gives-you-more-work-pool, onboard-ai-every-time-event-look: the Operator skipped the Fortify picks on all three Workflows ("skip fortify and repeat the same for the \"ai-gives-you-more-work\" episode"); the entries above stay unpicked at count 1

## Corrections

- 2026-11-17 drive: The Operator stopped `wt:new -- decisions/drive` and asked "are we starting to implement? or is this prep work? are we already on a new integration branch?". The Orchestrator had started a step without saying which DRIVE phase it was in or what branch state would follow. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked "can this session run until end or does it require a human?" and asked for a guide to reviewing the PR. The Orchestrator had not stated the Operator's decision points, or how to review, up front. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked to resume automatically after a quota reset. There is no built-in recovery, so the Orchestrator added a session-only watchdog (a cron job that dies with the session). → Workflow progress lives only in the session, so a quota reset ends it
- 2026-11-18 onboard-ai-every-time-event-look: i can be sure that the workflow can run until end so that not mid run the agent ask me to resolve a question or pr → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 ai-attention-span-pool: skip fortify and repeat the same for the "ai-gives-you-more-work" episode. also apply the same transition as with the attention episode → The Operator skips Fortify, so corrections and options never reach a decision
- 2026-11-18 event-copy-derivation: list round 1 questions → A grill round's questions are pointed to, not stated where the Operator reads
