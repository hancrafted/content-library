# Content library

Localized visualisations of theory content, captured from YouTube training videos and published in English and German.

## Product

**Episode**: one page of visualised theory content, localized into en and de: its Slides stacked vertically beside its table of contents. Its title is the page's h1; it holds Sections and has one YouTube recording per locale.
_Avoid_: Post, article, video, tower

## Episode structure

**Section**: an Episode's second level, a renderable unit with its own section slide, holding zero or more page Slides.
_Avoid_: Chapter, part

**Slide**: one full-height frame in an Episode, stacked under the one before it. A Section's own slide is a **section slide**; the slides it holds are **page slides**.
_Avoid_: Card, panel; page, which means the Next.js route the whole Episode renders as

**Title slide**: an Episode's opening Slide: its title, caption and, once recorded, its video. Not listed in the table of contents.
_Avoid_: Hero, cover

**Slide master**: the shared slide frame and type scale that every Slide layout composes, named after PowerPoint's.
_Avoid_: Master, base slide, template

**Slide layout**: one slide design composed from the Slide master, e.g. section slide, basic page slide, three-column page slide.
_Avoid_: Variant, slide type, schema

**Speaker notes**: a Slide's short list of talking points, each a Speaker note item.
_Avoid_: Notes, comments

**Speaker note item**: one talking point: a header, a description, optional sources and image, and the element of its Slide it explains.
_Avoid_: Note, bullet, comment

**Voice script**: a Slide's teleprompter text, a list of Voice script segments.
_Avoid_: Transcript, manuscript

**Voice script segment**: one timed passage of a Voice script: a time span in minutes, a title, keywords, the spoken text and, optionally, a Bridge.
_Avoid_: Paragraph, line, cue card

**Bridge**: the closing line of a Voice script segment that hands the speaker over to the next Section.
_Avoid_: Transition, segue

**Context drawer**: the panel beside an Episode that shows the current Slide's Speaker notes and Voice script; a view onto text already in the page.
_Avoid_: Sidebar, notes panel, teleprompter

**Table of contents**: an Episode's own navigation: its Sections, numbered, with the active Section's page Slides expanded, plus the reading time left. A sticky panel on wide screens, a pill-opened drawer on narrow ones.
_Avoid_: Sitenav, sidebar
