---
type: feature-guide
title: Workshops
stale_after: 2027-04-22T00:00:00Z
---

# Workshops

Read before adding or changing a Workshop, or the `/workshops` pages. A Workshop is a dated, ordered set of Episodes, run as one event: attendees follow the Episodes in the planned order. It is not a playlist and has no status; whether it is upcoming or past is not shown.

## The record

Every Workshop is one entry in `WORKSHOPS` in `src/lib/workshops.pure.ts`:

- `slug`: a readable name followed by the date, `ai-onboarding-2026-10-23`, so a shared link says what and when. It must end in `-<date>`.
- `date`: the day, `YYYY-MM-DD`.
- `time` and `location`, both optional: written as the venue writes them, the same in every locale.
- `episodes`: Episode slugs in teaching order. An Upcoming Episode may be listed; its card is muted and unlinked, and the Start button goes to the first Episode that has a page.

The record holds no text. `workshopProblems` checks it in the fast suite: a slug ends in its date, a slug is unique, a Workshop lists at least one Episode, every slug is a registered Episode, and none is listed twice.

## Routes

- `/workshops` and `/de/workshops`: the list, one card per Workshop (name, date, Episode count).
- `/workshops/<slug>` and `/de/workshops/<slug>`: the Workshop's page: date, time, location, Episode count, total reading time, description, the Start button, then the Episodes as a numbered list of compact Episode cards. The path set is closed at build time from `WORKSHOPS` (FE-005).

Both are in the sitemap with canonical and hreflang, and the header has one Workshops entry.

## Add a Workshop

1. Append a record to `WORKSHOPS` with the slug, date and Episode slugs.
2. Write `workshopsPage.items.<slug>.title` and `.description` in `src/messages/en.json` and `de.json`.
3. Run `npm run verify`; the route files, sitemap and static params follow from the record. The other keys a Workshop page reads are in [Episode translation keys](episode-translation-keys.md#workshop-keys).
