# tools

Code that runs on the repo rather than in the product, one subfolder per purpose: `verify/` the gate, `codegen/` the Episode and Event registry generator, `deploy/` the redirect stubs, `demo/` the dashboard demo export. Each tool's `npm run` name is in `package.json`; its tests sit beside it.

- Imports: FE-007-module-layering, section "Import direction" (`.archgate/adrs/FE-007-module-layering.md`).
- The registries `codegen/` writes: FE-013-content-store (`.archgate/adrs/FE-013-content-store.md`).
- Tests: ARCH-003-testing (`.archgate/adrs/ARCH-003-testing.md`).
