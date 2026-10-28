---
type: glossary
title: Content library
stale_after: 2027-01-11T00:00:00Z
---

# Content library

Localized visualisations of theory content, captured from YouTube training videos and published in English and German.

## Product & Features

**Audience**: a level of AI enablement the library serves, independent of locale: **Individual**, a person learning for themselves, or **Organization**, a company enabling its people.
_Avoid_: International viewers, German businesses, segment, persona

**Episode**: one page of visualised theory content, localized into en and de: its Slides stacked vertically, navigated by its table of contents. Its title is the page's h1; it holds Sections and plays its Video once uploaded.
_Avoid_: Post, article, video, tower

**Episode browser**: the list of Episode cards, published or upcoming, that a visitor browses and filters, shared by the landing page and the `/episodes/` Overview (`src/episodes/components/episode-browser/`). It replaces the old meaning of "Episode overview", which now names only the `/episodes/` page (Overview).
_Avoid_: Episode index, catalog, episode list, manifest

**Overview**: a page listing every item of one resource: the page at `/episodes/` and the one at `/events/`, whose templates are `src/page-assembly/episode-overview/` and `src/page-assembly/events-overview/`. A code name only, in files and variables, never in a URL or on screen.
_Avoid_: Index page, list page

**Episode registry**: every Episode the code knows, generated from the Episode folders, so adding an Episode is adding its folder: a folder `src/episodes/<slug>/`, or an Event's `src/episodes/by-event/<event-slug>/<slug>/`, holding `episode-metadata.ts` is an Episode, and with `episode.ts` beside it, one with a page. One folder walker (`src/episodes/lib/episode-folders.ts`) finds them for the generator and every test that reads the folders. `npm run registry` writes it as checked-in `*.generated.ts` files (the Episode ids in the content store's catalogue, the metadata the content store loads, the compositions in the Episodes area's lib), each keyed by Episode id, the Resources listed and composed beside them by slug; the fast suite fails while it is stale. Code reads a page's composition through one lookup, by its EpisodeRef or a Resource's ref (`compositionOf`, `src/episodes/lib/registry.ts`).
_Avoid_: Episode index, slug list, hand-kept registration

**Episode id**: every Episode's one name across all Episodes, derived from its folder and never written in its record: its slug for an Episode no Event owns, `<event-slug>__<slug>` for an **Event copy**, an Episode an Event owns in its folder `by-event/<event-slug>/<slug>/`. A slug is unique among its siblings, so a copy usually keeps its original's slug; registries, the page catalogue and Playlists key on the id. Code passes an **EpisodeRef** and branches on its kind with `matchEpisode` (`src/content-store/catalogue/episode-id.pure.ts`). `by-event` is reserved, never a slug.
_Avoid_: Episode key, full slug, prefixed slug

**EpisodeRef**: an Episode as code passes it: its kind (no Event owns it, or it is an Event copy), its Episode id, its slug and, for a copy, its owning Event, each a field. The content store reads an Episode id into its EpisodeRef once, when the records load, and hands out the EpisodeRef with every Episode, Playlist entry and Episode page; nothing downstream reads the id's format.
_Avoid_: Episode id string, parsed id

**Upcoming Episode**: an Episode announced in the Episode browser but not yet published: its video is not out. It may already have a page, reachable by its URL alone; either way its entry links nowhere.
_Avoid_: Draft, coming-soon episode, stub

**Tag**: the one way Episodes are grouped: an id from a closed vocabulary of six, whose name and tooltip are translated per locale. An Episode carries several; the first is its **lead Tag**, which fixes the icon and accent of its card. A card shows its Tags, and search matches their names.
_Avoid_: Topic, category, theme, label, keyword

**Event**: a dated workshop or webinar that presents one Playlist. Its slug is its date then its name (`2026-10-23-axel-agentic-workflow`); it records its kind, the Audience it targets, its Organizers (lead first), its Tags (lead Tag first), an optional time, and where it takes place: onsite at a venue, remote on a platform, or hybrid. It owns its Event copies, in `src/episodes/by-event/<event-slug>/`, and no Slides directly, holds no text (its title and description are Translation keys) and has no visibility of its own. One record each in the content store (`src/content-store/events/`); its page is `/events/<event-slug>/`, and each Episode its Playlist lists has an **Event-scoped Episode page** at `/events/<event-slug>/episodes/<episode-slug>/`: the Episode's page with the Event's breadcrumb, past notice, place in the Playlist and walk to the previous and next Episode.
_Avoid_: Workshop (the old name; its `/workshops/` URLs 301 to the Event), session, occasion, course

**Organizer**: who runs an Event, named on its record, lead first, from a closed list, `ORGANIZER_IDS` in the content store's `schemas/fields.ts` (`hancrafted`, `axel`, `cyberforum`); the `ORGANIZERS` registry gives each its name and url. Required: the store refuses an Event without one or with one outside the list.
_Avoid_: Host, client, partner, venue

**Event registry**: every Event the code knows, generated from the Event files, so adding an Event is adding its file `src/content-store/events/<slug>.ts`. `npm run registry` writes it beside the Episode registry: the Event slugs in lib, the records the content store loads; the fast suite fails while it is stale.
_Avoid_: Event slug list, hand-kept Event pages

**Playlist**: an ordered list of Playlist entries and its visibility, nothing else. An **event Playlist** is one an Event presents, read from the Event side, never stored; it may list unlisted Episodes, while a public Playlist no Event presents lists only public ones. One record each in the content store (`src/content-store/playlists/`).
_Avoid_: Agenda, series, collection

**Playlist entry**: one numbered step of a Playlist: an Episode id, or an Episode with an `anchor`, opening it at that Section. An Episode may be listed again at another anchor, so the intro returns for each check-in; its card then shows only that Section's title. "n of m" counts every entry; the Episode's page takes its place from its first.
_Avoid_: Playlist item, step

**visibility**: whether a record is listed and indexed: `public` or `unlisted`, required on every Episode and Playlist, so a forgotten one is refused and fails closed. Unlisted is not private: anyone holding the URL can open the page. `attendees` is refused until the platform horizon gives it an enforcer.
_Avoid_: Status, private, hidden, draft

**unlisted Episode**: an Episode whose visibility is `unlisted`: a composition made for one Event, usually its Slides copied (`cp -r`) from a public Episode and left to drift. It is an Event copy: registered once like any Episode by its Episode id, its folder in its Event's `by-event/<event-slug>/`, it lives only at its Event-scoped Episode page, has no `/episodes/` page, is `noindex`, never in the sitemap, the Episode browser or Upcoming Episodes, and is refused when it lives outside `by-event/` or no Event's Playlist lists it. Flipping its `visibility` to `public` is the one edit that indexes its Event-scoped page and adds it to the sitemap; it gets no `/episodes/` page. The page catalogue decides all of this.
_Avoid_: Private Episode, hidden Episode, attendee page

**page catalogue**: every page the site has, read from the records, each with its treatment: built or not, in the sitemap, indexed, on the site's own lists, and where its canonical points (`src/content-store/catalogue/page-catalogue.ts`, served by the content store as `PAGES` and `treatmentOf`). One visibility predicate (`pageTreatment`) gives each treatment; the routes' static params, page metadata, the sitemap, the Episode browser and the `/events/` list all ask the catalogue, so they cannot disagree. It also maps both ways between a built page and its route's params: the static params, and the page a route's params name, or none (`episodesPathPageAt`, `eventEpisodePageAt`, an Event-scoped page with the Episode it presents), which the page template turns into the 404.
_Avoid_: route list, page list, hand-kept page list

**Video**: a YouTube video an Episode's page plays from its Title slide, declared as `youtube` in the Episode's metadata and optional until uploaded; visibility decides how many. A public Episode has at most one per locale: none, English, German or both. An unlisted Episode has at most one, its **Event recording**: one YouTube id with the language spoken at its Event, played on both locale pages and labelled with that language before play. The content store refuses a second Video on an unlisted Episode and a language that is not a site locale.
_Avoid_: Clip, recording link

**Format**: the shape an Episode is written in, one per Episode: Foundations, Teardown or Short.
_Avoid_: Type, kind, length

**Resource**: every public, listed item of the site: an Episode, an Event, an Explorable page, an Episode template or a Master slide. `/resources/` lists them all with a kind filter, as the **Resource index**. The header's Learn menu links to it. Feature doc `docs/features/resources.md`; design-ADR `docs/adr/0019-resources-overview.md`.
_Avoid_: Tooling page, Layout reference, reference Episode, Asset

**Resource index**: the projection of the page catalogue onto one entry shape (`ResourceEntry`: kind, title, description, Tags, URL, locale), one entry per listed page. Derived, never stored, so it cannot list a page the site does not list. The groundwork for search and retrieval by people and agents. Feature doc `docs/features/resources.md`.
_Avoid_: Resource list, Resource catalogue

**Template**: the record kind of an Episode template or a Master slide (types `episode-template` and `master-slide`), a page shaped like an Episode: an `episode()` composition of Slides rendered through the one Episode container, so it has the table of contents and the Context drawer. Its record holds a slug, a type, Tags and a visibility; its title and description are the composition's own words. It keeps its URL, `/episode-templates/<slug>/` or `/master-slides/<slug>/`, is public, indexed and in the sitemap, and is in no Episode list. Records in `src/content-store/templates/` and compositions in `src/episodes/templates/`. The five: Episode template, Workshop template and Explorable page template (Episode templates), Timelines and Grids (Master slides). Replaces the old Resource record kind.
_Avoid_: Resource (that is the umbrella), Tooling page

**Workshop template**: the Template (an Episode template, `/episode-templates/workshop-template/`) a new Event's opening Episode is copied from (`src/episodes/templates/workshop-template/`): a Title slide, then a hook, agenda, in-scope and out-of-scope, a poll, About me (its own Section) and orga Slides, every word but About me's a placeholder. Its copy becomes an unlisted Episode, first in the Event's Playlist; the steps are the Events guide's "Add an Event" (`docs/features/events.md`).
_Avoid_: Event template, intro template, workshop Episode

**Explorable page template**: the Template (an Episode template, `/episode-templates/explorable-page/`) a new Explorable page is copied from (`src/episodes/templates/explorable-page/`): a Title slide whose title states the payoff, a hook Section, what it is, why it matters, and how to use it, ending on the primary Explorable with every option on (Context window stands in). Every word is a placeholder; the structure is convention, not enforced. Its hook and how-to-use Sections have their section slide off. See `docs/features/explorables/README.md`.

**Hook slide**: the Workshop template's `hook` Slide, right after the Title slide: one placeholder Slide that is either a hook (one question or claim that opens the session) or a grounding (the picture the session builds on). A copy that grounds renames its slug to `grounding`; a copy that hooks keeps it.
_Avoid_: Intro slide, opener

**Slide library**: every Master slide a Slide copies from the Master slide Templates, Timelines and Grids (`src/episodes/templates/timelines/slides/`, `src/episodes/templates/grids/slides/`, `cp -r`), and every frame component, shared part and shared motion it imports (`src/episodes/components/slide-master/`, `src/episodes/components/slide-shared/`). Listed in `docs/design/slide-library.md`.
_Avoid_: Catalog

**Slide pool**: the content Slides several Episodes compose as they are, one folder each under `src/episodes/slide-pool/`, beside the Episode folders. Each Episode keeps its own Title slide, section slides and Section files, which import a pool Slide through the `@/` alias; a Title slide or section slide never enters it. A Slide is promoted to the pool deliberately; copying stays the default. A fix to a pool Slide changes every Episode that composes it, past Events' copies included. Where else a reused thing goes: FE-004-slide-architecture.
_Avoid_: shared Slides, Slide library (the Master slides a Slide is copied from), common Slides

**Master slide**: one entry of the Slide library, a Slide folder of a Master slide Template (Timelines or Grids). The Dossier's `master:` key stays.
_Avoid_: Catalog entry, template

**Context drawer**: the floating card beside or over an Episode's Slides that shows the current Slide's Speaker notes and Voice script; a view onto text already in the page.
_Avoid_: Sidebar, notes panel, teleprompter

**Table of contents**: an Episode's own navigation: its Sections, numbered, with the active Section's page Slides expanded, plus the reading time left.
_Avoid_: Sitenav, sidebar

## Episode structure

**Section**: an Episode's second level: an ordered group of Slides whose first is its section slide, which names the Section. A Section may declare it has no section slide (default: it has one); the Slide stays authored for the title but is not shown, the table of contents takes the Section's title from it, and the Section's anchor lands on the first page Slide. The Title slide is never optional. The section slide is on by default and a Section may declare it has none: the Section then takes its table-of-contents title from its own words and its anchor lands on its first Slide (planned, #404). A Slide's heading level comes from its place in the Section, not from the Slide.
_Avoid_: Chapter, part

**Slide**: one frame in an Episode, stacked under the one before it: a page slide at least the viewport's height, a section slide at least 40% of it and, on the shared Slide header, on a band one step off the page; one folder named after its slug, carrying its own Scene, Speaker notes, Voice script and text, so an Episode is a composition of Slides and a Slide copies into another Episode with one import and one list entry. A Section's own slide is a **section slide**; the slides it holds are **page slides**.
_Avoid_: Card, panel; page, which means the Next.js route the whole Episode renders as; "self-contained Slide", since every Slide is one

**Anchor**: a Slide's id in its Episode page's URL, given by its position: a section slide's is its Section's slug (`check-in-1`), a page Slide's `<section>--<slide>` (`in-scope--out-of-scope`); the Title slide's is `top`. A published Episode keeps its anchors, since shared links point at them, and a Playlist entry opens its Episode at one.
_Avoid_: Fragment, hash, slide id

**Cornerstone Slide**: a Slide whose content, knowledge and definitions make it a building block other Slides and Episodes cite; it is often, not always, reused. Every Episode stands on its own, so a citing Slide quotes the cornerstone's words that carry meaning on their own and never its acronyms.
_Avoid_: Key slide, anchor slide

**Explorable**: the reusable interactive component: one visual that Slides show, each by its own Preset, so a new Slide that shows it is new data, not a new drawing. Usable anywhere on the site, foremost in Slides. Each lives in its own folder under `src/explorables/`, apart from the plain shared parts in `slide-shared/`. A Slide that shows an Explorable links "Explore it →" to the Explorable's page when one exists. The floor every Explorable meets: `docs/features/explorables/README.md`.
_Avoid_: Explorable explanation (the long form, as Wikipedia names it), Shared visual, cornerstone component, shared component, widget

**Explorable page**: the product built on one Explorable: an Episode-shaped composition of Slides about its primary Explorable, rendered through the one Episode container, so it has the table of contents, the Context drawer, Speaker notes citing Research and a YouTube Video played from its Title slide. Its slug equals the primary Explorable's folder slug, and the content store refuses a page whose slug names no Explorable. URL `/explorables/<slug>/`, listed on `/explorables/`; `/explorable-explanations/*` redirects there. A product unit beside the Episode (`docs/steering/product-vision.md`, rule 4); its convention and Short framing: `docs/features/explorables/README.md`.
_Avoid_: Explorable explanation page, Resource page

**Preset**: one Slide's settings of an Explorable: the view it opens in and what it lights, so the Slide tells its own story at rest.
_Avoid_: State, configuration, variant

**Workflow**: a way of working with AI that a viewer can watch and then try: ordered **Workflow stages**, each holding **Workflow jobs**, every job a fresh chat with its prompt and an example result. It belongs to the human-in-the-loop Explorable, not to an Episode's per-run pipeline, so a Workflow stage or Workflow job is never a Run's **Stage** or **Job**.
_Avoid_: Pipeline, flow, process

**Title slide**: an Episode's opening Slide: its title, caption, optional Voice script and Speaker notes and, once recorded, its video. Not listed in the table of contents.
_Avoid_: Hero or cover for the Slide itself; **Hero motif** names the Episode's recurring visual idea the Title slide sets, never the Slide

**Hero motif**: an Episode's recurring visual idea, drawn from its Red thread. The Title slide sets it; each section slide echoes it and brings in elements of its own Section, foreshadowing what comes (a rocket on the Title slide, fuelled step by step across the section slides).
_Avoid_: Theme, key visual

**Slide header**: the Eyebrow, title and caption above a titled Slide's Scene. The Slide wrapper renders it for every Episode whose record does not set `header: 'authored'`, and types it in the first time the Slide is active, once.
_Avoid_: Title block, heading area

**Eyebrow**: the small uppercase line above a page slide's title in its Slide header: its Section's title on the left, its place among the Section's page slides (`n / N`) on the right. Computed from the table of contents, never authored; section slides and the Title slide have none.
_Avoid_: Kicker, overline, label

**Scene**: the free interior of a Slide, below its Slide header, where its visualisation and layout live, ungoverned by the mechanics of the box around it. It has two layers: a **Backdrop** and a **Foreground**.
_Avoid_: Canvas (confuses with the HTML `<canvas>` element), inner slide, slide body

**Backdrop**: the full-bleed, decorative layer of a Scene, behind the Foreground. Clipped to its own Slide, hidden below `md` unless it opts in, hidden from assistive technology and pointer events, and left out of print.
_Avoid_: Background

**Foreground**: the primary layer of a Scene, inset so it never sits under the table of contents or the Context drawer. A Slide with no Backdrop is just a Foreground.
_Avoid_: Content, front layer

**Page chrome**: the parts around a page's content that any page may carry: the site header with its language and theme toggles, the footer bar, the table of contents and the Context drawer, in `src/shared/page-chrome/`. It knows nothing of the domain and takes what it needs as props; page assembly and the Episode page container place it. On an Episode page the table of contents and the Context drawer float over the Slides with the talk player, which stays in Episodes with the video it plays, and take no layout space.
_Avoid_: Chrome, furniture, overlay

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

**Translation file**: one locale's strings for one owner, in its folder's `i18n/`: a page template, a product area or its component, page chrome, one Episode, or one Slide. The owners' files outside Episodes and Slides merge into one message set (`src/page-assembly/translations.ts`), each top-level namespace defined by one owner; English is the source every other locale is checked against. Localization libraries call it a catalog; that jargon stays out of this project.
_Avoid_: Catalog, messages file, dictionary

**Translation key**: the dotted path naming one string in a Translation file, e.g. `tableOfContents.title` in page chrome's file, or `notes.attention-valley.header` in a Slide's own file.
_Avoid_: Catalog key, catalog path, message id
