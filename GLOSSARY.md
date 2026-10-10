---
stale_after: 2027-01-11T00:00:00Z
---

# Content library

Localized visualisations of theory content, captured from YouTube training videos and published in English and German.

## Product & Features

**Episode**: one page of visualised theory content, localized into en and de: its Slides stacked vertically, navigated by its table of contents. Its title is the page's h1; it holds Sections and has one YouTube recording per locale.
_Avoid_: Post, article, video, tower

**Episode overview**: the landing page's list of every Episode, published or upcoming, that a visitor browses and filters.
_Avoid_: Episode index, catalog, episode list, manifest

**Upcoming Episode**: an Episode announced in the Episode overview but not yet written: it has a slug and copy but no page, so its entry links nowhere.
_Avoid_: Draft, coming-soon episode, stub

**Topic**: a curated playlist of Episodes, mirrored as a YouTube playlist. Each Episode has one primary Topic, which gives it its icon and colour, and may also appear in other Topics.
_Avoid_: Category, theme

**Tag**: a free, atomic keyword on an Episode, used for search; an Episode carries many.
_Avoid_: Label, keyword

**Format**: the shape an Episode is written in, one per Episode: Foundations, Teardown or Short.
_Avoid_: Type, kind, length

**Context drawer**: the floating card beside or over an Episode's Slides that shows the current Slide's Speaker notes and Voice script; a view onto text already in the page.
_Avoid_: Sidebar, notes panel, teleprompter

**Table of contents**: an Episode's own navigation: its Sections, numbered, with the active Section's page Slides expanded, plus the reading time left.
_Avoid_: Sitenav, sidebar

## Episode structure

**Section**: an Episode's second level: an ordered group of Slides whose first is its section slide, which names the Section. A Slide's heading level comes from its place in the Section, not from the Slide.
_Avoid_: Chapter, part

**Slide**: one full-height frame in an Episode, stacked under the one before it; self-contained, carrying its own Scene, Speaker notes and Voice script, so an Episode is a composition of Slides. A Section's own slide is a **section slide**; the slides it holds are **page slides**.
_Avoid_: Card, panel; page, which means the Next.js route the whole Episode renders as

**Title slide**: an Episode's opening Slide: its title, caption and, once recorded, its video. Not listed in the table of contents.
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
_Avoid_: Transcript, manuscript

**Voice script segment**: one timed passage of a Voice script: a title, keywords, the spoken text and, optionally, a Bridge. Its time span is never written; the spans add up to the Slide's reading time.
_Avoid_: Paragraph, line, cue card

**Bridge**: the closing line of a Voice script segment that hands the speaker over to the next Section.
_Avoid_: Transition, segue

## Localization

**Translation file**: one locale's strings for the whole site, nested by namespace; English is the source every other locale is checked against. Localization libraries call it a catalog; that jargon stays out of this project.
_Avoid_: Catalog, messages file, dictionary

**Translation key**: the dotted path naming one string in a Translation file, e.g. `episodes.ai-token-economy.slides.the-lost-middle.title`.
_Avoid_: Catalog key, catalog path, message id
