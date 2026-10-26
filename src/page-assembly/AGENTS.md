# Page assembly

The layer between the routes and the product areas: one folder per page template, plus `src/page-assembly/lib/` (page metadata and structured data). A template is where two areas meet: it builds one area's parts and passes them to another as props.

- Imports: FE-007-module-layering §1 "Thin routes" and §2 "Import direction"; rules `page-assembly-reached-only-from-app`, `template-reaches-only-own-folder-and-lib`, `page-assembly-reaches-areas-through-tier-folders`, `page-composes-a-template`.
- Page metadata: FE-008-page-metadata.
- Static export: FE-005-static-export-contract.
