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

The store serves each Event resolved (`ServedEvent`, `src/content-store/served-event.ts`): its Playlist with the Episodes it lists, in order, each with its page when it has one and its place, n of m with the previous and next Episode that has a page. The Event page and its Event-scoped Episode pages read that one value (`findEvent`, `listEvents`). The records hold no text. The store refuses a bad record when it loads, so the build and the fast suite stop with one sentence naming it. The one list of refusals is `src/content-store/refusals.ts` with the schemas under `src/content-store/schemas/`; `src/content-store/store.test.ts` shows each sentence.

## Routes

- `/events` and `/de/events`: the list, one card per Event whose Playlist is public (name, date, Episode count).
- `/events/<event-slug>` and `/de/events/<event-slug>`: the Event's page (`src/components/pages/event-page.tsx`): breadcrumb, title, the facts line (kind, date and time, location, Audience, Episode count, total reading time), the description, the past notice, the Start button, then its Playlist's Episodes as a numbered list of compact Episode cards, the first emphasised. Each card opens the Episode under the Event, `/events/<event-slug>/episodes/<episode-slug>/`.
- `/events/<event-slug>/episodes/<episode-slug>/` and its `/de` twin: an Episode as the Event presents it (`src/components/pages/event-episode-page.tsx`), described below.
- The Event path set is closed at build time from `EVENT_SLUGS` (`src/lib/routes.ts`, FE-005), a hand-kept list: the store refuses an Event missing from it, and its tests refuse a slug no Event carries. The Event-scoped Episode path set comes from the Playlists themselves (`eventEpisodeParams`): every listed Episode that has a page, nothing else.

The list, and each Event page whose Playlist is public, are in the sitemap with canonical and hreflang; an Event page whose Playlist is unlisted is `noindex` and out of it. The header has one Events entry.

**Event-scoped Episode page.** The Episode's own page through the one container (FE-002), with the Event around it: the breadcrumb (Events / the Event / the Episode) and, for a past Event, the past notice above the Title slide; "Episode n of m" under the title; after the last Slide, the previous and next Episode of the Playlist, and on the last Episode a way back to the Event instead of a next one (`src/components/events/event-episode-chrome.tsx`). The count is the whole Playlist; the walk steps over an Episode with no page yet. The table of contents and the Slides' `slideHref` links stay on the Event's URL.

Search: one visibility predicate, `pageTreatment` (`src/lib/visibility.pure.ts`), decides for every page whether it is exported, in the sitemap, `noindex`, on the site's own lists (`listed`), and where its canonical points; `pageMetadata`, the sitemap, the `/episodes/` static params, the Episode overview and the `/events/` list all ask it, with the facts the content store hands in (`pageFacts`). A public, published Episode under an Event points its canonical at its own `/episodes/<slug>/` page, carries no hreflang and no structured data, and is indexable; any other Episode under an Event (upcoming, or unlisted) is `noindex` with itself as canonical. No Event-scoped Episode page is in the sitemap. These pages are not in `PAGES`; `tests/post-build/events.build.test.ts` walks them from the Playlists.

**Unlisted Episodes.** An Event presents compositions made for it as unlisted Episodes (GLOSSARY): `visibility: 'unlisted'` in the Episode's metadata. One lives only at its Event-scoped page: no `/episodes/` page, `noindex`, never in the sitemap, the Episode overview or Upcoming Episodes (`tests/post-build/unlisted-episodes.build.test.ts`). The AXEL seminar's Playlist lists three, `axel-<slug>` copies of the public Episodes it taught. To make one from a public Episode:

1. `cp -r src/components/episodes/<slug> src/components/episodes/<event-name>-<slug>`, delete the copy's `brief.md`, and give the copy its new slug in `episode.ts`, `episode-metadata.ts` and its tests, keeping every Slide slug.
2. In `episode-metadata.ts`, set `visibility: 'unlisted'` and `publishedOn` to the Event's date.
3. List it in the Event's Playlist. The store refuses an unlisted Episode no Event's Playlist lists.
4. Run `npm run episodes:registry`: the folder is the registration, and the Episode registry (GLOSSARY) adds the slug, the metadata and the composition from it. Add the slug to the unlisted list `src/content-store/store.test.ts` writes out in "declares every Episode public but…", the one place that says which Episodes are unlisted.

Flipping `visibility` back to `public` is the one edit that gives it its own page, sitemap entry and overview card.

**Event recording.** An unlisted Episode plays the one Video recorded at its Event: `youtube: { id, language }` in its `episode-metadata.ts`, `language` the locale spoken there. Both locale pages play it, labelled with that language before play (`tests/post-build/unlisted-episodes.build.test.ts`). It is optional until uploaded; the `episode-add-youtube` skill adds it. Flipping a recorded Episode to `public` also rewrites its `youtube` as one video per locale: the store refuses the one-recording shape on a public Episode.

**Past Event.** An Event whose date lies before the build day (`BUILD_DAY`, `src/lib/build-day.ts`) shows one fixed notice above its Playlist: the content is kept up to date and may differ from the recording. Past is derived, never stored, so a page is as fresh as the last deploy. An upcoming Event shows none.

**Old Workshop links.** `/workshops/` and every published Workshop URL 301 to their Event in `public/_redirects`, both locales. A renamed Event slug gets its own pair of lines there.

## Add an Event

A new Event starts from the **Workshop template** (GLOSSARY), a tooling page at `/episodes/workshop-template/` (`src/components/episodes/workshop-template/`): a Title slide, then agenda, in-scope, out-of-scope and orga Slides, every word a placeholder. Pick the Event's prefix, its name's first word (`cyberforum-`), and work through the steps in order:

1. **Copy the template into a new unlisted Episode.** `cp -r src/components/episodes/workshop-template src/components/episodes/<prefix>-intro`. In the copy's `episode.ts`, set `slug`; in its `i18n/`, give it its own title, caption and description. The template has no metadata, so add `episode-metadata.ts`, copied from another unlisted Episode with its slug, `visibility: 'unlisted'` and `publishedOn` the Event's date. Copy each further Episode the Event presents the same way, as in "Unlisted Episodes" steps 1 and 2, under the same prefix.
2. **Register them.** As in "Unlisted Episodes" step 4: `npm run episodes:registry`, and the new slugs in `store.test.ts`'s unlisted list.
3. **Append the Playlist.** Add `src/content-store/playlists/<id>.ts`: its id, visibility, and the Episode slugs in teaching order, the template's copy first. Import it into `PLAYLISTS` in `src/content-store/store.ts`.
4. **Append the Event.** Add `src/content-store/events/<date>-<name>.ts`: slug, date, kind, Audience, optional time (`17:00`, `17:00–19:00` or `17:00–19:00 CET`) and location, and the Playlist's id. Import it into `EVENTS` in `src/content-store/store.ts`, and add the slug to `EVENT_SLUGS` in `src/lib/routes.ts`.
5. **Write the Translation keys.** `eventsPage.items.<event-slug>.title` and `.description` in `src/messages/en.json` and `de.json`. The other keys an Event page reads are in [Episode translation keys](episode-translation-keys.md#event-keys).
6. **Run `npm run verify`.** The route files, sitemap and static params follow from the records.

The template's own words stay placeholders: write the Event's agenda, scope and orga in the copy, never in the template.
