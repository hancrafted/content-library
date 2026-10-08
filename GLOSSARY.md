# Content library

Localized visualisations of theory content, captured from YouTube training videos and published in English and German.

## Product

**Episode**: one next js tower page, representing one piece of visualised theory content, localized into en and de. Its title is the page's h1; it holds Sections.
_Avoid_: Post, article, video

## Episode structure

**Section**: an Episode's second level, a renderable unit with its own section slide, holding zero or more page Slides.
_Avoid_: Chapter, part

**Slide**: one full-height frame in an Episode's tower. A Section's own slide is a **section slide**; the slides it holds are **page slides**.
_Avoid_: Card, panel; page, which means the Next.js route the whole Episode renders as

**Master**: the shared slide frame and type scale that every variant composes.
_Avoid_: Base slide, template

**Variant**: a slide layout composed from the master, e.g. section slide, basic page slide, three-column page slide.
_Avoid_: Slide type, schema
