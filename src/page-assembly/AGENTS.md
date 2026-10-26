# Page assembly

The layer between the routes and the product areas: one folder per page template, plus `src/page-assembly/lib/` (page metadata and structured data).

- Imports: FE-007-module-layering §1 "Thin routes" and §2 "Import direction"; rules `page-assembly-reached-only-from-app`, `template-reaches-only-own-folder-and-lib`, `page-assembly-reaches-areas-through-tier-folders`, `page-composes-a-template`.
- Page metadata: FE-008-page-metadata.
- Text: each template folder holds its own Translation files; `src/page-assembly/translations.ts` merges every owner's pair into one message set, `src/page-assembly/i18n-request.ts` serves it to next-intl: FE-003-localization §4.
- Static export: FE-005-static-export-contract.
