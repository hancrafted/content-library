# Drive learnings

One entry per failure mode with its recurrence count, and every Operator correction verbatim. Format: the drive skill's references/fortify.md, "The learnings file".

## Watch

- Grills that ended at Define: 0

## Failure modes

### A decision page of the wrong model tier fails layout or rendering

- **Count:** 2 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** none deterministic: the tier rule in dispatch.md "Model", read from the page's calibration; the screenshot check in dispatch.md "A decision page"
- **Status:** proposed
- **Evidence:** drive: haiku failed layout; sonnet gave the best layout (the baseline); opus wrote better descriptions but broke rendering (mid-word wraps); enablement-vs-agentic-engineering: Han had to ask twice for an Opus Subagent for /to-review; the fidelity rule gave mid because every item sat at diagram; monitor: the second ask was redundant, the Orchestrator's reply said the page agent already ran on Opus, so the Operator could not see the tier; Fortify offered an architectural option (a computed tier command); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed, no count raise (same Workflow)

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

### A /drive grill round is written without reading `docs/agents/grilling-format.md`

- **Count:** 1 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** prose: AGENTS.md line, quick win; or test-runner: test for a `grill.format` key in project.yml, architectural
- **Status:** proposed
- **Evidence:** enablement-vs-agentic-engineering: round 1 had no opening, buckets, wh-headlines, examples or numbering; AGENTS.md:19 names the format only for /grill-with-docs and /wayfinder; Fortify offered a quick win (widen the AGENTS.md line) and an architectural option (`grill.format` key in project.yml); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed

### The grilling-format buckets have no home for knowledge-work questions such as information architecture

- **Count:** 1 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** check: check:docs over per-domain bucket tables, architectural; or a new bucket row, quick win
- **Status:** proposed
- **Evidence:** enablement-vs-agentic-engineering: Slide-structure and matrix questions fit none of contract, architecture, workflow

### A Reason page whose items are visual Slides starts at the `diagram` rung

- **Count:** 1 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** test-runner: test that fails on a `slide` item at `data-fidelity=diagram`, architectural; or a review.md Fidelity line, quick win
- **Status:** proposed
- **Evidence:** enablement-vs-agentic-engineering: review page round 1 was too low fidelity; Han asked for the Claude Desktop image and the repo diagram, one extra round; Fortify offered a quick win (review.md Fidelity line) and an architectural option (dispatch check on `slide` items); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed

### The Integration PR can be merged before `/code-review` has run on it

- **Count:** 1 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** check: new required GitHub status `drive/review`, architectural; or draft PR until the review report exists, quick win
- **Status:** proposed
- **Evidence:** enablement-vs-agentic-engineering: PR #761 merged 2026-11-18 with 0 reviews; Verify review skipped; Fortify offered a quick win (draft PR until the review report) and an architectural option (required status `drive/review`); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed

### A detached dev server start exits without a message

- **Count:** 1 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** test-runner: test:slow for a `dev:bg` launcher that waits for Ready or prints its log, quick win
- **Status:** proposed
- **Evidence:** enablement-vs-agentic-engineering: `npx next dev` in background exited 1 with 'Errors: 1' and no reason; foreground worked

### A Subagent draws a real product from imagination, and the Operator supplies screenshots a round later

- **Count:** 1 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** none deterministic: a line in review.md Fidelity that a brief names a reference screenshot for any real product shown, folded into the fidelity quick win
- **Status:** proposed
- **Evidence:** enablement-vs-agentic-engineering: round 2 drew a Claude Desktop window and three terminals unseen; the Operator then sent four screenshots of the real app and tools, and round 3 redrew Slides 3 and 5

### Watching a drive session by hand costs time on the transcript path and its UTC timestamps

- **Count:** 1 (last: 2026-11-18, enablement-vs-agentic-engineering)
- **Enforcer:** none deterministic: a short section in the drive skill, `references/watch.md`, naming the transcript path `~/.claude/projects/<project>/<session-id>.jsonl`, that its timestamps are UTC, and that Subagent transcripts sit under `<session-id>/subagents/`
- **Status:** proposed
- **Evidence:** enablement-vs-agentic-engineering: the monitor found the file by listing the project folder, and misjudged the Subagent's elapsed time by an hour because the transcript's 10:30 was 11:30 local

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

## Corrections

- 2026-11-17 drive: The Operator stopped `wt:new -- decisions/drive` and asked "are we starting to implement? or is this prep work? are we already on a new integration branch?". The Orchestrator had started a step without saying which DRIVE phase it was in or what branch state would follow. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked "can this session run until end or does it require a human?" and asked for a guide to reviewing the PR. The Orchestrator had not stated the Operator's decision points, or how to review, up front. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked to resume automatically after a quota reset. There is no built-in recovery, so the Orchestrator added a session-only watchdog (a cron job that dies with the session). → Workflow progress lives only in the session, so a quota reset ends it
- 2026-11-18 enablement-vs-agentic-engineering: Grill round 1 ignored docs/agents/grilling-format.md (opening, buckets, wh-headlines, examples, numbering). → A /drive grill round is written without reading `docs/agents/grilling-format.md`
- 2026-11-18 enablement-vs-agentic-engineering: Fortify: grilling-format buckets are software-only (contract/architecture/workflow); knowledge-work grills need their own buckets, e.g. information architecture. → The grilling-format buckets have no home for knowledge-work questions such as information architecture
- 2026-11-18 enablement-vs-agentic-engineering: Review page round 1 was too low fidelity for visual Slides; Han asked for high-fidelity visualizations (Claude Desktop image, repo diagram). → A Reason page whose items are visual Slides starts at the `diagram` rung
- 2026-11-18 enablement-vs-agentic-engineering: Han had to ask twice for an Opus subagent for /to-review ("use an opus subagent to do the /to-review"; "use opus subagent for it"). → A decision page of the wrong model tier fails layout or rendering
- 2026-11-18 enablement-vs-agentic-engineering: PR #761 merged by Han before /code-review ran (Verify review skipped). → The Integration PR can be merged before `/code-review` has run on it
- 2026-11-18 enablement-vs-agentic-engineering: The detached dev server start (`npx next dev` in background) exited 1 with "Errors: 1" and no message; a foreground start worked. → A detached dev server start exits without a message
- 2026-11-18 enablement-vs-agentic-engineering: slide 3 [Image #4] this si the curernt desktop showing my project. on top left we have projects, meetings, artifacts, schedule. on right we have instrcutions, memory and context. create the graphic in the center and show the content it left and right → A Subagent draws a real product from imagination, and the Operator supplies screenshots a round later
- 2026-11-18 onboard-ai-every-time-event-look: i can be sure that the workflow can run until end so that not mid run the agent ask me to resolve a question or pr → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
