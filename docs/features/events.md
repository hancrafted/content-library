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
- The path set is closed at build time from `EVENT_SLUGS` (`src/lib/routes.ts`, FE-005), a hand-kept list the store's tests check against the Event records.

Both are in the sitemap with canonical and hreflang, and the header has one Events entry.

**Past Event.** An Event whose date lies before the build day (`BUILD_DAY`, `src/lib/build-day.ts`) shows one fixed notice above its Playlist: the content is kept up to date and may differ from the recording. Past is derived, never stored, so a page is as fresh as the last deploy. An upcoming Event shows none.

**Old Workshop links.** `/workshops/` and every published Workshop URL 301 to their Event in `public/_redirects`, both locales. A renamed Event slug gets its own pair of lines there.

## Add an Event

1. Add `src/content-store/playlists/<id>.ts` with the Episode slugs, and `src/content-store/events/<date>-<name>.ts` naming it.
2. Import both in `src/content-store/store.ts` (`EVENTS`, `PLAYLISTS`), and add the Event slug to `EVENT_SLUGS` in `src/lib/routes.ts`.
3. Write `eventsPage.items.<event-slug>.title` and `.description` in `src/messages/en.json` and `de.json`.
4. Run `npm run verify`; the route files, sitemap and static params follow from the records. The other keys an Event page reads are in [Episode translation keys](episode-translation-keys.md#event-keys).
