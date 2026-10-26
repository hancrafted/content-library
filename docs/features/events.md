---
type: feature-guide
title: Events
stale_after: 2027-04-26T00:00:00Z
---

# Events

Read before adding or changing an Event, or the `/events` pages. An Event is a dated workshop or webinar that presents one Playlist; attendees follow the Playlist's Episodes in order. The model and its visibility rules are design-ADR [Content data model](../adr/0016-content-data-model.md).

## The records

An Event and the Playlist it presents are two records in the content store (`src/content-store/`, Archgate ADR FE-013), loaded only through `store.ts`. Their fields, each described, are their schemas: `schemas/event.schema.ts` and `schemas/playlist.schema.ts`.

- `events/<date>-<name>.ts`: slug `<date>-<name>` (`2026-10-23-axel-agentic-workflow`), date, kind (`workshop` or `webinar`), Audience (`individual` or `organization`), Organizer (one of `ORGANIZERS` in `schemas/fields.ts`: `hancrafted`, `axel`, `cyberforum`; a new organizer joins that list first), optional time and location (written as the venue writes them, the same in every locale), and the id of its Playlist.
- `playlists/<id>.ts`: id, visibility and the Episode ids (GLOSSARY) in teaching order: an Episode no Event owns by its slug, an Event's copy as `<event-slug>__<slug>`; a Playlist lists only its own Event's copies. An Upcoming Episode may be listed; its card is muted and unlinked, and the Start button goes to the first Episode that has a page.

The store serves each Event resolved (`ServedEvent`, `src/content-store/served-event.ts`): its Playlist with the Episodes it lists, in order, each with its page when it has one and its place, n of m with the previous and next Episode that has a page. A page and each step of the walk is the Episode's EpisodeRef (GLOSSARY), so its slug and owning Event are fields; only the store reads an Episode id's format, once, when the records load. The Event page and its Event-scoped Episode pages read that one value: the Event page by `findEvent`, an Event-scoped Episode page through the page catalogue, which hands it the served Event, the Episode's ref and its place (`eventEpisodePageAt`). The records hold no text. The store refuses a bad record when it loads, so the build and the fast suite stop with one sentence naming it. The one list of refusals is `src/content-store/refusals.ts` with the schemas under `src/content-store/schemas/`; `src/content-store/store.test.ts` shows each sentence.

## Routes

- `/events` and `/de/events`: the list, one card per Event whose Playlist is public (name, date, Episode count).
- `/events/<event-slug>` and `/de/events/<event-slug>`: the Event's page (`src/page-assembly/event/event-page.tsx`, its Playlist list `src/events/components/playlist-list.tsx`): breadcrumb, title, the facts line (kind, date and time, location, Audience, Episode count, total reading time), the description, the past notice, the Start button, then its Playlist's Episodes as a numbered list of compact Episode cards, the first emphasised. Each card opens the Episode under the Event, `/events/<event-slug>/episodes/<episode-slug>/`.
- `/events/<event-slug>/episodes/<episode-slug>/` and its `/de` twin: an Episode as the Event presents it (the Episode page template, `src/page-assembly/episode/episode-page.tsx`, for a page of kind `event-episode`), described below.
- Every path set is closed at build time by the page catalogue (GLOSSARY, `src/content-store/catalogue/page-catalogue.ts`, FE-005): one Event page per Event file, which the Event registry (GLOSSARY) lists, and one Event-scoped Episode page per Episode a Playlist lists that has a page (`eventParams`, `eventEpisodeParams`). The catalogue also resolves a route's params to the page it builds there, or none, so a pair no Playlist holds is the same 404 as an unknown path (`eventEpisodePageAt`, `episodesPathPageAt`).

The list, and each Event page whose Playlist is public, are in the sitemap with canonical and hreflang; an Event page whose Playlist is unlisted is `noindex` and out of it. The header has one Events entry.

**Event-scoped Episode page.** The Episode's own page through the one container (FE-002), with the Event around it: the breadcrumb (Events / the Event / the Episode) and, for a past Event, the past notice above the Title slide; "Episode n of m" under the title; after the last Slide, the previous and next Episode of the Playlist, and on the last Episode a way back to the Event instead of a next one (`src/events/components/event-episode-chrome.tsx`). The count is the whole Playlist; the walk steps over an Episode with no page yet. The table of contents and the Slides' `slideHref` links stay on the Event's URL.

Search: the page catalogue gives every page its treatment from one visibility predicate (`pageTreatment`, `src/content-store/catalogue/visibility.pure.ts`): whether it is exported, in the sitemap, `noindex`, on the site's own lists (`listed`), and where its canonical points. `pageMetadata`, the sitemap, the static params, the Episode browser and the `/events/` list all ask the catalogue (`treatmentOf`, `PAGES`, `listedEpisodes`, `listedEvents`). A public, published Episode no Event owns, shown under an Event, points its canonical at its own `/episodes/<slug>/` page, carries no hreflang and no structured data, and is indexable, out of the sitemap. A public, published copy an Event owns has no `/episodes/` page: its Event-scoped page is indexable, in the sitemap and its own canonical with hreflang. Any other Episode under an Event (upcoming, or unlisted) is `noindex` with itself as canonical.

**Unlisted Episodes.** An Event presents compositions made for it as unlisted Episodes (GLOSSARY): `visibility: 'unlisted'` in the Episode's metadata. One lives only at its Event-scoped page: no `/episodes/` page, `noindex`, never in the sitemap, the Episode browser or Upcoming Episodes (`tests/post-build/unlisted-episodes.build.test.ts`). An Event owns its copies: each lives in its Event's folder, `src/episodes/by-event/<event-slug>/<slug>/`, usually under its original's slug, and its Episode id (GLOSSARY) is `<event-slug>__<slug>`. The store refuses an unlisted Episode outside `by-event/` and a `by-event/<event-slug>/` folder naming no Event. The AXEL seminar's Playlist lists three copies of the public Episodes it taught. To make one from a public Episode:

1. `mkdir -p src/episodes/by-event/<event-slug> && cp -r src/episodes/<slug> src/episodes/by-event/<event-slug>/<slug>`, and delete the copy's `brief.md`. The slug stays; in its tests, a context names the copy by `episodeRef('<slug>', '<event-slug>').id` (from `@/episodes/lib/episode-folders`), never by an id written out. Keep every Slide slug.
2. In `episode-metadata.ts`, set `visibility: 'unlisted'` and `publishedOn` to the Event's date.
3. List it in the Event's Playlist. The store refuses an unlisted Episode no Event's Playlist lists.
4. Run `npm run registry`: the folder is the registration, and the Episode registry (GLOSSARY) adds the id, the metadata and the composition from it. No test lists the copies: the store's refusals check each one as it loads, and the post-build suite checks each one's pages.

A copy of an Episode whose Sections compose pool Slides keeps composing them: its Section files import them through the `@/` alias, so the copy carries no pool Slide of its own.

**Promote Slides to the pool.** Copying is the default; promotion is a deliberate choice, made when an Episode and its copies should show the same content Slides as they are. The Slide pool (GLOSSARY) holds only content Slides: each Episode keeps its own Title slide, section slides and Section files. `onboard-ai-every-time` and its two Event copies are the worked example. Where else a reused thing goes is FE-004-slide-architecture's reuse table. To promote:

1. Confirm the Slide folder is byte-identical in every Episode that will compose it (`diff -r`). If any copy differs, keep the copies, or settle the one version first.
2. `git mv src/episodes/<slug>/slides/<slide> src/episodes/slide-pool/<slide>`, then `git rm -r` the same folder in each copy.
3. In every Section file that lists it, import it through the alias, `@/episodes/slide-pool/<slide>/slide`, never a relative path. A section slide stays in its Episode: the dependency rules refuse a Section importing a pool Slide of its own name.
4. Run `npm run verify` and `npm run build && npm run test:build`: the Slides, text and anchors of each Episode stay as they were. A later fix to a pool Slide reaches every Episode that composes it, past Events' copies too; the past-Event notice covers that.

Flipping a copy's `visibility` to `public` is the one edit that indexes its Event-scoped page and puts it in the sitemap; it stays under its Event, with no `/episodes/` page and no overview card.

**Event recording.** An unlisted Episode plays the one Video recorded at its Event: `youtube: { id, language }` in its `episode-metadata.ts`, `language` the locale spoken there. Both locale pages play it, labelled with that language before play (`tests/post-build/unlisted-episodes.build.test.ts`). It is optional until uploaded; the `episode-add-youtube` skill adds it. Flipping a recorded Episode to `public` also rewrites its `youtube` as one video per locale: the store refuses the one-recording shape on a public Episode.

**Past Event.** An Event whose date lies before the build day (`BUILD_DAY`, `src/page-assembly/lib/build-day.ts`) shows one fixed notice above its Playlist: the content is kept up to date and may differ from the recording. Past is derived, never stored, so a page is as fresh as the last deploy. An upcoming Event shows none.

**Old Workshop links.** `/workshops/` and every published Workshop URL 301 to their Event in `public/_redirects`, both locales. A renamed Event slug gets its own pair of lines there, and so does each copy whose Event-scoped URL changes: the seven copies that dropped their `axel-` and `cyberforum-` prefixes have theirs.

## Add an Event

A new Event starts from the **Workshop template** (GLOSSARY), a tooling page at `/episodes/workshop-template/` (`src/episodes/tooling/workshop-template/`): a Title slide, then agenda, in-scope, out-of-scope and orga Slides, every word a placeholder. Work through the steps in order:

1. **Copy the template into a new unlisted Episode.** `mkdir -p src/episodes/by-event/<event-slug> && cp -r src/episodes/tooling/workshop-template src/episodes/by-event/<event-slug>/intro`. In the copy's `episode.ts`, set `slug: 'intro'`; in its `i18n/`, give it its own title, caption and description. The template has no metadata, so add `episode-metadata.ts`, copied from another unlisted Episode with its slug, `visibility: 'unlisted'` and `publishedOn` the Event's date. Copy each further Episode the Event presents the same way, as in "Unlisted Episodes" steps 1 and 2, into the same Event folder.
2. **Register them.** As in "Unlisted Episodes" step 4: `npm run registry`.
3. **Append the Playlist.** Add `src/content-store/playlists/<id>.ts`: its id, visibility, and the Episode ids in teaching order, the template's copy (`<event-slug>__intro`) first. Import it into `PLAYLISTS` in `src/content-store/store.ts`.
4. **Append the Event.** Add `src/content-store/events/<date>-<name>.ts`: slug, date, kind, Audience, Organizer, optional time (`17:00`, `17:00–19:00` or `17:00–19:00 CET`) and location, and the Playlist's id; the file is named after its slug and ends `as const satisfies EventInput`, as the others do, so `tsc` holds the slug to its file name. Run `npm run registry`: the Event registry (GLOSSARY) adds the slug and the record from the file.
5. **Write the Translation keys.** `events.items.<event-slug>.title` and `.description` in the Events area's `src/events/lib/i18n/en.json` and `de.json`. The other keys an Event page reads are in [Episode translation keys](episode-translation-keys.md#event-keys).
6. **Run `npm run verify`.** The route files, sitemap and static params follow from the records.

The template's own words stay placeholders: write the Event's agenda, scope and orga in the copy, never in the template.
