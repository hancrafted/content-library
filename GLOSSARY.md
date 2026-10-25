---
type: glossary
title: Content library
stale_after: 2027-01-11T00:00:00Z
---

# Content library

Localized visualisations of theory content, captured from YouTube training videos and published in English and German.

## Product & Features

**Episode**: one page of visualised theory content, localized into en and de: its Slides stacked vertically, navigated by its table of contents. Its title is the page's h1; it holds Sections and has one YouTube recording per locale.
_Avoid_: Post, article, video, tower

**Episode overview**: the landing page's list of every Episode, published or upcoming, that a visitor browses and filters.
_Avoid_: Episode index, catalog, episode list, manifest

**Upcoming Episode**: an Episode announced in the Episode overview but not yet published: its video is not out. It may already have a page, reachable by its URL alone; either way its entry links nowhere.
_Avoid_: Draft, coming-soon episode, stub

**Concept**: one subject the evidence and the Episodes are grouped under: one markdown file at `docs/llm-wiki/concepts/<id>/concept.md` whose id is its kebab-case English name, never renamed (a better name becomes an alias). It sits in a hierarchy by `broader` (its parents); `narrower` is derived, never written. It renders in English only at `/concepts/<id>`.
_Avoid_: Tag, Topic, category, keyword

**Top Concept**: a Concept with no parent (`broader: []`). The seven top Concepts are the closed set of themes: each has an icon and an accent, and a new one is a design decision, not a content edit. An Episode lists the top Concepts it teaches, and its card shows them, linked to their pages.
_Avoid_: Root concept, theme tag, lead Tag

**applyThemeFromConcept**: the field of an Episode's metadata that names one of its top Concepts, whose icon and accent its card draws.
_Avoid_: Lead Tag, look

**Event**: a dated occasion of one kind (a workshop, a webinar) that presents one Playlist to an Audience. It owns no Slides, holds no text and has no visibility or status of its own: its Playlist's visibility is its own, and its date decides whether it is past.
_Avoid_: Workshop (a kind of Event, not the record), session, booking

**Playlist**: an ordered list of Episodes with a type and a Visibility, and nothing else. A Playlist of type event is made for exactly one Event and opens with its event-frame Episode; a standard Playlist is a curated list with no Event.
_Avoid_: Agenda, course, series, collection

**Event-frame Episode**: the Episode that holds one Event's agenda, scope and organisation, first in that Event's Playlist. It has no video, is always unlisted and always published, and is never in the Episode overview.
_Avoid_: Event page (the Event's own page), agenda episode, intro

**Visibility**: whether an Episode or a Playlist is listed and indexed: public, or unlisted. An unlisted Episode lives only under the Event whose Playlist presents it; unlisted is not private, since anyone with the URL can open it.
_Avoid_: Private, hidden, draft, attendees-only

**canonicalEpisode**: the field of an unlisted Episode's metadata that names the public Episode it was derived from; its pages then point search engines at that Episode's own page instead of carrying `noindex`. An unlisted Episode that holds every Slide of a public Episode must name it.
_Avoid_: Original, source Episode, parent Episode

**Tooling page**: a catalogue of Slides served at `/episodes/<slug>/` beside the Episodes but no Episode itself: `slide-layouts`, `slide-master`, `slides`. It has no Visibility and no status, is never indexed and never in the sitemap.
_Avoid_: Layout reference (the page template), unlisted Episode, catalog Episode

**Format**: the shape an Episode is written in, one per Episode: Foundations, Teardown or Short.
_Avoid_: Type, kind, length

**Slide library**: every Master slide a Slide copies from the Slide master Episode (`src/components/episodes/slide-master/slides/`, `cp -r`), and every frame component, shared part and shared motion it imports (`src/components/slide-master/`, `src/components/slide-shared/`). Listed in `docs/design/slide-library.md`.
_Avoid_: Catalog

**Master slide**: one entry of the Slide library. The Dossier's `master:` key stays.
_Avoid_: Catalog entry, template

**Context drawer**: the floating card beside or over an Episode's Slides that shows the current Slide's Speaker notes and Voice script; a view onto text already in the page.
_Avoid_: Sidebar, notes panel, teleprompter

**Table of contents**: an Episode's own navigation: its Sections, numbered, with the active Section's page Slides expanded, plus the reading time left.
_Avoid_: Sitenav, sidebar

## Episode structure

**Section**: an Episode's second level: an ordered group of Slides whose first is its section slide, which names the Section. A Slide's heading level comes from its place in the Section, not from the Slide.
_Avoid_: Chapter, part

**Slide**: one frame in an Episode, stacked under the one before it: a page slide at least the viewport's height, a section slide at least 40% of it and, on the shared Slide header, on a band one step off the page; one folder named after its slug, carrying its own Scene, Speaker notes, Voice script and text, so an Episode is a composition of Slides and another Episode reuses a Slide by **Reference**, never by a copy. Its slug is unique across every Episode and the Slide pool; only a Title slide's may repeat. A Section's own slide is a **section slide**; the slides it holds are **page slides**.
_Avoid_: Card, panel; page, which means the Next.js route the whole Episode renders as; "self-contained Slide", since every Slide is one

**Slide pool**: one flat folder of Slide folders, `src/components/slide-pool/`, holding every Slide a second Episode reuses. A Slide lives in its Episode's `slides/` until its first reuse, when `npm run slides:reuse` moves its folder there unchanged: slug, text and anchors stay, so no published URL moves.
_Avoid_: Shared slides, library (the Slide library is the Master slides), common folder

**Reference (Slide)**: an Episode's listing of a pool Slide in one of its Sections: an import and a list entry, nothing copied. The Slide renders the same in every Episode that holds it; its anchor comes from its place in each, and so does the target of its `slideHref` link to a sibling: a sibling the Episode lacks fails the build unless the link falls back to plain text.
_Avoid_: Link, alias, copy, symlink

**Cornerstone Slide**: a Slide whose content, knowledge and definitions make it a building block other Slides and Episodes cite; it is often, not always, reused. Every Episode stands on its own, so a citing Slide quotes the cornerstone's words that carry meaning on their own and never its acronyms.
_Avoid_: Key slide, anchor slide

**Explorable explanation**: one interactive visual several Slides show, each by its own Preset, so a new Slide that shows it is new data, not a new drawing.
_Avoid_: Shared visual, cornerstone component, shared component, widget

**Preset**: one Slide's settings of an Explorable explanation: the view it opens in and what it lights, so the Slide tells its own story at rest.
_Avoid_: State, configuration, variant

**Workflow**: a way of working with AI that a viewer can watch and then try: ordered **Workflow stages**, each holding **Workflow jobs**, every job a fresh chat with its prompt and an example result. It belongs to the human-in-the-loop Explorable explanation, not to an Episode's per-run pipeline, so a Workflow stage or Workflow job is never a Run's **Stage** or **Job**.
_Avoid_: Pipeline, flow, process

**Title slide**: an Episode's opening Slide: its title, caption, optional Voice script and Speaker notes and, once recorded, its video. Not listed in the table of contents.
_Avoid_: Hero or cover for the Slide itself; **Hero motif** names the Episode's recurring visual idea the Title slide sets, never the Slide

**Hero motif**: an Episode's recurring visual idea, drawn from its Red thread. The Title slide sets it; each section slide echoes it and brings in elements of its own Section, foreshadowing what comes (a rocket on the Title slide, fuelled step by step across the section slides).
_Avoid_: Theme, key visual

**Slide header**: the Eyebrow, title and caption above a titled Slide's Scene. The Slide wrapper renders it for every Episode whose record does not set `header: 'authored'`, and types it in the first time the Slide is active, once.
_Avoid_: Title block, heading area

**Definition Slide**: a page slide that teaches one Concept and declares it with `defines: <concept-id>`; one that names no Concept fails the build.
_Avoid_: Glossary slide, term slide

**Eyebrow**: the small uppercase line above a page slide's title in its Slide header: its Section's title on the left, its place among the Section's page slides (`n / N`) on the right. Computed from the table of contents, never authored; section slides and the Title slide have none.
_Avoid_: Kicker, overline, label

**Scene**: the free interior of a Slide, below its Slide header, where its visualisation and layout live, ungoverned by the mechanics of the box around it. It has two layers: a **Backdrop** and a **Foreground**.
_Avoid_: Canvas (confuses with the HTML `<canvas>` element), inner slide, slide body

**Backdrop**: the full-bleed, decorative layer of a Scene, behind the Foreground. Clipped to its own Slide, hidden below `md` unless it opts in, hidden from assistive technology and pointer events, and left out of print.
_Avoid_: Background

**Foreground**: the primary layer of a Scene, inset so it never sits under the table of contents or the Context drawer. A Slide with no Backdrop is just a Foreground.
_Avoid_: Content, front layer

**Chrome**: what floats over the Slides and takes no layout space: the table of contents, the Context drawer and the talk player.
_Avoid_: Furniture, overlay

**Speaker notes**: a Slide's short list of talking points, each a Speaker note item.
_Avoid_: Notes, comments

**Speaker note item**: one talking point: a header, a description, optional titled sources and image, and the element of its Slide it explains.
_Avoid_: Note, bullet, comment

**Context reference**: an underlined phrase or a Context marker on a Slide that opens one Speaker note item in the Context drawer.
_Avoid_: Footnote, tooltip, annotation

**Context marker**: the Context drawer's speech-bubble icon as a small button beside a fact on a Slide, `(icon)` after a phrase or in an element's corner; the Context reference a new Episode puts on every fact whose Speaker note carries a source.
_Avoid_: Note icon, info button, badge

**Citation marker**: the `[n]` in a Speaker note item's description, the only superscript in the Context drawer, a number that points at source n of that note.
_Avoid_: Footnote, reference

**Voice script**: a Slide's teleprompter text, a list of Voice script segments.
_Avoid_: Transcript

**Voice script segment**: one timed passage of a Voice script: a title, keywords, the spoken text and, optionally, a Bridge. Its time span is never written; the spans add up to the Slide's reading time.
_Avoid_: Paragraph, line, cue card

**Bridge**: the closing line of a Voice script segment that hands the speaker over to the next Section.
_Avoid_: Transition, segue

## Episode production

**Brief**: the goals an Episode is written towards, fixed before any research: its audience, learning goal, actionables, hook and Threads, and the Spine that carries them out. The structured result of a grilling session; just enough to start. Its goals stay as settled once the draft exists; its Spine is kept in step with the Dossier until the Spec Gate and with the Spec after it.

**Spine**: the Brief's ordered Sections, each listing its **Brief Slides**: a planned page Slide's title, purpose and visual idea. The Red thread made concrete. It is kept in step with the Dossier until the Spec Gate and with the Spec after it: write-dossier keeps it title for title, and records every change as a `spine-change` note on its Job.
_Avoid_: Outline, pitch, plan

**Research plan**: retrieval's decision per research question, `research-plan.md` in the Episode folder: the questions that need a research job (new or refresh) and the ones whose llm-wiki research is reused. `customize-pipeline` writes one `write-research` job per listed item.
_Avoid_: Run log, retrieval log

**Dossier**: the draft the Spec is written from: its h1 is the Title slide, its h2s the Sections and its h3s the Slides, and each Slide carries its Visual idea, Speaker notes with citations and Voice script. Everything in it moves into the Spec, and it is deleted when Han approves the Spec.
_Avoid_: Manuscript, script, Episode file, companion, notes

**Red thread**: the single line of argument that runs from an Episode's hook to its learning goal, which every Section advances.
_Avoid_: Through-line, redline, golden thread

**Thread**: one of two parallel storylines in a longer Episode, the A thread and the B thread, told in turns so the audience never follows one story too long, each strengthening the other.
_Avoid_: Plot, subplot, storyline

**Staging**: where an Episode's text lives while it is being made, before it is final: its Brief, research, Dossier and Spec, outside the code.
_Avoid_: Drafts, workspace

**Promotion**: the step that closes a final Episode's making: it harvests Staging into lessons, cleanups and tickets, files the Spec's Options into the Design archive, keeps the Brief beside the Episode, and deletes Staging. No words move; the Slides already own them.
_Avoid_: Publish, migration, release

**Design archive**: every promoted Episode's design Options, one page per Slide with the picked one marked and the feedback that chose it, kept to browse and reuse in later Episodes.
_Avoid_: Spec archive, gallery

**Hand fix**: a `fix(...)` commit that corrects content a Run or a person made (an Episode, a Slide, a wiki note), outside a Run's job. It always says where its lesson goes, in a Feeds trailer.
_Avoid_: Patch, hotfix, manual edit

**Feeds trailer**: the `Feeds:` line of a Hand fix's commit message: the path of the skill, template or guide that should have got it right, an issue URL, or `none: <reason>`. The commit-time gate refuses a Hand fix without one, and a path must exist.
_Avoid_: Fix note, lesson line

**Run**: one execution of an Episode's per-run pipeline, from its start to the moment it is finished or abandoned. An Episode can have many Runs, each one comparable with the others.
_Avoid_: Session, execution, pipeline run

**Job**: one step of the per-run pipeline, such as writing the Dossier, which a Run does once or repeats until it passes. Each Job belongs to one Stage.
_Avoid_: Task, step

**Stage**: one of the ordered phases a Run moves through (Brief, Setup, Research, Dossier, Specification, Build, PR), grouping the Jobs that serve it. A Job waits only for Jobs of its own or an earlier Stage, and a Stage may hold no Job.
_Avoid_: Phase, step

**Spec**: the one page the Specification Stage writes in Staging, read in a browser: per Slide its options and what Build needs to build the chosen one. Han picks an option per Slide at its Gate, and Build builds from the Spec alone.
_Avoid_: Ticket, spec issue, build spec, design spec

**Attempt**: one try at a Job, numbered from 1. A retry is a new Attempt that names the Attempt it retries.
_Avoid_: Iteration, round

**Gate**: the point where a Run waits for Han's decision on a Job's output, from the moment the output is ready until he decides.
_Avoid_: Approval step, checkpoint, review stop

**Span**: a stretch of a Run with a start and an end, a status, and a parent: the Run itself, a Job, an Attempt, an agent working inside an Attempt, or a Gate. Spans nest, so a Run reads back as a tree.
_Avoid_: Step

**Score**: one verdict on a Span, from a named judge: a reviewer's rubric result, a check's result, or Han's decision at a Gate. A re-judgement is a new Score; the earlier one stays.
_Avoid_: Grade, rating, result

## Research categories

A research folder is named `<category>-<####>__<question-slug>`: the category below, a number counted per category across the repo, and the question's subject in 20-40 characters of kebab case. In the llm-wiki it sits in its category's folder, `docs/llm-wiki/research/<category>/`. The `categorize-research` job of `/new-episode` picks the category, or adds a new one here.

**AIE**: AI Enablement: how people and organizations learn to work with AI, and what it changes in their work.

**COG**: Cognition: how a person's attention and memory work, what they notice, keep and forget of what they hear and live through.

**LLM**: Large language models: how a model works, from its training data to its context window and sampling, and why that makes it behave as it does.

**ORG**: Organizations: how a company passes knowledge between its people, from onboarding a new hire to the know-how that never gets written down.

**SALES**: Sales: how a company finds, wins and closes its customers, from first lead to signed deal, and how a buyer finds, trusts and chooses a coach or consultant.

**START**: Startups: how an early-stage company builds and funds itself, and how its cash, costs and revenue move over time.

**WORK**: Technology and work: how tools and machines, from the plough to the computer, have changed how much people work, what work they do and who rises with them.

## Localization

**Translation file**: one locale's strings for one owner: the site's chrome and landing (`src/messages/`), one Episode, or one Slide (its folder's `i18n/`); English is the source every other locale is checked against. Localization libraries call it a catalog; that jargon stays out of this project.
_Avoid_: Catalog, messages file, dictionary

**Translation key**: the dotted path naming one string in a Translation file, e.g. `tableOfContents.title` site-wide, or `notes.attention-valley.header` in a Slide's own file.
_Avoid_: Catalog key, catalog path, message id
