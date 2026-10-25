# retrieval

Output: `docs/episodes/<slug>/research-plan.md`, which decides per research question whether an existing Research question is reused, refreshed or a new one written, and lists under `## Research jobs` each question that needs a job. No reviewer. It runs in Setup, before `customize-pipeline`, which writes one `write-research` job per listed item and none for a reused question.

## Prompt

The evidence layer comes first: commission only what is missing (design-ADR 0016, _Pipeline and evidence_). For each item under the Brief's `Research questions`, beside the folder name and the Concepts `categorize-research` returned for it:

1. List the candidates: `npm run episode:research -- list <concept-id>` for each Concept the question informs. It lists every Research question of the wiki **and of every other open Staging**, each with its `confidence`, whether it is fresh or stale today, the Concepts it informs, its question, its one-sentence Answer and its path. A question another Run staged is as citable as a wiki one.
2. Read each candidate file in full and judge two things:
   - **Fits**: its h1 question and `Context` support the kind of claim this Episode makes with the question, not just the same topic.
   - **Fresh**: the listing says `fresh until`, not `stale since`.
3. Decide one outcome:
   - `reuse <id>`: fits and fresh. No research job; the Dossier cites the id.
   - `refresh <id>`: fits but stale. A refresh job checks it against current sources and rewrites it under **the same id**, so every note citing it still resolves.
   - `new`: nothing fits, or a question answers only part of it. A new research job; a partial match is cited as a Source.

`confidence` never decides reuse: an `open` or `contested` question is reused as it stands, and the plan names its `confidence` so the Dossier carries the caveat.

Write the plan by its rule (`npx mh query docs/episodes/<slug>/research-plan.md`), each question once, in the Brief's order:

```markdown
## Research jobs

- new: AIE-0016__why-recall-degrades-with-position, question 1, informs llm-behaviour, context-engineering.
- refresh: AIE-0011__fresh-context-beats-long-chat, question 2, refreshes AIE-0011.
- migrate: AIE-0017__why-onboarding-beats-prompting, onboarding, informs agentic-ai.

## Reuse

- Question 3: reuse LLM-0002, confidence open, fresh until 2027-04-19.
```

- A `new` item takes the folder `categorize-research` named and the Concepts it returned, the main one first.
- A `refresh` item's folder is the stale question's own folder name, written into this Run's Staging; the stale file stays untouched until Promotion replaces it.
- A `migrate` item is a research job for the grandfathered sources on a note the Run touches (an adapted Slide, an edited note): one question that weighs them, named by the Slide slug, so the baseline entries leave in this Run.
- A `reuse` item copies `confidence` and the `stale_after` date from the listing.

With every question reused, `## Research jobs` holds no item and the Research Stage holds no job: a normal outcome.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop); the staging test refuses an item that informs no Concept, reuses an id no Research question has, refreshes under another id, or writes an id another file holds. Beyond them, the plan covers every research question once, and the Job's summary gives the reason for each `reuse` and `refresh`. A question the Episode goes without gets `note retrieval research-gap "<question> — <why>"`.

## After the job

`customize-pipeline` reads `## Research jobs`; the `write-research` foreach (`research-plan.md#research-jobs`) points at it. The orchestrator passes each refreshed id's stale file to its research job. `write-dossier` reads the plan and cites each reused and written question by id.
