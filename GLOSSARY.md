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

**Topic**: a curated playlist of Episodes, mirrored as a YouTube playlist. Each Episode has one primary Topic, which gives it its icon and colour, and may also appear in other Topics.
_Avoid_: Category, theme

**Tag**: a free, atomic keyword on an Episode, used for search; an Episode carries many.
_Avoid_: Label, keyword

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

**Slide**: one full-height frame in an Episode, stacked under the one before it; one folder named after its slug, carrying its own Scene, Speaker notes, Voice script and text, so an Episode is a composition of Slides and a Slide copies into another Episode with one import and one list entry. A Section's own slide is a **section slide**; the slides it holds are **page slides**.
_Avoid_: Card, panel; page, which means the Next.js route the whole Episode renders as; "self-contained Slide", since every Slide is one

**Title slide**: an Episode's opening Slide: its title, caption, optional Voice script and Speaker notes and, once recorded, its video. Not listed in the table of contents.
_Avoid_: Hero, cover

**Scene**: the free interior of a Slide, where its visualisation and layout live, ungoverned by the mechanics of the box around it. It has two layers: a **Backdrop** and a **Foreground**.
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

**Context reference**: an underlined phrase in a Slide's text that opens one Speaker note item in the Context drawer.
_Avoid_: Footnote, tooltip, annotation

**Citation marker**: the `[n]` in a Speaker note item's description, the only superscript in the Context drawer, a number that points at source n of that note.
_Avoid_: Footnote, reference

**Voice script**: a Slide's teleprompter text, a list of Voice script segments.
_Avoid_: Transcript

**Voice script segment**: one timed passage of a Voice script: a title, keywords, the spoken text and, optionally, a Bridge. Its time span is never written; the spans add up to the Slide's reading time.
_Avoid_: Paragraph, line, cue card

**Bridge**: the closing line of a Voice script segment that hands the speaker over to the next Section.
_Avoid_: Transition, segue

## Episode production

**Brief**: the goals an Episode is written towards, fixed before any research: its audience, learning goal, actionables, hook and Threads, and the Spine that carries them out. The structured result of a grilling session; just enough to start. Its goals stay as settled once the draft exists; its Spine is kept in step with the Dossier.

**Spine**: the Brief's ordered Sections, each listing its **Brief Slides**: a planned page Slide's title, purpose and visual idea. The Red thread made concrete. write-dossier keeps it title for title, and names every change in a `Spine change:` line of its run-log entry.
_Avoid_: Outline, pitch, plan

**Dossier**: the draft the Spec is written from: its h1 is the Title slide, its h2s the Sections and its h3s the Slides, and each Slide carries its Visual idea, Speaker notes with citations and Voice script. Everything in it moves into the Spec, and it is deleted when Han approves the Spec.
_Avoid_: Manuscript, script, Episode file, companion, notes

**Red thread**: the single line of argument that runs from an Episode's hook to its learning goal, which every Section advances.
_Avoid_: Through-line, redline, golden thread

**Thread**: one of two parallel storylines in a longer Episode, the A thread and the B thread, told in turns so the audience never follows one story too long, each strengthening the other.
_Avoid_: Plot, subplot, storyline

**Staging**: where an Episode's text lives while it is being made, before it is final: its Brief, research, Dossier and Spec, outside the code.
_Avoid_: Drafts, workspace

**Promotion**: the step that moves a final Episode's words out of its Spec and into its code folder, one text file per Slide, after which Staging is deleted.
_Avoid_: Publish, migration, release

**Run**: one execution of an Episode's per-run pipeline, from its start to the moment it is finished or abandoned. An Episode can have many Runs, each one comparable with the others.
_Avoid_: Session, execution, pipeline run

**Job**: one step of the per-run pipeline, such as writing the Dossier, which a Run does once or repeats until it passes. Each Job belongs to one Stage.
_Avoid_: Task, step

**Stage**: one of the ordered phases a Run moves through (Brief, Setup, Research, Dossier, Specification, Build, PR), grouping the Jobs that serve it. A Job waits only for Jobs of its own or an earlier Stage, and a Stage may hold no Job.
_Avoid_: Phase, step

**Spec**: the one page the Specification Stage writes in Staging, read in a browser: per Slide its Options and what Build needs to build the chosen one. Han picks an Option per Slide at its Gate, and Build builds from the Spec alone.
_Avoid_: Ticket, spec issue, build spec, design spec

**Option**: one of two or three ways a Slide could look, shown side by side in the Spec at low to medium fidelity, each with its reason. Han picks one per Slide.
_Avoid_: Variant, alternative, mock

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

**SALES**: Sales: how a company finds, wins and closes its customers, from first lead to signed deal, and how a buyer finds, trusts and chooses a coach or consultant.

**START**: Startups: how an early-stage company builds and funds itself, and how its cash, costs and revenue move over time.

## Localization

**Translation file**: one locale's strings for one owner: the site's chrome and landing (`src/messages/`), one Episode, or one Slide (its folder's `i18n/`); English is the source every other locale is checked against. Localization libraries call it a catalog; that jargon stays out of this project.
_Avoid_: Catalog, messages file, dictionary

**Translation key**: the dotted path naming one string in a Translation file, e.g. `tableOfContents.title` site-wide, or `notes.attention-valley.header` in a Slide's own file.
_Avoid_: Catalog key, catalog path, message id
