---
type: feature-guide
stale_after: 2027-01-11T00:00:00Z
---

# Episode translation keys

Read before adding or changing an Episode, a Slide, or any string in `src/messages/<locale>.json`. The binding rules live in [FE-002 §5](../../.archgate/adrs/FE-002-episode-page.md#5-strings-and-anchors-keyed-by-slide-slug). This guide holds the role vocabulary and a worked example.

## Key shape

An Episode's strings sit under `episodes.<episode>`. A Slide's strings sit one level down, flat by Slide slug, with no Section level in between:

```text
episodes.<episode>.title                      Title slide h1, <title>
episodes.<episode>.caption                    Title slide caption
episodes.<episode>.description                meta description (FE-008)
episodes.<episode>.slides.<slide>.<role>      one string of one Slide
```

A Section's own slide is a Slide like any other: its `title` names the Section and is the table-of-contents label. The Slide file reads its strings with `t('<role>')`, namespaced to its own subtree, so the slug is written once, in the file's `slug`.

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

The record, not the Translation file, holds what is not a string: a note's `slug` and `target`, a source's `slug` and `url`, an image's `src`, a segment's `slug` and `bridge` flag. Neither holds a time: a Slide's minutes and each segment's span are counted from the `script` and `bridge` words. Slide text wraps one phrase in `<ref>…</ref>`, read with `t.rich('prose', { ref: ref('<note>') })`, to make a Context reference to a note of the same Slide. Chrome shared by every Episode (for example `tableOfContents.title`) sits outside `episodes.*` and is not bound by this table.

## Worked example: page-template

`src/components/episodes/page-template/slides/why-a-template.tsx` declares slug `why-a-template`, notes `reference-episode` and `spine`, and segments `one-breath` and `the-spine` (the second with `bridge: true`). Every key it reads, in `src/messages/en.json`:

```text
episodes.page-template.title
episodes.page-template.caption
episodes.page-template.description
episodes.page-template.slides.why-a-template.title
episodes.page-template.slides.why-a-template.caption
episodes.page-template.slides.why-a-template.prose                       holds <ref>reference Episode</ref>
episodes.page-template.slides.why-a-template.spine.episode               spine.* are leaves of the Slide's own visualisation
episodes.page-template.slides.why-a-template.spine.section
episodes.page-template.slides.why-a-template.spine.slide
episodes.page-template.slides.why-a-template.spine.next
episodes.page-template.slides.why-a-template.notes.reference-episode.header
episodes.page-template.slides.why-a-template.notes.reference-episode.description
episodes.page-template.slides.why-a-template.notes.spine.header
episodes.page-template.slides.why-a-template.notes.spine.description
episodes.page-template.slides.why-a-template.voiceScript.segments.one-breath.title
episodes.page-template.slides.why-a-template.voiceScript.segments.one-breath.keywords
episodes.page-template.slides.why-a-template.voiceScript.segments.one-breath.script
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.title
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.keywords
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.script
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.bridge
```

Two more Slides of the same Episode, as excerpts:

```text
episodes.page-template.slides.foundations.title                          section slide: names the first Section
episodes.page-template.slides.what-comes-next.statement                  untitled Slide: no `title`, so no table-of-contents entry
```

## Worked notes

- Counts and names go through ICU arguments: `"{count, plural, one {# slide} other {# slides}}"`, passed as `t('caption', { count })` inside `content`.
- Rich text: `t.rich` already renders `<em>`, `<b>` and `<code>` in site styles, so a string may write `Keep it <em>short</em>` and the Slide passes only its own tags (`ref`, or a same-named tag to restyle one).
- Template: a string a `client/` widget completes after the reader acts keeps a plain `{name}` placeholder (`"showAll": "Show all {count}"`, no ICU plural; keys are camelCase, never `show-all`). The Slide reads it with `template('showAll')` and passes it as a prop; the widget renders `fillTemplate(label, { count })`. `template` accepts only a string leaf of the Slide's own subtree.
- A Section of one Slide needs no extra key: its section slide holds `title` and `caption` like any other Slide.
- A `tsc` error from `t`, `ref` or `target` means the Translation file or the declaration is wrong; fix it, never cast ([FE-002 §3](../../.archgate/adrs/FE-002-episode-page.md#3-scene-is-free)).
- `src/components/episodes/page-template/` is the copy source for a new Episode; `src/components/episodes/slide-layouts/` shows each Slide layout.

## Episode overview entries

Each Episode declares its own overview metadata in `episodes/<slug>/episode-metadata.ts`: status, primary Topic, extra Topics, Format, Tags and, once published, its publish date. It holds ids only, no strings. `listEpisodes()` in `src/components/episodes/episode-repository.ts` collects every Episode's metadata, and the landing page reads only that. The central lists live in `src/lib/episode-overview.ts`:

- `TOPICS`: the curated Topics, each with the icon and accent that every Episode whose primary Topic it is takes.
- `FORMATS`: the closed list of Formats.
- `FEATURED`: exactly three published slugs, lead first.

An entry reads its text from:

- A published Episode: `episodes.<slug>.title` and `episodes.<slug>.caption`, the keys its own page already uses.
- An Upcoming Episode: `landing.episodeOverview.upcoming.<slug>.title` and `.caption`. Move them to `episodes.<slug>.*` when it is published.
- Every Episode: `landing.episodeOverview.topics.<topic>` and `landing.episodeOverview.formats.<format>`, one per id in `TOPICS` and `FORMATS`.
- Entry chrome: `landing.episodeOverview.open` and `landing.episodeOverview.comingSoon`.

To announce an Upcoming Episode, create `episodes/<slug>/` holding only `episode-metadata.ts` with `status: 'upcoming'`, add it to `UPCOMING` in the repository, and write its two `upcoming` keys in en and de.

`page-template` is the layout reference, not content: it is not in the Episode overview, and the landing page links to it separately.
