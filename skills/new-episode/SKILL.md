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

Then open the Run in the [event log](#the-event-log): the Run's `start-run` line names your harness and the model you run on, and the command computes the run id, the branch and the template commit. Keep the `span_id` it prints, the Run's span id.

_Done when_ the worktree exists, `git branch --show-current` prints `episode/<slug>`, and `docs/episodes/<slug>/events.jsonl` holds the Run's `start-run` line.

### 2. Brief

Run the `brief-grill` job by [`references/brief-grill.md`](references/brief-grill.md). When Han brings a Brief, accept it: validate it with the job's checks and its reviewer, and grill him only on their failed lines and on what reads `Not settled.`. Otherwise invoke the `brief-grill` skill. It is a human gate: stop the session after the `Gate: draft brief` commit and tell Han the Brief is his to edit and approve.

_Done when_ `node skills/new-episode/scripts/approve.ts docs/episodes/<slug>/brief.md` has appended Han's `verified` entry (`human:han`, at or after `generated.at`), committed by Han with `Gate: approved brief`.

### 3. Categorize the research

Run the template's `categorize-research` job by [the job loop](#the-job-loop): its `intent` is the implementor's prompt. It returns one research folder name per research question and adds any new category to `GLOSSARY.md`. Keep the names for the next step; save them to `.scratch/<slug>/research-folders.md` when the session may end before it. No gate: Han sees the names and the glossary diff at the pipeline gate.

_Done when_ every research question has a folder name and `npm run check:docs` is clean.

### 4. Tailor the pipeline

Run the `customize-pipeline` job by [`references/customize-pipeline.md`](references/customize-pipeline.md), passing it the folder names from step 3. It is a human gate: stop after the `Gate: draft pipeline` commit.

_Done when_ `docs/episodes/<slug>/pipeline.yml` has `status: approved`, committed by Han with `Gate: approved pipeline`.

### 5. Refuse or start

Start only when all of these hold; otherwise name each one that fails to Han and stop:

1. `brief.md` is approved: its `verified` list holds a `human:han` entry at or after `generated.at` (`npm run episode:status` reads the same rule; an edit after approval re-opens it).
2. `pipeline.yml` has the top-level `status: approved`.
3. `npm run check:docs` is clean.
4. `npx vitest run tests/docs/episode-staging.test.ts` passes. It checks the per-run pipeline's schema, one research job per research question, and that no approved Brief keeps a `Not settled.` section.

Then run `npm run episode:status -- <slug>` and write the todo list from its output: one todo per job that is not `done`, in its order. It reads each job's state from `pipeline.yml` and the latest job span per job id in `events.jsonl`, so the list never rests on memory. A per-run pipeline has no `foreach`: customize-pipeline expanded it into one job per research question.

_Done when_ the todo list holds every job the script does not print as `done`.

### 6. Run the jobs

Run every job the status script prints as `ready` by [the job loop](#the-job-loop); jobs that are ready together run in parallel as background subagents, each job with `isolation: worktree` in its own worktree. A gate job prints `gate` once its draft is logged, until its output's `status:` is `approved`; step 5's checks cover the Brief and pipeline gates. After each job's run-log entry and its closing `end` line, run the script again for the next ready jobs. A blocked job blocks every job that `needs` it, directly or through another job. A job that `wants` it waits for it, then runs anyway: tell its implementor which wanted jobs blocked.

A `gate: human` job that writes no staging file, `write-design-spec`, prints `gate` until its spec issue's sub-issues carry no `needs-triage` label (the script reads them with `gh`, and a failed read keeps the gate shut). After its run-log entry and the Gate span's opening, stop the session and tell Han each ticket's design answer is his to edit, and to relabel it `ready-for-agent` to approve it; on resume, name each ticket still `needs-triage` (`gh issue list --label needs-triage --state open`). Once the script prints the job `done`, rewrite every overruled `master:` and `motion:` into the Dossier by [`references/write-design-spec.md`](references/write-design-spec.md#the-orchestrator-after-the-gate), and log the job's `approved as drafted` or `edited` Score for each ticket (see [`write-design-spec.md`](references/write-design-spec.md#approved-as-drafted-or-edited)), before `implement-episode` starts.

_Done when_ every todo is done or blocked, and each one has its run-log entry and a closed Job span.

### 7. Serve and open the PR

Run the `open-pr` job by [`references/open-pr.md`](references/open-pr.md), even when a branch blocked: the PR checklist is where Han learns about it.

Then end the Run: `end-run` with status `ok`, and `npm run episode:run-state -- clear`. Han's feedback and Promotion follow; [Promotion archives the log](#promotion).

_Done when_ Han has the Episode's local link and the draft PR's URL, and the Run has its `end-run` line.

## The job loop

Each job runs its `agents` in order, inside spans you open and close with [`episode:log`](#the-event-log): a Job span, and inside it one Attempt span per attempt. The **implementor** writes the job's `outputs`; the **reviewer** judges them. Read the job's reference first: it holds the implementor's prompt, what the job is done when and, for a reviewer job, its `## Rubric`. A job with an `intent` states its task there instead, and its prompt is the `intent`.

A job with `isolation: worktree` works in a worktree of its own, so jobs running in parallel never fail each other's repo-wide checks (`mh check` and the staging test scan the whole repo):

1. Before its implementor, run `npm run wt:new -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. The `--` in the branch name is needed: git cannot create `episode/<slug>/<job id>` beside the branch `episode/<slug>`. Each worktree runs its own `npm ci`.
2. Its implementor and reviewer work only in that worktree, its checks run there, and its pass commit is made there.
3. On a pass, merge the job branch into `episode/<slug>` and run `mh` and `vitest` again there: a file can pass alone and fail beside its siblings, through a duplicate research ID or a cross-file check. A failure after the merge counts as a failed attempt of that job.
4. After the merge, or when the job is blocked, run `npm run wt:done -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. It deletes a merged branch and keeps a blocked job's branch; the `Blocked:` note names that branch for Han.

A subagent never writes `run-log.md`: it returns the parts of its run-log entry, and you append them on `episode/<slug>` after the merge. Parallel branches that each appended to it would conflict at every merge. A subagent never writes a start, end or gate line either. A reviewer writes its Score lines (step 3), by the absolute path of the Episode's worktree you give it. Nobody writes `docs/episodes/runs.csv`: [`npm run episode:runs-csv`](#run-log-and-runs-csv) generates it.

Before the first agent of a job: log the Job's `start` (a Job already `done` from an earlier Run is not started again), `episode:run-state -- set <slug> <job span id>`, and the Attempt's `start`. Name every spawn by the [description grammar](#the-event-log).

Every agent runs where its `session` says. `subagent`, the default, is spawned with the Agent tool, its `description` the [spawn description](#the-event-log), its `subagent_type` the agent's `agent` (general-purpose when omitted) and its `model` the agent's `model`, left out for `inherit`. A spawn the harness refuses (the concurrency limit) is logged as an agent span: `start`, then `end` with `status: refused` and `source: typed`; spawn it again when a slot frees. `orchestrator` runs in this session, because a subagent has no Agent tool: a skill that spawns subagents needs it, and so does a job that talks to Han. Its `model` goes to the subagents the skill spawns.

1. **Implementor.** Its prompt opens with the Brief's `Learning goal` and `Actionables`, quoted, because every artifact is written backwards from them. Then tell it to invoke every skill in its `skills` with the Skill tool, never to read the `SKILL.md`: invoking loads the skill's own references and rules. Then point it at the job's reference or `intent`, every path in `references`, the staging folder, its worktree when the job has one, each job it `wants` that blocked, and on a retry the failed lines, quoted verbatim. Point, never paste: the agent reads the files.

   A skill that spawns subagents per ticket (`implement-spec`) takes the job's `ticket` block: pass its `agent` as the `subagent_type` of each ticket subagent, tell each to invoke every skill in `ticket.skills` with the Skill tool, and tell the skill to describe each ticket subagent `<job id>#<attempt>/ticket-implementor/#<ticket>` (reviewers `…/reviewer/#<ticket>`). A subagent whose description does not parse is still logged, as role `skill-spawned` under the Job span you set in the marker. Name `ticket.skills` in the prompt you give the orchestrator-session skill, since its subagents never see `pipeline.yml`. When the job's `before` lists `mh-query`, tell it: before writing each markdown path in `outputs`, run `npx mh query <path>` on it as written, a `*` included, and follow every intent it prints as an instruction. The query's answer is read, never saved.

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
   | `visual-check` | DOM numbers per Slide in both themes, by [`references/implement-episode.md`](references/implement-episode.md#visual-check)                                                                                                                                      |

   A failure counts as a failed attempt; its output lines are the failed lines. Log each check's result as a Score on the Attempt span: `name: check`, `value: pass` or `fail`, `source: check:<name>`, and the failing output as `body`.

3. **Reviewer.** A **fresh** agent, never one that wrote the output, told to invoke every skill in its `skills` with the Skill tool. A reviewer with `session: orchestrator` runs in the session that implemented, so its skill supplies the fresh eyes: `code-review` judges through subagents that saw none of the writing. Its baseline is the markdown-harness intent of every rule, field and heading that governs the output: it runs `npx mh query <path>` on each markdown output itself. On top of that baseline come the lines under the job's `rubric`. It judges one line per intent and per rubric line, `pass` or `fail — <the line, verbatim> — <evidence>`, and marks anything only Han can judge `needs human — <what>`. On attempt 2 and later, the fresh reviewer judges only the previous attempt's failed lines, beside the checks: a new concern goes into Notes as `Needs human: <what>`, never as a fail, so a retry is never judged against moved goalposts.

   **The reviewer's report is Score lines**, never a file. Give each reviewer subagent the Attempt's span id and the Episode worktree's absolute path. For every line it judges it runs, from that worktree, `npm run episode:log -- <slug>` with the event on stdin: `{"kind":"score","span_id":"<attempt span id>","name":"rubric","value":"pass"|"fail"|"needs-human","rubric":"<the line, verbatim>","source":"agent:<job id>/reviewer","body":"<the evidence>"}`. Its `body` holds the full report for that line; a `fail` always quotes the failed line in `rubric`. It then returns only `pass` or `fail`; read the Scores with `episode:query` only on `fail`. Re-judging after a retry appends new Scores, never edits. A reviewer with `session: orchestrator` logs its own Scores the same way, and a per-ticket review (`code-review` in `implement-episode`) logs on the Attempt span with the ticket in `body`.

4. **Retry.** On any failed line, run the implementor again with every failed line quoted verbatim, then the checks and a fresh reviewer again. A job gets `1 + retries` attempts. A job whose output lives outside git (an issue, a PR) is retried by updating what its earlier attempt made, never by creating a second one; its reference says how it finds that output.
5. **Retries run out.** Close the Attempt and the Job with `status: error`, and mark the todo and every todo downstream of it blocked. The run-log entry's Notes start `Blocked:` and quote the last failed lines; they go on the PR checklist.
6. **Pass.** Close the Attempt and, after the merge, the Job with `status: ok`. Run `node skills/new-episode/scripts/approve.ts <output> --by process:markdown-harness` on each staging output, which appends the machine entry to its `verified` list with the clock's UTC time and never overwrites an entry; never type the entry (research files carry no gate), and commit through the `commit` skill with `Source: docs/episodes/<slug>/brief.md` and `Agent: <job id>` (see [agent marks](#agent-marks)), in the job's worktree when it has one, then merge it as above.
7. **Log.** On `episode/<slug>`, append the [run-log entry](#run-log-and-runs-csv), listing each ticket the job edited (see [agent marks](#agent-marks)). A `needs human` reviewer line goes into Notes as `Needs human: <what>`. Commit `events.jsonl` beside it, so the log's state travels with the draft PR.

A **reused** research job (retrieval decided `reuse <path>`) runs no agent: log its Job `start` and `end` with `status: reused`, and its run-log entry says which file answers it. `episode:status` reads `reused` as done.

_Done when_ the job passed, is blocked or is reused, its outputs are committed, its Job span is closed, and its run-log entry is appended.

## Agent marks

Every agent write is marked, so gate diffs and ticket edit history teach Han's style and nothing else. An unmarked commit or ticket edit is Han's; `agentOf` in `scripts/marks.pure.ts` reads the marks.

- **Commits:** an `Agent: <job id>` trailer on every commit an agent makes in the run, beside `Source:` (and `Gate:` on a gate commit). Han's own commits carry none.
- **Ticket edits:** an `Edited-by: <job id>` line at the end of every issue body an agent writes or edits with `gh issue edit`. Keep one line at the end of the body; replace it when another job edits.
- **Footer rule:** `write-design-spec` ends every ticket body it edits with `Edited-by: write-design-spec`, and edits only the design answers and, in the spec issue, `## Visual language`. Han's edit at the gate carries no footer, which is how the job's `edited` Score is told from `approved as drafted`.
- **Run log:** each agent ticket edit is a line in the job's entry under `Output`: `Edited #<issue>`, with the time read from the log's `end` line for the job, never typed.

## The event log

Every Run appends to one log, `docs/episodes/<slug>/events.jsonl` ([design-ADR 0007](../../docs/adr/0007-pipeline-runs-are-logged-as-spans-in-append-only-jsonl.md)): spans (Run → Job → Attempt → agent, plus Gates under the Run) as a `start` and an `end` line each, and Scores as `score` lines. Only `npm run episode:log` writes it: it reads the clock, git and the sequence itself, so type no timestamp, id, run id or template commit. Run it from the Episode's worktree root:

```sh
npm run episode:log -- <slug> '<event json>'     # or the JSON on stdin
```

It prints the line it wrote. The `span_id` of a `start` line is what you pass later as `parent_span_id` (children) or `span_id` (its `end`, its Scores); keep the ids you need in your todo notes, or read them back with `npm run episode:trace -- <slug>`.

| event          | JSON                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Run starts     | `{"kind":"start-run","harness":"claude-code","gen_ai.request.model":"<the model you run on>"}`                                                                                        |
| Job starts     | `{"kind":"start","type":"job","name":"<job id>","job":"<job id>","parent_span_id":"<run span>"}`                                                                                      |
| Attempt starts | `{"kind":"start","type":"attempt","name":"<job id>#<n>","job":"<job id>","attempt":<n>,"parent_span_id":"<job span>"}`, on a retry `"retry_of":"<previous attempt span>"` too         |
| Gate opens     | `{"kind":"start","type":"gate","name":"draft <name>","job":"<job id>","parent_span_id":"<run span>"}`                                                                                 |
| span ends      | `{"kind":"end","span_id":"<span>","status":"ok"\|"error"\|"refused"\|"reused","summary":"<one line>"}`                                                                                |
| Run ends       | `{"kind":"end-run","span_id":"<run span>","status":"ok","summary":"<one line>"}`                                                                                                      |
| Score          | `{"kind":"score","span_id":"<span>","name":"rubric"\|"check"\|"gate","value":"pass"\|"fail"\|"approved","source":"…"}`, plus `rubric`, `body`, `via`, `comment` where this skill says |

The command refuses a malformed event and says which field; fix the field, never the log. A line is never edited: a correction is a new line. When a harness gives no span of its own (any harness but Claude Code, a refused spawn, a skill that ran in this session), log the agent span yourself with `"type":"agent","job":…,"attempt":…,"role":…,"source":"typed"`, so a report never mixes measured and typed numbers.

**Spawn description.** Every Agent spawn's `description` is `<job id>#<attempt>/<role>[/#<ticket>]`: `write-dossier#2/reviewer`, `implement-episode#1/ticket-implementor/#148`. Job and role are lowercase kebab-case, attempt and ticket positive integers. The Claude Code adapter reads it to attribute the agent to its Job, Attempt and role.

**The Claude Code adapter** adds, per subagent, what only Claude Code knows: launch and end times, the model asked for and the model that ran, tokens, the prompt, the transcript path, and `request_shape` (`background` or not). A parsed agent nests under the open Attempt of its job and number (Run → Job → Attempt → agent), so log the Attempt's `start` before spawning; a skill-spawned agent nests under the marker's Job. The adapter ends every agent `ok`, since Stop carries no error signal: a failure is the Attempt's `error` end line or a rubric Score. When the transcript did not yet exist at launch, the end line carries the prompt and launch time. It is registered on `SubagentStart` and `SubagentStop` in `.claude/settings.json`, and acts only for a session named in the active-run marker. The log works without it; log agent spans by hand where it does not run.

**The active-run marker** `.scratch/active-run` (git-ignored) is JSON `{log, session_id, trace_id, job_span_id}`: the log path, this session's id, the Run's trace id and the Job span that unparsed agents attach to. `npm run episode:run-state -- set <slug> [job-span-id]` writes it (the session id comes from `CLAUDE_CODE_SESSION_ID`; elsewhere set `SESSION_ID`), the span defaulting to the newest Job start; run it again at each Job start, because the marker names one Job and a stale one files agents under a finished Job; `set` refuses a Job span that is not in the log or has ended. `npm run episode:run-state -- clear` removes the marker after the `end-run` line, and first records the orchestrator session's model and summed usage on the Run span from its transcript. A second session in the worktree has another session id and stays out of the log. The marker also says which Run is live: a span with no `end` line reads `running` only while the marker names its Run, and `crashed` otherwise (status, remind, trace and query all apply this per Run).

**Read it, never the raw file.**

| need                                              | command                                                     |
| ------------------------------------------------- | ----------------------------------------------------------- |
| what is running, crashed, refused, waiting on Han | `npm run episode:status -- <slug>`                          |
| the Run's span tree, or the subtree under a span  | `npm run episode:trace -- <slug> [span-id]`                 |
| anything else                                     | `npm run episode:query -- "<sql>"` ([columns](#query-runs)) |

## Run log and runs CSV

Every job run appends one entry to `docs/episodes/<slug>/run-log.md`, never editing an earlier one: `## <job id> · <ISO 8601 timestamp>` (the job's `end` line's time), then the h3s `Inputs`, `Output`, `Checks` and `Notes`. It holds what a writer can say: no durations, token counts or pass and fail rows, which the log holds. Before your first entry, run `npx mh query docs/episodes/<slug>/run-log.md` and follow every intent it prints, as an implementor does; the `run-log-body` rule holds each part's intent, and `assets/sample-episode/run-log.md` shows two entries. Write it for an agent reading the run cold, by `writing-for-agents`.

`docs/episodes/runs.csv` is a report generated from the run event logs, never written by hand: no subagent or orchestrator appends a row. After a run, and again after Promotion archives the log, run `npm run episode:runs-csv`. It regenerates the rows of every Run held by a live log (`docs/episodes/*/events.jsonl`) or archived log (`.logs/new-episode/*/*.jsonl`), one row per agent span, and keeps the existing rows of Runs no log holds, so the CSV outlives Promotion and its history is never wiped.

```csv
run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,at
```

- `run` is the Run's `run_id`; `episode` the slug; `agent` the span's role.
- `result` is `pass` for an `ok` span, `fail` when a failed rubric Score sits on it (or on its Attempt, for an implementor or any role ending in `implementor`), else the span's status (`error`, `refused`, `crashed`, `reused`).
- `failed_rubric` holds the failed rubric lines, joined with `; `; `duration_s` is the span's real duration and `tokens` its input plus output tokens; both are empty when the log holds none.

### Query runs

`npm run episode:query -- "<sql>" [log.jsonl|glob ...]` runs one SELECT or WITH over two in-memory tables across one or many logs (default: the live and archived logs above), printing one JSON object per row. Select only the columns you need: `gen_ai_input_messages` and score `body` hold whole prompts and reports.

- `spans`: `episode`, `trace_id` (one per Run), `span_id`, `parent_span_id`, `type` (`run`, `job`, `attempt`, `agent`, `gate`), `name`, `status` (`ok`, `error`, `refused`, `crashed`, `reused`, `running`), `start_t`, `end_t`, `duration_ms`, `summary`, `seq`, `job`, `attempt`, `role`, `ticket`, `retry_of`, `harness`, `source`, `description`, `transcript_path`, `request_shape`, `run_id` and `template_sha` and `branch` (on the Run's row), and the `gen_ai.*` attributes with dots written as underscores: `gen_ai_operation_name`, `gen_ai_agent_name`, `gen_ai_request_model`, `gen_ai_response_model`, `gen_ai_input_messages`, `gen_ai_usage_input_tokens`, `gen_ai_usage_output_tokens`, `gen_ai_usage_cache_read_input_tokens`.
- `scores`: `episode`, `trace_id`, `span_id`, `t`, `seq`, `name` (`rubric`, `check`, `gate`), `value`, `source`, `rubric`, `body`, `via`, `comment`.

Tag any row with its Run by joining the Run's span on `trace_id`: `SELECT r.run_id, count(*) AS retries FROM spans a JOIN spans r ON r.trace_id = a.trace_id AND r.type = 'run' WHERE a.type = 'attempt' AND a.attempt > 1 GROUP BY r.run_id`.

## Resuming a run

In a new session, or after a compaction, never trust memory of the run: run `npm run episode:status -- <slug>` and rebuild the todo list from its output. Its `crashed` lines are spans that never ended in a Run that is no longer live, which includes a Run whose session died; `running` lines are agents of the live Run, so wait for them. After a crash, run `episode:run-state -- set <slug>` first so the resumed Run reads as live. A worktree `episode/<slug>--<job id>` whose job has no run-log entry is a crashed attempt: remove it with `wt:done` and its `--base`, delete its branch, close its open Attempt with `status: error` and a `summary` saying it crashed, and run the job again as the next attempt, numbered after `SELECT max(attempt) FROM spans WHERE type = 'attempt' AND job = '<job id>'` (`npm run episode:query`), with `retry_of` naming the crashed one. In a session that did not start the Run, `episode:run-state -- set <slug>` makes it the orchestrator for the adapter.

## Gate commits

Every commit goes through the `commit` skill. A gate is also a span: log the Gate's `start` when the `Gate: draft <name>` commit lands. When Han approves (in chat, or by committing the approval), log a Score on the Gate span with `"name":"gate","value":"approved","source":"human:han","via":"chat"|"commit"` and his words as `comment`; the Gate's `end` follows with `status: ok`. A change he asks for is a Score with `value: "changes"` and his words, and the Gate stays open. Never log a gate Score of Han's that he did not give. A gate commit adds a `Gate:` trailer beside `Source:` (`Gate: draft brief`, `Gate: approved pipeline`, `Gate: draft feedback-01`). The agent's draft is committed before Han edits it, so the pair of gate commits shows his edit as a diff: that diff is what later teaches agents his style. Only Han approves, with `approve.ts`, which appends his `verified` entry. Who commits sets the mark: the orchestrator's `Gate: draft <name>` commit carries `Agent: <job id>` beside `Gate:` and `Source:`, like every agent commit (see [agent marks](#agent-marks)); Han's approval commit carries no `Agent:` trailer, which is how a gate diff is told to be his. An approval commit the orchestrator makes at Han's word is still an agent commit and carries `Agent: <job id>`, while the approval entry in `verified` stays his.

After `Gate: approved pipeline`, the template is frozen for the run: `main` is not merged into the Episode branch again until `open-pr` is done. The pipeline's `template` field names the commit it was tailored from. A template change found during the run goes into `LEARNINGS.md` Lessons and is applied after the run.

## Promotion

When Han starts Promotion, and before the staging folder is deleted, run `npm run episode:run-state -- archive <slug>`. It copies the log to `.logs/new-episode/<slug>/<run id>.jsonl`, one file per Run, and prints the path. Commit it through the `commit` skill, then run `npm run episode:runs-csv` and commit `docs/episodes/runs.csv`: the CSV and `episode:query` read the archive after the staging folder is gone.

## After the run

Han's feedback, typed or dictated, arrives as `feedback/<NN>/feedback.md` (with a `generated: { by, at }` naming who wrote it) and lands in the Dossier before the implementation. The loop ends when Han starts Promotion. Distil what this run taught into [`LEARNINGS.md`](LEARNINGS.md). Diff each pair of gate commits, the draft against Han's approval: every correction Han made twice becomes a proposed rubric line under `LEARNINGS.md` Lessons. Count failing rubric lines across Runs with `npm run episode:query -- "SELECT rubric, count(*) AS n FROM scores WHERE name = 'rubric' AND value = 'fail' GROUP BY rubric ORDER BY n DESC"`; a line failing in several Runs is a reference or rubric change.
