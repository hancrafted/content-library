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

Run the `brief-grill` job by [`references/brief-grill.md`](references/brief-grill.md). When Han brings a Brief, accept it: validate it with the job's checks and grill him only on what is missing or reads `Not settled.`. Otherwise invoke the `brief-grill` skill. It is a human gate: stop the session after the `Gate: draft brief` commit and tell Han the Brief is his to edit and approve.

_Done when_ `docs/episodes/<slug>/brief.md` has `status: approved`, committed by Han with `Gate: approved brief`.

### 3. Tailor the pipeline

Run the `customize-pipeline` job by [`references/customize-pipeline.md`](references/customize-pipeline.md). It is a human gate: stop after the `Gate: draft pipeline` commit.

_Done when_ `docs/episodes/<slug>/pipeline.yml` has `status: approved`, committed by Han with `Gate: approved pipeline`.

### 4. Refuse or start

Start only when all of these hold; otherwise name each one that fails to Han and stop:

1. `brief.md` frontmatter has `status: approved`.
2. `pipeline.yml` has the top-level `status: approved`.
3. `npm run check:docs` is clean.
4. `npx vitest run tests/docs/episode-staging.test.ts` passes. It checks the per-run pipeline's schema, one research job per research question, and that no approved Brief keeps a `Not settled.` section.

Then write the todo list: one todo per job of `pipeline.yml` after `customize-pipeline`, in `needs` order. A per-run pipeline has no `foreach`: customize-pipeline expanded it into one job per research question.

_Done when_ the todo list holds every remaining job.

### 5. Run the jobs

Take every todo whose `needs` are all done and run it by [the job loop](#the-job-loop); independent todos run in parallel as background subagents. A blocked job blocks every job that `needs` it, directly or through another job; every other job carries on.

_Done when_ every todo is done or blocked, and each one has its run-log entry.

### 6. Serve and open the PR

Run the `open-pr` job by [`references/open-pr.md`](references/open-pr.md), even when a branch blocked: the PR checklist is where Han learns about it.

_Done when_ Han has the Episode's local link and the draft PR's URL.

## The job loop

Each job runs its `agents` in order. The **implementor** writes the job's `outputs`; the **reviewer** judges them. Read the job's reference first: it holds the implementor's prompt, what the job is done when and, for a reviewer job, its `## Rubric`. A job with an `intent` states its task there instead, and its prompt is the `intent`.

Every agent runs where its `session` says. `subagent`, the default, is spawned with the Agent tool, its `subagent_type` the agent's `agent` (general-purpose when omitted) and its `model` the agent's `model`, left out for `inherit`. `orchestrator` runs in this session, because a subagent has no Agent tool: a skill that spawns subagents needs it, and so does a job that talks to Han. Its `model` goes to the subagents the skill spawns.

1. **Implementor.** Its prompt opens with the Brief's `Learning goal` and `Actionables`, quoted, because every artifact is written backwards from them. Then point it at the job's reference or `intent`, every path in `references` and `skills`, the staging folder, and on a retry the failed lines, quoted verbatim. Point, never paste: the agent reads the files. When the job's `before` lists `mh-query`, tell it: before writing each markdown path in `outputs`, run `npx mh query <path>` on it as written, a `*` included, and follow every intent it prints as an instruction. The query's answer is read, never saved.
2. **Checks.** Run the job's `checks` in order, cheapest first. This table is the one list of check names and their commands; `src/lib/episode-pipeline.pure.ts` refuses any other name:

   | check | command |
   | --- | --- |
   | `mh` | `npm run check:docs` |
   | `vitest` | `npx vitest run tests/docs/episode-staging.test.ts` |
   | `verify` | `npm run verify` |
   | `build` | `npm run build` |
   | `test:build` | `npm run test:build` |
   | `visual-check` | DOM numbers per Slide in both themes, by [`references/implement-episode.md`](references/implement-episode.md#visual-check) |

   A failure counts as a failed attempt; its output lines are the failed lines.
3. **Reviewer.** A **fresh** agent, never one that wrote the output. A reviewer with `session: orchestrator` runs in the session that implemented, so its skill supplies the fresh eyes: `code-review` judges through subagents that saw none of the writing. Its baseline is the markdown-harness intent of every rule, field and heading that governs the output: it runs `npx mh query <path>` on each markdown output itself. On top of that baseline come the lines under the job's `rubric`. It answers one line per intent and per rubric line, `pass` or `fail — <the line, verbatim> — <evidence>`, and marks anything only Han can judge `needs human — <what>`.
4. **Retry.** On any failed line, run the implementor again with every failed line quoted verbatim, then the checks and a fresh reviewer again. A job gets `1 + retries` attempts.
5. **Retries run out.** Mark the todo and every todo downstream of it blocked. The run-log entry's Notes start `Blocked:` and quote the last failed lines; they go on the PR checklist.
6. **Pass.** Set each staging output's `status: checked` (research files carry no status), and commit through the `commit` skill with `Source: docs/episodes/<slug>/brief.md`.
7. **Log.** Append the [run-log entry](#run-log-and-runs-csv), then the runs CSV rows. A `needs human` reviewer line goes into Notes as `Needs human: <what>`.

_Done when_ the job passed or is blocked, its outputs are committed, and its run-log entry and CSV rows are appended.

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

## Gate commits

Every commit goes through the `commit` skill. A gate commit adds a `Gate:` trailer beside `Source:` (`Gate: draft brief`, `Gate: approved pipeline`, `Gate: draft feedback-01`). The agent's draft is committed before Han edits it, so the pair of gate commits shows his edit as a diff: that diff is what later teaches agents his style. Only Han sets `approved`.

## After the run

Han's feedback, typed or dictated, arrives as `feedback/<NN>/feedback.md` and lands in the Manuscript or Dossier before the implementation. The loop ends when Han starts Promotion. Distil what this run taught into [`LEARNINGS.md`](LEARNINGS.md).
