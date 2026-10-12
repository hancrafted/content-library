# write-manuscript

Output: `docs/episodes/<slug>/manuscript.md`, the Manuscript: the story the Episode tells, as prose that works without visuals. Han records from it, and each paragraph becomes one Voice script segment.

## Prompt

Write the story the Dossier plans. The Dossier owns the spine: copy its slugged headings verbatim and in order, and write exactly one paragraph per Segment, paragraph n carrying Segment n's beat and keywords. When a Segment cannot become a paragraph, write the rest and report that Segment to the orchestrator; the Manuscript and the Dossier always agree.

- Prose under the h1 is the Title slide, under each h2 its Section slide, under each h3 its page Slide. Prose only: no lists, tables or quotes.
- The Hook opens the Episode. Every Section moves the Red thread toward the learning goal, and every actionable is spoken somewhere.
- When the Brief has Threads, they alternate as the Dossier orders them.
- The listener hears it once and sees nothing: short sentences, one idea each, concrete over abstract, the Analogy returning where it helps.
- Write in Han's voice by the human-profile guides in your references; a guide that does not exist yet is skipped.

The shape is the `staging-manuscript` rules': `npx mh query` on [the sample Manuscript](../assets/sample-episode/manuscript.md) prints every intent.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Its `vitest` check holds the spine against the Dossier and the paragraph count against the Segments.

## Rubric

1. The Threads alternate, if the Brief has them.
2. It matches `docs/profile/han/tone-guide.md`, when that guide exists.
