---
type: feature-guide
title: Events
stale_after: 2027-04-25T00:00:00Z
---

# Events

Read before adding or changing an Event, a Playlist or an event-frame Episode, or the `/events` pages. The contract is design-ADR [Content data model](../adr/0016-content-data-model.md), section _Delivery contract_; this guide is how to work with it.

An **Event** is a dated occasion that presents one **Playlist**: an ordered list of Episodes. An Event owns no Slides, holds no text and has no visibility of its own: its Playlist's `visibility` is its own. The first entry of an Event's Playlist is its **event-frame Episode**, which holds the agenda, scope and organisation of that one Event.

## The records

All three load through the content store (`src/lib/content-store.pure.ts`), whose Zod schemas in `src/lib/content-schemas.pure.ts` describe every field. A refusal names the record and fails the build.

- **Event**: one entry in `EVENTS` in `src/lib/events.pure.ts`: `slug` (`<date>-<name>`, starting with its `date`), `date`, `kind` (`workshop` | `webinar`), optional `time` and `location`, `audience` (`german-business` | `international`) and the `playlist` id.
- **Playlist**: one entry in `PLAYLISTS` in `src/lib/playlists.pure.ts`: `id`, `type` (`event` | `standard`), `visibility` (`public` | `unlisted`; `attendees` is refused until horizon 3) and `episodes`, the Episode slugs in order.
- **Episode**: its `episode-metadata.ts` carries `type` (`standard` | `event-frame`) and `visibility` (`public` | `unlisted`). An upcoming Episode is always `standard` and `public`.

The store refuses: an Event whose Playlist is missing or not `type: event`; an event Playlist presented by no Event or by two, or not opening with its one event-frame Episode; a public event-frame Episode; a public standard Playlist listing an unlisted Episode (an event Playlist may); an unlisted Episode in no Event's Playlist (an orphan); a Playlist entry that names no Episode; two Episodes with one slug.

An unlisted Episode is registered in `UNLISTED_EPISODE_SLUGS` (`src/lib/routes.ts`), in the registry and in `UNLISTED` (`src/components/episodes/content-store.ts`), never in `EPISODE_SLUGS`, so it has no `/episodes/<slug>/` page. An unlisted Episode derived from a public one, holding every Slide of it, names that Episode in `canonicalEpisode` in its metadata; the content store refuses one that does not, and a `canonicalEpisode` that names anything but a public, published Episode.

## Routes

- `/events/` and `/de/events/`: one card per Event whose Playlist is public; a line saying there is none otherwise. The header's Events entry links here.
- `/events/<event>/` and `/de/events/<event>/`: the Event's page: breadcrumb (Events / Event), title, the facts line (kind, date, time, location, Audience, Episode count, reading time), description, for a past Event the past notice, the Start button, then the Playlist as a numbered list of compact Episode cards, each linking to its page under the Event. The event-frame Episode is item 1, shaded as a band and chipped "Event page"; any other unlisted Episode is chipped "Unlisted".
- `/events/<event>/episodes/<episode>/` and the `/de` mirror: one Episode of the Playlist, rendered as its Episode page with the Event around it: the breadcrumb ending in the Episode and, for a past Event, the past notice above the Title slide; "Episode 2 of 4" under the title; the previous and next Episodes of the Playlist and the way back to the Event after the last Slide. `EpisodePage` takes the `event` and `EpisodePageContainer` renders this chrome (`src/components/events/`).

An Event is **past** when its date lies before the build day (`isPastEvent` in `src/lib/events.pure.ts`, fed `BUILD_DAY` from `src/lib/build-day.ts`); a static page is only as fresh as its last deploy. A past Event shows the past notice (`PastNotice`, `src/components/events/past-notice.tsx`), one fixed line from `eventsPage.pastNotice`, on the Event page and on every Event-scoped Episode page; an Episode's own `/episodes/<slug>/` page never shows it. `tests/browser/events.browser.test.ts` pins the notice, its place above the title, the German copy and the Playlist walk on the built export; the upcoming case is in `past-notice.test.ts`, since no upcoming Event exists to open.

Static params are closed at build time: one per Event and one per Playlist entry (FE-005). Sitemap, robots and canonical come from one predicate, `pageTreatment` (`src/lib/visibility.pure.ts`), that `pageMetadata` and the sitemap both ask, per the visibility table in design-ADR 0016. An Event whose Playlist is unlisted is `noindex` and out of the sitemap. No Event-scoped Episode page is in the sitemap: a public Episode there points its canonical at its own `/episodes/<slug>/` page, an unlisted one with `canonicalEpisode` at that public Episode's, and any other unlisted one is `noindex`. Old `/workshops/` URLs 301 to their Event in `public/_redirects`, both locales; `tests/post-build/events.build.test.ts` fails when a legacy Workshop slug has no line.

## Add an Event

1. Write its event-frame Episode: a folder under `src/components/episodes/` with `type: 'event-frame'`, `visibility: 'unlisted'`, `status: 'published'`; register its slug in `UNLISTED_EPISODE_SLUGS`, the registry and `UNLISTED`.
2. Append a Playlist of `type: 'event'` to `PLAYLISTS`, the event-frame Episode first.
3. Append the Event to `EVENTS`, naming the Playlist.
4. Write `eventsPage.items.<slug>.title` and `.description` in `src/messages/en.json` and `de.json`; the other keys are in [Episode translation keys](episode-translation-keys.md#event-keys).
5. Run `npm run verify`; the routes, sitemap and static params follow from the records.
