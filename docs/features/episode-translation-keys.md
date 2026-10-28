---
type: feature-guide
title: Episode translation keys
stale_after: 2027-01-11T00:00:00Z
---

# Episode translation keys

Read before adding or changing an Episode, a Slide, or any Translation file. The binding rules live in [FE-002 §5](../../.archgate/adrs/FE-002-episode-page.md#5-strings-and-anchors-keyed-by-slide-slug). This guide holds the role vocabulary and a worked example.

## Key shape

A Slide keeps its strings in its own folder, `slides/<slide>/i18n/en.json` and `de.json`; its Episode's own text sits in `<episode>/i18n/`. Every other text sits in its owner's `i18n/` too, merged into one site message set (FE-003): page chrome's in `src/shared/page-chrome/i18n/`, each page template's in its folder, the Episode browser's in `src/episodes/components/episode-browser/i18n/`, the Events area's in `src/events/lib/i18n/`. None holds a published Episode's text; an Upcoming Episode's card copy is Episode browser text ([Episode browser entries](#episode-browser-entries)):

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

`<note>`, `<seg>`, `<column>` and `<source>` are kebab-case slugs. A Slide may add a leaf no role describes (the untitled Slide in episode-template keeps its sentence under `statement`); add a role to the table in the same change when a new Slide layout needs one.

The record, not the Translation file, holds what is not a string: a note's `slug` and `target`, a source's `slug` and `url`, an image's `src`, a segment's `slug` and `bridge` flag. Neither holds a time: a Slide's minutes and each segment's span are counted from the `script` and `bridge` words. Slide text wraps a phrase in `<marker>…</marker>`, read with `t.rich('prose', { marker: marker('<note>') })`, to follow it with a Context marker to a note of the same Slide, or in `<ref>…</ref>`, read with `ref('<note>')`, to underline it. A marker's accessible name is the note's `header` in page chrome's `contextDrawer.markerNote`. Chrome shared by every Episode (for example `tableOfContents.title`) sits in page chrome's files and is not bound by this table.

## Worked example: episode-template

`src/episodes/templates/episode-template/slides/why-a-template/slide.tsx` declares slug `why-a-template`, its messages `{ en, de }` imported from `./i18n/`, notes `reference-episode` and `spine`, and segments `one-breath` and `the-spine` (the second with `bridge: true`). Every key it reads, in its own `i18n/en.json`:

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
episode-template/i18n/en.json              title, caption, description
```

## Worked notes

- Counts and names go through ICU arguments: `"{count, plural, one {# slide} other {# slides}}"`, passed as `t('caption', { count })` inside `content`.
- Rich text: `t.rich` already renders `<em>`, `<b>` and `<code>` in site styles, so a string may write `Keep it <em>short</em>` and the Slide passes only its own tags (`ref`, or a same-named tag to restyle one).
- Template: a string a client widget completes after the reader acts keeps a plain `{name}` placeholder (`"showAll": "Show all {count}"`, no ICU plural; keys are camelCase, never `show-all`). The Slide reads it with `template('showAll')` and passes it as a prop; the widget renders `fillTemplate(label, { count })`. `template` accepts only a string leaf of the Slide's own file (or subtree).
- A Section of one Slide needs no extra key: its section slide holds `title` and `caption` like any other Slide.
- A `tsc` error from `t`, `ref` or `target` means the Translation file or the declaration is wrong; fix it, never cast ([FE-002 §3](../../.archgate/adrs/FE-002-episode-page.md#3-scene-is-free)).
- `src/episodes/templates/episode-template/` is the copy source for a new Episode; the frame components in `src/episodes/components/slide-master/` and the Slide library, the Master slide Templates in `src/episodes/templates/timelines/slides/` and `src/episodes/templates/grids/slides/`, hold the Slide layouts.

## Episode browser entries

Each Episode declares its own metadata record in `episodes/<slug>/episode-metadata.ts`: status, visibility, Format, Tags (lead Tag first), its Video and, once published, its publish date. It holds ids only, no strings. The content store (`src/content-store/store.ts`) loads every record through its schema, and the landing page reads only `listEpisodes()` from it. The closed vocabularies live in `src/content-store/schemas/fields.ts` (`TAG_IDS`, `FORMATS`); each Tag's icon in `src/content-store/schemas/tag-looks.ts` and its colour as the token `--tag-<id>` in `src/app/globals.css`, its name and tooltip as `tags.<id>` in `src/page-assembly/lib/i18n/`, and the Featured slots, `FEATURED` (exactly three published public Episodes, lead first), in `src/content-store/featured.ts`:

- `TAGS`: each Tag's icon and accent. An Episode's first Tag is its lead Tag and gives its card its icon and accent; an Episode declares no look of its own. `FILTER_TAGS` is the subset offered as filter chips.

An entry reads its text from:

- An Episode with a page, published or still upcoming: its title and caption from its own `i18n/`, read through the registry by its EpisodeRef (`compositionOf(ref).messages[locale]`).
- An Upcoming Episode with no page: `episodeBrowser.upcoming.<slug>.title` and `.caption`. It has no record, so this is Episode browser text and stays in the browser's files; move it into the Episode folder's `i18n/` when its page is written.
- Every Episode: `episodeBrowser.formats.<format>`, one per id in `FORMATS`. The Format control and label stay hidden until two Formats are in use.
- Every Tag in the vocabulary: `tags.<tag>.name` and `.tooltip` in page assembly's lib (`src/page-assembly/lib/i18n/`), one per id in `TAG_IDS`; the Episode and Event cards both read them. A Tag is only an id in the metadata; the store refuses an Episode that lists an id outside `TAG_IDS`, lists none or lists one twice, and `src/page-assembly/lib/tag-words.test.ts` fails when a Tag lacks either key in en or de.
- Entry chrome: `episodeBrowser.open` and `episodeBrowser.comingSoon`; the Episode browser's search box: `episodeBrowser.search` (its accessible name) and `.searchPlaceholder`.
- The `/episodes` heading and its one-line intro: `episodesPage.title` and `episodesPage.intro`, in the Overview template's `src/page-assembly/episode-overview/i18n/`.

## Event keys

An Event is a record in the content store that holds no string ([Events](events.md)). Its text sits with what renders it: `events.*` in the Events area's `src/events/lib/i18n/`, `eventsOverview.*` in the `/events` template's `src/page-assembly/events-overview/i18n/`, `eventPage.*` in the Event page template's `src/page-assembly/event/i18n/`:

- `events.items.<event-slug>.title` and `.description`, one pair per Event slug. The title is the card's heading, the Event page's `h1`, its breadcrumb's last step and its `<title>`; the description is the page's intro paragraph and its meta description. Each is read one way, through the Events area's word map (`eventCopy`, `src/events/lib/event-words.ts`), keyed by the Event registry's slugs, so a missing pair fails `tsc`.
- `eventsOverview.title` and `eventsOverview.intro`: the `/events` heading and its one-line intro.
- `events.breadcrumb.label` and `events.breadcrumb.events`: the breadcrumb's accessible name and its first step.
- `events.episodeCount.one` and `.other`: the Episode count on a card and on the Event page; `other` keeps a plain `{count}` placeholder.
- `eventPage.kinds.<kind>` and `eventPage.audiences.<audience>`: the kind and the Audience on the facts line, one per id in `EVENT_KINDS` and `AUDIENCES`.
- `eventPage.playlist`: the heading of the numbered Episode list on an Event page.
- `eventPage.start`: the primary button, with a `{step}` placeholder for the first Episode that has a page ("Start with Episode 1").
- `eventPage.readingTime`: the total reading time of the Episodes, with a `{minutes}` placeholder.
- `events.pastNotice`: the one fixed notice a past Event shows, on its page and on each of its Episode pages.
- `events.position`: "Episode n of m" under the title of an Event-scoped Episode page, with `{position}` and `{count}` placeholders, filled by `fillTemplate`.
- `events.playlistNav`: the accessible name of the Playlist walk after the last Slide.
- `events.previous`, `events.next` and `events.backToEvent`: the cues of the walk's steps; `backToEvent` replaces `next` on the last Episode and sits over the Event's title.
- `meta.events.title` and `.description` (page assembly's `src/page-assembly/lib/i18n/`): the `/events` page metadata, read by `pageMetadata({ kind: 'events' }, locale)` (FE-008). An Event page takes its metadata from its `items` pair.

To announce an Upcoming Episode, create `episodes/<slug>/` holding only `episode-metadata.ts` with `status: 'upcoming'`, add it to `UPCOMING` in the repository, and write its two `upcoming` keys in en and de.

The five Templates (`episode-template`, `workshop-template`, `explorable-page`, `timelines`, `grids`; see the GLOSSARY) are one folder each under `src/episodes/templates/`, and the three Explorable pages (`context-window`, `human-in-the-loop`, `ai-disciplines`) one folder each under `src/episodes/explorable-pages/`; `npm run registry` generates `TEMPLATE_SLUGS`, `EXPLORABLE_PAGE_SLUGS` and their compositions. They are not Episodes: not among the Episode ids or in the Episode browser, and they need no Episode metadata. Their title, caption and description are the composition's own `i18n/` pair (the record holds no text); the overview's and the nav's words are `resourcesOverview.*` and `nav.resources`, and `meta.resources` is the overview's page metadata.
