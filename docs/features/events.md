---
type: feature-guide
title: Events
stale_after: 2027-04-26T00:00:00Z
---

# Events

Read before adding or changing an Event, or the `/events` pages. An Event is a dated workshop or webinar that presents one Playlist; attendees follow the Playlist's Episodes in order. The model and its visibility rules are design-ADR [Content data model](../adr/0016-content-data-model.md).

## The records

An Event and the Playlist it presents are two records in the content store (`src/content-store/`, Archgate ADR FE-013), loaded only through `store.ts`. Their fields, each described, are their schemas: `schemas/event.schema.ts` and `schemas/playlist.schema.ts`.

- `events/<date>-<name>.ts`: slug `<date>-<name>` (`2026-10-23-axel-agentic-workflow`), date, kind (`workshop` or `webinar`), Audience (`individual` or `organization`), optional time and location (written as the venue writes them, the same in every locale), and the id of its Playlist.
- `playlists/<id>.ts`: id, visibility and the Episode slugs in teaching order. An Upcoming Episode may be listed; its card is muted and unlinked, and the Start button goes to the first Episode that has a page.

The records hold no text. The store refuses a bad record when it loads, so the build and the fast suite stop with one sentence naming it (`src/content-store/store.test.ts`): a slug that does not start with its date, a slug used twice, a missing Playlist, an empty Playlist, an unregistered or twice-listed Episode.

## Routes

- `/events` and `/de/events`: the list, one card per Event whose Playlist is public (name, date, Episode count).
- `/events/<event-slug>` and `/de/events/<event-slug>`: the Event's page (`src/components/pages/event-page.tsx`): breadcrumb, title, the facts line (kind, date and time, location, Audience, Episode count, total reading time), the description, the past notice, the Start button, then its Playlist's Episodes as a numbered list of compact Episode cards, the first emphasised. Each card opens the Episode under the Event, `/events/<event-slug>/episodes/<episode-slug>/`.
- `/events/<event-slug>/episodes/<episode-slug>/` and its `/de` twin: an Episode as the Event presents it (`src/components/pages/event-episode-page.tsx`), described below.
- The Event path set is closed at build time from `EVENT_SLUGS` (`src/lib/routes.ts`, FE-005), a hand-kept list the store's tests check against the Event records. The Event-scoped Episode path set comes from the Playlists themselves (`eventEpisodeParams`): every listed Episode that has a page, nothing else.

The list, and each Event page whose Playlist is public, are in the sitemap with canonical and hreflang; an Event page whose Playlist is unlisted is `noindex` and out of it. The header has one Events entry.

**Event-scoped Episode page.** The Episode's own page through the one container (FE-002), with the Event around it: the breadcrumb (Events / the Event / the Episode) and, for a past Event, the past notice above the Title slide; "Episode n of m" under the title; after the last Slide, the previous and next Episode of the Playlist, and on the last Episode a way back to the Event instead of a next one (`src/components/events/event-episode-chrome.tsx`). The count is the whole Playlist; the walk steps over an Episode with no page yet (`playlistPlace`, `src/lib/events.pure.ts`). The table of contents and the Slides' `slideHref` links stay on the Event's URL.

Search: one visibility predicate, `pageTreatment` (`src/lib/visibility.pure.ts`), decides for every page whether it is exported, in the sitemap, `noindex`, and where its canonical points; `pageMetadata`, the sitemap and the `/episodes/` static params all ask it, with the facts the content store hands in (`pageFacts`). A public, published Episode under an Event points its canonical at its own `/episodes/<slug>/` page, carries no hreflang and no structured data, and is indexable; any other Episode under an Event (upcoming, or unlisted) is `noindex` with itself as canonical. No Event-scoped Episode page is in the sitemap. These pages are not in `PAGES`; `tests/post-build/events.build.test.ts` walks them from the Playlists.

**Unlisted Episodes.** An Event presents compositions made for it as unlisted Episodes (GLOSSARY): `visibility: 'unlisted'` in the Episode's metadata. One lives only at its Event-scoped page: no `/episodes/` page, `noindex`, never in the sitemap, the Episode overview or Upcoming Episodes (`tests/post-build/unlisted-episodes.build.test.ts`). The AXEL seminar's Playlist lists three, `axel-<slug>` copies of the public Episodes it taught. To make one from a public Episode:

1. `cp -r src/components/episodes/<slug> src/components/episodes/<event-name>-<slug>`, delete the copy's `brief.md`, and give the copy its new slug in `episode.ts`, `episode-metadata.ts` and its tests, keeping every Slide slug.
2. In `episode-metadata.ts`, set `visibility: 'unlisted'` and `publishedOn` to the Event's date.
3. Register it like any Episode: `EPISODE_SLUGS` (`src/lib/routes.ts`), the registry (`src/components/episodes/registry.ts`) and `REGISTERED` in `src/content-store/store.ts`; add its Section openers to `registry.test.ts` and, when it keeps `sections/`, to `placement-markers.test.ts`.
4. List it in the Event's Playlist. The store refuses an unlisted Episode no Event's Playlist lists.

Flipping `visibility` back to `public` is the one edit that gives it its own page, sitemap entry and overview card.

**Past Event.** An Event whose date lies before the build day (`BUILD_DAY`, `src/lib/build-day.ts`) shows one fixed notice above its Playlist: the content is kept up to date and may differ from the recording. Past is derived, never stored, so a page is as fresh as the last deploy. An upcoming Event shows none.

**Old Workshop links.** `/workshops/` and every published Workshop URL 301 to their Event in `public/_redirects`, both locales. A renamed Event slug gets its own pair of lines there.

## Add an Event

1. Add `src/content-store/playlists/<id>.ts` with the Episode slugs, and `src/content-store/events/<date>-<name>.ts` naming it.
2. Import both in `src/content-store/store.ts` (`EVENTS`, `PLAYLISTS`), and add the Event slug to `EVENT_SLUGS` in `src/lib/routes.ts`.
3. Write `eventsPage.items.<event-slug>.title` and `.description` in `src/messages/en.json` and `de.json`.
4. Run `npm run verify`; the route files, sitemap and static params follow from the records. The other keys an Event page reads are in [Episode translation keys](episode-translation-keys.md#event-keys).
