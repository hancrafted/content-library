# Evals

The eval harness runs frozen cases headless, once per arm, grades each run and shows the results in skill-creator's viewer. Commands run from the skill folder.

## Run

```sh
node evals/run.ts --case ink --runs 1
```

`--arm` (repeatable; default `with_skill` and `without_skill`), `--model`, `--parallel` (default 2) and `--timeout-minutes` (default 30) are optional. Each run is a full agent session that spends real tokens, so run the smallest set that answers the question. The command prints the path of `review.html`.

It needs the `claude` CLI logged in, the repo's Playwright Chromium, Python 3.10 or newer (`EVAL_PYTHON` names one), and the skill-creator plugin (`SKILL_CREATOR_DIR` overrides where it is found). Grading also calls a model for the judge and the probe; see [Quality](#quality).

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
      grading.json        skill-creator's grading shape, plus `judge`: the models that judged and read the page
      quality.json        the judge's and the reader's raw answers, models and cost
      pages/              the .html pages the agent wrote
      outputs/            what the viewer shows: the three screenshots the judge saw
```

## Grading

`runner/grade-run.ts` reads only the run folder and its case's `checklist.json` and `probe.json`, and writes `grading.json`. Each grader contributes expectations, concatenated in `expectationsOf`:

- **Mechanical:** one expectation per check in `scripts/checks/`, run on the largest page in `pages/`. Checks for another mode than the case's are left out, so both arms face the same checks; a check skipped although it applies means the page declared the wrong mode, and fails. With no page, every check fails.
- **Isolation:** fails when any path in `tools.json` resolves outside the sandbox. File tools are read by their path fields. Shell commands are read by token, following `cd`, and a token counts as a path only from a real root folder, so markup such as `</script>` does not; each problem names its token for a person to judge. Devices, installed tools and browsers (`/usr/`, `/bin/`, `/opt/homebrew/`, `/Applications/`, Playwright's browser cache) pass.
- **Judge** and **probe:** see [Quality](#quality).

Pages stay out of `outputs/`: the viewer embeds text files inside a `<script>`, which a page's own `</script>` would break. skill-creator's aggregation computes pass rate, time and tokens per arm from `grading.json` and `timing.json`.

## Quality

Two model graders read the page the way a person does, in the ArtifactsBench style. `runner/views.ts` loads it offline at 1440 × 900 and saves three screenshots (on load, after picking the recommended Option in the first item with choices, and with every depth toggle and disclosure open) plus the visible text. A view the page cannot give, such as a pick on an explain page, is left out and noted. Each model works in a folder holding only those files.

- **Checklist judge:** answers the confidence bar for the case's mode (`judge/confidence-bar.json`), then the case's `checklist.json`, each item `yes`, `no` or `unknown`. Only `yes` passes. Prompt: `judge/judge.md`.
- **Reader probe:** answers the case's `probe.json` questions from the page alone, choosing lettered choices or `unknown`, and passes only on exactly the keyed set. The key never reaches the reader. Prompt: `judge/probe.md`.

Each answer carries a verbatim quote as evidence; a quote the page text lacks is flagged, since it came from a screenshot or was invented. A failed model call fails its items and is noted for review.

The judge's family should differ from the executor's (Claude) to avoid self-preference, so a `gemini` CLI on `PATH` is used when present. Otherwise Claude judges, and every `grading.json` lists the self-preference risk under `user_notes_summary.uncertainties`. `EVAL_JUDGE` overrides the choice (`auto`, `gemini`, `claude` or `off`, which grades mechanically only and spends nothing) and `EVAL_JUDGE_MODEL` names a model. The Gemini path follows the CLI's documented `-p` and `--output-format json` flags with `@file` attachments, and has not yet run.

One ink run costs about $0.42 to judge and probe with Claude Opus, and takes about 40 s.

## Cases

`cases/manifest.json` lists each case's prompt, attachments, mode, calibration answers, `checklist` and `probe`, with the sha256 of every frozen file. A run refuses a case whose hashes no longer match, and `runner/cases.test.ts` fails on it in the fast suite. To change a case, freeze a new one. A case without a mode and `calibration.md` cannot run headless.

A case's `checklist.json` holds 3 to 5 `items`, each `{ "id", "question", "source" }`, where the question is answerable yes or no from the page. Its `probe.json` holds `questions`, each `{ "id", "question", "choices": { "a": "…" }, "answer": ["a"], "source" }`; `unknown` is offered on every question, so no choice takes that id. A `source` is `{ "file", "quote" }`: a verbatim quote from the prompt, an attachment or the calibration answers, because a key comes from what the run itself sees and never from a generated page. `runner/cases.test.ts` checks every key's source and choices.

The loop from human feedback to approved graders is in [manual evaluation](../references/manual-evaluation.md).
