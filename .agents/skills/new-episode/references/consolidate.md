# consolidate

Output: `docs/episodes/<slug>/dossier.md`, the Dossier. It fixes the Episode's spine (Sections and Slides) and, per Slide, what it shows, cites and says, before any story is written.

## Prompt

Chain backwards from the Brief. Start at the `Learning goal` and the `Actionables`: for each actionable, decide which Slides a viewer needs to be able to take it, then order those Slides along the `Red thread` into Sections, with the `Hook` opening the first. When the Brief has Threads, alternate A and B thread Slides. Material that serves no actionable stays out, or goes under an extra heading without a slug.

Read the research the run produced and any file research-match reused. Write in Han's voice by the human-profile guides in your references; a guide that does not exist yet is skipped.

The shape is the `staging-dossier` rules': `npx mh query` on [the sample Dossier](../assets/sample-episode/dossier.md) prints every intent, and the sample shows them met.

- **Spine.** Every heading the Manuscript will share is `<title, at most 60 characters> {#slug}`: the h1 is the Title slide, an h2 a Section, an h3 a Slide. The distill job copies these headings verbatim.
- **Visual.** `master: <name> · motion: <effect>`. A master is a slide-master catalog Slide (a folder in `src/components/episodes/slide-master/slides/`) or a frame component (`src/components/slide-master/<name>-slide.tsx`); a motion is `src/components/animations/<effect>.client.tsx`. Prose under it describes what the Slide shows, in viewer terms; CSS and component code belong to the implementation.
- **No catalog match.** When no catalog Slide fits, name the nearest frame component, describe the wanted layout in the Visual prose, and add `No catalog match: <section>--<slide> — <what was wanted>` to the run-log entry's Notes. It goes on the PR checklist.
- **Speaker notes.** One ordered-list item per note, `**<header>** — <description> [n]`, nested `sources: [n] <title> — <URL>` and an optional `target:`. Every source comes from a research file.
- **Segments.** One ordered-list item per spoken paragraph, `<title> — <keywords>`. The Manuscript writes exactly one paragraph per Segment, so this list sets the Slide's beat.

## Done-checks

`npm run check:docs` is clean, then `npx vitest run tests/docs/episode-staging.test.ts` passes. The cross-file checks need both the Dossier and the Manuscript, so until `distill` runs, the reviewer checks the Visual names against the folders above.

## Rubric

1. Every Brief actionable is backed by at least one Slide, named by its slug.
2. Every Speaker note cites a research file or a source.
3. Every Visual names an existing master slide and motion effect.
4. The Dossier holds no CSS and no implementation detail.
5. Every Section advances the Red thread toward the learning goal.
