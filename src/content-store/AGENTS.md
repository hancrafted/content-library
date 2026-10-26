# Content store

The one reader of records: Episode metadata, Events and Playlists, loaded, checked and served through the entry `src/content-store/store.ts`. Its schemas are in `src/content-store/schemas/`, its delivery policy (slug lists, Episode id, record routes, visibility, page catalogue) in `src/content-store/catalogue/`, and its refusals in three files: `src/content-store/refusals.ts` (parsing and the cross-record rules, which call the other two), `src/content-store/episode-refusals.ts` (one Episode) and `src/content-store/featured.ts` (the Featured slots).

- The store: FE-013-content-store; design-ADR `docs/adr/0016-content-data-model.md`.
- Imports: FE-007-module-layering §2 "Import direction"; rules `content-store-tier`, `store-entry-only`, `records-read-only-through-store`, `schemas-are-a-leaf`, `client-never-imports-content-store`.
