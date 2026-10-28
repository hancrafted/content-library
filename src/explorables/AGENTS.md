# Explorables

The Explorables product area: one self-contained folder per Explorable (`src/explorables/ai-disciplines/`, `src/explorables/context-window/`, `src/explorables/human-in-the-loop/`), each with its Presets.

- What an Explorable may own: FE-012-explorables.
- Imports: FE-007-module-layering §2 "Import direction" and §5 "A Slide folder imports only global shared code"; rules `areas-never-import-each-other`, `explorable-reaches-shared-ui-and-lib`, `explorable-client-reaches-only-own-folder-core-ui-hooks-and-lib`, `page-assembly-reaches-areas-through-tier-folders`.
- Client leaves: FE-006-server-client-boundary.
