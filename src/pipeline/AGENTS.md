# Pipeline

The pipeline product area: the content pipeline, its Run log (`events.jsonl`) and the dashboard, in `src/pipeline/components/`, `src/pipeline/lib/` and `src/pipeline/hooks/`. The new-episode and episode-promote skills run `src/pipeline/lib/` under plain node.

- Imports: FE-007-module-layering §2 "Import direction" and §3 "Lib imports no React"; rules `areas-never-import-each-other`, `page-assembly-reaches-areas-through-tier-folders`, `skills-and-tools-reach-src-through-area-lib-or-store-entry`, `lib-imports-no-react`, `hooks-reached-only-from-client`.
- The Run log: design-ADRs `docs/adr/0007-pipeline-runs-are-logged-as-spans-in-append-only-jsonl.md` and `docs/adr/0010-run-log-lines-are-a-typed-union-with-point-events.md`.
- The dashboard: feature guide `docs/features/pipeline-dashboard.md`.
