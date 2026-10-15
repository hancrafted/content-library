# write-spec

Output: `docs/episodes/<slug>/spec/spec.html`, the **Spec**: one static HTML page showing every Slide of the Episode with two or three **Options** beside its title, Voice script and Speaker notes ([design-ADR-0011](../../../docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md)). [The sample](../assets/sample-episode/spec/spec.html) shows its shape; `src/lib/episode-spec.pure.ts` holds its contract and the staging test enforces it. The job runs in the orchestrator session, because it spawns the designers, and ends at the Spec Gate: Han reviews the page, Slides without one pick are redesigned, and he approves once every Slide has one.

## Prompt

Name every domain concept by its [`GLOSSARY.md`](../../../GLOSSARY.md) term, never an _Avoid_ word. Before the Gate the Dossier is the draft the Spec is written from; from the Gate on the Spec is the Episode's only source.

1. **Visual language first.** Read the Brief's `## Style` line and the matching named style in [the design guide](../../../docs/design/design-guide.md), then write the page's `Style` (the Brief's line) and `Visual language` sections: the Episode's recurring motifs, its motion character and how it uses the accent colours, in a few lines, narrowing the Style and never contradicting it.
2. **One designer per Section, in parallel.** Spawn one subagent per Dossier h2, each told to use the `ui-ux-pro-max:slides` skill, `model` the agent's `model`, with the Visual language and its Section's Slides by Dossier anchor. Each returns, per Slide, two or three Options as markup fragments: the mock, the figcaption and the build notes, the recommended one named. Designers return fragments; you alone write the page, since parallel edits to one file conflict.
3. **Write the page.** Copy the sample's head and page frame, then per Section and Slide the Dossier's words and the designers' Options, in Dossier order:
   - The meta block, `<script type="application/json" id="spec-meta">`, carries `type: "spec"`, `title`, `status`, `generated`, `locale` and `brief: "../brief.md"`. Set `generated.at` to now on every Attempt.
   - `Episode page` is `implement-episode-init`'s part: the route, the metadata from the Brief, the registration, the Title slide (its Voice script included, which the kit gives no own slot: map the h1's paragraphs to the first segment of the first section slide), one placement marker per Section by the name [`implement-episode-init.md`](implement-episode-init.md#placement-markers) gives, and post-build step 8 of [episode-migration](../../../docs/features/episode-migration.md): capture `tests/post-build/episode-text/<ep>.{en,de}.json` with `npm run build` then `npm run test:build`; the slug joins `PUBLISHED_SLUGS` only at publication.
   - One `<section data-spec="section">` per Section, its `id` the Dossier h2 slug, with its section slide (the kit's section layout, `motion: none`) and that slide's Voice script. One `<article data-spec="slide">` per page Slide, its `id` the Dossier h3 slug and `data-number` counting 1 to n down the page, holding the Dossier's Visual idea, its Voice script items and its Speaker notes with every citation in full, copied word for word: from the Gate on these words have no other home.
   - Each Option is a `<figure data-spec="option" data-option="<number><letter>">`, lettered from `a` in order, exactly one `data-recommended`, with its pick checkbox; each Slide has its note field.
   - Inline [`assets/spec-review.html`](../assets/spec-review.html) verbatim before `</body>`: the review form and its script come from that one asset, never written by hand.
4. **A failed rubric line goes back to that Section's designer only**, quoted verbatim; the other Sections stay as they are.

### What the designers read

The Brief, including its `## Style`; each reference the Brief lists, `design-reference.md` with its page images, which is the model Han brought; the Dossier (the Visual, title, Voice script and Speaker notes of each Slide); `GLOSSARY.md`; the Spec's Visual language; the ADRs `.archgate/adrs/FE-002-episode-page.md`, `FE-007-module-layering.md`, `FE-009-slide-wrapper-and-scene.md` and `FE-011-design-tokens.md`; and `docs/design/`: [the Slide library](../../../docs/design/slide-library.md) (which Master slides and library motions exist), [the design guide](../../../docs/design/design-guide.md) (Han's taste, and the run-1 Slides as "not this") and [the design system](../../../docs/design/design-system.md) (tokens and motion rules). A `No library match:` line in the run log is input for the designer. Point each designer at the files; never paste them.

### What an Option settles

An Option settles the on-screen title, the layout, the visual components, shapes, graphs and charts, and the hard UI calls: hierarchy, density, emphasis. Build settles the rest: motion (unless the Slide is about motion), dark mode, mobile width, German, final body copy and exact spacing. Mocks are desktop width, light theme and English, static unless the Slide is about motion, and styled with token classes only, so `design.css`, compiled from `globals.css`, renders them as the site will.

The Options of one Slide are **true alternatives**: they differ in layout, visual metaphor or chart type. Creative freedom holds inside the context above and the ADRs:

- The figcaption gives the Option's id, its reason in one line and its build cost: Slide library entry used as is, Master slide copy, or Scene.
- The build notes say whether the Dossier's `master:` and `motion:` are kept or overruled, an overruled one with its reason, and name the parts, tokens, props and i18n keys, so the mock maps onto the code.
- A Slide copies a Master slide with changes, or is a one-off Scene from `SlideFrame` and the kit's `<Title>` (FE-002 §3). A new part or motion lives in the Slide's own folder, a server part or its own `*.client.tsx`, and moves to `slide-shared/` once a second Slide needs it (FE-007).
- A Slide is a scrolling web section, not a fixed frame (FE-009): the wrapper's "at least viewport height" is the only height rule.
- An Option that redraws a design reference page names it in its build notes by repo path, `Design reference: docs/episodes/<slug>/reference/<file-slug>/pages/page-<NN>.jpg`, then `Build against this page: keep <what>; change <what>`.

### Settle it as a Scene

Run 1's designers stopped, or handed the question to Han, whenever the library had no part that fit. Those answers are the worked examples of what to settle instead, in the `Design answer` bullets of the run-1 tickets [#100](https://github.com/hancrafted/content-library/issues/100), [#101](https://github.com/hancrafted/content-library/issues/101), [#102](https://github.com/hancrafted/content-library/issues/102) and [#103](https://github.com/hancrafted/content-library/issues/103). Each begins from "No catalog part carries it" or "the catalog has no match" (run 1's word for the Slide library), then ends in an `Open for Han` question. That question is the designer's to settle as Options: a Scene from the frame parts is allowed (FE-002 §3), so the Options choose and give their reasons. Read those four tickets with `gh issue view` before designing a Slide the library does not carry.

## The Spec Gate

The Job span stays open from the first Attempt to the approval; each review round is a Gate span on the Run, so waiting time stays apart from working time.

1. **Draft.** After the Attempt passes (job loop steps 1 to 6), commit the page through the `commit` skill with `Gate: draft spec-<n>`, `<n>` the review round from 1, then `open-gate write-spec "draft spec-<n>"` and stop. In round 1's stop message, quote every `Spine change:` line of the `write-dossier` entry, so Han judges each change to his spine first. Tell Han to run `npm run episode:spec -- <slug>`: it compiles `spec/design.css` (gitignored) and serves the Spec on a free port from 4000. He ticks Options, dictates a note per Slide and saves; the save writes the next `feedback/<NN>/feedback.md`, `via: spec`, one item per Slide, ``- `<section>--<slide>` · design — picked: 3b`` (or `4a, 4c`, or `none — <note>`).
2. **Read the round.** Commit the feedback file through the `commit` skill, then `score "gate:draft spec-<n>" gate changes --source human:han --via commit --comment "<the round's file>"` and `close-gate "draft spec-<n>"`.
3. **Lock.** Each Slide with exactly one pick is locked: mark that Option `data-picked`, give its checkbox `checked` so the next round comes ticked and needs nothing on that Slide, and fold the Slide's note into its build notes. Fold the Visual language note into the Visual language.
4. **Redesign.** When a Slide has zero or several picks, `begin-attempt write-spec` and spawn designers for those Slides only, each given its note and picks: zero picks is "none fit, try what the note says", several is "combine these". Replace those Slides' Options, lettered from `a` again, and leave every locked Slide as it is. Run the checks and a fresh reviewer on the redesigned Slides, then `end-attempt write-spec ok` and go to step 1 with `<n> + 1`.
5. **Approve.** When every Slide has one pick, tell Han the Spec is his to approve. He runs `node skills/new-episode/scripts/approve.ts docs/episodes/<slug>/spec/spec.html`, which appends his `verified` entry to the meta block, and the same commit deletes `dossier.md`: `git rm docs/episodes/<slug>/dossier.md`, committed with `Gate: approved spec`. An approved Spec beside a Dossier, or with a Slide not picked exactly once, fails the staging test.
6. **Close.** `end-job write-spec ok`, then log one Score on the Job, derived from the rounds: `episode:run -- <slug> score write-spec gate "<outcome>" --source human:han --via commit --comment "<rounds> rounds"`. The outcome is `approved as drafted` (one round, every pick the recommended Option, no note), `approved after edits` (a pick off the recommended Option, a note folded in, or a later round) or `approved unreviewed` (approved without a saved round). When most runs are `approved as drafted` (`SELECT value, count(*) FROM scores WHERE name = 'gate' AND source = 'human:han' GROUP BY value`; `approved unreviewed` counts for nothing), the Gate's rounds shrink to a glance.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop) on every Attempt, and the Spec Gate's step 6 has run: the Spec is approved with exactly one picked Option per Slide, `dossier.md` is gone, and the Job carries its gate Score. The Build jobs then build from the Spec alone.

## Rubric

1. Every Slide carries two or three Options that are true alternatives: Options that differ only in colour, spacing or copy fail.
2. Every Option follows the Spec's Visual language, inside the Brief's Style.
3. Every Option's figcaption gives a one-line reason and its build cost, and its build notes name parts, tokens, props and i18n keys.
4. Every overruled `master:` or `motion:` names its reason.
5. Colour, size and weight are tokens (FE-011); every import the build notes imply is one FE-007 §5 allows.
6. Every Option follows FE-009: no fixed height, no clipping, Foreground clear of the chrome.
7. Every Option that redraws a design reference page names its page image by repo path with `Design reference:`, and says what to keep and what to change.
8. No Option asks Han a design question it could settle as a Scene; it chooses and gives its reason.
9. The recommended Option is the one the designer would build, and its reason says why over the others.
