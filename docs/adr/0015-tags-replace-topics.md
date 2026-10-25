---
type: design-adr
status: accepted
---

# Tags replace Topics

> Amended by _Content data model_ (docs/adr/0016-content-data-model.md): Tags become Concepts.

The Episode overview grouped Episodes by Topic, a curated playlist with an icon and an accent, and also by Tag, a flat keyword. A card then drew three sources that disagreed: an Episode's own look picked the icon and colour, its Topic picked the label, and its Tags said something else again. Topic also carried the idea of a YouTube playlist the channel never used, and "AI enablement" matched nearly every Episode, so it grouped nothing.

Topic is dropped. Tags are the only organising idea.

## Decisions

1. **One vocabulary.** Six Tags, closed and held in one central record: `context-engineering`, `agentic-ai`, `markdown`, `cost`, `sales`, `workflow`. Each has an icon, an accent, and a translated name and tooltip. The long-tail Tags and their Translation keys are deleted; a test rejects any Episode Tag outside the record and any Episode without one.
2. **The lead Tag owns the look.** An Episode's first Tag is its lead Tag and fixes its card's icon and accent. `topic`, `extraTopics`, the highlighted-Topic label and the per-Episode `look` are removed, so colour, icon and label can no longer disagree.
3. **Filters.** Five of the six Tags are offered as filter chips; search matches every Tag name. A Topic filter no longer exists.
4. **Format stays as data.** Every Episode is a Foundations Episode, so the Format control and label stay hidden until two Formats are in use.
5. **Workshop is the one aggregation.** An ordered set of Episodes for an event is a Workshop, not a playlist; no Playlist concept exists.

   > Amended by _Content data model_ (docs/adr/0016-content-data-model.md): Event and Playlist replace Workshop.

## Considered options

- **Keep Topic as a coarse grouping beside Tags.** Rejected: with six Episodes it is one more label to maintain, and its one broad value, AI enablement, hid the real subject.
- **Keep the per-Episode look as an override.** Rejected: an override is how icon, colour and label came to disagree. A new look is a new Tag.
- **Open Tag vocabulary.** Rejected: free keywords produced a long tail of one-Episode Tags that no filter could use.

## Consequences

- A new Tag is one edit in the central record plus its two Translation keys.
- An Episode's card look follows from the order of its Tags; reordering Tags recolours the card.
- The shared Episode card replaces the old cards: its lead Tag fixes the icon and accent colour that the Topic label used to name, and the filters work on Tags.
