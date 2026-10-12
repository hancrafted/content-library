# research

Output: `docs/episodes/<slug>/research/<question-slug>/research.md`, one per research question, each written by its own implementor. Reusable by any later Episode, so it stands on its own.

## Prompt

Answer one research question from the Brief with the `research` skill. Its method holds; the file's location and shape are the `research` rule's: `npx mh query` on [the sample](../assets/sample-episode/research/instruction-recall-by-position/research.md) prints the intent of every field and heading.

- `<question-slug>` names the subject in kebab case, not the Episode.
- The h1 is the research question as a _why_ question scoped to a subject matter; the frontmatter `question` keeps the Brief's wording.
- `Context` says what kind of claim the answer supports, naming no Episode: the next Episode that reuses this file has a different title.
- `Answer` is 2–5 sentences a script could quote.
- Every Finding cites a Source as `[n]`; Sources are primary (the paper, the official docs, the dataset) and carry title, URL and accessed date.
- `description` is one sentence stating the answer, because the llm-wiki index copies it byte for byte.
- `stale_after` is a year after `researched_on`, six months for anything about a tool, model or price.
- For an `extend` outcome from research-match, cite the earlier file as a Source and leave it unchanged.

## Done-checks

`npm run check:docs` is clean, then `npx vitest run tests/docs/episode-staging.test.ts` passes.

## Rubric

1. The Answer answers the h1 question.
2. Every Finding cites a Source.
3. Every Source is primary.
4. Context names no Episode.
