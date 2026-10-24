---
type: design-adr
status: proposed
---

# Content data model

The library holds three kinds of content that today's records blur: the proof behind a claim, the Slides that teach it, and the arrangements that present Slides to an audience. Six closed Tags stand in for subjects, a Workshop stands in for every arrangement, and a Speaker note cites a bare URL. This record settles the records, their relationships and their contracts across three layers, so that later implementation tickets only make tests pass.

It amends _The Slide is a self-contained folder_, _Episode content is staged then promoted_, _Tags replace Topics_ and the Archgate ADR _FE-012 Shared Visual Content_. The product vision (`docs/steering/product-vision.md`) ranks every trade-off here.

## Layers

- **Evidence:** Concept → Research question → Source. The proof, rendered publicly on this site.
- **Teaching:** Episode → Slide → Speaker note item, Explorable explanation. The Episode is the product unit; the Slide is the technical unit.
- **Delivery:** Event → Playlist → Episode. Arranging and presenting, never owning Slides.

## Decisions from the initial grill

The initial grill (map _Content data model and product vision_, ticket _Content data model: initial grill_) settled these; the sections below refine them per seam.

1. **Records.** Evidence records (Concept, Research question) are markdown with frontmatter; teaching and delivery records are TypeScript. Zod schemas exist for every record kind, with `.describe()` on fields. markdown-harness governs authoring; Zod governs the store and rendering.
2. **Concepts replace Tags,** not one to one. Only top Concepts (`broader: []`, SKOS: no parent) carry a theme. Episode metadata names `applyThemeFromConcept`, which sets the card's icon and accent and replaces the lead-Tag look.
3. **Evidence renders on this site** at `/concepts/<id>` and `/research/<id>`, built with unified (remark → rehype), English only; German pages link the English page, marked as English.
4. **Slide reuse is reference by default, copy on write.** A Slide lives in its Episode's folder until first reuse, then moves to the shared pool. An edited reuse is an instance marked with what it was copied from; Promotion resolves it at a Gate. Slide slugs are globally unique from birth, Title slides excepted, and are never renamed.
5. **A Definition Slide** is a page Slide that carries `defines: <concept-id>`.
6. **Shared visual is renamed Explorable explanation** everywhere, in its own folder apart from plain shared parts.
7. **Event + Playlist replace Workshop.** An Event presents one Playlist; a Playlist orders Episodes, event-frame Episode first.
8. **`unlisted` is only a visibility flag.** Every Episode has the same abilities; duplicating an Episode references the original's Slides, never copies them.

## Evidence vocabulary

_Pending: ticket *Evidence vocabulary: top Concepts and the Concept record*._

## Citations

_Pending: ticket *Citations: how does a claim cite a Research question?*._

## Slide reuse

_Pending: ticket *Slide reuse: shared pool, instances and Promotion*._

## Delivery contract

Settled in ticket _Delivery contract: Event, Playlist, routes and visibility_ (each point `decided-for-Han (test run)`, contestable). It amends _Tags replace Topics_ decision 5 and refines the Event + Playlist decision above.

### Records

1. **An Event** is a dated occasion: slug (`<date>-<name>`, e.g. `2026-10-23-axel-agentic-workflow`), date, kind (`workshop` | `webinar` | ...), optional time and location, the Audience it targets, and the id of the one Playlist it presents. It owns no Slides, holds no text (title and description are Translation keys by slug, FE-003) and has no `visibility` and no status of its own.
2. **A Playlist** is an ordered list of Episode ids with a `type` and a `visibility`, and nothing else: no overrides, no entry record, no video.
   - `type: event`: made for exactly one Event; its first entry is that Event's event-frame Episode (a test refuses otherwise). `type: standard`: a curated list with no Event.
   - `visibility: public | unlisted`: whether the Playlist's own surfaces are listed and indexed. An Event page takes its visibility from its Playlist. `attendees` is refused by the schema until horizon 3 gives it an enforcer (a static site cannot hide anything).
3. **An Episode** gains `type: standard | event-frame` and `visibility: public | unlisted`.
   - `event-frame` holds agenda, scope and organisational information for one Event, has no video, and is always `unlisted` (a test refuses a public one). It is never a card in the Episode overview and never an Upcoming Episode.
   - `status: upcoming` (video not out) applies to public Episodes only; an unlisted Episode is published when its page exists. Upcoming and unlisted stay two separate axes.
4. A public Playlist lists only public Episodes (a test refuses otherwise); an `event` Playlist may list unlisted Episodes whatever its own visibility. Episode slugs are unique across all Episodes, so a route never needs the Playlist to disambiguate.

### Routes

| URL (`/de` prefix for German)                   | What it is                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `/events/`                                      | Index of Events whose Playlist is public. Replaces `/workshops/`.              |
| `/events/<event-slug>/`                         | The Event page: facts, Playlist as a numbered list, event-frame Episode first. |
| `/events/<event-slug>/episodes/<episode-slug>/` | One Episode of that Event's Playlist, with its position in the Playlist.       |
| `/episodes/<episode-slug>/`                     | A public Episode, unchanged. An unlisted Episode has no such URL.              |

- One `events` route serves every Event kind; the kind is data, so a workshop that becomes a webinar keeps its URL.
- Static params are closed at build time (FE-005): one `{ event }` per Event, one `{ event, episode }` per Playlist entry, `dynamicParams = false`. An unlisted Episode in no Event's Playlist is an orphan and a test refuses it.
- There is no Playlist route yet. The first public `standard` Playlist brings `/playlists/<playlist-slug>/` in its own ticket (horizon 2).
- The three catalogue pages that sit in `EPISODE_SLUGS` today as "unlisted" (`slide-layouts`, `slide-master`, `slides`) are tooling pages, not Episodes in this model. They keep their URLs and become `noindex` and sitemap-free; today `isNoindex` does not cover them and they are indexed.

### Redirects

- One 301 per locale from each old Workshop URL to its Event: `/workshops/axel-agentic-workflow-2026-10-23/` to `/events/2026-10-23-axel-agentic-workflow/`, the `/de/` pair, and `/workshops/` to `/events/` with its `/de/` pair. They go in `public/_redirects` in the same change as the rename (`docs/features/hosting.md`); `next.config.ts` cannot hold them (FE-005 §2). Four lines now, far under the 2,000 static limit.
- A build test reads `_redirects` and fails when a legacy Workshop slug has no line. Redirects themselves need Pages, so no browser test can follow them.
- The temporary github.io redirect stubs derive from `out/` and will not gain stubs for the old `/workshops/` URLs; accepted, since that deploy is being switched off.

### Visibility, indexing and canonical

One predicate decides each page's treatment and both `pageMetadata` and the sitemap ask it (FE-008 §5), so they cannot disagree:

| Page                                                                   | In sitemap | Robots    | Canonical                   |
| ---------------------------------------------------------------------- | ---------- | --------- | --------------------------- |
| Public, published Episode at `/episodes/<slug>/`                       | yes        | index     | itself, with hreflang       |
| Event page, Playlist public                                            | yes        | index     | itself, with hreflang       |
| Event page, Playlist unlisted                                          | no         | `noindex` | itself                      |
| Unlisted Episode under an Event, no public original                    | no         | `noindex` | itself                      |
| Unlisted Episode that declares `canonicalEpisode: <public episode id>` | no         | index     | that public Episode's URL   |
| A public Episode viewed at an Event-scoped URL                         | no         | index     | its `/episodes/<slug>/` URL |
| Upcoming Episode (public only)                                         | no         | `noindex` | itself                      |

- `noindex` is a meta tag, never an `X-Robots-Tag` entry in `public/_headers` (a second source of truth, and per-path lists drift). `robots.txt` stays `allow: /`, since a crawler must fetch a page to see its `noindex`.
- A page with a canonical elsewhere carries no `noindex` (the two signals contradict) and no hreflang of its own; the sitemap lists only self-canonical, indexable pages.
- `canonicalEpisode` must name a public Episode (a test refuses otherwise). It is the only way an unlisted Episode points at another; duplicating an Episode references the original's Slides, never copies them, and sets this field by hand.
- **Unlisted is not private.** The URL is public to anyone holding it; nothing confidential belongs in an unlisted Episode. Access control waits for horizon 3.
- The Episode overview and Upcoming Episodes list public, `type: standard` Episodes only. The `/events/` index and the header's Events entry (which replaces Workshops) list public Events only.

### Past Event

- **Past** means the Event's date is before the build date. It is derived, never stored, because an Event has no status. A static page is only as fresh as its last deploy, so a past Event may lack its notice until the next push; accepted.
- References are live and never pinned, so a past Event shows what the Episodes say today. The notice exists, as one fixed line saying the content may differ from the recording.
- It appears on the Event page, above the Playlist, and on every Event-scoped Episode page, above the title: those are the URLs someone holding a recording opens. It does not appear on `/episodes/<slug>/`, which belongs to no Event. An upcoming Event shows none.
- Its wording, look and exact position are left to ticket _Prototype: an Event page and an unlisted one-off Episode_.

### Failing tests (in Han's words)

- "An unlisted Episode never shows in the sitemap, the Episode overview or an Upcoming list."
- "An unlisted Episode page tells search engines not to index it."
- "An Episode I derived from a public one points its canonical at the public page."
- "I open the old workshop link and land on the Event page" (build test over `_redirects`, plus the `/de` pair).
- "An Event's page lists its Episodes in the Playlist's order, event-frame first."
- "A past Event says its content may differ from the recording; an upcoming Event does not."
- Fast suite: the schema refuses a public event-frame Episode, a public Playlist with an unlisted Episode, `visibility: attendees`, a canonical naming a non-public Episode, an orphan unlisted Episode, an Event whose Playlist is missing or not `type: event`.

## Pipeline and evidence

_Pending: ticket *Pipeline and evidence: how /new-episode draws on and grows research*._

## Event page behaviour

_Pending: ticket *Prototype: an Event page and an unlisted one-off Episode*._

## Considered options

- **Always copy, then merge at Promotion.** Rejected in the initial grill: Promotion becomes a three-way merge, drift needs a recorded base, and an unpromoted copy becomes a permanent fork.
- **A separate Astro/Starlight evidence site.** Rejected: evidence renders on this site, one build and one link graph.

- Delivery contract: **Visibility on the Event.** Rejected: a second flag to keep in step with its Playlist; access lives in one `visibility`, as the handoff already ruled.
- Delivery contract: **`noindex` plus canonical to the public original.** Rejected: search engines read the pair as contradictory; the canonical alone consolidates the signal.
- Delivery contract: **Unlisted Episodes also served at `/episodes/<slug>/`.** Rejected: two URLs for one page, and the bare Episode route would then need to know which Events present it.
- Delivery contract: **A stored Event status (upcoming or past).** Rejected: it goes stale by hand; the date derives it.

## Consequences

- `GLOSSARY.md` changes ship with each implementation ticket, never ahead of the code.
- Ids stay stable: horizon 3 progress tracking will key on them.
- Delivery contract: the Workshop record, its `/workshops` routes, `workshopsPage` Translation keys and `docs/features/workshops.md` give way to Event and Playlist records, the `/events` routes and `docs/features/events.md`; `PageRef` gains Event and Event-scoped Episode forms; `isNoindex` takes visibility.
- Delivery contract: unlisted pages are findable by anyone with the link, and a past-Event notice can lag a deploy.
