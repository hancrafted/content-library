# Shared

What every layer uses and knows nothing of the domain: UI primitives and core components (`src/shared/components/`), the design system, i18n, domain-free hooks and lib, and page chrome (`src/shared/page-chrome/`: header, footer bar, toggles, table of contents, Context drawer).

- Imports: FE-007-module-layering §2 "Import direction" and §3 "Lib imports no React"; rules `shared-knows-no-domain`, `page-chrome-reached-only-from-page-assembly-or-container`, `core-components-are-a-leaf`, `lib-imports-no-react`.
- Design tokens: FE-011-design-tokens. Client leaves and hooks: FE-006-server-client-boundary.
- The Context drawer: FE-010-context-drawer.
