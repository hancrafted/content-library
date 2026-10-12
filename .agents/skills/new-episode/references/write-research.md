# write-research

Output: `docs/episodes/<slug>/research/<category>-<####>__<question-slug>/research.md`, the folder named by `categorize-research`, one per research question, each written by its own implementor. Reusable by any later Episode, so it stands on its own.

## Prompt

Answer one research question from the Brief with the `research` skill. Its method holds; the file's location and shape are the `research` rule's: `npx mh query` on [the sample](../assets/sample-episode/research/AIE-0000__why-recall-degrades-with-position/research.md) prints the intent of every field and heading.

- The h1 is the research question as a _why_ question scoped to a subject matter; the frontmatter `question` keeps the Brief's wording.
- `Context` says what kind of claim the answer supports, naming no Episode: the next Episode that reuses this file has a different title.
- `Answer` is 2–5 sentences a script could quote.
- Every Finding cites a Source as `[n]`; Sources are primary (the paper, the official docs, the dataset) and carry title, URL and accessed date.
- `description` is one sentence stating the answer, because the llm-wiki index copies it byte for byte.
- `stale_after` is a year after `researched_on`, six months for anything about a tool, model or price.
- For an `extend` outcome from retrieval, cite the earlier file as a Source and leave it unchanged.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop).

## Rubric

1. The Answer answers the h1 question.
2. Every Finding cites a Source.
3. Every Source is primary.
4. Context names no Episode.
