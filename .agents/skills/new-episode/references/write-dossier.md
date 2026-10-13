# write-dossier

Output: `docs/episodes/<slug>/dossier.md`, the Dossier. It is the Episode's one staging file: the spine (Sections and Slides) and, per Slide, what it shows, cites and, as beats, says. `write-voice-script` then turns each beat into the spoken paragraph in the same file.

## Prompt

Chain backwards from the Brief. Start at the `Learning goal` and the `Actionables`: for each actionable, decide which Slides a viewer needs to be able to take it, then order those Slides along the `Red thread` into Sections, with the `Hook` opening the first. When the Brief has Threads, alternate A and B thread Slides. Material that serves no actionable stays out, or goes under an extra heading without a slug.

Read the research the run produced and any file retrieval reused. The orchestrator names each research job that blocked: write no Slide that rests on its question, and add `Research gap: <job id> — <what the Episode leaves out>` to the run-log entry's Notes. Write in Han's voice by the human-profile guides in your references; a guide that does not exist yet is skipped.

The shape is the `staging-dossier` rules': `npx mh query` on [the sample Dossier](../assets/sample-episode/dossier.md) prints every intent, and the sample shows them met.

- **Spine.** Every spine heading is `<title, at most 60 characters> {#slug}`: the h1 is the Title slide, an h2 a Section, an h3 a Slide. No prose sits under the h1.
- **Visual.** `master: <name> · motion: <effect>`. A master is a slide-master catalog Slide (a folder in `src/components/episodes/slide-master/slides/`) or a frame component (`src/components/slide-master/<name>-slide.tsx`); a motion is `src/components/animations/<effect>.client.tsx`. Prose under it describes what the Slide shows, in viewer terms; CSS and component code belong to the implementation.
- **No catalog match.** When no catalog Slide fits, name the nearest frame component, describe the wanted layout in the Visual prose, and add `No catalog match: <section>--<slide> — <what was wanted>` to the run-log entry's Notes. It goes on the PR checklist.
- **Speaker notes.** One ordered-list item per note, `**<header>** — <description> [n]`, nested `sources: [n] <title> — <URL>` and an optional `target:`. Every source comes from a research file.
- **Voice script.** Under every h2 and h3 a `#### Voice script` block: one ordered-list item per spoken paragraph, `**<beat>** — <keywords>`. The item count sets the Slide's beats; `write-voice-script` keeps the beats and replaces each item's keywords with the paragraph, so write keywords it can speak from. A beat covers one idea.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Every Slide's Voice script still holds keywords, not prose.

## Rubric

1. Every Brief actionable is backed by at least one Slide, named by its slug.
2. Every instruction the Brief gives about how to tell the story is followed.
