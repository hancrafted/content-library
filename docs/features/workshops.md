---
type: feature-guide
title: Workshops
stale_after: 2027-04-22T00:00:00Z
---

# Workshops

Read before adding or changing an Event, or the `/workshops` pages. Until the Events pages replace them, each Event is shown as a Workshop page: attendees follow its Playlist's Episodes in order. Whether it is upcoming or past is not shown yet.

## The records

An Event and the Playlist it presents are two records in the content store (`src/content-store/`, Archgate ADR FE-013), loaded only through `store.ts`. Their fields, each described, are their schemas: `schemas/event.schema.ts` and `schemas/playlist.schema.ts`.

- `events/<date>-<name>.ts`: slug `<date>-<name>` (`2026-10-23-axel-agentic-workflow`), date, kind, Audience, optional time and location (written as the venue writes them, the same in every locale), and the id of its Playlist.
- `playlists/<id>.ts`: id, visibility and the Episode slugs in teaching order. An Upcoming Episode may be listed; its card is muted and unlinked, and the Start button goes to the first Episode that has a page.

The records hold no text. The store refuses a bad record when it loads, so the build and the fast suite stop with one sentence naming it (`src/content-store/store.test.ts`): a slug that does not start with its date, a slug used twice, a missing Playlist, an empty Playlist, an unregistered or twice-listed Episode.

## Routes

- `/workshops` and `/de/workshops`: the list, one card per Workshop (name, date, Episode count).
- `/workshops/<event-slug>` and `/de/workshops/<event-slug>`: the Event's page: date, time, location, Episode count, total reading time, description, the Start button, then its Playlist's Episodes as a numbered list of compact Episode cards. The path set is closed at build time from `EVENT_SLUGS` (`src/lib/routes.ts`, FE-005), a hand-kept list the store's tests check against the Event records.

Both are in the sitemap with canonical and hreflang, and the header has one Workshops entry.

## Add a Workshop

1. Add `src/content-store/playlists/<id>.ts` with the Episode slugs, and `src/content-store/events/<date>-<name>.ts` naming it.
2. Import both in `src/content-store/store.ts` (`EVENTS`, `PLAYLISTS`), and add the Event slug to `EVENT_SLUGS` in `src/lib/routes.ts`.
3. Write `workshopsPage.items.<event-slug>.title` and `.description` in `src/messages/en.json` and `de.json`.
4. Run `npm run verify`; the route files, sitemap and static params follow from the records. The other keys a Workshop page reads are in [Episode translation keys](episode-translation-keys.md#workshop-keys).
