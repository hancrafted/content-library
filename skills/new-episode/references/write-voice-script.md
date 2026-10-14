# write-voice-script

Output: `docs/episodes/<slug>/dossier.md`, the same file `write-dossier` wrote. Han records from its Voice script, and each item becomes one Voice script segment of its Slide.

## Prompt

Write the story the Dossier plans. In every `#### Voice script` block, replace each item's keywords with the spoken paragraph, keep the bold beat, and change nothing else but moving `generated.at` to the current UTC time (the file changed, so an earlier approval no longer counts): not a heading, a Visual, a Speaker note, an item's number or the item count. `tests/docs/episode-staging.test.ts` compares the file against the commit `write-dossier` made and fails any other changed line. When a beat cannot become a paragraph, write the rest and report that beat to the orchestrator; never edit the beat or the item list to fit.

- An item is `1. **<beat>** — <the paragraph>`, on one line or wrapped. Prose only: no lists, tables or quotes inside it.
- Under the h2 is the Section slide's Voice script, under each h3 its page Slide's. The h1 has none; do not add one, since a feedback round adds the Title slide's optional blocks.
- The Hook opens the Episode. Every Section moves the Red thread toward the learning goal, and every actionable is spoken somewhere.
- When the Brief has Threads, they alternate as the Dossier orders them.
- The listener hears it once and sees nothing: short sentences, one idea each, concrete over abstract, the Analogy returning where it helps.
- Speak what the Speaker notes leave out: a fact a Speaker note carries is not repeated in the paragraph.
- Write in Han's voice by the human-profile guides in your references; a guide that does not exist yet is skipped.

The shape is the `staging-dossier` and `staging-dossier-body` rules': `npx mh query` on [the sample Dossier](../assets/sample-episode/dossier.md) prints every intent.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Its `vitest` check holds that only Voice script lines changed against `write-dossier`'s commit. Then the orchestrator commits with `Gate: draft dossier` and stops: Han reads the whole Dossier and edits it before approving. In the stop message, quote every `Spine change:` line of the `write-dossier` entry, so Han judges each change to his spine first.

## Rubric

1. The Threads alternate, if the Brief has them.
2. It matches `docs/profile/han/tone-guide.md`, when that guide exists.
3. It follows `docs/profile/han/storytelling-guide.md`, when that guide exists.
4. Every instruction the Brief gives about how to tell the story is followed.
5. Every actionable of the Brief is spoken in some Voice script.
