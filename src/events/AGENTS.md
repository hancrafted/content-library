# Events

The Events product area: Event cards, the Playlist list and the Event-scoped Episode framing, in `src/events/components/` and `src/events/lib/`. The records live in the content store.

- Imports: FE-007-module-layering §2 "Import direction"; rules `areas-never-import-each-other`, `page-assembly-reaches-areas-through-tier-folders`, `lib-imports-no-upper-tier`.
- Events, Playlists and their pages: design-ADR `docs/adr/0016-content-data-model.md`; feature guide `docs/features/events.md`.
- The records: FE-013-content-store.
