---
type: design-adr
status: accepted
---

# Events overview

`/events` was a grid of cards in record order, each showing a date, a title and an Episode count. With Events becoming Han's main client exposure (horizon 1), a visitor needs to see what is coming next, find an Event by subject, and see where it takes place. Nothing on the card said what an Event was about, and nothing on the record said whether it was remote.

Settled with Han in a grilling session on 2026-10-27. The model changes it needs are amendments to _Content data model_ and _Tags replace Topics_.

## Decisions

1. **Two sections, by the build day.** Upcoming holds every Event from the build day on, oldest first. Past holds every earlier one, newest first. The line is `isPastEvent`, the same one the Event page uses for its past notice, so the list and the page never disagree. An Event earlier in the current month is past.
2. **Grouped by month.** Each section groups its Events by calendar month, with headings in the reader's locale through `Intl` ("October 2026", "Oktober 2026"). A month the filter empties is hidden. An empty section shows one line, which says whether the calendar holds no Event there or the filter hides them all.
3. **Cards by default, a list on request.** A card grid opens the page. A switch turns it into a calendar list: a day block (day of the month over its weekday) beside each card. The choice is transient (FE-001-state-management §1): every visit opens in the grid.
4. **Events carry Tags, stored on the record.** A tuple from the closed vocabulary with the lead Tag first, as an Episode's. They are not worked out from the Playlist: a union of the Episodes' Tags would make the lead Tag, and the card's colour, an accident of Playlist order.
5. **A search and Tag chips, as on the Episode overview.** The search matches title, description and Tag names, case-insensitively. A chip is offered for each Tag at least one listed Event carries, with its count. Both narrow both sections. The state is in memory only, with no query parameters (FE-001-state-management §1.2).
6. **The card is laid out as an Episode card is.** The lead Tag's icon and accent come first, then the title as the card's one link, the description, the Tags, where the Event takes place, and the day and time at the bottom. The Episode count and the kind move off the card; the Event page keeps both.
7. **Where an Event takes place is a format.** `onsite`, `remote` or `hybrid`, always given. A venue, written as the venue writes it, is required onsite and hybrid and refused remote. A platform from a closed list (`zoom`, `teams`, `google-meet`) is required remote and hybrid and refused onsite. The card writes "Remote · Zoom" ("Online · Zoom" in German), the venue, or both.
8. **One set of shadcn controls.** The search field and the Tag chips are shared components on shadcn's input and toggle group, used by the Episode and Event overviews alike. `CardShell` is built on shadcn's card, and its accent is a colour token, so it knows no Tag.

## Considered options

- **The current month wholly under Upcoming.** Rejected: the AXEL seminar would sit under Upcoming while its own page called it past.
- **Tags worked out from the Playlist, or stored when given and worked out otherwise.** Rejected for the drift above, and a hybrid has two sources of the look.
- **A free-text location with `remote` as a reserved word.** Rejected: invisible to `tsc`, and a typo renders as written.
- **The view choice as a preference.** Deferred by Han: it can become a field of the one prefs key later.
- **A shared, generic filterable-browser component.** Rejected: Episodes and Events filter differently and will grow apart; they share the controls, not the state.

## Consequences

- A new Event file states its Tags and its format; a remote Event also states its platform. The store refuses anything else in one sentence.
- A new platform is one entry in `PLATFORMS` plus its name in the Events area's words.
- The Event page's facts line shows the same place line the card shows.
- UX taste here is held by review only, the product vision's known gap: the layout, the day block and the card order have no automated check.
