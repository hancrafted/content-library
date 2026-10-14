---
name: new-episode
description: Orchestrate a new Episode from an approved Brief to an implemented Episode served locally, with a draft PR of what needs Han.
disable-model-invocation: true
---

# New Episode

You are the **orchestrator**: one Claude Code session that runs an Episode's per-run pipeline as a todo list, running each agent a job names as a subagent or, where its `session` says so, in this session. Every artifact sits in the staging folder `docs/episodes/<slug>/`; its shape is governed by markdown-harness, its agreement with the other files by `tests/docs/episode-staging.test.ts`, its meaning by a reviewer. Terms are in `GLOSSARY.md` under _Episode production_; the staging model is design-ADR `docs/adr/0004-episode-content-is-staged-then-promoted.md`.

Paths below are relative to the repo root, except `references/` and `assets/`, which sit in this skill's folder. The sample Episode in `assets/sample-episode/` shows every staging file in a governed, finished form; read a file there before writing its first real counterpart.

## Steps

### 1. Open the Episode branch

Settle the `<slug>` (the working title in kebab case) with Han, then run `npm run wt:new -- episode/<slug>` and work in that worktree. This branch is the Episode's **integration branch** for the whole run and carries its one draft PR until Promotion.

Note the **run id**: the ISO 8601 timestamp of this step. Every runs CSV row of the run carries it, the gate jobs' rows included.

_Done when_ the worktree exists, `git branch --show-current` prints `episode/<slug>`, and you hold the run id.

### 2. Brief

Run the `brief-grill` job by [`references/brief-grill.md`](references/brief-grill.md). When Han brings a Brief, accept it: validate it with the job's checks and its reviewer, and grill him only on their failed lines and on what reads `Not settled.`. Otherwise invoke the `brief-grill` skill. It is a human gate: stop the session after the `Gate: draft brief` commit and tell Han the Brief is his to edit and approve.

_Done when_ `node .agents/skills/new-episode/scripts/approve.ts docs/episodes/<slug>/brief.md` has appended Han's `verified` entry (`human:han`, at or after `generated.at`), committed by Han with `Gate: approved brief`.

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

Then run `npm run episode:status -- <slug>` and write the todo list from its output: one todo per job that is not `done`, in its order. It reads each job's state from `pipeline.yml` and the latest `run-log.md` entry per job id, so the list never rests on memory. A per-run pipeline has no `foreach`: customize-pipeline expanded it into one job per research question.

_Done when_ the todo list holds every job the script does not print as `done`.

### 6. Run the jobs

Run every job the status script prints as `ready` by [the job loop](#the-job-loop); jobs that are ready together run in parallel as background subagents, each job with `isolation: worktree` in its own worktree. A gate job prints `gate` once its draft is logged, until its output's `status:` is `approved`; step 5's checks cover the Brief and pipeline gates. After each job's run-log entry, run the script again for the next ready jobs. A blocked job blocks every job that `needs` it, directly or through another job. A job that `wants` it waits for it, then runs anyway: tell its implementor which wanted jobs blocked.

A `gate: human` job that writes no staging file, `write-design-spec`, prints `gate` until its spec issue's sub-issues carry no `needs-triage` label (the script reads them with `gh`, and a failed read keeps the gate shut). After its run-log entry, stop the session and tell Han each ticket's design answer is his to edit, and to relabel it `ready-for-agent` to approve it; on resume, name each ticket still `needs-triage` (`gh issue list --label needs-triage --state open`). Once the script prints the job `done`, rewrite every overruled `master:` and `motion:` into the Dossier by [`references/write-design-spec.md`](references/write-design-spec.md#the-orchestrator-after-the-gate), and write the job's `approved as drafted` or `edited` Metrics line for each ticket, before `implement-episode` starts.

_Done when_ every todo is done or blocked, and each one has its run-log entry.

### 7. Serve and open the PR

Run the `open-pr` job by [`references/open-pr.md`](references/open-pr.md), even when a branch blocked: the PR checklist is where Han learns about it.

_Done when_ Han has the Episode's local link and the draft PR's URL.

## The job loop

Each job runs its `agents` in order. The **implementor** writes the job's `outputs`; the **reviewer** judges them. Read the job's reference first: it holds the implementor's prompt, what the job is done when and, for a reviewer job, its `## Rubric`. A job with an `intent` states its task there instead, and its prompt is the `intent`.

A job with `isolation: worktree` works in a worktree of its own, so jobs running in parallel never fail each other's repo-wide checks (`mh check` and the staging test scan the whole repo):

1. Before its implementor, run `npm run wt:new -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. The `--` in the branch name is needed: git cannot create `episode/<slug>/<job id>` beside the branch `episode/<slug>`. Each worktree runs its own `npm ci`.
2. Its implementor and reviewer work only in that worktree, its checks run there, and its pass commit is made there.
3. On a pass, merge the job branch into `episode/<slug>` and run `mh` and `vitest` again there: a file can pass alone and fail beside its siblings, through a duplicate research ID or a cross-file check. A failure after the merge counts as a failed attempt of that job.
4. After the merge, or when the job is blocked, run `npm run wt:done -- episode/<slug>--<job id> --base episode/<slug>` from the Episode's worktree. It deletes a merged branch and keeps a blocked job's branch; the `Blocked:` note names that branch for Han.

A subagent never writes `run-log.md` or `docs/episodes/runs.csv`: it returns the parts of its run-log entry and its metrics, and you append them on `episode/<slug>` after the merge. Parallel branches that each appended to those two files would conflict at every merge.

Every agent runs where its `session` says. `subagent`, the default, is spawned with the Agent tool, its `subagent_type` the agent's `agent` (general-purpose when omitted) and its `model` the agent's `model`, left out for `inherit`. `orchestrator` runs in this session, because a subagent has no Agent tool: a skill that spawns subagents needs it, and so does a job that talks to Han. Its `model` goes to the subagents the skill spawns.

1. **Implementor.** Its prompt opens with the Brief's `Learning goal` and `Actionables`, quoted, because every artifact is written backwards from them. Then point it at the job's reference or `intent`, every path in `references` and `skills`, the staging folder, its worktree when the job has one, each job it `wants` that blocked, and on a retry the failed lines, quoted verbatim. Point, never paste: the agent reads the files. When the job's `before` lists `mh-query`, tell it: before writing each markdown path in `outputs`, run `npx mh query <path>` on it as written, a `*` included, and follow every intent it prints as an instruction. The query's answer is read, never saved.
2. **Checks.** Run the job's `checks` in order, cheapest first. This table is the one list of check names and their commands; `src/lib/episode-pipeline.pure.ts` refuses any other name:

   | check | command |
   | --- | --- |
   | `mh` | `npm run check:docs` |
   | `vitest` | `npx vitest run tests/docs/episode-staging.test.ts` |
   | `sources` | `npm run check:sources -- <research.md…>`: every source URL of the job's research files; exit 1 only when one is `dead`, and `unverifiable` links go to the reviewer as `needs human` |
   | `impeccable` | with `npm run preview` serving `out/`, `DO_NOT_TRACK=1 npx --yes impeccable@4.5.2 detect --json http://localhost:4300/episode/<slug>` and the `/de/` URL: a rendered scan, limited to the rules `.impeccable/config.json` leaves on; exit 2 is a failed attempt |
   | `verify` | `npm run verify` |
   | `build` | `npm run build` |
   | `test:build` | `npm run test:build` |
   | `visual-check` | DOM numbers per Slide in both themes, by [`references/implement-episode.md`](references/implement-episode.md#visual-check) |

   A failure counts as a failed attempt; its output lines are the failed lines.
3. **Reviewer.** A **fresh** agent, never one that wrote the output. A reviewer with `session: orchestrator` runs in the session that implemented, so its skill supplies the fresh eyes: `code-review` judges through subagents that saw none of the writing. Its baseline is the markdown-harness intent of every rule, field and heading that governs the output: it runs `npx mh query <path>` on each markdown output itself. On top of that baseline come the lines under the job's `rubric`. It answers one line per intent and per rubric line, `pass` or `fail — <the line, verbatim> — <evidence>`, and marks anything only Han can judge `needs human — <what>`. On attempt 2 and later, the fresh reviewer judges only the previous attempt's failed lines, beside the checks: a new concern goes into Notes as `Needs human: <what>`, never as a fail, so a retry is never judged against moved goalposts.
4. **Retry.** On any failed line, run the implementor again with every failed line quoted verbatim, then the checks and a fresh reviewer again. A job gets `1 + retries` attempts. A job whose output lives outside git (an issue, a PR) is retried by updating what its earlier attempt made, never by creating a second one; its reference says how it finds that output.
5. **Retries run out.** Mark the todo and every todo downstream of it blocked. The run-log entry's Notes start `Blocked:` and quote the last failed lines; they go on the PR checklist.
6. **Pass.** Run `node .agents/skills/new-episode/scripts/approve.ts <output> --by process:markdown-harness` on each staging output, which appends the machine entry to its `verified` list with the clock's UTC time and never overwrites an entry; never type the entry (research files carry no gate), and commit through the `commit` skill with `Source: docs/episodes/<slug>/brief.md` and `Agent: <job id>` (see [agent marks](#agent-marks)), in the job's worktree when it has one, then merge it as above.
7. **Log.** On `episode/<slug>`, append the [run-log entry](#run-log-and-runs-csv), listing each ticket the job edited (see [agent marks](#agent-marks)), then the runs CSV rows. A `needs human` reviewer line goes into Notes as `Needs human: <what>`.

_Done when_ the job passed or is blocked, its outputs are committed, and its run-log entry and CSV rows are appended.

## Agent marks

Every agent write is marked, so gate diffs and ticket edit history teach Han's style and nothing else. An unmarked commit or ticket edit is Han's; `agentOf` in `scripts/marks.pure.ts` reads the marks.

- **Commits:** an `Agent: <job id>` trailer on every commit an agent makes in the run, beside `Source:` (and `Gate:` on a gate commit). Han's own commits carry none.
- **Ticket edits:** an `Edited-by: <job id>` line at the end of every issue body an agent writes or edits with `gh issue edit`. Keep one line at the end of the body; replace it when another job edits.
- **Footer rule:** `write-design-spec` ends every ticket body it edits with `Edited-by: write-design-spec`, and edits only the design answers and, in the spec issue, `## Visual language`. Han's edit at the gate carries no footer, which is how the job's `edited` Metrics line is told from `approved as drafted`.
- **Run log:** each agent ticket edit is a line in the job's entry under `Output`: `Edited #<issue> · <ISO 8601 timestamp>`.

## Run log and runs CSV

Every job run appends one entry to `docs/episodes/<slug>/run-log.md`, never editing an earlier one: `## <job id> · <ISO 8601 timestamp>`, then the h3s `Inputs`, `Output`, `Checks`, `Metrics` and `Notes`. Before your first entry, run `npx mh query docs/episodes/<slug>/run-log.md` and follow every intent it prints, as an implementor does; the `run-log-body` rule holds each part's intent, and `assets/sample-episode/run-log.md` shows two entries. Write it for an agent reading the run cold, by `writing-for-agents`.

Every agent run, each attempt counted, appends one row to `docs/episodes/runs.csv`, which outlives Promotion:

```csv
run,episode,job,agent,attempt,result,failed_rubric,duration_s,tokens,at
2026-10-12T09:00:00Z,context-window-budget,research,implementor,1,fail,"Every Finding cites a Source.",240,18000,2026-10-12T10:15:00Z
```

- `run` is the run id from step 1; `episode` the slug; `agent` the agent's `type`.
- `result` is `pass` or `fail`; `failed_rubric` the first failed line, quoted, empty on a pass.
- `duration_s` and `tokens` come from the Agent tool's result. For an agent run in this session, write the wall-clock seconds and leave `tokens` empty.
- `at` is when the agent finished.

Each row matches one item under that entry's `Metrics`.

## Resuming a run

In a new session, or after a compaction, never trust memory of the run: run `npm run episode:status -- <slug>` again and rebuild the todo list from its output. A worktree `episode/<slug>--<job id>` whose job has no run-log entry is a crashed attempt: remove it with `wt:done` and its `--base`, delete its branch, and run the job again as its next attempt, numbered after the attempts its runs CSV rows show.

## Gate commits

Every commit goes through the `commit` skill. A gate commit adds a `Gate:` trailer beside `Source:` (`Gate: draft brief`, `Gate: approved pipeline`, `Gate: draft feedback-01`). The agent's draft is committed before Han edits it, so the pair of gate commits shows his edit as a diff: that diff is what later teaches agents his style. Only Han approves, with `approve.ts`, which appends his `verified` entry. Who commits sets the mark: the orchestrator's `Gate: draft <name>` commit carries `Agent: <job id>` beside `Gate:` and `Source:`, like every agent commit (see [agent marks](#agent-marks)); Han's approval commit carries no `Agent:` trailer, which is how a gate diff is told to be his. An approval commit the orchestrator makes at Han's word is still an agent commit and carries `Agent: <job id>`, while the approval entry in `verified` stays his.

After `Gate: approved pipeline`, the template is frozen for the run: `feat/89-new-episode` is not merged into the Episode branch again until `open-pr` is done. The pipeline's `template` field names the commit it was tailored from. A template change found during the run goes into `LEARNINGS.md` Lessons and is applied after the run.

## After the run

Han's feedback, typed or dictated, arrives as `feedback/<NN>/feedback.md` (with a `generated: { by, at }` naming who wrote it) and lands in the Dossier before the implementation. The loop ends when Han starts Promotion. Distil what this run taught into [`LEARNINGS.md`](LEARNINGS.md). Diff each pair of gate commits, the draft against Han's approval: every correction Han made twice becomes a proposed rubric line under `LEARNINGS.md` Lessons.
