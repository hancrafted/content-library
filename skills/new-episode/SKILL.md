---
name: new-episode
description: Orchestrate a new Episode from an approved Brief to an implemented Episode served locally, with a draft PR of what needs Han.
---

# New Episode

You are the **orchestrator**: one Claude Code session that runs an Episode's per-run pipeline as a todo list, running each agent a job names as a subagent or, where its `session` says so, in this session. Every artifact sits in the staging folder `docs/episodes/<slug>/`; its shape is governed by markdown-harness, its agreement with the other files by `tests/docs/episode-staging.test.ts`, its meaning by a reviewer. Terms are in `GLOSSARY.md` under _Episode production_; the staging model is design-ADR `docs/adr/0004-episode-content-is-staged-then-promoted.md`.

Paths below are relative to the repo root, except `references/` and `assets/`, which sit in this skill's folder. The sample Episode in `assets/sample-episode/` shows every staging file in a governed, finished form; read a file there before writing its first real counterpart.

## Steps

### 1. Open the Episode branch

Settle the `<slug>` (the working title in kebab case) with Han, then run `npm run wt:new -- episode/<slug>` and work in that worktree. This branch is the Episode's **integration branch** for the whole run and carries its one draft PR until Promotion.

Then open the Run in the [event log](#the-event-log): `npm run episode:run -- <slug> begin-run --model <the model you run on>`. It creates the staging folder `docs/episodes/<slug>/` when absent, writes the Run's `start-run` line (harness, run id, branch and template commit included) and the active-run marker.

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

Run every job the status script prints as `ready` by [the job loop](#the-job-loop); jobs that are ready together run in parallel as background subagents, each job with `isolation: worktree` in its own worktree. A gate job prints `gate` once its draft is logged, until its output is approved; step 4's checks cover the Brief and pipeline gates. After each job's run-log entry and its closing `end` line, run the script again for the next ready jobs. A blocked job blocks every job that `needs` it, directly or through another job. A job that `wants` it waits for it, then runs anyway: tell its implementor which wanted jobs blocked.

`write-voice-script` has no Gate: `write-spec` follows it and writes the Spec, `spec/spec.html`, the one page Han reviews the design and the words on. It ends at the Spec Gate, run by [`references/write-spec.md`](references/write-spec.md#the-spec-gate): per review round, stop after the `Gate: draft spec-<n>` commit and tell Han to open the Spec with `npm run episode:spec -- <slug>`, tick the Options he wants and save; lock every Slide with one pick and redesign the rest in a new Attempt, until every Slide has one pick and Han approves with `approve.ts` in the `Gate: approved spec` commit, which also deletes `dossier.md`. From then on the Spec is the Episode's only source. The Build stage then runs `implement-episode-init`, which writes one placement marker per Section, and the `implement-section-<section-slug>` jobs in parallel, each building its Section at its marker. Each Build job's agent starts `next dev` detached on the job's `port`, which the dashboard links for Han: a Section job's server lives while the job runs and stops before its worktree goes, and `implement-episode-init`'s runs on in the Episode's worktree, showing each Section once merged.

_Done when_ every todo is done or blocked, and each one has its run-log entry and a closed Job span.

### 6. Serve and open the PR

Run the `open-pr` job by [`references/open-pr.md`](references/open-pr.md), even when a branch blocked: the PR checklist is where Han learns about it.

Then end the Run: `npm run episode:run -- <slug> end-run ok --summary "<one line>"`. Han's feedback and Promotion follow; [Promotion archives the log](#promotion).

_Done when_ Han has the Episode's local link and the draft PR's URL, and the Run has its `end-run` line.

## The job loop

Each job runs its `agents` in order, inside spans you open and close with the [run commands](#the-event-log): a Job span, and inside it one Attempt span per attempt. The **implementor** writes the job's `outputs`; the **reviewer** judges them. Read the job's reference first: it holds the implementor's prompt, what the job is done when and, for a reviewer job, its `## Rubric`. A job with an `intent` states its task there instead, and its prompt is the `intent`.

A job with `isolation: worktree` works in a worktree of its own, so jobs running in parallel never fail each other's repo-wide checks (`mh check` and the staging test scan the whole repo):

1. Before its implementor, run `npm run wt:new -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. The `--` in the branch name is needed: git cannot create `episode/<slug>/<job id>` beside the branch `episode/<slug>`. Each worktree runs its own `npm ci`.
2. Its implementor and reviewer work only in that worktree, its checks run there, and its pass commit is made there.
3. On a pass, merge the job branch into `episode/<slug>` and run `mh` and `vitest` again there: a file can pass alone and fail beside its siblings, through a duplicate research ID or a cross-file check. A failure after the merge counts as a failed attempt of that job.
4. After the merge, or when the job is blocked, stop a Section job's dev server first, since `wt:done` deletes the worktree it serves: `kill $(cat <job worktree>/.scratch/dev-<port>.pid)`, or `kill $(lsof -ti tcp:<port>)` when the file is missing. Then run `npm run wt:done -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. It deletes a merged branch and keeps a blocked job's branch; the `Blocked:` note names that branch for Han.

A subagent never writes `run-log.md`: it returns the parts of its run-log entry, and you append them on `episode/<slug>` after the merge. Parallel branches that each appended to it would conflict at every merge. A subagent never writes a start, end or gate line either. A reviewer writes its Score lines (step 3), by the absolute path of the Episode's worktree you give it. Nobody writes `docs/episodes/runs.csv`: [`npm run episode:runs-csv`](#run-log-and-runs-csv) generates it.

Before the first agent of a job: `begin-job <job>` (a Job already `done` from an earlier Run is not begun again), then `begin-attempt <job>`, which prints the stem of the [spawn description](#the-event-log) to name every spawn by.

Every agent runs where its `session` says. `subagent`, the default, is spawned with the Agent tool, its `description` the [spawn description](#the-event-log), its `subagent_type` the agent's `agent` (general-purpose when omitted) and its `model` the agent's `model`, left out for `inherit`. A spawn the harness refuses (the concurrency limit) is logged as a typed agent span with raw `episode:log` (`start`, then `end` with `status: refused`); spawn it again when a slot frees. `orchestrator` runs in this session, because a subagent has no Agent tool: a skill that spawns subagents needs it, and so does a job that talks to Han. Its `model` goes to the subagents the skill spawns.

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

3. **Reviewer.** A **fresh** agent, never one that wrote the output, told to invoke every skill in its `skills` with the Skill tool. A reviewer with `session: orchestrator` runs in the session that implemented, so its skill supplies the fresh eyes: `code-review` judges through subagents that saw none of the writing. Its baseline is the markdown-harness intent of every rule, field and heading that governs the output: it runs `npx mh query <path>` on each markdown output itself. On top of that baseline come the lines under the job's `rubric`. It judges one line per intent and per rubric line, `pass` or `fail — <the line, verbatim> — <evidence>`, and marks anything only Han can judge `needs human — <what>`. On attempt 2 and later, the fresh reviewer judges only the previous attempt's failed lines, beside the checks: a new concern goes into Notes as `Needs human: <what>`, never as a fail, so a retry is never judged against moved goalposts. Its score is the whole report: a retry reviewer rescores every rubric line and intent, the passed ones included, so the latest Attempt's Scores state the full verdict. An objective defect (the output contradicts the Brief or the Sections, a wrong heading) is a `fail`, never `needs-human`; `needs-human` is for what only Han's taste can judge.

   **The reviewer's report is Score lines**, never a file. Give each reviewer subagent the Attempt's name (`<job>#<n>`) and the Episode worktree's absolute path. For every line it judges it runs, from that worktree, `npm run episode:run -- <slug> score <job>#<n> rubric pass|fail|needs-human --source agent:<job id>/reviewer --rubric "<the line, verbatim>" --body "<the evidence>"`. Its `body` holds the full report for that line; a `fail` always quotes the failed line in `rubric`. It then returns only `pass` or `fail`; read the Scores with `episode:query` only on `fail`. Re-judging after a retry appends new Scores, never edits. A reviewer with `session: orchestrator` logs its own Scores the same way.

4. **Retry.** Every rework wave is a new Attempt, a retry or an "align" wave that sends implementors back: `end-attempt <job> error` with the reviewer's or orchestrator's verdict as `--summary`, then `begin-attempt <job>` for the wave. On any failed line, run the implementor again with every failed line quoted verbatim, then the checks and a fresh reviewer again. A job gets `1 + retries` attempts. A job whose output lives outside git (an issue, a PR) is retried by updating what its earlier attempt made, never by creating a second one; its reference says how it finds that output.
5. **Retries run out.** `end-attempt <job> error` and `end-job <job> error`, and mark the todo and every todo downstream of it blocked. The run-log entry's Notes start `Blocked:` and quote the last failed lines; they go on the PR checklist.
6. **Pass.** `end-attempt <job> ok` and, after the merge, `end-job <job> ok`. Run `node skills/new-episode/scripts/approve.ts <output> --by process:markdown-harness` on each staging output, which appends the machine entry to its `verified` list with the clock's UTC time and never overwrites an entry; never type the entry (research files carry no gate), and commit through the `commit` skill with `Source: docs/episodes/<slug>/brief.md` and `Agent: <job id>` (see [agent marks](#agent-marks)), in the job's worktree when it has one, then merge it as above.
7. **Log.** On `episode/<slug>`, append the [run-log entry](#run-log-and-runs-csv). A `needs human` reviewer line goes into Notes as `Needs human: <what>`. Commit `events.jsonl` beside it, so the log's state travels with the draft PR.

A research question retrieval decided `reuse <path>` has no job: retrieval's run-log entry says which file answers it.

_Done when_ the job passed or is blocked, its outputs are committed, its Job span is closed, and its run-log entry is appended.

## Agent marks

Every agent write is marked, so gate diffs teach Han's style and nothing else. An unmarked commit is Han's; `agentOf` in `scripts/marks.pure.ts` reads the marks.

- **Commits:** an `Agent: <job id>` trailer on every commit an agent makes in the run, beside `Source:` (and `Gate:` on a gate commit). Han's own commits carry none.
- **Issue edits:** a job that edits a GitHub issue (none in the template) ends the body with one `Edited-by: <job id>` line, replaced when another job edits, and lists it under its run-log entry's `Output` as `Edited #<issue>`.

## The event log

Every Run appends to one log, `docs/episodes/<slug>/events.jsonl` ([design-ADR 0007](../../docs/adr/0007-pipeline-runs-are-logged-as-spans-in-append-only-jsonl.md)): spans (Run → Job → Attempt → agent, plus Gates under the Run) as a `start` and an `end` line each, Scores as `score` lines, and point facts as `event` lines on the span that made them: `skill.invoke`, `file.read`, `instructions.load` ([design-ADR-0010](../../docs/adr/0010-run-log-lines-are-a-typed-union-with-point-events.md), which also types every line's keys; `run-log-line.schema.pure.ts` is the contract). One writer appends to it; you drive it with the run commands, addressed by names (a job id, an attempt number, a gate name), never by span id. They read the clock, git and the sequence, resolve each parent and target from the log, and print what they did. Run them from the Episode's worktree root:

```sh
npm run episode:run -- <slug> <command> ...
```

| command                                                                                                 | does                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `begin-run --model <model>`                                                                             | writes the Run's `start-run` line and the active-run marker; refused while the current Run has no `end-run`                                                                                                                                                                                                                                                   |
| `end-run [status] [--summary s]`                                                                        | ends the Run, records the orchestrator's usage on it and clears the marker; `ok` is refused while a Job, Attempt, Gate or agent is open, `error` or `crashed` leaves them `crashed`                                                                                                                                                                           |
| `begin-job <job>`                                                                                       | opens the Job under the Run (an open one is reused); the id must be a job of `pipeline.yml`, the template's before the Episode has one                                                                                                                                                                                                                        |
| `end-job <job> [status] [--summary s]`                                                                  | ends the Job; refused while its Attempt is open. A Job whose `pipeline.yml` entry says `session: orchestrator` also gets, on an `attrs` line after its single end line, the orchestrator sessions' token usage between its start and end (the method `end-run` uses for the Run) and the skills invoked in that window, shown on that Job's row of `runs.csv` |
| `reuse <job>`                                                                                           | brings an earlier Run's `ok` Job over: writes a Job span with status `reused` in the current Run, linked to that span (`link_trace_id`, `link_span_id`); a second call changes nothing and says so; refused when no earlier Run has an `ok` span of the Job, or when this Run already has a span of it                                                        |
| `begin-attempt <job>`                                                                                   | opens the next Attempt (number and `retry_of` derived) and prints its spawn description                                                                                                                                                                                                                                                                       |
| `end-attempt <job> [status] [--summary s]`                                                              | ends the open Attempt                                                                                                                                                                                                                                                                                                                                         |
| `open-gate <job> "<name>"` / `close-gate "<name>" [status]`                                             | a Gate under the Run, named as its commit, `draft <name>`                                                                                                                                                                                                                                                                                                     |
| `score <target> <name> <value> [--source s] [--rubric r] [--body b] [--via chat\|commit] [--comment c]` | a Score on `<job>` (the Job), `<job>#<n>` (an Attempt) or `gate:<name>`; `name` is `rubric`, `check` or `gate`                                                                                                                                                                                                                                                |
| `resume`                                                                                                | in a new session or after a crash, points the marker at the current Run and its open Job                                                                                                                                                                                                                                                                      |
| `archive`                                                                                               | copies the log to `.logs/new-episode/<slug>/<run id>.jsonl`                                                                                                                                                                                                                                                                                                   |

**Waiting on Han.** Inside a Job, each wait on his reply (a brief-grill question, any question in chat) is a Gate span: `open-gate <job> han-reply` when you ask, `close-gate han-reply` when he answers, so waiting time stays apart from working time.

`status` is `ok` (default), `error`, `refused`, `crashed` or `reused`. A command refuses what the log cannot support (no open Job, a second open Attempt) and says which; the writer refuses a malformed field and says which. Fix the call, never the log: a line is never edited, a correction is a new line.

`npm run episode:log -- <slug> '<event json>'` (or the JSON on stdin) appends one raw event, for what the commands do not cover: the typed agent span of a harness that gives none (any harness but Claude Code, a refused spawn, a skill that ran in this session), `"type":"agent","job":…,"attempt":…,"role":…,"source":"typed"` with `parent_span_id` read from `npm run episode:trace -- <slug>`, so a report never mixes measured and typed numbers.

**Spawn description.** Every Agent spawn's `description` is `<job id>#<attempt>/<role>`: `write-dossier#2/reviewer`, `implement-section-why-the-agent-forgets#1/implementor`, `implement-section-why-the-agent-forgets#1/reviewer`. Job and role are lowercase kebab-case, the attempt a positive integer. The Claude Code adapter reads it to attribute the agent to its Job, Attempt and role; it still parses the `/#<n>` suffix a log written before Build ran one Job per Section carries.

**The Claude Code adapter** adds, per subagent, what only Claude Code knows: launch and end times, the model asked for and the model that ran, tokens, the prompt, the transcript path, and `request_shape` (`background` or not). A parsed agent nests under the open Attempt of its job and number (Run → Job → Attempt → agent), so `begin-attempt` before spawning; with no such Attempt it nests under its Job while open, else under the Run. A skill-spawned agent nests under the one open Job, or under the Run when none or several are open. SubagentStart fires before Claude Code writes `meta.json`, so a start is filed provisionally (usually `skill-spawned`); at SubagentStop the end line carries the identity, parent and name from `meta.json`, and the fold applies them over the start. A log written before that carries `skill-spawned` agents with no identity: after its Run has ended, `npm run episode:backfill-identity -- <log.jsonl>` lists the `attrs` lines that would fix it (a dry run), and `--write` appends them; a second run appends nothing. The adapter ends every agent `ok`, since Stop carries no error signal: a failure is the Attempt's `error` end line or a rubric Score. When the transcript did not yet exist at launch, the end line carries the prompt and launch time. It is registered on `SubagentStart` and `SubagentStop` in `.claude/settings.json`, and finds the Run by scanning `git worktree list` for the `.scratch/active-run` that lists the hook's session in `session_ids`: a start is logged only for the marker's current session, a stop (whose start is in the log) from any listed session. A lock timeout prints a stderr line and exits 1 (non-blocking); recover with `end-attempt <job> crashed` or `end-run crashed`. The requested model falls back to the agent type's frontmatter `model` when `meta.json` has none. On `PostToolUse` of the Skill tool (`claude-adapter.ts skill`) it appends a `skill.invoke` event, of the Read tool (`read`) a `file.read` with the repo-relative path (nothing for a file outside the checkout), and on `InstructionsLoaded` (`instructions`) an `instructions.load` naming the ADR a rule symlink resolves to: each on the subagent's agent span when the payload has an `agent_id`, else on the open Job the marker names; between Jobs, or for an agent whose start is not logged, it writes nothing, waits at most 2 s for the lock, and always exits 0. The log works without it; log agent spans by hand where it does not run.

**The active-run marker** `.scratch/active-run` (git-ignored) is the commands' own bookkeeping, never typed: `begin-run` writes it, `begin-job` and `end-job` move it, `end-run` removes it after recording on the Run the orchestrator's model and the usage it spent between `start-run` and `end-run`, summed over every session that drove the Run (`begin-run`'s and each `resume`'s). It names this session, so a second session in the worktree stays out of the log, and it says which Run is live: a span with no `end` line reads `running` only while the marker names its Run, and `crashed` otherwise (status, remind, trace and query all apply this per Run).

**Read it, never the raw file.**

| need                                              | command                                                     |
| ------------------------------------------------- | ----------------------------------------------------------- |
| what is running, crashed, refused, waiting on Han | `npm run episode:status -- <slug>`                          |
| the Run's span tree, or the subtree under a span  | `npm run episode:trace -- <slug> [span-id]`                 |
| anything else                                     | `npm run episode:query -- "<sql>"` ([columns](#query-runs)) |

## Run log and runs CSV

Every job run appends one entry to `docs/episodes/<slug>/run-log.md`, never editing an earlier one: `## <job id> · <ISO 8601 timestamp>` (the job's `end` line's time), then the h3s `Inputs`, `Output`, `Checks` and `Notes`. It holds what a writer can say: no durations, token counts or pass and fail rows, which the log holds. Before your first entry, run `npx mh query docs/episodes/<slug>/run-log.md` and follow every intent it prints, as an implementor does; the `run-log-body` rule holds each part's intent, and `assets/sample-episode/run-log.md` shows two entries. Write it for an agent reading the run cold, by `writing-for-agents`.

`docs/episodes/runs.csv` is a report generated from the run event logs, never written by hand: no subagent or orchestrator appends a row. After a run, and again after Promotion archives the log, run `npm run episode:runs-csv`. It regenerates the rows of every Run held by a live log (`docs/episodes/*/events.jsonl`) or archived log (`.logs/new-episode/*/*.jsonl`), one row per agent span (plus one `orchestrator` row per Job that ran in the orchestrator's session and has measured usage), and keeps the existing rows of Runs no log holds, so the CSV outlives Promotion and its history is never wiped.

```csv
run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,cache_read_tokens,at
```

- `run` is the Run's `run_id`; `episode` the slug; `agent` the span's role.
- `result` is `pass` for an `ok` span, `fail` when a failed rubric Score sits on it (or on its Attempt, for an implementor or any role ending in `implementor`), else the span's status (`error`, `refused`, `crashed`, `reused`).
- `failed_rubric` holds the failed rubric lines, joined with `; `; `duration_s` is the span's real duration and `tokens` its input plus output tokens (cache reads are not in it) and `cache_read_tokens` its cache-read input tokens; each is empty when the log holds none.

### Query runs

`npm run episode:query -- "<sql>" [log.jsonl|glob ...]` runs one SELECT or WITH over two in-memory tables across one or many logs (default: the live and archived logs above), printing one JSON object per row. Select only the columns you need: `gen_ai_input_messages` and score `body` hold whole prompts and reports.

- `spans`: `episode`, `trace_id` (one per Run), `span_id`, `parent_span_id`, `type` (`run`, `job`, `attempt`, `agent`, `gate`), `name`, `status` (`ok`, `error`, `refused`, `crashed`, `reused`, `running`), `start_t`, `end_t`, `duration_ms`, `summary`, `seq`, `job`, `attempt`, `role`, `ticket`, `retry_of`, `link_trace_id`, `link_span_id`, `harness`, `source`, `description`, `transcript_path`, `request_shape`, `run_id` and `template_sha` and `branch` (on the Run's row), and the `gen_ai.*` attributes with dots written as underscores: `gen_ai_operation_name`, `gen_ai_agent_name`, `gen_ai_request_model`, `gen_ai_response_model`, `gen_ai_input_messages`, `gen_ai_usage_input_tokens`, `gen_ai_usage_output_tokens`, `gen_ai_usage_cache_read_input_tokens`, `skills_invoked` (comma-separated: the skills the agent invoked, from its transcript; empty when none, null when unknown).
- `scores`: `episode`, `trace_id`, `span_id`, `t`, `seq`, `name` (`rubric`, `check`, `gate`), `value`, `source`, `rubric`, `body`, `via`, `comment`, `ticket`.

Tag any row with its Run by joining the Run's span on `trace_id`: `SELECT r.run_id, count(*) AS retries FROM spans a JOIN spans r ON r.trace_id = a.trace_id AND r.type = 'run' WHERE a.type = 'attempt' AND a.attempt > 1 GROUP BY r.run_id`.

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

Han's feedback, typed or dictated, arrives as `feedback/<NN>/feedback.md` (with a `generated: { by, at }` naming who wrote it) and lands in the Spec before the implementation. The loop ends when Han starts Promotion. Distil what this run taught into [`LEARNINGS.md`](LEARNINGS.md). Diff each pair of gate commits, the draft against Han's approval: every correction Han made twice becomes a proposed rubric line under `LEARNINGS.md` Lessons. Count failing rubric lines across Runs with `npm run episode:query -- "SELECT rubric, count(*) AS n FROM scores WHERE name = 'rubric' AND value = 'fail' GROUP BY rubric ORDER BY n DESC"`; a line failing in several Runs is a reference or rubric change.
