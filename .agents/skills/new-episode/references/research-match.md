# research-match

Output: one run-log entry that decides, per research question, whether research is reused or written. No reviewer.

## Prompt

For each item under the Brief's `Research questions`:

1. Find the entries in `docs/llm-wiki/index.md` whose description could answer it. The index lists one research file per line with its frontmatter `description`.
2. Read each candidate file in full and judge two things:
   - **Fresh**: its `stale_after` is later than today.
   - **Fits**: its h1 question and `Context` support the kind of claim this Episode makes with the question, not just the same topic.
3. Decide one outcome:
   - `reuse <path>`: fresh and fits. No research job runs for the question.
   - `extend <path>`: fits but stale, or answers part of the question. A new research file is written that cites the old one; the old file's Findings stay untouched.
   - `new`: nothing fits.

When `docs/llm-wiki/index.md` does not exist yet, every question is `new`; say so in Notes.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Beyond them, the run-log entry's `Output` lists every research question by number with its outcome, and its Notes give the reason for each `reuse` and `extend`.

## After the job

The orchestrator marks the `research` todo of each `reuse` question done, and passes each reused or extended path to the `research` and `consolidate` implementors: the Dossier cites a reused file at its llm-wiki path.
