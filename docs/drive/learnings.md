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

- **Count:** 2 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** check: new dispatch check that fails when two parallel tickets declare the same file, architectural
- **Status:** proposed (unpicked, picks skipped 2026-11-17)
- **Evidence:** drive: #667 and #668 both edited `learnings.md`, parallel fix Subagents shared it and `binding.yml`; rules relayed by SendMessage and one sync conflicted (fortify-decision AR-3); brief-or-pay-the-price: #719, #721 and #724 were split into "new files only" and a second phase sent by message after the blocking ticket merged

### A Subagent merges a render-changing task without running the build and its tests

- **Count:** 2 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** test-runner: test:build, quick win (Implementer profile line) or architectural (`drive worktree done` runs the build lane)
- **Status:** proposed
- **Evidence:** ai-attention-span-pool: #711 merged on `npm run verify` alone; pre-push failed on `tests/post-build/episode-text/ai-attention-span.de.json` and cost one fix task; brief-or-pay-the-price: #719 and #720 merged on `verify` alone, the Integration push failed twice on `tests/post-build/episode-text.build.test.ts` and #720 hand-edited the snapshots (fix-episode-text ab251ac2e); the shared brief's rule 3 was changed mid-run; brief-or-pay-the-price: offered as QW-1 and AR-1 on the Fortify page, Operator skipped the picks (2026-11-18)

### A Subagent skips an acceptance criterion and the report passes the shape check

- **Count:** 3 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** none deterministic yet: Implementer profile line, quick win; new test for a report parser called by `worktree done`, architectural
- **Status:** proposed
- **Evidence:** ai-attention-span-pool: #712 reported visual-check as not done under Not verified and merged; the Orchestrator dispatched it separately; ai-gives-you-more-work-pool: the fix-review Subagent did not read the `test:build` output its ticket required, and the Orchestrator accepted that because pre-push runs build tests; brief-or-pay-the-price: #718 dropped the morph fade-out and the BRIEF F "new" label, #720 the matrix FLIP from chip letters, #721 the BRACE→Workflow flight and the picker placement, each reported under Trade-offs and merged; the Operator or a review checkpoint found them (718-fix, #723, 721-review-fix); brief-or-pay-the-price: offered as AR-2 on the Fortify page, Operator skipped the picks (2026-11-18)

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

### A Subagent's tracer ticket breaks FE-012 patterns and review fixes them after later tickets copied them

- **Count:** 1 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** adr-checker: archgate, new rules in FE-012 generalising the per-Explorable `client-boundary.test.ts` and `parts-boundary.test.ts`, architectural
- **Status:** proposed
- **Evidence:** brief-or-pay-the-price: review fixes for #716 (memoised parts §4.2, locale and words duplication) and #721 (client received both locales §1.2, dispatch into parts §4.1, controls registry §4.4); #720 and #723 built on the pattern first; brief-or-pay-the-price: offered as AR-4 on the Fortify page, Operator skipped the picks (2026-11-18)

### A new Explorable's toolbar is hand-built instead of the shared toggle bar the sibling Explorables use

- **Count:** 1 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** adr-checker: archgate, new FE-012 rule that a `*toolbar*.client.tsx` imports `shared/components/ui/toggle-group`, quick win
- **Status:** proposed
- **Evidence:** brief-or-pay-the-price: UI feedback round 1, Han: "toolbar should be a toogle bar like the other explorables"; rebuilt on `ToggleGroup` in ui-feedback-1 (a2d9f0a56); brief-or-pay-the-price: offered as QW-3 on the Fortify page, Operator skipped the picks (2026-11-18)

### An Explorable's rows change height between tabs and no check measures layout

- **Count:** 1 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** test-runner: test:slow with a Playwright case asserting equal row tops across tabs and locales, architectural (needs Han to accept a browser lane, AGENTS.md says none exists)
- **Status:** proposed
- **Evidence:** brief-or-pay-the-price: UI feedback round 1, Han saw the jump; fixed with a fixed chip box in ui-feedback-1 and checked by hand in Chrome at 1512×804 (Q77, "No test now"); brief-or-pay-the-price: offered as AR-3 on the Fortify page, Operator skipped the picks (2026-11-18)

### The site has no cursor pointer rule after Tailwind v4 and nothing guards the one added

- **Count:** 1 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** test-runner: test, a case in `tests/boundaries/global-stylesheet.test.ts`, quick win
- **Status:** proposed
- **Evidence:** brief-or-pay-the-price: Han asked for `cursor: pointer` on all clickable elements; `src/app/globals.css` got the rule in a2d9f0a56, no test pins it; brief-or-pay-the-price: offered as QW-2 on the Fortify page, Operator skipped the picks (2026-11-18)

### A glossary entry masks a word too general to own

- **Count:** 1 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** test-runner: test over `GLOSSARY.md` headings against a denylist of general words, quick win; Architect profile line
- **Status:** proposed
- **Evidence:** brief-or-pay-the-price: PR #732 review, Han: "some of glosssary entry are masking very general terms. remove them."; Mirror, Cell and Annotation removed; brief-or-pay-the-price: offered as QW-4 on the Fortify page, Operator skipped the picks (2026-11-18)

### A ticket conflicts with a binding ADR and the conflict surfaces only in the Subagent's report

- **Count:** 1 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** check: new `check:tickets` that fails a ticket body with no ADRs line, quick win (the content check stays review)
- **Status:** proposed
- **Evidence:** brief-or-pay-the-price: #716 asked for one `i18n: { en, de }` file while FE-012 §1 required a pair per locale; found in the tracer's report, Han chose to amend FE-012 (fe012-amend 936123831); brief-or-pay-the-price: offered as QW-5 on the Fortify page, Operator skipped the picks (2026-11-18)

### The grill frames the domain by a symmetry, a single example or a hard-coded instance

- **Count:** 1 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** none deterministic yet: Architect profile line, quick win
- **Status:** proposed
- **Evidence:** brief-or-pay-the-price: three grill corrections (PRICE/BRIEF vs stages/BRACE symmetry, stages not agnostic, the summer party as the frame)
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

### A glossary term is coined for what plain words already say

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** none deterministic yet: a line in the Define step of the drive skill that a new term needs a sentence the plain words cannot carry, quick win
- **Status:** proposed
- **Evidence:** drive-handoff: the Operator removed the glossary terms Run terms, Interrupt and Notify adapter from #746; Decision record 0028 uses plain words

### A learnings ticket's brief names no evidence source, so its Subagent credits every line to the current Workflow

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** test-runner: test that the brief template in `dispatch.md` carries an "Evidence from" line, quick win
- **Status:** proposed
- **Evidence:** drive-handoff: #745's brief gave no Workflow records, every Evidence line went to drive-handoff, and the Orchestrator corrected `learnings.md` itself (d81199f95), which fortify.md reserves for a Subagent

### A ticket that documents code is dispatched before that code merges

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** check: new dispatch check that refuses a ticket declaring `Describes: <ticket>` while that ticket is unmerged, architectural; or a dispatch.md rule, quick win
- **Status:** proposed
- **Evidence:** drive-handoff: #744 ran in parallel with #741 and wrote `drive worktree sync` from the ticket, not the CLI; the Orchestrator fixed it inline (76f36928f); `dispatch.md` dispatches "the moment its last blocker is merged" but nothing makes a doc ticket blocked by the code it describes

### The PR watch counts the Orchestrator's own reply as a new comment

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** test-runner: test, `skills/drive/scripts/pr-watch.pure.test.ts`
- **Status:** fixed 64b272bda
- **Evidence:** drive-handoff: the watch woke on the Orchestrator's reply (same GitHub account as the Operator); #741 skips comments that start with `<!-- drive -->`

### A CLI change is dogfooded from a checkout older than the change

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** none deterministic yet: a line in SKILL.md to run the CLI from the Integration worktree, quick win
- **Status:** proposed
- **Evidence:** drive-handoff: the first `drive pr watch 768` ran from the main checkout, whose CLI predates #741, and failed with "unknown group 'pr'"

### `drive worktree done` refuses over pids that belong to other sessions or have exited

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** test-runner: test, a case in `skills/drive/scripts/worktree-process.pure.test.ts` for stale and foreign pids, quick win
- **Status:** proposed
- **Evidence:** drive-handoff: #744 and the review fix were refused over pids that were another session's or already gone; the first left its worktree on disk until cleanup; `--kill` exists since 2026-11-17 and covers only live pids this shell may stop

### A commit hook times out two unrelated tests while a Subagent runs in parallel

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** test-runner: test, the load-scaled timeout in `vitest.config.mts`, quick win
- **Status:** proposed
- **Evidence:** drive-handoff: the test stage took 221 s under parallel load and failed two unrelated tests; the retry passed; `vitest.config.mts` already scales the timeout to the measured load, so it is a gap in that measure, not a missing one

### The notify port's push notification reaches only the terminal

- **Count:** 1 (last: 2026-11-18, drive-handoff)
- **Enforcer:** test-runner: new `drive notify` command whose test fails when the adapter reports no delivery, architectural
- **Status:** ticket https://github.com/hancrafted/content-library/issues/772
- **Evidence:** drive-handoff: #768 was ready and the Operator was notified, but Remote Control was off, so no phone push; the Binding's `notify` port (`docs/drive/binding.yml`) names an adapter and checks nothing
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

- **Count:** 3 (last: 2026-11-18, brief-or-pay-the-price)
- **Enforcer:** none deterministic yet: Fortify runs from the base branch after the merge and its picks are optional (Decision record 0028), architectural
- **Status:** proposed
- **Evidence:** ai-attention-span-pool, ai-gives-you-more-work-pool, onboard-ai-every-time-event-look: the Operator skipped the Fortify picks on all three Workflows ("skip fortify and repeat the same for the \"ai-gives-you-more-work\" episode"); the entries above stay unpicked at count 1; enablement-vs-agentic-engineering: "skipp fortify" (2026-11-18), its seven entries stay proposed; brief-or-pay-the-price: "skip fority and record qw and ar to learndings.md" (2026-11-18), its picks recorded as proposed

### Parallel Workflows append to learnings.md at the same spot and their PRs conflict with each other

- **Count:** 1 (last: 2026-11-18, drive-learnings-consolidate)
- **Enforcer:** none deterministic yet: one file per entry (e.g. `docs/drive/learnings/<slug>.md`) or a `merge=union` gitattribute on `docs/drive/learnings.md`, architectural; or Fortify rebases on main right before opening its PR, quick win
- **Status:** proposed
- **Evidence:** drive-learnings-consolidate: #774, #776 and #777 each appended failure modes after the last entry and corrections before the last line, so each conflicted with main and the others; merged by hand into one PR, and the "Operator skips Fortify" count was raised from 1 to 3 across them

## Corrections

- 2026-11-17 drive: The Operator stopped `wt:new -- decisions/drive` and asked "are we starting to implement? or is this prep work? are we already on a new integration branch?". The Orchestrator had started a step without saying which DRIVE phase it was in or what branch state would follow. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked "can this session run until end or does it require a human?" and asked for a guide to reviewing the PR. The Orchestrator had not stated the Operator's decision points, or how to review, up front. → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-17 drive: The Operator asked to resume automatically after a quota reset. There is no built-in recovery, so the Orchestrator added a session-only watchdog (a cron job that dies with the session). → Workflow progress lives only in the session, so a quota reset ends it
- 2026-11-17 ai-attention-span-pool: skip fortify and repeat the same for the "ai-gives-you-more-work" episode. also apply the same transition as with the attention episode → The Operator skips Fortify, so corrections and options never reach a decision
- 2026-11-18 brief-or-pay-the-price (grill): The PRICE/BRIEF ↔ stages/BRACE symmetry was wrong: PRICE is a problem set that BRIEF solves; stages are a process and BRACE its principles. → The grill frames the domain by a symmetry, a single example or a hard-coded instance
- 2026-11-18 brief-or-pay-the-price (grill): Stages are agnostic: DRIVE is one scenario, not hard-coded. → The grill frames the domain by a symmetry, a single example or a hard-coded instance
- 2026-11-18 brief-or-pay-the-price (grill): The summer party is a use case only, not the frame of the definitions. → The grill frames the domain by a symmetry, a single example or a hard-coded instance
- 2026-11-18 brief-or-pay-the-price (PR #732 review): "remove" on the Mirror, Cell and Annotation glossary entries: "some of glosssary entry are masking very general terms. remove them." → A glossary entry masks a word too general to own
- 2026-11-18 brief-or-pay-the-price (UI feedback round 1): "toolbar should be a toogle bar like the other explorables and in one line on laptop" — the implementation built its own toolbar instead of the sibling Explorables' pill toggle bar. → A new Explorable's toolbar is hand-built instead of the shared toggle bar the sibling Explorables use
- 2026-11-18 brief-or-pay-the-price (UI feedback round 1): "make sure that there is 0 ui jumping when switching between the 5 acronyms, which is the case right now" — row heights changed between definition tabs; no check caught it. → An Explorable's rows change height between tabs and no check measures layout
- 2026-11-18 brief-or-pay-the-price (UI feedback round 1): "in gernal all clickable elements should have cusror:pointer" — the site had no pointer rule after Tailwind v4. → The site has no cursor pointer rule after Tailwind v4 and nothing guards the one added
- 2026-11-18 enablement-vs-agentic-engineering: Grill round 1 ignored docs/agents/grilling-format.md (opening, buckets, wh-headlines, examples, numbering). → A /drive grill round is written without reading `docs/agents/grilling-format.md`
- 2026-11-18 enablement-vs-agentic-engineering: Fortify: grilling-format buckets are software-only (contract/architecture/workflow); knowledge-work grills need their own buckets, e.g. information architecture. → The grilling-format buckets have no home for knowledge-work questions such as information architecture
- 2026-11-18 enablement-vs-agentic-engineering: Review page round 1 was too low fidelity for visual Slides; Han asked for high-fidelity visualizations (Claude Desktop image, repo diagram). → A Reason page whose items are visual Slides starts at the `diagram` rung
- 2026-11-18 enablement-vs-agentic-engineering: Han had to ask twice for an Opus subagent for /to-review ("use an opus subagent to do the /to-review"; "use opus subagent for it"). → A decision page of the wrong model tier fails layout or rendering
- 2026-11-18 enablement-vs-agentic-engineering: PR #761 merged by Han before /code-review ran (Verify review skipped). → The Integration PR can be merged before `/code-review` has run on it
- 2026-11-18 enablement-vs-agentic-engineering: The detached dev server start (`npx next dev` in background) exited 1 with "Errors: 1" and no message; a foreground start worked. → A detached dev server start exits without a message
- 2026-11-18 enablement-vs-agentic-engineering: slide 3 [Image #4] this si the curernt desktop showing my project. on top left we have projects, meetings, artifacts, schedule. on right we have instrcutions, memory and context. create the graphic in the center and show the content it left and right → A Subagent draws a real product from imagination, and the Operator supplies screenshots a round later
- 2026-11-18 onboard-ai-every-time-event-look: i can be sure that the workflow can run until end so that not mid run the agent ask me to resolve a question or pr → The Orchestrator starts a step without naming its DRIVE phase, the branch state that follows, or the Operator's decision points
- 2026-11-18 brief-or-pay-the-price: The Operator skipped the Fortify picks: "skip fority and record qw and ar to learndings.md". → The Operator skips Fortify, so corrections and options never reach a decision
- 2026-11-18 drive-handoff: "remove" on the glossary entries Run terms, Interrupt and Notify adapter (Operator, #746 review) → A glossary term is coined for what plain words already say
- 2026-11-18 drive-handoff: the #745 brief named no evidence source, so its Subagent credited every Evidence line to this Workflow; the Orchestrator then edited learnings.md itself (d81199f95), which fortify.md reserves for a Subagent (Orchestrator's own) → A learnings ticket's brief names no evidence source, so its Subagent credits every line to the current Workflow
- 2026-11-18 drive-handoff: #744 (skill text describing the #741 CLI) was dispatched in parallel with #741, so it documented the ticket, not the code; `drive worktree sync` without `--base` was wrong; the Orchestrator fixed it inline (76f36928f) (Orchestrator's own) → A ticket that documents code is dispatched before that code merges
- 2026-11-18 drive-handoff: the Decision PR watch counted the Orchestrator's own reply (same GitHub account) and woke early; fixed by the `<!-- drive -->` marker in #741/#744 (Orchestrator's own) → The PR watch counts the Orchestrator's own reply as a new comment
- 2026-11-18 drive-handoff: the first `drive pr watch 768` ran from the main checkout, whose CLI predates #741, and failed with "unknown group 'pr'" (Orchestrator's own) → A CLI change is dogfooded from a checkout older than the change
- 2026-11-18 drive-handoff: `drive worktree done` refused to remove a worktree over pids that belonged to other sessions (#744) or had already exited (review fix); the first left the worktree on disk (Subagents, twice) → `drive worktree done` refuses over pids that belong to other sessions or have exited
- 2026-11-18 drive-handoff: one commit hook failed on two unrelated test timeouts while a Subagent ran in parallel (test stage 221 s); the retry passed (Orchestrator's own) → A commit hook times out two unrelated tests while a Subagent runs in parallel
- 2026-11-18 drive-handoff: the notify port's push notification reached only the terminal; Remote Control was off, so no phone push (gap) → The notify port's push notification reaches only the terminal
- 2026-11-18 event-copy-derivation: list round 1 questions → A grill round's questions are pointed to, not stated where the Operator reads
- 2026-11-18 drive-learnings-consolidate: "774,776 and 777 are pr with learndings updates of drive. they have conflices and will cause conflicts of each other." → Parallel Workflows append to learnings.md at the same spot and their PRs conflict with each other
