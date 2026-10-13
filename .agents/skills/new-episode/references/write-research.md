# write-research

Output: `docs/episodes/<slug>/research/<category>-<####>__<question-slug>/research.md`, the folder named by `categorize-research`, one per research question, each written by its own implementor. Reusable by any later Episode, so it stands on its own.

## Prompt

Answer one research question from the Brief with the `research` skill. Its method holds; the file's location and shape are the `research` rule's: `npx mh query` on [the sample](../assets/sample-episode/research/AIE-0000__why-recall-degrades-with-position/research.md) prints the intent of every field and heading.

- Frontmatter follows OKF v0.2: `generated: { by, at }`. `by` is `<producer>/<version>` for you (for example `claude-code/opus-5.5`), or `human:han` when Han edited the file; `at` is the ISO 8601 instant the research finished, with a UTC offset, on or after every Source's `accessed` day.
- For an `extend` outcome from retrieval, cite the earlier file as a Source and leave it unchanged.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop).

## Rubric

1. The Answer answers the h1 question.
2. A claim the Answer takes from a disputed study names the dispute and the strongest counter-evidence.
