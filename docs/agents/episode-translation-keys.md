# Episode translation keys

Read before adding or changing an Episode, a Slide, or any string in `src/messages/<locale>.json`. The binding rules (keys come from the Slide slug, never a position; leaf strings only; ICU for variable text; every key in both Translation files) live in [FE-002 Episode Page](../../.archgate/adrs/FE-002-episode-page.md) §5. This guide holds the role vocabulary and a worked example.

## Key shape

An Episode's strings sit under `episodes.<episode>`. A Slide's strings sit one level down, flat by Slide slug, with no Section level in between:

```text
episodes.<episode>.title                      Title slide h1, <title>
episodes.<episode>.caption                    Title slide caption
episodes.<episode>.description                meta description (FE-008)
episodes.<episode>.slides.<slide>.<role>      one string of one Slide
```

A Section's own slide is a Slide like any other: its `title` names the Section and is the table-of-contents label. A Slide slug is unique across the whole Episode, Section slides included. The Slide file reads its strings with `t('<role>')`, namespaced to its own subtree, so the slug is written once, in the file's `slug`.

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

`src/components/episodes/page-template/slides/why-a-template.tsx` declares slug `why-a-template`, notes `reference-episode` and `spine`, and segments `one-breath` and `the-spine` (the second with `bridge: true`). Its keys:

```text
episodes.page-template.title
episodes.page-template.slides.foundations.title                          section slide: names the first Section
episodes.page-template.slides.why-a-template.title
episodes.page-template.slides.why-a-template.caption
episodes.page-template.slides.why-a-template.prose                       holds <ref>reference Episode</ref>
episodes.page-template.slides.why-a-template.spine.next                  a leaf of the Slide's own visualisation
episodes.page-template.slides.why-a-template.notes.reference-episode.header
episodes.page-template.slides.why-a-template.notes.reference-episode.description
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.title
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.keywords
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.script
episodes.page-template.slides.why-a-template.voiceScript.segments.the-spine.bridge
episodes.page-template.slides.what-comes-next.statement                 untitled Slide: no `title`, so no table-of-contents entry
```

## Worked notes

- Counts and names go through ICU arguments: `"{count, plural, one {# slide} other {# slides}}"`, passed as `t('caption', { count })` inside `content`.
- Rich text: `t.rich` already renders `<em>`, `<b>` and `<code>` in site styles, so a string may write `Keep it <em>short</em>` and the Slide passes only its own tags (`ref`, or a same-named tag to restyle one).
- Template: a string a `client/` widget completes after the reader acts keeps a plain `{name}` placeholder (`"showAll": "Show all {count}"`, no ICU plural). The Slide reads it with `template('showAll')` and passes it as a prop; the widget renders `fillTemplate(label, { count })`. `template` accepts only a string leaf of the Slide's own subtree.
- A Section of one Slide needs no extra key: its section slide holds `title` and `caption` like any other Slide.
- Types back the shape: `t` accepts only keys under its own Slide's subtree, `ref` only declared notes, `target` only targets a note names. A `tsc` error there means the Translation file or the declaration is wrong; fix it, never cast.
- `src/components/episodes/page-template/` is the copy source for a new Episode; `src/components/episodes/slide-layouts/` shows each Slide layout.

## Landing page cards

The landing page lists Episodes from the Episode index (`src/lib/episode-index.json`), which holds ids, dates and ranks but no strings. A card reads its text from:

- A published Episode: `episodes.<slug>.title` and `episodes.<slug>.caption`, the keys its own page already uses.
- An upcoming Episode: `landing.episodeIndex.upcoming.<slug>.title` and `.caption`. Move them to `episodes.<slug>.*` when it is published.
- Every Episode: `landing.episodeIndex.topics.<topic>` and `landing.episodeIndex.formats.<format>`, one per id in `src/lib/episode-index.pure.ts`.
- Card chrome: `landing.episodeIndex.open` and `landing.episodeIndex.comingSoon`.

`page-template` is the layout reference, not content: it is not in the index, and the landing page links to it separately.
