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

Settled in ticket _Slide reuse: shared pool, instances and Promotion_ (answers `decided-for-Han (test run)`). It amends _The Slide is a self-contained folder_ and _Episode content is staged then promoted_.

1. **The shared pool is one flat folder of Slide folders,** `src/components/slide-pool/<slug>/`, with the same shape as any Slide folder. A Slide lives in its Episode's `slides/` until first reuse. First reuse is one command that moves the folder into the pool (`git mv`), re-points the owning Episode's import, and adds the reference to the reusing Episode. Slug, text and anchors do not change, so no published URL moves. Pool Slides obey the same import boundary as any Slide.
2. **An Episode lists a pool Slide by reference.** An unchanged reuse is a reference: the Episode's Section list names the pool Slide; nothing is copied.
3. **An instance is a Slide folder in the Episode's own `slides/`,** copied from the pool Slide the moment a Run edits it. It gets its own globally unique slug at the copy, never the origin's, and carries a marker `copiedFrom: { slug, commit }`. A copy that no edit has touched is deleted and replaced by a reference, so no unchanged instance outlives its Run.
4. **The Promotion Gate resolves every instance,** one decision per instance, Han deciding:
   - **Update the shared Slide:** the instance's content replaces the pool Slide, the Gate lists every Episode that references the origin, and the instance folder is deleted. The Episode's entry becomes a reference to the pool Slide and **pins the retired instance slug as its anchor**, so that Episode's published anchor does not move. If the pool Slide changed since `commit`, the Gate says so and Han reconciles by hand; there is no automatic merge.
   - **Become its own Slide:** the `copiedFrom` marker is removed; slug, folder and anchors stay. The Slide is a new Slide in the Episode's folder, and reuses by the same rule 1.
     Neither outcome renames a slug, so a promotion collision cannot occur: the instance's slug was unique from birth.
5. **`slideHref` resolves per Episode, by the slug the Slide author wrote.** A Slide in the pool links to a sibling by that sibling's pool slug. The walk resolves it to this Episode's placement of that Slide or, if the Episode holds an instance copied from it, to the instance; it emits the Episode's own anchor, including a pinned one. A sibling the Episode does not hold fails the build (as before), unless the call site opts into a fallback (`slideHref(slug, { fallback: 'text' })`), which renders plain text. Adding a pool Slide to an Episode therefore fails the build until its linked siblings are there too, or the author has made the link optional.
6. **An unlisted Episode's `slides/` changes nothing:** it owns Slides, references pool Slides, makes instances and promotes exactly as a public Episode. Its Slides sit in the same global slug namespace and its anchors are snapshotted by the same published-anchors test.
7. **Global slug uniqueness refuses, at build and in the command that creates a Slide or instance:** a slug used by two Slides anywhere (Episode folders and pool together); a retired instance slug reused, since the Episode's pin keeps it reserved; an instance given its origin's slug. Title slides are exempt; their anchor stays per Episode.

Failing tests, in Han's words:

- "Reusing a Slide in a second Episode moves it into the pool and the first Episode's page looks the same."
- "Editing a reused Slide in one Episode does not change it in the others."
- "Promoting an edit as an update changes the shared Slide, lists the Episodes it affects, and no published anchor moves."
- "Promoting an edit as its own Slide keeps its slug and anchors."
- "A link between sibling Slides still works in an Episode whose siblings differ, and a missing sibling fails the build."
- "Two Slides with the same slug anywhere are refused."

## Delivery contract

_Pending: ticket *Delivery contract: Event, Playlist, routes and visibility*._

## Pipeline and evidence

_Pending: ticket *Pipeline and evidence: how /new-episode draws on and grows research*._

## Event page behaviour

_Pending: ticket *Prototype: an Event page and an unlisted one-off Episode*._

## Considered options

- **Always copy, then merge at Promotion.** Rejected in the initial grill: Promotion becomes a three-way merge, drift needs a recorded base, and an unpromoted copy becomes a permanent fork.
- **A separate Astro/Starlight evidence site.** Rejected: evidence renders on this site, one build and one link graph.
- **Slide reuse: promotion renames the instance's slug.** Rejected: it moves a published anchor. Instances get a unique slug from birth, so nothing is renamed at the Gate.
- **Slide reuse: `slideHref` typed to the pool Slide's siblings, or links declared per Episode.** Rejected: a pool Slide cannot know the Episodes that hold it; per-Episode resolution by slug keeps the Slide self-contained.

## Consequences

- `GLOSSARY.md` changes ship with each implementation ticket, never ahead of the code.
- Ids stay stable: horizon 3 progress tracking will key on them.
- Slide reuse: a retired instance slug stays reserved for as long as an Episode pins it as its anchor.
- Slide reuse: adding a pool Slide to an Episode can fail the build on its sibling links, by design.
