# write-research

Output: `docs/episodes/<slug>/research/<category>-<####>__<question-slug>/research.md`, the folder named by `categorize-research`, one per research question retrieval lists under `### Research jobs`, each written by its own implementor. Reusable by any later Episode, so it stands on its own.

## Prompt

Answer one research question from the Brief with the `research` skill. Its method holds; the file's location and shape are the `research` rule's: `npx mh query` on [the sample](../assets/sample-episode/research/AIE-0000__why-recall-degrades-with-position/research.md) prints the intent of every field and heading.

- Frontmatter follows OKF v0.2: `generated: { by, at }`, a placeholder until the orchestrator's `approve.ts --stamp <producer>/<version>` (for example `claude-code/opus-5.5`) overwrites it with the clock time; never type a timestamp. Han's edit sets `by` to `human:han`.
- `title` is the h1 verbatim: the staging test fails when they differ.
- Sources are frontmatter `sources:`, one entry per source with `id` (the numbers 1..n, in order), `resource` (the URL) and `title` (`<author>, <title>`). A Finding cites a source as `[n]`, and one link reference definition `[n]: <url> "title"` per source closes the file, after the last section, so `[n]` opens the source in one click. The URL equals that source's `resource`. There is no `question` key (the h1 carries it), no footnote, no `## Sources` list, no access date and no supporting quote. The staging test fails on a citation with no source or definition, a source no Finding cites, ids not 1..n, or a definition URL that differs from the `resource`.
- For a `refresh` item in retrieval's `### Research jobs`, the stale file is your starting point: check each of its Findings against current sources, and cite it as a Source. Write the folder your job's `outputs` names, never over the stale file.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop).

## Rubric

1. The Answer answers the h1 question.
2. A claim the Answer takes from a disputed study names the dispute and the strongest counter-evidence.
3. Every Finding's claim is supported by the source it cites. The reviewer reads the source; the `sources` check output is evidence; a link reported `unverifiable` is `needs human`, not a pass.
