# write-dossier

Output: `docs/episodes/<slug>/dossier.md`, the Dossier. It is the Episode's one staging file: the spine (Sections and Slides) and, per Slide, what it shows, cites and, as beats, says. `write-voice-script` then turns each beat into the spoken paragraph in the same file.

## Prompt

Keep the Brief's **spine**. Its `## Slides` names every Section and page Slide in order, each with a title, a purpose and a visual idea: each Section becomes an h2 and each Slide an h3 of the same title, in the same order, and the Slide's Visual, Speaker notes and Voice script carry out its purpose. The visual idea is input to the Visual; name the Master slide yourself. Its `_Research:_` numbers say which research files back the Slide's Speaker notes.

Change the spine only where the research or the Brief's Learning goal demands it: add, split, merge, drop, retitle or reorder a Slide, and return each change as its own `spine-change` note, `<Brief Slide title> — <why>` (for an added Slide, its Dossier title); the orchestrator records it with `note write-dossier spine-change`. The staging test fails every difference between the Brief's Slide titles and the Dossier's h3s that no such note names, and the user sees each note at the Spec Gate. Material that serves no Slide stays out, or goes under an extra heading without a slug.

Read each reference in your references, its `## Page <n>` text and page images: The user brought it as the model for the Episode, so a Slide that takes a page's argument or picture names it in its Visual as `Design reference: reference/<file-slug>/design-reference.md#page-<n>`. The orchestrator names a blocked `convert-references`: then the Brief's Episode Design Reference has no Markdown, so say so in Notes and write without them.

Read the research the run produced and every Research question retrieval reused, each named by id in `research-plan.md` (`npm run episode:research -- list` gives its path). A reused `open` or `contested` question keeps its caveat: never state its claim as settled. The orchestrator names each research job that blocked: write no Slide that rests on its question, and return a `research-gap` note, `<job id> — <what the Episode leaves out>`. Write in the user's voice by the human-profile guides in your references; a guide that does not exist yet is skipped.

Frontmatter: `status: draft`, a placeholder `generated: { by, at }` (the orchestrator's `approve.ts --stamp` overwrites it with the producer and the clock time; never type a timestamp), and no `verified` (the same command adds it). The shape is the `staging-dossier` rules': `npx mh query` on [the sample Dossier](../assets/sample-episode/dossier.md) prints every intent, and the sample shows them met.

- **Spine.** Every spine heading is `<title, at most 60 characters> {#slug}`: the h1 is the Title slide, an h2 a Section, an h3 a Slide. No prose sits under the h1. Leave out its optional `#### Speaker notes` and `#### Voice script` too, which a feedback round adds; the Episode's spoken opening goes under the first h2.
- **Visual.** `master: <name> · motion: <motions>`. A master is a Master slide of the Slide library (a folder in `src/components/episodes/slide-master/slides/`) or a frame component (`src/components/slide-master/<name>-slide.tsx`). The motions are a comma-separated list, each entry one of: `none`, meaning the Slide carries no motion (it stands alone); `local`, motion written in the Slide's own CSS module, which the Visual prose describes in viewer terms (what the viewer sees move, and when); or a Slide library motion, a file name in `src/components/slide-shared/motions/` without `.module.css` (the folder is empty until a second Slide needs a motion; `docs/design/slide-library.md` lists them). A Slide may mix them: `motion: reading-highlight, local`. Prose under the line describes what the Slide shows; CSS and component code belong to the implementation.
- **On-screen title.** The h3 is the Slide's table-of-contents title and anchor. Without more, the Slide shows the h3 as its title. To show a different title, put `title: <on-screen title>` on the line after the `master:` line of the Visual. A later step never retitles a Slide silently: a different on-screen title goes into the Visual first.
- **Title slide and section slides.** The h1 and every h2 carry no `#### Visual`. They always use the kit's title and section layouts with `motion: none`. A Voice script under an h2 is the only block it holds; the h1 may also hold Speaker notes, and the writing jobs leave both out.
- **No library match.** When no Master slide fits, name the nearest frame component, describe the wanted layout (and, when no library motion fits, the wanted motion) in the Visual prose in viewer terms, and return a `no-library-match` note, `<section>--<slide> — <what was wanted>`. It is input for `write-spec`'s designers, who design it; it is not a question for the user.
- **Speaker notes.** One ordered-list item per note, `**<header>** — <description> [AIE-0001]`, nested `research: AIE-0001` and an optional `target:`. A note cites the Research question by id; its title, link and `confidence` come from the question. Cite only ids the research plan names, and cite every question it reuses. A Source is cited directly, `[n]` with a nested `sources: [n] <title> — <URL>`, only when it is high trust: a vendor's own documentation, a law's text or the scholarly record.
- **Voice script.** Under every h2 and h3 a `#### Voice script` block: one ordered-list item per spoken paragraph, `**<beat>** — <keywords>`. The item count sets the Slide's beats; `write-voice-script` keeps the beats and replaces each item's keywords with the paragraph, so write keywords it can speak from. A beat covers one idea.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Every Slide's Voice script still holds keywords, not prose.

## Rubric

1. Every Brief actionable is backed by at least one Slide, named by its slug.
2. Every Slide carries out the purpose its Brief entry states, and every Brief Constraint holds on every Slide.
3. Every `spine-change` note names a reason the research or the Learning goal gives.
4. Every instruction the Brief gives about how to tell the story is followed.
5. No Voice script item repeats a claim a Speaker note on the same Slide makes.
