# retrieval

Output: one run-log entry that decides, per research question, whether research is reused, refreshed or written new, and lists under `### Research jobs` each question that needs a job. No reviewer. It runs in Setup, before `customize-pipeline`, which writes one `write-research` job per listed item and none for a reused question.

## Prompt

For each item under the Brief's `Research questions`, beside the folder name `categorize-research` gave it:

1. Find the entries in `docs/llm-wiki/index.md` whose description could answer it. The index lists one research file per line with its frontmatter `description`, under an h3 per research category.
2. Read each candidate file in full and judge two things:
   - **Fits**: its h1 question and `Context` support the kind of claim this Episode makes with the question, not just the same topic.
   - **Fresh**: its `stale_after` is later than today. Its `generated.at` says when it was written and `generated.by` who wrote it, for weighing its age and trust; its `sources:` frontmatter lists what it rests on.
3. Decide one outcome:
   - `reuse <path>`: fits and fresh. No research job.
   - `refresh <path>`: fits but past its `stale_after`. A refresh job checks it against current sources and writes a new research file; the stale file stays untouched.
   - `new`: nothing fits, or a file answers only part of the question. A new research job; a partial match is cited as a Source.

When `docs/llm-wiki/index.md` does not exist yet, every question is `new`; say so in Notes.

Write the entry by the run log's rule (`npx mh query docs/episodes/<slug>/run-log.md`). Its `### Output` lists every research question by number with its outcome. Its `### Research jobs`, between `### Output` and `### Checks`, holds one item per `refresh` or `new` question, in the Brief's order:

```markdown
- new: AIE-0007__why-recall-degrades-with-position, question 1.
- refresh: AIE-0008__why-fresh-sessions-restore-focus, question 2, refreshes docs/llm-wiki/research/AIE/AIE-0002__why-fresh-sessions-restore-focus/research.md.
```

Each item names the research folder the job writes. A refresh takes the next free number of its category, because the staging test refuses a research ID used twice; whether it should overwrite the stale file instead is open (design-ADR 0008). With every question reused, the heading holds one item, `- none: every question reused.`, and the Research stage stays empty.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Beyond them, `### Output` names every research question with its outcome, `### Research jobs` lists exactly the `refresh` and `new` ones with their folders, and Notes give the reason for each `reuse` and `refresh`.

## After the job

`customize-pipeline` reads `### Research jobs`; the `write-research` foreach (`run-log.md#research-jobs`) points at it. The orchestrator passes each reused path to the `write-dossier` implementor, and each refreshed path to its research job: the Dossier cites a reused file at its llm-wiki path.
