# Explorable explanations

The Explorable explanations product area: one self-contained folder per explanation (`src/explorable-explanations/context/`, `src/explorable-explanations/human-in-the-loop/`), each with its Presets.

- What an explanation may own: FE-012-explorable-explanation-content.
- Imports: FE-007-module-layering §2 "Import direction" and §5 "A Slide folder imports only global shared code"; rules `areas-never-import-each-other`, `explorable-explanation-reaches-shared-ui-and-lib`, `explorable-explanation-client-reaches-only-own-folder-core-hooks-and-lib`, `page-assembly-reaches-areas-through-tier-folders`.
- Client leaves: FE-006-server-client-boundary.
