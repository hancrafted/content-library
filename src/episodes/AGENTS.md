# Episodes

The Episodes product area: each Episode's folder, named by its slug (`src/episodes/onboard-ai-every-time/`), an Event's copies (`src/episodes/by-event/`), the Slide pool (`src/episodes/slide-pool/`) and the Resources (`src/episodes/resources/`, one composition folder each; the records are in `src/content-store/resources/`, design-ADR `docs/adr/0019-resources-overview.md`), beside the area's code in `src/episodes/components/`, `src/episodes/lib/` and `src/episodes/hooks/`.

- Architecture map, Slide folders and reuse: FE-004-slide-architecture.
- The Episode page and its Slides: FE-002-episode-page, FE-009-slide-wrapper-and-scene.
- Imports: FE-007-module-layering §2 "Import direction" and §5 "A Slide folder imports only global shared code"; rules `areas-never-import-each-other`, `slide-folder-reaches-only-own-and-shared`, `slide-pool-reached-only-from-sections`, `episodes-reach-only-slide-parts`, `page-assembly-reaches-areas-through-tier-folders`.
- Episode records: FE-013-content-store, design-ADR `docs/adr/0016-content-data-model.md`.
