# Content library

Localized visualisations of theory content, captured from YouTube training videos and published in English and German.

## Product

**Episode**: one page of visualised theory content, localized into en and de: its Slides stacked vertically beside its table of contents. Its title is the page's h1; it holds Sections and has one YouTube recording per locale.
_Avoid_: Post, article, video, tower

## Episode structure

**Section**: an Episode's second level: an ordered group of Slides whose first is its section slide, which names the Section. A Slide's heading level comes from its place in the Section, not from the Slide.
_Avoid_: Chapter, part

**Slide**: one full-height frame in an Episode, stacked under the one before it; self-contained, carrying its own Canvas, Speaker notes and Voice script, so an Episode is a composition of Slides. A Section's own slide is a **section slide**; the slides it holds are **page slides**.
_Avoid_: Card, panel; page, which means the Next.js route the whole Episode renders as

**Title slide**: an Episode's opening Slide: its title, caption and, once recorded, its video. Not listed in the table of contents.
_Avoid_: Hero, cover

**Content area**: the single-column grid that holds an Episode's Slide wrappers, owns the spacing between Slides and hosts the Episode's portal root.
_Avoid_: Main, article body, slide list, slides slot

**Slide wrapper**: the server-rendered box around one Slide that holds its mechanics: anchor, at least viewport height, never clipping, and the mount that drops far content.
_Avoid_: Slide frame, outer slide, slide container

**Canvas**: the free interior of a Slide, where its visualisation and layout live, ungoverned by the Slide wrapper's mechanics.
_Avoid_: Inner slide, slide body

**Zone**: where a Slide stands relative to the reader: far (content unmounted), near (mounted, paused) or active (mounted, playing, the current Slide).
_Avoid_: Visibility state, scroll phase

**Slide master**: the shared slide frame and type scale that every Slide layout composes, named after PowerPoint's.
_Avoid_: Master, base slide, template

**Slide layout**: one slide design composed from the Slide master, e.g. section slide, basic page slide, three-column page slide.
_Avoid_: Variant, slide type, schema

**Speaker notes**: a Slide's short list of talking points, each a Speaker note item.
_Avoid_: Notes, comments

**Speaker note item**: one talking point: a header, a description, optional titled sources and image, and the element of its Slide it explains.
_Avoid_: Note, bullet, comment

**Context reference**: an underlined phrase inside a Slide's text that names one Speaker note item and opens it in the Context drawer; a button, not a link, and it carries no number.
_Avoid_: Footnote, tooltip, annotation

**Citation marker**: the `[n]` in a Speaker note item's description, the only superscript in the Context drawer, a number that points at source n of that note.
_Avoid_: Footnote, reference

**Voice script**: a Slide's teleprompter text, a list of Voice script segments.
_Avoid_: Transcript, manuscript

**Voice script segment**: one timed passage of a Voice script: a time span in minutes, a title, keywords, the spoken text and, optionally, a Bridge.
_Avoid_: Paragraph, line, cue card

**Bridge**: the closing line of a Voice script segment that hands the speaker over to the next Section.
_Avoid_: Transition, segue

**Context drawer**: the floating card beside or over an Episode's Slides that shows the current Slide's Speaker notes and Voice script; a view onto text already in the page.
_Avoid_: Sidebar, notes panel, teleprompter

**Context drawer input**: the one typed value the Context drawer renders from: items (an element id, title, Speaker notes, Voice script) plus translated labels. An adapter builds it; the drawer knows nothing of Episodes.
_Avoid_: Drawer props, entries

**Table of contents**: an Episode's own navigation: its Sections, numbered, with the active Section's page Slides expanded, plus the reading time left. A sticky panel on wide screens, a pill-opened drawer on narrow ones.
_Avoid_: Sitenav, sidebar

## Localization

**Translation file**: one locale's strings for the whole site, nested by namespace; English is the source every other locale is checked against. Localization libraries call it a catalog; that jargon stays out of this project.
_Avoid_: Catalog, messages file, dictionary

**Translation key**: the dotted path naming one string in a Translation file, e.g. `episodes.ai-token-economy.slides.the-lost-middle.title`.
_Avoid_: Catalog key, catalog path, message id
