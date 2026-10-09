# Episode translation keys

Read before adding or changing an Episode, a slide, or any string in `src/messages/<locale>.json`.

The binding rules (key shape, slugs never positions, leaf strings only, ICU for variable text, every key in both Translation files) live in [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md) §5. This guide holds the role vocabulary and worked examples.

## Key shape, by example

```
episodes.page-template.title                                              → Title slide h1
episodes.page-template.caption                                            → Title slide caption
episodes.page-template.description                                        → meta description (FE-008)
episodes.page-template.sections.foundations.title                         → section slide h2, TOC label
episodes.page-template.sections.foundations.slides.three-layers.caption   → page slide caption
episodes.page-template.sections.foundations.slides.three-layers.columns.layouts.prose
```

Speaker notes and Voice script keys ([FE-010](../../.archgate/adrs/FE-010-context-drawer.md) §6) hang off the Slide, or off the Section for a section slide:

```text
episodes.<episode>.sections.<section>.slides.<slide>.notes.<note>.header
episodes.<episode>.sections.<section>.slides.<slide>.notes.<note>.description
episodes.<episode>.sections.<section>.slides.<slide>.notes.<note>.image.alt
episodes.<episode>.sections.<section>.slides.<slide>.notes.<note>.sources.<source>.title
episodes.<episode>.sections.<section>.slides.<slide>.voiceScript.segments.<segment>.title
episodes.<episode>.sections.<section>.slides.<slide>.voiceScript.segments.<segment>.keywords
episodes.<episode>.sections.<section>.slides.<slide>.voiceScript.segments.<segment>.script
episodes.<episode>.sections.<section>.slides.<slide>.voiceScript.segments.<segment>.bridge
```

`keywords` is one leaf: a comma-separated string. `<note>` and `<segment>` are kebab-case slugs. A `source`'s title is a leaf; its `url` is not. A description cites its sources with plain `[1]`, `[2]` markers, numbered in the order of the note's `sources`; every marker must name an existing source. Slide text can wrap one phrase in `<ref>…</ref>` (read with `t.rich`) for a `ContextRef`. Time spans, `target`, source `slug`s and `url`s and `image.src` are not strings in the Translation file; they sit in the Episode's record (see `src/components/episodes/amnesiac-freelancer/slides/`).

Chrome shared by all Episodes (e.g. `tableOfContents.title`) sits outside `episodes.*` and is not bound by the role table.

## Role vocabulary

| Role          | Meaning                                              | Used on                         |
| ------------- | ---------------------------------------------------- | ------------------------------- |
| `title`       | the unit's heading; also its table-of-contents label | episode, section, slide, column |
| `caption`     | one-line framing under the title                     | episode, section, slide         |
| `description` | the page's meta description for search results       | episode                         |
| `prose`       | a body paragraph                                     | slide, column                   |
| `header`      | a speaker note's heading                             | note                            |
| `script`      | spoken text of a voice script segment                | segment                         |

Add a role only when a new Slide layout needs a leaf none of these describe, and add it to this table in the same change.

## Worked notes

- Counts and names go through ICU arguments: `"{count, plural, one {# slide} other {# slides}}"`, passed as `t('next-steps.caption', { count })`.
- A Section without page Slides has no `slides` key: `title` and `caption` sit directly on the Section.
- `src/components/episodes/page-template/page-template.tsx` is the reference Episode: one function per Slide, reading its keys through one `getTranslations` namespace.

## Landing page cards

The landing page lists Episodes from the Episode index (`src/lib/episode-index.json`), which holds ids, dates and ranks but no strings. A card reads its text from:

- A published Episode: `episodes.<slug>.title` and `episodes.<slug>.caption`, the keys its own page already uses.
- An upcoming Episode: `landing.episodeIndex.upcoming.<slug>.title` and `.caption`. Move them to `episodes.<slug>.*` when it is published.
- Every Episode: `landing.episodeIndex.topics.<topic>` and `landing.episodeIndex.formats.<format>`, one per id in `src/lib/episode-index.pure.ts`.
- Card chrome: `landing.episodeIndex.open` and `landing.episodeIndex.comingSoon`.

`page-template` is the layout reference, not content: it is not in the index, and the landing page links to it separately.
