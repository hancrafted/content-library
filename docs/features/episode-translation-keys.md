---
type: feature-guide
title: Episode translation keys
stale_after: 2027-01-11T00:00:00Z
---

# Episode translation keys

Read before adding or changing an Episode, a Slide, or any Translation file. The binding rules live in [FE-002 §5](../../.archgate/adrs/FE-002-episode-page.md#5-strings-and-anchors-keyed-by-slide-slug). This guide holds the role vocabulary and a worked example.

## Key shape

A Slide keeps its strings in its own folder, `slides/<slide>/i18n/en.json` and `de.json`; its Episode's own text sits in `<episode>/i18n/`. The site-wide Translation files (`src/messages/`) hold no published Episode's text; an Upcoming Episode's card copy is landing text ([Episode overview entries](#episode-overview-entries)):

```text
<episode>/i18n/<locale>.json                  title, caption, description of the Episode
<episode>/slides/<slide>/i18n/<locale>.json   <role>: one string of one Slide
```

The German file must have the English file's shape: a missing key fails `tsc` inside the Slide. Keys are flat by role, with no Episode, Section or Slide prefix: the Episode's `title` is its Title slide `h1` and `<title>`, `caption` the Title slide caption, `description` the meta description (FE-008).

A Section's own slide is a Slide like any other: its `title` names the Section and is the table-of-contents label. The Slide's `slide.tsx` reads its strings with `t('<role>')` over its own files, so the slug is written once, in its `slug`.

## Role vocabulary

| Role                                  | Meaning                                                                                  | Used on                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------- |
| `title`                               | the Slide's heading and table-of-contents label; absent on an untitled Slide             | Slide                            |
| `caption`                             | one-line framing under the title                                                         | Slide                            |
| `prose`                               | body paragraph                                                                           | Slide                            |
| `columns.<column>.{title,prose}`      | one column of a three-column Slide, keyed by its slug                                    | Slide                            |
| `notes.<note>.header`                 | Speaker note item heading                                                                | Speaker note                     |
| `notes.<note>.description`            | Speaker note item text; cites sources as `[1]`, `[2]`                                    | Speaker note                     |
| `notes.<note>.sources.<source>.title` | a cited source's title                                                                   | Speaker note, if it has sources  |
| `notes.<note>.image.alt`              | alt text of the note's image                                                             | Speaker note, if it has an image |
| `voiceScript.segments.<seg>.title`    | Voice script segment heading                                                             | Voice script segment             |
| `voiceScript.segments.<seg>.keywords` | one leaf, comma-separated                                                                | Voice script segment             |
| `voiceScript.segments.<seg>.script`   | the spoken text                                                                          | Voice script segment             |
| `voiceScript.segments.<seg>.bridge`   | closing line handing over to the next Section; only if the Slide declares `bridge: true` | Voice script segment             |

`<note>`, `<seg>`, `<column>` and `<source>` are kebab-case slugs. A Slide may add a leaf no role describes (the untitled Slide in page-template keeps its sentence under `statement`); add a role to the table in the same change when a new Slide layout needs one.

The record, not the Translation file, holds what is not a string: a note's `slug` and `target`, a source's `slug` and `url`, an image's `src`, a segment's `slug` and `bridge` flag. Neither holds a time: a Slide's minutes and each segment's span are counted from the `script` and `bridge` words. Slide text wraps a phrase in `<marker>…</marker>`, read with `t.rich('prose', { marker: marker('<note>') })`, to follow it with a Context marker to a note of the same Slide, or in `<ref>…</ref>`, read with `ref('<note>')`, to underline it. A marker's accessible name is the note's `header` in the site-wide `contextDrawer.markerNote`. Chrome shared by every Episode (for example `tableOfContents.title`) sits in the site-wide files and is not bound by this table.

## Worked example: page-template

`src/components/episodes/page-template/slides/why-a-template/slide.tsx` declares slug `why-a-template`, its messages `{ en, de }` imported from `./i18n/`, notes `reference-episode` and `spine`, and segments `one-breath` and `the-spine` (the second with `bridge: true`). Every key it reads, in its own `i18n/en.json`:

```text
title
caption
prose                                   holds <marker>keeps every Episode the same shape</marker>
spine.episode                           spine.* are leaves of the Slide's own visualisation
spine.section
spine.slide
spine.next
notes.reference-episode.header
notes.reference-episode.description
notes.spine.header
notes.spine.description
voiceScript.segments.one-breath.title
voiceScript.segments.one-breath.keywords
voiceScript.segments.one-breath.script
voiceScript.segments.the-spine.title
voiceScript.segments.the-spine.keywords
voiceScript.segments.the-spine.script
voiceScript.segments.the-spine.bridge
```

Two more Slides of the same Episode, as excerpts, and the Episode's own file:

```text
slides/foundations/i18n/en.json         title: section slide, names the first Section
slides/what-comes-next/i18n/en.json     statement: untitled Slide, no `title`, so no table-of-contents entry
page-template/i18n/en.json              title, caption, description
```

## Worked notes

- Counts and names go through ICU arguments: `"{count, plural, one {# slide} other {# slides}}"`, passed as `t('caption', { count })` inside `content`.
- Rich text: `t.rich` already renders `<em>`, `<b>` and `<code>` in site styles, so a string may write `Keep it <em>short</em>` and the Slide passes only its own tags (`ref`, or a same-named tag to restyle one).
- Template: a string a client widget completes after the reader acts keeps a plain `{name}` placeholder (`"showAll": "Show all {count}"`, no ICU plural; keys are camelCase, never `show-all`). The Slide reads it with `template('showAll')` and passes it as a prop; the widget renders `fillTemplate(label, { count })`. `template` accepts only a string leaf of the Slide's own file (or subtree).
- A Section of one Slide needs no extra key: its section slide holds `title` and `caption` like any other Slide.
- A `tsc` error from `t`, `ref` or `target` means the Translation file or the declaration is wrong; fix it, never cast ([FE-002 §3](../../.archgate/adrs/FE-002-episode-page.md#3-scene-is-free)).
- `src/components/episodes/page-template/` is the copy source for a new Episode; `src/components/episodes/slide-layouts/` shows each Slide layout.

## Episode overview entries

Each Episode declares its own overview metadata in `episodes/<slug>/episode-metadata.ts`: status, Format, the top Concepts it teaches (`concepts`), the one whose look its card takes (`applyThemeFromConcept`) and, once published, its publish date. It holds ids only, no strings. `listEpisodes()` in `src/components/episodes/episode-repository.ts` collects every Episode's metadata, and the landing page reads only that. The central lists live in `src/lib/episode-overview.ts`:

- `CONCEPT_THEMES`: one icon and accent per top Concept, the closed set `applyThemeFromConcept` may name; an Episode declares no look of its own. Its order is the order of the filter chips. The Concepts themselves are files in `docs/llm-wiki/concepts/`; the content store checks the two hold the same top Concepts.
- `FORMATS`: the closed list of Formats.
- `FEATURED`: exactly three published slugs, lead first.

An entry reads its text from:

- An Episode with a page, published or still upcoming: its title and caption from its own `i18n/`, read through the registry (`findEpisode(slug).messages[locale]`).
- An Upcoming Episode with no page: `landing.episodeOverview.upcoming.<slug>.title` and `.caption`. It has no record, so this is landing text and stays site-wide; move it into the Episode folder's `i18n/` when its page is written.
- Every Episode: `landing.episodeOverview.formats.<format>`, one per id in `FORMATS`. The Format control and label stay hidden until two Formats are in use.
- Every top Concept: `landing.episodeOverview.concepts.<id>.name` and `.tooltip`, one per id in `CONCEPT_THEMES`: the card's chip, a link to the English Concept page. On a German page the chip carries `landing.episodeOverview.conceptInEnglish` (`.mark` shown, `.label` for screen readers). The content store fails an Episode that names a Concept outside the top Concepts; a test fails when a top Concept lacks either key in en or de.
- The Concept page (`/concepts/<id>`, English only): its name, definition and body come from the Concept file; its labels from `conceptPage`.
- Entry chrome: `landing.episodeOverview.open` and `landing.episodeOverview.comingSoon`; the overview's search box: `landing.episodeOverview.search` (its accessible name) and `.searchPlaceholder`.
- The `/episodes` heading and its one-line intro: `episodesPage.title` and `episodesPage.intro`.

## Workshop keys

A Workshop is a record in `src/lib/workshops.pure.ts` that holds no string ([Workshops](workshops.md)). Its text sits in the site-wide files:

- `workshopsPage.items.<slug>.title` and `.description`, one pair per Workshop slug. The title is the card's heading, the Workshop page's `h1` and `<title>`; the description is the page's intro paragraph and its meta description. A missing pair fails the build.
- `workshopsPage.title` and `workshopsPage.intro`: the `/workshops` heading and its one-line intro.
- `workshopsPage.episodeCount.one` and `.other`: the Episode count on a card and on the Workshop page; `other` keeps a plain `{count}` placeholder.
- `workshopsPage.agenda`: the heading of the numbered Episode list on a Workshop page.
- `workshopsPage.start`: the primary button, with a `{step}` placeholder for the first Episode that has a page ("Start with Episode 1").
- `workshopsPage.readingTime`: the total reading time of the Episodes, with a `{minutes}` placeholder.
- `workshopsPage.back`: the link up to `/workshops`; the page draws its arrow icon, so the string holds none.
- `meta.workshops.title` and `.description`: the `/workshops` page metadata, read by `pageMetadata('workshops', locale)` (FE-008). A Workshop page takes its metadata from its `items` pair.

To announce an Upcoming Episode, create `episodes/<slug>/` holding only `episode-metadata.ts` with `status: 'upcoming'`, add it to `UPCOMING` in the repository, and write its two `upcoming` keys in en and de.

`page-template`, `slide-layouts` and `slide-master` are layout references (`LAYOUT_REFERENCES`), not content: they are not in the Episode overview and need no metadata.
