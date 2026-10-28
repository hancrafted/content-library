---
name: author-hitl-workflow
description: Create, update or fix a human-in-the-loop Workflow file, the YAML behind the human-in-the-loop Explorable explanation, and land it in the repo. Use when the user has an idea for a new Workflow, names a Workflow file to rework, reports that a Workflow prompt goes wrong in ChatGPT or Gemini, or pastes a reply ending in a `[hitl-debug]` line.
---

# Author a HITL Workflow

A **Workflow** (`GLOSSARY.md`) is a chain of prompts a participant pastes into a free chat, one job at a time, each answer handed to the next job. You write the file, prove its prompts on stand-in runs, have Han prove them in the target tool, then land it. The contract of the file is `docs/features/explorables/agentic-workflow.md`: read it before writing YAML. Its section _Prompts that survive the free tier_ holds the lessons earlier runs paid for.

The **target tool** is logged-out ChatGPT free unless the user names another. Every prompt must work **unsupervised**: the participant watches it once at an Event, then runs it alone.

Working files go in `.scratch/<workflow-id>/` (gitignored): the draft YAML, `target.*`, `run-N/`. Paths are from the repo root; `scripts/` and `references/` sit in this skill's folder.

## Start here

Pick the branch by what the user gave you:

- **An idea:** create. Run every step.
- **`--target <file>`, or a Workflow to rework:** update. Copy the file to `.scratch/<id>/`, then start at [step 3](#3-design-the-chain-backwards), with step 2's target taken from the current file's final job.
- **A report in words, or a reply ending in `[hitl-debug] …`:** fix. Start at [Fix a report](#fix-a-report).

Level and mode: run the level and mode the report or footer names; otherwise Simple (`level=chat`) and demo.

## Steps

### 1. Grill the goal

Run `/grilling` in the format of `docs/agents/grilling-format.md`. Settle: who runs it, alone or supervised; the target tool; the **one deliverable**; at most four stages; what demo mode cuts. One great result in depth beats the whole project shallow.

_Done when_ every one of those five has an answer and **Han confirms** the decisions, saved to `.scratch/<id>/decisions.md`.

### 2. Write the target result

Write the deliverable the last job should produce, from **real data**: the page, the plan, the note. It is the spec everything else works backwards from.

_Done when_ `.scratch/<id>/target.*` exists and **Han approves** it. Stop for that approval.

### 3. Design the chain backwards

Walk back from the target:

- The final job's template is the target's outline.
- The job before it gathers everything the final job needs into one note, so the final job takes one paste.
- A fan-out stage (`foreach`) researches one item per round, in a fresh chat; each result is one card in the target.
- The opening interview writes the spec and names the fan-out items as H3s, one line of body under each.

Name each job by its kind (an interview, research, compare, decide, artifact or review job); the kind decides which [prompt checks](references/prompt-checks.md) bear hardest on it. Reviews sit at the gates only.

_Done when_ every input of every job is an output of an earlier job, a free slot, or the scenario.

### 4. Draft the YAML

Write `.scratch/<id>/<id>.en.yml`. Samples use made-up names; the target and the runs use real data. Apply every check in [`references/prompt-checks.md`](references/prompt-checks.md) to every do and review prompt.

_Done when_ `node skills/author-hitl-workflow/scripts/render-prompt.ts <file> <job>` prints a prompt for every job (it loads the file first and prints every loader problem otherwise), and each prompt passes every check in the table. Its flags (review step, full run, level, a round, slot files) are in its header comment. The pair test adds limits the loader leaves out; keep to them from the start: a stage `summary` of at most eight words, `instructions` of at most two sentences, a picker `description` of one sentence.

### 5. Stand-in run

Gate: ask Han before the run. Then for each job in chain order:

1. Render its prompt to `run-N/<job>.prompt.md` with `render-prompt.ts`, filling each slot from the earlier replies: `<marker>=run-N/<job>.md`; `--round=<n>:<item-file>` for a fan-out round; `--review` for a review step.
2. Dispatch one Haiku subagent per job (per round for a fan-out), fed **only** that prompt file, told to write its reply to `run-N/<job>.md`. The participant has nothing but the prompt, so the stand-in gets nothing else: a prompt that leans on context it lacks fails here first. Independent rounds run in parallel.

Then grade the run:

- **Format:** one code block, starting ` ```markdown `, with the template's headings in order.
- **Links:** `npm run check:sources -- --links run-N/*.md`. A 404, a 410 or an unknown host fails; 403 and 429 are bot blocks.
- **Artifact:** for an HTML deliverable, `npm run inspect-page -- --url file://<abs path> --width 1280 --theme light` and again at `--width 390 --theme dark`; `health.overflowX` is false and `health.brokenImages` is empty.
- **Done-criteria:** every line of each job's "What done looks like", item by item.
- **Target:** compare the final reply with the target and list the gaps.

Fix the prompts, never the replies, and rerun as `run-N+1/`. Haiku is lenient: it proves the prompts and the chain, not free-tier robustness.

_Done when_ one run passes every grade, its gap list is empty or Han accepts what is left.

### 6. Han's run

Hand Han the file's path for the toolbar's upload and the job order. He runs it in the target tool, and an artifact job (an HTML page) in Gemini too, since the free tier has failed it there, and reports. Each report re-enters at [Fix a report](#fix-a-report).

_Done when_ **Han says** the result is good enough to land.

### 7. Land it

Gate: ask Han before landing. Then follow [`references/landing.md`](references/landing.md) to the end.

_Done when_ the PR is open and Han has read the German file.

## Fix a report

1. **Locate.** For a reply with a footer, save it and run `node skills/author-hitl-workflow/scripts/parse-debug-footer.ts <reply.md>`: it names the Workflow, stage, job, round, step, level, mode and locale, and `changed: true` when the repo's file pair has changed since the reply (for a draft in `.scratch/`, pass its two files after the reply). A changed file: say so and work on the current one. For a report in words, name the job yourself and confirm it with Han.
2. **Reproduce.** Render that job's prompt at that level and mode, run it once on a stand-in, and see the failure. A failure only the target tool shows (an empty reply, a document instead of a code block) is reproduced in Han's report itself.
3. **Fix the prompt** at the earliest job whose prompt allowed the failure, against the [prompt checks](references/prompt-checks.md).
4. **Feed the lesson back.** Write it, domain-agnostic, into _Prompts that survive the free tier_ in `docs/features/explorables/agentic-workflow.md`: what the model did, and the prompt fix. A lesson that names the scenario (a vacation, a project) is not yet general.
5. Rerun [step 5](#5-stand-in-run) from the fixed job on, then [step 6](#6-hans-run).

_Done when_ the stand-in run passes, the lesson is in the guide, and Han confirms the fix in the target tool.
