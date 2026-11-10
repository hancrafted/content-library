# Evals

The eval harness runs frozen cases headless, once per arm, grades each run and shows the results in skill-creator's viewer. Commands run from the skill folder.

## Run

```sh
node evals/run.ts --case ink --runs 1
```

`--arm` (repeatable; default `with_skill` and `without_skill`), `--model`, `--parallel` (default 2) and `--timeout-minutes` (default 30) are optional. Each run is a full agent session that spends real tokens, so run the smallest set that answers the question. The command prints the path of `review.html`.

It needs the `claude` CLI logged in, the repo's Playwright Chromium, Python 3.10 or newer (`EVAL_PYTHON` names one), and the skill-creator plugin (`SKILL_CREATOR_DIR` overrides where it is found).

To regrade saved runs after a grader changed, without rerunning any agent:

```sh
node evals/grade.ts evals/workspace/iteration-N        # every run, then a fresh benchmark and viewer
node evals/grade.ts evals/workspace/iteration-N/eval-ink/with_skill/run-1   # one run; prints its grading.json
```

## What a run sees

Each run gets a fresh temp folder holding `prompt.md`, its attachments and `calibration.md`; a skill arm also gets a copy of its skill in `skill/`, without `evals/`. `claude -p` starts there in safe mode, with no slash commands or MCP servers, so no CLAUDE.md, installed skill or plugin reaches it. The invocation text (`runner/invocation.pure.ts`) is identical across arms except one line that names `skill/SKILL.md`.

## Layout

The workspace `evals/workspace/` is gitignored. The `eval-` prefix is how skill-creator's aggregation finds a case.

```text
iteration-N/
  benchmark.json  benchmark.md  review.html
  eval-<case>/
    eval_metadata.json
    <arm>/run-<k>/
      run.json            case, mode, arm, model, sandbox paths, skill digest
      eval_metadata.json  the viewer reads the prompt here
      transcript.jsonl    the stream-json transcript
      tools.json          every tool call, subagents included
      timing.json         duration, tokens, cost
      grading.json        skill-creator's grading shape
      pages/              the .html pages the agent wrote
      outputs/            what the viewer shows: a screenshot of the graded page
```

## Grading

`runner/grade-run.ts` reads only the run folder and writes `grading.json`. Each grader contributes expectations, concatenated in `expectationsOf`:

- **Mechanical:** one expectation per check in `scripts/checks/`, run on the largest page in `pages/`. Checks for another mode than the case's are left out, so both arms face the same checks; a check skipped although it applies means the page declared the wrong mode, and fails. With no page, every check fails.
- **Isolation:** fails when any path in `tools.json` resolves outside the sandbox. File tools are read by their path fields. Shell commands are read by token, following `cd`, and a token counts as a path only from a real root folder, so markup such as `</script>` does not; each problem names its token for a person to judge. Devices, installed tools and browsers (`/usr/`, `/bin/`, `/opt/homebrew/`, `/Applications/`, Playwright's browser cache) pass.

A new grader, such as a judge or a reader probe, appends its expectations there. Pages stay out of `outputs/`: the viewer embeds text files inside a `<script>`, which a page's own `</script>` would break. skill-creator's aggregation computes pass rate, time and tokens per arm from `grading.json` and `timing.json`.

## Cases

`cases/manifest.json` lists each case's prompt, attachments, mode and calibration answers, with the sha256 of every frozen file. A run refuses a case whose hashes no longer match, and `runner/cases.test.ts` fails on it in the fast suite. To change a case, freeze a new one. A case without a mode and `calibration.md` cannot run headless.

The loop from human feedback to approved graders is in [manual evaluation](../references/manual-evaluation.md).
