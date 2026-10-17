---
name: new-episode
description: Run an Episode pipeline from an approved Brief to a served Episode and a draft PR. Use to start a Run, resume or continue one, when Han approves a gate, or when he says he saved Spec feedback.
---

# New Episode

You are the **orchestrator**: one Claude Code session that runs an Episode's per-run pipeline as a todo list, running each agent a job names as a subagent or, where its `session` says so, in this session. Every artifact sits in the staging folder `docs/episodes/<slug>/`; its shape is governed by markdown-harness, its agreement with the other files by `tests/docs/episode-staging.test.ts`, its meaning by a reviewer. Terms are in `GLOSSARY.md` under _Episode production_; the staging model is design-ADR `docs/adr/0004-episode-content-is-staged-then-promoted.md`.

Paths below are relative to the repo root, except `references/` and `assets/`, which sit in this skill's folder. The sample Episode in `assets/sample-episode/` shows every staging file in a governed, finished form; read a file there before writing its first real counterpart.

## Start here

Pick the entry by what Han gave you:

- **No slug:** start a new Run at [step 1](#1-open-the-episode-branch).
- **A slug with `docs/episodes/<slug>/events.jsonl`:** continue it. From that Episode's worktree run `npm run episode:run -- <slug> resume`, then `npm run episode:status -- <slug>`, then `reuse <job>` for each Job an earlier Run finished that you keep. Rebuild the todo list from the status output; [Resuming a run](#resuming-a-run) has the cases (crash, ended Run, orphaned job worktree). Han's "continue", "approve" or "I saved feedback" is this entry.

[`references/event-log.md`](references/event-log.md) holds the run command table, the active-run marker and the query schema; the steps below name the commands.

## Steps

### 1. Open the Episode branch

Settle the `<slug>` (the working title in kebab case) with Han, then run `npm run wt:new -- episode/<slug>` and work in that worktree. This branch is the Episode's **integration branch** for the whole run and carries its one draft PR until Promotion.

Then open the Run in the [event log](references/event-log.md): `npm run episode:run -- <slug> begin-run --model <the model you run on>`. It creates the staging folder `docs/episodes/<slug>/` when absent, writes the Run's `start-run` line (harness, run id, branch and template commit included) and the active-run marker.

_Done when_ the worktree exists, `git branch --show-current` prints `episode/<slug>`, and `docs/episodes/<slug>/events.jsonl` holds the Run's `start-run` line.

### 2. Brief

Run the `brief-grill` job by [`references/brief-grill.md`](references/brief-grill.md). When Han brings a Brief, accept it: validate it with the job's checks and its reviewer, and grill him only on their failed lines and on what reads `Not settled.`. Otherwise invoke the `brief-grill` skill. It is a human gate: stop the session after the `Gate: draft brief` commit and tell Han the Brief is his to edit and approve.

_Done when_ `node skills/new-episode/scripts/approve.ts docs/episodes/<slug>/brief.md` has appended Han's `verified` entry (`human:han`, at or after `generated.at`), committed by Han with `Gate: approved brief`.

### 3. Setup

Setup turns the approved Brief into the approved pipeline. Every job of `pipeline.yml` names its `stage`, one of the ordered `stages` ([design-ADR-0008](../../docs/adr/0008-pipeline-jobs-belong-to-stages.md)); Setup's jobs run by [the job loop](#the-job-loop), each when `npm run episode:status -- <slug>` prints it `ready`:

1. `scaffold-pipeline` by [`references/scaffold-pipeline.md`](references/scaffold-pipeline.md): copies the template to `docs/episodes/<slug>/pipeline.yml` as a draft, its `foreach` jobs unexpanded, so every job shows on the dashboard from here on.
2. `categorize-research`, whose `intent` is the implementor's prompt: one research folder name per research question, and any new category added to `GLOSSARY.md`. Keep the names for retrieval; save them to `.scratch/<slug>/research-folders.md` when the session may end before it.
3. `retrieval` by [`references/retrieval.md`](references/retrieval.md), beside `convert-references` by [`references/convert-references.md`](references/convert-references.md): retrieval decides reuse, refresh or new per question and lists the questions needing a job under `### Research jobs` in its run-log entry.
4. `customize-pipeline` by [`references/customize-pipeline.md`](references/customize-pipeline.md): expands `write-research` into one job per listed question and `implement-section` into one job per Section of the Brief's `## Slides`, and gives each `build` job its own free dev-server `port`. It is a human gate: stop after the `Gate: draft pipeline` commit.

_Done when_ `docs/episodes/<slug>/pipeline.yml` has `status: approved`, committed by Han with `Gate: approved pipeline`.

### 4. Refuse or start

Start only when all of these hold; otherwise name each one that fails to Han and stop:

1. `brief.md` is approved: its `verified` list holds a `human:han` entry at or after `generated.at` (`npm run episode:status` reads the same rule; an edit after approval re-opens it).
2. `pipeline.yml` has the top-level `status: approved`.
3. `npm run check:docs` is clean.
4. `npx vitest run tests/docs/episode-staging.test.ts` passes. It checks the pipeline's schema and stages, one research job per item under retrieval's `### Research jobs`, and that no approved Brief keeps a `Not settled.` section.

Then run `npm run episode:status -- <slug>` and write the todo list from its output: one todo per job that is not `done`, in its order. It reads each job's state from `pipeline.yml` and the latest job span per job id in `events.jsonl`, so the list never rests on memory. A `warn` line names a finished agent or orchestrator-session Job that did not invoke a skill its `skills` lists: tell it to, or note it in the Attempt's summary. An approved pipeline has no `foreach`: customize-pipeline expanded each into named jobs.

_Done when_ the todo list holds every job the script does not print as `done`.

### 5. Run the jobs

Run every job the status script prints as `ready` by [the job loop](#the-job-loop); jobs that are ready together run in parallel as background subagents, each job with `isolation: worktree` in its own worktree. Run at most 5 subagents at a time: spawn ready jobs in batches of 5, the next batch as slots free. A job without a gate runs straight through, with no confirmation asked. A gate job prints `gate` once its draft is logged, until its output is approved; step 4's checks cover the Brief and pipeline gates. After each job's run-log entry and its closing `end` line, run the script again for the next ready jobs. A blocked job blocks every job that `needs` it, directly or through another job. A job that `wants` it waits for it, then runs anyway: tell its implementor which wanted jobs blocked.

`write-voice-script` has no Gate: `write-spec` follows it and writes the Spec, `spec/spec.html`, the one page Han reviews the design and the words on. It ends at the Spec Gate, run by [`references/write-spec.md`](references/write-spec.md#the-spec-gate): per review round, stop after the `Gate: draft spec-<n>` commit and tell Han to open the Spec with `npm run episode:spec -- <slug>`, tick the Options he wants and save; lock every Slide with one pick and redesign the rest in a new Attempt, until every Slide has one pick and Han approves with `approve.ts` in the `Gate: approved spec` commit, which also deletes `dossier.md`. From then on the Spec is the Episode's only source. The Build stage then runs `implement-episode-init`, which writes one placement marker per Section, and the `implement-section-<section-slug>` jobs in parallel, each building its Section at its marker. Each Build job's agent starts `next dev` detached on the job's `port`, which the dashboard links for Han: a Section job's server lives while the job runs and stops before its worktree goes, and `implement-episode-init`'s runs on in the Episode's worktree, showing each Section once merged.

_Done when_ every todo is done or blocked, and each one has its run-log entry and a closed Job span.

### 6. Serve and open the PR

Run the `open-pr` job by [`references/open-pr.md`](references/open-pr.md), even when a branch blocked: the PR checklist is where Han learns about it.

Then end the Run: `npm run episode:run -- <slug> end-run ok --summary "<one line>"`. Han's feedback and Promotion follow; [Promotion archives the log](#promotion).

_Done when_ Han has the Episode's local link and the draft PR's URL, and the Run has its `end-run` line.

## The job loop

Each job runs its `agents` in order, inside spans you open and close with the [run commands](references/event-log.md): a Job span, and inside it one Attempt span per attempt. The **implementor** writes the job's `outputs`; the **reviewer** judges them. Read the job's reference first: it holds the implementor's prompt, what the job is done when and, for a reviewer job, its `## Rubric`. A job with an `intent` states its task there instead, and its prompt is the `intent`.

A job with `isolation: worktree` works in a worktree of its own, so jobs running in parallel never fail each other's repo-wide checks (`mh check` and the staging test scan the whole repo):

1. Before its implementor, run `npm run wt:new -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. The `--` in the branch name is needed: git cannot create `episode/<slug>/<job id>` beside the branch `episode/<slug>`. Each worktree runs its own `npm ci`.
2. Its implementor and reviewer work only in that worktree, its checks run there, and its pass commit is made there.
3. On a pass, merge the job branch into `episode/<slug>` and run `mh` and `vitest` again there: a file can pass alone and fail beside its siblings, through a duplicate research ID or a cross-file check. A failure after the merge counts as a failed attempt of that job.
4. After the merge, or when the job is blocked, stop a Section job's dev server first, since `wt:done` deletes the worktree it serves: `kill $(cat <job worktree>/.scratch/dev-<port>.pid)`, or `kill $(lsof -ti tcp:<port>)` when the file is missing. Then run `npm run wt:done -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. It deletes a merged branch and keeps a blocked job's branch; the `Blocked:` note names that branch for Han.

A subagent never writes `run-log.md`: it returns the parts of its run-log entry, and you append them on `episode/<slug>` after the merge. Parallel branches that each appended to it would conflict at every merge. A subagent never writes a start, end or gate line either. A reviewer writes its Score lines (step 3), by the absolute path of the Episode's worktree you give it. Nobody writes `docs/episodes/runs.csv`: [`npm run episode:runs-csv`](references/event-log.md#runs-csv) generates it.

Before the first agent of a job: `begin-job <job>` (a Job already `done` from an earlier Run is not begun again), then `begin-attempt <job>`, which prints the stem of the [spawn description](references/event-log.md#spawn-description) to name every spawn by.

Every agent runs where its `session` says. `subagent`, the default, is spawned with the Agent tool, its `description` the [spawn description](references/event-log.md#spawn-description), its `subagent_type` the agent's `agent` (general-purpose when omitted) and its `model` the agent's `model`, left out for `inherit`. A spawn the harness refuses (the concurrency limit) is logged as a typed agent span with raw `episode:log` (`start`, then `end` with `status: refused`); spawn it again when a slot frees. `orchestrator` runs in this session, because a subagent has no Agent tool: a skill that spawns subagents needs it, and so does a job that talks to Han. Its `model` goes to the subagents the skill spawns.

1. **Implementor.** Its prompt opens with the Brief's `Learning goal` and `Actionables`, quoted, because every artifact is written backwards from them. Then tell it to invoke every skill in its `skills` with the Skill tool, never to read the `SKILL.md`: invoking loads the skill's own references and rules. Then point it at the job's reference or `intent`, every path in `references`, the staging folder, its worktree when the job has one, its `port` when it has one, each job it `wants` that blocked, and on a retry the failed lines, quoted verbatim. Point, never paste: the agent reads the files.

   A subagent whose description does not parse is still logged, as role `skill-spawned`: under the Job when exactly one is open, else under the Run, never a guessed Job. When the job's `before` lists `mh-query`, tell it: before writing each markdown path in `outputs`, run `npx mh query <path>` on it as written, a `*` included, and follow every intent it prints as an instruction. The query's answer is read, never saved.

2. **Checks.** Run the job's `checks` in order, cheapest first. This table is the one list of check names and their commands; `src/lib/episode-pipeline.pure.ts` refuses any other name:

   | check          | command                                                                                                                                                                                                                                                         |
   | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `mh`           | `npm run check:docs`                                                                                                                                                                                                                                            |
   | `vitest`       | `npx vitest run tests/docs/episode-staging.test.ts`                                                                                                                                                                                                             |
   | `sources`      | `npm run check:sources -- <research.md…>`: every source URL of the job's research files; exit 1 only when one is `dead`, and `unverifiable` links go to the reviewer as `needs human`                                                                           |
   | `impeccable`   | with `npm run preview` serving `out/`, `DO_NOT_TRACK=1 npx --yes impeccable@4.5.2 detect --json http://localhost:4300/episode/<slug>` and the `/de/` URL: a rendered scan, limited to the rules `.impeccable/config.json` leaves on; exit 2 is a failed attempt |
   | `verify`       | `npm run verify`                                                                                                                                                                                                                                                |
   | `build`        | `npm run build`                                                                                                                                                                                                                                                 |
   | `test:build`   | `npm run test:build`                                                                                                                                                                                                                                            |
   | `visual-check` | DOM numbers per Slide in both themes, by [`references/implement-section.md`](references/implement-section.md#visual-check)                                                                                                                                      |

   A failure counts as a failed attempt; its output lines are the failed lines. Log each check's result as a Score on the Attempt: `score <job>#<n> check pass|fail --source check:<name> --body "<the failing output>"`.

3. **Reviewer.** A **fresh** agent, never one that wrote the output, told to invoke every skill in its `skills` with the Skill tool. A reviewer with `session: orchestrator` runs in the session that implemented, so its skill supplies the fresh eyes: `code-review` judges through subagents that saw none of the writing. Its baseline is the markdown-harness intent of every rule, field and heading that governs the output: it runs `npx mh query <path>` on each markdown output itself. On top of that baseline come the lines under the job's `rubric`. It judges one line per intent and per rubric line, `pass` or `fail — <the line, verbatim> — <evidence>`, and marks anything only Han can judge `needs human — <what>`. On attempt 2 and later, only the previous Attempt's failed lines can fail, beside the checks; the reviewer re-logs every other line as `pass`, so the latest Attempt's Scores state the full verdict. A new concern goes into Notes as `Needs human: <what>`, so a retry is never judged against moved goalposts. An objective defect (the output contradicts the Brief or the Sections, a wrong heading) is a `fail`, never `needs-human`; `needs-human` is for what only Han's taste can judge.

   **The reviewer's report is Score lines**, never a file. Give each reviewer subagent the Attempt's name (`<job>#<n>`) and the Episode worktree's absolute path. For every line it judges it runs, from that worktree, `npm run episode:run -- <slug> score <job>#<n> rubric pass|fail|needs-human --source agent:<job id>/reviewer --rubric "<the line, verbatim>" --body "<the evidence>"`. Its `body` holds the full report for that line; a `fail` always quotes the failed line in `rubric`. It then returns only `pass` or `fail`; read the Scores with `episode:query` only on `fail`. Re-judging after a retry appends new Scores, never edits. A reviewer with `session: orchestrator` logs its own Scores the same way.

4. **Retry.** Every rework wave is a new Attempt, a retry or an "align" wave that sends implementors back: `end-attempt <job> error` with the reviewer's or orchestrator's verdict as `--summary`, then `begin-attempt <job>` for the wave. On any failed line, run the implementor again with every failed line quoted verbatim, then the checks and a fresh reviewer again. A job gets `1 + retries` attempts. A job whose output lives outside git (an issue, a PR) is retried by updating what its earlier attempt made, never by creating a second one; its reference says how it finds that output.
5. **Retries run out.** `end-attempt <job> error` and `end-job <job> error`, and mark the todo and every todo downstream of it blocked. The run-log entry's Notes start `Blocked:` and quote the last failed lines; they go on the PR checklist.
6. **Pass.** `end-attempt <job> ok` and, after the merge, `end-job <job> ok`. Run `node skills/new-episode/scripts/approve.ts <output> --by process:markdown-harness --stamp <producer/model>` on each staging output (`<producer/model>` names the agent that wrote it, for example `claude-code/opus-5.5`), which writes `generated: { by, at }` and appends the machine entry to its `verified` list with the clock's UTC time and never overwrites an entry; never type `generated` or the entry (research files carry no gate), and commit through the `commit` skill with `Source: docs/episodes/<slug>/brief.md` and `Agent: <job id>` (see [agent marks](#agent-marks)), in the job's worktree when it has one, then merge it as above.
7. **Log.** On `episode/<slug>`, append the [run-log entry](#run-log). A `needs human` reviewer line goes into Notes as `Needs human: <what>`. Commit `events.jsonl` beside it, so the log's state travels with the draft PR.

A research question retrieval decided `reuse <path>` has no job: retrieval's run-log entry says which file answers it.

_Done when_ the job passed or is blocked, its outputs are committed, its Job span is closed, and its run-log entry is appended.

## Agent marks

Every agent write is marked, so gate diffs teach Han's style and nothing else. An unmarked commit is Han's; `agentOf` in `scripts/marks.pure.ts` reads the marks.

- **Commits:** an `Agent: <job id>` trailer on every commit an agent makes in the run, beside `Source:` (and `Gate:` on a gate commit). Han's own commits carry none.
- **Issue edits:** a job that edits a GitHub issue (none in the template) ends the body with one `Edited-by: <job id>` line, replaced when another job edits, and lists it under its run-log entry's `Output` as `Edited #<issue>`.

## Run log

Every job run appends one entry to `docs/episodes/<slug>/run-log.md`, never editing an earlier one: `## <job id> · <ISO 8601 timestamp>` (the job's `end` line's time), then the h3s `Inputs`, `Output`, `Checks` and `Notes`. It holds what a writer can say: no durations, token counts or pass and fail rows, which the log holds. Before your first entry, run `npx mh query docs/episodes/<slug>/run-log.md` and follow every intent it prints, as an implementor does; the `run-log-body` rule holds each part's intent, and `assets/sample-episode/run-log.md` shows two entries. Write it for an agent reading the run cold, by `writing-for-agents`. `docs/episodes/runs.csv` is generated, never written by hand: [`references/event-log.md#runs-csv`](references/event-log.md#runs-csv) has its columns.

## Resuming a run

In a new session, or after a compaction, never trust memory of the run: run `npm run episode:status -- <slug>` and rebuild the todo list from its output. It counts only the current Run (the live marker's, else the latest): a Job an earlier Run finished reads `ready` again until you run `reuse <job>`, which counts that earlier `ok` span in this Run (idempotent; run it for each Job you keep, never `begin-job` over finished work). Its `crashed` lines are spans that never ended in a Run that is no longer live, which includes a Run whose session died; `running` lines are agents of the live Run, so wait for them. After a crash, run `resume` first so the resumed Run reads as live; `begin-run` is refused while the Run has no `end-run`, so to abandon it instead run `end-run crashed`, which leaves its open spans `crashed`. `resume`, `begin-job`, `begin-attempt` and `open-gate` are refused on a Run that has ended: run `begin-run` for a new Run (Scores on ended spans stay allowed). To retry an Attempt, run `end-attempt <job> error` first: it ends the Attempt's still-open agents `crashed`, so none stays `running`; `end-attempt <job> ok` leaves open agents as they are, and `end-run ok` still refuses open agents. A worktree `episode/<slug>--<job id>` whose job has no run-log entry is a crashed attempt: remove it with `wt:done` and its `--base`, delete its branch, run `end-attempt <job> error --summary "crashed"` and then `begin-attempt <job>` again: the next number and `retry_of` follow from the log. In a session that did not start the Run, `resume` makes it the orchestrator for the adapter.

## Gate commits

Every commit goes through the `commit` skill. A gate is also a span, logged with these commands:

- `open-gate <job> "draft <name>"` when the `Gate: draft <name>` commit lands.
- `score "gate:draft <name>" gate approved --source human:han --via chat|commit --comment "<his words>"` when Han approves, in chat or by committing the approval.
- `close-gate "draft <name>"` after the approval Score.
- `score "gate:draft <name>" gate changes --source human:han --comment "<his words>"` for a change he asks for; the Gate stays open.

Log only a gate Score Han gave.

A gate commit adds a `Gate:` trailer beside `Source:` (`Gate: draft brief`, `Gate: approved pipeline`, `Gate: draft spec-1`, `Gate: draft feedback-01`). The agent's draft is committed before Han edits it, so the pair of gate commits shows his edit as a diff: that diff is what later teaches agents his style. Only Han approves, with `approve.ts`, which appends his `verified` entry.

Who commits sets the mark:

- The orchestrator's `Gate: draft <name>` commit carries `Agent: <job id>` beside `Gate:` and `Source:`, like every agent commit (see [agent marks](#agent-marks)).
- Han's approval commit carries no `Agent:` trailer, which is how a gate diff is told to be his.
- An approval commit the orchestrator makes at Han's word is still an agent commit and carries `Agent: <job id>`, while the approval entry in `verified` stays his.

After `Gate: approved pipeline`, the template is frozen for the run: `main` is not merged into the Episode branch again until `open-pr` is done. The pipeline's `template` field names the commit it was tailored from. A template change found during the run goes into `LEARNINGS.md` Lessons and is applied after the run.

## Promotion

When Han starts Promotion, and before the staging folder is deleted, run `npm run episode:run -- <slug> archive`. It copies the log to `.logs/new-episode/<slug>/<run id>.jsonl`, one file per Run, and prints the path. Commit it through the `commit` skill, then run `npm run episode:runs-csv` and commit `docs/episodes/runs.csv`: the CSV and `episode:query` read the archive after the staging folder is gone.

## After the run

Han's feedback, typed or dictated, arrives as `feedback/<NN>/feedback.md` (with a `generated: { by, at }` naming who wrote it); `npx mh query` on it prints the `feedback-body` intent its tags route by. An item keys its Slide by anchor: `top` the Title slide, a Section slug its section slide, `<section>--<slide>` a page Slide. Work each item by its tag: a `content` item, a Voice script change included, lands in the Slide's words in `spec/spec.html` first, in one commit, and then in the implementation; a `design` item lands in the picked Option first, its mock and build notes (for `top` or a section slide, the picked Title-slide Option's Title slide or that Section's section slide), in one commit, and then in the implementation; an `implementation` item goes to the code alone; a `practice` item to the recording. The Spec stays the source until Promotion, so the implementation never says what the Spec does not. The loop ends when Han starts Promotion. Distil what this run taught into [`LEARNINGS.md`](LEARNINGS.md). Diff each pair of gate commits, the draft against Han's approval: every correction Han made twice becomes a proposed rubric line under `LEARNINGS.md` Lessons. Count failing rubric lines across Runs with `npm run episode:query -- "SELECT rubric, count(*) AS n FROM scores WHERE name = 'rubric' AND value = 'fail' GROUP BY rubric ORDER BY n DESC"`; a line failing in several Runs is a reference or rubric change.
